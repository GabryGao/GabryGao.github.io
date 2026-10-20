AI Safety Index · Editorial v6
更新：2026-10-18

打开 index.html 使用，也可在本目录运行 python3 -m http.server 8765。
无需安装依赖或配置 API Key；字体和配图保存在 assets/，不需要访问第三方字体服务。

本轮设计
参考 ElevenLabs 中文对话式 AI 页和 Quanta Magazine 的黑白控件、编辑式字体、留白、主次内容比例。
用暖白纸面、深墨色、少量棕色替换蓝色模板。首屏为重点研究及原创概念插画，随后是搜索、研究动态、六方向目录和基准。
动态与方向独立，共享方向关联；论文 / 数据 / 基准 / 结果仍使用已有记录与筛选。

主要文件
index.html：入口、导航、页脚与脚本加载。
portal-editorial.js / .css：本轮页面表达与全站视觉覆盖；最终渲染在该脚本完成。
portal-v5.js：论文与数据记录、专题资料视图、搜索扩展。
portal-v4.js：共享目录、结果、方向、动态和关于页面。
app.js：原始样例记录、弹窗和通用事件。
research-data.js：六方向及子方向。
assets/：自托管开源字体、许可证、概念插画及来源说明。
DESIGN.md / .impeccable/design.json：当前设计系统。
previews/：本轮桌面与手机截图。

资料边界
原有历史资料继续用于演示；不代表实时榜单。模型成绩为 2024 年 HELM Safety 报告示例。
未接入付费 API、实时爬虫、后台审核或实际提交服务。
首屏配图为概念插画，不是论文图或实验结果。图像生成提示词及处理记录在 assets/image-provenance.json。
参考网站的品牌、照片、用户数字和资料库未复制。

2026-10-20 更新：
首页按 AstroWind 参考框架重排；资料页使用 Madeo 风格多列区块。新增独立团队页和联系页，团队名单和接收渠道待确认。联系表单仅生成本地草稿。热点加入 OpenAI / Google DeepMind 公开 RSS 的自动采集元数据，标注待复核并保留来源日期。
