"""Behavior tests for the AIHOT company topic importer."""
import importlib.util
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch


MODULE = Path(__file__).with_name('update-topics.py')
spec = importlib.util.spec_from_file_location('update_topics', MODULE)
topics = importlib.util.module_from_spec(spec)
spec.loader.exec_module(topics)


def fixture():
    cards = []
    for index, (topic_id, name, _) in enumerate(topics.TOPIC_SPECS, start=1):
        cards.append(
            f'<li><a href="/topics/{topic_id}">'
            f'<span><img src="/model-providers/{topic_id}.svg"></span>'
            f'<span>{name}</span>'
            f'<span class="line-clamp-1 text-sm">{name} 最新公开动态</span>'
            f'<time datetime="2026-10-{index:02d}T10:00:00Z">1 天前</time>'
            f'<span>近 30 天 <span>{index}</span> 条</span>'
            '</a></li>'
        )
    return ('<section aria-labelledby="other"></section>'
            '<section aria-labelledby="topics-company"><ul>' + ''.join(cards)
            + '</ul></section>').encode()


class TopicTests(unittest.TestCase):
    def test_parser_keeps_all_fifteen_topics_in_product_order(self):
        records = topics.parse_topics(fixture())
        self.assertEqual(len(records), 15)
        self.assertEqual(records[0]['name'], 'OpenAI / ChatGPT')
        self.assertEqual(records[-1]['name'], 'OpenRouter')
        self.assertEqual(records[4]['count_30d'], 5)
        self.assertEqual(records[4]['headline'], '千问 Qwen 最新公开动态')
        self.assertEqual(records[0]['url'], 'https://aihot.news/topics/openai')

    def test_missing_topic_rejects_partial_directory(self):
        payload = fixture().replace(b'/topics/openrouter', b'/topics/not-openrouter')
        with self.assertRaises(ValueError):
            topics.parse_topics(payload)

    def test_failure_keeps_previous_snapshot(self):
        previous = topics.parse_topics(fixture())
        info, records = topics.collect(
            {'last_successful_fetch': '2026-10-24T00:00:00Z'}, previous,
            lambda _url: (_ for _ in ()).throw(OSError()), '2026-10-25T00:00:00Z')
        self.assertEqual(records, previous)
        self.assertEqual(info['status'], 'stale')

    def test_empty_first_run_fails(self):
        with self.assertRaises(OSError):
            topics.collect({}, [], lambda _url: (_ for _ in ()).throw(OSError()),
                           '2026-10-25T00:00:00Z')

    def test_written_artifacts_round_trip(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            info, records = topics.collect({}, [], lambda _url: fixture(),
                                           '2026-10-25T00:00:00Z')
            topics.write_artifacts(root, info, records)
            self.assertEqual(topics.load_previous(root), (info, records))
            self.assertIn('const aihotCompanyTopics = ', (root / 'topic-feed.js').read_text())

    def test_transport_has_total_deadline(self):
        def timeout(*args, **kwargs):
            self.assertLessEqual(kwargs['timeout'], 25)
            raise subprocess.TimeoutExpired('curl', kwargs['timeout'])
        with patch.object(subprocess, 'run', timeout):
            with self.assertRaises(subprocess.TimeoutExpired):
                topics.fetch_url(topics.TOPICS_URL)


if __name__ == '__main__':
    unittest.main()
