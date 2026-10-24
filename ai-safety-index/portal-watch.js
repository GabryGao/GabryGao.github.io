/* Source-linked observatory built from the portal's existing news records. */
var PortalWatch=(()=>{
 'use strict';
 const hours=72;
 function currentInfo(){if(typeof liveNewsInfo!=='undefined'&&liveNewsInfo)return liveNewsInfo;return typeof automatedNewsInfo!=='undefined'?automatedNewsInfo:null}
 function generatedAt(){
  const value=currentInfo()?.generated_on;
  const parsed=value?new Date(value):new Date();
  return Number.isNaN(parsed.getTime())?new Date():parsed;
 }
 function dateValue(value){
  const match=String(value||'').match(/^\d{4}-\d{2}-\d{2}/);
  return match?new Date(match[0]+'T00:00:00Z'):null;
 }
 function recent(rows,windowHours=hours){
  const cutoff=generatedAt().getTime()-windowHours*60*60*1000;
  return rows.filter(row=>{const date=dateValue(row.date);return date&&date.getTime()>=cutoff});
 }
 function directionName(id){return getDirection(id)?.name||'其他安全议题'}
 function filters(){
  const params=route().params;
  return {query:(params.get('q')||'').trim(),direction:params.get('direction')||'',origin:params.get('origin')||''};
 }
 function rows(){
  const active=filters(),query=active.query.toLocaleLowerCase();
  return PortalCompact.stories().filter(row=>{
   if(active.direction&&!row.direction_ids.includes(active.direction))return false;
   if(active.origin==='auto'&&!row.automated)return false;
   if(active.origin==='curated'&&row.automated)return false;
   const text=[row.title,row.description,row.source,...(row.terms||[])].join(' ');
   const searchable=typeof SiteLocale==='undefined'?text:SiteLocale.searchText(text);
   return !query||searchable.toLocaleLowerCase().includes(query);
  });
 }
 function newestDate(list){return list.map(row=>dateValue(row.date)).filter(Boolean).sort((a,b)=>b-a)[0]}
 function statusLabel(){
  const value=currentInfo()?.status||'unknown';
  return value==='current'?'来源更新正常':value==='partial'?'部分来源更新失败':'使用最近一次成功快照';
 }
 function sourceHealth(){
  const info=currentInfo();if(!info)return '';
  return info.sources.map(source=>'<li><span class="watch-health-dot '+esc(source.status)+'"></span><div><strong data-keep-original>'+esc(source.name)+'</strong><small>'+esc(source.status==='ok'?'最近抓取成功':'抓取失败，保留旧记录')+'</small></div><time>'+esc((source.last_successful_fetch||'').replace('T',' ').replace('Z',' UTC'))+'</time></li>').join('');
 }
 function flowRow(row){
  const primary=row.direction_ids[0];
  return '<article class="watch-flow-row"><time>'+esc(row.date)+'</time><span class="watch-flow-topic">'+esc(directionName(primary))+'</span><div><h3><a href="'+esc(row.url)+'" target="_blank" rel="noopener noreferrer" data-keep-original>'+esc(row.title)+portalIcon('arrow')+'</a></h3><p><span data-keep-original>'+esc(row.source)+'</span> · '+esc(row.automated?'AI Safety HOT · 自动同步':'人工精选')+'</p></div></article>';
 }
 function signalRows(list){
  const cutoff=generatedAt().getTime()-30*24*60*60*1000,counts=new Map();
  for(const row of list){
   const date=dateValue(row.date);if(!date||date.getTime()<cutoff)continue;
   for(const id of row.direction_ids||[])counts.set(id,(counts.get(id)||0)+1);
  }
  return [...counts].sort((a,b)=>b[1]-a[1]).slice(0,5);
 }
 function signalCard([id,count],max){
  const direction=getDirection(id),width=Math.max(8,Math.round(count/max*100));
  return '<a class="watch-signal" href="'+routeLink('watch',{direction:id})+'"><span><strong>'+esc(direction?.name||id)+'</strong><small>'+count+' 条近 30 日记录</small></span><i><b style="width:'+width+'%"></b></i>'+portalIcon('arrow')+'</a>';
 }
 function brief(list){
  const latest=newestDate(list);if(!latest)return '<div class="watch-empty">当前筛选没有可用记录。</div>';
  const day=latest.toISOString().slice(0,10),items=list.filter(row=>row.date.startsWith(day)).slice(0,4);
  const sources=[...new Set(items.map(row=>row.source))];
  return '<div class="watch-brief-head"><div><span>最新发布日期</span><strong>'+day+'</strong></div><p>'+items.length+' 条记录，来自 '+sources.length+' 个公开来源。以下为元数据索引，不代替原文核对。</p></div><ol class="watch-brief-list">'+items.map((row,index)=>'<li><span>'+String(index+1).padStart(2,'0')+'</span><div><h3><a href="'+esc(row.url)+'" target="_blank" rel="noopener noreferrer" data-keep-original>'+esc(row.title)+'</a></h3><p><span data-keep-original>'+esc(row.source)+'</span> · '+esc(directionName(row.direction_ids[0]))+'</p></div></li>').join('')+'</ol>';
 }
 function options(selected){return '<option value="">全部方向</option>'+researchDirections.map(direction=>'<option value="'+direction.id+'" '+(selected===direction.id?'selected':'')+'>'+esc(direction.name)+'</option>').join('')}
 function page(){
  const active=filters(),list=rows(),windowRows=recent(list),signals=signalRows(list),max=Math.max(1,...signals.map(item=>item[1]));
  const curated=list.filter(row=>!row.automated).length,automated=list.length-curated;
  return '<div class="wrap watch-page"><header class="watch-hero"><div><p class="watch-kicker" data-keep-original>AI SAFETY · RESEARCH OBSERVATORY</p><h1>AI 安全动态观察台</h1><p>把公开资讯、研究方向与来源状态放在同一视图中，快速判断最近发生了什么，并回到原文核对。</p></div><div class="watch-summary"><span><strong>'+list.length+'</strong>当前记录</span><span><strong>'+windowRows.length+'</strong>近 72 小时</span><span><strong>'+curated+'</strong>人工精选</span><span><strong>'+automated+'</strong>待复核采集</span></div></header>'+
  '<form id="watch-search" class="watch-toolbar"><label class="watch-search"><span class="visually-hidden">搜索动态</span>'+searchIcon+'<input name="q" type="search" value="'+esc(active.query)+'" placeholder="搜索标题、来源或安全议题"></label><label>研究方向<select id="watch-direction">'+options(active.direction)+'</select></label><label>收录方式<select id="watch-origin"><option value="">全部记录</option><option value="curated" '+(active.origin==='curated'?'selected':'')+'>人工精选</option><option value="auto" '+(active.origin==='auto'?'selected':'')+'>自动采集</option></select></label><button type="submit">筛选</button><button type="button" class="watch-reset" data-watch-reset>清除</button></form>'+
  '<section class="watch-pipeline" aria-label="资料更新流程"><span>公开来源</span>'+portalIcon('arrow')+'<span>元数据筛选</span>'+portalIcon('arrow')+'<span>研究方向关联</span>'+portalIcon('arrow')+'<span>人工复核</span><small>'+statusLabel()+' · '+esc(generatedAt().toISOString().replace('T',' ').replace('Z',' UTC'))+'</small></section>'+
  '<section class="watch-observatory"><div class="watch-flow"><div class="watch-section-head"><div><span>01 / NEWS FLOW</span><h2>近 72 小时信息流</h2><p>按公开来源发布日期排列；自动条目仍需人工复核。</p></div><a href="#news">查看全部'+portalIcon('arrow')+'</a></div><div class="watch-flow-list">'+(windowRows.length?windowRows.slice(0,10).map(flowRow).join(''):'<div class="watch-empty">当前筛选在近 72 小时内没有记录。</div>')+'</div></div><aside class="watch-signals"><div class="watch-section-head"><div><span>02 / TOPIC SIGNALS</span><h2>近期主题信号</h2><p>按近 30 日记录的研究方向聚合，不代表风险排名。</p></div></div><div class="watch-signal-list">'+(signals.length?signals.map(item=>signalCard(item,max)).join(''):'<div class="watch-empty">当前筛选没有主题信号。</div>')+'</div></aside></section>'+
  '<section class="watch-lower"><article class="watch-brief"><div class="watch-section-head"><div><span>03 / DAILY BRIEF</span><h2>每日研究简报</h2><p>同一天的最新记录放在一起，保留原始标题与来源。</p></div></div>'+brief(list)+'</article><aside class="watch-status"><div class="watch-section-head"><div><span>04 / SOURCE STATUS</span><h2>来源与数据状态</h2><p>抓取失败时保留上一次成功快照，不把缺失误写为零。</p></div></div><ul>'+sourceHealth()+'</ul><div class="watch-export"><button type="button" data-watch-export="json">导出 JSON</button><button type="button" data-watch-export="csv">导出 CSV</button><a href="research-source/news-feed-provenance.json" target="_blank" rel="noopener noreferrer">查看来源记录'+portalIcon('arrow')+'</a></div></aside></section>'+
  '<p class="watch-note">当前仅覆盖已配置的公开来源和人工精选记录，不构成完整新闻监测，也不代表平台认可相关主张。</p></div>';
 }
 function focusStories(list){
  const latestDate=list[0]?.date||'',score=row=>Number(row.aihot_score||0),latest=list.filter(row=>row.date===latestDate).sort((left,right)=>score(right)-score(left)),older=list.filter(row=>row.date!==latestDate).sort((left,right)=>score(right)-score(left));
  return [...latest,...older].slice(0,6);
 }
 function homeRiverStory(row,index){
  const primary=row.direction_ids?.[0]||'foundation-model',label=(row.label||'AI Safety HOT').replace(/^AI Safety HOT · /,'');
  return '<article class="home-river-story" data-home-river-story data-direction="'+esc(primary)+'" '+(index?'hidden':'')+'><a href="'+esc(row.url)+'" target="_blank" rel="noopener noreferrer"><div class="home-river-story-meta"><span>'+esc(directionName(primary))+'</span><time>'+esc(row.date)+'</time></div><h3 data-keep-original>'+esc(row.title)+portalIcon('arrow')+'</h3><p>'+esc(row.description)+'</p><footer><span data-keep-original>'+esc(row.source)+'</span><span>'+esc(label)+'</span></footer></a></article>';
 }
 function homePreview(){
  const list=PortalCompact.stories().filter(row=>!row.paper_pick);if(!list.length)return '';
  const focus=focusStories(list),info=currentInfo(),sources=new Set(list.map(row=>row.source)).size,updated=(info?.generated_on||'').replace('T',' ').replace(/:\d{2}Z$/,' UTC'),status=info?.status||'unknown',stories=focus.map(homeRiverStory).join('');
  return '<section class="home-news-flow home-signal-river" aria-labelledby="home-news-flow-title"><div class="home-river-head"><div><span data-keep-original>AI SAFETY SIGNAL RIVER</span><h2 id="home-news-flow-title"><span>AI 安全每天都有新动态，</span><span>值得追踪的，只有几条。</span></h2><p>自动抓取公开来源，去重、归类并筛出当天值得核对的安全信号。</p></div><div class="home-news-actions"><span class="home-news-update" data-status="'+esc(status)+'"><i></i>自动同步于 <time>'+esc(updated||'—')+'</time></span><button type="button" class="home-news-toggle" data-home-flow-toggle aria-label="暂停动态" aria-pressed="false" title="暂停动态">'+portalIcon('pause')+'</button><a href="#watch">查看动态观察台'+portalIcon('arrow')+'</a></div></div><div class="home-river-stage"><div class="home-river-canvas-panel"><canvas class="home-river-canvas" data-record-count="'+list.length+'" aria-hidden="true"></canvas><p class="visually-hidden">动态信息流：公开来源经过主题聚类和信号筛选，汇聚为今日焦点。</p><div class="home-river-axis" aria-hidden="true"><span>公开来源</span><span>主题聚类</span><span>信号筛选</span><span>今日焦点</span></div></div><aside class="home-river-focus" aria-label="今日焦点"><div class="home-river-focus-head"><span>今日焦点</span><div><button type="button" class="home-river-prev" data-home-river-step="-1" aria-label="上一条焦点" title="上一条焦点">'+portalIcon('arrow')+'</button><strong data-home-river-counter>01 / '+String(focus.length).padStart(2,'0')+'</strong><button type="button" data-home-river-step="1" aria-label="下一条焦点" title="下一条焦点">'+portalIcon('arrow')+'</button></div></div><div class="home-river-story-stack">'+stories+'</div></aside></div><div class="home-river-metrics"><span><small>01 · 采集</small><strong>'+list.length+'</strong><p>条公开动态</p></span><span><small>02 · 来源</small><strong>'+sources+'</strong><p>个公开来源</p></span><span><small>03 · 精选</small><strong>'+focus.length+'</strong><p>条焦点信号</p></span><span><small>04 · 更新</small><strong>3h</strong><p>每 3 小时</p></span></div></section>';
 }
 function exportRows(){return rows().map(row=>({title:row.title,date:row.date,source:row.source,url:row.url,directions:row.direction_ids,automated:!!row.automated,verified:!!row.verified}))}
 function download(format){
  const records=exportRows(),stamp=generatedAt().toISOString().slice(0,10);let content,type;
  if(format==='csv'){
   const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';
   content=['title,date,source,url,directions,automated,verified',...records.map(row=>[row.title,row.date,row.source,row.url,row.directions.join('|'),row.automated,row.verified].map(quote).join(','))].join('\n');type='text/csv;charset=utf-8';
  }else{content=JSON.stringify({generated_on:generatedAt().toISOString(),filters:filters(),records},null,2);type='application/json;charset=utf-8'}
  const url=URL.createObjectURL(new Blob([content],{type})),anchor=document.createElement('a');anchor.href=url;anchor.download='ai-safety-index-watch-'+stamp+'.'+format;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return {page,homePreview,download};
})();

const watchBaseHome=home;
home=function(){
 let html=watchBaseHome();
 html=html.replace('<nav class="home-quick-links" aria-label="常用入口">','<nav class="home-quick-links" aria-label="常用入口"><a href="#watch">动态观察台'+portalIcon('arrow')+'</a>');
 return html.replace('<section class="mh-intro"',PortalWatch.homePreview()+'<section class="mh-intro"');
};

const watchBaseRender=render;
render=function(){
 const current=route();
 if(current.path!=='watch'){watchBaseRender();return}
 if(document.body){document.body.classList.add('madeo-subpage');document.body.classList.remove('madeo-home');document.body.dataset.madeoRoute='watch'}
 $('#main').innerHTML=PortalWatch.page();
 const pageLabel=document.querySelector('.md-page-label');if(pageLabel)pageLabel.textContent='动态观察台';
 $$('[data-nav]').forEach(link=>{const active=link.dataset.nav==='news';link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
 $('#primary-nav').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false');$('#menu-button').setAttribute('aria-label','打开导航');
 document.title='动态观察台 · AI Safety Index';updateTray();
};
document.addEventListener('submit',event=>{if(event.target.id!=='watch-search')return;event.preventDefault();replaceQuery('q',new FormData(event.target).get('q').trim())});
document.addEventListener('change',event=>{if(event.target.id==='watch-direction')replaceQuery('direction',event.target.value);if(event.target.id==='watch-origin')replaceQuery('origin',event.target.value)});
document.addEventListener('click',event=>{if(event.target.closest('[data-watch-reset]'))go('watch');const button=event.target.closest('[data-watch-export]');if(button)PortalWatch.download(button.dataset.watchExport);const toggle=event.target.closest('[data-home-flow-toggle]');if(toggle){const section=toggle.closest('.home-news-flow'),paused=section.classList.toggle('is-paused'),source=paused?'继续动态':'暂停动态',label=typeof SiteLocale==='undefined'?source:SiteLocale.translate(source,SiteLocale.current());toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',label);toggle.setAttribute('title',label);toggle.innerHTML=portalIcon(paused?'play':'pause')}});
document.addEventListener('ai-safety-news-updated',()=>{if(route().path!=='home')return;const current=document.querySelector('.home-news-flow');if(current)current.outerHTML=PortalWatch.homePreview()});
render();
