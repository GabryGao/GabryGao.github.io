#!/usr/bin/env python3
"""Collect AI safety signals from primary feeds and public discovery metadata.

Official posts come from publishers' own feeds. AI Safety HOT is used only to discover
additional public reports: published records keep the original publisher name and URL,
never the aggregator URL. Categories, directions and organisations are assigned by this
site's keyword rules. Records are kept for ARCHIVE_DAYS.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from hashlib import sha1, sha256
from html import unescape
import ipaddress
import json
from pathlib import Path
import re
import subprocess
import tempfile
import urllib.parse
import xml.etree.ElementTree as ET
from physical_ai import is_physical_ai

ATOM = '{http://www.w3.org/2005/Atom}'
ARXIV_ROBOTICS_URL = 'https://export.arxiv.org/api/query?' + urllib.parse.urlencode({
    'search_query': 'cat:cs.RO AND (ti:safety OR ti:safe OR ti:attack OR ti:adversarial OR abs:"safety constraints" OR abs:"safety-critical")',
    'sortBy': 'submittedDate', 'sortOrder': 'descending', 'start': 0, 'max_results': 100,
})
SOURCES = [
    {'id': 'openai', 'name': 'OpenAI', 'kind': 'official', 'org': 'openai', 'url': 'https://openai.com/news/rss.xml', 'require_safety': True},
    {'id': 'deepmind', 'name': 'Google DeepMind', 'kind': 'official', 'org': 'google', 'url': 'https://deepmind.google/blog/rss.xml', 'require_safety': True},
    {'id': 'uk-aisi', 'name': 'UK AI Security Institute', 'kind': 'official', 'org': 'uk-aisi', 'url': 'https://www.gov.uk/government/organisations/ai-security-institute.atom', 'require_safety': False},
    {'id': 'metr', 'name': 'METR', 'kind': 'official', 'org': 'metr', 'url': 'https://metr.org/feed.xml', 'require_safety': False},
    {'id': 'nist', 'name': 'NIST', 'kind': 'official', 'org': 'nist', 'url': 'https://www.nist.gov/news-events/news/rss.xml', 'require_safety': True, 'require_ai': True},
    {'id': 'nvidia-robotics', 'name': 'NVIDIA Robotics', 'kind': 'official', 'org': 'nvidia', 'url': 'https://blogs.nvidia.com/blog/category/robotics/feed/', 'require_safety': True, 'require_physical': True},
    {'id': 'arxiv-robotics', 'name': 'arXiv Robotics (preprints)', 'kind': 'research', 'org': None, 'url': ARXIV_ROBOTICS_URL, 'require_safety': True, 'require_physical': True, 'canonical_arxiv': True},
    {'id': 'aiid', 'name': 'AI Incident Database', 'kind': 'incident', 'org': None, 'url': 'https://incidentdatabase.ai/rss.xml', 'require_safety': False},
]
DISCOVERY_SOURCE = {
    'id': 'web-discovery',
    'name': 'Open web sources',
    'kind': 'discovery',
    'url': 'https://aisafetyhot.com/en',
    'api_url': 'https://aisafetyhot.com/api/v1/items',
    'provider': 'AI Safety HOT',
}
ARCHIVE_DAYS = 90
MAX_BYTES = 16 * 1024 * 1024
TIMEOUT = 30
SUMMARY_CHARS = 1600
DISCOVERY_PAGES = 3
DISCOVERY_PAGE_LIMIT = 20
FETCH_WORKERS = len(SOURCES) + 1
AGGREGATOR_HOSTS = {'aisafetyhot.com', 'www.aisafetyhot.com', 'mcp.aisafetyhot.com', 'aihot.news', 'www.aihot.news'}

SAFETY = re.compile(r'\bsafety\b|safeguard|misuse|malicious|threat|red.?team|alignment|jailbreak|preparedness|system card|'
                    r'\brisks?\b|incident|abuse|scheming|decepti|sabotag|guardrail|disrupt|biosecurity|bioweapon|'
                    r'cyber ?(?:attack|threat|security|operations?)|vulnerab|exploit|harmful|oversight|interpretab|frontier', re.I)
# a summary alone only counts when it uses an unambiguous safety term
STRONG = re.compile(r'\bsafety\b|misuse|alignment|red.?team|preparedness|system card|safeguard|jailbreak|scheming', re.I)
# customer stories on official feeds mention security without being safety news
PROMO = re.compile(r'^how \S+|\bhelps? \S+|\bcustomers?\b|case study|\baccelerates?\b|\bpowers?\b|\bbuilds?\b|\bscales?\b|\bcuts?\b', re.I)
AI = re.compile(r'\bAI\b|artificial intelligence|machine learning|language model', re.I)
PHYSICAL_SAFETY = re.compile(r'\bsafety\b|\bsafe\b|\bunsafe\b|\brisks?\b|hazard|collision|crash|'
                             r'robustness|verification|assurance|cybersecurity|vulnerab|attack|安全|风险|碰撞|鲁棒', re.I)
CATEGORIES = [
    ('attack', r'jailbreak|exploit|vulnerab|attack|malicious|threat actor|compromis|breach|malware'),
    ('policy', r'polic|regulat|govern|\blaw\b|legislat|standard|government|minister|treaty|national'),
    ('eval', r'evaluat|benchmark|system card|red.?team|\btest(?:s|ing)?\b'),
    ('defense', r'safeguard|guardrail|monitor|mitigat|defen[cs]e|protect|detect'),
    ('alignment', r'alignment|scheming|decepti|interpretab|reward hack|oversight'),
]
DISCOVERY_CATEGORY_MAP = {
    'ai_news': 'research',
    'alignment': 'alignment',
    'attack': 'attack',
    'defense': 'defense',
    'eval': 'eval',
    'incident': 'incident',
    'industry': 'research',
    'opinion': 'research',
    'policy': 'policy',
    'research': 'research',
    'tip': 'defense',
}
GENERIC_DISCOVERY_CATEGORIES = {'ai_news', 'industry'}
NON_SAFETY_TAG = re.compile(r'非安全|通用\s*AI|general\s+AI', re.I)
DIRECTIONS = [
    ('data-privacy', r'privacy|personal data|data leak|data protection|membership|training data|poison|backdoor|unlearn|deepfake|surveillance'),
    ('physical-ai', r'robot|embodied|autonomous vehicle|self-driving|drone|physical ai|tesla|waymo'),
    ('ai-x-science', r'biosecurity|biolog|medical|health|clinical|chemical|chemistry|drug|scientific|financ'),
    ('agent-software', r'\bagents?\b|agentic|tool use|\bmcp\b|prompt injection|software|code|cyber|vulnerab|malware|browser|computer use|supply chain|hack'),
    ('human-societal', r'polic|regulat|govern|\blaw\b|lawsuit|sues?\b|election|misinformation|disinformation|scam|fraud|child|teen|suicid|mental|labou?r|military|societ|discriminat|bias'),
    ('foundation-model', r'alignment|jailbreak|refusal|reward hack|hallucinat|interpretab|benchmark|evaluat|\bllm\b|language model|chatbot|chatgpt|claude|gemini|grok|model'),
]
ORGS = [
    ('openai', r'openai|chatgpt|\bgpt-?\d|codex|sora'),
    ('anthropic', r'anthropic|\bclaude\b'),
    ('google', r'google|deepmind|gemini'),
    ('meta', r'\bmeta\b|llama|facebook|instagram'),
    ('xai', r'\bxai\b|\bgrok\b'),
    ('microsoft', r'microsoft|copilot|azure'),
    ('deepseek', r'deepseek'),
    ('mistral', r'mistral'),
    ('nvidia', r'nvidia'),
    ('uk-aisi', r'ai security institute|ai safety institute|\baisi\b'),
    ('metr', r'\bmetr\b'),
    ('nist', r'\bnist\b'),
]


def plain(value, limit):
    text = re.sub(r'<[^>]+>', ' ', unescape(value if isinstance(value, str) else ''))
    text = re.sub(r'\s+', ' ', text).strip()
    return text if len(text) <= limit else text[:limit - 1].rstrip() + '…'


def safe_url(value):
    if not isinstance(value, str) or re.search(r'[\x00-\x20\x7f<>"\\]', value):
        return None
    try:
        parsed = urllib.parse.urlsplit(value)
        if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password:
            return None
        if parsed.port not in (None, 443):
            return None
        host = parsed.hostname.lower().rstrip('.')
        if host in {'localhost', 'localhost.localdomain'} or host.endswith('.local'):
            return None
        try:
            if not ipaddress.ip_address(host).is_global:
                return None
        except ValueError:
            pass
    except ValueError:
        return None
    query = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    query = [(key, item) for key, item in query
             if not key.lower().startswith('utm_') and key.lower() not in ('fbclid', 'gclid')]
    return urllib.parse.urlunsplit(('https', host, parsed.path or '/', urllib.parse.urlencode(query), ''))


def parse_date(value):
    value = (value or '').strip()
    if not value:
        return None
    try:
        when = parsedate_to_datetime(value) if not re.match(r'^\d{4}-', value) else datetime.fromisoformat(value.replace('Z', '+00:00'))
    except (TypeError, ValueError):
        return None
    if when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)
    return when.astimezone(timezone.utc).date()


def classify(source, text):
    if source['kind'] == 'incident':
        return 'incident'
    if source['kind'] == 'research':
        return 'research'
    return next((name for name, pattern in CATEGORIES if re.search(pattern, text, re.I)), 'research')


def matches(rules, text):
    return [name for name, pattern in rules
            if (is_physical_ai(text) if name == 'physical-ai' else re.search(pattern, text, re.I))]


def refresh_physical_direction(row):
    """Apply corrected physical-AI rules to retained records as well as fresh feeds."""
    text = str(row.get('title', '')) + ' ' + str(row.get('description', ''))
    directions = list(row.get('direction_ids') or [])
    physical = is_physical_ai(text)
    directions = [d for d in directions if d != 'physical-ai']
    if physical:
        directions.insert(0, 'physical-ai')
        foundation = next(pattern for name, pattern in DIRECTIONS if name == 'foundation-model')
        if not re.search(foundation, text, re.I):
            directions = [d for d in directions if d != 'foundation-model']
    return {**row, 'direction_ids': directions or ['foundation-model']}


def parse_feed(payload, source, today):
    """Return the feed's records that pass this site's rules; raise on a feed that is not RSS or Atom."""
    if len(payload) > MAX_BYTES:
        raise ValueError('Feed exceeds size limit')
    root = ET.fromstring(payload)
    items = root.findall('.//item') or root.findall(ATOM + 'entry')
    if root.tag not in ('rss', ATOM + 'feed') and not items:
        raise ValueError('Not an RSS or Atom feed')
    records = []
    for item in items:
        title = plain(item.findtext('title') or item.findtext(ATOM + 'title'), 300)
        link = item.findtext('link') or ''
        if not link:
            node = item.find(ATOM + 'link')
            link = node.get('href', '') if node is not None else ''
        if source.get('canonical_arxiv'):
            match = re.fullmatch(r'https?://arxiv\.org/abs/(\d{4}\.\d{4,5})(?:v\d+)?', link)
            if not match:
                continue
            link = 'https://arxiv.org/abs/' + match.group(1)
        url = safe_url(link)
        when = parse_date(item.findtext('pubDate') or item.findtext(ATOM + 'published') or item.findtext(ATOM + 'updated'))
        summary = plain(item.findtext('description') or item.findtext(ATOM + 'summary'), SUMMARY_CHARS)
        if not title or not url or not when or when > today:
            continue
        text = title + ' ' + summary
        if source.get('require_physical') and not (is_physical_ai(text) and PHYSICAL_SAFETY.search(text)):
            continue
        if source.get('require_safety') and not source.get('require_physical') and not (SAFETY.search(title) or STRONG.search(summary)):
            continue
        if source['kind'] == 'official' and PROMO.search(title) and not (
                source.get('require_physical') and PHYSICAL_SAFETY.search(title)):
            continue
        if source.get('require_ai') and not AI.search(text):
            continue
        orgs = matches(ORGS, text)
        if source.get('org') and source['org'] not in orgs:
            orgs.insert(0, source['org'])
        records.append({
            'id': source['id'] + '-' + sha1(url.encode()).hexdigest()[:12],
            'title': title,
            'date': when.isoformat(),
            'source': source['name'],
            'source_id': source['id'],
            'kind': source['kind'],
            'category': classify(source, text),
            'url': url,
            'description': summary,
            # In robotics, "policy", "model" and "multi-agent" usually describe controllers,
            # not public policy, foundation models or software agents.
            'direction_ids': ['physical-ai'] if source.get('require_physical') else (matches(DIRECTIONS, text) or ['foundation-model']),
            'orgs': orgs,
        })
    return records


def first_date(today, *values):
    for value in values:
        when = parse_date(value)
        if when and when <= today:
            return when
    return None


def discovery_date(item, today):
    for value in (item.get('publishedAt'), item.get('publishedDate')):
        if not isinstance(value, str) or not value.strip():
            continue
        when = parse_date(value)
        if when:
            return when if when <= today else None
    return first_date(today, item.get('discoveredAt'))


def discovery_source_name(item, url):
    source = item.get('source') if isinstance(item.get('source'), dict) else {}
    name = plain(source.get('name') if isinstance(source.get('name'), str) else '', 120)
    if name and not re.search(r'AI\s*Safety\s*HOT|aisafetyhot|aihot', name, re.I):
        return name
    return (urllib.parse.urlsplit(url).hostname or '').removeprefix('www.')


def discovery_source_id(url):
    host = (urllib.parse.urlsplit(url).hostname or '').removeprefix('www.')
    slug = re.sub(r'[^a-z0-9]+', '-', host.lower()).strip('-')
    return 'web-' + (slug[:48] or sha1(url.encode()).hexdigest()[:12])


def parse_discovery_page(payload, today):
    if len(payload) > MAX_BYTES:
        raise ValueError('Discovery response exceeds size limit')
    try:
        data = json.loads(payload)
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise ValueError('Discovery response is not valid JSON') from error
    if not isinstance(data, dict) or data.get('schemaVersion') != 1:
        raise ValueError('Unsupported discovery schema')
    items = data.get('items')
    page = data.get('page')
    if not isinstance(items, list) or not isinstance(page, dict):
        raise ValueError('Discovery response shape is invalid')
    records = []
    for item in items:
        if not isinstance(item, dict) or item.get('kind') == 'paper':
            continue
        links = item.get('links') if isinstance(item.get('links'), dict) else {}
        url = safe_url(links.get('original'))
        host = (urllib.parse.urlsplit(url).hostname or '').lower() if url else ''
        if not url or host in AGGREGATOR_HOSTS:
            continue
        title = plain(item.get('title') or item.get('originalTitle'), 300)
        summary = plain(item.get('summary'), SUMMARY_CHARS)
        when = discovery_date(item, today)
        category_raw = plain(item.get('category'), 50).lower() or 'research'
        category = DISCOVERY_CATEGORY_MAP.get(category_raw, 'research')
        tags = [plain(tag, 80) for tag in item.get('tags', []) if isinstance(tag, str) and plain(tag, 80)]
        text = ' '.join([title, summary, *tags])
        if not title or not when:
            continue
        if category_raw in GENERIC_DISCOVERY_CATEGORIES and (NON_SAFETY_TAG.search(text) or not SAFETY.search(text)):
            continue
        records.append({
            'id': 'web-' + sha1(url.encode()).hexdigest()[:12],
            'title': title,
            'date': when.isoformat(),
            'source': discovery_source_name(item, url),
            'source_id': discovery_source_id(url),
            'kind': 'incident' if category == 'incident' else 'discovered',
            'category': category,
            'url': url,
            'description': summary,
            'direction_ids': matches(DIRECTIONS, text) or ['foundation-model'],
            'orgs': matches(ORGS, text),
        })
    next_cursor = page.get('nextCursor') if page.get('hasMore') is True else None
    if next_cursor is not None and (not isinstance(next_cursor, str) or len(next_cursor) > 1000):
        raise ValueError('Invalid discovery cursor')
    return records, next_cursor


def collect_discovery(fetch, timestamp):
    cursor = None
    payloads = []
    records = []
    seen_cursors = set()
    for _ in range(DISCOVERY_PAGES):
        query = {'mode': 'selected', 'window': '7d', 'lang': 'en', 'limit': DISCOVERY_PAGE_LIMIT}
        if cursor:
            query['cursor'] = cursor
        payload = fetch(DISCOVERY_SOURCE['api_url'] + '?' + urllib.parse.urlencode(query))
        page_records, next_cursor = parse_discovery_page(payload, date.fromisoformat(timestamp[:10]))
        payloads.append(payload)
        records.extend(page_records)
        if not next_cursor:
            break
        if next_cursor in seen_cursors:
            raise ValueError('Discovery cursor repeated')
        seen_cursors.add(next_cursor)
        cursor = next_cursor
    unique = {}
    for record in records:
        unique.setdefault(record['url'], record)
    if not unique:
        raise ValueError('Discovery API returned no usable records')
    return list(unique.values()), len(payloads), sha256(b''.join(payloads)).hexdigest()


def record_key(row):
    url = safe_url(row.get('url')) if isinstance(row, dict) else None
    return 'url:' + url if url else 'id:' + str(row.get('id', ''))


def is_discovery_row(row):
    return row.get('kind') == 'discovered' or str(row.get('source_id', '')).startswith('web-')


def fetch_url(url):
    with tempfile.TemporaryDirectory(prefix='ai-safety-signals-') as directory:
        output = Path(directory) / 'response'
        subprocess.run([
            'curl', '--fail', '--silent', '--show-error', '--location', '--compressed', '--proto', '=https', '--proto-redir', '=https',
            '--connect-timeout', '10', '--max-time', str(TIMEOUT), '--max-filesize', str(MAX_BYTES), '--max-redirs', '3',
            '--user-agent', 'AI-Safety-Index/2.0 (+https://gabrygao.github.io/ai-safety-index/)',
            '--output', str(output), url,
        ], check=True, capture_output=True, timeout=TIMEOUT + 5)
        payload = output.read_bytes()
    if len(payload) > MAX_BYTES:
        raise ValueError('Response exceeds size limit')
    return payload


def load_previous(root):
    path = root / 'research-source/signals-provenance.json'
    if not path.exists():
        return {}, []
    data = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(data.get('info'), dict) or not isinstance(data.get('records'), list):
        raise ValueError('Previous signals provenance is invalid; refusing to discard it')
    return data['info'], data['records']


def collect_primary_source(source, old_sources, fetch, today, timestamp):
    try:
        payload = fetch(source['url'])
        rows = parse_feed(payload, source, today)
        status = {'id': source['id'], 'name': source['name'], 'kind': source['kind'], 'url': source['url'],
                  'status': 'ok', 'last_successful_fetch': timestamp, 'records': len(rows),
                  'response_sha256': sha256(payload).hexdigest()}
        if source.get('canonical_arxiv'):
            status.update(candidate_limit=100, review_status='automatic, not peer reviewed',
                          selection='Newest cs.RO candidates matching the query, then physical-AI and safety filters')
        return rows, status, None
    except (OSError, ValueError, ET.ParseError, subprocess.SubprocessError) as error:
        previous = old_sources.get(source['id'], {})
        status = {'id': source['id'], 'name': source['name'], 'kind': source['kind'], 'url': source['url'],
                  'status': 'failed', 'error': type(error).__name__,
                  'last_successful_fetch': previous.get('last_successful_fetch')}
        return [], status, source['id']


def collect_discovery_source(old_sources, fetch, timestamp):
    try:
        rows, pages, digest = collect_discovery(fetch, timestamp)
        status = {**DISCOVERY_SOURCE, 'status': 'ok', 'last_successful_fetch': timestamp,
                  'records': len(rows), 'pages_fetched': pages, 'response_sha256': digest}
        return rows, status, None
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        previous = old_sources.get(DISCOVERY_SOURCE['id'], {})
        status = {**DISCOVERY_SOURCE, 'status': 'failed', 'error': type(error).__name__,
                  'last_successful_fetch': previous.get('last_successful_fetch')}
        return [], status, DISCOVERY_SOURCE['id']


def collect(previous_info, previous_rows, fetch, timestamp):
    today = date.fromisoformat(timestamp[:10])
    cutoff = (today - timedelta(days=ARCHIVE_DAYS)).isoformat()
    old_sources = {item.get('id'): item for item in previous_info.get('sources', [])}
    fresh_primary, fresh_discovery, sources, failed = [], [], [], []
    with ThreadPoolExecutor(max_workers=FETCH_WORKERS, thread_name_prefix='signal-fetch') as executor:
        primary_jobs = [executor.submit(collect_primary_source, source, old_sources, fetch, today, timestamp)
                        for source in SOURCES]
        discovery_job = executor.submit(collect_discovery_source, old_sources, fetch, timestamp)
        for job in primary_jobs:
            rows, status, failed_id = job.result()
            fresh_primary.extend(rows)
            sources.append(status)
            if failed_id:
                failed.append(failed_id)
        fresh_discovery, status, failed_id = discovery_job.result()
        sources.append(status)
        if failed_id:
            failed.append(failed_id)
    if len(failed) == len(SOURCES) + 1 and not previous_rows:
        raise ValueError('Every source failed and there is no previous snapshot')
    merged = {}
    previous_primary = [row for row in previous_rows if isinstance(row, dict) and not is_discovery_row(row)]
    previous_discovery = [row for row in previous_rows if isinstance(row, dict) and is_discovery_row(row)]
    # Direct publisher records win over discovery records for the same original URL.
    for row in [*fresh_primary, *previous_primary, *fresh_discovery, *previous_discovery]:
        if row.get('id') and str(row.get('date', '')) >= cutoff:
            merged.setdefault(record_key(row), refresh_physical_direction(row))
    records = sorted(merged.values(), key=lambda row: (row['date'], row['id']), reverse=True)
    info = {
        'generated_on': timestamp,
        'status': 'current' if not failed else ('stale' if len(failed) == len(SOURCES) + 1 else 'partial'),
        'sources': sources,
        'record_count': len(records),
        'archive_days': ARCHIVE_DAYS,
        'policy': ('Titles, dates, original links and short publisher summaries from primary feeds and public discovery metadata; '
                   'discovery-provider links are never published; categories, directions and organisations are assigned by this site\'s keyword rules'),
    }
    return info, records


def write_artifacts(root, info, records):
    def encoded(value):
        return json.dumps(value, ensure_ascii=False, indent=1).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    path = root / 'research-source/signals-provenance.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    artifacts = [
        (path, json.dumps({'info': info, 'records': records}, ensure_ascii=False, indent=1) + '\n'),
        (root / 'signals-feed.js', '// Generated by tools/update-signals.py from primary feeds and original-link discovery metadata.\n'
         + 'const siteSignalsInfo = ' + encoded(info) + ';\n'
         + 'const siteSignals = ' + encoded(records) + ';\n'),
    ]
    for target, content in artifacts:
        temporary = target.with_suffix(target.suffix + '.tmp')
        temporary.write_text(content, encoding='utf-8')
        temporary.replace(target)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    previous_info, previous_rows = load_previous(args.root)
    timestamp = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    info, records = collect(previous_info, previous_rows, fetch_url, timestamp)
    write_artifacts(args.root, info, records)
    failed = [s['id'] for s in info['sources'] if s['status'] != 'ok']
    print(f"Signals: {len(records)} records; status={info['status']}; failed={failed}")


if __name__ == '__main__':
    main()
