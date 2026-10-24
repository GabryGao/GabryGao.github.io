# AI Safety Index

公开的 AI 安全研究与评测门户。

访问：https://gabrygao.github.io/ai-safety-index/

简体中文 · [English](README.en.md) · [日本語](README.ja.md)

快速入口：[动态观察台](https://gabrygao.github.io/ai-safety-index/#watch) · [来源目录](https://gabrygao.github.io/ai-safety-index/#sources) · [论文资料](https://gabrygao.github.io/ai-safety-index/#papers) · [评测看板](https://gabrygao.github.io/ai-safety-index/#results) · [研究方向](https://gabrygao.github.io/ai-safety-index/#directions)

## 当前能力

- 动态观察台：近 72 小时信息流、近 30 日主题信号、每日简报、来源健康状态和 JSON/CSV 导出。
- 来源目录：171 项已读取原始来源的资源、21 个参考入口、149 条历史候选和 291 份结果文件校验清单。
- 研究资料：490 条论文记录、六大研究方向、数据与工具、全站检索和四语界面。
- 评测证据：6 项基准，HELM Safety 2024 历史结果保留模型版本、任务设置、来源和 CSV 导出。
- 可维护配置：`status.json`、来源 provenance、更新脚本、验证脚本和 GitHub Actions 模板。

观察台只聚合已配置的公开来源与人工精选记录。自动条目明确标记待复核，收录不表示认可相关主张。

来源目录中的 171 项包含基准、数据集、工具、环境、报告和结果入口，不等于 171 个正式基准。2696 条指标是 10 个项目的接入样例，不提供跨基准总分或当前模型排名。公开包位于 `research-source/catalog-2026-10-22/`；许可未确认的 `evidence/` 与 `result-files/` 快照不在本站镜像。

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

The homepage, research-hotspot and observatory views sync the public AI Safety HOT API: up to 100 recent selected/hot articles from its seven-day public window plus five public paper picks. The homepage turns those records into an animated signal river: up to 100 source strands pass through topic-clustering and signal-filtering stages, converge on six rotating focus records, and end with collection, source, focus and refresh metrics. The visualization supports pause controls and reduced-motion preferences; every focus record remains linked to its public source. AI Safety HOT categories determine the three content sections; this portal's six-direction tags and focus ordering are metadata-based suggestions and remain unreviewed. Timestamps, access limits and source health are retained in `research-source/news-feed-provenance.json`.

Run `python3 tools/update-news.py` to update. Transport uses TLS-validating curl against the fixed public endpoint, a 20-second request deadline, a 25-second process cap and a 2 MiB cap per page. The importer fetches at most five 20-item pages, copies no full articles, and retains the previous snapshot if the source fails. The repository workflow at `.github/workflows/update-ai-safety-index.yml` refreshes news every three hours, refreshes evaluation metadata daily, rebuilds `status.json`, runs the static checks, and commits metadata only when it changes. `deployment/github-pages-update-news.yml` is the matching site-local template. While the site is open, the browser checks the public raw JSON every 15 minutes, with bundled metadata as its offline fallback. A newer snapshot updates the homepage stream in place; background updates never rerender a draft or reset filters, and an open news view offers an explicit refresh.

Source catalog generation: `python3 tools/build-source-catalog.py --source-dir /path/to/AI_Safety_Index_数据来源汇总_2026-10-22`. It validates counts and URLs, builds `source-catalog.js`, and copies only the package's root-level public indexes. The site does not mirror the raw evidence and result snapshot directories.

Checks: `node tools/verify-framework.mjs`, `node tools/verify-locales.mjs`, `node tools/verify-watch.mjs`, `node tools/verify-sources.mjs`, `node tools/verify-paper-import.mjs`, `node tools/verify-motion.mjs`, and `python3 -m unittest discover -s tools -p 'test_update_news.py'`. Run `node tools/build-status.mjs` after data updates. Keep original titles, URLs and in-place locale behavior intact.
