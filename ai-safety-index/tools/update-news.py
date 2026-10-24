#!/usr/bin/env python3
"""Refresh the public AI Safety HOT snapshot used by the static portal."""
import argparse
from datetime import date, datetime, timezone
from hashlib import sha256
from html import unescape
from html.parser import HTMLParser
import ipaddress
import json
from pathlib import Path
import re
import subprocess
import tempfile
import urllib.parse

API_URL = 'https://aisafetyhot.com/api/v1/items'
HOME_URL = 'https://aisafetyhot.com/en'
SOURCE = {
    'id': 'aisafetyhot',
    'name': 'AI Safety HOT',
    'url': HOME_URL,
    'api_url': API_URL,
    'hosts': ['aisafetyhot.com'],
    'language': 'en',
}
MAX_BYTES = 2 * 1024 * 1024
MAX_PAGES = 5
PAGE_LIMIT = 20
MAX_ARTICLES = MAX_PAGES * PAGE_LIMIT
MAX_PAPER_PICKS = 5
MAX_RECORDS = MAX_ARTICLES + MAX_PAPER_PICKS
FOCUS_LOCALIZATION_LIMIT = 6
LOCALIZATION_LANGUAGE = 'zh'
TIMEOUT = 20

CATEGORY_LABELS = {
    'ai_news': 'AI 资讯',
    'alignment': '对齐',
    'attack': '攻击与越狱',
    'defense': '防御与护栏',
    'eval': '评测',
    'incident': '安全事件',
    'industry': '产业动态',
    'policy': '政策与治理',
    'research': '研究进展',
    'tip': '安全实践',
}
ANALYSIS_CATEGORIES = {'alignment', 'defense', 'eval', 'opinion', 'policy', 'research', 'tip'}
KEYWORD_DIRECTIONS = [
    ('data-privacy', r'privacy|personal data|data leak|data protection|membership|training data|poison|backdoor|unlearn'),
    ('physical-ai', r'robot|robotic|embodied|autonomous vehicle|self-driving|drone|physical ai'),
    ('ai-x-science', r'biosecurity|biolog|medical|healthcare|clinical|chemical|chemistry|drug discovery|scientific'),
    ('agent-software', r'\bagents?\b|agentic|tool use|\bmcp\b|prompt injection|software|code execution|cyber|vulnerabilit|malware|browser|computer use|supply chain'),
    ('human-societal', r'\bpolicy\b|regulat|governance|\blaw\b|\belections?\b|misinformation|disinformation|scam|fraud|child|teen|labor|surveillance|military|societ'),
    ('foundation-model', r'alignment|jailbreak|refusal|reward hack|hallucinat|interpretability|benchmark|evaluat|\bllm\b|language model|foundation model|reasoning|model safety'),
]
CATEGORY_DIRECTIONS = {
    'ai_news': ['human-societal'],
    'alignment': ['foundation-model'],
    'attack': ['foundation-model', 'agent-software'],
    'defense': ['foundation-model'],
    'eval': ['foundation-model'],
    'incident': ['agent-software', 'human-societal'],
    'industry': ['human-societal'],
    'policy': ['human-societal'],
    'research': ['foundation-model'],
    'tip': ['agent-software'],
}


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def plain_text(value, limit=500):
    parser = PlainText()
    parser.feed(unescape(value or ''))
    return re.sub(r'\s+', ' ', ''.join(parser.parts)).strip()[:limit]


def safe_url(value, required_host=None):
    if not isinstance(value, str) or re.search(r'[\x00-\x20\x7f<>"\\]', value):
        return None
    try:
        parsed = urllib.parse.urlsplit(value)
        if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password:
            return None
        if parsed.port not in (None, 443):
            return None
        host = parsed.hostname.lower().rstrip('.')
        if required_host and host != required_host:
            return None
        if host in {'localhost', 'localhost.localdomain'} or host.endswith('.local'):
            return None
        try:
            address = ipaddress.ip_address(host)
            if not address.is_global:
                return None
        except ValueError:
            pass
    except ValueError:
        return None
    query = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    query = [(key, item) for key, item in query
             if not key.lower().startswith('utm_') and key.lower() not in ('fbclid', 'gclid')]
    return urllib.parse.urlunsplit(('https', host, parsed.path or '/', urllib.parse.urlencode(query), ''))


