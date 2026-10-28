/* Reviewed catalog records power the benchmark and methods pages without exposing a separate source-directory route. */
var EvaluationCatalog=(()=>{
 const data=typeof SourceCatalogData==='undefined'?{checked_date:'',resources:[]}:SourceCatalogData;
 const pageSize=20;
 const methodPageSize=20;
 const priorityOrder={'P1 看板':0,'P1 目录':1,'P2 扩展':2,'P3 辅助':3};
 const stateOrder={'已下载结果':0,'已下载原始输出':1,'公开结果文件':2,'公开榜单':3,'论文/图表':4,'待核验':5,'工具/环境':6};
 const publicResultStates=new Set(['已下载结果','已下载原始输出','公开结果文件','公开榜单']);
 const integratedByRecord={S022:'helm-safety',S055:'agentdojo',S118:'flames',S135:'finsafety',S149:'safevla'};
 function inDirection(record,direction){const benchmark=integratedByRecord[record.id];return !direction||record.direction_id===direction||(record.related_direction_ids||[]).includes(direction)||(benchmarkDirections[benchmark]||[]).includes(direction)}
 function isToolRecord(record){return record.result_state==='工具/环境'||record.relation==='工具'||record.relation==='环境'}
 function benchmarkRecords(direction='',includeRelated=false){return data.resources.filter(record=>!isToolRecord(record)&&(includeRelated||record.relation!=='相关能力')&&inDirection(record,direction))}
 function methodKind(){return 'environment'}
 function methodRecords(direction=''){return data.resources.filter(record=>isToolRecord(record)&&inDirection(record,direction))}
 function integratedBenchmark(record){return integratedByRecord[record.id]||''}
 function matches(record,query){if(!query)return true;const text=[record.id,record.name,record.direction,record.subdomain,record.relation,record.metric,record.result_state,record.priority,record.note,record.data_access].join(' ');return localeSearchText(text).toLocaleLowerCase().includes(query.toLocaleLowerCase())}
 function sort(records,mode='priority'){return [...records].sort(mode==='recent'?(a,b)=>String(b.checked_date||'').localeCompare(String(a.checked_date||''))||a.name.localeCompare(b.name):mode==='name-desc'?(a,b)=>b.name.localeCompare(a.name):mode==='name'?(a,b)=>a.name.localeCompare(b.name):mode==='state'?(a,b)=>(stateOrder[a.result_state]??9)-(stateOrder[b.result_state]??9)||a.name.localeCompare(b.name):(a,b)=>(priorityOrder[a.priority]??9)-(priorityOrder[b.priority]??9)||(stateOrder[a.result_state]??9)-(stateOrder[b.result_state]??9)||a.id.localeCompare(b.id))}
 function pageModel(records,size=pageSize){const requested=Number(route().params.get('page')||1),pages=Math.max(1,Math.ceil(records.length/size)),page=Math.min(pages,Math.max(1,Number.isInteger(requested)?requested:1));return {list:records,page,pages,visible:records.slice((page-1)*size,page*size)}}
 function resultHref(record,direction=''){const benchmark=integratedBenchmark(record);if(!benchmark)return '';const scoped=direction&&(benchmarkDirections[benchmark]||[]).includes(direction)?direction:'';return routeLink('results',{direction:scoped,benchmark})}
 function record(id){return data.resources.find(item=>item.id===id)}
 function detailHref(item,direction=''){return routeLink('resource/'+encodeURIComponent(item.id),direction?{direction}:{})}
 return {data,pageSize,methodPageSize,publicResultStates,stateOrder,inDirection,isToolRecord,benchmarkRecords,methodRecords,methodKind,integratedBenchmark,matches,sort,pageModel,resultHref,record,detailHref};
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
function evaluationTopicDirectory(direction='',includeRelated=route().params.get('related')==='1'){
 const records=EvaluationCatalog.benchmarkRecords(direction,includeRelated),topics=EvaluationTopicCatalog.topics(records),evidence=EvaluationTopicCatalog.evidence(records),activeDirection=direction||'',integrated=records.filter(record=>EvaluationCatalog.integratedBenchmark(record)).length;
 const related=includeRelated?'1':'';
 const directionCards=researchDirections.map((item,index)=>{const scoped=EvaluationCatalog.benchmarkRecords(item.id,includeRelated),representative=EvaluationCatalog.sort(scoped)[0];return evaluationDirectoryCard({kind:'研究方向',title:item.name,description:item.short,representative,count:scoped.length,href:routeLink('benchmarks',{direction:item.id,related}),color:['#28735d','#294fa1','#a64e3c','#8b6a21','#6b5a8d','#337a87'][index],direction:item.id,active:item.id===activeDirection,action:'进入方向'})});
 const topicCards=topics.map(({definition,records:topicRecords})=>{const representative=EvaluationTopicCatalog.representative(topicRecords,definition),description=[representative.subdomain,representative.metric].filter(Boolean).join(' · ');return evaluationDirectoryCard({kind:'评测主题',title:definition.name,description,representative,count:topicRecords.length,href:routeLink('benchmarks',{direction,topic:definition.id,related}),color:definition.color})});
 const subdomainCards=evaluationSubdomainGroups(records,direction).map((group,index)=>evaluationDirectoryCard({kind:'细分领域',title:group.name,description:group.representative.metric,representative:group.representative,count:group.records.length,href:routeLink('benchmarks',{direction:direction||group.representative.direction_id,q:group.name,related}),color:['#337a87','#294fa1','#28735d','#a64e3c','#8b6a21','#6b5a8d'][index%6],keepTitle:true}));
 const evidenceCards=evidence.map(({definition,records:evidenceRecords})=>{const representative=EvaluationCatalog.sort(evidenceRecords)[0];return evaluationDirectoryCard({kind:'证据形态',title:definition.name,description:representative.metric,representative,count:evidenceRecords.length,href:routeLink('benchmarks',{direction,object:definition.id,related}),color:definition.color})});
 return '<section class="evaluation-directory" aria-labelledby="evaluation-directory-title"><header class="evaluation-directory-intro"><div><span>EVALUATION TOPIC DIRECTORY</span><h2 id="evaluation-directory-title">按主题进入测评资料</h2><p>研究方向切换后，主题数量、代表资料和证据形态会同步更新。</p><a href="'+scopedLink('benchmarks',direction)+'">查看完整基准目录'+portalIcon('arrow')+'</a></div><dl><div><dt>'+records.length+'</dt><dd>已核验评测资源</dd></div><div><dt>'+topics.length+'</dt><dd>可进入的评测主题</dd></div><div><dt>'+integrated+'</dt><dd>站内可视化结果</dd></div></dl></header>'+evaluationDirectoryGroup('研究方向','六个方向共享同一批资料，并允许交叉关联。',directionCards,'evaluation-directions')+evaluationDirectoryGroup('评测主题','按风险问题与系统能力组织，可交叉筛选。',topicCards,'evaluation-topics')+evaluationDirectoryGroup('当前范围细分','从现有记录的子领域中选出当前范围的高频与重点入口。',subdomainCards,'evaluation-subdomains')+evaluationDirectoryGroup('证据形态','区分站内可视化、公开榜单、结果文件、论文证据和待核验候选。',evidenceCards,'evaluation-evidence')+'</section>';
}
function catalogMetricCount(record){return Math.max(1,String(record.metric||'').split(/[、,，/；;]|\s+与\s+/).filter(Boolean).length)}
const catalogCardCopy={
 S013:{purpose:'评估语言模型能否定向遗忘指定知识，同时保持未遗忘知识与通用能力。',contents:'遗忘质量、模型效用、保留集与遗忘集表现'},
 S014:{purpose:'从知识移除、隐私泄露与模型效用等方面评估机器遗忘方法。',contents:'遗忘效果、隐私保护、能力保留'},
 S025:{purpose:'从毒性、偏见、隐私、伦理与鲁棒性等维度评估大语言模型可信性。',contents:'毒性、刻板印象、对抗鲁棒性、隐私、伦理与公平性'},
 S027:{purpose:'用分层安全问题和攻击设置评估模型识别与拒绝有害请求的能力。',contents:'基础安全、攻击鲁棒性、风险类别与层级'},
 S043:{purpose:'比较图像模型在标准输入、对抗攻击和常见扰动下的鲁棒性。',contents:'干净准确率、对抗准确率、扰动准确率'},
 S055:{purpose:'在工具调用任务中评估智能体的正常效用、受攻击效用与提示注入风险。',contents:'正常效用、攻击下效用、攻击成功率'}
};
function catalogPurpose(record){return catalogCardCopy[record.id]?.purpose||('用于评估'+(record.subdomain||record.direction||'相关场景')+'中的风险表现、系统能力与防护效果。')}
function catalogEvaluationContents(record){
 if(catalogCardCopy[record.id])return catalogCardCopy[record.id].contents;
 const items=String(record.metric||'').replace(/_/g,' ').split(/[、,，/；;]|\s+与\s+/).map(item=>item.trim()).filter(Boolean);
 return items.slice(0,4).join('、')||'评测协议、核心指标与结果说明';
}
function catalogResourceKind(label,url){
 const value=(label+' '+url).toLocaleLowerCase();
 if(/github\.com|gitlab\.com|代码|code/.test(value))return '代码';
 if(/arxiv|doi\.org|openreview|acm\.org|ieee|论文|paper/.test(value))return '论文';
 if(/结果|leaderboard|榜单|spaces\//.test(value))return '公开结果';
 if(/数据|dataset|huggingface\.co\/datasets/.test(value))return '数据';
 return '项目';
}
function catalogResourceActions(record,limit=3){
 const order={论文:0,代码:1,公开结果:2,数据:3,项目:4},seenKinds=new Set();
 return resourceSourceLinks(record).map(([label,url])=>({label:catalogResourceKind(label,url),url})).filter(item=>!seenKinds.has(item.label)&&seenKinds.add(item.label)).sort((a,b)=>order[a.label]-order[b.label]).slice(0,limit);
}
function methodDisplayCopy(record){
 const text=[record.name,record.subdomain,record.direction,record.metric,record.note].join(' ').toLocaleLowerCase();
 const definitions=[
  [/unlearn|遗忘/,'机器遗忘','用于构建和比较机器遗忘实验。','遗忘效果、隐私保护、能力保留'],
  [/privacy meter|成员推断|membership inference/,'隐私审计','用于检测训练数据泄露和成员推断风险。','成员推断、低误报率表现、隐私泄露'],
  [/fedscale|\bleaf\b|联邦学习/,'联邦学习','提供联邦学习任务、数据和系统基线。','任务效用、通信成本、训练效率'],
  [/datacomp|dataperf|数据治理/,'数据治理','用于比较数据选择、清洗和质量治理方法。','数据质量、下游表现、选择与清洗流程'],
  [/controlarena|智能体控制/,'智能体控制','用于评估智能体控制协议中的安全与效用。','控制协议、安全表现、任务效用'],
  [/\bares\b|检索生成|rag/,'检索生成评估','用于评估检索增强生成系统的相关性与忠实度。','上下文相关性、答案忠实度、答案相关性'],
  [/omnisafe|安全强化学习/,'安全强化学习','用于比较安全强化学习算法与基线。','任务回报、安全成本、收敛表现'],
  [/smartbugs|solidifi|ethernaut|智能合约/,'智能合约安全','用于智能合约漏洞检测、注入与攻防实验。','漏洞检出、误报漏报、运行代价'],
  [/roboguard|机器人安全/,'机器人安全','用于评估机器人任务中的安全约束和防护方法。','安全规格、违规检测、任务成功率'],
  [/carla|nuscenes|waymo|habitat|ai2-thor|behavior-1k|robosuite|rlbench|maniskill|驾驶|具身|物理 ai/,'物理 AI 环境','提供驾驶、具身或机器人任务的仿真与数据环境。','任务表现、感知能力、操作能力'],
  [/webarena|osworld|browsergym|toolsandbox|toolbench|agentbench|\bgaia\b|智能体任务|工具调用/,'智能体任务环境','提供智能体任务执行和工具调用的可复现实验环境。','任务成功率、工具使用、系统能力']
 ];
 const match=definitions.find(([pattern])=>pattern.test(text));
 return match?{tag:match[1],purpose:match[2],contents:match[3]}:{tag:'工具与运行环境',purpose:'用于搭建安全评测环境、运行任务和复现实验。',contents:'任务运行、工具集成、系统能力与复现流程'};
}
function catalogCardTone(value=''){
 const text=String(value).toLocaleLowerCase();
 if(/多模态|视觉|图像|语音|音频|视频|vision|image|audio|video/.test(text))return 'multimodal';
 if(/隐私|遗忘|成员推断|数据|privacy|unlearn|membership/.test(text))return 'privacy';
 if(/具身|机器人|驾驶|动态环境|物理|生物|化学|robot|embodied|driving|bio|chemical/.test(text))return 'physical';
 if(/公平|伦理|偏见|价值|社会|对齐|fair|ethic|bias|align|societ/.test(text))return 'alignment';
 if(/鲁棒|可靠|可信|攻击|对抗|越狱|注入|防御|trust|robust|attack|advers|jailbreak|inject|defen/.test(text))return 'assurance';
 if(/智能体|agent|工具调用|任务环境|控制协议|提示/.test(text))return 'agent';
 return 'general';
}
function catalogCard(record,direction=''){
 const detail=EvaluationCatalog.detailHref(record,direction),actions=catalogResourceActions(record),tone=catalogCardTone(record.subdomain+' '+record.direction+' '+record.name);
 return '<article class="cp-resource-card catalog-card" data-card-tone="'+tone+'"><div class="cp-resource-copy"><div class="catalog-card-heading"><h3 data-keep-original><a href="'+detail+'">'+esc(record.name)+portalIcon('arrow')+'</a></h3><span class="catalog-card-tag">'+esc(record.subdomain)+'</span></div><p class="catalog-card-purpose">'+esc(catalogPurpose(record))+'</p><p class="catalog-card-evaluation"><strong>评测内容：</strong>'+esc(catalogEvaluationContents(record))+'</p><div class="catalog-card-date">更新于 '+esc(record.checked_date||EvaluationCatalog.data.checked_date||'未报告')+'</div><div class="cp-card-actions catalog-card-resource-actions"><a href="'+detail+'">查看详情'+portalIcon('arrow')+'</a>'+actions.map(item=>'<a href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">'+esc(item.label)+' ↗</a>').join('')+'</div></div></article>';
}
benchmarkPanel=function(direction){
 const params=route().params,query=(params.get('q')||'').trim(),state=params.get('object')||'',topicId=params.get('topic')||'',topic=EvaluationTopicCatalog.get(topicId),requestedSort=params.get('sort')||'recent',sort=['recent','name','name-desc'].includes(requestedSort)?requestedSort:'recent',includeRelated=params.get('related')==='1',records=EvaluationCatalog.benchmarkRecords(direction,includeRelated),allRecords=EvaluationCatalog.benchmarkRecords(direction,true),topics=EvaluationTopicCatalog.topics(records),evidence=EvaluationTopicCatalog.evidence(records),relatedCount=allRecords.filter(record=>record.relation==='相关能力').length;
 const filtered=EvaluationCatalog.sort(records.filter(record=>EvaluationTopicCatalog.evidenceMatches(record,state)&&(!topic||EvaluationTopicCatalog.matches(record,topic))&&EvaluationCatalog.matches(record,query)),sort);
	 const toolbar='<div class="panel-toolbar catalog-toolbar">'+searchForm('catalog-search','搜索当前范围内的基准、指标或主题',query)+'<label>评测主题<select id="catalog-topic"><option value="">全部主题</option>'+topics.map(item=>'<option value="'+item.definition.id+'" '+(item.definition.id===topicId?'selected':'')+'>'+item.definition.name+' · '+item.records.length+'</option>').join('')+'</select></label><label>资料状态<select name="object"><option value="">全部资料</option>'+evidence.map(item=>'<option value="'+item.definition.id+'" '+(item.definition.id===state||item.definition.name===state?'selected':'')+'>'+item.definition.name+' · '+item.records.length+'</option>').join('')+'</select></label><label>排序<select id="catalog-sort"><option value="recent" '+(sort==='recent'?'selected':'')+'>最近更新</option><option value="name" '+(sort==='name'?'selected':'')+'>名称 A–Z</option><option value="name-desc" '+(sort==='name-desc'?'selected':'')+'>名称 Z–A</option></select></label><label class="catalog-related-filter"><input id="catalog-related" type="checkbox" '+(includeRelated?'checked':'')+'><span>包含相关能力</span></label></div>';
 const results=filtered.length?'<div class="index-list catalog-grid" data-infinite-list data-infinite-batch="'+EvaluationCatalog.pageSize+'">'+filtered.map(record=>catalogCard(record,direction)).join('')+'</div>':contentEmpty('没有符合条件的评测资源','调整关键词、资料状态或研究方向后重试。',routeLink(route().path,{direction}),'清除筛选');
 const explore='<details class="catalog-explore-details"><summary>查看主题与证据分布</summary><div>'+evaluationTopicDirectory(direction,includeRelated)+catalogSnapshot(filtered,direction,topicId,state)+'</div></details>';
 return toolbar+'<div class="count-row catalog-result-count"><span>'+filtered.length+' 项'+(includeRelated?'，包含相关能力':'直接或混合评测')+'</span><span>'+relatedCount+' 项相关能力可选 · 资料核验于 '+EvaluationCatalog.data.checked_date+'</span></div>'+results+explore;
};

function methodCard(record){
 const detail=EvaluationCatalog.detailHref(record,selectedDirection()),display=methodDisplayCopy(record),actions=catalogResourceActions(record,2),tone=catalogCardTone(display.tag+' '+record.direction+' '+record.name);
 return '<article class="cp-resource-card catalog-card method-card" data-card-tone="'+tone+'"><div class="cp-resource-copy"><div class="catalog-card-heading"><h3 data-keep-original><a href="'+detail+'">'+esc(record.name)+portalIcon('arrow')+'</a></h3><span class="catalog-card-tag">'+esc(display.tag)+'</span></div><p class="catalog-card-purpose">'+esc(display.purpose)+'</p><p class="catalog-card-evaluation"><strong>评测内容：</strong>'+esc(display.contents)+'</p><div class="catalog-card-date">更新于 '+esc(record.checked_date||EvaluationCatalog.data.checked_date||'未报告')+'</div><div class="cp-card-actions catalog-card-resource-actions"><a href="'+detail+'">查看详情'+portalIcon('arrow')+'</a>'+actions.map(item=>'<a href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">'+esc(item.label)+' ↗</a>').join('')+'</div></div></article>';
}

function resourceSourceLinks(record){
 const rows=[['原始项目或论文',record.url],['公开结果',record.result_url],...(record.data_entries||[]).map(item=>['公开数据',item.url]),['核验页面',record.evidence_url]],seen=new Set();
 return rows.filter(([,url])=>url&&!seen.has(url)&&seen.add(url));
}
function resourceSourceTitle(label,url){const kind=catalogResourceKind(label,url);return kind===label?kind:kind+' · '+label}
function resourceUseNote(record){
 if(EvaluationCatalog.isToolRecord(record))return '这是一项工具或运行环境资料，适合用于搭建实验、生成任务或复现流程；它本身不是模型安全得分。';
 if(EvaluationCatalog.publicResultStates.has(record.result_state))return '当前记录存在公开结果或结果文件。比较时仍需同时核对基准版本、任务设置、模型版本、指标方向和来源快照。';
 if(record.result_state==='论文/图表')return '当前证据主要来自论文或图表。页面用于说明评测问题与资料状态，不把论文中的不同设置合成为统一排名。';
 return '当前记录仍需要继续核验结果文件、版本或许可信息；缺失字段不会被写成零值。';
}
function methodResourceDetailPage(id){
 const record=EvaluationCatalog.record(id);if(!record)return notFound();
 const requestedDirection=route().params.get('direction')||'',directions=[record.direction_id,...(record.related_direction_ids||[])].filter(Boolean),sources=resourceSourceLinks(record),display=methodDisplayCopy(record);
 const related=EvaluationCatalog.sort(EvaluationCatalog.methodRecords(requestedDirection).filter(item=>item.id!==record.id&&methodDisplayCopy(item).tag===display.tag),'recent').slice(0,6),back=scopedLink('methods',requestedDirection);
 const sourceLedger=sources.length?'<div class="resource-source-list">'+sources.map(([label,url])=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer"><span>'+esc(resourceSourceTitle(label,url))+'</span><small data-keep-original>'+esc(new URL(url,location.href).hostname.replace(/^www\./,''))+'</small>'+portalIcon('arrow')+'</a>').join('')+'</div>':'<p>当前记录未提供可核验的公开链接。</p>';
 return '<div class="wrap task-page resource-detail-page"><nav class="resource-detail-breadcrumb" aria-label="面包屑"><a href="'+back+'">基准与评测</a><span>/</span><span>资料档案</span></nav><article class="resource-detail method-resource-detail"><header><div><span>工具与环境档案 · '+esc(record.id)+'</span><h1 data-keep-original>'+esc(record.name)+'</h1><p>'+esc(display.purpose)+'</p><div class="resource-detail-tags"><span>'+esc(display.tag)+'</span><span>目录记录</span></div></div></header><nav class="resource-detail-tabs" aria-label="详情内容"><span class="active">资料概览</span><span>评测内容与使用</span><span>资源入口</span></nav><div class="resource-detail-layout"><div class="resource-detail-main"><section><span>RESOURCE OVERVIEW</span><h2>资料概览</h2><p>'+esc(display.purpose)+'</p><dl class="resource-use-grid"><div><dt>主要标签</dt><dd>'+esc(display.tag)+'</dd></div><div><dt>评测内容</dt><dd>'+esc(display.contents)+'</dd></div><div><dt>研究方向</dt><dd>'+esc(getDirection(record.direction_id)?.name||record.direction)+'</dd></div><div><dt>更新日期</dt><dd>'+esc(record.checked_date||EvaluationCatalog.data.checked_date||'未报告')+'</dd></div></dl><div class="resource-detail-directions">'+topicTags(directions)+'</div></section><section><span>EVALUATION & USE</span><h2>评测内容与使用</h2><p>'+esc(resourceUseNote(record))+'</p><dl class="resource-use-grid"><div><dt>主要评测内容</dt><dd>'+esc(display.contents)+'</dd></div><div><dt>资料类型</dt><dd>工具与运行环境</dd></div></dl></section><section class="resource-source-section"><span>RESOURCE LINKS</span><h2>资源入口</h2>'+sourceLedger+'<details class="resource-source-ledger"><summary>来源与核验记录</summary><p>以下字段保留目录原文，便于核验。</p><dl class="resource-use-grid"><div><dt>细分领域</dt><dd data-keep-original>'+esc(record.subdomain||'未记录')+'</dd></div><div><dt>核心指标</dt><dd data-keep-original>'+esc(record.metric||'未记录')+'</dd></div><div><dt>数据可用性</dt><dd data-keep-original>'+esc(record.data_access||'未记录')+'</dd></div><div><dt>目录备注</dt><dd data-keep-original>'+esc(record.note||'未记录')+'</dd></div></dl></details></section><section><span>VERIFICATION</span><h2>核验记录</h2><div class="resource-limit-grid"><article><h3>核验状态</h3><p>公开来源已核验</p></article><article><h3>许可说明</h3><p>使用前请核对原始许可</p></article><article><h3>记录类型</h3><p>目录记录</p></article><article><h3>最近核验</h3><p>'+esc(record.checked_date||EvaluationCatalog.data.checked_date||'未报告')+'</p></article></div></section></div><aside class="resource-detail-aside"><h2>记录信息</h2><dl><div><dt>目录编号</dt><dd>'+esc(record.id)+'</dd></div><div><dt>主要标签</dt><dd>'+esc(display.tag)+'</dd></div><div><dt>资料类型</dt><dd>工具与运行环境</dd></div><div><dt>核验日期</dt><dd>'+esc(record.checked_date||'未报告')+'</dd></div></dl><a class="resource-detail-back" href="'+back+'">返回目录'+portalIcon('arrow')+'</a></aside></div></article>'+(related.length?'<section class="resource-detail-related"><header><div><span>RELATED RESOURCES</span><h2>同领域资料</h2></div><a href="'+back+'">查看全部'+portalIcon('arrow')+'</a></header><div>'+related.map(item=>{const relatedDisplay=methodDisplayCopy(item);return '<a href="'+EvaluationCatalog.detailHref(item,requestedDirection)+'"><span>'+esc(relatedDisplay.tag)+'</span><strong data-keep-original>'+esc(item.name)+'</strong><small>'+esc(relatedDisplay.purpose)+'</small></a>'}).join('')+'</div></section>':'')+'</div>';
}
function benchmarkResourceDetailPage(record){
 const requestedDirection=route().params.get('direction')||'',direction=requestedDirection||record.direction_id,siteResult=EvaluationCatalog.resultHref(record,direction),sources=resourceSourceLinks(record),directions=[record.direction_id,...(record.related_direction_ids||[])].filter(Boolean),metricCount=catalogMetricCount(record),dataCount=(record.data_entries||[]).length;
 const back=scopedLink('benchmarks',requestedDirection),detail=EvaluationCatalog.detailHref(record,requestedDirection),related=EvaluationCatalog.sort(EvaluationCatalog.data.resources.filter(item=>!EvaluationCatalog.isToolRecord(item)&&item.id!==record.id&&(item.subdomain===record.subdomain||item.direction_id===record.direction_id)),'recent').slice(0,6);
 const sourceLedger=sources.length?'<div class="resource-source-list">'+sources.map(([label,url])=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer"><span>'+esc(resourceSourceTitle(label,url))+'</span><small data-keep-original>'+esc(new URL(url,'https://local.invalid').hostname.replace(/^www\./,''))+'</small>'+portalIcon('arrow')+'</a>').join('')+'</div>':'<p>当前记录未提供可核验的公开链接。</p>';
 const resultSummary=siteResult?'<p>该基准已有结构化结果接入本站，可在保留任务、设置、指标和来源信息的前提下查看模型表现。</p><a class="resource-detail-result-link" href="'+siteResult+'">打开站内测评结果'+portalIcon('arrow')+'</a>':'<p>'+esc(resourceUseNote(record))+'</p>';
 return '<div class="wrap task-page resource-detail-page"><nav class="resource-detail-breadcrumb" aria-label="面包屑"><a href="'+back+'">基准与评测</a><span>/</span><span>基准详情</span></nav><article class="resource-detail benchmark-resource-detail"><header><div><span>BENCHMARK RECORD · '+esc(record.id)+'</span><h1 data-keep-original>'+esc(record.name)+'</h1><p data-keep-original>'+esc(catalogPurpose(record))+'</p><div class="resource-detail-tags"><span data-keep-original>'+esc(record.subdomain)+'</span><span>'+esc(record.result_state)+'</span></div></div><dl><div><dt>'+metricCount+'</dt><dd>评测内容组</dd></div><div><dt>'+dataCount+'</dt><dd>数据入口</dd></div><div><dt>'+directions.length+'</dt><dd>关联方向</dd></div></dl></header><nav class="resource-detail-tabs" aria-label="详情内容"><span class="active">基准概况</span><span>测评结果</span><span>资源入口</span></nav><div class="resource-detail-layout"><div class="resource-detail-main"><section><span>BENCHMARK OVERVIEW</span><h2>基准概况</h2><p data-keep-original>'+esc(catalogPurpose(record))+'</p><dl class="resource-use-grid"><div><dt>主要标签</dt><dd data-keep-original>'+esc(record.subdomain)+'</dd></div><div><dt>评测内容</dt><dd data-keep-original>'+esc(catalogEvaluationContents(record))+'</dd></div><div><dt>研究方向</dt><dd data-keep-original>'+esc(record.direction)+'</dd></div><div><dt>资料关系</dt><dd>'+esc(record.relation)+'</dd></div></dl><div class="resource-detail-directions">'+topicTags(directions)+'</div></section><section><span>EVALUATION RESULTS</span><h2>测评结果</h2>'+resultSummary+'<dl class="resource-use-grid"><div><dt>核心指标</dt><dd data-keep-original>'+esc(record.metric)+'</dd></div><div><dt>结果状态</dt><dd>'+esc(record.result_state)+'</dd></div><div><dt>数据可用性</dt><dd data-keep-original>'+esc(record.data_access||'未报告')+'</dd></div><div><dt>比较说明</dt><dd>'+esc(resourceUseNote(record))+'</dd></div></dl></section><section class="resource-source-section"><span>RESOURCE LINKS</span><h2>资源入口</h2>'+sourceLedger+'<p class="resource-source-note">论文、代码、数据与公开结果使用原始发布方链接；本站详情页用于组织基准说明、测评结果和核验信息。</p></section><section><span>VERIFICATION & LIMITS</span><h2>核验与限制</h2><div class="resource-limit-grid"><article><h3>核验状态</h3><p data-keep-original>'+esc(record.evidence_status||'未记录')+'</p></article><article><h3>许可说明</h3><p data-keep-original>'+esc(record.license_note||'待核对原始许可')+'</p></article><article><h3>收录状态</h3><p data-keep-original>'+esc(record.existing_status||record.result_state)+'</p></article><article><h3>最近更新</h3><p>'+esc(record.checked_date||EvaluationCatalog.data.checked_date||'未报告')+'</p></article></div></section></div><aside class="resource-detail-aside"><h2>记录信息</h2><dl><div><dt>目录编号</dt><dd>'+esc(record.id)+'</dd></div><div><dt>主要标签</dt><dd data-keep-original>'+esc(record.subdomain)+'</dd></div><div><dt>结果状态</dt><dd>'+esc(record.result_state)+'</dd></div><div><dt>更新日期</dt><dd>'+esc(record.checked_date||'未报告')+'</dd></div></dl><a class="resource-detail-back" href="'+back+'">返回基准目录'+portalIcon('arrow')+'</a></aside></div></article>'+(related.length?'<section class="resource-detail-related"><header><div><span>RELATED BENCHMARKS</span><h2>同领域基准</h2></div><a href="'+back+'">查看全部'+portalIcon('arrow')+'</a></header><div>'+related.map(item=>'<a href="'+EvaluationCatalog.detailHref(item,requestedDirection)+'"><span>'+esc(item.subdomain)+'</span><strong data-keep-original>'+esc(item.name)+'</strong><small data-keep-original>'+esc(catalogPurpose(item))+'</small></a>').join('')+'</div></section>':'')+'</div>';
}
resourceDetailPage=function(id){const record=EvaluationCatalog.record(id);if(!record)return notFound();return EvaluationCatalog.isToolRecord(record)?methodResourceDetailPage(id):benchmarkResourceDetailPage(record)};
function methodGuide(direction=''){
 const selected=getDirection(direction),principle=selected?.principle||'明确风险问题、评测对象、任务协议与评分方法，再判断结果能否比较。',note=selected?.note||'不同基准、模型版本、攻击配置与评分器的结果不合成为统一安全总分。';
 const standards=[['评测协议与适用范围','评测口径由基准版本、数据子集、任务、攻击与防御设置、运行预算和判分器共同确定。结果按协议分组，并关联模型版本与来源快照。'],['指标定义与量纲','每项指标记录定义、计量单位和优化方向。无害率、攻击成功率、任务成功率分别展示，不合成为平台总分。'],['版本与时间记录','测试时间、报告发布日期、页面更新时间和平台获取时间分别存储；未提供的字段明确标记为未报告。'],['数据来源与收录流程','每条结果关联官方项目、论文或发布文件，经过格式转换、数值校验、协议核对和收录审核。']];
 const steps=[['01','结果采集','官方表格、公开 CSV / JSON 与论文结果'],['02','字段标准化','模型、任务、配置、指标、单位与来源'],['03','质量校验','原始数值、指标定义、协议与使用条件'],['04','协议分组','基准版本、任务设置、来源快照与指标'],['05','可视化发布','比较图表、结果明细与筛选数据导出']];
 return '<section class="method-standards" aria-labelledby="method-standards-title"><header><span>METHOD & DATA NOTES</span><h2 id="method-standards-title">评测规范与数据记录</h2></header><div>'+standards.map(([title,body])=>'<article><h3>'+title+'</h3><p>'+body+'</p></article>').join('')+'</div></section><section class="method-boundary"><div><span>CURRENT COMPARISON BOUNDARY</span><h2>当前方向的比较边界</h2></div><div><p>'+esc(principle)+'</p><p>'+esc(note)+'</p></div></section><section class="method-pipeline" aria-labelledby="method-pipeline-title"><header><span>RESULT DATA PIPELINE</span><h2 id="method-pipeline-title">结果数据处理流程</h2></header><div>'+steps.map(([number,title,body],index)=>'<article><b>'+number+'</b><h3>'+title+'</h3><p>'+body+'</p></article>'+(index<steps.length-1?'<span aria-hidden="true">'+portalIcon('arrow')+'</span>':'')).join('')+'</div></section>';
}
compactMethodCards=function(direction=''){
 const subtopic=route().params.get('subtopic')||'',records=EvaluationCatalog.sort(EvaluationCatalog.methodRecords(direction).filter(record=>!subtopic||PortalCompact.matches({...record,description:record.metric,tags:[record.subdomain,record.relation,record.result_state]},subtopic,direction))).slice(0,6);
 return records.length?'<div class="resource-list">'+records.map(methodCard).join('')+'</div><a class="methods-embed-more" href="'+scopedLink('methods',direction)+'">查看全部方法与复现入口'+portalIcon('arrow')+'</a>':contentEmpty('这个方向暂无已录入方法资料','确认资料来源与适用范围后，再补充到同一资源库。',scopedLink('methods',''),'浏览全部方法');
};

methodsPage=function(){
 const direction=selectedDirection(),params=route().params,query=(params.get('q')||'').trim(),records=EvaluationCatalog.methodRecords(direction),filtered=EvaluationCatalog.sort(records.filter(record=>EvaluationCatalog.matches(record,query)));
	 const toolbar='<div class="panel-toolbar method-toolbar method-tools-toolbar">'+searchForm('method-search','搜索工具或运行环境',query)+'</div>';
 return '<div class="wrap task-page cp-evaluation">'+compactEvaluationShell('methods',direction)+'<section class="method-resource-section" aria-labelledby="method-resources-title"><header class="method-resource-head"><div><span>TOOLS & RUNTIME ENVIRONMENTS</span><h2 id="method-resources-title">工具与运行环境</h2></div><p>'+esc(getDirection(direction)?.name||'全部方向')+' · '+records.length+' 项资源</p></header>'+toolbar+'<div class="count-row"><span>'+filtered.length+' 项匹配资源</span></div>'+(filtered.length?'<div class="resource-list catalog-grid" data-infinite-list data-infinite-batch="'+EvaluationCatalog.methodPageSize+'">'+filtered.map(methodCard).join('')+'</div>':contentEmpty('当前范围暂无工具或运行环境','调整关键词或研究方向后重试。',scopedLink('methods',''),'浏览全部工具'))+'</section>'+methodGuide(direction)+'</div>';
};

resultsPage=function(){
 const direction=selectedDirection();
 return '<div class="wrap task-page cp-evaluation">'+compactEvaluationShell('results',direction)+resultPanel(direction)+'</div>';
};

document.addEventListener('change',e=>{if(e.target.id==='catalog-topic')replaceQuery('topic',e.target.value);if(e.target.id==='catalog-related')replaceQuery('related',e.target.checked?'1':'')});
