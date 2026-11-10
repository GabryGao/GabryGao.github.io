"""Behavior tests for the signal collector (no network)."""
import importlib.util
from datetime import date
import json
from pathlib import Path
import tempfile
import threading
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


def discovery_item(**updates):
    item = {
        'id': 'discovered-1',
        'title': 'Agent sandbox escape exposes customer records',
        'summary': 'An AI security agent escaped its sandbox and exposed private data.',
        'source': {'name': 'Example Security News'},
        'links': {
            'aihot': 'https://aisafetyhot.com/en/items/discovered-1',
            'original': 'https://security.example.org/reports/agent-sandbox',
        },
        'publishedAt': '2026-10-28T10:00:00Z',
        'discoveredAt': '2026-10-28T11:00:00Z',
        'category': 'incident',
        'kind': 'article',
        'tags': ['Agent safety', 'privacy'],
    }
    item.update(updates)
    return item


def discovery_response(items=None, more=False, cursor=None):
    return json.dumps({
        'schemaVersion': 1,
        'items': items if items is not None else [discovery_item()],
        'paperPicks': [],
        'page': {'count': len(items if items is not None else [1]), 'hasMore': more, 'nextCursor': cursor},
    }).encode()


class FetchTest(unittest.TestCase):
    def fetch_payload(self, payload):
        from unittest.mock import patch

        def run(command, **options):
            Path(command[command.index('--output') + 1]).write_bytes(payload)

        with patch.object(signals.subprocess, 'run', side_effect=run) as request:
            result = signals.fetch_url('https://example.org/feed.xml')
        return result, request.call_args

    def test_fetch_requests_decompression_with_https_size_and_time_bounds(self):
        payload, call = self.fetch_payload(b'<rss/>')
        command = call.args[0]
        self.assertEqual(payload, b'<rss/>')
        self.assertIn('--compressed', command)
        for flag, expected in [('--proto', '=https'), ('--proto-redir', '=https'),
                               ('--max-filesize', str(signals.MAX_BYTES)),
                               ('--max-time', str(signals.TIMEOUT)), ('--max-redirs', '3')]:
            self.assertEqual(command[command.index(flag) + 1], expected)
        self.assertTrue(call.kwargs['check'])
        self.assertEqual(call.kwargs['timeout'], signals.TIMEOUT + 5)

    def test_feed_just_over_four_mib_can_be_fetched_and_parsed(self):
        # METR's full RSS feed exceeded the former 4 MiB transport/parser cap.
        payload = rss(('AI safety evaluation', 'https://example.org/report', 'x', 'Mon, 26 Oct 2026 10:00:00 GMT'))
        payload += b'<!--' + b' ' * (4 * 1024 * 1024) + b'-->'
        result, _ = self.fetch_payload(payload)
        self.assertEqual(result, payload)
        self.assertLess(len(result), signals.MAX_BYTES)
        self.assertEqual(len(signals.parse_feed(result, SOURCE['metr'], TODAY)), 1)

    def test_decompressed_response_still_has_a_size_limit(self):
        from unittest.mock import patch

        with patch.object(signals, 'MAX_BYTES', 128):
            with self.assertRaisesRegex(ValueError, 'Response exceeds size limit'):
                self.fetch_payload(b'x' * 129)


class PhysicalDirectionTest(unittest.TestCase):
    def test_physical_ai_covers_robotics_and_chinese_driving(self):
        for text in ['司机激活智驾并双手脱离方向盘，轿车追尾致3死',
                     'Safety evaluation of vision-language-action models',
                     'Robotics foundation models and collision avoidance',
                     'World models for vehicle planning and pedestrian safety',
                     'A Tesla hit a patrol car while officers were investigating a crash',
                     'Embodied AI safety benchmark for humanoids']:
            with self.subTest(text=text):
                self.assertIn('physical-ai', signals.matches(signals.DIRECTIONS, text))

    def test_software_metaphors_and_coercive_control_are_not_physical_ai(self):
        for text in ["OpenAI's robots surfed the web with Google Docs and a stranger's API key",
                     'Self-driving-style hacking: ARTEX cybercrime campaign',
                     'Blind Compliance: embodied and disembodied forms of coercive control in AI jailbreaking',
                     'Tesla publishes a financial report']:
            with self.subTest(text=text):
                self.assertNotIn('physical-ai', signals.matches(signals.DIRECTIONS, text))

    def test_stored_direction_is_corrected_without_changing_date_or_other_tags(self):
        row = {'id': 'old', 'date': '2026-10-22', 'title': '智能驾驶辅助模式发生碰撞',
               'direction_ids': ['foundation-model']}
        fixed = signals.refresh_physical_direction(row)
        self.assertEqual(fixed['direction_ids'], ['physical-ai'])
        self.assertEqual(fixed['date'], row['date'])
        metaphor = dict(row, title='Self-driving-style hacking', direction_ids=['physical-ai', 'agent-software'])
        self.assertEqual(signals.refresh_physical_direction(metaphor)['direction_ids'], ['agent-software'])
        self.assertEqual(row['direction_ids'], ['foundation-model'])


