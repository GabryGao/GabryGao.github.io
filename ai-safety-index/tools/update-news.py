#!/usr/bin/env python3
"""Refresh bounded, unreviewed news metadata from public primary-source feeds.

Run from any directory: python3 tools/update-news.py
No API keys, dependencies, article crawling, translation, or copied abstracts.
The source publication date is distinct from the collection timestamp. Topic
and type assignments are keyword suggestions, never editorial verification.
"""
import argparse
from datetime import date, datetime, timezone
from email.utils import parsedate_to_datetime
from hashlib import sha256
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import tempfile
import urllib.parse
import xml.etree.ElementTree as ET

MAX_BYTES = 4 * 1024 * 1024
MAX_RECORDS = 30
TIMEOUT = 20
SOURCES = [
    {'id': 'openai', 'name': 'OpenAI News', 'url': 'https://openai.com/news/rss.xml',
     'home_url': 'https://openai.com/news/', 'hosts': ['openai.com', 'www.openai.com'], 'language': 'en'},
    {'id': 'deepmind', 'name': 'Google DeepMind', 'url': 'https://deepmind.google/blog/rss.xml',
     'home_url': 'https://deepmind.google/blog/', 'hosts': ['deepmind.google'], 'language': 'en'},
]
# Match title + publisher category only. Bodies/abstracts are neither retained
# nor used as evidence: incidental mentions there produce too many false hits.
TOPICS = [
    ('隐私与数据保护', 'data-privacy', r'privacy|private data|data leakage|data protection|membership inference|unlearning|data poisoning|backdoor'),
    ('安全与对齐', 'foundation-model', r'safety|safely|safe[- ]completions?|alignment|misalignment|misaligned|aligned|aligning|jailbreak\w*|robustness|hallucinat\w*|interpretability|scheming|system card|preparedness|frontier risks?|red[- ]team\w*'),
    ('网络与系统安全', 'agent-software', r'security|cybersecurity|cyber|prompt injections?|vulnerabilit\w*|malware'),
    ('社会与使用风险', 'human-societal', r'child safety|teen safety|harmful manipulation|scam\w*|disinformation|misinformation|fairness|bias|responsible ai|ai governance|ai risks?|safeguard\w*'),
]
CONTEXTS = [
    ('agent-software', r'agent\w*|tool use|tool[- ]using|software'),
    ('physical-ai', r'robot\w*|physical ai|autonomous vehicles?|embodied'),
    ('human-societal', r'child\w*|teen\w*|human|social|societ\w*|manipulat\w*'),
    ('ai-x-science', r'biolog\w*|biosecurity|chemical|chemistry|scientific|science|health|medical'),
]


def matches(pattern, text):
    return re.search(r'(?<!\w)(?:' + pattern + r')(?!\w)', text, re.I) is not None


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def plain_text(value):
    parser = PlainText()
    parser.feed(unescape(value or ''))
    return re.sub(r'\s+', ' ', ''.join(parser.parts)).strip()[:500]


def safe_url(value, source):
    if not value or re.search(r'[\x00-\x20\x7f<>"\\]', value):
        return None
    try:
        parsed = urllib.parse.urlsplit(value)
        if (parsed.scheme != 'https' or parsed.hostname not in source['hosts']
                or parsed.username or parsed.password or parsed.port not in (None, 443)):
            return None
    except ValueError:
        return None
    query = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    query = [(k, v) for k, v in query if not k.lower().startswith('utm_')
             and k.lower() not in ('fbclid', 'gclid')]
    return urllib.parse.urlunsplit(('https', parsed.hostname,
                                   parsed.path.rstrip('/') or '/',
                                   urllib.parse.urlencode(query), ''))


def source_date(value, today):
    try:
        value = value.strip()
        if re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
            result = date.fromisoformat(value)
        else:
            try:
                parsed = parsedate_to_datetime(value)
            except (ValueError, TypeError):
                parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
            if parsed.tzinfo is None:
                return None
            result = parsed.astimezone(timezone.utc).date()
        if result > date.fromisoformat(today) or result.year < 2000:
            return None
        return result.isoformat()
    except (ValueError, TypeError, OverflowError, AttributeError):
        return None


