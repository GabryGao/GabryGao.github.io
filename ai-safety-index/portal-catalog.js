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
 return {data,pageSize,publicResultStates,stateOrder,inDirection,benchmarkRecords,methodRecords,methodKind,integratedBenchmark,matches,sort,pageModel,resultHref};
})();

var EvaluationTopicCatalog=(()=>{
 const colors=['#294fa1','#28735d','#a64e3c','#8b6a21','#6b5a8d','#337a87'];
 const definitions=[
  {id:'alignment',name:'综合安全与对齐',featuredId:'S022',directionIds:['foundation-model','human-societal'],terms:['综合安全','安全评级','多维可信性','安全知识','安全与责任','多语言安全','政策安全分类','安全偏好','模型对齐','alignment']},
  {id:'jailbreak',name:'越狱与有害协助',featuredId:'S030',directionIds:['foundation-model','agent-software','human-societal','ai-x-science'],terms:['越狱','有害协助','红队','有害指令','严重危害','危害识别','jailbreak','harmful']},
  {id:'refusal',name:'拒答与校准',featuredId:'S033',directionIds:['foundation-model','human-societal','ai-x-science'],terms:['拒答','过度拒答','无害性','refusal','over-refusal']},
  {id:'factuality',name:'事实性与幻觉',featuredId:'S040',directionIds:['foundation-model','agent-software','human-societal','ai-x-science'],terms:['事实','幻觉','真实性','迎合','检索生成','证据忠实','factual','hallucination','truthful']},
  {id:'fairness',name:'公平、偏见与毒性',featuredId:'S106',directionIds:['foundation-model','human-societal'],terms:['偏见','公平','刻板印象','毒性','有毒','仇恨','政治倾向','观点偏见','bias','fairness','toxicity']},
  {id:'privacy',name:'隐私、泄露与遗忘',featuredId:'S013',directionIds:['data-privacy','foundation-model','agent-software','human-societal'],terms:['隐私','泄露','成员推断','遗忘','PII','模型窃取','数据提取','privacy','unlearning']},
  {id:'integrity',name:'投毒、后门与完整性',featuredId:'S016',directionIds:['data-privacy','physical-ai'],terms:['投毒','后门','木马','数据完整性','异常检测','poison','backdoor','trojan']},
  {id:'agents',name:'智能体与工具调用',featuredId:'S060',directionIds:['agent-software'],terms:['智能体','工具调用','工具使用','工具滥用','多步','动态环境','计算机使用','双控制','agent','tool use','computer use']},
  {id:'injection',name:'提示注入与间接攻击',featuredId:'S055',directionIds:['agent-software'],terms:['提示注入','注入防御','工具返回注入','网页智能体提示注入','提示攻击','prompt injection']},
  {id:'cyber',name:'网络与代码安全',featuredId:'S071',directionIds:['agent-software','physical-ai','ai-x-science'],terms:['网络','代码安全','漏洞','攻防','网络能力','cyber','vulnerability','code security']},
  {id:'multimodal',name:'多模态与生成安全',featuredId:'S045',directionIds:['foundation-model'],terms:['多模态','视觉','全模态','视频','文生图','视觉语言','图像生成','multimodal','vision-language']},
  {id:'embodied',name:'具身智能与自动驾驶',featuredId:'S149',directionIds:['physical-ai'],terms:['驾驶','具身','机器人','物理','VLA','强化学习','安全控制','碰撞','危险任务规划','driving','robot']},
  {id:'social',name:'伦理与社会影响',featuredId:'S119',directionIds:['human-societal'],terms:['伦理','社会危害','政治','欺骗','迎合','自我认知','价值测量','ethics','deception']},
  {id:'children',name:'儿童与青少年安全',featuredId:'S158',directionIds:['human-societal'],terms:['未成年人','儿童','青少年','年龄分层','child','teen']},
  {id:'science',name:'生物、医疗与科研安全',featuredId:'S127',directionIds:['ai-x-science'],terms:['生物','医学','医疗','健康','化学','实验室','科研','科学','bio','medical','chemistry','science']},
  {id:'finance',name:'金融与专业领域',featuredId:'S135',directionIds:['ai-x-science'],terms:['金融','法律','专业领域','finance','legal']},
  {id:'infrastructure',name:'工业与关键基础设施',featuredId:'S154',directionIds:['physical-ai','ai-x-science'],terms:['工业','物联网','智能合约','关键基础设施','industrial','IoT','smart contract']}
 ].map((definition,index)=>({...definition,color:colors[index%colors.length]}));
 const evidenceDefinitions=[
  {id:'integrated',name:'站内可视化结果',color:'#294fa1',matches:record=>Boolean(EvaluationCatalog.integratedBenchmark(record))},
  {id:'downloaded',name:'已下载结果',color:'#28735d',matches:record=>record.result_state==='已下载结果'||record.result_state==='已下载原始输出'},
  {id:'leaderboard',name:'公开榜单',color:'#337a87',matches:record=>record.result_state==='公开榜单'},
  {id:'result-file',name:'公开结果文件',color:'#8b6a21',matches:record=>record.result_state==='公开结果文件'},
  {id:'paper',name:'论文/图表',color:'#a64e3c',matches:record=>record.result_state==='论文/图表'},
  {id:'pending',name:'待核验',color:'#6b5a8d',matches:record=>record.result_state==='待核验'}
 ];
 function text(record){return [record.name,record.subdomain,record.relation,record.metric,record.note,record.data_access].filter(Boolean).join(' ').toLocaleLowerCase()}
 function get(id){return definitions.find(definition=>definition.id===id)||null}
 function matches(record,definition){if(!definition)return true;if(definition.directionIds&&!definition.directionIds.includes(record.direction_id))return false;const haystack=text(record);return definition.terms.some(term=>haystack.includes(term.toLocaleLowerCase()))}
 function representative(records,definition){return records.find(record=>record.id===definition?.featuredId)||EvaluationCatalog.sort(records)[0]}
 function topics(records){return definitions.map(definition=>{const matchesList=records.filter(record=>matches(record,definition));return {definition,records:matchesList}}).filter(item=>item.records.length)}
 function evidenceMatches(record,id){if(!id)return true;const definition=evidenceDefinitions.find(item=>item.id===id||item.name===id);return definition?definition.matches(record):record.result_state===id}
 function evidence(records){return evidenceDefinitions.map(definition=>({definition,records:records.filter(definition.matches)})).filter(item=>item.records.length)}
 return {definitions,evidenceDefinitions,get,matches,representative,topics,evidenceMatches,evidence};
})();

