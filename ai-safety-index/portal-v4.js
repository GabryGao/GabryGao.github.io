// Shared records, two entry paths: task pages and research-topic views.
// These mappings are editorial prototype examples, not a completed content audit.
const benchmarkDirections = Object.fromEntries(benchmarkData.map(b=>[b.id,researchDirections.filter(d=>d.links.includes(b.id)).map(d=>d.id)]));
const resourceDirections = {
 nist:researchDirections.map(d=>d.id),unicef:['human-societal','foundation-model'],
 helm:['foundation-model'],'agent-docs':['agent-software'],repository:researchDirections.map(d=>d.id)
};
const newsRecords = [
 {"id": "anthropic-unintended-2026", "title": "当 Agent 越过任务边界：Anthropic 披露非预期操作", "type": "reports", "label": "行为安全报告", "date": "2026-10-09", "order": "2026-10-09", "source": "Anthropic", "description": "从评测与内部使用中的案例，观察工具调用、访问限制和任务边界失守的问题。", "url": "https://www.anthropic.com/research/investigating-unintended-model-actions", "direction_ids": ["agent-software"], "terms": ["工具使用", "任务边界", "风险治理"], "featured": true, "verified": true},
 {"id": "classifier-poisoning-2026", "title": "训练数据投毒，能否给安全分类器植入后门？", "type": "projects", "label": "数据安全研究", "date": "2026-04-24", "order": "2026-04-24", "source": "Anthropic Alignment Science", "description": "研究微调数据被投毒时，安全分类器的后门与鲁棒性如何变化，以及常规红队测试可能遗漏什么。", "url": "https://alignment.anthropic.com/2026/backdooring-classifiers/", "direction_ids": ["data-privacy", "foundation-model"], "terms": ["数据投毒", "后门攻击", "安全分类器"], "featured": true, "verified": true},
 {"id": "model-spec-evals-2026", "title": "Model Spec Evals：怎样评估模型是否遵守行为规范？", "type": "projects", "label": "评测工具发布", "date": "2026-03-25", "order": "2026-03-25", "source": "OpenAI Alignment Research", "description": "公开评测数据与代码，检查模型对拒答、诚实性和指令优先级等行为要求的遵循情况。", "url": "https://alignment.openai.com/model-spec-evals/", "direction_ids": ["foundation-model", "human-societal"], "terms": ["评测方法", "行为规范", "对齐"], "featured": true, "verified": true},
 {id:'helm-report',title:'HELM Safety：从组合评测看模型的安全表现',type:'reports',label:'评测报告',date:'2024-11-08',order:'2024-11-08',source:'Stanford CRFM',description:'阅读不同测试设置下的历史结果，理解模型版本、指标与比较边界。',url:benchmarkData[0].url,direction_ids:['foundation-model'],terms:['评测方法','有害协助'],benchmark:'helm-safety'},
 {id:'mm-paper',title:'MM-SafetyBench：图文输入下的安全边界',type:'projects',label:'论文与项目',date:'2024 · 来源条目年份',order:'2024-01-01',source:'MM-SafetyBench 作者团队',description:'从多模态条件进入安全评测任务、输入设置与原始论文。',url:benchmarkData[2].url,direction_ids:['foundation-model'],terms:['多模态','视觉越狱'],benchmark:'mm-safetybench'},
 {id:'agent-project',title:'AgentDojo：工具环境中的提示注入评测',type:'projects',label:'论文与项目',date:'2024 · 来源条目年份',order:'2024-01-01',source:'AgentDojo',description:'查看正常任务效用、注入攻击与防御如何在同一环境中评估。',url:benchmarkData[1].url,direction_ids:['agent-software'],terms:['提示注入','工具使用'],benchmark:'agentdojo'},
 ...resources.filter(r=>r.type==='报告与指南').map(r=>({id:r.id,title:r.name,type:'reports',label:'报告与指南',date:r.year+' · 来源条目年份',order:r.year+'-01-01',source:r.org,description:r.desc,url:r.url,direction_ids:resourceDirections[r.id],terms:r.id==='unicef'?['儿童安全','人机交互']:['风险治理','评测方法']}))
];
const methodResources = resources.filter(r=>r.type!=='报告与指南');
const getDirection=id=>researchDirections.find(d=>d.id===id);
function selectedDirection(){return route().path==='directions'?route().params.get('pillar')||'':route().params.get('direction')||''}
function routeLink(path,params={}){const q=new URLSearchParams(Object.entries(params).filter(([,v])=>v!==''&&v!==undefined&&v!==null));return '#'+path+(q.size?'?'+q:'')}
function scopedLink(path,direction,extra={}){return routeLink(path,{direction,...extra})}
function benchmarkListFor(direction){return benchmarkData.filter(b=>!direction||(benchmarkDirections[b.id]||[]).includes(direction))}
function scopeControl(direction){
 return '<div class="scope-control"><label for="direction-filter">研究方向<select id="direction-filter"><option value="">全部方向</option>'+researchDirections.map(d=>'<option value="'+d.id+'" '+(d.id===direction?'selected':'')+'>'+d.name+'</option>').join('')+'</select></label><p>选择方向后，目录、结果和方法共用同一筛选范围。</p>'+(direction?'<a href="'+routeLink('directions',{pillar:direction})+'">查看方向专题 ↗</a>':'')+'</div>';
}
function evalTabs(active){
 const d=selectedDirection();
 return '<div class="tabs task-tabs">'+[['catalog','benchmarks','基准目录'],['results','results','评测结果'],['methods','methods','方法与工具']].map(t=>'<a class="tab '+(active===t[0]?'active':'')+'" href="'+scopedLink(t[1],d)+'">'+t[2]+'</a>').join('')+'</div>';
}
function topicTags(ids){return '<div class="topic-tags">'+ids.map(id=>{const d=getDirection(id);return d?'<a href="'+routeLink('directions',{pillar:id})+'">'+d.name+'</a>':''}).join('')+'</div>'}
function scopedBenchmarkRow(b,i,d){return benchmarkRow(b,i).replaceAll('#benchmark/'+b.id,routeLink('benchmark/'+b.id,{direction:d}))}
function contentEmpty(title,desc,link,label){return '<div class="scoped-empty"><span aria-hidden="true">↗</span><div><h3>'+title+'</h3><p>'+desc+'</p>'+(link?'<a class="text-link" href="'+link+'">'+label+' ↗</a>':'')+'</div></div>'}
function newsRows(items){
 return items.map(n=>'<article class="news-row"><div class="news-date"><span>'+n.label+'</span><time>'+n.date+'</time></div><div><h3><a href="'+n.url+'" target="_blank" rel="noopener noreferrer">'+n.title+' ↗</a></h3><p>'+n.description+'</p><div class="news-source">'+n.source+(n.verified?' · 原始来源':' · 历史资料')+'</div>'+topicTags(n.direction_ids)+'</div></article>').join('');
}
function homepageNews(){
 const main=newsRecords[0],list=[newsRecords.find(n=>n.id==='unicef'),newsRecords[2]];
 return '<section class="section front-news">'+sectionHead('01 / RESEARCH UPDATES','研究动态，先看重点','首页呈现精选，完整列表支持按方向和关键词浏览。','news','全部动态')+'<div class="front-news-grid"><article class="feature-news"><div class="micro">EDITOR’S PICK / 布局示例</div><span class="feature-number" aria-hidden="true">01</span><div class="feature-body"><span class="label outline">'+main.label+' · '+main.date+'</span><h3>'+main.title+'</h3><p>'+main.description+'</p><a class="text-link" href="'+main.url+'" target="_blank" rel="noopener noreferrer">阅读原始报告 ↗</a></div></article><div class="front-news-list">'+newsRows(list)+'</div></div><p class="section-footnote">当前使用已有历史资料演示内容布局，不代表实时热点或最近发布；正式运营时按发布日期、选材理由与来源更新。</p></section>';
}
function compactDirections(){
 return '<section class="section home-directions">'+sectionHead('02 / EXPLORE BY TOPIC','关注一个方向，看到完整脉络','每个专题连接研究问题、基准、评测结果与动态。','directions','六大研究方向')+'<div class="direction-entry-grid">'+researchDirections.map((d,i)=>'<a class="direction-entry" href="'+routeLink('directions',{pillar:d.id})+'"><span class="direction-no">0'+(i+1)+'</span><div><h3>'+d.name+'</h3><p>'+d.short+'</p></div><span class="entry-arrow" aria-hidden="true">↗</span></a>').join('')+'</div></section>';
}
function home(){
 return '<div class="wrap reveal"><section class="hero task-hero home-v4"><div><div class="eyebrow">AI SAFETY · AN OPEN EVIDENCE INDEX</div><h1>看见安全研究，<br><em>找到评测依据。</em></h1><p class="intro">从六大方向探索研究，从基准与结果核对证据。</p>'+searchForm('hero-search','搜索方向、基准、论文或报告…','',true)+'<div class="suggestions"><span>试试搜索</span><button data-query="提示注入">提示注入</button><button data-query="自动驾驶">自动驾驶</button><button data-query="儿童安全">儿童安全</button></div></div><aside class="task-hub"><div class="micro">START WITH A TASK</div><h2>带着问题，找到入口</h2><div class="task-hub-list">'+[['benchmarks','找可用的评测基准','核对测试对象、任务与运行资料'],['results','看公开评测结果','按模型版本与相同协议比较'],['directions','探索关注的研究方向','串起基准、结果与研究动态']].map((t,i)=>'<a class="task-hub-link" href="#'+t[0]+'"><span class="task-no">0'+(i+1)+'</span><div><strong>'+t[1]+'</strong><p>'+t[2]+'</p></div><span class="task-arrow">↗</span></a>').join('')+'</div></aside></section>'+homepageNews()+compactDirections()+'<section class="section homepage-benchmarks">'+sectionHead('03 / BENCHMARK DISCOVERY','从问题走向评测','先了解测量范围，再查看同一协议下的结果。','benchmarks','浏览全部基准')+'<div class="index-list">'+[benchmarkData[0],benchmarkData[1],benchmarkData[5]].map((b,i)=>benchmarkRow(b,i,true)).join('')+'</div><a class="method-entry" href="#methods"><span>准备开始评测？</span><strong>查看方法、数据与工具</strong><span>↗</span></a></section><section class="builders-strip"><div><div class="micro">THE PEOPLE BEHIND THE INDEX</div><h2>谁在建设这个 Index</h2><p>了解平台目标、建设团队与内容审核方式。参与名单确认后将在此展示。</p></div><a class="button secondary" href="#about">关于我们 ↗</a></section></div>';
}
function benchmarkPanel(direction){
 const p=route().params,q=(p.get('q')||'').trim(),object=p.get('object')||'',sort=p.get('sort')||'name';
 let list=benchmarkListFor(direction).filter(b=>(!object||b.object===object)&&localeSearchText(b.name+' '+b.desc+' '+b.tags.join(' ')+' '+b.object).toLowerCase().includes(q.toLowerCase()));
 list.sort(sort==='year'?(a,b)=>b.year-a.year:(a,b)=>a.name.localeCompare(b.name));
 return '<div class="panel-toolbar">'+searchForm('catalog-search','搜索当前范围内的基准',q)+'<label>评测对象<select name="object">'+['','语言模型','多模态模型','Agent','物理系统'].map(v=>'<option value="'+v+'" '+(v===object?'selected':'')+'>'+(v||'全部对象')+'</option>').join('')+'</select></label><label>排序<select id="catalog-sort"><option value="name" '+(sort==='name'?'selected':'')+'>名称 A–Z</option><option value="year" '+(sort==='year'?'selected':'')+'>年份由新到旧</option></select></label></div><div class="count-row"><span>'+list.length+' 条基准示例</span><span>同一记录 · 方向标签筛选</span></div>'+(list.length?'<div class="index-list">'+list.map((b,i)=>scopedBenchmarkRow(b,i,direction)).join('')+'</div>':contentEmpty('当前范围暂无已录入基准','PPT 中的候选评测资源仍在专题概览中保留，核对类型、版本和来源后再加入目录。',direction?routeLink('directions',{pillar:direction}):'#benchmarks',direction?'查看拟议范围':'查看全部基准'));
}
function catalog(){const d=selectedDirection();return '<div class="wrap reveal task-page">'+pageHead('FIND & EVALUATE','基准与评测','从基准目录选择工具，在相同协议下阅读结果。')+evalTabs('catalog')+scopeControl(d)+benchmarkPanel(d)+'</div>'}
function resultSelection(direction){
 const allowed=benchmarkListFor(direction),requested=route().params.get('benchmark');
 return {allowed,b:allowed.find(b=>b.id===requested)||allowed[0]};
}
function resultPanel(direction){
 const {allowed,b}=resultSelection(direction),p=route().params,metric=p.get('metric')==='attack'?'attack':'score',sort=p.get('sort')||'desc';
 if(!b)return contentEmpty('这个方向尚无已录入评测结果','专题归类不产生安全分数。新增结果需带有基准版本、完整配置和原始证据。',routeLink('directions',{pillar:direction}),'了解研究与评价边界');
 const has=b.id==='helm-safety',list=[...results].sort((a,b)=>sort==='asc'?a[metric]-b[metric]:b[metric]-a[metric]);
 return '<div class="result-toolbar"><label class="select-field">基准 / 报告<select id="result-benchmark">'+allowed.map(x=>'<option value="'+x.id+'" '+(x.id===b.id?'selected':'')+'>'+x.name+'</option>').join('')+'</select></label><label class="select-field">任务与设置<select id="result-metric" '+(!has?'disabled':'')+'>'+(has?'<option value="score" '+(metric==='score'?'selected':'')+'>HarmBench / 默认设置</option><option value="attack" '+(metric==='attack'?'selected':'')+'>HarmBench / GCG-T</option>':'<option>尚无已录入设置</option>')+'</select></label><label class="select-field">结果顺序<select id="result-sort" '+(!has?'disabled':'')+'><option value="desc" '+(sort==='desc'?'selected':'')+'>分数由高到低</option><option value="asc" '+(sort==='asc'?'selected':'')+'>分数由低到高</option></select></label></div>'+(has?'<div class="info-line"><i>i</i><span>2024 年公开历史结果示例，用于演示比较方式，不是当前模型排名。</span></div><div class="protocol-line"><span>版本 <strong>HELM Safety v1.0</strong></span><span>指标 <strong>无害性分数 ↑ / 0–1</strong></span><span>报告日期 <strong>2024-11-08</strong></span></div><div class="table-wrap"><table class="result-table"><thead><tr><th>对比</th><th>模型与版本</th><th>无害性分数 ↑</th><th>任务与设置</th><th>来源</th></tr></thead><tbody>'+list.map(r=>'<tr><td><input type="checkbox" class="compare-check" value="'+r.id+'" aria-label="选择 '+r.name+' 进行对比" '+(state.selected.has(r.id)?'checked':'')+'></td><td><strong>'+r.name+'</strong><small>'+r.version+'</small></td><td><div class="score">'+r[metric].toFixed(3)+'<span class="score-bar"><i style="width:'+r[metric]*100+'%"></i></span></div></td><td>HarmBench<small>'+(metric==='score'?'默认设置':'GCG-T')+'</small></td><td><a href="'+benchmarkData[0].url+'" target="_blank" rel="noopener noreferrer">原始报告 ↗</a><small>Stanford CRFM</small></td></tr>').join('')+'</tbody></table></div><div class="results-end"><p>同一方向内也不一定可比。上述结果仅对应所列模型版本、任务、设置与判分方法，不能解读为该研究方向的总分。</p><button class="text-link" data-action="method">查看比较原则 ↗</button></div>':contentEmpty(b.name+' 尚无已录入结果','这里保留真实空态。基准已收录与评测成绩已录入是两件事。',routeLink('benchmark/'+b.id,{direction}),'查看基准资料'));
}
function resultsPage(){const d=selectedDirection();return '<div class="wrap reveal task-page">'+pageHead('COMPARABLE EVIDENCE','基准与评测','方向决定看哪些材料，协议决定哪些结果可以比较。')+evalTabs('results')+scopeControl(d)+resultPanel(d)+'</div>'}
function methodsPage(){
 const d=selectedDirection(),items=methodResources.filter(r=>!d||resourceDirections[r.id].includes(d));
 return '<div class="wrap reveal task-page">'+pageHead('FROM METHODS TO PRACTICE','基准与评测','评测方法、项目文档与数据工具集中在这里。')+evalTabs('methods')+scopeControl(d)+'<div class="count-row"><span>'+items.length+' 条方法与工具示例</span><a href="'+scopedLink('news',d,{type:'reports'})+'">查看报告与指南 ↗</a></div>'+(items.length?'<div class="resource-list">'+items.map(r=>'<article class="resource-row"><span>'+r.year+'</span><div><span class="micro">'+r.org+' / '+r.type+'</span><h2>'+r.name+'</h2><p>'+r.desc+'</p></div><a class="text-link" href="'+r.url+'" target="_blank" rel="noopener noreferrer">原始资料 ↗</a></article>').join('')+'</div>':contentEmpty('这个方向暂无已录入方法资料','确认资料来源与适用范围后，再补充到同一资源库。','#methods','浏览全部方法'))+'</div>';
}
function newsPanel(direction,embedded=false){
 const p=route().params,type=p.get('type')||'',q=p.get('q')||'',term=p.get('term')||'';
 const list=newsRecords.filter(n=>(!direction||n.direction_ids.includes(direction))&&(!type||n.type===type)&&(!term||n.terms.includes(term))&&localeSearchText(n.title+' '+n.description+' '+n.terms.join(' ')).toLowerCase().includes(q.toLowerCase())).sort((a,b)=>b.order.localeCompare(a.order));
 return '<div class="panel-toolbar news-toolbar">'+searchForm('news-search','搜索论文、项目或报告',q)+'<label>内容类型<select id="news-type"><option value="">全部内容</option><option value="projects" '+(type==='projects'?'selected':'')+'>论文与项目</option><option value="reports" '+(type==='reports'?'selected':'')+'>报告与指南</option></select></label></div><div class="keyword-row"><span>关键词</span>'+['提示注入','多模态','儿童安全','风险治理'].map(t=>'<button data-news-term="'+t+'" class="'+(term===t?'active':'')+'" aria-pressed="'+(term===t)+'">'+t+'</button>').join('')+(term?'<button data-news-term="" class="clear-keyword">清除关键词 ×</button>':'')+'</div><div class="count-row"><span>'+list.length+' 条精选与归档</span><span>按来源发布日期排序</span></div>'+(list.length?'<div class="news-list">'+newsRows(list)+'</div>':contentEmpty('当前筛选下暂无已录入动态','只展示有原始来源的内容，不使用无关联材料填补专题。',embedded?scopedLink('news',direction):'#news','打开动态列表'))+'<p class="section-footnote">人工精选，保留来源发布日期；较早内容作为资料归档。方向标签用于关联专题，不代表六份独立的热点列表。</p>';
}
function newsPage(){const d=selectedDirection();return '<div class="wrap reveal task-page">'+pageHead('','研究热点','人工精选值得关注的论文、项目与报告；按研究方向和关键词筛选。')+'<div class="news-scope">'+scopeControl(d).replace('选择方向后，目录、结果和方法共用同一筛选范围。','将论文、项目和报告限定在所选方向。')+'</div>'+newsPanel(d)+'</div>'}
function topicTabs(d,view){return '<nav class="tabs topic-tabs" aria-label="专题内容">'+[['overview','方向概览'],['benchmarks','基准'],['results','评测结果'],['news','研究动态']].map(t=>'<a class="tab '+(view===t[0]?'active':'')+'" '+(view===t[0]?'aria-current="page"':'')+' href="'+routeLink('directions',{pillar:d.id,view:t[0]})+'">'+t[1]+'</a>').join('')+'</nav>'}
function topicOverview(d){
 const counts={benchmarks:benchmarkListFor(d.id).length,results:benchmarkListFor(d.id).some(b=>b.id==='helm-safety')?results.length:0,news:newsRecords.filter(n=>n.direction_ids.includes(d.id)).length};
 return '<div class="topic-summary-grid"><section><div class="micro">WHAT WE STUDY</div><h2>'+d.question+'</h2><p>'+d.description+'</p><div class="direction-rule"><span>评价原则</span><p>'+esc(d.principle)+'</p></div></section><aside class="topic-actions"><div class="micro">EXPLORE THE EVIDENCE</div>'+[['benchmarks','找到相关基准'],['results','阅读公开结果'],['news','跟进研究动态']].map(t=>'<a href="'+routeLink('directions',{pillar:d.id,view:t[0]})+'"><span>'+t[1]+'</span><small>'+counts[t[0]]+' 条示例</small><b>↗</b></a>').join('')+'<p>这里显示已录入示例数；PPT 候选资源不计入。</p></aside></div><div class="topic-list-title"><h3>拟议子方向与评价边界</h3><span>'+d.topics.length+' 个子方向 · 按需展开</span></div><div class="direction-topics">'+d.topics.map((t,j)=>'<details class="direction-topic"><summary><span class="topic-number">'+String(j+1).padStart(2,'0')+'</span><span><strong>'+t.name+'</strong><small>'+esc(t.en)+'</small></span><span class="topic-toggle" aria-hidden="true">＋</span></summary><div class="topic-content"><div><h4>技术与研究切入点</h4><p lang="en">'+esc(t.tech)+'</p></div><div><h4>候选评测资源 · PPT 原列</h4><p lang="en">'+esc(t.candidates)+'</p></div><div class="topic-boundary"><h4>主要指标与使用边界</h4><p>'+esc(t.boundary)+'</p></div></div></details>').join('')+'</div><div class="candidate-note"><strong>候选清单与正式记录分别管理</strong><p>PPT 原列包含基准、数据集、环境、工具与框架，尚待逐项核对类型、链接及版本。页面中的候选清单不代表已收录或已复现。</p></div><div class="source-principle"><h3>方案中的补充说明</h3><p>'+esc(d.note)+'</p></div><p class="direction-source">来源：safety index.pptx（2026-10-17 提供与整理）第 '+d.sourceSlide+' 页；中文导读为网页整理，英文子方向保留原文。当前仍为拟议框架。</p>';
}
function directionsPage(){
 const p=route().params,d=getDirection(p.get('pillar')),view=['overview','papers','datasets','benchmarks','results','news'].includes(p.get('view'))?p.get('view'):'overview';
 if(!d)return '<div class="wrap reveal task-page">'+pageHead('ONE TOPIC, CONNECTED EVIDENCE','六大研究方向','选择关注的领域，在专题内浏览论文、数据、基准与公开结果。')+'<div class="framework-status"><span class="label blue">拟议研究框架</span><span>六个支柱允许交叉关联；一份资料可以属于多个方向。</span></div><div class="topic-directory">'+researchDirections.map((t,i)=>'<a href="'+routeLink('directions',{pillar:t.id})+'"><span class="direction-no">0'+(i+1)+'</span><div><span class="micro">'+esc(t.en)+'</span><h2>'+t.name+'</h2><p>'+t.description+'</p><span class="topic-path">方向概览 → 论文 / 数据 / 基准 / 结果</span></div><b>↗</b></a>').join('')+'</div><details class="framework-explainer"><summary>查看六个方向之间的关系 <span>＋</span></summary><div class="framework-explainer-body">'+directionMap('')+'<div><h2>数据与隐私贯穿全局，<br>模型连接系统与应用。</h2><p>PPT 的关系图表达交叉与联动。专题负责讲清研究问题和评价边界；基准、结果与动态则使用共享记录，通过方向标签进入专题。</p><p>因此这里不把六个方向当作互斥的分类树，也不生成六项综合安全分数。</p></div></div></details></div>';
 return '<div class="wrap reveal topic-page"><div class="breadcrumb topic-breadcrumb"><a href="#home">首页</a><span>/</span><a href="#directions">研究方向</a><span>/</span><span>'+d.name+'</span></div><div class="topic-heading"><div><div class="eyebrow">'+esc(d.en)+'</div><h1 id="direction-title">'+d.name+'</h1><p>'+d.short+'</p></div><span class="label blue">拟议方向</span></div><div class="topic-chooser"><label for="topic-picker">切换方向</label><select id="topic-picker">'+researchDirections.map(t=>'<option value="'+t.id+'" '+(t.id===d.id?'selected':'')+'>'+t.name+'</option>').join('')+'</select><span>同一主题，连接不同类型的证据。</span></div>'+topicTabs(d,view)+'<section class="topic-panel" aria-label="'+({overview:'方向概览',papers:'论文',datasets:'数据与任务',benchmarks:'相关基准',results:'评测结果',news:'研究热点'})[view]+'">'+(view==='papers'||view==='datasets'?libraryPanel(view,d.id):view==='benchmarks'?benchmarkPanel(d.id):view==='results'?resultPanel(d.id):view==='news'?newsPanel(d.id,true):topicOverview(d))+'</section>'+(view!=='overview'?'<div class="topic-exit"><span>当前范围：'+d.name+'</span><a href="'+scopedLink(view==='benchmarks'?'benchmarks':view==='results'?'results':view==='papers'?'papers':view==='datasets'?'datasets':'news',d.id)+'">到全站列表查看此筛选 ↗</a></div>':'')+'</div>';
}
function aboutPage(){
 return '<div class="wrap reveal task-page about-page">'+pageHead('THE PEOPLE & THE PROCESS','关于我们','了解 Index 的目标、建设者和证据管理方式。')+'<section class="about-mission"><div><span class="micro">OUR PURPOSE</span><h2>让 AI 安全研究<br>更容易被发现、理解和核对。</h2></div><p>AI Safety Index 旨在连接不同研究方向下的基准、公开结果与研究动态。通过保留来源、版本和评价条件，帮助使用者找到适合自己问题的证据。</p></section><section class="section">'+sectionHead('PEOPLE BEHIND THE INDEX','平台建设团队','这里介绍参与创建与维护 Index 的教授和共建者。')+'<div class="team-pending"><span class="label outline">参与名单尚未确认</span><p>成员确认后按实际平台职责展示；机构任职、研究专长与平台贡献分别说明。</p></div><div class="member-preview"><div class="member-photo" aria-hidden="true"><svg viewBox="0 0 100 110"><circle cx="50" cy="34" r="17"/><path d="M16 100V88c0-24 68-24 68 0v12"/></svg><span>照片位置</span></div><div><span class="micro">MEMBER PROFILE / 展示模板</span><h3>姓名待确认</h3><p class="member-affiliation">机构、院系与职务 · 待确认</p><dl><div><dt>平台职责</dt><dd>参与创建、学术把关或内容建设等，按确认结果填写。</dd></div><div><dt>关注方向</dt><dd>关联相应方向专题，介绍与本平台相关的贡献。</dd></div></dl><span class="member-link-placeholder">个人主页入口 · 确认后开放</span></div></div><p class="section-footnote">这是成员资料的展示结构，不对应任何已确认的人。拟议名单和公开研究履历不能单独证明参与本平台。</p></section><section class="section about-method">'+sectionHead('METHOD & RESPONSIBILITY','每条资料，都保留依据','资料收录、重要结论复核与实验复现分别记录。')+'<div class="process-row"><div><b>01</b><h3>收录原始资料</h3><p>保留发布方、日期、版本与原始链接。</p></div><div><b>02</b><h3>关联研究方向</h3><p>同一资料可关联多个方向，按唯一记录维护。</p></div><div><b>03</b><h3>核对结果条件</h3><p>明确协议、模型版本与运行设置，再进行比较。</p></div></div><button class="text-link" data-action="method">阅读收录与比较方法 ↗</button></section></div>';
}
const originalDetail = detail;
detail = function(id){
 const direction=route().params.get('direction')||'',b=benchmarkData.find(x=>x.id===id);
 let html=originalDetail(id);
 if(direction){html=html.replace('href="#benchmarks"','href="'+scopedLink('benchmarks',direction)+'"').replace('href="#results?benchmark='+id+'"','href="'+scopedLink('results',direction,{benchmark:id})+'"').replace('href="#benchmark/'+id+'"','href="'+routeLink('benchmark/'+id,{direction})+'"')}
 if(b)html=html.replace('<section class="detail-section"><h2>','<div class="detail-topics"><span class="micro">关联方向</span>'+topicTags(benchmarkDirections[id]||[])+'</div><section class="detail-section"><h2>');
 return html;
};
function resultContext(){const r=route();if(r.path!=='results'&&!(r.path==='directions'&&r.params.get('view')==='results'))return '';return selectedDirection()+'|'+(resultSelection(selectedDirection()).b?.id||'')+'|'+(r.params.get('metric')||'score')}
function updateTray(){const context=resultContext(),b=resultSelection(selectedDirection()).b,el=$('#compare-tray');el.hidden=!context||b?.id!=='helm-safety'||!state.selected.size;el.innerHTML='<span>已选 '+state.selected.size+' 条同协议记录</span><button class="clear" data-action="clear-compare">清空</button><button class="button small" data-action="compare" '+(state.selected.size<2?'disabled':'')+'>并排比较 ↗</button>'}
function render(){
 const r=route(),context=resultContext();if(state.resultContext!==context){state.selected.clear();state.resultContext=context}
 let content,nav=r.path;
 if(r.path==='home')content=home();
 else if(r.path==='directions')content=directionsPage();
 else if(r.path==='papers'||r.path==='datasets'){content=libraryPage(r.path);nav='directions'}
 else if(r.path==='benchmarks')content=catalog();
 else if(r.path==='results')content=resultsPage();
 else if(r.path==='methods'||r.path==='resources'){content=methodsPage();nav='benchmarks'}
 else if(r.path.startsWith('benchmark/')){content=detail(r.path.split('/')[1]);nav='benchmarks'}
 else if(r.path==='news'||r.path==='trends'){content=newsPage();nav='news'}
 else if(r.path==='about'||r.path==='teams'){content=aboutPage();nav='about'}
 else content=notFound();
 if(r.path==='results')nav='benchmarks';
 $('#main').innerHTML=content;
 $$('[data-nav]').forEach(a=>{const active=a.dataset.nav===nav;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 $('#primary-nav').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false');$('#menu-button').setAttribute('aria-label','打开导航');
 document.title=({papers:'论文资料',datasets:'数据与任务'})[r.path] ? ({papers:'论文资料',datasets:'数据与任务'})[r.path]+' · AI Safety Index' : (({home:'首页',directions:'研究方向',benchmarks:'基准与评测',news:'研究热点',about:'关于我们'})[nav]||'资料')+' · AI Safety Index';
 updateTray();
}
searchAll = function(q){
 const term=q.trim().toLowerCase();
 const items=[...benchmarkData.map(b=>({name:b.name,desc:b.desc,search:b.tags.join(' '),type:'基准',href:'#benchmark/'+b.id})),...researchDirections.map(d=>({name:d.name,desc:d.description,search:d.en+' '+d.topics.map(t=>t.en+' '+t.name).join(' '),type:'方向专题',href:routeLink('directions',{pillar:d.id})})),...newsRecords.map(n=>({name:n.title,desc:n.description,search:n.terms.join(' '),type:n.label,href:n.url,external:true})),...methodResources.map(r=>({name:r.name,desc:r.desc,type:r.type,href:r.url,external:true}))];
 const list=term?items.filter(x=>localeSearchText(x.name+' '+x.desc+' '+x.type+' '+(x.search||'')).toLowerCase().includes(term)):items.slice(0,5);
 $('#global-results').innerHTML=list.length?list.map(x=>'<li><a href="'+x.href+'" '+(x.external?'target="_blank" rel="noopener noreferrer"':'')+' data-search-result="true"><div><strong>'+x.name+' ↗</strong><p>'+x.desc+'</p></div>'+badge(x.type,'blue')+'</a></li>').join(''):'<li class="empty"><h2>没有找到“'+esc(q)+'”</h2><p>试试基准名称、研究方向或更简短的关键词。</p></li>';
 $('#search-count').textContent=term?list.length+' 个相关示例':'推荐资料';
};
document.addEventListener('change',e=>{
 if(e.target.id==='direction-filter'){const p=Object.fromEntries(route().params);p.direction=e.target.value;delete p.benchmark;delete p.metric;delete p.page;state.selected.clear();go(route().path,p)}
 if(e.target.id==='topic-picker'){state.selected.clear();go('directions',{pillar:e.target.value,view:route().params.get('view')||'overview'})}
 if(e.target.id==='news-type')replaceQuery('type',e.target.value);
});
document.addEventListener('click',e=>{const term=e.target.closest('[data-news-term]');if(term)replaceQuery('term',term.dataset.newsTerm)});
// portal-v5.js renders after all page and resource modules are loaded.

