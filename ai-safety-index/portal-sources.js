/* Reviewed source catalog: discovery records are kept separate from formal benchmark results. */
var PortalSources=(()=>{
 'use strict';
 const pageSize=18;
 const priorityOrder={'P1 看板':0,'P1 目录':1,'P2 扩展':2,'P3 辅助':3};
 const base='research-source/catalog-2026-10-22/';
 const downloads=[
  ['AI_Safety_Index_数据来源汇总.html','离线来源浏览器','包含资源、入口与历史候选的独立筛选页面'],
  ['六大方向来源清单.csv','六大方向来源清单 CSV','171 项资源的表格版本'],
  ['source-catalog.json','结构化来源目录 JSON','资源、数据入口、许可备注与核验记录'],
  ['入口与参考网站.csv','入口与参考网站 CSV','21 个聚合入口、知识库与参考站'],
  ['扩展候选线索_149项.csv','历史候选线索 CSV','149 项未逐项重核的历史目录线索'],
  ['结果接入清单.csv','结果接入清单 CSV','21 个结果获取路径与访问状态'],
  ['评测结果样例.csv','评测结果样例 CSV','2696 条接入样例；不是跨基准排名'],
  ['result-samples.json','评测结果样例 JSON','与 CSV 对应的结构化接入样例'],
  ['result-summary.json','评测结果汇总 JSON','按项目与结果形态整理的汇总信息'],
  ['result-file-manifest.json','结果文件清单 JSON','291 份研究快照的原始 URL 与 SHA-256'],
  ['summary.json','汇总统计 JSON','资源、方向、状态与文件数量'],
  ['README.txt','原始资料包说明','资料包内容、使用要点与核验边界'],
  ['WEB_README.txt','公开包说明','已发布文件与未镜像快照的边界说明']
 ];
 function params(){return route().params}
 function selectedView(){return ['resources','portals','downloads'].includes(params().get('view'))?params().get('view'):'resources'}
 function activeFilters(){const p=params();return {query:(p.get('q')||'').trim(),direction:p.get('direction')||'',state:p.get('state')||'',priority:p.get('priority')||''}}
 function records(){
  const active=activeFilters(),needle=active.query.toLocaleLowerCase();
  return SourceCatalogData.resources.filter(record=>{
   if(active.direction&&record.direction_id!==active.direction&&!record.related_direction_ids.includes(active.direction))return false;
   if(active.state&&record.result_state!==active.state)return false;
   if(active.priority&&record.priority!==active.priority)return false;
   if(!needle)return true;
   const text=[record.id,record.name,record.direction,record.subdomain,record.relation,record.metric,record.result_state,record.note,record.data_access,record.license_note].join(' ');
   return localeSearchText(text).toLocaleLowerCase().includes(needle);
  }).sort((a,b)=>(priorityOrder[a.priority]??9)-(priorityOrder[b.priority]??9)||a.id.localeCompare(b.id));
 }
 function metric(label,value){return '<span><strong>'+value+'</strong>'+label+'</span>'}
 function summaryStrip(){const summary=SourceCatalogData.summary;return '<section class="source-summary" aria-label="来源目录统计">'+metric('已核验资源',summary.resources)+metric('参考入口',summary.portals)+metric('历史候选',summary.historical_candidates)+metric('结果文件清单',summary.result_files)+'</section>'}
 function tabs(view){return '<nav class="source-tabs" aria-label="来源目录栏目">'+[['resources','资源目录'],['portals','参考入口'],['downloads','公开数据包']].map(([id,label])=>'<a class="'+(view===id?'active':'')+'" '+(view===id?'aria-current="page"':'')+' href="'+routeLink('sources',{view:id})+'">'+label+'</a>').join('')+'</nav>'}
 function dataEntries(record){
  if(!record.data_entries.length)return '';
  return '<div class="source-data-links">'+record.data_entries.map(entry=>'<a href="'+esc(entry.url)+'" target="_blank" rel="noopener noreferrer" data-keep-original><span>'+esc(entry.name)+'</span><small>'+(entry.gated?'受限访问':'公开元数据')+(entry.license?' · '+esc(entry.license):'')+'</small></a>').join('')+'</div>';
 }
 function recordCard(record){
  const result=record.result_url&&record.result_url!==record.url?'<a href="'+esc(record.result_url)+'" target="_blank" rel="noopener noreferrer">结果入口'+portalIcon('arrow')+'</a>':'';
  return '<article class="source-card"><div class="source-card-top"><span>'+esc(record.id)+'</span><span class="source-priority" data-priority="'+esc(record.priority)+'">'+esc(record.priority)+'</span></div><div class="source-card-main"><div><p class="source-direction">'+esc(record.direction)+' · '+esc(record.subdomain)+'</p><h2 data-keep-original><a href="'+esc(record.url)+'" target="_blank" rel="noopener noreferrer">'+esc(record.name)+portalIcon('arrow')+'</a></h2></div><span class="source-state">'+esc(record.result_state)+'</span></div><dl><div><dt>评测或用途</dt><dd data-keep-original>'+esc(record.metric)+'</dd></div><div><dt>接入说明</dt><dd data-keep-original>'+esc(record.note)+'</dd></div></dl>'+dataEntries(record)+'<details><summary>数据条件与许可</summary><p data-keep-original>'+esc(record.data_access)+'</p><p data-keep-original>'+esc(record.license_note)+'</p></details><footer><span>'+esc(record.evidence_status)+' · '+esc(record.checked_date)+'</span><div><a href="'+esc(record.evidence_url)+'" target="_blank" rel="noopener noreferrer">核验证据'+portalIcon('arrow')+'</a>'+result+'</div></footer></article>';
 }
 function filterPanel(list){
  const active=activeFilters(),states=Object.keys(SourceCatalogData.summary.by_result_state),priorities=Object.keys(SourceCatalogData.summary.by_priority);
  return '<form id="source-search" class="source-filters"><label><span>搜索来源</span><input name="q" type="search" value="'+esc(active.query)+'" placeholder="名称、主题、指标或备注"></label><label><span>研究方向</span><select id="source-direction"><option value="">全部方向</option>'+researchDirections.map(direction=>'<option value="'+direction.id+'" '+(active.direction===direction.id?'selected':'')+'>'+esc(direction.name)+'</option>').join('')+'</select></label><label><span>结果形态</span><select id="source-state"><option value="">全部形态</option>'+states.map(state=>'<option '+(active.state===state?'selected':'')+'>'+esc(state)+'</option>').join('')+'</select></label><label><span>目录优先级</span><select id="source-priority"><option value="">全部优先级</option>'+priorities.map(priority=>'<option '+(active.priority===priority?'selected':'')+'>'+esc(priority)+'</option>').join('')+'</select></label><button type="submit">筛选</button><button type="button" data-source-reset>清除</button></form><div class="source-count"><strong>'+list.length+'</strong><span>项符合当前条件</span></div>';
 }
 function pagination(total,page){
  const pages=Math.ceil(total/pageSize);if(pages<2)return '';
  const active=Object.fromEntries(params());
  return '<nav class="source-pages" aria-label="来源目录分页">'+(page>1?'<a href="'+routeLink('sources',{...active,page:page-1})+'">上一页</a>':'<span></span>')+'<strong>第 '+page+' / '+pages+' 页</strong>'+(page<pages?'<a href="'+routeLink('sources',{...active,page:page+1})+'">下一页</a>':'<span></span>')+'</nav>';
 }
 function resourcesView(){
  const list=records(),pages=Math.max(1,Math.ceil(list.length/pageSize)),page=Math.max(1,Math.min(pages,Number(params().get('page')||1)||1)),visible=list.slice((page-1)*pageSize,page*pageSize);
  return filterPanel(list)+(visible.length?'<div class="source-grid">'+visible.map(recordCard).join('')+'</div>':'<div class="source-empty"><h2>没有符合条件的来源</h2><p>调整关键词或筛选条件后重试。</p></div>')+pagination(list.length,page);
 }
 function portalsView(){return '<div class="source-portal-grid">'+SourceCatalogData.portals.map(portal=>'<article><div data-keep-original><span>'+esc(portal.id)+'</span><span>'+esc(portal.status)+'</span></div><h2 data-keep-original><a href="'+esc(portal.url)+'" target="_blank" rel="noopener noreferrer">'+esc(portal.name)+portalIcon('arrow')+'</a></h2><p data-keep-original>'+esc(portal.purpose)+'</p><p data-keep-original>'+esc(portal.note)+'</p><footer>'+esc(portal.checked_date)+'</footer></article>').join('')+'</div>'}
 function downloadsView(){return '<div class="source-package-note"><h2>公开索引与研究接入文件</h2><p>公开的是目录、摘要、结果接入样例和文件校验清单。许可未确认的网页证据与结果快照不在本站镜像，请从记录中的原始 URL 获取。</p></div><div class="source-downloads">'+downloads.map(([file,name,desc])=>'<a href="'+base+file+'" target="_blank" rel="noopener noreferrer"><span><strong>'+name+'</strong><small>'+desc+'</small></span>'+portalIcon('download')+'</a>').join('')+'</div><div class="source-boundaries"><h2>使用边界</h2><ul><li>171 项包含基准、数据集、工具、环境、报告与结果入口，不等于 171 个正式安全基准。</li><li>2696 条指标是 10 个项目的接入样例，不提供跨基准总分或当前模型排名。</li><li>历史候选来自已停止更新的目录，未逐项重新核验；正式收录前仍需检查版本、许可与原始证据。</li><li>结果比较必须保留基准版本、任务、模型快照、框架、防护、预算与评分器。</li></ul></div>'}
 function page(){
  const view=selectedView();
  return '<div class="wrap source-page"><header class="source-hero"><div><span data-keep-original>AI SAFETY · SOURCE CATALOG</span><h1>AI 安全数据来源目录</h1><p>把基准、数据集、工具、环境、结果入口与核验证据分开记录，先回答资料从哪里来，再讨论能否比较。</p></div><a href="'+base+'AI_Safety_Index_数据来源汇总.html" target="_blank" rel="noopener noreferrer">打开离线浏览器'+portalIcon('arrow')+'</a></header>'+summaryStrip()+tabs(view)+(view==='resources'?resourcesView():view==='portals'?portalsView():downloadsView())+'<p class="source-footnote">目录核验日期：'+esc(SourceCatalogData.checked_date)+'。未知值保持为空，抓取日期不视为测试日期，历史成绩不标记为最新排名。</p></div>';
 }
 return {page};
})();

