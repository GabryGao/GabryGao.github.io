/* Reviewed catalog records power the benchmark and methods pages without exposing a separate source-directory route. */
var EvaluationCatalog=(()=>{
 const data=typeof SourceCatalogData==='undefined'?{checked_date:'',resources:[]}:SourceCatalogData;
 const pageSize=12;
 const priorityOrder={'P1 看板':0,'P1 目录':1,'P2 扩展':2,'P3 辅助':3};
 const stateOrder={'已下载结果':0,'已下载原始输出':1,'公开结果文件':2,'公开榜单':3,'论文/图表':4,'待核验':5,'工具/环境':6};
 const publicResultStates=new Set(['已下载结果','已下载原始输出','公开结果文件','公开榜单']);
 const integratedByRecord={S022:'helm-safety',S055:'agentdojo',S118:'flames',S135:'finsafety',S149:'safevla'};
 function inDirection(record,direction){const benchmark=integratedByRecord[record.id];return !direction||record.direction_id===direction||(record.related_direction_ids||[]).includes(direction)||(benchmarkDirections[benchmark]||[]).includes(direction)}
 function benchmarkRecords(direction=''){return data.resources.filter(record=>record.result_state!=='工具/环境'&&inDirection(record,direction))}
 function methodKind(record){if(record.result_state==='工具/环境')return 'environment';if(record.data_entries?.length)return 'data';return 'protocol'}
 function methodRecords(direction=''){return data.resources.filter(record=>(record.result_state==='工具/环境'||record.priority.startsWith('P1')||record.data_entries?.length)&&inDirection(record,direction))}
 function integratedBenchmark(record){return integratedByRecord[record.id]||''}
 function matches(record,query){if(!query)return true;const text=[record.id,record.name,record.direction,record.subdomain,record.relation,record.metric,record.result_state,record.priority,record.note,record.data_access].join(' ');return localeSearchText(text).toLocaleLowerCase().includes(query.toLocaleLowerCase())}
 function sort(records,mode='priority'){return [...records].sort(mode==='name'?(a,b)=>a.name.localeCompare(b.name):mode==='state'?(a,b)=>(stateOrder[a.result_state]??9)-(stateOrder[b.result_state]??9)||a.name.localeCompare(b.name):(a,b)=>(priorityOrder[a.priority]??9)-(priorityOrder[b.priority]??9)||(stateOrder[a.result_state]??9)-(stateOrder[b.result_state]??9)||a.id.localeCompare(b.id))}
 function pageModel(records){const requested=Number(route().params.get('page')||1),pages=Math.max(1,Math.ceil(records.length/pageSize)),page=Math.min(pages,Math.max(1,Number.isInteger(requested)?requested:1));return {list:records,page,pages,visible:records.slice((page-1)*pageSize,page*pageSize)}}
 function resultHref(record,direction=''){const benchmark=integratedBenchmark(record);if(!benchmark)return '';const scoped=direction&&(benchmarkDirections[benchmark]||[]).includes(direction)?direction:'';return routeLink('results',{direction:scoped,benchmark})}
 return {data,pageSize,publicResultStates,stateOrder,benchmarkRecords,methodRecords,methodKind,integratedBenchmark,matches,sort,pageModel,resultHref};
})();

