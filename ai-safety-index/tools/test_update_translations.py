"""Behavior tests for the signal translation step (no network)."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

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


if __name__ == '__main__':
    unittest.main()
