#!/usr/bin/env python3
"""Build a factual paper index from a pinned OpenTAI bibliographic snapshot.

No paper text, abstracts, images, or upstream interface code is republished.
Input snapshots are downloaded separately, so rebuilding has no network cost.
"""
import argparse
from collections import Counter
from datetime import date
import hashlib
import json
from pathlib import Path
import re

SOURCE_COMMIT = '8910c895c22f90f78205ad45ae0efb3461e63225'
SOURCE_FILE = 'scripts/data/paper-library.json'
SOURCE_URL = f'https://github.com/OpenTAI/opentai.github.io/blob/{SOURCE_COMMIT}/{SOURCE_FILE}'
DIRECTIONS = ['data-privacy', 'foundation-model', 'agent-software', 'physical-ai', 'human-societal', 'ai-x-science']
RISK = re.compile(r'\b(safe|safety|security|secure|privacy|private|adversarial|attack\w*|defen[cs]\w*|jailbreak\w*|backdoor\w*|poison\w*|threat\w*|risk\w*|robust\w*|alignment|aligned|decept\w*|toxic\w*|unlearn\w*|harmful|leak\w*|vulnerab\w*|collusion|guard\w*|red.team\w*|fairness|bias\w*|hallucinat\w*|hijack\w*|sensitive|abuse|misuse|spoof\w*|collision\w*|certif\w*)\b', re.I)
SECTIONS = {
    'Agent Memory Attacks': '智能体记忆攻击', 'Agent Memory Defenses': '智能体记忆防御',
    'Agent Tool-Calling Attacks': '工具调用攻击', 'Agent Tool-Calling Defenses': '工具调用防御',
    'Agentic Attacks & Defenses': '智能体攻击与防御', 'Embodied Agent Attacks': '具身智能体攻击',
    'Embodied Agent Defenses': '具身智能体防御', 'Indirect Prompt Injection Attacks': '间接提示注入攻击',
    'Indirect Prompt Injection Defenses': '间接提示注入防御', 'Internal Safety Collapse': '模型内部安全失效',
    'Multi-Agent System Attacks': '多智能体系统攻击', 'Multi-Agent System Defenses': '多智能体系统防御',
    'VLM Agent Attacks': '视觉语言智能体攻击', 'VLM Agent Defenses': '视觉语言智能体防御',
    'Human-Agent Interaction': '人与智能体交互', 'Multi-Agent Collaboration': '多智能体协作',
    'Robot Control': '机器人控制安全', 'Cascading Risks': '级联风险', 'Memory': '记忆机制安全',
    'Self-Evolving': '自演化系统安全', 'Tool Use and Skill': '工具与技能使用',
    'Instruction Understanding': '指令理解安全', 'Reasoning': '推理可靠性', 'World Model': '世界模型安全',
    'Auditory Perception': '听觉感知安全', 'Cross-Modal Perception': '跨模态感知安全',
    'Motion Perception': '运动感知安全', 'Spatial Perception': '空间感知安全',
    'Visual Perception': '视觉感知安全', 'Multi-Agent Planning': '多智能体规划安全',
    'Task Planning': '任务规划安全', 'Trajectory Planning': '轨迹规划安全',
    'Adversarial Attack': '对抗攻击', 'Adversarial Defense': '对抗防御',
    'Backdoor Attacks': '后门攻击', 'Backdoor Defenses': '后门防御',
    'Data Extraction Attacks': '数据提取攻击', 'Energy Latency Attacks': '能耗与时延攻击',
    'Jailbreak Attack': '越狱攻击', 'Jailbreak Defense': '越狱防御',
    'Model Extraction Attacks': '模型提取攻击', 'Prompt Injection Attacks': '提示注入攻击',
    'Prompt Injection Defenses': '提示注入防御', 'Safety Alignment': '安全对齐',
}


def normalize_title(value):
    return re.sub(r'[^a-z0-9]', '', value.lower())


def directions_for(p):
    """Cross-tags from explicit title terms and the upstream domain/section."""
    title, section = p['title'].lower(), p.get('section') or ''
    ids = set()
    if p['domain'] == 'LLMs':
        ids.add('foundation-model')
    if p['domain'] == 'Agents' or p.get('group') == 'Agentic' or re.search(r'llm[- ](?:based )?agents?|multi[- ]agent|agentic|model context protocol|retrieval.augmented|\brag\b', title):
        ids.add('agent-software')
    if (p['domain'] == 'Embodied AI' and p.get('group') not in ['Agentic', 'Related work']) or re.search(r'embodied|robot|autonomous (driv|vehicle)|\bdriving\b|\blidar\b|vision.language.action|\bvla\b|navigation|sensor spoof', title):
        ids.add('physical-ai')
    if re.search(r'privacy|private\b|membership|data extract|model extract|model theft|data leak|secret leak|memory leak|unlearn|poison|backdoor', title) or section in ['Data Extraction Attacks', 'Model Extraction Attacks', 'Backdoor Attacks', 'Backdoor Defenses']:
        ids.add('data-privacy')
    if re.search(r'fairness|\bbias\b|ethics?|sycophan|social(?:ly)? (?:align|interaction|systems)|human[-– ]robot|human[-– ]agent|human[-– ]ai|perceived safety|multi.agent collusion', title):
        ids.add('human-societal')
    if re.search(r'medical|clinical|health attendant|biosecurity|biosafety|financial|finance|blockchain|chemical safety', title):
        ids.add('ai-x-science')
    if re.search(r'vision.language model|large language model|\bvlm\b', title) and not ids:
        ids.add('foundation-model')
    return [direction for direction in DIRECTIONS if direction in ids]


