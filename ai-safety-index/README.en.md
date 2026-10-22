# AI Safety Index

A public, source-linked portal for AI safety research, papers, datasets, benchmarks and published evaluation results.

Website: https://gabrygao.github.io/ai-safety-index/

[简体中文](README.md) · English · [日本語](README.ja.md)

Open: [Research Observatory](https://gabrygao.github.io/ai-safety-index/#watch) · [Papers](https://gabrygao.github.io/ai-safety-index/#papers) · [Evaluation Dashboard](https://gabrygao.github.io/ai-safety-index/#results) · [Research Topics](https://gabrygao.github.io/ai-safety-index/#directions)

## What is included

- A research observatory with a 72-hour update flow, 30-day topic signals, a daily brief, source health and JSON/CSV exports.
- 490 paper records organized across six overlapping research topics, plus data, tools and multilingual search.
- Six benchmark records and source-linked HELM Safety 2024 historical results with model versions and test settings.
- Chinese, English, Japanese and German interfaces that switch in place without resetting the current route or filters.
- Public provenance records, `status.json`, update scripts, verification scripts and a GitHub Actions template.

Automated news records contain public metadata only and remain visibly pending review. Indexing a source does not endorse its claims.

## Run locally

```bash
python3 -m http.server 8765
```

Open `http://localhost:8765/`. The site is static and has no build step.

## Refresh and verify

```bash
python3 tools/update-news.py
node tools/build-status.mjs
node tools/verify-framework.mjs
node tools/verify-results.mjs
node tools/verify-compact.mjs
node tools/verify-locales.mjs
node tools/verify-watch.mjs
python3 -m unittest discover -s tools -p 'test_update_news.py'
```

The workflow template for the parent GitHub Pages repository is in `deployment/github-pages-update-news.yml`. It expects this site at `ai-safety-index/` and should be copied to the repository root under `.github/workflows/` only after scheduled write access is approved.

## Data boundaries

The observatory currently covers configured public feeds and editorial records; it is not comprehensive news monitoring. Evaluation records preserve source versions and conditions and must not be interpreted as a current overall safety ranking.