function catalogStates(records){return [...new Set(records.map(record=>record.result_state))].sort((a,b)=>(EvaluationCatalog.stateOrder[a]??9)-(EvaluationCatalog.stateOrder[b]??9)||a.localeCompare(b))}
const catalogDirectionColors={'data-privacy':'#28735d','foundation-model':'#294fa1','agent-software':'#a64e3c','physical-ai':'#8b6a21','human-societal':'#6b5a8d','ai-x-science':'#337a87'};
function catalogFilterHref(direction,key,value){
 const params=route().params,next={direction:direction||params.get('direction')||'',q:params.get('q')||'',topic:params.get('topic')||'',object:params.get('object')||'',sort:params.get('sort')||''},current=key==='direction'?next.direction:next[key];
 next[key]=current===value?'':value;return routeLink('benchmarks',next);
}
function catalogBarRows(items,{direction,key,activeValue,dataName}){
 const max=Math.max(1,...items.map(item=>item.value));
 return items.length?'<div class="catalog-bar-list">'+items.map(item=>'<a class="catalog-bar-row '+(item.id===activeValue?'active':'')+'" data-'+dataName+'="'+esc(item.id)+'" href="'+catalogFilterHref(direction,key,item.id)+'" style="--catalog-chart-color:'+item.color+'"><span>'+esc(item.label)+'</span><i><b style="width:'+Math.max(4,item.value/max*100)+'%"></b></i><strong>'+item.value+'</strong></a>').join('')+'</div>':'<p class="catalog-chart-empty">暂无分布数据</p>';
}
function catalogSnapshot(records,direction='',activeTopic='',activeState=''){
 const total=records.length,integrated=records.filter(record=>EvaluationCatalog.integratedBenchmark(record)).length,publicResults=records.filter(record=>!EvaluationCatalog.integratedBenchmark(record)&&EvaluationCatalog.publicResultStates.has(record.result_state)).length,papers=records.filter(record=>record.result_state==='论文/图表').length,pending=records.filter(record=>record.result_state==='待核验').length;
 const statusItems=[['站内已接入',integrated,'integrated'],['公开结果入口',publicResults,'public'],['论文或图表',papers,'paper'],['待核验候选',pending,'pending']],activeStatus=['downloaded','leaderboard','result-file'].includes(activeState)?'public':activeState,width=value=>total?value/total*100:0;
 const allTopics=EvaluationTopicCatalog.topics(records),topicItems=allTopics.sort((a,b)=>b.records.length-a.records.length||a.definition.name.localeCompare(b.definition.name)).slice(0,8).map(item=>({id:item.definition.id,label:item.definition.name,value:item.records.length,color:item.definition.color}));
 const directionItems=researchDirections.map(item=>({id:item.id,label:item.name,value:records.filter(record=>EvaluationCatalog.inDirection(record,item.id)).length,color:catalogDirectionColors[item.id]})).filter(item=>item.value);
 return '<section class="catalog-snapshot" aria-labelledby="catalog-snapshot-title"><header class="catalog-snapshot-head"><div class="catalog-snapshot-copy"><span>REVIEWED EVALUATION MAP</span><h2 id="catalog-snapshot-title">目录筛选概览</h2><p>图表随研究方向、评测主题、结果形态和关键词同步更新。</p></div><dl class="catalog-snapshot-metrics"><div><dt>'+total+'</dt><dd>匹配资源</dd></div><div><dt>'+allTopics.length+'</dt><dd>涉及主题</dd></div><div><dt>'+integrated+'</dt><dd>站内结果</dd></div></dl></header><div class="catalog-chart-grid"><figure class="catalog-chart catalog-topic-chart"><figcaption><div><span>TOP EVALUATION TOPICS</span><h3>高频评测主题</h3></div><small>主题可交叉重叠</small></figcaption>'+catalogBarRows(topicItems,{direction,key:'topic',activeValue:activeTopic,dataName:'catalog-topic'})+'</figure><figure class="catalog-chart catalog-direction-chart"><figcaption><div><span>RESEARCH COVERAGE</span><h3>六大方向覆盖</h3></div><small>一条资料可关联多个方向</small></figcaption>'+catalogBarRows(directionItems,{direction,key:'direction',activeValue:direction,dataName:'catalog-direction'})+'</figure><figure class="catalog-chart catalog-evidence-chart"><figcaption><div><span>EVIDENCE STATUS</span><h3>证据状态构成</h3></div><small>状态互斥，合计为当前筛选</small></figcaption><div class="catalog-status-chart" role="img" aria-label="'+total+' 条评测资源的证据状态分布"><div class="catalog-status-bar">'+statusItems.map(([,value,type])=>'<i data-catalog-state="'+type+'" style="width:'+width(value)+'%"></i>').join('')+'</div><div class="catalog-status-legend">'+statusItems.map(([label,value,type])=>'<span class="'+(activeStatus===type?'active':'')+'"><i data-catalog-state="'+type+'"></i><b>'+value+'</b>'+label+'</span>').join('')+'</div></div></figure></div></section>';
}

