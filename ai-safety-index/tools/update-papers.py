#!/usr/bin/env python3
"""Pick recent AI safety papers from arXiv with this site's own keyword rules.

One query to the official arXiv API returns the newest submissions in the AI, language,
security, learning, vision and robotics categories that mention safety terms. Each paper is
scored by where those terms appear (title counts more than abstract) and the top PICKS from
the last WINDOW_DAYS are kept. The choice is automatic and unreviewed, and the page says so.
"""
import argparse
from datetime import date, datetime, timedelta, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

API_URL = 'https://export.arxiv.org/api/query'
ATOM = '{http://www.w3.org/2005/Atom}'
ARXIV = '{http://arxiv.org/schemas/atom}'
CATEGORIES = ['cs.AI', 'cs.CL', 'cs.CR', 'cs.LG', 'cs.CV', 'cs.RO']
TERMS = {
    'jailbreak': 3, 'prompt injection': 3, 'red teaming': 3, 'red-teaming': 3, 'backdoor': 3, 'data poisoning': 3,
    'membership inference': 3, 'unlearning': 2, 'misuse': 2, 'safety': 2, 'alignment': 2, 'guardrail': 2,
    'harmful': 2, 'adversarial': 1, 'hallucination': 1, 'privacy': 1, 'deception': 2, 'scheming': 3,
    'reward hacking': 3, 'sycophancy': 2, 'refusal': 2, 'monitoring': 1, 'oversight': 1, 'robustness': 1,
}
QUERY_TERMS = ['jailbreak', 'prompt injection', 'red teaming', 'backdoor', 'unlearning', 'misuse', 'safety', 'alignment', 'guardrail', 'harmful', 'deception', 'reward hacking', 'sycophancy']
DIRECTIONS = [
    ('data-privacy', r'privacy|membership|unlearn|poison|backdoor|data extraction|memoriz'),
    ('physical-ai', r'robot|embodied|autonomous driving|vision-language-action|\bvla\b|manipulation|navigation'),
    ('ai-x-science', r'medical|clinical|biolog|chemi|scientific|financ'),
    ('agent-software', r'\bagents?\b|agentic|tool|prompt injection|code|software|web|browser|mcp'),
    ('human-societal', r'bias|fairness|toxic|sycophan|social|child|election|misinformation|cultural'),
    ('foundation-model', r'jailbreak|alignment|refusal|hallucinat|reward hack|language model|\bllms?\b|safety training'),
]
WINDOW_DAYS = 7
PICKS = 8
MAX_RESULTS = 200
MAX_BYTES = 8 * 1024 * 1024
TIMEOUT = 40


def query_url():
    cats = ' OR '.join('cat:' + c for c in CATEGORIES)
    terms = ' OR '.join('abs:"' + t + '"' if ' ' in t else 'abs:' + t for t in QUERY_TERMS)
    return API_URL + '?' + urllib.parse.urlencode({
        'search_query': f'({cats}) AND ({terms})', 'sortBy': 'submittedDate', 'sortOrder': 'descending',
        'start': 0, 'max_results': MAX_RESULTS})


def clean(value):
    return re.sub(r'\s+', ' ', value or '').strip()


def score(title, abstract):
    t, a = title.lower(), abstract.lower()
    return sum(weight * (3 if term in t else 1 if term in a else 0) for term, weight in TERMS.items())


