#!/usr/bin/env python3
"""Collect AI safety signals for the board from primary public feeds.

Official posts come from the publishers' own feeds and are kept only when this site's
safety rules match; incidents come from the AI Incident Database feed, which links to the
original reports. Categories, directions and organisations are assigned by this site's
keyword rules, not taken from any aggregator. Records are kept for ARCHIVE_DAYS.
"""
import argparse
from datetime import date, datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from hashlib import sha1, sha256
from html import unescape
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ATOM = '{http://www.w3.org/2005/Atom}'
SOURCES = [
    {'id': 'openai', 'name': 'OpenAI', 'kind': 'official', 'org': 'openai', 'url': 'https://openai.com/news/rss.xml', 'require_safety': True},
    {'id': 'deepmind', 'name': 'Google DeepMind', 'kind': 'official', 'org': 'google', 'url': 'https://deepmind.google/blog/rss.xml', 'require_safety': True},
    {'id': 'uk-aisi', 'name': 'UK AI Security Institute', 'kind': 'official', 'org': 'uk-aisi', 'url': 'https://www.gov.uk/government/organisations/ai-security-institute.atom', 'require_safety': False},
    {'id': 'metr', 'name': 'METR', 'kind': 'official', 'org': 'metr', 'url': 'https://metr.org/feed.xml', 'require_safety': False},
    {'id': 'nist', 'name': 'NIST', 'kind': 'official', 'org': 'nist', 'url': 'https://www.nist.gov/news-events/news/rss.xml', 'require_safety': True, 'require_ai': True},
    {'id': 'aiid', 'name': 'AI Incident Database', 'kind': 'incident', 'org': None, 'url': 'https://incidentdatabase.ai/rss.xml', 'require_safety': False},
]
ARCHIVE_DAYS = 90
MAX_BYTES = 4 * 1024 * 1024
TIMEOUT = 25
SUMMARY_CHARS = 200

SAFETY = re.compile(r'\bsafety\b|safeguard|misuse|malicious|threat|red.?team|alignment|jailbreak|preparedness|system card|'
                    r'\brisks?\b|incident|abuse|scheming|decepti|sabotag|guardrail|disrupt|biosecurity|bioweapon|'
                    r'cyber ?(?:attack|threat|security|operations?)|vulnerab|exploit|harmful|oversight|interpretab|frontier', re.I)
# a summary alone only counts when it uses an unambiguous safety term
STRONG = re.compile(r'\bsafety\b|misuse|alignment|red.?team|preparedness|system card|safeguard|jailbreak|scheming', re.I)
# customer stories on official feeds mention security without being safety news
PROMO = re.compile(r'^how \S+|\bhelps? \S+|\bcustomers?\b|case study|\baccelerates?\b|\bpowers?\b|\bbuilds?\b|\bscales?\b|\bcuts?\b', re.I)
AI = re.compile(r'\bAI\b|artificial intelligence|machine learning|language model', re.I)
CATEGORIES = [
    ('attack', r'jailbreak|exploit|vulnerab|attack|malicious|threat actor|compromis|breach|malware'),
    ('policy', r'polic|regulat|govern|\blaw\b|legislat|standard|government|minister|treaty|national'),
    ('eval', r'evaluat|benchmark|system card|red.?team|\btest(?:s|ing)?\b'),
    ('defense', r'safeguard|guardrail|monitor|mitigat|defen[cs]e|protect|detect'),
    ('alignment', r'alignment|scheming|decepti|interpretab|reward hack|oversight'),
]
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
    text = re.sub(r'<[^>]+>', ' ', unescape(value or ''))
    text = re.sub(r'\s+', ' ', text).strip()
    return text if len(text) <= limit else text[:limit - 1].rstrip() + '…'


def safe_url(value):
    parsed = urllib.parse.urlparse((value or '').strip())
    return parsed.geturl() if parsed.scheme == 'https' and parsed.netloc else None


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
    return next((name for name, pattern in CATEGORIES if re.search(pattern, text, re.I)), 'research')


def matches(rules, text):
    return [name for name, pattern in rules if re.search(pattern, text, re.I)]


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
        url = safe_url(link)
        when = parse_date(item.findtext('pubDate') or item.findtext(ATOM + 'published') or item.findtext(ATOM + 'updated'))
        summary = plain(item.findtext('description') or item.findtext(ATOM + 'summary'), SUMMARY_CHARS)
        if not title or not url or not when or when > today:
            continue
        text = title + ' ' + summary
        if source.get('require_safety') and not (SAFETY.search(title) or STRONG.search(summary)):
            continue
        if source['kind'] == 'official' and PROMO.search(title):
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
            'direction_ids': matches(DIRECTIONS, text) or ['foundation-model'],
            'orgs': orgs,
        })
    return records


def fetch_url(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'AI-Safety-Index/1.0 (+https://gabrygao.github.io/ai-safety-index/)'})
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        return response.read(MAX_BYTES + 1)


def load_previous(root):
    path = root / 'research-source/signals-provenance.json'
    if not path.exists():
        return {}, []
    data = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(data.get('info'), dict) or not isinstance(data.get('records'), list):
        raise ValueError('Previous signals provenance is invalid; refusing to discard it')
    return data['info'], data['records']


def collect(previous_info, previous_rows, fetch, timestamp):
    today = date.fromisoformat(timestamp[:10])
    cutoff = (today - timedelta(days=ARCHIVE_DAYS)).isoformat()
    old_sources = {item.get('id'): item for item in previous_info.get('sources', [])}
    fresh, sources, failed = [], [], []
    for source in SOURCES:
        try:
            payload = fetch(source['url'])
            rows = parse_feed(payload, source, today)
            fresh.extend(rows)
            sources.append({'id': source['id'], 'name': source['name'], 'kind': source['kind'], 'url': source['url'],
                            'status': 'ok', 'last_successful_fetch': timestamp, 'records': len(rows),
                            'response_sha256': sha256(payload).hexdigest()})
        except (OSError, ValueError, ET.ParseError) as error:
            previous = old_sources.get(source['id'], {})
            sources.append({'id': source['id'], 'name': source['name'], 'kind': source['kind'], 'url': source['url'],
                            'status': 'failed', 'error': type(error).__name__,
                            'last_successful_fetch': previous.get('last_successful_fetch')})
            failed.append(source['id'])
    if len(failed) == len(SOURCES) and not previous_rows:
        raise ValueError('Every source failed and there is no previous snapshot')
    merged = {}
    # fresh rows first so the latest copy of a record wins over the stored one
    for row in [*fresh, *previous_rows]:
        if isinstance(row, dict) and row.get('id') and str(row.get('date', '')) >= cutoff:
            merged.setdefault(row['id'], row)
    records = sorted(merged.values(), key=lambda row: (row['date'], row['id']), reverse=True)
    info = {
        'generated_on': timestamp,
        'status': 'current' if not failed else ('stale' if len(failed) == len(SOURCES) else 'partial'),
        'sources': sources,
        'record_count': len(records),
        'archive_days': ARCHIVE_DAYS,
        'policy': 'Titles, dates, links and short publisher summaries from primary feeds; categories, directions and organisations assigned by this site\'s keyword rules',
    }
    return info, records


def write_artifacts(root, info, records):
    def encoded(value):
        return json.dumps(value, ensure_ascii=False, indent=1).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    path = root / 'research-source/signals-provenance.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    artifacts = [
        (path, json.dumps({'info': info, 'records': records}, ensure_ascii=False, indent=1) + '\n'),
        (root / 'signals-feed.js', '// Generated by tools/update-signals.py from primary public feeds.\n'
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