function evaluationDirectoryCard({kind,title,description,representative,count,href,color,direction='',active=false,keepTitle=false,action='查看同类资源'}){
 return '<a class="evaluation-directory-card '+(active?'active':'')+'" data-directory-kind="'+kind+'" '+(direction?'data-direction="'+esc(direction)+'" ':'')+'href="'+href+'" style="--topic-accent:'+color+'"><div class="evaluation-directory-card-head"><span>'+kind+'</span><h4'+(keepTitle?' data-keep-original':'')+'>'+esc(title)+'</h4></div><p '+(kind==='研究方向'?'':'data-keep-original')+'>'+esc(description)+'</p><div class="evaluation-directory-example"><span>代表资料</span><strong data-keep-original>'+esc(representative.name)+'</strong></div><footer><span><b>'+count+'</b> 条资源</span><span>'+action+portalIcon('arrow')+'</span></footer></a>';
}
function evaluationDirectoryGroup(title,description,cards,id){
 return '<section class="evaluation-directory-group" aria-labelledby="'+id+'"><header><div><h3 id="'+id+'">'+title+'</h3><p>'+description+'</p></div><span>'+cards.length+' 个入口</span></header><div class="evaluation-directory-grid" data-directory-grid="'+id+'">'+cards.join('')+'</div></section>';
}
function evaluationSubdomainGroups(records,direction=''){
 const groupsFor=list=>{
  const map=new Map();for(const record of list){const key=record.subdomain||'未分类';if(!map.has(key))map.set(key,[]);map.get(key).push(record)}
  return [...map].map(([name,items])=>({name,records:items,representative:EvaluationCatalog.sort(items)[0]})).sort((a,b)=>b.records.length-a.records.length||a.representative.id.localeCompare(b.representative.id));
 };
 if(direction)return groupsFor(records).slice(0,12);
 return researchDirections.flatMap(item=>groupsFor(records.filter(record=>record.direction_id===item.id)).slice(0,2));
}
function evaluationTopicDirectory(direction=''){
 const records=EvaluationCatalog.benchmarkRecords(direction),topics=EvaluationTopicCatalog.topics(records),evidence=EvaluationTopicCatalog.evidence(records),activeDirection=direction||'',integrated=records.filter(record=>EvaluationCatalog.integratedBenchmark(record)).length;
 const directionCards=researchDirections.map((item,index)=>{const scoped=EvaluationCatalog.benchmarkRecords(item.id),representative=EvaluationCatalog.sort(scoped)[0];return evaluationDirectoryCard({kind:'研究方向',title:item.name,description:item.short,representative,count:scoped.length,href:routeLink('results',{direction:item.id}),color:['#28735d','#294fa1','#a64e3c','#8b6a21','#6b5a8d','#337a87'][index],direction:item.id,active:item.id===activeDirection,action:'进入方向'})});
 const topicCards=topics.map(({definition,records:topicRecords})=>{const representative=EvaluationTopicCatalog.representative(topicRecords,definition),description=[representative.subdomain,representative.metric].filter(Boolean).join(' · ');return evaluationDirectoryCard({kind:'评测主题',title:definition.name,description,representative,count:topicRecords.length,href:routeLink('benchmarks',{direction,topic:definition.id}),color:definition.color})});
 const subdomainCards=evaluationSubdomainGroups(records,direction).map((group,index)=>evaluationDirectoryCard({kind:'细分领域',title:group.name,description:group.representative.metric,representative:group.representative,count:group.records.length,href:routeLink('benchmarks',{direction:direction||group.representative.direction_id,q:group.name}),color:['#337a87','#294fa1','#28735d','#a64e3c','#8b6a21','#6b5a8d'][index%6],keepTitle:true}));
 const evidenceCards=evidence.map(({definition,records:evidenceRecords})=>{const representative=EvaluationCatalog.sort(evidenceRecords)[0];return evaluationDirectoryCard({kind:'证据形态',title:definition.name,description:representative.metric,representative,count:evidenceRecords.length,href:routeLink('benchmarks',{direction,object:definition.id}),color:definition.color})});
 return '<section class="evaluation-directory" aria-labelledby="evaluation-directory-title"><header class="evaluation-directory-intro"><div><span>EVALUATION TOPIC DIRECTORY</span><h2 id="evaluation-directory-title">按主题进入测评资料</h2><p>研究方向切换后，主题数量、代表资料和证据形态会同步更新。</p><a href="'+scopedLink('benchmarks',direction)+'">查看完整基准目录'+portalIcon('arrow')+'</a></div><dl><div><dt>'+records.length+'</dt><dd>已核验评测资源</dd></div><div><dt>'+topics.length+'</dt><dd>可进入的评测主题</dd></div><div><dt>'+integrated+'</dt><dd>站内可视化结果</dd></div></dl></header>'+evaluationDirectoryGroup('研究方向','六个方向共享同一批资料，并允许交叉关联。',directionCards,'evaluation-directions')+evaluationDirectoryGroup('评测主题','按风险问题与系统能力组织，可交叉筛选。',topicCards,'evaluation-topics')+evaluationDirectoryGroup('当前范围细分','从现有记录的子领域中选出当前范围的高频与重点入口。',subdomainCards,'evaluation-subdomains')+evaluationDirectoryGroup('证据形态','区分站内可视化、公开榜单、结果文件、论文证据和待核验候选。',evidenceCards,'evaluation-evidence')+'</section>';
}
function catalogCard(record,direction=''){
 const siteResult=EvaluationCatalog.resultHref(record,direction),publicResult=record.result_url&&record.result_url!==record.url?'<a href="'+esc(record.result_url)+'" target="_blank" rel="noopener noreferrer">查看公开结果'+portalIcon('arrow')+'</a>':'',dataEntry=record.data_entries?.[0],dataLink=dataEntry?'<a href="'+esc(dataEntry.url)+'" target="_blank" rel="noopener noreferrer">公开数据'+portalIcon('arrow')+'</a>':'';
 return '<article class="cp-resource-card catalog-card">'+compactMark(record.name,EvaluationCatalog.publicResultStates.has(record.result_state)?'chart':'book')+'<div class="cp-resource-copy"><div class="catalog-card-top"><span>'+esc(record.result_state)+'</span><span data-keep-original>'+esc(record.subdomain)+'</span></div><h3 data-keep-original><a href="'+esc(record.url)+'" target="_blank" rel="noopener noreferrer">'+esc(record.name)+portalIcon('arrow')+'</a></h3><p data-keep-original>'+esc(record.metric)+'</p><p class="catalog-note" data-keep-original>'+esc(record.note)+'</p><div class="library-meta">'+esc(record.priority)+' · '+esc(record.relation)+' · '+esc(record.checked_date)+'</div><div class="cp-card-actions"><a href="'+esc(record.url)+'" target="_blank" rel="noopener noreferrer">原始项目'+portalIcon('arrow')+'</a>'+publicResult+dataLink+(siteResult?'<a class="catalog-site-result" href="'+siteResult+'">查看站内结果'+portalIcon('arrow')+'</a>':'')+'</div></div></article>';
}
function catalogPagination(model){return model.pages>1?libraryPagination(model):''}

