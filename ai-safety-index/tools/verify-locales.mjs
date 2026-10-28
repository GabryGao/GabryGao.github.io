import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ctx=vm.createContext({console});
vm.runInContext(fs.readFileSync(path.join(root,'locale.js'),'utf8'),ctx);
const api=ctx.SiteLocale;
assert.ok(api);
assert.deepEqual(Array.from(api.languages),['zh','en','ja','de']);
for(const [lang,label] of [['zh','论文资料'],['en','Papers'],['ja','論文資料'],['de','Publikationen']])assert.equal(api.translate('论文资料',lang),label);
for(const lang of ['en','ja','de']){
 for(const s of ['490 条论文记录','年份由新到旧 · 显示 21–40 条 · 第 2 / 25 页','第 2 页','已选 2 条同协议记录','当前范围：物理 AI 安全','选择 GPT-4o 进行对比']){
  const t=api.translate(s,lang);assert.ok(t!==s,`${lang}: ${s}`);assert.ok(!/[\u3400-\u9fff]/u.test(t)||lang==='ja',`${lang} left source text: ${t}`);
 }
 for(const s of ['AI 安全评测与研究资源','查找基准、比较公开结果、追踪研究进展。','动态观察台','最近发生了什么？','研究热点正在流动','研究热点流','实时热度','AI 安全热点榜','过去 72 小时，按公开分数、发布时间与议题去重整理 10 条安全信号。','按公开分数、发布时间及议题去重排序','继续看','来源 · 同类议题近 7 日收录趋势 · 热点指数','同类议题近 7 日收录趋势','同类议题收录变化','热点指数','新收录','持平','热点指数沿用 AI Safety HOT 公开字段；排序同时考虑发布时间并做标题近似去重。趋势线表示同类议题近 7 个完整自然日的收录量，不代表社交讨论量或风险等级。','AI 安全每天都有新动态，','值得追踪的，只有几条。','自动抓取公开来源，去重、归类并筛出当天值得核对的安全信号。','公开来源经过主题聚类与信号筛选，汇聚为当前焦点。','查看动态观察台','进入动态观察台','观察台与采集说明','动态信息流：公开来源经过主题聚类和信号筛选，汇聚为今日焦点。','动态信息流：公开来源经过主题聚类和信号筛选，汇聚为当前焦点。','主题聚类','信号筛选','今日焦点','当前焦点','新闻发布：','来源：','展开摘要','平台获取：','上一条焦点','下一条焦点','条公开动态','个公开来源','条焦点信号','每 3 小时','精选','更新','自动同步于','暂停动态','继续动态','查看全部动态','自动同步','最近 7 日采集量','最新 AI 安全研究热点横向信息流','采集','去重','归类','展示','近 72 小时记录','当前主要信号','打开动态观察台','近 72 小时信息流','近期主题信号','每日研究简报','来源与数据状态'])assert.notEqual(api.translate(s,lang),s,`${lang}: untranslated observatory UI: ${s}`);
 for(const s of ['来源目录','AI 安全数据来源目录','已核验资源','参考入口','历史候选','结果文件清单','资源目录','公开数据包','使用边界'])assert.notEqual(api.translate(s,lang),s,`${lang}: untranslated source catalog UI: ${s}`);
 for(const s of ['当前范围的评测资源','目录筛选概览','图表随研究方向、评测主题、结果形态和关键词同步更新。','匹配资源','涉及主题','站内结果','高频评测主题','主题可交叉重叠','六大方向覆盖','一条资料可关联多个方向','证据状态构成','状态互斥，合计为当前筛选','暂无分布数据','站内已接入','公开结果入口','待核验候选','当前范围的方法与复现入口','运行工具与环境','重点评测协议','如何读一条测评','当前方向的比较边界'])assert.notEqual(api.translate(s,lang),s,`${lang}: untranslated evaluation catalog UI: ${s}`);
	 for(const s of ['公开评测结果对比','当前基准','任务：','设置：','来源日期','测试日期','测试日期未报告','页面更新日','来源表日期（含义未确认）','日期含义未确认','报告发布日期','来源未报告','当前读数','展开 6 个模型','收起为 4 个模型','查看 6 个模型的完整数值与日期','继续查找与补充资源','基准目录','上传与补充','搜索、筛选并查看已核验的基准与公开结果入口。','提交论文、项目、数据或评测结果的公开链接。','当前筛选摘要','匹配模型','同任务、配置与指标','原表同任务、配置与指标范围','同榜单、任务、配置与指标','同原表维度、配置与指标','最佳表现','中位数','最大跨度','当前筛选内最高与最低之差','测评看板工具','比较工具','显示方式','结果显示方式','绝对值','相对差值','提供方','全部提供方','基线模型','图表显示','前 5 条','前 6 条','前 10 条','前 10 条（默认）','前 20 条','仅比较当前基准、任务与设置','恢复默认视图','模型相对差值图','正值表示优于基线','查看双指标与任务矩阵','可比性限制：','每一行分别保留来源日期、日期类型、测试日期和平台获取时间。未知字段不补写。','Overall 无害回答比例对比','当前 Overall 仅展示原表发布的无害回答比例。','Overall 只报告无害回答比例；越高越好。'])assert.notEqual(api.translate(s,lang),s,`${lang}: untranslated evaluation dashboard UI: ${s}`);
 for(const s of ['筛选热点方向','包含相关能力','工具与运行环境','搜索工具或运行环境','评测规范与数据记录','评测协议与适用范围','指标定义与量纲','版本与时间记录','数据来源与收录流程','结果数据处理流程','结果采集','字段标准化','质量校验','协议分组','可视化发布'])assert.notEqual(api.translate(s,lang),s,`${lang}: untranslated revision UI: ${s}`);
	 for(const s of ['AI 安全研究与评测资料','产业动态','安全事件','模型','清除','全部资料','最近更新','名称 Z–A','投毒与后门','情境隐私','差分隐私与效用权衡','模型窃取与查询成本','成员推断','查询感知隐私保护','情境完整性与隐私规范','近期事件、产品动态与公开公告。','评测、论文、方法与安全机制分析。','把热点榜、公开资讯、研究方向与来源状态放在同一视图中，并保留站内详情与原始出处。','热点指数来自公开接口字段；排序同时考虑发布时间并做标题近似去重。趋势线表示同类议题近 7 个完整自然日的收录量，不代表社交讨论量或风险等级。','4 条记录，来自 4 个公开来源。以下为元数据索引，不代替原文核对。','122 项直接或混合评测','20 项相关能力可选 · 资料核验于 2026-10-22','全部方向 · 29 项资源','29 项匹配资源','HELM Safety v1.0 · HarmBench · 默认设置 · 发布于 2024-11-08','图表默认显示前 4 个模型；数值表保留 6 个模型。这里只比较同一基准、同一任务和同一配置，不生成跨基准“总安全分”。','评测内容：','更新于 ','查看详情','项目','代码','机器遗忘','从知识移除、隐私泄露与模型效用等方面评估机器遗忘方法。','遗忘效果、隐私保护、能力保留']){
	  const translated=api.translate(s,lang);
	  assert.notEqual(translated,s,`${lang}: untranslated current UI: ${s}`);
	  if(lang!=='ja')assert.doesNotMatch(translated,/[\u3400-\u9fff]/u,`${lang}: mixed current UI: ${translated}`);
	  else assert.doesNotMatch(translated,/[这们个与为后过发录资评测开关还页项条从进实对应该将连现选论读观动热闻总访设显较线标护]/u,`${lang}: simplified Chinese remains: ${translated}`);
	 }
	 for(const s of ['隐私审计','联邦学习','智能体控制','检索生成评估','安全强化学习','智能合约安全','机器人安全','物理 AI 环境','智能体任务环境','用于构建和比较机器遗忘实验。','用于检测训练数据泄露和成员推断风险。','成员推断、低误报率表现、隐私泄露','提供联邦学习任务、数据和系统基线。','任务效用、通信成本、训练效率','用于比较数据选择、清洗和质量治理方法。','数据质量、下游表现、选择与清洗流程','用于评估智能体控制协议中的安全与效用。','控制协议、安全表现、任务效用','用于评估检索增强生成系统的相关性与忠实度。','上下文相关性、答案忠实度、答案相关性','用于比较安全强化学习算法与基线。','任务回报、安全成本、收敛表现','用于智能合约漏洞检测、注入与攻防实验。','漏洞检出、误报漏报、运行代价','用于评估机器人任务中的安全约束和防护方法。','安全规格、违规检测、任务成功率','提供驾驶、具身或机器人任务的仿真与数据环境。','任务表现、感知能力、操作能力','提供智能体任务执行和工具调用的可复现实验环境。','任务成功率、工具使用、系统能力','用于搭建安全评测环境、运行任务和复现实验。','任务运行、工具集成、系统能力与复现流程','资料档案','工具与环境档案','目录记录','资料概览','评测内容与使用','资源入口','主要标签','评测内容','研究方向','更新日期','主要评测内容','资料类型','来源与核验记录','以下字段保留目录原文，便于核验。','细分领域','核心指标','数据可用性','目录备注','核验记录','核验状态','公开来源已核验','许可说明','使用前请核对原始许可','记录类型','最近核验','记录信息','目录编号','核验日期','返回目录','同领域资料','查看全部','当前记录未提供可核验的公开链接。','这是一项工具或运行环境资料，适合用于搭建实验、生成任务或复现流程；它本身不是模型安全得分。']){
	  const translated=api.translate(s,lang);
	  assert.notEqual(translated,s,`${lang}: untranslated catalog detail UI: ${s}`);
	  if(lang!=='ja')assert.doesNotMatch(translated,/[\u3400-\u9fff]/u,`${lang}: mixed catalog detail UI: ${translated}`);
	  else assert.doesNotMatch(translated,/[这们个与为后过发录资评测开关还页项条从进实对应该将连现选论读观动热闻总访设显较线标护]/u,`${lang}: simplified Chinese remains in catalog detail UI: ${translated}`);
	 }
	 for(const s of ['按主题进入测评资料','查看完整基准目录','查看主题与证据分布','可进入的评测主题','站内可视化结果','评测主题','当前范围细分','细分领域','证据形态','代表资料','进入方向','查看同类资源','综合安全与对齐','越狱与有害协助','智能体与工具调用','多模态与生成安全','工业与关键基础设施'])assert.notEqual(api.translate(s,lang),s,`${lang}: untranslated evaluation directory UI: ${s}`);
 assert.notEqual(api.translate('图表显示前 5 条；完整记录见下方表格。',lang),'图表显示前 5 条；完整记录见下方表格。');
	 for(const s of ['当前显示 10 / 24 个可比模型','显示前 20 个模型','显示全部 24 个模型','收起为前 10 个模型'])assert.notEqual(api.translate(s,lang),s,`${lang}: untranslated model-count UI: ${s}`);
 assert.notEqual(api.translate('相对 GPT-4o 的差值',lang),'相对 GPT-4o 的差值');
 assert.notEqual(api.translate('3 个来源 · 9 条记录',lang),'3 个来源 · 9 条记录');
 assert.equal(api.translate('HELM Safety v1.0',lang),'HELM Safety v1.0');
 assert.equal(api.translate('A Study of Agent Safety',lang),'A Study of Agent Safety');
 assert.equal(api.translate('   论文资料 ↗ ',lang),'   '+api.translate('论文资料',lang)+' ↗ ');
}
assert.equal(api.translate('论文资料','invalid'),'论文资料');
assert.ok(api.searchText('数据与隐私安全').includes('Datenschutz'));
assert.ok(api.searchText('提示注入攻击').includes('プロンプト'));
const html=fs.readFileSync(path.join(root,'legacy.html'),'utf8');
assert.ok(html.includes('id="site-language"'));
assert.ok(html.includes('locale.js'));
const runtime=fs.readFileSync(path.join(root,'locale.js'),'utf8');
assert.ok(!/location\.(?:hash|href)\s*=|location\.(?:assign|replace|reload)\(/.test(runtime),'Language switch must not navigate');
const coverage=JSON.parse(fs.readFileSync(path.join(root,'tools/locale-ui-coverage.json'),'utf8'));
for(const source of coverage)for(const lang of ['en','de'])assert.ok(!/[\u3400-\u9fff]/u.test(api.translate(source,lang)),`${lang}: untranslated UI: ${source}`);
for(const source of coverage)assert.ok(api.translate(source,'ja').trim());
console.log(`Locale checks passed: four locales, dynamic counts, fallback, original titles, multilingual search, in-place switch contract, ${coverage.length} UI strings across collected routes and dialogs.`);