class ParseTest(unittest.TestCase):
    def test_arxiv_robotics_keeps_publication_date_and_canonical_original_link(self):
        payload = atom(('Safe vision-language-action models for robots', 'http://arxiv.org/abs/2610.12345v2', 'Collision avoidance under safety constraints.', '2026-10-12T10:14:00Z'),
                       ('Robot safety', 'http://other.example/abs/2610.22222v1', 'Safety constraints.', '2026-10-12T10:14:00Z'))
        rows = signals.parse_feed(payload, SOURCE['arxiv-robotics'], TODAY)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['url'], 'https://arxiv.org/abs/2610.12345')
        self.assertEqual(rows[0]['date'], '2026-10-12')
        self.assertEqual(rows[0]['kind'], 'research')
        self.assertEqual(rows[0]['category'], 'research')
        self.assertEqual(rows[0]['direction_ids'], ['physical-ai'])

    def test_robotics_source_requires_physical_safety_and_allows_scale_in_safety_title(self):
        payload = rss(('Why Deploying Physical AI at Scale Demands Safety at Every Layer', 'https://blogs.nvidia.com/blog/safety', 'Safety for industrial robots and autonomous vehicles.', 'Mon, 26 Oct 2026 10:00:00 GMT'),
                      ('Frontier simulations accelerate robotics', 'https://blogs.nvidia.com/blog/simulation', 'New platform capabilities.', 'Mon, 26 Oct 2026 10:00:00 GMT'),
                      ('AI chatbot safety improvements', 'https://blogs.nvidia.com/blog/chatbot', 'Guardrails for a language model.', 'Mon, 26 Oct 2026 10:00:00 GMT'),
                      ('Physical adversarial multi-agent robot learning', 'https://blogs.nvidia.com/blog/game', 'A tabletop game platform for competitive play.', 'Mon, 26 Oct 2026 10:00:00 GMT'))
        rows = signals.parse_feed(payload, SOURCE['nvidia-robotics'], TODAY)
        self.assertEqual([r['url'] for r in rows], ['https://blogs.nvidia.com/blog/safety'])
        self.assertIn('physical-ai', rows[0]['direction_ids'])

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

    def test_long_summaries_keep_context_for_detail_pages(self):
        summary = ('Risk evidence, affected systems, remediation status, and open verification questions. ' * 10).strip()
        payload = rss(('Frontier AI safety incident report', 'https://example.org/long-report', summary, 'Mon, 26 Oct 2026 10:00:00 GMT'))
        rows = signals.parse_feed(payload, SOURCE['metr'], TODAY)
        self.assertEqual(rows[0]['description'], summary)
        self.assertGreater(len(rows[0]['description']), 200)

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

    def test_discovery_uses_original_publisher_and_never_the_aggregator_link(self):
        rows, cursor = signals.parse_discovery_page(discovery_response(), TODAY)
        self.assertIsNone(cursor)
        self.assertEqual(rows[0]['url'], 'https://security.example.org/reports/agent-sandbox')
        self.assertEqual(rows[0]['source'], 'Example Security News')
        self.assertEqual(rows[0]['kind'], 'incident')
        self.assertNotIn('aihot', json.dumps(rows[0]).lower())

    def test_discovery_rejects_aggregator_only_unsafe_future_and_generic_items(self):
        rows, _ = signals.parse_discovery_page(discovery_response(items=[
            discovery_item(id='aggregator', links={'original': 'https://aisafetyhot.com/en/items/x'}),
            discovery_item(id='insecure', links={'original': 'http://example.org/x'}),
            discovery_item(id='future', links={'original': 'https://example.org/future'}, publishedAt='2026-10-30T00:00:00Z'),
            discovery_item(id='generic', links={'original': 'https://example.org/general'}, category='ai_news',
                           title='New AI product launches', summary='A general product update.', tags=['非安全/通用AI']),
        ]), TODAY)
        self.assertEqual(rows, [])

    def test_discovery_pagination_is_bounded_and_deduplicated(self):
        calls = []
        def fetch(_url):
            calls.append(_url)
            return discovery_response(more=True, cursor='cursor-' + str(len(calls)))
        rows, pages, _ = signals.collect_discovery(fetch, '2026-10-29T00:00:00Z')
        self.assertEqual(pages, signals.DISCOVERY_PAGES)
        self.assertEqual(len(calls), signals.DISCOVERY_PAGES)
        self.assertEqual(len(rows), 1)