benchmarkPanel=function(direction){
 const params=route().params,query=(params.get('q')||'').trim(),state=params.get('object')||'',topicId=params.get('topic')||'',topic=EvaluationTopicCatalog.get(topicId),sort=params.get('sort')||'priority',records=EvaluationCatalog.benchmarkRecords(direction),topics=EvaluationTopicCatalog.topics(records),evidence=EvaluationTopicCatalog.evidence(records);
 const filtered=EvaluationCatalog.sort(records.filter(record=>EvaluationTopicCatalog.evidenceMatches(record,state)&&(!topic||EvaluationTopicCatalog.matches(record,topic))&&EvaluationCatalog.matches(record,query)),sort),model=EvaluationCatalog.pageModel(filtered);
	 const toolbar='<div class="panel-toolbar catalog-toolbar">'+searchForm('catalog-search','搜索当前范围内的基准、指标或主题',query)+'<label>评测主题<select id="catalog-topic"><option value="">全部主题</option>'+topics.map(item=>'<option value="'+item.definition.id+'" '+(item.definition.id===topicId?'selected':'')+'>'+item.definition.name+' · '+item.records.length+'</option>').join('')+'</select></label><label>结果形态<select name="object"><option value="">全部形态</option>'+evidence.map(item=>'<option value="'+item.definition.id+'" '+(item.definition.id===state||item.definition.name===state?'selected':'')+'>'+item.definition.name+' · '+item.records.length+'</option>').join('')+'</select></label><label>排序<select id="catalog-sort"><option value="priority" '+(sort==='priority'?'selected':'')+'>按目录优先级</option><option value="state" '+(sort==='state'?'selected':'')+'>按证据状态</option><option value="name" '+(sort==='name'?'selected':'')+'>名称 A–Z</option></select></label></div>';
 return toolbar+catalogSnapshot(filtered,direction,topicId,state)+'<div class="count-row"><span>'+filtered.length+' 条已核验评测资源</span><span>资料包核验于 '+EvaluationCatalog.data.checked_date+'</span></div>'+(model.visible.length?'<div class="index-list catalog-grid">'+model.visible.map(record=>catalogCard(record,direction)).join('')+'</div>'+catalogPagination(model):contentEmpty('没有符合条件的评测资源','调整关键词、结果形态或子方向后重试。',routeLink(route().path,{direction}),'清除筛选'));
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

resultsPage=function(){
 const direction=selectedDirection(),directory=route().params.has('benchmark')?'':evaluationTopicDirectory(direction);
 return '<div class="wrap task-page cp-evaluation">'+compactEvalHead('基准与评测')+evalTabs('results')+scopeControl(direction)+directory+resultPanel(direction)+'</div>';
};

document.addEventListener('change',e=>{if(e.target.id==='catalog-topic')replaceQuery('topic',e.target.value)});
