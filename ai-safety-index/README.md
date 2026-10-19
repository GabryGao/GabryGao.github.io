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
