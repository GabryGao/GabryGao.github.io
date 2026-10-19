// Resource records are maintained once and surfaced through topic and type views.
// Dates describe source publications, never collection time or current popularity.
const paperRecords = [
 {id:'paper-agentdojo',name:'AgentDojo',title:'AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents',description:'研究工具环境中的提示注入攻击与防御，同时观察正常任务效用。',year:'2024',source:'ETH Zurich / Invariant Labs',url:'https://openreview.net/forum?id=m1YYAQjO3w',source_url:'https://agentdojo.spylab.ai/',direction_ids:['agent-software'],benchmark:'agentdojo'},
 {id:'paper-mm-safetybench',name:'MM-SafetyBench',title:'MM-SafetyBench',description:benchmarkData.find(b=>b.id==='mm-safetybench').desc,year:'2024',source:'MM-SafetyBench 作者团队',url:benchmarkData.find(b=>b.id==='mm-safetybench').url,direction_ids:['foundation-model'],benchmark:'mm-safetybench'},
 {id:'paper-xstest',name:'XSTest',title:'XSTest',description:benchmarkData.find(b=>b.id==='xstest').desc,year:'2024',source:'NAACL 2024',url:benchmarkData.find(b=>b.id==='xstest').url,direction_ids:['foundation-model','human-societal'],benchmark:'xstest'}
];
const dataRecords = [
 {id:'data-safe-rlhf',name:'PKU-SafeRLHF',description:'有用性与无害性偏好数据，供安全对齐研究使用；版本、许可和下载方式见原始数据卡。',source:'PKU-Alignment',kind:'偏好数据集',url:'https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF',source_url:'https://github.com/PKU-Alignment/safe-rlhf',direction_ids:['foundation-model','human-societal']},
 {id:'data-agentdojo',name:'AgentDojo 任务套件',description:'提示注入评测的任务、环境与配置入口。使用时需结合运行文档，不能当作独立问答数据集。',source:'ETH Zurich / Invariant Labs',kind:'任务数据与环境',url:'https://agentdojo.spylab.ai/',direction_ids:['agent-software']},
 {id:'data-risk-repository',name:'The AI Risk Repository',description:'将 AI 风险描述关联到原始资料的研究数据库，可从项目页查看和获取；属于风险资料库。',source:'MIT AI Risk Initiative',kind:'风险资料库',url:'https://airisk.mit.edu/risks',direction_ids:researchDirections.map(d=>d.id)}
];
function pageSection(title,description,href,label='查看全部') {
 return '<div class="section-head"><div><h2>'+title+'</h2><p>'+description+'</p></div>'+(href?'<a class="text-link" href="'+href+'">'+label+' ↗</a>':'')+'</div>';
}
function recordListFor(type,direction='') {
 return (type==='papers'?paperRecords:dataRecords).filter(r=>!direction||r.direction_ids.includes(direction));
}
function libraryRows(records,type) {
 return records.map(r=>'<article class="library-row"><div class="library-record"><div class="library-meta"><span>'+esc(r.source)+'</span><span>'+(type==='papers'?esc(r.year)+' · 论文':esc(r.kind))+'</span></div><h3><a href="'+r.url+'" target="_blank" rel="noopener noreferrer">'+esc(r.name)+' ↗</a></h3><p>'+esc(r.description)+'</p>'+topicTags(r.direction_ids)+(r.benchmark?'<a class="record-related" href="#benchmark/'+r.benchmark+'">查看关联基准 ↗</a>':'')+'</div><a class="record-source" href="'+r.url+'" target="_blank" rel="noopener noreferrer">'+(type==='papers'?'论文原文':'数据与文档')+' ↗</a></article>').join('');
}
function libraryPanel(type,direction='') {
 const q=(route().params.get('q')||'').trim(),all=recordListFor(type,direction),list=all.filter(r=>localeSearchText(r.name+' '+r.description+' '+r.source).toLowerCase().includes(q.toLowerCase()));
 return '<div class="panel-toolbar">'+searchForm('library-search',type==='papers'?'搜索论文名称、研究问题或作者机构':'搜索数据集、任务环境或资料库',q)+'</div><div class="count-row"><span>'+list.length+' 条'+(type==='papers'?'论文':'数据与资料')+'记录</span><span>原始来源 · 按研究方向关联</span></div>'+(list.length?'<div class="library-list">'+libraryRows(list,type)+'</div>':contentEmpty('当前范围暂无'+(type==='papers'?'论文':'数据')+'记录','该方向仍保留研究问题和候选资源清单，可在方向概览中查看；正式资料确认后补充。',direction?routeLink('directions',{pillar:direction}):'#'+type,direction?'返回方向概览':'查看完整列表'))+'<p class="section-footnote">'+(type==='papers'?'论文条目来自已有项目资料，年份按来源记录；此列表不代表最新论文排行。':'本页提供获取原始资料的入口，数据集、任务环境和风险资料库分别标注类型。下载、许可与使用条件以原始发布方为准。')+'</p>';
}
function libraryPage(type) {
 const d=selectedDirection(),title=type==='papers'?'论文资料':'数据与任务';
 return '<div class="wrap task-page library-page">'+pageHead('',title,'按研究问题寻找资料，从原始来源继续阅读与使用。')+'<nav class="tabs" aria-label="资料类型"><a class="tab '+(type==='papers'?'active':'')+'" href="'+scopedLink('papers',d)+'">论文</a><a class="tab '+(type==='datasets'?'active':'')+'" href="'+scopedLink('datasets',d)+'">数据与任务</a><a class="tab" href="'+scopedLink('methods',d)+'">方法与工具</a></nav>'+scopeControl(d).replace('选择方向后，目录、结果和方法共用同一筛选范围。','按方向筛选资料，切换论文与数据时保留范围。')+libraryPanel(type,d)+'</div>';
}
function homepageNews() {
 const feature=newsRecords.find(n=>n.id==='agent-project'),others=[newsRecords.find(n=>n.id==='helm-report'),newsRecords.find(n=>n.id==='unicef'),newsRecords.find(n=>n.id==='mm-paper')];
 return '<section class="section front-news" id="home-updates">'+pageSection('研究动态','从一条进展，找到相关方向与原始资料。','#news','浏览动态')+'<div class="front-news-grid"><article class="feature-news"><div class="feature-meta"><span>精选项目</span><span>'+feature.date+'</span></div><div class="feature-body"><h3><a href="'+feature.url+'" target="_blank" rel="noopener noreferrer">'+feature.title+' ↗</a></h3><p>'+feature.description+'</p>'+topicTags(feature.direction_ids)+'<a class="text-link" href="'+feature.url+'" target="_blank" rel="noopener noreferrer">查看项目与文档 ↗</a></div><div class="feature-source">'+feature.source+'</div></article><div class="front-news-list">'+newsRows(others)+'</div></div><p class="section-footnote">历史资料用于演示选材与标签；当前未接入实时热点采集。</p></section>';
}
function compactDirections() {
 return '<section class="section home-directions" id="home-topics">'+pageSection('从六大研究方向出发','选一个关心的问题，探索论文、数据、基准和公开结果。','#directions','方向总览')+'<div class="direction-entry-grid">'+researchDirections.map(d=>'<a class="direction-entry" href="'+routeLink('directions',{pillar:d.id})+'"><div><h3>'+d.name+'</h3><p>'+d.short+'</p><span class="direction-preview">'+d.children.slice(0,3).join(' · ')+'</span></div><span class="entry-arrow" aria-hidden="true">↗</span></a>').join('')+'</div></section>';
}
function home() {
 const entries=[['papers','论文资料',paperRecords.length],['datasets','数据与任务',dataRecords.length],['benchmarks','评测基准',benchmarkData.length],['results','公开结果',results.length],['directions','研究方向',researchDirections.length]];
 return '<div class="wrap"><section class="portal-hero"><h1>连接 AI 安全<span>研究与评测</span></h1><p>查找基准与公开结果，按六大方向探索论文、数据和工具。</p>'+searchForm('hero-search','搜索研究方向、论文、基准或数据…','',true)+'<nav class="resource-shortcuts" aria-label="按资料类型浏览">'+entries.map(e=>'<a href="#'+e[0]+'">'+e[1]+'<span>'+e[2]+'</span></a>').join('')+'</nav><div class="hero-hint">当前收录示例 · 每条资料保留原始来源</div></section>'+homepageNews()+compactDirections()+'<section class="section homepage-benchmarks">'+pageSection('找到适合问题的评测基准','先看测什么、怎么测，再看模型表现。','#benchmarks','全部基准')+'<div class="index-list">'+[benchmarkData[0],benchmarkData[1],benchmarkData[5]].map((b,i)=>benchmarkRow(b,i,true)).join('')+'</div><a class="method-entry" href="#methods"><span>开始实验之前</span><strong>了解评测方法、运行文档与工具</strong><span>↗</span></a></section><section class="portal-close"><div><h2>让每一次查找，都有据可循。</h2><p>了解平台目标、资料来源与比较方法。</p></div><a class="text-link" href="#about">关于 AI Safety Index ↗</a></section></div>';
}
function topicTabs(d,view) {
 return '<nav class="tabs topic-tabs" aria-label="专题内容">'+[['overview','方向概览'],['papers','论文'],['datasets','数据与任务'],['benchmarks','基准'],['results','评测结果']].map(t=>'<a class="tab '+(view===t[0]?'active':'')+'" '+(view===t[0]?'aria-current="page"':'')+' href="'+routeLink('directions',{pillar:d.id,view:t[0]})+'">'+t[1]+'</a>').join('')+'</nav>';
}
const topicOverviewV4=topicOverview;
topicOverview=function(d) {
 let html=topicOverviewV4(d);
 const start=html.indexOf('<aside class="topic-actions">'),end=html.indexOf('</aside>',start)+8;
 const links=[['papers','阅读相关论文',recordListFor('papers',d.id).length],['datasets','找到数据与任务',recordListFor('datasets',d.id).length],['benchmarks','选择评测基准',benchmarkListFor(d.id).length],['results','查看公开结果',benchmarkListFor(d.id).some(b=>b.id==='helm-safety')?results.length:0]];
 const aside='<aside class="topic-actions">'+links.map(t=>'<a href="'+routeLink('directions',{pillar:d.id,view:t[0]})+'"><span>'+t[1]+'</span><small>'+t[2]+' 条记录</small><b>↗</b></a>').join('')+'<p>论文、数据和评测共享同一方向标签。</p></aside>';
 html=html.slice(0,start)+aside+html.slice(end);
 const preview='<div class="topic-reading-preview"><section>'+pageSection('从论文进入问题','已录入的相关研究。',routeLink('directions',{pillar:d.id,view:'papers'}),'全部论文')+(recordListFor('papers',d.id).length?libraryRows(recordListFor('papers',d.id).slice(0,2),'papers'):'<p class="preview-empty">这个方向的论文资料正在整理。</p>')+'</section><section>'+pageSection('找到数据与任务','实验数据与研究资料入口。',routeLink('directions',{pillar:d.id,view:'datasets'}),'全部数据')+libraryRows(recordListFor('datasets',d.id).slice(0,2),'datasets')+'</section></div>';
 return html.replace('<div class="topic-list-title">',preview+'<div class="topic-list-title">');
};
const searchAllV4=searchAll;
searchAll=function(q) {
 searchAllV4(q);
 const term=q.trim().toLowerCase();
 if(!term)return;
 const additional=[...paperRecords.map(r=>({...r,type:'论文'})),...dataRecords.map(r=>({...r,type:r.kind}))].filter(r=>localeSearchText(r.name+' '+r.description+' '+(r.authors||[]).join(' ')+' '+r.direction_ids.map(id=>getDirection(id)?.name||'').join(' ')).toLowerCase().includes(term));
 if(!additional.length)return;
 const empty=$('#global-results .empty');if(empty)empty.remove();
 $('#global-results').insertAdjacentHTML('beforeend',additional.map(r=>'<li><a href="'+r.url+'" target="_blank" rel="noopener noreferrer" data-search-result="true"><div><strong>'+esc(r.name)+' ↗</strong><p>'+esc(r.description)+'</p></div>'+badge(r.type,'blue')+'</a></li>').join(''));
 $('#search-count').textContent=$$('#global-results li').length+' 个相关记录';
};
document.addEventListener('change',e=>{if(e.target.id==='catalog-sort')replaceQuery('sort',e.target.value)});
// Initial rendering is owned by portal-editorial.js.
