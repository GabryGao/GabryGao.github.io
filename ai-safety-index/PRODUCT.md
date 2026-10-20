# AI Safety Index

A public, buildless static portal connecting AI safety research directions, papers, data/tasks, benchmarks, published results and source-linked research news. It serves researchers, developers and people following AI safety. Canonical hosting is https://gabrygao.github.io/ai-safety-index/ in `GabryGao/GabryGao.github.io`, under `ai-safety-index/`. Preserve other repository files during publication.

## Structure and audience paths

The homepage introduces the platform, explains user value, states its vision, records real construction milestones and reserves space for a future blog. Blog categories are explicitly marked as planned; no articles are implied. Recent manually curated news appears within the value section. The shared header exposes five modules: research directions, research news, benchmarks/results, team and contact. Paper, data/task and method catalogs remain reachable through shared research directions and footer links.

Six overlapping research topics connect shared resources: data/privacy, foundation models, agents/software, physical AI, human/societal safety and AI+X/science. Entries can belong to multiple topics. Homepage editorial selections remain independent of the topic taxonomy.

## Evidence and source policy

The library contains 490 bibliography records, including 487 selected from OpenTAI's public GitHub catalog at commit `8910c895c22f90f78205ad45ae0efb3461e63225`, plus three existing records. Titles, authors, dates and original links retain attribution in `research-source/opentai-import-provenance.json`. The cached official metadata title match is not independent full-text review or experimental reproduction. Do not imply that inclusion establishes a paper's claims. Historical HELM results retain model versions and evaluation conditions; they are not a current leaderboard. Preserve original-source links and numeric result tables.

Research news combines manually selected/archived records with up to 30 keyword-matched metadata entries from the public OpenAI and Google DeepMind RSS feeds. Automated entries are visibly unreviewed, retain publisher dates and original titles, and use provisional topic labels. Their two-publisher coverage is not comprehensive. `research-source/news-feed-provenance.json` records collection time, source health and provenance. No article bodies, copied abstracts or paid API are used. A failed source retains its previous metadata.

`tools/update-news.py` updates the generated feed and has 17 ingestion tests. A daily repository workflow is prepared separately for publication; this document does not establish that it has been installed or successfully run. Runtime fetching of the public raw GitHub JSON validates record structure, known topics, publisher hosts, dates and automated/unreviewed flags before accepting newer data. Bundled, dated metadata remains the offline fallback. An open news view offers an explicit refresh; background updates do not rerender drafts or reset filters.

## Language and interaction contract

Chinese, English, Japanese and German switch in place through `locale.js`, preserving the current route, filters, page, input drafts and comparison selections. Language changes must not navigate, replace the page or replay entrances. Scientific titles, author names, source URLs and identifiers retain original wording. Offline dictionaries support translated UI and multilingual topic/category search; the current locale fixture covers 966 strings. Keep keyboard focus visible and honor reduced motion.

## Visual identity and assets

The accepted homepage retains its user-selected AstroWind composition, white base, self-hosted Inter, blue actions and solid violet hero emphasis. All non-home routes follow the source-pinned MADEO Work/News/About/Contact framework through `portal-madeo.css` and `portal-madeo.js`, loaded after `portal-framework`: open white canvas, large light DM Sans headings, two image-leading columns, titles and factual metadata below the covers, pill filters, a green circular menu control and a full-screen blue navigation dialog. Collection covers are now shorter (desktop aspect ratio 1.35, mobile 1.2), with a 1160px content cap and 72px desktop headings. Shared header disclosures reveal real subcategories on hover or keyboard focus; touch users expand the same destinations in the full-screen menu. A fine mouse pointer becomes a small teal dot, while text controls, touch devices and reduced-motion settings retain native pointer behavior. A short interruptible curtain marks route/topic changes; filters, pagination and language switches remain immediate. Mobile uses a single column and smaller display scale. Self-hosted DM Sans is licensed under OFL; `assets/madeo/` retains the font license and `provenance.json` for six original generated editorial concept covers. These images illustrate topics; they are not paper figures, actual research-project photographs or team portraits. `DESIGN.md` records the actual tokens and the separate home/subpage scopes.

The unmodified AstroWind hero and Inter font have source records in `assets/framework-asset-sources.json`, with `assets/AstroWind-LICENSE.md` and `assets/Inter-OFL.txt`. Preserve them with the assets. The older conceptual illustration remains attributed by `assets/image-provenance.json` and is not research evidence. Legacy Newsreader/Noto font files retain `assets/font-sources.json` and their OFL licenses; their presence does not make serif typography the current identity. Do not fabricate paper figures, scores, popularity or provenance.

## Pending content and service boundaries

Team identities, affiliations and roles await confirmation; the team page says so explicitly. The contact receiver is also pending. The form creates a local downloadable draft only, without sending or uploading it. Do not label that action as submission or invent a delivery address. Add no paid scraping, login or backend service without a request.
