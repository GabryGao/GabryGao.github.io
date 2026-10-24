"""Behavior tests for the AI Safety HOT importer (no network)."""
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

MODULE = Path(__file__).with_name('update-news.py')
spec = importlib.util.spec_from_file_location('update_news', MODULE)
news = importlib.util.module_from_spec(spec)
spec.loader.exec_module(news)


def response(items=None, papers=None, more=False, cursor=None):
    return json.dumps({
        'schemaVersion': 1,
        'access': {'scope': 'recent_selected_and_hot_news_and_paper_links', 'newsWindowDays': 7,
                   'summaryMaxChars': 160, 'paperPickLimit': 5, 'pageLimit': 20},
        'items': items if items is not None else [article()],
        'paperPicks': papers if papers is not None else [paper()],
        'page': {'count': 1, 'hasMore': more, 'nextCursor': cursor},
    }).encode()


def detail(item):
    return json.dumps({'schemaVersion': 1, 'item': item}).encode()


def article(**updates):
    item = {
        'id': 'article-1',
        'title': 'Agent prompt injection defense evaluation',
        'summary': 'A short public summary that remains attributable to AI Safety HOT.',
        'source': {'name': 'Example Lab'},
        'links': {'aihot': 'https://aisafetyhot.com/en/items/article-1',
                  'original': 'https://example.org/research/article-1'},
        'publishedAt': '2026-10-22T10:00:00.000Z',
        'discoveredAt': '2026-10-22T11:00:00.000Z',
        'category': 'defense',
        'score': 77,
        'selected': True,
        'tags': ['prompt injection', 'agent'],
    }
    item.update(updates)
    return item


def paper(**updates):
    item = {
        'id': 'paper-1',
        'title': 'Evaluating refusal transfer in LLM agents',
        'kind': 'paper',
        'links': {'aihot': 'https://aisafetyhot.com/en/items/paper-1',
                  'original': 'https://arxiv.org/abs/2610.00001'},
        'publishedAt': '2026-10-21T10:00:00.000Z',
    }
    item.update(updates)
    return item


