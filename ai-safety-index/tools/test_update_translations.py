"""Behavior tests for the signal translation step (no network)."""
import importlib.util
from contextlib import redirect_stderr
from copy import deepcopy
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import MagicMock, patch

MODULE = Path(__file__).with_name('translate-signals.py')
spec = importlib.util.spec_from_file_location('translate_signals', MODULE)
tr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tr)

ROWS = [
    {'id': 'a', 'title': 'Agents broke into a registry', 'description': 'Hundreds of packages…'},
    {'id': 'b', 'title': '已经是中文的标题', 'description': ''},
    {'id': 'c', 'title': 'Another record', 'description': ''},
]


class UpdateTest(unittest.TestCase):
    def test_without_a_key_nothing_is_translated_and_old_entries_are_dropped(self):
        out, left = tr.update(ROWS, {'a': ['甲', '乙'], 'gone': ['旧', '']}, None)
        self.assertEqual(out, {'a': ['甲', '乙']})
        self.assertEqual(left, 1)

    def test_only_untranslated_foreign_records_are_sent(self):
        sent = []
        def fake(rows):
            sent.extend(r['id'] for r in rows)
            return {r['id']: ['译：' + r['title'], ''] for r in rows}
        out, left = tr.update(ROWS, {'a': ['甲', '乙']}, fake)
        self.assertEqual(sent, ['c'])
        self.assertEqual(out['c'], ['译：Another record', ''])
        self.assertEqual(left, 0)

    def test_a_failed_or_malformed_batch_keeps_going(self):
        def broken(rows):
            raise OSError('down')
        out, left = tr.update(ROWS, {}, broken)
        self.assertEqual(out, {})
        self.assertEqual(left, 2)
        out, _ = tr.update(ROWS, {}, lambda rows: {'a': 'not a pair', 'c': ['', 'x']})
        self.assertEqual(out, {})

    def test_paper_picks_are_translated_under_their_own_ids(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'research-source').mkdir()
            (root / 'research-source/paper-picks-provenance.json').write_text(json.dumps(
                {'papers': [{'arxiv_id': '2611.00001', 'title': 'Jailbreaks', 'abstract': 'We study jailbreaks.'}]}), encoding='utf-8')
            self.assertEqual(tr.paper_rows(root), [{'id': 'arxiv-2611.00001', 'title': 'Jailbreaks', 'description': 'We study jailbreaks.'}])
            self.assertEqual(tr.paper_rows(root / 'missing'), [])

    def test_long_rows_are_split_into_smaller_batches(self):
        rows = [{'id': str(i), 'title': 't', 'description': 'x' * 1900} for i in range(8)]
        self.assertEqual([len(b) for b in tr.batches(rows)], [3, 3, 2])
        self.assertEqual([len(b) for b in tr.batches([{'id': str(i), 'title': 't'} for i in range(20)])], [15, 5])

    def test_written_script_is_valid_and_escaped(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            tr.write(root, {'a': ['<b>标题</b>', '']})
            js = (root / 'signals-zh.js').read_text(encoding='utf-8')
            self.assertIn('const siteSignalsZh = ', js)
            self.assertNotIn('<b>', js)
            self.assertEqual(json.loads((root / 'research-source/signals-zh.json').read_text(encoding='utf-8')), {'a': ['<b>标题</b>', '']})

    def test_grouped_numbers_are_accepted_without_changing_the_sources(self):
        rows = [{'id': 'a', 'title': '1,122 models', 'description': 'Of 1,122, 8% may fail.'}]
        stored = {'old': ['已有 1300 个模型', '已有翻译保持原样']}
        rows.append({'id': 'old', 'title': '1379 models', 'description': 'Existing translation'})
        originals = deepcopy((rows, stored))
        out, left = tr.update(rows, stored, lambda batch: {'a': ['1122 个模型', '在 1122 个模型中，8% 可能失败。']})
        self.assertEqual(out['a'], ['1122 个模型', '在 1122 个模型中，8% 可能失败。'])
        self.assertEqual(out['old'], stored['old'])
        self.assertEqual(left, 0)
        self.assertEqual((rows, stored), originals)

    def test_changed_added_deleted_and_moved_numbers_are_rejected(self):
        cases = [
            ('1379 models', 'Models were evaluated.', ['1300 个模型', '评估了这些模型。']),
            ('Models', 'Models were evaluated.', ['10 个模型', '评估了这些模型。']),
            ('Models', 'Models were evaluated.', ['模型', '10% 的模型通过了评估。']),
            ('8% failed', '', ['8 个失败', '']),
            ('8 failed', '', ['8% 失败', '']),
            ('1379 models', '', ['模型', '']),
            ('12 models', '12 tasks', ['12 个模型', '任务']),
            ('Models', '12 tasks', ['12 个模型', '任务']),
            ('Version 1.2.3', '', ['版本 1.2.4', '']),
            ('0.10 threshold', '', ['阈值为 0.1', '']),
            ('-5 points', '', ['5 分', '']),
            ('2026-11-10 release', '', ['2026-10-11 发布', '']),
            ('12,34 models', '', ['1234 个模型', '']),
        ]
        for title, description, pair in cases:
            with self.subTest(title=title, pair=pair):
                row = {'id': 'a', 'title': title, 'description': description}
                output = io.StringIO()
                with redirect_stderr(output):
                    out, left = tr.update([row], {}, lambda batch: {'a': pair})
                self.assertEqual(out, {})
                self.assertEqual(left, 1)
                self.assertIn('numbers=1', output.getvalue())
                self.assertNotIn(title, output.getvalue())

    def test_number_tokens_keep_multiplicity_precision_and_version_forms(self):
        self.assertEqual(tr.number_tokens('1,122, then 1,122.00; v2.1.0 and 8 %'),
                         tr.number_tokens('1122，然后 1122.00；v2.1.0 和 8%'))
        self.assertNotEqual(tr.number_tokens('2 and 2'), tr.number_tokens('2'))
        self.assertNotEqual(tr.number_tokens('1,122,33'), tr.number_tokens('112233'))

    def test_empty_or_invalid_fields_do_not_get_saved(self):
        for pair, reason in [
            (None, 'invalid-shape'), ({'title': '标题'}, 'invalid-shape'),
            (['标题'], 'invalid-shape'), (['标题', 3], 'invalid-shape'),
            ([' ', ''], 'empty-title'), (['标题', '新加的简介'], 'invented-summary'),
        ]:
            with self.subTest(pair=pair):
                self.assertEqual(tr.rejection_reason({'title': 'Title', 'description': ''}, pair), reason)
        self.assertEqual(tr.rejection_reason({'title': 'Title', 'description': 'A source summary'}, ['标题', '']), 'empty-summary')

    def test_new_boilerplate_is_rejected_even_when_it_is_put_in_quotes(self):
        row = {'title': 'Registry attack', 'description': 'The study reports an attack.'}
        for phrase in ['希望这对你有所帮助', '以下是中文翻译', '让我们深入探讨', '开启了安全研究的新篇章']:
            with self.subTest(phrase=phrase):
                self.assertEqual(tr.rejection_reason(row, ['注册表攻击', '研究报告了一次攻击。' + phrase]), 'boilerplate')
        self.assertEqual(tr.rejection_reason(row, ['注册表攻击', '研究报告了一次攻击。“希望这对你有所帮助”。']), 'boilerplate')

    def test_attributed_source_quotations_are_not_deleted_as_boilerplate(self):
        row = {'title': 'Study of a phrase', 'description': 'The paper quotes an answer: “I hope this helps.”'}
        self.assertIsNone(tr.rejection_reason(row, ['对一句话的研究', '论文引用了一条回答：“希望这对你有所帮助。”']))

    def test_non_object_batches_and_outages_do_not_stop_later_batches(self):
        rows = [{'id': str(i), 'title': 'Title', 'description': ''} for i in range(16)]
        for first in [None, [], ['not an object'], OSError('source text must not be logged')]:
            responses = [first, {'15': ['标题', '']}]
            def translate(batch):
                result = responses.pop(0)
                if isinstance(result, Exception):
                    raise result
                return result
            with self.subTest(first=type(first).__name__), redirect_stderr(io.StringIO()) as output:
                out, left = tr.update(rows, {}, translate)
                self.assertEqual(out, {'15': ['标题', '']})
                self.assertEqual(left, 15)
                self.assertNotIn('source text', output.getvalue())

    def test_quality_report_contains_counts_not_source_text(self):
        rows = [{'id': 'private-id', 'title': 'Confidential 1379 finding', 'description': ''},
                {'id': 'another-id', 'title': 'Other finding', 'description': ''}]
        with redirect_stderr(io.StringIO()) as output:
            out, left = tr.update(rows, {}, lambda batch: {'private-id': ['1300 个结果', ''], 'another-id': ['', '']})
        self.assertEqual((out, left), ({}, 2))
        self.assertIn('2 rejected (empty-title=1, numbers=1)', output.getvalue())
        self.assertNotIn('Confidential', output.getvalue())
        self.assertNotIn('private-id', output.getvalue())


class ApiTranslatorTest(unittest.TestCase):
    @staticmethod
    def response(value):
        response = MagicMock()
        response.__enter__.return_value.read.return_value = json.dumps(
            {'content': [{'type': 'text', 'text': json.dumps(value, ensure_ascii=False)}]}).encode()
        return response

    def test_two_passes_send_the_unchanged_source_and_draft_to_the_editor(self):
        rows = [{'id': 'a', 'title': '1,122 models may not be safe', 'description': ''}]
        original = deepcopy(rows)
        draft = {'a': ['1122 个模型可能不安全', '']}
        edited = {'a': ['1122 个模型可能并不安全', '']}
        with patch.object(tr.urllib.request, 'urlopen', side_effect=[self.response(draft), self.response(edited)]) as request:
            out, left = tr.update(rows, {}, tr.api_translator('test-key'))
        self.assertEqual((out, left), (edited, 0))
        self.assertEqual(rows, original)
        self.assertEqual(request.call_count, 2)
        prompts = [json.loads(call.args[0].data)['messages'][0]['content'] for call in request.call_args_list]
        self.assertTrue(prompts[0].startswith('Pass 1:'))
        self.assertTrue(prompts[1].startswith('Pass 2:'))
        second = json.loads(prompts[1][len(tr.EDIT_PROMPT):])
        self.assertEqual(second, {'source': {'a': [rows[0]['title'], '']}, 'draft': draft})
        # Uncertainty and causation remain review instructions, not claims that
        # the lexical gate can establish semantic equivalence.
        self.assertIn('uncertainty', tr.EDIT_PROMPT)
        self.assertIn('association must not become a cause', tr.EDIT_PROMPT)

    def test_a_second_pass_failure_keeps_original_not_the_unreviewed_draft(self):
        with patch.object(tr.urllib.request, 'urlopen', side_effect=[self.response({'c': ['草稿', '']}), OSError('outage')]), redirect_stderr(io.StringIO()):
            out, left = tr.update([ROWS[2]], {}, tr.api_translator('test-key'))
        self.assertEqual((out, left), ({}, 1))

    def test_a_bad_final_edit_is_rejected_even_if_the_draft_was_faithful(self):
        rows = [{'id': 'a', 'title': '1379 models', 'description': ''}]
        with patch.object(tr.urllib.request, 'urlopen', side_effect=[self.response({'a': ['1379 个模型', '']}), self.response({'a': ['1300 个模型', '']})]), redirect_stderr(io.StringIO()):
            out, left = tr.update(rows, {}, tr.api_translator('test-key'))
        self.assertEqual((out, left), ({}, 1))

    def test_an_empty_first_pass_does_not_issue_an_edit_request(self):
        with patch.object(tr.urllib.request, 'urlopen', return_value=self.response({})) as request, redirect_stderr(io.StringIO()):
            out, left = tr.update([ROWS[2]], {}, tr.api_translator('test-key'))
        self.assertEqual((out, left), ({}, 1))
        self.assertEqual(request.call_count, 1)

    def test_nested_response_objects_are_not_mistaken_for_a_valid_batch(self):
        for response in [[{'c': ['标题', '']}], {'unexpected': 'value'}]:
            with self.subTest(response=response), patch.object(tr.urllib.request, 'urlopen', return_value=self.response(response)), redirect_stderr(io.StringIO()):
                out, left = tr.update([ROWS[2]], {}, tr.api_translator('test-key'))
            self.assertEqual((out, left), ({}, 1))


if __name__ == '__main__':
    unittest.main()
