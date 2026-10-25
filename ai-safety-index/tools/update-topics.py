#!/usr/bin/env python3
"""Refresh the AIHOT company-and-model topic directory used by the portal."""
import argparse
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import tempfile


TOPICS_URL = 'https://aihot.news/topics'
SOURCE = {
    'id': 'aihot-topics',
    'name': 'AIHOT',
    'url': TOPICS_URL,
    'host': 'aihot.news',
}
MAX_BYTES = 2 * 1024 * 1024
TIMEOUT = 20
TOPIC_SPECS = [
    ('openai', 'OpenAI / ChatGPT', 'OA'),
    ('anthropic', 'Anthropic / Claude', 'A'),
    ('google', 'Google / Gemini', 'G'),
    ('deepseek', 'DeepSeek', 'DS'),
    ('qwen', '千问 Qwen', 'Q'),
    ('kimi', '月之暗面 / Kimi', 'K'),
    ('minimax', 'MiniMax', 'M'),
    ('zhipu', '智谱 GLM', 'GLM'),
    ('xai', 'xAI / Grok', 'xAI'),
    ('meta', 'Meta / Llama', 'Meta'),
    ('microsoft', 'Microsoft / Copilot', 'MS'),
    ('nvidia', 'NVIDIA 英伟达', 'NV'),
    ('hugging-face', 'Hugging Face', 'HF'),
    ('cursor', 'Cursor', 'C'),
    ('openrouter', 'OpenRouter', 'OR'),
]


class TopicDirectoryParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_company_section = False
        self.section_depth = 0
        self.current = None
        self.capture_headline = False
        self.records = {}

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == 'section':
            if self.in_company_section:
                self.section_depth += 1
            elif attributes.get('aria-labelledby') == 'topics-company':
                self.in_company_section = True
                self.section_depth = 1
            return
        if not self.in_company_section:
            return
        if tag == 'a':
            match = re.fullmatch(r'/topics/([a-z0-9-]+)', attributes.get('href', ''))
            if match:
                self.current = {
                    'id': match.group(1),
                    'headline_parts': [],
                    'anchor_parts': [],
                    'published_at': None,
                    'icon_path': None,
                }
            return
        if not self.current:
            return
        if tag == 'span' and 'line-clamp-1' in attributes.get('class', '').split():
            self.capture_headline = True
        elif tag == 'time':
            self.current['published_at'] = attributes.get('datetime')
        elif tag == 'img':
            icon_path = attributes.get('src', '')
            if re.fullmatch(r'/model-providers/[a-z0-9-]+\.svg', icon_path):
                self.current['icon_path'] = icon_path

    def handle_data(self, data):
        if not self.current:
            return
        self.current['anchor_parts'].append(data)
        if self.capture_headline:
            self.current['headline_parts'].append(data)

    def handle_endtag(self, tag):
        if not self.in_company_section:
            return
        if tag == 'span' and self.capture_headline:
            self.capture_headline = False
        elif tag == 'a' and self.current:
            text = re.sub(r'\s+', ' ', ' '.join(self.current['anchor_parts'])).strip()
            count = re.search(r'近\s*30\s*天\s*(\d+)\s*条', text)
            headline = re.sub(r'\s+', ' ', ' '.join(self.current['headline_parts'])).strip()
            if count and headline and self.current['published_at']:
                self.current['headline'] = headline
                self.current['count_30d'] = int(count.group(1))
                self.records[self.current['id']] = self.current
            self.current = None
            self.capture_headline = False
        elif tag == 'section':
            self.section_depth -= 1
            if self.section_depth == 0:
                self.in_company_section = False


