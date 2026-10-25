function localeSearchText(value){return typeof SiteLocale==='undefined'?String(value):SiteLocale.searchText(value)}
const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const benchmarkData = [
 {id:'helm-safety',name:'HELM Safety',object:'语言模型',modality:'文本',year:2024,version:'v1.0（历史报告）',org:'Stanford CRFM',url:'https://crfm.stanford.edu/2024/11/08/helm-safety.html',desc:'组合多项基准，呈现语言模型在不同安全任务中的表现。',tags:['评测方法','公开结果'],detail:'这一示例展示组合式评测条目的布局。HELM Safety v1.0 将不同任务组织到共同评测框架中，并公开模型、判分及评价局限。',measure:'按任务查看分项结果，结合模型版本、评判器和场景解释。',date:'2024-11-08'},
 {id:'agentdojo',name:'AgentDojo',object:'Agent',modality:'文本与工具',year:2024,version:'待录入',org:'ETH Zurich / Invariant Labs',url:'https://agentdojo.spylab.ai/',desc:'在工具环境中评估 LLM Agent 的提示注入攻击与防御。',tags:['提示注入','工具使用'],detail:'包含任务套件、工具环境与攻击防御接口。条目需要同时记录正常任务效用和受到攻击后的结果。',measure:'任务结果与攻击结果需要按相同环境及配置分别记录。',date:'待录入'},
 {id:'mm-safetybench',name:'MM-SafetyBench',object:'多模态模型',modality:'图像与文本',year:2024,version:'论文版本（2024）',org:'论文作者团队',url:'https://arxiv.org/abs/2311.17600',desc:'研究图像加入后，多模态大模型的安全边界如何变化。',tags:['多模态','安全评测'],detail:'使用图文条件开展多模态模型安全评估。图文配对、模型配置与判分依据是该类条目需要呈现的关键字段。',measure:'结果按具体任务、模型与输入设置解释，不直接视为一般视觉能力。',date:'2024-06-19'},
 {id:'harmbench',name:'HarmBench',object:'语言模型',modality:'文本',year:2024,version:'待录入',org:'HarmBench 作者团队',url:'https://www.harmbench.org/',desc:'用于自动化红队测试及拒绝稳健性评估的标准化框架。',tags:['红队评测','拒绝稳健性'],detail:'目录中将基准本身与第三方使用该基准发布的结果分开收录。条目链接原始项目与资料，具体运行设置仍需逐条确认。',measure:'同一基准名并不保证结果可比，需要核对任务子集与攻击配置。',date:'待录入'},
 {id:'xstest',name:'XSTest',object:'语言模型',modality:'文本',year:2024,version:'NAACL 2024 论文',org:'论文作者团队',url:'https://aclanthology.org/2024.naacl-long.301/',desc:'通过良性与有害边界测试，识别语言模型的过度拒绝。',tags:['过度拒绝','边界测试'],detail:'关注过度安全行为与误拒绝。此类测试应将对危险请求的反应和对正常请求的可用性一起呈现。',measure:'记录判分标准、拒绝类别与任务条件，避免将一律拒绝视为更安全。',date:'待录入'},
 {id:'safebench',name:'SafeBench',object:'物理系统',modality:'驾驶仿真',year:2022,version:'待录入',org:'SafeBench 作者团队',url:'https://safebench.github.io/',desc:'面向自动驾驶安全评测的场景与测试平台。',tags:['物理系统','场景评测'],detail:'此类条目需要呈现环境、场景、随机种子、驾驶基线及安全指标。仿真和实机证据分层展示。',measure:'仿真结果仅描述所测条件，不能直接当作道路安全认证。',date:'待录入'}
];
const resources=[
 {id:'nist',name:'AI Risk Management Framework',type:'报告与指南',org:'NIST',year:'2023',desc:'用于理解风险管理活动与评测目的的框架入口。',url:'https://www.nist.gov/itl/ai-risk-management-framework'},
 {id:'unicef',name:'Guidance on AI and Children',type:'报告与指南',org:'UNICEF Innocenti',year:'2025',desc:'儿童权益、适龄保护与 AI 系统设计的指南入口。',url:'https://www.unicef.org/innocenti/reports/policy-guidance-ai-children'},
 {id:'helm',name:'HELM Safety 方法说明',type:'评测方法',org:'Stanford CRFM',year:'2024',desc:'组合基准、模型评判与公开评测的适用范围。',url:benchmarkData[0].url},
 {id:'agent-docs',name:'AgentDojo 项目文档',type:'数据与工具',org:'AgentDojo',year:'动态文档',desc:'任务套件、Agent 配置及复现环境的文档入口。',url:benchmarkData[1].url},
 {id:'repository',name:'The AI Risk Repository',type:'数据与工具',org:'MIT AI Risk Initiative',year:'动态资源',desc:'可追溯到原始材料的风险资料库入口。',url:'https://airisk.mit.edu/risks'}
];
const results=[
 {
  "id": "claude",
  "name": "Claude 3.5 Sonnet",
  "version": "2024-06-20",
  "creator": "Anthropic",
  "score": 0.981,
  "attack": 0.879
 },
 {
  "id": "haiku",
  "name": "Claude 3 Haiku",
  "version": "2024-03-07",
  "creator": "Anthropic",
  "score": 0.913,
  "attack": 0.625
 },
 {
  "id": "gpt4turbo",
  "name": "GPT-4 Turbo",
  "version": "2024-04-09",
  "creator": "OpenAI",
  "score": 0.898,
  "attack": 0.602
 },
 {
  "id": "mini",
  "name": "GPT-4o mini",
  "version": "2024-07-18",
  "creator": "OpenAI",
  "score": 0.849,
  "attack": 0.765
 },
 {
  "id": "gpt4o",
  "name": "GPT-4o",
  "version": "2024-05-13",
  "creator": "OpenAI",
  "score": 0.829,
  "attack": 0.622
 },
 {
  "id": "llama8",
  "name": "Llama 3 Instruct (8B)",
  "version": "Llama 3 Instruct (8B)",
  "creator": "Meta",
  "score": 0.727,
  "attack": 0.63
 },
 {
  "id": "llama70",
  "name": "Llama 3 Instruct (70B)",
  "version": "Llama 3 Instruct (70B)",
  "creator": "Meta",
  "score": 0.64,
  "attack": 0.483
 },
 {
  "id": "gpt35",
  "name": "GPT-3.5 Turbo",
  "version": "0125",
  "creator": "OpenAI",
  "score": 0.633,
  "attack": 0.281
 },
 {
  "id": "mixtral",
  "name": "Mixtral Instruct (8x7B)",
  "version": "Mixtral Instruct (8x7B)",
  "creator": "Mistral AI",
  "score": 0.451,
  "attack": 0.314
 }
];
const state={selected:new Set(),lastFocus:null};
function route(){const [path,query='']=location.hash.slice(1).split('?');return {path:path||'home',params:new URLSearchParams(query)}}
function go(path,params={}){const q=new URLSearchParams(Object.entries(params).filter(([,v])=>v));location.hash=path+(q.size?'?'+q:'')}
function replaceQuery(name,value){const r=route();if(name!=='page')r.params.delete('page');if(value)r.params.set(name,value);else r.params.delete(name);go(r.path,Object.fromEntries(r.params))}
const arrow='<span aria-hidden="true">↗</span>';
const searchIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>';
function searchForm(id,placeholder,value='',global=false){return `<form class="search-form" data-search="${global?'global':'catalog'}"><label class="visually-hidden" for="${id}" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">搜索</label>${searchIcon}<input id="${id}" type="search" autocomplete="off" placeholder="${placeholder}" value="${esc(value)}"><button type="submit">搜索 <span aria-hidden="true">↗</span></button></form>`}
function badge(text,style=''){return `<span class="label ${style}">${text}</span>`}
function sectionHead(no,title,desc,link,label){return `<div class="section-head"><div><div class="section-kicker">${no}</div><h2>${title}</h2>${desc?`<p>${desc}</p>`:''}</div>${link?`<a class="text-link" href="#${link}">${label||'查看全部'} <span>↗</span></a>`:''}</div>`}
function pageHead(kicker,title,desc){return `<div class="page-head"><div class="breadcrumb"><a href="#home">首页</a><span>/</span><span>${title}</span></div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div>`}
function benchmarkRow(b,i,compact=false){return `<article class="bench-row"><span class="row-no">${String(i+1).padStart(2,'0')}</span><div><h3><a href="#benchmark/${b.id}">${b.name}</a></h3><p>${b.desc}</p><div class="row-meta">${badge(b.object,'blue')}<span>${b.modality}</span><span>·</span><span>${b.year}</span>${compact?'':badge('来源收录','outline')}<span>${compact?'':b.org}</span></div></div><a class="row-arrow" href="#benchmark/${b.id}" aria-label="查看 ${b.name} 详情">↗</a></article>`}
function heroArt(){return `<div class="hero-art" role="img" aria-label="任务、版本、指标与来源组成一条完整评测证据"><div class="art-top"><span>EVIDENCE, IN CONTEXT.</span><i class="art-dot"></i></div><svg viewBox="0 0 500 410" aria-hidden="true"><defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#ccdac7"/></pattern></defs><rect width="500" height="410" fill="url(#grid)"/><circle cx="253" cy="210" r="147" fill="none" stroke="#cbd8c4"/><circle cx="253" cy="210" r="105" fill="none" stroke="#a9bca0" stroke-dasharray="3 8"/><path d="M110 172 253 210 367 124M253 210 365 296M253 210 146 305" fill="none" stroke="#a5b89e" stroke-width="1.2"/><circle cx="253" cy="210" r="72" fill="#2658f4"/><text x="253" y="206" fill="white" font-size="28" text-anchor="middle" font-family="Georgia,serif">Evidence</text><text x="253" y="232" fill="#cfdaff" font-size="11" text-anchor="middle" letter-spacing="3">评 测 证 据</text><g fill="#fbfcf9" stroke="#c6d4c0"><rect x="48" y="140" width="117" height="55" rx="5"/><rect x="310" y="95" width="117" height="55" rx="5"/><rect x="93" y="285" width="117" height="55" rx="5"/><rect x="322" y="276" width="117" height="55" rx="5"/></g><g fill="#17343b" font-size="13" text-anchor="middle"><text x="106" y="173">任务 · Task</text><text x="369" y="128">版本 · Version</text><text x="152" y="318">指标 · Metric</text><text x="380" y="309">来源 · Source</text></g><circle cx="345" cy="327" r="9" fill="#d3e978"/><circle cx="131" cy="127" r="5" fill="#2658f4"/><circle cx="380" cy="207" r="4" fill="#71955a"/></svg><div class="art-bottom"><span>不止一个分数</span><span>一条完整的证据链 ↗</span></div></div>`}
function termButtons(active='提示注入'){return ['提示注入','多模态','过度拒绝','物理系统'].map((term,i)=>`<button class="term-button ${active===term?'active':''}" data-term="${term}"><b>0${i+1}</b>${term}<span>→</span></button>`).join('')}
function termItems(term){const ids={'提示注入':['agentdojo','helm-safety'],'多模态':['mm-safetybench'],'过度拒绝':['xstest','harmbench'],'物理系统':['safebench']};return (ids[term]||[]).map(id=>benchmarkData.find(b=>b.id===id))}
function evidenceList(term){return termItems(term).map(b=>`<article class="evidence-row"><div><div class="micro">${b.org} · ${b.year} · 基准资料</div><h3>${b.name}</h3><p>${b.desc}</p></div><a href="#benchmark/${b.id}" aria-label="查看 ${b.name}">↗</a></article>`).join('')}
function taskHub(){
  const tasks=[
    ['benchmarks','为模型或系统找评测基准','查看测量对象、任务范围与使用资料'],
    ['results','查看模型在指定测试中的表现','选择基准与评测设置，核对版本和来源'],
    ['trends','跟进 AI 安全研究动态','从关注词进入相关论文、基准和资料']
  ];
  return '<aside class="task-hub" aria-labelledby="task-hub-title"><div class="micro">START WITH A TASK</div><h2 id="task-hub-title">从你要完成的事开始</h2><div class="task-hub-list">'+tasks.map((t,i)=>'<a class="task-hub-link" href="#'+t[0]+'"><span class="task-no">0'+(i+1)+'</span><div><strong>'+t[1]+'</strong><p>'+t[2]+'</p></div><span class="task-arrow" aria-hidden="true">↗</span></a>').join('')+'</div></aside>';
}
function homeReading(){
  const picks=[
    {id:'nist',purpose:'01 / 界定风险范围',why:'先明确评估哪些风险，再选择适用的测试。'},
    {id:'helm',purpose:'02 / 理解评测结果',why:'查看组合基准、判分方式与结果的适用边界。'},
    {id:'agent-docs',purpose:'03 / 进入实验环境',why:'以 AgentDojo 为例，查看任务套件与运行文档。'}
  ];
  return '<aside class="aside-reading"><div class="aside-title"><h3>评测方法速读</h3><span class="micro">READING GUIDE</span></div>'+picks.map(p=>{const r=resources.find(x=>x.id===p.id);return '<a class="reading-item" href="'+r.url+'" target="_blank" rel="noopener noreferrer"><span class="reading-purpose">'+p.purpose+'</span><h4>'+r.name+' ↗</h4><p>'+p.why+'</p><span class="reading-source">'+r.org+'</span></a>'}).join('')+'</aside>';
}
function detail(id){const b=benchmarkData.find(x=>x.id===id);if(!b)return notFound();return `<div class="wrap reveal"><div class="page-head"><div class="breadcrumb"><a href="#home">首页</a><span>/</span><a href="#benchmarks">基准目录</a><span>/</span><span>${b.name}</span></div><div class="detail-head"><div><div class="eyebrow">BENCHMARK PROFILE</div><h1>${b.name}</h1><p>${b.desc}</p><div class="row-meta">${badge(b.object,'blue')}${badge(b.modality)}${badge('来源收录 · 示例','outline')}</div></div><a class="button secondary" href="${b.url}" target="_blank" rel="noopener noreferrer">打开原始来源 ↗</a></div></div><div class="detail-grid"><article class="detail-content"><div class="tabs"><a class="tab active" href="#benchmark/${b.id}">概览与资料</a><a class="tab" href="#results?benchmark=${b.id}">相关结果</a></div><section class="detail-section"><h2>这个基准评估什么</h2><p>${b.detail}</p></section><section class="detail-section"><h3>如何阅读结果</h3><p>${b.measure}</p><div class="info-line"><i>i</i><span>目录收录说明资料来源，不表示平台已独立复现。尚未录入的字段明确标记，避免被误读为零值。</span></div></section><section class="detail-section"><h3>资料与引用</h3><ul class="article-links"><li><a href="${b.url}" target="_blank" rel="noopener noreferrer">原始项目或论文 <span>↗</span></a></li><li><button data-action="method" class="text-link">收录规范与结果比较原则 ↗</button></li></ul></section></article><aside class="detail-aside"><h3>条目信息</h3><dl class="facts"><div><dt>发布方</dt><dd>${b.org}</dd></div><div><dt>发表年份</dt><dd>${b.year}</dd></div><div><dt>记录版本</dt><dd>${b.version}</dd></div><div><dt>评测对象</dt><dd>${b.object}</dd></div><div><dt>输入模态</dt><dd>${b.modality}</dd></div><div><dt>来源日期</dt><dd>${b.date}</dd></div><div><dt>采集时间</dt><dd>原型未接入采集</dd></div><div><dt>资料复核</dt><dd>未记录</dd></div><div><dt>实验复现</dt><dd>未进行</dd></div><div><dt>许可信息</dt><dd>待核对原始许可</dd></div></dl></aside></div></div>`}
function notFound(){return `<div class="wrap"><div class="empty"><h1>未找到这个页面</h1><p>可以返回首页，或打开评测基准目录。</p><a class="button" href="#home">返回首页</a></div></div>`}
function openModal(title,kicker,body){state.lastFocus=document.activeElement;$('#modal-body').innerHTML=`<div class="modal-inner"><div class="modal-top"><div><div class="micro">${kicker}</div><h2>${title}</h2></div><button class="modal-close" data-action="close" aria-label="关闭弹窗">×</button></div>${body}</div>`;$('#modal').showModal()}
function searchAll(q){const term=q.trim().toLowerCase();const items=[...researchDirections.map(d=>({name:d.name,desc:d.description,search:d.en+' '+d.topics.map(t=>t.name+' '+t.en).join(' '),type:'拟议研究方向',href:'#directions?pillar='+d.id})),...benchmarkData.map(b=>({name:b.name,desc:b.desc+' '+b.tags.join(' '),type:'基准',href:'#benchmark/'+b.id})),...resources.map(r=>({name:r.name,desc:r.desc,type:r.type,href:r.url,external:true}))];const list=term?items.filter(x=>localeSearchText(x.name+' '+x.desc+' '+x.type+' '+(x.search||'')).toLowerCase().includes(term)):items.filter(x=>x.type==='基准').slice(0,5);$('#global-results').innerHTML=list.length?list.map(x=>`<li><a href="${x.href}" ${x.external?'target="_blank" rel="noopener noreferrer"':''} data-search-result="true"><div><strong>${x.name} ↗</strong><p>${x.desc}</p></div>${badge(x.type,'blue')}</a></li>`).join(''):`<li class="empty"><h2>没有找到“${esc(q)}”</h2><p>试试基准名称，或更简短的关键词。</p></li>`;$('#search-count').textContent=term?`${list.length} 个相关示例`:'推荐资料'}
function showSearch(q=''){openModal('搜索基准、资料与研究方向','SEARCH THE INDEX',`${searchForm('global-search','输入名称或关键词，例如 AgentDojo',q,true)}<div id="search-count" class="micro"></div><ul class="search-results" id="global-results"></ul>`);searchAll(q);$('#global-search').focus()}
function showMethod(){openModal('每条结果，都应有可追溯的依据。','METHOD & TRANSPARENCY',`<p>门户连接原始资料、评测配置与结论。收录状态、复核状态和结果执行方分别记录。</p><div class="method-visual">${heroArt()}</div><ol class="method-steps"><li><div><h3>来源收录</h3><p>保留原始链接、发布方、版本与来源日期；采集时间单独记录。</p></div></li><li><div><h3>机器整理</h3><p>Agent 辅助抓取、去重、提取字段和关联资料。自动收录内容标记“待复核”。</p></div></li><li><div><h3>人工复核</h3><p>核查重要字段和结论；“资料已核对”与“实验已复现”分别说明，避免混用。</p></div></li><li><div><h3>同协议比较</h3><p>明确各模型的具体版本，核对基准版本、任务集、评判器与运行设置。同一评价口径的结果再比较；不同协议单列，缺失值不填 0。</p></div></li></ol><div class="info-line"><i>i</i><span>原型中的历史结果来自 HELM Safety v1.0 报告。完整方案与字段规则见 <a href="design-spec.html">设计交接说明</a>。</span></div>`)}
function showSubmit(){openModal('提交一条资源建议','CONTRIBUTE A RESOURCE',`<p>提供原始来源，帮助编辑完善目录。</p><div class="info-line" style="margin-top:18px"><i>i</i><span>这是交互设计演示。填写内容不会发送到服务器，也不会在关闭页面后保存。</span></div><form id="submit-form" class="submit-form"><label>资源名称<input name="name" required maxlength="150" placeholder="例如：某项评测基准"></label><label>原始链接<input name="url" type="url" required placeholder="https://"></label><label>资源类型<select name="type"><option>Benchmark</option><option>评测结果</option><option>报告与指南</option><option>数据与工具</option></select></label><label>补充说明<textarea name="note" maxlength="1000" placeholder="它评估什么，或为什么值得收录？"></textarea></label><button class="button" type="submit">预览提交反馈 ↗</button></form>`)}
function showCompare(){const metric=route().params.get('metric')==='attack'?'attack':'score',list=results.filter(r=>state.selected.has(r.id));openModal('相同条件下，并排看结果。','COMPARE / HELM SAFETY V1.0',`<p>HarmBench · ${metric==='score'?'默认设置':'GCG-T'} · 无害性分数 ↑ · 2024 年公开报告</p><div class="comparison" style="--compare-columns:${list.length}">${list.map(r=>`<article><h3>${r.name}</h3><p>${r.version}</p><span class="value">${r[metric].toFixed(3)}</span><small>同一指标 / 0–1</small></article>`).join('')}</div><p style="margin-top:24px;font-size:12px">这组示例仅用于比较对应历史配置，不代表这些模型的当前表现。<a class="text-link" href="${benchmarkData[0].url}" target="_blank" rel="noopener noreferrer">查看原始证据 ↗</a></p>`)}
function closeModal(){if($('#modal').open)$('#modal').close();if(state.lastFocus?.isConnected)state.lastFocus.focus()}
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>$('#toast').hidden=true,4000)}
document.addEventListener('click',e=>{if(e.target.closest('.skip')){e.preventDefault();$('#main').focus();$('#main').scrollIntoView({block:'start'});return}const menu=e.target.closest('#menu-button');if(menu){const open=$('#primary-nav').classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'关闭导航':'打开导航');return}const a=e.target.closest('[data-action]');if(a){const act=a.dataset.action;if(act==='search')showSearch();else if(act==='close')closeModal();else if(act==='method')showMethod();else if(act==='submit')showSubmit();else if(act==='clear-filter')go('benchmarks');else if(act==='filters'){const visible=$('#filter-panel').classList.toggle('show');a.setAttribute('aria-expanded',String(visible));if(visible)$('#filter-panel').scrollIntoView({block:'start',behavior:'smooth'})}else if(act==='clear-compare'){state.selected.clear();$$('.compare-check').forEach(x=>x.checked=false);updateTray()}else if(act==='compare')showCompare()}const query=e.target.closest('[data-query]');if(query)showSearch(query.dataset.query);const clear=e.target.closest('[data-clear]');if(clear)replaceQuery(clear.dataset.clear,'');const term=e.target.closest('[data-term]');if(term){if(term.closest('[data-term-context="home"]')){$$('[data-term-context="home"] button').forEach(b=>b.classList.toggle('active',b===term));$('#home-evidence').innerHTML=evidenceList(term.dataset.term)}else replaceQuery('term',term.dataset.term)}const period=e.target.closest('[data-period]');if(period)replaceQuery('period',period.dataset.period);if(e.target.closest('[data-search-result]'))closeModal()});
document.addEventListener('submit',e=>{if(e.target.matches('[data-search]')){e.preventDefault();const q=$('input',e.target).value.trim();if($('#modal').open&&$('#global-search'))searchAll(q);else if(e.target.dataset.search==='global')showSearch(q);else replaceQuery('q',q)}if(e.target.id==='submit-form'){e.preventDefault();closeModal();toast('提交反馈演示完成；内容未发送或保存。')}});
document.addEventListener('input',e=>{if(e.target.id==='global-search')searchAll(e.target.value)});
document.addEventListener('change',e=>{if(e.target.name==='object')replaceQuery('object',e.target.value);if(e.target.id==='catalog-sort')replaceQuery('sort',e.target.value);if(e.target.id==='result-benchmark'){state.selected.clear();replaceQuery('benchmark',e.target.value)}if(e.target.id==='result-metric'){state.selected.clear();replaceQuery('metric',e.target.value)}if(e.target.id==='result-sort')replaceQuery('sort',e.target.value);if(e.target.matches('.compare-check')){if(e.target.checked)state.selected.add(e.target.value);else state.selected.delete(e.target.value);updateTray()}});
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal()});
function routePathFromUrl(value){try{const hash=new URL(value,location.href).hash.slice(1);return hash.split('?')[0]||'home'}catch{return 'home'}}
function interactionFocusToken(element){if(!element||element===document.body)return null;if(element.id)return {type:'id',value:element.id};for(const name of ['data-home-benchmark','data-home-models-toggle','data-home-river-filter','data-show-model','data-result-model','data-evaluation-model','href','name']){const value=element.getAttribute?.(name);if(value!==null&&value!==undefined)return {type:'attribute',name,value,tag:element.tagName}}return null}
function restoreInteractionFocus(token){if(!token)return;let target;if(token.type==='id')target=document.getElementById(token.value);else target=[...document.querySelectorAll(token.tag+'['+token.name+']')].find(element=>element.getAttribute(token.name)===token.value);if(target)target.focus({preventScroll:true})}
function captureInteractionRouteState(element){state.pendingRouteFocus=interactionFocusToken(element);state.pendingRouteScroll={left:window.scrollX,top:window.scrollY}}
document.addEventListener('click',event=>{captureInteractionRouteState(event.target.closest?.('a[href],button'))},true);
document.addEventListener('change',event=>{captureInteractionRouteState(event.target)},true);
document.addEventListener('submit',event=>{captureInteractionRouteState(document.activeElement||event.target)},true);
window.addEventListener('hashchange',event=>{const previousPath=routePathFromUrl(event.oldURL),next=route(),samePage=previousPath===next.path,scroll=state.pendingRouteScroll||{left:window.scrollX,top:window.scrollY},focus=state.pendingRouteFocus||interactionFocusToken(document.activeElement),switchingDirection=!!document.querySelector('.directions-page')&&next.path==='directions'&&!!next.params.get('pillar');state.pendingRouteFocus=null;state.pendingRouteScroll=null;render();if(switchingDirection&&window.innerWidth<768){const heading=$('#direction-title')||document.querySelector('h1');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'instant'});return}if(samePage){restoreInteractionFocus(focus);window.scrollTo({...scroll,behavior:'instant'});return}window.scrollTo({top:0,behavior:'instant'})});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();showSearch()}});
