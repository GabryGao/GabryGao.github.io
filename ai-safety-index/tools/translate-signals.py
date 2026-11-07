#!/usr/bin/env python3
"""Keep Chinese titles and summaries for the collected signals.

Reads the records written by update-signals.py and the stored translations, drops
translations for records that have aged out, and translates new records when an
ANTHROPIC_API_KEY is available. Without a key nothing is translated and the site shows
the original text for those records. A failed request never fails the feed update.
"""
import argparse
import json
import os
from pathlib import Path
import re
import sys
import urllib.request

CJK = re.compile(r'[㐀-鿿]')
BATCH = 15
MODEL = os.environ.get('SIGNALS_TRANSLATE_MODEL', 'claude-haiku-5-5')
PROMPT = ('Translate these AI-safety news records into Simplified Chinese for a Chinese research site. '
          'Keep names of people, companies, products and models as they are. Keep numbers exact. '
          'If a summary ends with an ellipsis, end the translation with "……". Do not add anything. '
          'Reply with only a JSON object mapping each id to [title, summary]; use "" for an empty summary.\n\n')


def needs_translation(row):
    return not CJK.search(row.get('title', ''))


def api_translator(key):
    def translate(rows):
        payload = {'model': MODEL, 'max_tokens': 4096, 'messages': [{'role': 'user', 'content': PROMPT + json.dumps(
            {r['id']: [r['title'], r.get('description') or ''] for r in rows}, ensure_ascii=False)}]}
        request = urllib.request.Request('https://api.anthropic.com/v1/messages', data=json.dumps(payload).encode(), headers={
            'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json'})
        with urllib.request.urlopen(request, timeout=90) as response:
            body = json.loads(response.read())
        text = ''.join(part.get('text', '') for part in body.get('content', []))
        match = re.search(r'\{.*\}', text, re.S)
        return json.loads(match.group(0)) if match else {}
    return translate


def update(records, stored, translate):
    """Return translations for the current records only, filling gaps with translate(rows) when given."""
    live = {r['id'] for r in records}
    kept = {k: v for k, v in stored.items() if k in live}
    missing = [r for r in records if r['id'] not in kept and needs_translation(r)]
    if translate:
        for start in range(0, len(missing), BATCH):
            batch = missing[start:start + BATCH]
            try:
                result = translate(batch)
            except Exception as error:  # a translation outage must not stop the feed update
                print(f'Translation batch failed: {type(error).__name__}', file=sys.stderr)
                continue
            for row in batch:
                pair = result.get(row['id'])
                if isinstance(pair, list) and len(pair) == 2 and all(isinstance(x, str) for x in pair) and pair[0].strip():
                    kept[row['id']] = [pair[0].strip(), pair[1].strip()]
    left = sum(1 for r in records if r['id'] not in kept and needs_translation(r))
    return dict(sorted(kept.items())), left


def write(root, translations):
    store = root / 'research-source/signals-zh.json'
    store.parent.mkdir(parents=True, exist_ok=True)
    encoded = json.dumps(translations, ensure_ascii=False, indent=0)
    for target, content in [(store, encoded + '\n'),
                            (root / 'signals-zh.js', '// Chinese titles and summaries for signals-feed.js, kept by tools/translate-signals.py.\n'
                             + 'const siteSignalsZh = ' + encoded.replace('<', '\\u003c').replace('>', '\\u003e') + ';\n')]:
        temporary = target.with_suffix(target.suffix + '.tmp')
        temporary.write_text(content, encoding='utf-8')
        temporary.replace(target)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    records = json.loads((args.root / 'research-source/signals-provenance.json').read_text(encoding='utf-8'))['records']
    store = args.root / 'research-source/signals-zh.json'
    stored = json.loads(store.read_text(encoding='utf-8')) if store.exists() else {}
    key = os.environ.get('ANTHROPIC_API_KEY', '').strip()
    translations, left = update(records, stored, api_translator(key) if key else None)
    write(args.root, translations)
    print(f'Translations: {len(translations)} kept; {left} records still in the original language' + ('' if key else ' (no ANTHROPIC_API_KEY)'))


if __name__ == '__main__':
    main()
