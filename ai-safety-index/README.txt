AI Safety Index · 2026-10-22

无需构建；运行 python3 -m http.server 8765 后访问本地网址。
正式地址：https://gabrygao.github.io/ai-safety-index/

实用门户布局
四个主导航：研究方向、研究热点、基准与评测、研究团队。
首页参考 Madeo：白底、大标题与搜索、错落的两列大块内容。两张真实图表和两条研究推荐交错展示。
第一张柱状图展示 9 个历史模型中的 3 个（98.1、84.9、82.9），可切换 GCG-T 并带入完整看板；第二张对照图比较相同模型在两种设置下的分数，可展开数值表。来源与 2024 年历史状态均保留。
六个紧凑方向入口、研究分享、资源/新闻更新、简短介绍及可展开进展记录位于下方；不显示空博客。
概念封面仅用于研究热点及首页的热点推荐；图表用实际数据绘制。资源子页保持图标、文字与紧凑卡片：桌面三列、平板两列、手机一列。

数据与功能
490 条书目源记录，其中 487 条来自固定版本的 OpenTAI；搜索合并相同公开来源及匹配题名的别名，并保留跨方向标签。书目收录不代表复现论文结论。
动态观察台提供近 72 小时信息流、近 30 日主题信号、每日简报、来源健康状态和 JSON/CSV 导出。全部由现有公开记录生成，不伪造热点或结论。
来源目录展示 171 项已核验资源、21 个参考入口、149 条历史候选和 291 份结果文件校验清单。171 项包含基准、数据、工具、环境、报告和结果入口，不是 171 个正式基准。
2696 条指标值仅作为 10 个项目的接入样例，不提供跨基准总分或当前模型排名。许可未确认的 evidence/ 与 result-files/ 快照不在公开站点镜像。
6 条基准记录；9 个模型的 HELM Safety 2024 历史结果有明确来源与两种设置。显示分数为原报告 0–1 数值乘以100，不代表当前总体安全排名。
评测主入口默认打开看板：方向/基准/版本/指标/设置/机构/模型/排序，横条图、明细表、CSV 和筛选分享链接使用同一批记录。
四个评测标签：评测看板、基准目录、来源目录、方法与说明。上传资源位于标题右侧。
方向页默认展示资源，支持子主题，完整框架放在展开区。
热点使用共用记录，分资讯、解读及成果分享；没有文章的类别保持真实空态，采集元数据仍标待复核。
全站搜索覆盖题名、作者、方向、工具、基准、文章和已确认成员，支持类型筛选。
页面直接显示，无开屏、页面切换遮罩或内容入场特效；鼠标使用系统默认箭头及原生链接/输入框光标。
四种语言原地切换，保留路由、筛选和草稿。科学标题、作者和来源链接保留原文。

尚待项目方提供
资源接收渠道和审核负责人未提供。当前禁止正式提交，只可下载本地草稿；不计为真实上传功能已上线。
resource-submission.js 提供接收端契约：HTTPS JSON POST；成功必须返回 status=pending_review 和 receipt_id。未配置时禁止发送；失败保留输入。不能将私密邮箱或密钥放在公开前端。
团队已确认 Xinfeng Li（香港理工大学，教授）、Xin Gao（东京理科大学，参与成员）。头像仅显示姓名缩写；个人主页、具体职责及团队成果链接待补充，未虚构。
自动采集工作流已安装在 .github/workflows/update-ai-safety-index.yml。新闻与公司/模型主题每 3 小时更新，页面保留有采集时间的公开元数据快照。

主要文件
portal-compact.js / .css：最终页面、共用图表记录与紧凑资源子页。
portal-showcase.css：首页的 Madeo 式错落图表布局。
portal-search.js：去重的共享搜索。
portal-watch.js / .css：动态观察台、筛选、来源状态与公开数据导出。
portal-sources.js / .css：来源目录、筛选、分页、参考入口与公开数据包。
source-catalog.js：171 项来源记录及汇总统计，由 tools/build-source-catalog.py 生成。
portal-results.js：历史结果选择、CSV 与底层交互。
resource-submission.js：资源/成果表单及接收端状态。
locale.js：四语言；research-source/：书目、新闻、评测来源。
旧展示层为现有应用的依赖；资源页样式以 portal-compact.css 为准；首页补充样式由 portal-showcase.css 提供。
DESIGN.md / .impeccable/design.json：当前设计规则。

验证
node tools/verify-framework.mjs
node tools/verify-results.mjs
node tools/verify-compact.mjs
node tools/verify-locales.mjs
node tools/verify-navigation.mjs
node tools/verify-watch.mjs
node tools/verify-sources.mjs
node tools/build-status.mjs

素材的原始来源、生成记录与字体许可证均保留在 assets/。
