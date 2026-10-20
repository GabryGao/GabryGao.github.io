"""Behavior tests for the public-feed importer (no network or dependencies)."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import subprocess

MODULE = Path(__file__).with_name('update-news.py')
news = None
if MODULE.exists():
    spec = importlib.util.spec_from_file_location('update_news', MODULE)
    news = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(news)


def rss(title='AI safety evaluation', date='Mon, 19 Oct 2026 12:00:00 GMT',
        url='https://openai.com/index/test', category='Research'):
    return ('<rss><channel><language>en-US</language><item><title>' + title +
            '</title><link>' + url + '</link><pubDate>' + date +
            '</pubDate><category>' + category + '</category>' +
            '<description>Never copy this abstract.</description></item></channel></rss>').encode()


class NewsTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(news, 'The feed importer must exist')
        self.source = news.SOURCES[0]

    def parse(self, payload):
        return news.parse_feed(payload, self.source, '2026-10-20')

    def test_original_title_and_source_date_survive_without_abstract(self):
        rows = self.parse(rss('Privacy-preserving AI safety benchmark'))
        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row['title'], 'Privacy-preserving AI safety benchmark')
        self.assertEqual(row['date'], '2026-10-19')
        self.assertEqual(row['language'], 'en-US')
        self.assertIn('data-privacy', row['direction_ids'])
        self.assertIn('foundation-model', row['direction_ids'])
        self.assertEqual(row['type'], 'projects')
        self.assertFalse(row['verified'])
        self.assertNotIn('Never copy', json.dumps(row))

    def test_unrelated_product_news_does_not_pass(self):
        self.assertEqual(self.parse(rss('A faster image generator')), [])

    def test_keywords_have_word_boundaries(self):
        self.assertEqual(self.parse(rss('An alignmentless safetybelt')), [])

    def test_directions_require_safety_context(self):
        self.assertEqual(self.parse(rss('A new robot for chemistry')), [])
        row = self.parse(rss('Robot safety in biological research'))[0]
        self.assertIn('physical-ai', row['direction_ids'])
        self.assertIn('ai-x-science', row['direction_ids'])

    def test_social_and_agent_topics_are_filterable(self):
        row = self.parse(rss('Agent prompt injection and child safety'))[0]
        self.assertIn('agent-software', row['direction_ids'])
        self.assertIn('human-societal', row['direction_ids'])

    def test_invalid_missing_or_future_dates_never_get_today(self):
        for date in ['', 'bad date', 'Wed, 21 Oct 2026 12:00:00 GMT',
                     '2026-02-31', '2026-10-19 12:00:00']:
            with self.subTest(date=date):
                self.assertEqual(self.parse(rss(date=date)), [])

    def test_atom_published_date_and_link_are_supported(self):
        payload = b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>AI safety research</title><link href="https://openai.com/index/atom"/><published>2026-10-18T23:30:00-02:00</published></entry></feed>'
        self.assertEqual(self.parse(payload)[0]['date'], '2026-10-19')

    def test_unsafe_urls_are_rejected(self):
        for url in ['javascript:alert(1)', 'http://openai.com/x',
                    'https://openai.com.evil.test/x', 'https://user@openai.com/x',
                    'https://127.0.0.1/x', 'https://openai.com:8080/x',
                    'https://openai.com/x&#10;bad']:
            with self.subTest(url=url):
                self.assertEqual(self.parse(rss(url=url)), [])

    def test_xml_entities_and_oversized_payload_are_rejected(self):
        for payload in [b'<!DOCTYPE rss [<!ENTITY x "AI safety">]><rss/>',
                        b'<!ENTITY x SYSTEM "file:///etc/passwd"><rss/>',
                        b'x' * (4 * 1024 * 1024 + 1), b'<not-a-feed/>']:
            with self.subTest(payload=payload[:40]):
                with self.assertRaises(ValueError):
                    self.parse(payload)

    def test_markup_is_plain_text_and_script_closer_is_safe_in_js(self):
        row = self.parse(rss('&lt;b&gt;AI safety&lt;/b&gt; &amp; privacy'))[0]
        self.assertEqual(row['title'], 'AI safety & privacy')
        encoded = news.render_js({}, [{'title': '</script><script>alert(1)</script>'}])
        self.assertNotIn('</script>', encoded)

    def test_deduplication_removes_tracking_and_fragments(self):
        payload = rss(url='https://openai.com/index/test/?utm_source=rss#section')
        row = self.parse(payload)[0]
        self.assertEqual(row['url'], 'https://openai.com/index/test')
        self.assertEqual(news.merge_records([row, dict(row)], []), [row])

    def test_success_is_bounded_to_thirty_newest_records(self):
        row = self.parse(rss())[0]
        rows = [dict(row, id=str(i), url='https://openai.com/index/'+str(i),
                     date='2026-10-'+str(i % 19 + 1).zfill(2)) for i in range(45)]
        result = news.merge_records(rows, [])
        self.assertEqual(len(result), 30)
        self.assertEqual(result[0]['date'], '2026-10-19')

    def test_failure_keeps_previous_records_and_last_success_time(self):
        old = self.parse(rss())[0]
        previous_info = {'sources': [dict(self.source, last_successful_fetch='2026-10-19T01:00:00Z')]}
        def offline(source):
            raise OSError('offline')
        info, records = news.collect([self.source], previous_info, [old], offline, '2026-10-20T02:00:00Z')
        self.assertEqual(records, [old])
        self.assertEqual(info['status'], 'stale')
        self.assertEqual(info['sources'][0]['last_successful_fetch'], '2026-10-19T01:00:00Z')
        self.assertEqual(info['failed_sources'][0]['id'], self.source['id'])

    def test_partial_failure_keeps_failed_source_and_updates_successful_source(self):
        first, second = news.SOURCES
        old = dict(self.parse(rss())[0], source=second['name'], source_id=second['id'], url='https://deepmind.google/blog/old')
        def fetch(source):
            if source['id'] == second['id']:
                raise TimeoutError('slow feed')
            return rss('New AI safety research')
        info, records = news.collect(news.SOURCES, {}, [old], fetch, '2026-10-20T02:00:00Z')
        self.assertEqual(info['status'], 'partial')
        self.assertEqual(len(records), 2)
        self.assertIn(old, records)

    def test_valid_empty_results_replace_old_but_empty_feed_is_failure(self):
        old = self.parse(rss())[0]
        info, rows = news.collect([self.source], {}, [old], lambda _: rss('New image generator'), '2026-10-20T02:00:00Z')
        self.assertEqual(rows, [])
        self.assertEqual(info['status'], 'current')
        info, rows = news.collect([self.source], {}, [old], lambda _: b'<rss><channel/></rss>', '2026-10-20T02:00:00Z')
        self.assertEqual(rows, [old])
        self.assertEqual(info['status'], 'stale')

    def test_written_artifacts_round_trip_and_corrupt_previous_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            info, rows = news.collect([self.source], {}, [], lambda _: rss(), '2026-10-20T02:00:00Z')
            news.write_artifacts(root, info, rows)
            self.assertEqual(news.load_previous(root), (info, rows))
            (root / 'research-source/news-feed-provenance.json').write_text('{}')
            with self.assertRaises(ValueError):
                news.load_previous(root)

    def test_transport_has_total_deadline_and_keeps_data_on_process_timeout(self):
        old = self.parse(rss())[0]
        def timeout(*args, **kwargs):
            self.assertLessEqual(kwargs['timeout'], 25)
            raise subprocess.TimeoutExpired('curl', kwargs['timeout'])
        with patch.object(subprocess, 'run', timeout):
            info, rows = news.collect([self.source], {}, [old], news.fetch_feed, '2026-10-20T02:00:00Z')
        self.assertEqual(info['status'], 'stale')
        self.assertEqual(info['failed_sources'][0]['error'], 'TimeoutExpired')
        self.assertEqual(rows, [old])


if __name__ == '__main__':
    unittest.main()
