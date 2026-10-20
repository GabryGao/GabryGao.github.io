AI Safety Index · 2026-10-20

在本目录运行 python3 -m http.server 8765 后访问本地网址。
这是无需构建的静态网站，正式地址为 https://gabrygao.github.io/ai-safety-index/ 。
无需 API Key；字体与概念封面均保存在 assets/。

当前设计
首页与内容页共用 MADEO 风格的黑色字标、轻字重标题、白色背景、细分隔线和绿色菜单。首页保留平台介绍、价值、愿景、进展和博客预留区；首屏使用三张主题概念封面。
内容页按照 MADEO Work / News / About / Contact 的布局制作：大标题、宽留白、三列封面、封面下方标题、绿色圆形菜单按钮、蓝色全屏菜单。平板两列，手机单列。
六张研究主题封面为生成的概念配图，不是论文图、研究结果或团队照片。精确提示词及来源记录在 assets/madeo/provenance.json，DM Sans 字体许可证为同目录 DM-Sans-OFL.txt。未复制 MADEO 客户图片、身份或联系方式。

功能与资料
六大研究方向与论文、数据、基准、结果关联；热点独立并带方向标签。
490 条论文记录，其中 487 条来自已记录版本的 OpenTAI 目录；来源说明在论文列表底部。
6 条基准记录；3 条 HELM Safety 2024 年历史结果用于展示协议与比较边界，不代表实时榜单。
热点保留精选与归档记录，并包含 OpenAI / Google DeepMind 公开 RSS 的自动采集元数据快照，自动条目标注待复核。仅收集元数据、保留来源日期，不复制正文。
每日自动更新工作流未安装，仍待授权；页面中显示的采集时间用于判断快照时效。
中、英、日、德四种语言在当前页面切换，保留路由、筛选、分页、比较选择和表单草稿。论文原始标题与作者保留原文。
团队页现列出项目方提供的 Xinfeng Li（香港理工大学，教授）与 Xin Gao（东京理科大学，参与成员）。“上传资源”位于基准与评测的第四个标签，独立的“联系我们”入口已移除。资源接收渠道待配置，表单仅在本地生成可下载资源草稿，不上传或发送。

主要文件
index.html：入口、共享导航和页脚。
portal-framework.js / .css：首页框架和共享功能。
portal-home.js / .css：首页概念封面与统一视觉，使用 body.madeo-home 限定首页组合。
portal-madeo.js / .css：共享页头、菜单和页脚，以及内容页的最终渲染。
portal-motion.js / .css：渐进动画与减少动态效果支持。
locale.js：四语言原地翻译与多语搜索。
research-data.js、app.js、portal-v5.js、opentai-papers.js、news-feed.js：方向、原始记录及快照。
DESIGN.md、.impeccable/design.json：共享视觉与各页面的设计规则。

验证
node tools/verify-framework.mjs
node tools/verify-paper-import.mjs
node tools/verify-locales.mjs
node tools/verify-motion.mjs

交互更新：绿色圆点鼠标、顶部悬停/键盘细分菜单、手机菜单分组展开、短开屏遮幕。语言与筛选不触发遮幕；减少动态效果时跳过。封面与桌面标题尺寸已缩小。
portal-interactions.js / .css 为最终交互与尺寸覆盖。
node tools/verify-navigation.mjs 验证快速切页、动画失败/超时恢复与减少动态效果。

桌面内容目录（1024px 起）每行三张图；六个研究方向排两行。平板两列，手机单列。

开屏动画调整为约 1.1 秒：遮幕缓入、标题揭示、底部色块错落展开后退场。保留快速切页中断、减少动态效果和超时恢复。

团队人员信息由项目方于 2026-10-20 提供，仅展示姓名、机构和角色；未添加未经提供的照片、个人主页或履历。