const sourceCatalogBaseBenchmarkPanel=benchmarkPanel;
const sourceCatalogPriorityOrder={'P1 看板':0,'P1 目录':1,'P2 扩展':2,'P3 辅助':3};
function sourceCatalogRecordsForDirection(direction){
 if(!direction||typeof SourceCatalogData==='undefined')return [];
 return SourceCatalogData.resources.filter(record=>record.direction_id===direction||record.related_direction_ids.includes(direction));
}
function sourceCatalogBenchmarkRow(record,index,direction){
 const resultLink=record.result_url&&record.result_url!==record.url?'<a href="'+esc(record.result_url)+'" target="_blank" rel="noopener noreferrer">结果入口'+portalIcon('arrow')+'</a>':'';
 const catalogLink=routeLink('sources',{direction,q:record.name});
 return '<article class="bench-row source-benchmark-row"><span class="row-no">'+String(index+1).padStart(2,'0')+'</span><div><div class="source-benchmark-kicker"><span data-keep-original>'+esc(record.id)+'</span><span class="source-priority" data-priority="'+esc(record.priority)+'">'+esc(record.priority)+'</span></div><h3 data-keep-original><a href="'+esc(record.url)+'" target="_blank" rel="noopener noreferrer">'+esc(record.name)+'</a></h3><p data-keep-original>'+esc(record.metric)+'</p><div class="row-meta"><span class="label blue">'+esc(record.subdomain)+'</span><span>'+esc(record.result_state)+'</span><span>·</span><span>'+esc(record.relation)+'</span></div><div class="source-benchmark-links">'+resultLink+'<a href="'+catalogLink+'">目录记录'+portalIcon('arrow')+'</a></div></div><a class="row-arrow" href="'+esc(record.url)+'" target="_blank" rel="noopener noreferrer" aria-label="查看 '+esc(record.name)+' 原始资料">↗</a></article>';
}
benchmarkPanel=function(direction){
 const sourceRecords=sourceCatalogRecordsForDirection(direction);
 if(!sourceRecords.length)return sourceCatalogBaseBenchmarkPanel(direction);
 const p=route().params,q=(p.get('q')||'').trim(),stateFilter=p.get('object')||'',sort=p.get('sort')||'priority',subtopic=p.get('subtopic')||'';
 const states=[...new Set(sourceRecords.map(record=>record.result_state))].sort((a,b)=>a.localeCompare(b));
 const needle=q.toLocaleLowerCase();
 const list=sourceRecords.filter(record=>{
  if(stateFilter&&record.result_state!==stateFilter)return false;
  if(subtopic&&!PortalCompact.matches({...record,description:record.metric,tags:[record.subdomain,record.relation,record.result_state]},subtopic,direction))return false;
  if(!needle)return true;
  return localeSearchText([record.name,record.subdomain,record.relation,record.metric,record.result_state,record.priority,record.note].join(' ')).toLocaleLowerCase().includes(needle);
 }).sort(sort==='name'?(a,b)=>a.name.localeCompare(b.name):(a,b)=>(sourceCatalogPriorityOrder[a.priority]??9)-(sourceCatalogPriorityOrder[b.priority]??9)||a.id.localeCompare(b.id));
 return '<div class="panel-toolbar">'+searchForm('catalog-search','搜索当前范围内的评测资源',q)+'<label>结果形态<select name="object"><option value="">全部形态</option>'+states.map(value=>'<option value="'+esc(value)+'" '+(value===stateFilter?'selected':'')+'>'+esc(value)+'</option>').join('')+'</select></label><label>排序<select id="catalog-sort"><option value="priority" '+(sort!=='name'?'selected':'')+'>按目录优先级</option><option value="name" '+(sort==='name'?'selected':'')+'>名称 A–Z</option></select></label></div><div class="count-row"><span>'+list.length+' 条已核验评测资源</span><span>来源目录 · 按研究方向筛选</span></div>'+(list.length?'<div class="index-list source-benchmark-list">'+list.map((record,index)=>sourceCatalogBenchmarkRow(record,index,direction)).join('')+'</div>':contentEmpty('没有符合条件的评测资源','调整关键词、结果形态或子方向后重试。',routeLink('directions',{pillar:direction,view:'benchmarks'}),'清除筛选'));
};