def source_date(*values, today):
    for value in values:
        if not isinstance(value, str) or not value.strip():
            continue
        try:
            parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
            if parsed.tzinfo is None:
                continue
            result = parsed.astimezone(timezone.utc).date()
            if date(2000, 1, 1) <= result <= date.fromisoformat(today):
                return result.isoformat()
        except (ValueError, TypeError, OverflowError):
            continue
    return None


def directions_for(title, summary='', tags=None, category=''):
    text = ' '.join([title or '', summary or '', category or '', *(tags or [])]).lower()
    directions = [direction for direction, pattern in KEYWORD_DIRECTIONS
                  if re.search(pattern, text, re.I)]
    for direction in CATEGORY_DIRECTIONS.get(category, ['foundation-model']):
        if direction not in directions:
            directions.append(direction)
    return directions[:3]


def article_record(item, today, language='en'):
    if not isinstance(item, dict) or not isinstance(item.get('id'), str):
        return None
    title = plain_text(item.get('title') or item.get('originalTitle'), 300)
    summary = plain_text(item.get('summary'), 240)
    links = item.get('links') if isinstance(item.get('links'), dict) else {}
    aihot_url = safe_url(links.get('aihot'), 'aisafetyhot.com')
    original_url = safe_url(links.get('original'))
    published = source_date(item.get('publishedAt'), item.get('discoveredAt'), today=today)
    if not title or not aihot_url or not published:
        return None
    category = plain_text(item.get('category'), 50).lower() or 'research'
    tags = [plain_text(tag, 80) for tag in item.get('tags', []) if plain_text(tag, 80)][:12]
    source = item.get('source') if isinstance(item.get('source'), dict) else {}
    source_name = plain_text(source.get('name'), 120) or 'AI Safety HOT'
    label = CATEGORY_LABELS.get(category, category.replace('_', ' ').title())
    return {
        'id': 'aihot-' + item['id'],
        'title': title,
        'type': 'reports',
        'label': 'AI Safety HOT · ' + label,
        'date': published,
        'order': published,
        'source': source_name,
        'source_id': SOURCE['id'],
        'description': summary or 'AI Safety HOT 公开条目；请进入条目页和原始来源核对内容。',
        'url': aihot_url,
        'original_url': original_url,
        'language': language,
        'direction_ids': directions_for(title, summary, tags, category),
        'terms': [label, *tags],
        'automated': True,
        'verified': False,
        'content_kind': 'analysis' if category in ANALYSIS_CATEGORIES else 'latest',
        'aihot_category': category,
        'aihot_score': item.get('score') if isinstance(item.get('score'), (int, float)) else None,
        'aihot_selected': item.get('selected') is True,
    }


def paper_record(item, today, language='en'):
    if not isinstance(item, dict) or not isinstance(item.get('id'), str):
        return None
    title = plain_text(item.get('title') or item.get('originalTitle'), 300)
    links = item.get('links') if isinstance(item.get('links'), dict) else {}
    aihot_url = safe_url(links.get('aihot'), 'aisafetyhot.com')
    original_url = safe_url(links.get('original'))
    published = source_date(item.get('publishedAt'), item.get('publishedDate'), today=today)
    if not title or not aihot_url or not published:
        return None
    return {
        'id': 'aihot-paper-' + item['id'],
        'title': title,
        'type': 'projects',
        'label': 'AI Safety HOT · 精选论文',
        'date': published,
        'order': published,
        'source': 'AI Safety HOT',
        'source_id': SOURCE['id'],
        'description': 'AI Safety HOT 近期精选论文；前往条目页查看内容，并通过原始来源核对摘要与版本。',
        'url': aihot_url,
        'original_url': original_url,
        'language': language,
        'direction_ids': directions_for(title),
        'terms': ['精选论文', 'AI Safety HOT'],
        'automated': True,
        'verified': False,
        'content_kind': 'share',
        'paper_pick': True,
    }


