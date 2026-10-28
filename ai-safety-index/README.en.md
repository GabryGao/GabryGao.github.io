# AI Safety Index

A public, source-linked portal for AI safety research, papers, datasets, benchmarks and published evaluation results.

Website: https://gabrygao.github.io/ai-safety-index/

[简体中文](README.md) · English · [日本語](README.ja.md)

Open: [Board](https://gabrygao.github.io/ai-safety-index/) · [All records](https://gabrygao.github.io/ai-safety-index/records.html) · [Research directions](https://gabrygao.github.io/ai-safety-index/directions.html) · [Results board](https://gabrygao.github.io/ai-safety-index/results.html) · [Benchmark catalog](https://gabrygao.github.io/ai-safety-index/benchmarks.html) · [Papers](https://gabrygao.github.io/ai-safety-index/papers.html) · [Previous version](https://gabrygao.github.io/ai-safety-index/legacy.html)

## Redesign (2026-10-29)

The site is now an AI safety board: the home page shows the days since the last AI safety incident, the latest safety signals, the last 30 days of signals per organisation and this week's arXiv safety papers. Further pages cover all records, research directions, evaluation (results board, benchmark catalog, methods, resource form), papers, entry details, site-wide search and about. The interface is Chinese and English; the English is a draft awaiting review, and long catalog notes on data access and licences stay in Chinese, marked "Chinese only". Japanese and German remain only in the previous version, `legacy.html`. Old `#route` links redirect to the new pages.

Pages share `shell.css`, `shell.js`, `i18n.js` and `catalog.js`; copy, topics, tool descriptions, datasets, team entries and hand-added papers that used to sit inside the old interface scripts now live in `site-data.js`. Check with `node tools/verify-site.mjs` (the scheduled workflow runs it too). See `DESIGN.md` and `PRODUCT.md`.

Safety signals are collected by `tools/update-signals.py` from official posts and the AI Incident Database, and paper picks by `tools/update-papers.py` from arXiv, both with this site's own rules; no news aggregator's data is used.

The sections below describe the previous version (now `legacy.html`).

## What is included

- A research observatory with a 72-hour update flow, 30-day topic signals, a daily brief, source health and JSON/CSV exports.
- A reviewed catalog of 171 resources, 21 reference portals, 149 historical candidates and a checksum manifest for 291 result files.
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
node tools/verify-sources.mjs
python3 -m unittest discover -s tools -p 'test_update_news.py'
```

The active repository workflow is `.github/workflows/update-ai-safety-index.yml`. The matching site-local template remains in `deployment/github-pages-update-news.yml`.

## Data boundaries

The observatory syncs the public AI Safety HOT seven-day window and paper picks; it is not comprehensive news monitoring. AI Safety HOT categories drive the content sections, while this portal's six-direction tags are keyword suggestions. The 171 source records include benchmarks, datasets, tools, environments, reports and result entry points; they are not 171 formal benchmarks. The 2,696 result rows are integration samples from 10 projects, not a cross-benchmark ranking. Evidence and result snapshots with unconfirmed redistribution rights are not mirrored.
