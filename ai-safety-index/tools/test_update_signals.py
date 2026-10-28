"""Behavior tests for the primary-feed signal collector (no network)."""
import importlib.util
from datetime import date
import json
from pathlib import Path
import tempfile
import unittest

MODULE = Path(__file__).with_name('update-signals.py')
spec = importlib.util.spec_from_file_location('update_signals', MODULE)
signals = importlib.util.module_from_spec(spec)
spec.loader.exec_module(signals)

TODAY = date(2026, 10, 29)
SOURCE = {sid['id']: sid for sid in signals.SOURCES}


def rss(*items):
    body = ''.join(f'<item><title>{t}</title><link>{l}</link><description>{d}</description><pubDate>{p}</pubDate></item>' for t, l, d, p in items)
    return f'<?xml version="1.0"?><rss version="2.0"><channel><title>x</title>{body}</channel></rss>'.encode()


def atom(*entries):
    body = ''.join(f'<entry><title>{t}</title><link rel="alternate" href="{l}"/><summary>{s}</summary><updated>{u}</updated></entry>' for t, l, s, u in entries)
    return f'<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>x</title>{body}</feed>'.encode()


class ParseTest(unittest.TestCase):
    def test_official_posts_need_a_safety_match(self):
        payload = rss(('Our approach to frontier risk and misuse', 'https://openai.com/index/risk', 'How we test models.', 'Mon, 26 Oct 2026 10:00:00 GMT'),
                      ('A customer builds legal workflows', 'https://openai.com/index/legal', 'Productivity story.', 'Mon, 26 Oct 2026 10:00:00 GMT'))
        rows = signals.parse_feed(payload, SOURCE['openai'], TODAY)
        self.assertEqual([r['title'] for r in rows], ['Our approach to frontier risk and misuse'])
        self.assertEqual(rows[0]['orgs'][0], 'openai')
        self.assertEqual(rows[0]['kind'], 'official')

    def test_customer_stories_are_not_safety_news(self):
        payload = rss(('How Check Point accelerates vulnerability research with Daybreak', 'https://openai.com/index/a', 'security', 'Mon, 26 Oct 2026 10:00:00 GMT'),
                      ('GPT-6.1 Sol helps CodeRabbit strengthen security', 'https://openai.com/index/b', 'risk', 'Mon, 26 Oct 2026 10:00:00 GMT'),
                      ('Securing our frontier model training environment', 'https://openai.com/index/c', 'risk', 'Mon, 26 Oct 2026 10:00:00 GMT'))
        self.assertEqual([r['url'] for r in signals.parse_feed(payload, SOURCE['openai'], TODAY)], ['https://openai.com/index/c'])

    def test_atom_entries_and_unfiltered_sources(self):
        payload = atom(('Britain steps up national defences against growing AI risks', 'https://www.gov.uk/government/news/x', 'A suite of measures.', '2026-10-12T10:14:00Z'))
        rows = signals.parse_feed(payload, SOURCE['uk-aisi'], TODAY)
        self.assertEqual(rows[0]['date'], '2026-10-12')
        self.assertEqual(rows[0]['url'], 'https://www.gov.uk/government/news/x')
        self.assertEqual(rows[0]['category'], 'policy')

    def test_incidents_get_site_rules_for_orgs_and_directions(self):
        payload = rss(('Family sues OpenAI after ChatGPT advice in teen suicide case', 'https://example.org/report', 'Lawsuit filed.', 'Sat, 24 Oct 2026 00:00:00 GMT'))
        row = signals.parse_feed(payload, SOURCE['aiid'], TODAY)[0]
        self.assertEqual(row['category'], 'incident')
        self.assertIn('openai', row['orgs'])
        self.assertIn('human-societal', row['direction_ids'])
        self.assertNotIn('aihot', json.dumps(row))

    def test_unsafe_links_future_dates_and_markup_are_handled(self):
        payload = rss(('Risk <b>update</b>', 'http://insecure.example/x', 'x', 'Mon, 26 Oct 2026 10:00:00 GMT'),
                      ('Future risk', 'https://example.org/future', 'x', 'Mon, 30 Nov 2026 10:00:00 GMT'),
                      ('Safety &amp; misuse &lt;script&gt;', 'https://example.org/ok', '&lt;p&gt;Plain&lt;/p&gt;', 'Mon, 26 Oct 2026 10:00:00 GMT'))
        rows = signals.parse_feed(payload, SOURCE['metr'], TODAY)
        self.assertEqual([r['url'] for r in rows], ['https://example.org/ok'])
        self.assertEqual(rows[0]['title'], 'Safety & misuse')
        self.assertEqual(rows[0]['description'], 'Plain')

    def test_nist_posts_must_be_about_ai(self):
        payload = rss(('New chip measures light, reducing risk', 'https://www.nist.gov/a', 'Optics.', 'Mon, 26 Oct 2026 10:00:00 GMT'),
                      ('AI risk management profile released', 'https://www.nist.gov/b', 'For AI systems.', 'Mon, 26 Oct 2026 10:00:00 GMT'))
        self.assertEqual([r['url'] for r in signals.parse_feed(payload, SOURCE['nist'], TODAY)], ['https://www.nist.gov/b'])

    def test_non_feed_payload_is_rejected(self):
        with self.assertRaises(ValueError):
            signals.parse_feed(b'<html><body>blocked</body></html>', SOURCE['openai'], TODAY)