def parse_page(payload, today, language='en'):
    if len(payload) > MAX_BYTES:
        raise ValueError('API response exceeds size limit')
    try:
        data = json.loads(payload)
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise ValueError('API response is not valid JSON') from error
    if not isinstance(data, dict) or data.get('schemaVersion') != 1:
        raise ValueError('Unsupported API schema')
    items = data.get('items')
    papers = data.get('paperPicks', [])
    page = data.get('page')
    if not isinstance(items, list) or not isinstance(papers, list) or not isinstance(page, dict):
        raise ValueError('API response shape is invalid')
    articles = [record for item in items if (record := article_record(item, today, language))]
    paper_records = [record for item in papers if (record := paper_record(item, today, language))]
    next_cursor = page.get('nextCursor') if page.get('hasMore') is True else None
    if next_cursor is not None and (not isinstance(next_cursor, str) or len(next_cursor) > 1000):
        raise ValueError('Invalid pagination cursor')
    return articles, paper_records, next_cursor, data.get('access')


def fetch_url(url):
    with tempfile.TemporaryDirectory(prefix='ai-safety-hot-') as directory:
        output = Path(directory) / 'response.json'
        subprocess.run([
            'curl', '--fail', '--silent', '--show-error', '--proto', '=https',
            '--connect-timeout', '10', '--max-time', str(TIMEOUT),
            '--max-filesize', str(MAX_BYTES), '--max-redirs', '0',
            '--user-agent', 'AI-Safety-Index-Public-Feed/2.0',
            '--output', str(output), url,
        ], check=True, capture_output=True, timeout=TIMEOUT + 5)
        with output.open('rb') as handle:
            payload = handle.read(MAX_BYTES + 1)
    if len(payload) > MAX_BYTES:
        raise ValueError('API response exceeds size limit')
    return payload


def collect_pages(fetch, timestamp, language='en'):
    cursor = None
    pages = []
    articles = []
    papers = []
    access = None
    seen_cursors = set()
    for _ in range(MAX_PAGES):
        query = {'mode': 'selected', 'window': '7d', 'lang': language, 'limit': PAGE_LIMIT}
        if cursor:
            query['cursor'] = cursor
        url = API_URL + '?' + urllib.parse.urlencode(query)
        payload = fetch(url)
        page_articles, page_papers, next_cursor, page_access = parse_page(
            payload, timestamp[:10], language)
        pages.append(payload)
        articles.extend(page_articles)
        papers.extend(page_papers)
        access = access or page_access
        if not next_cursor:
            break
        if next_cursor in seen_cursors:
            raise ValueError('Pagination cursor repeated')
        seen_cursors.add(next_cursor)
        cursor = next_cursor
    unique = {}
    for record in [*articles[:MAX_ARTICLES], *papers[:MAX_PAPER_PICKS]]:
        unique.setdefault(record['id'], record)
    records = sorted(unique.values(), key=lambda row: (row['order'], row['id']), reverse=True)
    if not records:
        raise ValueError('API returned no usable records')
    digest = sha256(b''.join(pages)).hexdigest()
    return records, len(pages), len(articles), len({row['id'] for row in papers}), digest, access


def focus_records(records):
    articles = [row for row in records if not row.get('paper_pick')]
    if not articles:
        return []
    latest_date = articles[0]['date']

    def score(row):
        value = row.get('aihot_score')
        return value if isinstance(value, (int, float)) else 0

    latest = sorted((row for row in articles if row['date'] == latest_date),
                    key=score, reverse=True)
    older = sorted((row for row in articles if row['date'] != latest_date),
                   key=score, reverse=True)
    return [*latest, *older][:FOCUS_LOCALIZATION_LIMIT]


def parse_localized_detail(payload, expected_id):
    if len(payload) > MAX_BYTES:
        raise ValueError('Localized API response exceeds size limit')
    try:
        data = json.loads(payload)
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise ValueError('Localized API response is not valid JSON') from error
    if not isinstance(data, dict):
        raise ValueError('Localized API response shape is invalid')
    item = data.get('item')
    if data.get('schemaVersion') != 1 or not isinstance(item, dict) or item.get('id') != expected_id:
        raise ValueError('Localized API response shape is invalid')
    title = plain_text(item.get('title') or item.get('originalTitle'), 300)
    summary = plain_text(item.get('summary'), 240)
    if not title:
        raise ValueError('Localized API response has no title')
    result = {'title_zh': title}
    if summary:
        result['description_zh'] = summary
    return result