def parse(payload, today):
    if len(payload) > MAX_BYTES:
        raise ValueError('arXiv response exceeds size limit')
    root = ET.fromstring(payload)
    if root.tag != ATOM + 'feed':
        raise ValueError('arXiv response is not an Atom feed')
    since = today - timedelta(days=WINDOW_DAYS - 1)
    papers = []
    for entry in root.findall(ATOM + 'entry'):
        raw_id = clean(entry.findtext(ATOM + 'id'))
        match = re.search(r'arxiv\.org/abs/([0-9]{4}\.[0-9]{4,5})', raw_id)
        published = clean(entry.findtext(ATOM + 'published'))[:10]
        title = clean(entry.findtext(ATOM + 'title'))
        abstract = clean(entry.findtext(ATOM + 'summary'))
        if not match or not title or not re.match(r'^\d{4}-\d{2}-\d{2}$', published):
            continue
        when = date.fromisoformat(published)
        if when < since or when > today:
            continue
        primary = entry.find(ARXIV + 'primary_category')
        text = title + ' ' + abstract
        papers.append({
            'arxiv_id': match.group(1),
            'title': title,
            'date': published,
            'authors': [clean(a.findtext(ATOM + 'name')) for a in entry.findall(ATOM + 'author')][:3],
            'more_authors': len(entry.findall(ATOM + 'author')) > 3,
            'category': primary.get('term') if primary is not None else '',
            'direction_ids': [d for d, p in DIRECTIONS if re.search(p, text, re.I)] or ['foundation-model'],
            'score': score(title, abstract),
        })
    unique = {p['arxiv_id']: p for p in papers}
    ranked = sorted(unique.values(), key=lambda p: (-p['score'], p['date'], p['arxiv_id']), reverse=False)
    ranked = sorted(ranked[:PICKS], key=lambda p: (p['date'], p['score']), reverse=True)
    return ranked


def fetch_url(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'AI-Safety-Index/1.0 (+https://gabrygao.github.io/ai-safety-index/)'})
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        return response.read(MAX_BYTES + 1)


def load_previous(root):
    path = root / 'research-source/paper-picks-provenance.json'
    if not path.exists():
        return {}, []
    data = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(data.get('info'), dict) or not isinstance(data.get('papers'), list):
        raise ValueError('Previous paper picks are invalid; refusing to discard them')
    return data['info'], data['papers']


def collect(previous_info, previous_papers, fetch, timestamp):
    today = date.fromisoformat(timestamp[:10])
    url = query_url()
    try:
        payload = fetch(url)
        papers = parse(payload, today)
        if not papers:
            raise ValueError('No recent papers matched')
        status, digest, error = 'current', sha256(payload).hexdigest(), None
        last = timestamp
    except (OSError, ValueError, ET.ParseError) as failure:
        if not previous_papers:
            raise
        papers, status, digest, error = previous_papers, 'stale', previous_info.get('response_sha256'), type(failure).__name__
        last = previous_info.get('last_successful_fetch')
    info = {'generated_on': timestamp, 'status': status, 'last_successful_fetch': last, 'error': error,
            'query': url, 'response_sha256': digest, 'window_days': WINDOW_DAYS, 'picks': PICKS,
            'method': 'Newest arXiv submissions in ' + ', '.join(CATEGORIES) + ' matching safety terms, ranked by this site\'s keyword score; automatic and unreviewed'}
    return info, papers


def write_artifacts(root, info, papers):
    def encoded(value):
        return json.dumps(value, ensure_ascii=False, indent=1).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    path = root / 'research-source/paper-picks-provenance.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    artifacts = [
        (path, json.dumps({'info': info, 'papers': papers}, ensure_ascii=False, indent=1) + '\n'),
        (root / 'paper-picks.js', '// Generated by tools/update-papers.py from the arXiv API.\n'
         + 'const sitePaperPicksInfo = ' + encoded(info) + ';\n'
         + 'const sitePaperPicks = ' + encoded(papers) + ';\n'),
    ]
    for target, content in artifacts:
        temporary = target.with_suffix(target.suffix + '.tmp')
        temporary.write_text(content, encoding='utf-8')
        temporary.replace(target)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    previous_info, previous_papers = load_previous(args.root)
    timestamp = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    info, papers = collect(previous_info, previous_papers, fetch_url, timestamp)
    write_artifacts(args.root, info, papers)
    print(f"arXiv picks: {len(papers)} papers; status={info['status']}")


if __name__ == '__main__':
    main()