def parse_topics(payload):
    if len(payload) > MAX_BYTES:
        raise ValueError('Topic page exceeds size limit')
    try:
        html = payload.decode('utf-8')
    except UnicodeDecodeError as error:
        raise ValueError('Topic page is not UTF-8') from error
    parser = TopicDirectoryParser()
    parser.feed(html)
    records = []
    for topic_id, name, mark in TOPIC_SPECS:
        parsed = parser.records.get(topic_id)
        if not parsed:
            raise ValueError(f'Missing company topic: {topic_id}')
        records.append({
            'id': topic_id,
            'name': name,
            'mark': mark,
            'headline': parsed['headline'],
            'published_at': parsed['published_at'],
            'count_30d': parsed['count_30d'],
            'url': f'https://aihot.news/topics/{topic_id}',
            'icon_path': parsed['icon_path'],
        })
    return records


def fetch_url(url):
    if url != TOPICS_URL:
        raise ValueError('Unexpected topic source URL')
    with tempfile.TemporaryDirectory(prefix='aihot-topics-') as directory:
        output = Path(directory) / 'topics.html'
        subprocess.run([
            'curl', '--fail', '--silent', '--show-error', '--proto', '=https',
            '--connect-timeout', '10', '--max-time', str(TIMEOUT),
            '--max-filesize', str(MAX_BYTES), '--max-redirs', '0',
            '--user-agent',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
            'Chrome/141.0.0.0 Safari/537.36',
            '--output', str(output), url,
        ], check=True, capture_output=True, timeout=TIMEOUT + 5)
        payload = output.read_bytes()
    if len(payload) > MAX_BYTES:
        raise ValueError('Topic page exceeds size limit')
    return payload


def load_previous(root):
    path = root / 'research-source/topic-feed-provenance.json'
    if not path.exists():
        if (root / 'topic-feed.js').exists():
            raise ValueError('Existing topic data has no provenance')
        return {}, []
    data = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(data.get('info'), dict) or not isinstance(data.get('records'), list):
        raise ValueError('Previous topic provenance is invalid')
    return data['info'], data['records']


def collect(previous_info, previous_records, fetch, timestamp):
    try:
        payload = fetch(TOPICS_URL)
        records = parse_topics(payload)
        info = {
            'generated_on': timestamp,
            'status': 'current',
            'record_count': len(records),
            'response_sha256': sha256(payload).hexdigest(),
            'last_successful_fetch': timestamp,
            'source': SOURCE,
            'date_policy': 'Latest topic item publication timestamp and rolling 30-day count reported by AIHOT.',
            'content_policy': 'Company/model topic names, latest public headline, publication timestamp and 30-day count.',
        }
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        if not previous_records:
            raise
        records = previous_records
        info = dict(previous_info)
        info.update({
            'generated_on': timestamp,
            'status': 'stale',
            'record_count': len(records),
            'error': type(error).__name__,
            'source': SOURCE,
        })
    return info, records


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2)
            .replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
            .replace('\u2028', '\\u2028').replace('\u2029', '\\u2029'))


def render_js(info, records):
    return ('// Generated by tools/update-topics.py from the public AIHOT topic directory.\n'
            + 'const aihotTopicInfo = ' + encoded(info) + ';\n'
            + 'const aihotCompanyTopics = ' + encoded(records) + ';\n')


def write_artifacts(root, info, records):
    path = root / 'research-source/topic-feed-provenance.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    artifacts = [
        (path, json.dumps({'info': info, 'records': records}, ensure_ascii=False, indent=2) + '\n'),
        (root / 'topic-feed.js', render_js(info, records)),
    ]
    for target, content in artifacts:
        temporary = target.with_suffix(target.suffix + '.tmp')
        temporary.write_text(content, encoding='utf-8')
        temporary.replace(target)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--source-file', type=Path)
    args = parser.parse_args()
    fetch = (lambda _url: args.source_file.read_bytes()) if args.source_file else fetch_url
    previous_info, previous_records = load_previous(args.root)
    timestamp = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    info, records = collect(previous_info, previous_records, fetch, timestamp)
    write_artifacts(args.root, info, records)
    print(f"AIHOT topics: {len(records)} records; status={info['status']}")


if __name__ == '__main__':
    main()