def add_focus_localizations(records, previous_rows, fetch):
    previous = {row.get('id'): row for row in previous_rows if isinstance(row, dict)}
    for row in records:
        old = previous.get(row['id'], {})
        for field in ('title_zh', 'description_zh'):
            if isinstance(old.get(field), str) and old[field]:
                row[field] = old[field]

    payloads = []
    localized = 0
    focus = focus_records(records)
    for row in focus:
        raw_id = row['id'].removeprefix('aihot-')
        url = API_URL + '/' + urllib.parse.quote(raw_id, safe='') + '?' + urllib.parse.urlencode({
            'lang': LOCALIZATION_LANGUAGE,
        })
        try:
            payload = fetch(url)
            row.update(parse_localized_detail(payload, raw_id))
        except (OSError, ValueError, subprocess.SubprocessError):
            continue
        payloads.append(payload)
        localized += 1
    digest = sha256(b''.join(payloads)).hexdigest() if payloads else None
    return localized, len(focus), digest


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


def collect(previous_info, previous_rows, fetch, timestamp):
    previous_source = next((item for item in previous_info.get('sources', [])
                            if item.get('id') == SOURCE['id']), {})
    try:
        records, pages, articles, papers, digest, access = collect_pages(fetch, timestamp)
        localized, localization_requested, localization_digest = add_focus_localizations(
            records, previous_rows, fetch)
        source = dict(SOURCE, status='ok', last_successful_fetch=timestamp,
                      response_sha256=digest, pages_fetched=pages,
                      article_records=articles, paper_picks=papers,
                      matched_records=len(records),
                      localization_language=LOCALIZATION_LANGUAGE,
                      localization_status=('ok' if localized == localization_requested else 'partial'),
                      localized_focus_records=localized,
                      localization_requested=localization_requested,
                      localization_response_sha256=localization_digest)
        failures = []
        status = 'current'
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        if not previous_rows:
            raise
        records = previous_rows
        source = dict(SOURCE, **{key: previous_source[key]
                                for key in ('last_successful_fetch', 'response_sha256',
                                            'pages_fetched', 'article_records', 'paper_picks',
                                            'matched_records', 'localization_language',
                                            'localization_status', 'localized_focus_records',
                                            'localization_requested',
                                            'localization_response_sha256') if key in previous_source},
                      status='failed', error=type(error).__name__)
        failures = [{'id': SOURCE['id'], 'name': SOURCE['name'], 'error': type(error).__name__}]
        status = 'stale'
        access = previous_info.get('access')
    info = {
        'generated_on': timestamp,
        'sources': [source],
        'failed_sources': failures,
        'status': status,
        'record_count': len(records),
        'max_records': MAX_RECORDS,
        'classification': 'AI Safety HOT categories drive content sections; portal directions are keyword suggestions',
        'date_policy': 'Publisher publication date in UTC, falling back to discovery date; invalid or future dates excluded',
        'content_policy': 'Public AI Safety HOT titles, short summaries, metadata and paper links; official Chinese localization for homepage focus records; no full article copying',
        'coverage': 'Recent selected/hot AI safety news and public paper picks from AI Safety HOT',
        'attribution': {'name': 'AI Safety HOT', 'url': HOME_URL},
        'access': access,
    }
    return info, records


def render_js(info, records):
    def encoded(value):
        return json.dumps(value, ensure_ascii=False, indent=2).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    return ('// Generated by tools/update-news.py from the AI Safety HOT public API.\n'
            + 'const automatedNewsInfo = ' + encoded(info) + ';\n'
            + 'const automatedNewsRecords = ' + encoded(records) + ';\n')


def write_artifacts(root, info, records):
    path = root / 'research-source/news-feed-provenance.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    artifacts = [
        (path, json.dumps({'info': info, 'records': records}, ensure_ascii=False, indent=2) + '\n'),
        (root / 'news-feed.js', render_js(info, records)),
    ]
    for target, content in artifacts:
        temporary = target.with_suffix(target.suffix + '.tmp')
        temporary.write_text(content, encoding='utf-8')
        temporary.replace(target)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--source-file', type=Path,
                        help='Use one saved API response instead of network access')
    args = parser.parse_args()
    if args.source_file:
        payload = args.source_file.read_bytes()
        fetch = lambda _url: payload
    else:
        fetch = fetch_url
    previous_info, previous_rows = load_previous(args.root)
    timestamp = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    info, records = collect(previous_info, previous_rows, fetch, timestamp)
    write_artifacts(args.root, info, records)
    print(f"AI Safety HOT: {len(records)} records; status={info['status']}; failed={len(info['failed_sources'])}")


if __name__ == '__main__':
    main()