class CollectTest(unittest.TestCase):
    def feeds(self, failing=()):
        good = {s['url']: rss(('AI risk and misuse report', 'https://example.org/' + s['id'], 'x', 'Mon, 26 Oct 2026 10:00:00 GMT')) for s in signals.SOURCES}
        def fetch(url):
            if any(url == s['url'] for s in signals.SOURCES if s['id'] in failing):
                raise OSError('down')
            return good[url]
        return fetch

    def test_partial_failure_keeps_stored_rows_and_trims_old_ones(self):
        kept = {'id': 'metr-old', 'title': 'Old', 'date': '2026-09-01', 'source': 'METR', 'url': 'https://metr.org/old'}
        expired = dict(kept, id='metr-expired', date='2026-06-01')
        info, rows = signals.collect({}, [kept, expired], self.feeds(failing={'metr'}), '2026-10-29T00:00:00Z')
        ids = {r['id'] for r in rows}
        self.assertIn('metr-old', ids)
        self.assertNotIn('metr-expired', ids)
        self.assertEqual(info['status'], 'partial')
        self.assertEqual(next(s for s in info['sources'] if s['id'] == 'metr')['status'], 'failed')

    def test_fresh_copy_replaces_stored_copy(self):
        info, first = signals.collect({}, [], self.feeds(), '2026-10-29T00:00:00Z')
        stale = [dict(r, title='stale') for r in first]
        info, rows = signals.collect(info, stale, self.feeds(), '2026-10-29T03:00:00Z')
        self.assertEqual({r['title'] for r in rows}, {'AI risk and misuse report'})
        self.assertEqual(len(rows), len(first))

    def test_total_failure_without_history_raises(self):
        with self.assertRaises(ValueError):
            signals.collect({}, [], self.feeds(failing={s['id'] for s in signals.SOURCES}), '2026-10-29T00:00:00Z')

    def test_artifacts_round_trip_and_are_script_safe(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            info, rows = signals.collect({}, [], self.feeds(), '2026-10-29T00:00:00Z')
            rows[0]['title'] = '</script><b>x</b>'
            signals.write_artifacts(root, info, rows)
            self.assertEqual(signals.load_previous(root), (info, rows))
            script = (root / 'signals-feed.js').read_text(encoding='utf-8')
            self.assertIn('const siteSignals = ', script)
            self.assertNotIn('</script', script.lower())


if __name__ == '__main__':
    unittest.main()