def build(source_dir, output_dir, imported_on):
    source_bytes = (source_dir / 'paper-library.json').read_bytes()
    source = json.loads(source_bytes)
    author_snapshot = json.loads((source_dir / 'paper-author-metadata.json').read_text())
    metadata = author_snapshot['records']
    records, excluded, corrected_years = [], [], []
    seen_ids, seen_titles = set(), set()
    for original in source:
        p = dict(original)
        reason = None
        arxiv_id = re.sub(r'v\d+$', '', p.get('arxivId') or '')
        if not (RISK.search(p['title']) or p['domain'] in ['Agents', 'LLMs']):
            reason = 'outside_direct_safety_scope'
        elif not re.fullmatch(r'\d{4}\.\d{4,5}', arxiv_id):
            reason = 'no_title_matched_arxiv_record'
        elif arxiv_id not in metadata or normalize_title(p['title']) != normalize_title(metadata[arxiv_id]['title']):
            reason = 'title_not_exactly_matched_to_upstream_arxiv_cache'
        elif arxiv_id[:4] > imported_on[2:4] + imported_on[5:7]:
            reason = 'future_arxiv_month'
        if reason:
            excluded.append({'title': p['title'], 'reason': reason})
            continue
        checked = metadata[arxiv_id]
        p['title'] = re.sub(r'\s+', ' ', checked['title']).strip()
        title_key = normalize_title(p['title'])
        if arxiv_id in seen_ids or title_key in seen_titles:
            excluded.append({'title': p['title'], 'reason': 'duplicate_citation'})
            continue
        ids = directions_for(p)
        if not ids:
            excluded.append({'title': p['title'], 'reason': 'no_supported_direction_mapping'})
            continue
        authors = [a.strip() for a in checked['authors'] if a.strip()]
        if not authors:
            excluded.append({'title': p['title'], 'reason': 'missing_authors'})
            continue
        year = str(p.get('year') or '')
        if str(p.get('venue') or '').lower() == 'arxiv' or not re.fullmatch(r'\d{4}', year):
            year = '20' + arxiv_id[:2]
        if year != str(p.get('year') or ''):
            corrected_years.append({'arxiv_id': arxiv_id, 'upstream_year': p.get('year'), 'display_year': year})
        record = {
            'id': 'opentai-arxiv-' + arxiv_id.replace('.', '-'),
            'name': p['title'], 'title': p['title'],
            'description': SECTIONS.get(p.get('section'), 'AI 安全综述与研究'),
            'year': year, 'source': authors[0] + (' 等' if len(authors) > 1 else ''),
            'authors': authors, 'venue': p.get('venue') or 'arXiv',
            'kind': p.get('kind') or 'research', 'arxiv_id': arxiv_id,
            'url': 'https://arxiv.org/abs/' + arxiv_id,
            'direction_ids': ids, 'import_source': 'OpenTAI',
            'upstream_section': p.get('section'), 'upstream_domain': p['domain'],
        }
        records.append(record)
        seen_ids.add(arxiv_id)
        seen_titles.add(title_key)
    records.sort(key=lambda p: (-int(p['year']), p['name'].lower()))
    counts = Counter(d for p in records for d in p['direction_ids'])
    info = {
        'source_name': 'OpenTAI', 'source_url': SOURCE_URL, 'source_commit': SOURCE_COMMIT,
        'upstream_sha256': hashlib.sha256(source_bytes).hexdigest(),
        'imported_on': imported_on, 'upstream_count': len(source), 'imported_count': len(records),
        'excluded_count': len(excluded), 'by_direction': {d: counts[d] for d in DIRECTIONS},
        'exclusion_counts': dict(Counter(p['reason'] for p in excluded)),
        'year_correction_count': len(corrected_years),
        'metadata_source': author_snapshot['source'],
        'metadata_snapshot_date': author_snapshot['retrievedAt'],
        'scope': 'Bibliographic facts and original-paper links only. No abstracts, full text, or artwork copied.',
        'verification': 'Normalized titles exactly match OpenTAI cached arXiv metadata; not an independent review of research claims.',
        'classification': 'This portal assigns overlapping direction tags using explicit title terms and source domain/section.',
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    js = '// Bibliographic import; regenerate with tools/import-opentai-papers.py.\n'
    js += 'const paperImportInfo = ' + json.dumps(info, ensure_ascii=False, separators=(',', ':')) + ';\n'
    js += 'const importedPaperRecords = ' + json.dumps(records, ensure_ascii=False, separators=(',', ':')) + ';\n'
    js += "const existingPaperUrls = new Set(paperRecords.map(r=>r.url));\n"
    js += "paperRecords.push(...importedPaperRecords.filter(r=>!existingPaperUrls.has(r.url)));\n"
    js += "paperRecords.sort((a,b)=>(Number(b.year)||0)-(Number(a.year)||0)||a.name.localeCompare(b.name,'en'));\n"
    (output_dir / 'opentai-papers.js').write_text(js)
    audit_dir = output_dir / 'research-source'
    audit_dir.mkdir(exist_ok=True)
    (audit_dir / 'opentai-import-provenance.json').write_text(json.dumps(info, ensure_ascii=False, indent=2) + '\n')
    (source_dir / 'import-audit.json').write_text(json.dumps({'info': info, 'excluded': excluded, 'year_corrections': corrected_years}, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(info, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--date', default=date.today().isoformat())
    args = parser.parse_args()
    build(args.source_dir, args.output_dir, args.date)