const sourceBaseHome=home;
home=function(){
 let html=sourceBaseHome();
 return html.replace('<nav class="home-quick-links" aria-label="常用入口">','<nav class="home-quick-links" aria-label="常用入口"><a href="#sources">来源目录'+portalIcon('arrow')+'</a>');
};

const sourceBaseRender=render;
render=function(){
 const current=route();
 if(current.path!=='sources'){sourceBaseRender();return}
 if(document.body){document.body.classList.add('madeo-subpage','compact-portal');document.body.classList.remove('madeo-home');document.body.dataset.madeoRoute='sources'}
 $('#main').innerHTML=PortalSources.page();
 const pageLabel=document.querySelector('.md-page-label');if(pageLabel)pageLabel.textContent='来源目录';
 $$('[data-nav]').forEach(link=>{const active=link.dataset.nav==='directions';link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
 $('#primary-nav').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false');$('#menu-button').setAttribute('aria-label','打开导航');
 document.title='来源目录 · AI Safety Index';updateTray();
};
document.addEventListener('submit',event=>{if(event.target.id!=='source-search')return;event.preventDefault();replaceQuery('q',new FormData(event.target).get('q').trim())});
document.addEventListener('change',event=>{if(event.target.id==='source-direction')replaceQuery('direction',event.target.value);if(event.target.id==='source-state')replaceQuery('state',event.target.value);if(event.target.id==='source-priority')replaceQuery('priority',event.target.value)});
document.addEventListener('click',event=>{if(event.target.closest('[data-source-reset]'))go('sources')});
render();
