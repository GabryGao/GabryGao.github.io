# AI Safety Index

公开的 AI 安全研究与评测门户。

访问：https://gabrygao.github.io/ai-safety-index/

本目录为纯静态网站，无需登录；使用相对资源路径与 hash 导航。GitHub Pages 从 GabryGao/GabryGao.github.io 仓库 main 分支根目录发布，本网站位于 ai-safety-index 子目录。

热点人工精选，保留方向标签、来源与发布日期。评测记录保留模型版本、指标和测试条件。字体许可证、图片来源随 assets 保存。

## 论文目录补充（2026-10-19）

从 OpenTAI/opentai.github.io 的固定提交 8910c895c22f90f78205ad45ae0efb3461e63225 筛选导入 487 条论文书目，加上原有 3 条，共 490 条。保留标题、作者、年份和原文链接；不复制摘要、正文或插图。研究方向由本站交叉关联。

来源与筛选统计：research-source/opentai-import-provenance.json。

生成程序：tools/import-opentai-papers.py。输入为上述版本 scripts/data/paper-library.json 与 scripts/data/paper-author-metadata.json，使用 --source-dir 指定本地快照目录。检验：node tools/verify-paper-import.mjs。

在线 arXiv 元数据接口本次超时，因此采用 OpenTAI 已保存的官方元数据快照做严格题名匹配；未将此标为独立全文审核或实验复现。


## Four interface languages (2026-10-19)

The header selector supports Chinese, English, Japanese and German. `locale.js` uses offline curated UI strings; no translation API is called. Language changes translate existing text nodes and accessible labels in place, without re-rendering the route, changing the hash, or resetting filters, pagination, comparison selections, or input drafts. The preference is stored locally under `ai-safety-index-language`; Chinese is the default if storage is unavailable.

Original publication titles and author names are explicitly marked `data-keep-original`. Record IDs, URLs and option values remain unchanged. Topic names and research categories in all four languages are available to the existing search.

Validation: run `node tools/verify-locales.mjs` and `node tools/verify-paper-import.mjs`. The locale fixture originally covered 820 source strings collected from routes, deep topic tabs, empty states and dialogs. When adding copy, update the offline dictionary and coverage fixture. Browser checks must cover four-way switching on a filtered non-home route and mobile layouts at 320px and 390px.

## Block layout (2026-10-19)

`portal-grid.css` is the final layout layer. Paper/data libraries, topic directories, benchmarks, highlights and tools use two-column desktop blocks and single-column mobile blocks. Paper covers are typographic and preserve full scientific titles; no paper images or evaluation claims are invented. Existing routes, source links, filters, pagination and in-place language switching are retained. See `DESIGN.md` for the current visual system.

Validated the block catalogs at 1280px (two columns), 390px and 320px (one column), with no document overflow. Four-way language switching on a filtered second paper page preserves the hash, page and original paper URL.

## Platform framework (2026-10-20)

`portal-framework.js` and `portal-framework.css` now provide the final presentation layer. The homepage follows the supplied AstroWind framework: platform introduction, user value, vision, actual construction timeline and reserved blog. The global navigation exposes research topics, news, benchmarks/results, team and contact. Resource pages use compact, flat Madeo-style blocks: three columns above 1080px, two at intermediate widths, one on phones. Published numeric results remain tables. White remains the base background.

The team page intentionally awaits confirmed identities. Contact channels are not configured: the contact page prepares a local text draft and does not transmit form data. The existing resource-suggestion action opens this page. Confirm the receiving mailbox or form before enabling actual submission.

News combines editorial records with up to 30 keyword-matched metadata entries from OpenAI and Google DeepMind public RSS. Automated titles remain in their original language, with translated UI labels marking them as unreviewed. Collection dates, publisher dates and source health are retained in `research-source/news-feed-provenance.json`. This is limited publisher coverage, not a complete or editorially approved news stream.

Run `python3 tools/update-news.py` to update. Transport uses TLS-validating curl with fixed public URLs, a 20-second request deadline, 25-second process cap and 4 MiB cap. No paid APIs or article bodies are used. A failed source retains its previous metadata. A proposed repository workflow would schedule collection once daily. It is not installed: enabling a persistent task with repository write permissions awaits explicit user approval. Until then, refresh metadata manually with the command above. The browser can read the public raw JSON, with bundled metadata as its offline fallback. Background updates never rerender a draft or reset filters; an open news view offers an explicit refresh.

Checks: `node tools/verify-framework.mjs`, `node tools/verify-locales.mjs`, `node tools/verify-paper-import.mjs`, `node tools/verify-motion.mjs`, and `python3 -m unittest discover -s tools -p 'test_update_news.py'`. The expanded fixture covers 949 UI strings. Keep original titles, URLs and in-place locale behavior intact.