function catalogStates(records){return [...new Set(records.map(record=>record.result_state))].sort((a,b)=>(EvaluationCatalog.stateOrder[a]??9)-(EvaluationCatalog.stateOrder[b]??9)||a.localeCompare(b))}
function catalogSnapshot(records){
 const total=records.length,integrated=records.filter(record=>EvaluationCatalog.integratedBenchmark(record)).length,publicResults=records.filter(record=>!EvaluationCatalog.integratedBenchmark(record)&&EvaluationCatalog.publicResultStates.has(record.result_state)).length,papers=records.filter(record=>record.result_state==='论文/图表').length,pending=records.filter(record=>record.result_state==='待核验').length;
 const items=[['站内已接入',integrated,'integrated'],['公开结果入口',publicResults,'public'],['论文或图表',papers,'paper'],['待核验候选',pending,'pending']];
 const width=value=>total?value/total*100:0;
 return '<section class="catalog-snapshot" aria-label="当前范围的评测资源"><div class="catalog-snapshot-copy"><span>REVIEWED EVALUATION MAP</span><h2>当前范围的评测资源</h2><p>目录中的站内结果、公开结果、论文证据与待核验候选分开显示。</p></div><div class="catalog-status-chart" role="img" aria-label="'+total+' 条评测资源的证据状态分布"><div class="catalog-status-bar">'+items.map(([,value,type])=>'<i data-catalog-state="'+type+'" style="width:'+width(value)+'%"></i>').join('')+'</div><div class="catalog-status-legend">'+items.map(([label,value,type])=>'<span><i data-catalog-state="'+type+'"></i><b>'+value+'</b>'+label+'</span>').join('')+'</div></div></section>';
}
function catalogCard(record,direction=''){
 const siteResult=EvaluationCatalog.resultHref(record,direction),publicResult=record.result_url&&record.result_url!==record.url?'<a href="'+esc(record.result_url)+'" target="_blank" rel="noopener noreferrer">查看公开结果'+portalIcon('arrow')+'</a>':'',dataEntry=record.data_entries?.[0],dataLink=dataEntry?'<a href="'+esc(dataEntry.url)+'" target="_blank" rel="noopener noreferrer">公开数据'+portalIcon('arrow')+'</a>':'';
 return '<article class="cp-resource-card catalog-card">'+compactMark(record.name,EvaluationCatalog.publicResultStates.has(record.result_state)?'chart':'book')+'<div class="cp-resource-copy"><div class="catalog-card-top"><span>'+esc(record.result_state)+'</span><span data-keep-original>'+esc(record.subdomain)+'</span></div><h3 data-keep-original><a href="'+esc(record.url)+'" target="_blank" rel="noopener noreferrer">'+esc(record.name)+portalIcon('arrow')+'</a></h3><p data-keep-original>'+esc(record.metric)+'</p><p class="catalog-note" data-keep-original>'+esc(record.note)+'</p><div class="library-meta">'+esc(record.priority)+' · '+esc(record.relation)+' · '+esc(record.checked_date)+'</div><div class="cp-card-actions"><a href="'+esc(record.url)+'" target="_blank" rel="noopener noreferrer">原始项目'+portalIcon('arrow')+'</a>'+publicResult+dataLink+(siteResult?'<a class="catalog-site-result" href="'+siteResult+'">查看站内结果'+portalIcon('arrow')+'</a>':'')+'</div></div></article>';
}
function catalogPagination(model){return model.pages>1?libraryPagination(model):''}

benchmarkPanel=function(direction){
 const params=route().params,query=(params.get('q')||'').trim(),state=params.get('object')||'',sort=params.get('sort')||'priority',records=EvaluationCatalog.benchmarkRecords(direction),states=catalogStates(records);
 const filtered=EvaluationCatalog.sort(records.filter(record=>(!state||record.result_state===state)&&EvaluationCatalog.matches(record,query)),sort),model=EvaluationCatalog.pageModel(filtered);
	 const toolbar='<div class="panel-toolbar catalog-toolbar">'+searchForm('catalog-search','搜索当前范围内的基准、指标或主题',query)+'<label>结果形态<select name="object"><option value="">全部形态</option>'+states.map(value=>'<option value="'+esc(value)+'" '+(value===state?'selected':'')+'>'+esc(value)+'</option>').join('')+'</select></label><label>排序<select id="catalog-sort"><option value="priority" '+(sort==='priority'?'selected':'')+'>按目录优先级</option><option value="state" '+(sort==='state'?'selected':'')+'>按证据状态</option><option value="name" '+(sort==='name'?'selected':'')+'>名称 A–Z</option></select></label></div>';
 return toolbar+catalogSnapshot(records)+'<div class="count-row"><span>'+filtered.length+' 条已核验评测资源</span><span>资料包核验于 '+EvaluationCatalog.data.checked_date+'</span></div>'+(model.visible.length?'<div class="index-list catalog-grid">'+model.visible.map(record=>catalogCard(record,direction)).join('')+'</div>'+catalogPagination(model):contentEmpty('没有符合条件的评测资源','调整关键词、结果形态或子方向后重试。',routeLink(route().path,{direction}),'清除筛选'));
};