def child_text(node, name):
    child = next((c for c in node if c.tag.rsplit('}', 1)[-1] == name), None)
    return ''.join(child.itertext()).strip() if child is not None else ''


def parse_feed(payload, source, today):
    if len(payload) > MAX_BYTES:
        raise ValueError('Feed exceeds size limit')
    # Expat does not fetch external entities, but reject all DTD/entity syntax
    # explicitly before parsing, including UTF-16/32 encodings with null bytes.
    if re.search(br'<!\s*(?:DOCTYPE|ENTITY)\b', payload.replace(b'\x00', b''), re.I):
        raise ValueError('DTD and entity declarations are forbidden')
    try:
        root = ET.fromstring(payload)
    except ET.ParseError as error:
        raise ValueError('Malformed feed XML') from error
    if root.tag.rsplit('}', 1)[-1] not in ('rss', 'feed', 'RDF'):
        raise ValueError('Unsupported feed document')
    nodes = [node for node in root.iter() if node.tag.rsplit('}', 1)[-1] in ('item', 'entry')]
    if not nodes:
        raise ValueError('Feed has no entries; keeping previous source data')
    language = next((plain_text(node.text) for node in root.iter()
                     if node.tag.rsplit('}', 1)[-1] == 'language'), source['language'])
    rows = []
    for node in nodes:
        title = plain_text(child_text(node, 'title'))
        categories = [plain_text(c.text or c.get('term', '')) for c in node
                      if c.tag.rsplit('}', 1)[-1] == 'category']
        text = title + ' ' + ' '.join(categories)
        hits = [(label, direction) for label, direction, pattern in TOPICS if matches(pattern, text)]
        if not hits:
            continue
        directions = list(dict.fromkeys(direction for _, direction in hits))
        directions.extend(direction for direction, pattern in CONTEXTS
                          if direction not in directions and matches(pattern, text))
        link = child_text(node, 'link')
        if not link:
            link = next((c.get('href', '') for c in node
                         if c.tag.rsplit('}', 1)[-1] == 'link'
                         and c.get('rel', 'alternate') == 'alternate'), '')
        url = safe_url(link, source)
        published = source_date(child_text(node, 'pubDate') or child_text(node, 'published')
                                or child_text(node, 'date'), today)
        if not title or not url or not published:
            continue
        terms = [label for label, _ in hits]
        rows.append({
            'id': 'auto-' + sha256(url.encode()).hexdigest()[:16],
            'title': title,
            'type': 'projects' if matches(r'benchmark\w*|dataset\w*|open[- ]source|tool\w*|introducing|releasing|release|eval\w*', text) else 'reports',
            'label': '自动采集 · 待复核', 'date': published, 'order': published,
            'source': source['name'], 'source_id': source['id'],
            'description': '原始来源发布的 AI 安全相关资讯；请进入原文核对内容。',
            'url': url, 'language': language, 'direction_ids': directions, 'terms': terms,
            'automated': True, 'verified': False,
            **({'original_categories': categories[:5]} if categories else {}),
        })
    return rows


def fetch_feed(source):
    # curl ships with macOS and GitHub's Ubuntu runner and uses their certificate
    # stores. No shell, credentials, insecure flags, or redirected hosts. A
    # publisher URL change is reviewed explicitly rather than following it.
    if source not in SOURCES or not safe_url(source['url'], source):
        raise ValueError('Unknown feed source')
    with tempfile.TemporaryDirectory(prefix='safety-news-') as directory:
        output = Path(directory) / 'feed.xml'
        subprocess.run([
            'curl', '--fail', '--silent', '--show-error', '--proto', '=https',
            '--connect-timeout', '10', '--max-time', str(TIMEOUT),
            '--max-filesize', str(MAX_BYTES), '--max-redirs', '0',
            '--user-agent', 'AI-Safety-Index-Public-Feed/1.0',
            '--output', str(output), source['url'],
        ], check=True, capture_output=True, timeout=TIMEOUT + 5)
        with output.open('rb') as handle:
            payload = handle.read(MAX_BYTES + 1)
    if len(payload) > MAX_BYTES:
        raise ValueError('Feed exceeds size limit')
    return payload