class CollectTest(unittest.TestCase):
    def feeds(self, failing=()):
        good = {s['url']: rss(('AI risk and misuse report', 'https://example.org/' + s['id'], 'x', 'Mon, 26 Oct 2026 10:00:00 GMT')) for s in signals.SOURCES}
        def fetch(url):
            if url.startswith(signals.DISCOVERY_SOURCE['api_url']):
                if signals.DISCOVERY_SOURCE['id'] in failing:
                    raise OSError('down')
                return discovery_response()
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

    def test_sources_fetch_concurrently_and_keep_configured_order(self):
        barrier = threading.Barrier(len(signals.SOURCES) + 1)
        def fetch(url):
            barrier.wait(timeout=2)
            if url.startswith(signals.DISCOVERY_SOURCE['api_url']):
                return discovery_response()
            source = next(source for source in signals.SOURCES if source['url'] == url)
            return rss(('AI risk and misuse report', 'https://example.org/' + source['id'], 'x', 'Mon, 26 Oct 2026 10:00:00 GMT'))
        info, _ = signals.collect({}, [], fetch, '2026-10-29T00:00:00Z')
        self.assertEqual([source['id'] for source in info['sources']],
                         [source['id'] for source in signals.SOURCES] + [signals.DISCOVERY_SOURCE['id']])

    def test_fresh_copy_replaces_stored_copy(self):
        info, first = signals.collect({}, [], self.feeds(), '2026-10-29T00:00:00Z')
        stale = [dict(r, title='stale') for r in first]
        info, rows = signals.collect(info, stale, self.feeds(), '2026-10-29T03:00:00Z')
        self.assertNotIn('stale', {r['title'] for r in rows})
        self.assertEqual(len(rows), len(first))

    def test_total_failure_without_history_raises(self):
        with self.assertRaises(ValueError):
            signals.collect({}, [], self.feeds(failing={s['id'] for s in signals.SOURCES} | {signals.DISCOVERY_SOURCE['id']}), '2026-10-29T00:00:00Z')

    def test_primary_record_wins_when_discovery_finds_the_same_original_url(self):
        duplicate = discovery_item(links={'original': 'https://example.org/openai'})
        def fetch(url):
            if url.startswith(signals.DISCOVERY_SOURCE['api_url']):
                return discovery_response(items=[duplicate])
            source = next(source for source in signals.SOURCES if source['url'] == url)
            return rss(('AI risk and misuse report', 'https://example.org/' + source['id'], 'x', 'Mon, 26 Oct 2026 10:00:00 GMT'))
        _, rows = signals.collect({}, [], fetch, '2026-10-29T00:00:00Z')
        duplicate_rows = [row for row in rows if row['url'] == 'https://example.org/openai']
        self.assertEqual(len(duplicate_rows), 1)
        self.assertEqual(duplicate_rows[0]['source_id'], 'openai')

    def test_discovery_failure_keeps_previous_discovery_rows(self):
        info, rows = signals.collect({}, [], self.feeds(), '2026-10-29T00:00:00Z')
        old = next(row for row in rows if row['source_id'].startswith('web-'))
        next_info, next_rows = signals.collect(info, rows, self.feeds(failing={signals.DISCOVERY_SOURCE['id']}), '2026-10-29T00:30:00Z')
        self.assertIn(old['id'], {row['id'] for row in next_rows})
        source = next(item for item in next_info['sources'] if item['id'] == signals.DISCOVERY_SOURCE['id'])
        self.assertEqual(source['status'], 'failed')
        self.assertEqual(next_info['status'], 'partial')

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
