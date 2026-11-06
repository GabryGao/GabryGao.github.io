# AI Safety Index

A public, source-linked portal for AI safety research, papers, datasets, benchmarks and published evaluation results.

Website: https://gabrygao.github.io/ai-safety-index/

[简体中文](README.md) · English · [日本語](README.ja.md)

Open: [Board](https://gabrygao.github.io/ai-safety-index/) · [All records](https://gabrygao.github.io/ai-safety-index/records.html) · [Research directions](https://gabrygao.github.io/ai-safety-index/directions.html) · [Results board](https://gabrygao.github.io/ai-safety-index/results.html) · [Benchmark catalog](https://gabrygao.github.io/ai-safety-index/benchmarks.html) · [Papers](https://gabrygao.github.io/ai-safety-index/papers.html) · [Research map](https://gabrygao.github.io/ai-safety-index/research-map.html) · [Previous version](https://gabrygao.github.io/ai-safety-index/legacy.html)

## Coding-agent and software-engineering supplement (2026-11-06)

The research map now includes 56 additional on-site paper records: 30 coding-agent safety papers discovered through the public AI Safety HOT directory and checked against arXiv, plus 26 papers checked against the official ICSE 2026, FSE 2026, ASE 2026 and ISSTA 2026 programs. The corpus now has 3,695 records and 110 verified classifications. A new collection filter opens either the top-software-engineering set or the coding-agent safety supplement. Cards still open on-site records first; original publications, PDFs, conference pages and discovery links appear only inside details.

AI Safety HOT is used only for discovery and is attributed as AI Safety HOT (https://aisafetyhot.com); its generated summaries are not copied. Conference status, authors and public links are taken from official program pages, while methods and reported results retain the evidence limits shown in each record.

## Redesign (2026-10-29)

The site is now an AI safety board: the home page shows the days since the last AI safety incident, the latest safety signals, the last 30 days of signals per organisation and this week's arXiv safety papers. Further pages cover all records, research directions, evaluation (results board, benchmark catalog, methods, resource form), papers, the research map, entry details, site-wide search and about. The interface is Chinese and English; the English is a draft awaiting review, and long catalog notes on data access and licences stay in Chinese, marked "Chinese only". Japanese and German remain only in the previous version, `legacy.html`. Old `#route` links redirect to the new pages.

Pages share `shell.css`, `shell.js`, `i18n.js` and `catalog.js`; copy, topics, tool descriptions, datasets, team entries and hand-added papers that used to sit inside the old interface scripts now live in `site-data.js`. Check with `node tools/verify-site.mjs` (the scheduled workflow runs it too). See `DESIGN.md` and `PRODUCT.md`.

Safety signals are collected by `tools/update-signals.py` from official posts and the AI Incident Database, and paper picks by `tools/update-papers.py` from arXiv, both with this site's own rules; no news aggregator's data is used.

## Research map (2026-11-04)

The site now includes a native research map built from the user-supplied Safety Research Index package: 3,639 paper records, 24 research topics, 88 manually verified classifications and 39 recorded citation edges. Topic browsing, corpus search, citation views and paper records stay on this site; original publication, PDF and code links appear inside paper details. The 61 detail chunks load on demand, and the supplied methodology remains at `research-map-data/methodology-2026-11-02.pdf`.

Suggested classifications remain distinct from verified ones. Entries dated 2027 are presented as candidates or forthcoming work rather than completed publications. The citation map is a curated, source-located subset, not a complete network for all 3,639 papers. The supplied package had no explicit license file, so attribution and methodology must remain with the imported data.

The sections below describe the previous version (now `legacy.html`).

## What is included

- A research observatory with a 72-hour update flow, 30-day topic signals, a daily brief, source health and JSON/CSV exports.
- A reviewed catalog of 171 resources, 21 reference portals, 149 historical candidates and a checksum manifest for 291 result files.
- 490 records in the original paper directory, plus a 3,695-paper research map with 24 topics, on-site details and a curated citation view.
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