def merge_records(new, previous):
    unique = {}
    for row in [*new, *previous]:
        unique.setdefault(row['url'], row)
    return sorted(unique.values(), key=lambda row: (row['date'], row['url']), reverse=True)[:MAX_RECORDS]


def collect(sources, previous_info, previous_rows, fetch, timestamp):
    prior = {source['id']: source for source in previous_info.get('sources', [])}
    rows, retained, statuses, failures = [], [], [], []
    for source in sources:
        status = dict(source)
        try:
            payload = fetch(source)
            parsed = parse_feed(payload, source, timestamp[:10])
            rows.extend(parsed)
            status.update(status='ok', last_successful_fetch=timestamp,
                          feed_sha256=sha256(payload).hexdigest(), matched_records=len(parsed))
        except (OSError, ValueError, subprocess.SubprocessError) as error:
            # Keep the last publication dates and last successful retrieval time.
            old = prior.get(source['id'], {})
            status.update({key: old[key] for key in ('last_successful_fetch', 'feed_sha256') if key in old})
            status.update(status='failed', error=type(error).__name__)
            failures.append({'id': source['id'], 'name': source['name'], 'error': type(error).__name__})
            retained.extend(row for row in previous_rows if row.get('source_id') == source['id'])
        statuses.append(status)
    records = merge_records(rows, retained)
    info = {'generated_on': timestamp, 'sources': statuses, 'failed_sources': failures,
            'status': 'stale' if len(failures) == len(sources) else 'partial' if failures else 'current',
            'record_count': len(records), 'max_records': MAX_RECORDS,
            'classification': 'Title/category keyword suggestions; not editorially reviewed',
            'date_policy': 'Publisher publication date in UTC; missing/invalid/future dates excluded',
            'content_policy': 'Original titles and metadata only; no article bodies or abstracts',
            'coverage': 'Two English-language primary-source RSS feeds; not comprehensive'}
    return info, records


def render_js(info, records):
    def encoded(value):
        return json.dumps(value, ensure_ascii=False, indent=2).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    return ('// Generated by tools/update-news.py. Keyword matches require human review.\n'
            + 'const automatedNewsInfo = ' + encoded(info) + ';\n'
            + 'const automatedNewsRecords = ' + encoded(records) + ';\n')


def load_previous(root):
    path = root / 'research-source/news-feed-provenance.json'
    if not path.exists():
        if (root / 'news-feed.js').exists():
            raise ValueError('Existing news data has no provenance; refusing to discard it')
        return {}, []
    data = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(data.get('info'), dict) or not isinstance(data.get('records'), list):
        raise ValueError('Previous provenance is invalid; refusing to discard it')
    return data['info'], data['records']


def write_artifacts(root, info, records):
    path = root / 'research-source/news-feed-provenance.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    artifacts = [(path, json.dumps({'info': info, 'records': records}, ensure_ascii=False, indent=2) + '\n'),
                 (root / 'news-feed.js', render_js(info, records))]
    for target, content in artifacts:
        temporary = target.with_suffix(target.suffix + '.tmp')
        temporary.write_text(content, encoding='utf-8')
        temporary.replace(target)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--source-file', action='append', default=[], metavar='SOURCE_ID=XML_PATH',
                        help='Use a previously fetched XML file for this source (local verification)')
    args = parser.parse_args()
    fixtures = dict(item.split('=', 1) for item in args.source_file)
    if set(fixtures) - {s['id'] for s in SOURCES}:
        parser.error('Unknown source id')
    def fetch(source):
        if source['id'] in fixtures:
            with Path(fixtures[source['id']]).open('rb') as handle:
                return handle.read(MAX_BYTES + 1)
        return fetch_feed(source)
    previous_info, previous_rows = load_previous(args.root)
    timestamp = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    info, records = collect(SOURCES, previous_info, previous_rows, fetch, timestamp)
    write_artifacts(args.root, info, records)
    print(f"News: {len(records)} records; status={info['status']}; failed={len(info['failed_sources'])}")


if __name__ == '__main__':
    main()