function methodSummary(records){
 const counts={environment:0,data:0,protocol:0};for(const record of records)counts[EvaluationCatalog.methodKind(record)]++;
 return '<section class="method-summary" aria-label="当前范围的方法与复现入口"><div><span>METHODS & REPRODUCTION</span><h2>当前范围的方法与复现入口</h2></div><dl><div><dt>'+counts.environment+'</dt><dd>运行工具与环境</dd></div><div><dt>'+counts.data+'</dt><dd>公开数据入口</dd></div><div><dt>'+counts.protocol+'</dt><dd>重点评测协议</dd></div></dl></section>';
}
function methodCard(record){
 const kind=EvaluationCatalog.methodKind(record),labels={environment:'运行工具与环境',data:'公开数据与复现',protocol:'重点评测协议'},dataEntry=record.data_entries?.[0],result=record.result_url&&record.result_url!==record.url?'<a href="'+esc(record.result_url)+'" target="_blank" rel="noopener noreferrer">结果入口'+portalIcon('arrow')+'</a>':'';
 return '<article class="cp-resource-card catalog-card method-card">'+compactMark(record.name,kind==='environment'?'layers':kind==='data'?'book':'chart')+'<div class="cp-resource-copy"><div class="catalog-card-top"><span>'+labels[kind]+'</span><span data-keep-original>'+esc(record.subdomain)+'</span></div><h3 data-keep-original><a href="'+esc(record.url)+'" target="_blank" rel="noopener noreferrer">'+esc(record.name)+portalIcon('arrow')+'</a></h3><p data-keep-original>'+esc(record.metric)+'</p><p class="catalog-note" data-keep-original>'+esc(record.note)+'</p><div class="library-meta">'+esc(record.result_state)+' · '+esc(record.priority)+'</div><div class="cp-card-actions"><a href="'+esc(record.url)+'" target="_blank" rel="noopener noreferrer">原始资料'+portalIcon('arrow')+'</a>'+(dataEntry?'<a href="'+esc(dataEntry.url)+'" target="_blank" rel="noopener noreferrer">数据入口'+portalIcon('arrow')+'</a>':'')+result+'</div></div></article>';
}
function methodGuide(direction=''){
 const selected=getDirection(direction),principle=selected?.principle||'明确风险问题、评测对象、任务协议与评分方法，再判断结果能否比较。',note=selected?.note||'不同基准、模型版本、攻击配置与评分器的结果不合成为统一安全总分。';
 const steps=[['01','测什么','先确认风险问题、评测对象与任务边界。'],['02','怎么测','保留数据集、任务、攻击、防御与运行配置。'],['03','看什么指标','分清越高越好、越低越好及安全—效用权衡。'],['04','能不能比较','只比较同一协议、模型版本与评分器下的结果。']];
 return '<section class="method-guide"><header><span>READING AN EVALUATION</span><h2>如何读一条测评</h2></header><div>'+steps.map(([number,title,desc])=>'<article><b>'+number+'</b><h3>'+title+'</h3><p>'+desc+'</p></article>').join('')+'</div></section><section class="method-boundary"><div><span>CURRENT COMPARISON BOUNDARY</span><h2>当前方向的比较边界</h2></div><div><p>'+esc(principle)+'</p><p>'+esc(note)+'</p></div></section>';
}
compactMethodCards=function(direction=''){
 const subtopic=route().params.get('subtopic')||'',records=EvaluationCatalog.sort(EvaluationCatalog.methodRecords(direction).filter(record=>!subtopic||PortalCompact.matches({...record,description:record.metric,tags:[record.subdomain,record.relation,record.result_state]},subtopic,direction))).slice(0,6);
 return records.length?'<div class="resource-list">'+records.map(methodCard).join('')+'</div><a class="methods-embed-more" href="'+scopedLink('methods',direction)+'">查看全部方法与复现入口'+portalIcon('arrow')+'</a>':contentEmpty('这个方向暂无已录入方法资料','确认资料来源与适用范围后，再补充到同一资源库。',scopedLink('methods',''),'浏览全部方法');
};

methodsPage=function(){
 const direction=selectedDirection(),params=route().params,query=(params.get('q')||'').trim(),kind=params.get('object')||'',records=EvaluationCatalog.methodRecords(direction),filtered=EvaluationCatalog.sort(records.filter(record=>(!kind||EvaluationCatalog.methodKind(record)===kind)&&EvaluationCatalog.matches(record,query))),model=EvaluationCatalog.pageModel(filtered);
	 const toolbar='<div class="panel-toolbar method-toolbar">'+searchForm('method-search','搜索方法、数据或运行环境',query)+'<label>资源类型<select name="object"><option value="">全部类型</option><option value="environment" '+(kind==='environment'?'selected':'')+'>运行工具与环境</option><option value="data" '+(kind==='data'?'selected':'')+'>公开数据与复现</option><option value="protocol" '+(kind==='protocol'?'selected':'')+'>重点评测协议</option></select></label></div>';
 return '<div class="wrap task-page cp-evaluation">'+compactEvalHead('基准与评测')+evalTabs('methods')+scopeControl(direction)+toolbar+methodSummary(records)+'<div class="count-row"><span>'+filtered.length+' 条记录</span><span>原始来源、数据入口与结果入口分别标注</span></div>'+(model.visible.length?'<div class="resource-list catalog-grid">'+model.visible.map(methodCard).join('')+'</div>'+catalogPagination(model):contentEmpty('没有符合条件的方法资料','调整关键词或资源类型后重试。',scopedLink('methods',direction),'清除筛选'))+methodGuide(direction)+'</div>';
};
