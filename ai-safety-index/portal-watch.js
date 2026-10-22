/* Source-linked observatory built from the portal's existing news records. */
var PortalWatch=(()=>{
 'use strict';
 const hours=72;
 function generatedAt(){
  const value=typeof automatedNewsInfo!=='undefined'&&automatedNewsInfo.generated_on;
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
  const value=typeof automatedNewsInfo==='undefined'?'unknown':automatedNewsInfo.status;
  return value==='current'?'来源更新正常':value==='partial'?'部分来源更新失败':'使用最近一次成功快照';
 }
 function sourceHealth(){
  if(typeof automatedNewsInfo==='undefined')return '';
  return automatedNewsInfo.sources.map(source=>'<li><span class="watch-health-dot '+esc(source.status)+'"></span><div><strong data-keep-original>'+esc(source.name)+'</strong><small>'+esc(source.status==='ok'?'最近抓取成功':'抓取失败，保留旧记录')+'</small></div><time>'+esc((source.last_successful_fetch||'').replace('T',' ').replace('Z',' UTC'))+'</time></li>').join('');
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
 function homePreview(){
  const list=PortalCompact.stories(),windowRows=recent(list),signals=signalRows(list),top=signals[0],latest=newestDate(list);
  const topName=top?directionName(top[0]):'暂无主题信号',latestDate=latest?latest.toISOString().slice(0,10):'—';
  return '<section class="watch-home-strip" aria-labelledby="watch-home-title"><div class="watch-home-copy"><span data-keep-original>RESEARCH OBSERVATORY</span><h2 id="watch-home-title">最近发生了什么？</h2><p>从公开来源、研究方向和复核状态进入最新 AI 安全动态。</p></div><div class="watch-home-metrics"><span><strong>'+windowRows.length+'</strong>近 72 小时记录</span><span><strong>'+esc(topName)+'</strong>当前主要信号</span><span><strong>'+latestDate+'</strong>最新发布日期</span></div><a href="#watch">打开动态观察台'+portalIcon('arrow')+'</a></section>';
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
 return html.replace('</section><section class="mh-grid"','</section>'+PortalWatch.homePreview()+'<section class="mh-grid"');
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
document.addEventListener('click',event=>{if(event.target.closest('[data-watch-reset]'))go('watch');const button=event.target.closest('[data-watch-export]');if(button)PortalWatch.download(button.dataset.watchExport)});
render();