class NewsTests(unittest.TestCase):
    def test_article_and_paper_are_mapped_to_portal_sections(self):
        articles, papers, cursor, access = news.parse_page(response(), '2026-10-23')
        self.assertIsNone(cursor)
        self.assertEqual(access['newsWindowDays'], 7)
        self.assertEqual(articles[0]['content_kind'], 'analysis')
        self.assertEqual(articles[0]['type'], 'reports')
        self.assertEqual(articles[0]['url'], 'https://aisafetyhot.com/en/items/article-1')
        self.assertEqual(articles[0]['original_url'], 'https://example.org/research/article-1')
        self.assertIn('agent-software', articles[0]['direction_ids'])
        self.assertEqual(papers[0]['content_kind'], 'share')
        self.assertEqual(papers[0]['type'], 'projects')

    def test_latest_categories_and_date_fallback(self):
        item = article(category='incident', publishedAt=None,
                       discoveredAt='2026-10-20T23:30:00-02:00')
        row = news.parse_page(response(items=[item], papers=[]), '2026-10-21')[0][0]
        self.assertEqual(row['content_kind'], 'latest')
        self.assertEqual(row['date'], '2026-10-21')

    def test_html_is_removed_and_script_closer_is_safe(self):
        item = article(title='<b>AI safety</b>', summary='<script>bad()</script> useful')
        row = news.parse_page(response(items=[item], papers=[]), '2026-10-23')[0][0]
        self.assertEqual(row['title'], 'AI safety')
        encoded = news.render_js({}, [{'title': '</script><script>alert(1)</script>'}])
        self.assertNotIn('</script>', encoded)

    def test_unsafe_urls_are_rejected_or_omitted(self):
        unsafe_aihot = article(links={'aihot': 'https://aisafetyhot.com.evil.test/en/items/x',
                                      'original': 'https://example.org/x'})
        self.assertEqual(news.parse_page(response(items=[unsafe_aihot], papers=[]), '2026-10-23')[0], [])
        unsafe_original = article(links={'aihot': 'https://aisafetyhot.com/en/items/x',
                                         'original': 'http://example.org/x'})
        row = news.parse_page(response(items=[unsafe_original], papers=[]), '2026-10-23')[0][0]
        self.assertIsNone(row['original_url'])
        for url in ['https://127.0.0.1/x', 'https://user@example.org/x',
                    'https://example.org:8080/x', 'javascript:alert(1)']:
            self.assertIsNone(news.safe_url(url))

    def test_invalid_schema_oversized_payload_and_future_dates_are_rejected(self):
        with self.assertRaises(ValueError):
            news.parse_page(b'{}', '2026-10-23')
        with self.assertRaises(ValueError):
            news.parse_page(b'x' * (news.MAX_BYTES + 1), '2026-10-23')
        future = article(publishedAt='2026-10-24T00:00:00Z', discoveredAt=None)
        self.assertEqual(news.parse_page(response(items=[future], papers=[]), '2026-10-23')[0], [])

    def test_pagination_is_bounded_and_deduplicated(self):
        calls = []
        def fetch(url):
            calls.append(url)
            index = len(calls)
            return response(items=[article(id='same')], papers=[paper(id='same-paper')],
                            more=index < news.MAX_PAGES, cursor='cursor-' + str(index))
        records, pages, articles, papers, _, _ = news.collect_pages(fetch, '2026-10-23T00:00:00Z')
        self.assertEqual(pages, news.MAX_PAGES)
        self.assertEqual(articles, news.MAX_PAGES)
        self.assertEqual(papers, 1)
        self.assertEqual(len(records), 2)

    def test_focus_records_receive_official_chinese_localization(self):
        def fetch(url):
            if '/api/v1/items/article-1?' in url:
                return detail(article(
                    title='智能体提示注入防御评测',
                    summary='来自 AI Safety HOT 的官方中文摘要。',
                    links={'aihot': 'https://aisafetyhot.com/zh/items/article-1',
                           'original': 'https://example.org/research/article-1'},
                ))
            return response()

        info, records = news.collect({}, [], fetch, '2026-10-23T02:00:00Z')
        row = next(item for item in records if item['id'] == 'aihot-article-1')
        source = info['sources'][0]
        self.assertEqual(row['title'], 'Agent prompt injection defense evaluation')
        self.assertEqual(row['title_zh'], '智能体提示注入防御评测')
        self.assertEqual(row['description_zh'], '来自 AI Safety HOT 的官方中文摘要。')
        self.assertEqual(source['localization_status'], 'ok')
        self.assertEqual(source['localized_focus_records'], 1)
        self.assertEqual(source['localization_requested'], 1)

    def test_invalid_localized_detail_does_not_discard_base_record(self):
        def fetch(url):
            return b'[]' if '/api/v1/items/article-1?' in url else response()

        info, records = news.collect({}, [], fetch, '2026-10-23T02:00:00Z')
        row = next(item for item in records if item['id'] == 'aihot-article-1')
        self.assertNotIn('title_zh', row)
        self.assertEqual(info['sources'][0]['localization_status'], 'partial')

    def test_failure_keeps_previous_snapshot(self):
        previous_info = {'sources': [dict(news.SOURCE, last_successful_fetch='2026-10-22T00:00:00Z')]}
        old = news.article_record(article(), '2026-10-23')
        info, records = news.collect(previous_info, [old], lambda _url: (_ for _ in ()).throw(OSError()),
                                     '2026-10-23T02:00:00Z')
        self.assertEqual(records, [old])
        self.assertEqual(info['status'], 'stale')
        self.assertEqual(info['sources'][0]['last_successful_fetch'], '2026-10-22T00:00:00Z')

    def test_empty_first_run_fails_instead_of_publishing_zero(self):
        with self.assertRaises(ValueError):
            news.collect({}, [], lambda _url: response(items=[], papers=[]), '2026-10-23T02:00:00Z')

    def test_written_artifacts_round_trip(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            info, rows = news.collect({}, [], lambda _url: response(), '2026-10-23T02:00:00Z')
            news.write_artifacts(root, info, rows)
            self.assertEqual(news.load_previous(root), (info, rows))
            (root / 'research-source/news-feed-provenance.json').write_text('{}')
            with self.assertRaises(ValueError):
                news.load_previous(root)

    def test_transport_has_total_deadline(self):
        def timeout(*args, **kwargs):
            self.assertLessEqual(kwargs['timeout'], 25)
            raise subprocess.TimeoutExpired('curl', kwargs['timeout'])
        with patch.object(subprocess, 'run', timeout):
            with self.assertRaises(subprocess.TimeoutExpired):
                news.fetch_url(news.API_URL)


if __name__ == '__main__':
    unittest.main()
