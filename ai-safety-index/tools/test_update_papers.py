"""Behavior tests for the arXiv paper picker (no network)."""
import importlib.util
from datetime import date
from pathlib import Path
import tempfile
import unittest

MODULE = Path(__file__).with_name('update-papers.py')
spec = importlib.util.spec_from_file_location('update_papers', MODULE)
papers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(papers)

TODAY = date(2026, 10, 29)


def entry(arxiv_id, title, abstract='', published='2026-10-27T17:00:00Z', authors=('A. One', 'B. Two', 'C. Three', 'D. Four')):
    names = ''.join(f'<author><name>{n}</name></author>' for n in authors)
    return (f'<entry><id>http://arxiv.org/abs/{arxiv_id}v1</id><published>{published}</published><title>{title}</title>'
            f'<summary>{abstract}</summary>{names}<arxiv:primary_category term="cs.CL"/></entry>')


def feed(*entries):
    return ('<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:arxiv="http://arxiv.org/schemas/atom">'
            + ''.join(entries) + '</feed>').encode()


class PickTest(unittest.TestCase):
    def test_title_terms_rank_above_abstract_terms(self):
        rows = papers.parse(feed(entry('2610.00001', 'A study of databases', 'We discuss safety briefly.'),
                                 entry('2610.00002', 'Jailbreak attacks on LLM agents', 'Prompt injection through tools.')), TODAY)
        self.assertEqual(rows[0]['arxiv_id'], '2610.00002')
        self.assertIn('agent-software', rows[0]['direction_ids'])
        self.assertEqual(rows[0]['authors'], ['A. One', 'B. Two', 'C. Three'])
        self.assertTrue(rows[0]['more_authors'])

    def test_only_the_last_week_and_top_picks_are_kept(self):
        many = [entry(f'2610.{i:05d}', f'Safety alignment study {i}') for i in range(12)]
        old = entry('2610.99999', 'Jailbreak red teaming backdoor', published='2026-10-10T00:00:00Z')
        rows = papers.parse(feed(*many, old), TODAY)
        self.assertEqual(len(rows), papers.PICKS)
        self.assertNotIn('2610.99999', {r['arxiv_id'] for r in rows})

    def test_duplicates_and_malformed_entries_are_dropped(self):
        rows = papers.parse(feed(entry('2610.00003', 'Unlearning safety'), entry('2610.00003', 'Unlearning safety'),
                                 '<entry><id>http://example.org/x</id><title>x</title></entry>'), TODAY)
        self.assertEqual([r['arxiv_id'] for r in rows], ['2610.00003'])

    def test_non_atom_payload_is_rejected(self):
        with self.assertRaises(ValueError):
            papers.parse(b'<html></html>', TODAY)

    def test_failure_keeps_previous_picks(self):
        previous = [{'arxiv_id': '2610.00009', 'title': 'Kept'}]
        info, rows = papers.collect({'last_successful_fetch': '2026-10-28T00:00:00Z'}, previous,
                                    lambda _url: (_ for _ in ()).throw(OSError()), '2026-10-29T00:00:00Z')
        self.assertEqual(rows, previous)
        self.assertEqual(info['status'], 'stale')
        with self.assertRaises(OSError):
            papers.collect({}, [], lambda _url: (_ for _ in ()).throw(OSError()), '2026-10-29T00:00:00Z')

    def test_artifacts_round_trip(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            info, rows = papers.collect({}, [], lambda _url: feed(entry('2610.00004', 'Guardrail for &lt;harmful&gt; outputs')), '2026-10-29T00:00:00Z')
            papers.write_artifacts(root, info, rows)
            self.assertEqual(papers.load_previous(root), (info, rows))
            self.assertNotIn('<harmful>', (root / 'paper-picks.js').read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
