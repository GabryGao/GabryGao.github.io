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
   const text=[row.title,row.title_zh,row.description,row.description_zh,row.source,...(row.terms||[])].filter(Boolean).join(' ');
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
  return '<article class="watch-flow-row"><time>'+esc(row.date)+'</time><span class="watch-flow-topic">'+esc(directionName(primary))+'</span><div><h3><a href="'+storyHref(row)+'">'+localizedNewsCopy(row,'title')+portalIcon('arrow')+'</a></h3><p><span data-keep-original>'+esc(row.source)+'</span> · '+esc(row.automated?'AI Safety HOT · 自动同步':'人工精选')+'</p></div></article>';
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
  return '<div class="watch-brief-head"><div><span>最新发布日期</span><strong>'+day+'</strong></div><p>'+items.length+' 条记录，来自 '+sources.length+' 个公开来源。以下为元数据索引，不代替原文核对。</p></div><ol class="watch-brief-list">'+items.map((row,index)=>'<li><span>'+String(index+1).padStart(2,'0')+'</span><div><h3><a href="'+storyHref(row)+'">'+localizedNewsCopy(row,'title')+'</a></h3><p><span data-keep-original>'+esc(row.source)+'</span> · '+esc(directionName(row.direction_ids[0]))+'</p></div></li>').join('')+'</ol>';
 }
 function options(selected){return '<option value="">全部方向</option>'+researchDirections.map(direction=>'<option value="'+direction.id+'" '+(selected===direction.id?'selected':'')+'>'+esc(direction.name)+'</option>').join('')}
 function page(){
  const active=filters(),list=rows(),windowRows=recent(list),signals=signalRows(list),max=Math.max(1,...signals.map(item=>item[1]));
  const curated=list.filter(row=>!row.automated).length,automated=list.length-curated;
  return '<div class="wrap watch-page"><header class="watch-hero"><div><p class="watch-kicker" data-keep-original>AI SAFETY · RESEARCH OBSERVATORY</p><h1>AI 安全动态观察台</h1><p>把热点榜、公开资讯、研究方向与来源状态放在同一视图中，并保留站内详情与原始出处。</p></div><div class="watch-summary"><span><strong>'+list.length+'</strong>当前记录</span><span><strong>'+windowRows.length+'</strong>近 72 小时</span><span><strong>'+curated+'</strong>人工精选</span><span><strong>'+automated+'</strong>待复核采集</span></div></header>'+
  '<div class="watch-hotboard">'+hotboard()+'</div>'+
  '<form id="watch-search" class="watch-toolbar"><label class="watch-search"><span class="visually-hidden">搜索动态</span>'+searchIcon+'<input name="q" type="search" value="'+esc(active.query)+'" placeholder="搜索标题、来源或安全议题"></label><label>研究方向<select id="watch-direction">'+options(active.direction)+'</select></label><label>收录方式<select id="watch-origin"><option value="">全部记录</option><option value="curated" '+(active.origin==='curated'?'selected':'')+'>人工精选</option><option value="auto" '+(active.origin==='auto'?'selected':'')+'>自动采集</option></select></label><button type="submit">筛选</button><button type="button" class="watch-reset" data-watch-reset>清除</button></form>'+
  '<section class="watch-pipeline" aria-label="资料更新流程"><span>公开来源</span>'+portalIcon('arrow')+'<span>元数据筛选</span>'+portalIcon('arrow')+'<span>研究方向关联</span>'+portalIcon('arrow')+'<span>人工复核</span><small>'+statusLabel()+' · '+esc(generatedAt().toISOString().replace('T',' ').replace('Z',' UTC'))+'</small></section>'+
  '<section class="watch-observatory"><div class="watch-flow"><div class="watch-section-head"><div><span>01 / NEWS FLOW</span><h2>近 72 小时信息流</h2><p>按公开来源发布日期排列；自动条目仍需人工复核。</p></div><a href="#news">查看全部'+portalIcon('arrow')+'</a></div><div class="watch-flow-list">'+(windowRows.length?windowRows.slice(0,10).map(flowRow).join(''):'<div class="watch-empty">当前筛选在近 72 小时内没有记录。</div>')+'</div></div><aside class="watch-signals"><div class="watch-section-head"><div><span>02 / TOPIC SIGNALS</span><h2>近期主题信号</h2><p>按近 30 日记录的研究方向聚合，不代表风险排名。</p></div></div><div class="watch-signal-list">'+(signals.length?signals.map(item=>signalCard(item,max)).join(''):'<div class="watch-empty">当前筛选没有主题信号。</div>')+'</div></aside></section>'+
  '<section class="watch-lower"><article class="watch-brief"><div class="watch-section-head"><div><span>03 / DAILY BRIEF</span><h2>每日研究简报</h2><p>同一天的最新记录放在一起，保留原始标题与来源。</p></div></div>'+brief(list)+'</article><aside class="watch-status"><div class="watch-section-head"><div><span>04 / SOURCE STATUS</span><h2>来源与数据状态</h2><p>抓取失败时保留上一次成功快照，不把缺失误写为零。</p></div></div><ul>'+sourceHealth()+'</ul><div class="watch-export"><button type="button" data-watch-export="json">导出 JSON</button><button type="button" data-watch-export="csv">导出 CSV</button><a href="research-source/news-feed-provenance.json" target="_blank" rel="noopener noreferrer">查看来源记录'+portalIcon('arrow')+'</a></div></aside></section>'+
  '<p class="watch-note">当前仅覆盖已配置的公开来源和人工精选记录，不构成完整新闻监测，也不代表平台认可相关主张。</p></div>';
 }
 function hotCategory(row){return row.aihot_category||row.direction_ids?.[0]||'other'}
 function hotScore(row){return Math.max(0,Math.min(100,Math.round(Number(row.aihot_score)||0)))}
 function hotTitleTokens(row){
  const value=String(row.title_zh||row.title||'').toLocaleLowerCase(),tokens=new Set(),stop=new Set(['about','after','against','from','into','model','models','safety','that','their','this','through','with','安全','模型','测试','研究','发布','发现','进行','公开','人工智能']);
  for(const token of value.match(/[a-z0-9][a-z0-9.-]{2,}/g)||[])if(!stop.has(token))tokens.add(token);
  for(const run of value.match(/[\u3400-\u9fff]{2,}/g)||[])for(let index=0;index<run.length-1;index++){const token=run.slice(index,index+2);if(!stop.has(token))tokens.add(token)}
  return tokens;
 }
 function hotNamedTokens(row){
  const value=[row.title,row.title_zh,row.description,row.description_zh].filter(Boolean).join(' '),tokens=new Set(),stop=new Set(['ai','safety','the','this','model','models','research']);
  for(const token of value.match(/\b(?:[A-Z][A-Za-z0-9.-]{2,}|[A-Z]{2,})\b/g)||[]){const normalized=token.toLocaleLowerCase();if(!stop.has(normalized))tokens.add(normalized)}
  for(const term of row.terms||[])if(term.startsWith('entity:'))tokens.add(term.slice(7).toLocaleLowerCase());
  return tokens;
 }
 function hotTitleSimilarity(left,right){
  const a=hotTitleTokens(left),b=hotTitleTokens(right);if(!a.size||!b.size)return 0;
  const namedLeft=hotNamedTokens(left),namedRight=hotNamedTokens(right);let namedShared=0;for(const token of namedLeft)if(namedRight.has(token))namedShared++;
  if(namedShared>=2)return 1;
  let shared=0;for(const token of a)if(b.has(token))shared++;
  return shared/(a.size+b.size-shared);
 }
 function hotRanked(list){
  const windowRows=recent(list),pool=windowRows.length>=10?windowRows:list,localized=pool.filter(row=>/[\u3400-\u9fff]/u.test(row.title_zh||row.title||'')),source=localized.length>=10?localized:pool;
  const ranked=[...source].sort((left,right)=>hotScore(right)-hotScore(left)||String(right.date).localeCompare(String(left.date))||String(left.title).localeCompare(String(right.title))),picked=[],categories=new Map();
  const add=(row,limitSimilarity=true,categoryLimit=2)=>{
   if(picked.some(item=>item.url===row.url))return false;
   if(categoryLimit&&(categories.get(hotCategory(row))||0)>=categoryLimit)return false;
   if(limitSimilarity&&picked.some(item=>hotTitleSimilarity(row,item)>.34))return false;
   picked.push(row);categories.set(hotCategory(row),(categories.get(hotCategory(row))||0)+1);return true;
  };
  for(const row of ranked){add(row,true,1);if(picked.length>=10)break}
  for(const row of ranked){if(picked.length>=10)break;add(row,true,2)}
  for(const row of ranked){if(picked.length>=10)break;add(row,true,0)}
  for(const row of ranked){if(picked.length>=10)break;add(row,false,0)}
  return picked.slice(0,10);
 }
 function hotTrend(row,list){
  const anchor=generatedAt(),base=new Date(Date.UTC(anchor.getUTCFullYear(),anchor.getUTCMonth(),anchor.getUTCDate())),category=hotCategory(row),days=[];
  for(let offset=7;offset>=1;offset--){const day=new Date(base);day.setUTCDate(day.getUTCDate()-offset);days.push(day.toISOString().slice(0,10))}
  const matching=list.filter(item=>hotCategory(item)===category&&days.includes(item.date)),values=days.map(day=>matching.filter(item=>item.date===day).length),previous=values.at(-2)||0,current=values.at(-1)||0,difference=current-previous;
  let state='flat',label='持平';
  if(difference>0){state='up';label=previous?'↑ '+Math.round(difference/previous*100)+'%':'新收录'}
  if(difference<0){state='down';label='↓ '+Math.round(Math.abs(difference)/Math.max(1,previous)*100)+'%'}
  return {values,state,label,sources:new Set(matching.map(item=>item.source)).size,records:matching.length};
 }
 function hotSparkline(trend){
  const width=132,height=34,pad=3,max=Math.max(1,...trend.values),points=trend.values.map((value,index)=>[pad+index*(width-pad*2)/Math.max(1,trend.values.length-1),height-pad-value/max*(height-pad*2)]),path=points.map(([x,y],index)=>(index?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)).join(' '),last=points.at(-1)||[width-pad,height-pad];
  return '<svg class="home-hot-spark home-hot-spark-'+trend.state+'" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="同类议题近 7 日收录趋势"><path class="home-hot-spark-area" d="'+path+' L '+(width-pad)+' '+(height-pad)+' L '+pad+' '+(height-pad)+' Z"></path><path class="home-hot-spark-line" d="'+path+'"></path><circle cx="'+last[0].toFixed(1)+'" cy="'+last[1].toFixed(1)+'" r="2.6"></circle></svg>';
 }
 function hotInitials(value){
  const latin=String(value||'').match(/[A-Za-z0-9]+/g);if(latin?.length)return latin.slice(0,2).map(word=>word[0]).join('').toUpperCase();
  return (String(value||'').match(/[\u3400-\u9fff]/g)||['AI']).slice(0,2).join('');
 }
 function hotMarks(row){
  const primary=row.direction_ids?.[0]||'foundation-model';
  return '<span class="home-hot-marks" aria-hidden="true"><i>'+esc(hotInitials(row.source))+'</i><i>'+esc(directionName(primary).slice(0,1))+'</i></span>';
 }
 function hotMeta(row,trend){
  const primary=row.direction_ids?.[0]||'foundation-model';
  return '<div class="home-hot-meta">'+hotMarks(row)+'<span><b data-keep-original>'+esc(row.source)+'</b><small><time>'+esc(row.date)+'</time> · '+esc(directionName(primary))+'</small></span></div><div class="home-hot-trend"><span>'+trend.sources+' 个来源 · '+trend.records+' 条记录</span>'+hotSparkline(trend)+'<strong>'+hotScore(row)+'<small>热点指数</small></strong></div>';
 }
 function hotBadge(trend){return '<span class="home-hot-change home-hot-change-'+trend.state+'" title="同类议题收录变化">'+esc(trend.label)+'</span>'}
 function hotCover(row){
  const primary=row.direction_ids?.[0]||'foundation-model',key=typeof madeoCoverKey==='function'?madeoCoverKey(row):'alignment';
  return '<figure class="home-hot-cover"><img src="assets/madeo/'+esc(key)+'.webp" width="1024" height="1024" loading="eager" decoding="async" alt="'+esc(directionName(primary)+' · 研究主题概念封面')+'"><figcaption>'+esc(directionName(primary))+'<small>主题封面</small></figcaption></figure>';
 }
 function hotPrimary(row,list){
  const trend=hotTrend(row,list);
  return '<article class="home-hot-primary" data-hot-rank="1"><a href="'+storyHref(row)+'"><div class="home-hot-rank"><strong>NO.01</strong>'+hotBadge(trend)+'</div><div class="home-hot-primary-body"><div class="home-hot-copy"><h3>'+localizedNewsCopy(row,'title')+'</h3><p>'+localizedNewsCopy(row,'description')+'</p></div>'+hotCover(row)+'</div><footer>'+hotMeta(row,trend)+'</footer></a></article>';
 }
 function hotSecondary(row,index,list){
  const trend=hotTrend(row,list);
  return '<article class="home-hot-secondary" data-hot-rank="'+(index+1)+'"><a href="'+storyHref(row)+'"><div class="home-hot-rank"><strong>NO.0'+(index+1)+'</strong>'+hotBadge(trend)+'</div><h3>'+localizedNewsCopy(row,'title')+'</h3><p>'+localizedNewsCopy(row,'description')+'</p><footer>'+hotMeta(row,trend)+'</footer></a></article>';
 }
 function hotListRow(row,index,list){
  const trend=hotTrend(row,list),rank=String(index+1).padStart(2,'0'),primary=row.direction_ids?.[0]||'foundation-model';
  return '<li data-hot-rank="'+(index+1)+'"><a href="'+storyHref(row)+'"><strong class="home-hot-list-rank">'+rank+'</strong><div class="home-hot-list-copy"><h3>'+localizedNewsCopy(row,'title')+'</h3><p>'+localizedNewsCopy(row,'description')+'</p><small><span data-keep-original>'+esc(row.source)+'</span> · <time>'+esc(row.date)+'</time> · '+esc(directionName(primary))+'</small></div><div class="home-hot-list-signal">'+hotSparkline(trend)+'<span><strong>'+hotScore(row)+'</strong>'+hotBadge(trend)+'</span></div></a></li>';
 }
 function hotboard(){
  const list=PortalCompact.stories().filter(row=>!row.paper_pick);if(!list.length)return '';
  const ranked=hotRanked(list);if(!ranked.length)return '';
  const info=currentInfo(),updated=(info?.generated_on||'').replace('T',' ').replace(/:\d{2}Z$/,' UTC'),status=info?.status||'unknown',secondary=ranked.slice(1,3).map((row,index)=>hotSecondary(row,index+1,list)).join(''),remaining=ranked.slice(3).map((row,index)=>hotListRow(row,index+3,list)).join('');
  return '<section class="home-news-flow home-hotboard" aria-labelledby="watch-hotboard-title"><header class="home-hotboard-head"><div><span class="home-hot-live"><i></i>实时热度</span><h2 id="watch-hotboard-title">AI 安全热点榜</h2><p>过去 72 小时，按公开分数、发布时间与议题去重整理 10 条安全信号。</p></div><div class="home-hotboard-status"><span class="home-news-update" data-status="'+esc(status)+'"><i></i>平台获取： <time>'+esc(updated||'—')+'</time></span><span>按公开分数、发布时间及议题去重排序</span><a href="#news">查看全部资讯'+portalIcon('arrow')+'</a></div></header><div class="home-hot-featured">'+hotPrimary(ranked[0],list)+'<div class="home-hot-secondary-stack">'+secondary+'</div></div>'+(remaining?'<div class="home-hot-list-head"><h3>继续看 <span data-keep-original>No.04–10</span></h3><span>来源 · 同类议题近 7 日收录趋势 · 热点指数</span></div><ol class="home-hot-list">'+remaining+'</ol>':'')+'<p class="home-hot-note">热点指数沿用 AI Safety HOT 公开字段；排序同时考虑发布时间并做标题近似去重。趋势线表示同类议题近 7 个完整自然日的收录量，不代表社交讨论量或风险等级。</p></section>';
 }
 function focusStories(list){
  const score=row=>Number(row.aihot_score||0),ranked=[...list].sort((left,right)=>String(right.date).localeCompare(String(left.date))||score(right)-score(left)),used=new Set(),picked=[];
  for(const direction of researchDirections){const row=ranked.find(item=>!used.has(item.id)&&item.direction_ids?.includes(direction.id));if(row){picked.push({row,direction:direction.id});used.add(row.id)}}
  for(const row of ranked){if(picked.length>=6)break;if(!used.has(row.id)){picked.push({row,direction:row.direction_ids?.[0]||'foundation-model'});used.add(row.id)}}
  return picked.slice(0,6);
 }
 function homeRiverStory(item,index){
  const {row,direction:primary}=item,label=(row.label||'AI Safety HOT').replace(/^AI Safety HOT · /,'');
  return '<article class="home-river-story" data-home-river-story data-direction="'+esc(primary)+'" '+(index?'hidden':'')+'><div class="home-river-story-main"><div class="home-river-story-meta"><span>'+esc(directionName(primary))+'</span><time>新闻发布： '+esc(row.date)+'</time></div><h3><a href="'+storyHref(row)+'">'+localizedNewsCopy(row,'title')+portalIcon('arrow')+'</a></h3><footer><span>来源： <b data-keep-original>'+esc(row.source)+'</b></span><span>'+esc(label)+'</span></footer></div><details class="home-river-summary"><summary>展开摘要</summary><p>'+localizedNewsCopy(row,'description')+'</p></details></article>';
 }
 function homePreview(){
  const list=PortalCompact.stories().filter(row=>!row.paper_pick);if(!list.length)return '';
  const focus=focusStories(list),info=currentInfo(),updated=(info?.generated_on||'').replace('T',' ').replace(/:\d{2}Z$/,' UTC'),status=info?.status||'unknown',stories=focus.map(homeRiverStory).join(''),counts=Object.fromEntries(researchDirections.map(direction=>[direction.id,list.filter(row=>row.direction_ids?.includes(direction.id)).length]));
  const filters='<nav class="home-river-filters" aria-label="筛选热点方向"><button type="button" class="active" data-home-river-filter="" aria-pressed="true"><span>全部热点</span><small>'+list.length+'</small></button>'+researchDirections.map(direction=>'<button type="button" data-home-river-filter="'+esc(direction.id)+'" aria-pressed="false" '+(counts[direction.id]?'':'disabled')+'><span>'+esc(direction.name)+'</span><small>'+counts[direction.id]+'</small></button>').join('')+'</nav>';
  return '<section class="home-news-flow home-signal-river" aria-labelledby="home-news-flow-title"><div class="home-river-head"><div><span data-keep-original>AI SAFETY SIGNAL RIVER</span><h2 id="home-news-flow-title">研究热点流</h2><p>公开来源经过主题聚类与信号筛选，汇聚为当前焦点。</p></div><div class="home-news-actions"><span class="home-news-update" data-status="'+esc(status)+'"><i></i>平台获取： <time>'+esc(updated||'—')+'</time></span><button type="button" class="home-news-toggle" data-home-flow-toggle aria-label="暂停动态" aria-pressed="false" title="暂停动态">'+portalIcon('pause')+'</button><a href="#watch">进入动态观察台'+portalIcon('arrow')+'</a></div></div>'+filters+'<div class="home-river-stage"><div class="home-river-canvas-panel"><canvas class="home-river-canvas" data-record-count="'+list.length+'" aria-hidden="true"></canvas><div class="home-river-tooltip" hidden></div><p class="visually-hidden">动态信息流：公开来源经过主题聚类和信号筛选，汇聚为当前焦点。</p><div class="home-river-axis" aria-hidden="true"><span>公开来源</span><span>主题聚类</span><span>信号筛选</span><span>当前焦点</span></div></div></div><aside class="home-river-focus" aria-label="当前焦点"><div class="home-river-focus-head"><span>当前焦点</span><div><button type="button" class="home-river-prev" data-home-river-step="-1" aria-label="上一条焦点" title="上一条焦点">'+portalIcon('arrow')+'</button><strong data-home-river-counter>01 / '+String(focus.length).padStart(2,'0')+'</strong><button type="button" data-home-river-step="1" aria-label="下一条焦点" title="下一条焦点">'+portalIcon('arrow')+'</button></div></div><div class="home-river-story-stack">'+stories+'</div></aside></section>';
 }
 function storyPage(id){
  const item=PortalCompact.stories().find(row=>row.id===id);if(!item)return notFound();
  const kind=PortalCompact.newsKinds[item.content_kind]||'研究热点',directions=(item.direction_ids||[]).map(directionName),acquired=(currentInfo()?.generated_on||'').replace('T',' ').replace('Z',' UTC'),related=PortalCompact.stories().filter(row=>row.id!==item.id&&row.content_kind===item.content_kind&&(row.direction_ids||[]).some(direction=>item.direction_ids?.includes(direction))).slice(0,3),back=routeLink('news',{content:item.content_kind});
  const original=item.original_url||item.url,sourceActions='<a class="button primary" href="'+esc(original)+'" target="_blank" rel="noopener noreferrer">查看原始发布页'+portalIcon('arrow')+'</a>'+(item.original_url?'<a class="button secondary" href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">查看 AI Safety HOT 条目'+portalIcon('arrow')+'</a>':'');
  return '<div class="wrap task-page news-detail-page"><nav class="news-detail-breadcrumb" aria-label="面包屑"><a href="#news">研究热点</a><span>/</span><a href="'+back+'">'+esc(kind)+'</a></nav><article class="news-detail"><header><div><span class="news-detail-kind">'+esc(kind)+'</span><h1>'+localizedNewsCopy(item,'title')+'</h1><p class="news-detail-source"><span data-keep-original>'+esc(item.source)+'</span><time>新闻发布： '+esc(item.date)+'</time></p></div><div class="news-detail-score"><span>热点指数</span><strong>'+hotScore(item)+'</strong><small>AI Safety HOT 公开字段</small></div></header><div class="news-detail-layout"><div class="news-detail-main"><section><h2>内容摘要</h2><p class="news-detail-summary">'+localizedNewsCopy(item,'description')+'</p></section><section><h2>站内归类</h2>'+topicTags(item.direction_ids||[])+'<p>'+esc(directions.join('、')||'暂未归类')+'</p></section><div class="news-detail-actions">'+sourceActions+'</div><p class="news-detail-note">本站保留标题、短摘要、日期与来源用于研究索引，不替代原文；结论与事实请以原始发布页为准。</p></div><aside class="news-detail-meta"><h2>记录信息</h2><dl><div><dt>内容类型</dt><dd>'+esc(kind)+'</dd></div><div><dt>发布来源</dt><dd data-keep-original>'+esc(item.source)+'</dd></div><div><dt>新闻发布时间</dt><dd>'+esc(item.date)+'</dd></div><div><dt>平台获取时间</dt><dd>'+esc(acquired||'未报告')+'</dd></div><div><dt>收录方式</dt><dd>'+esc(item.automated?'自动同步，待人工复核':'人工精选')+'</dd></div><div><dt>原始语言</dt><dd>'+esc(item.language||'未报告')+'</dd></div></dl></aside></div></article>'+(related.length?'<section class="news-detail-related"><header><h2>同类内容</h2><a href="'+back+'">查看全部'+portalIcon('arrow')+'</a></header><div>'+related.map(row=>'<a href="'+storyHref(row)+'"><span>'+esc(directionName(row.direction_ids?.[0]))+'</span><strong>'+localizedNewsCopy(row,'title')+'</strong><small><time>'+esc(row.date)+'</time> · <span data-keep-original>'+esc(row.source)+'</span></small></a>').join('')+'</div></section>':'')+'</div>';
 }
 function exportRows(){return rows().map(row=>({title:row.title,title_zh:row.title_zh||'',description_zh:row.description_zh||'',date:row.date,source:row.source,url:row.url,directions:row.direction_ids,automated:!!row.automated,verified:!!row.verified}))}
 function download(format){
  const records=exportRows(),stamp=generatedAt().toISOString().slice(0,10);let content,type;
  if(format==='csv'){
   const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';
   content=['title,title_zh,description_zh,date,source,url,directions,automated,verified',...records.map(row=>[row.title,row.title_zh,row.description_zh,row.date,row.source,row.url,row.directions.join('|'),row.automated,row.verified].map(quote).join(','))].join('\n');type='text/csv;charset=utf-8';
  }else{content=JSON.stringify({generated_on:generatedAt().toISOString(),filters:filters(),records},null,2);type='application/json;charset=utf-8'}
  const url=URL.createObjectURL(new Blob([content],{type})),anchor=document.createElement('a');anchor.href=url;anchor.download='ai-safety-index-watch-'+stamp+'.'+format;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return {page,homePreview,hotboard,storyPage,download};
})();

const watchBaseHome=home;
home=function(){
 let html=watchBaseHome();
 return html.replace('<section class="home-evaluation"',PortalWatch.homePreview()+'<section class="home-evaluation"');
};

const watchBaseRender=render;
render=function(){
 const current=route();
 if(current.path.startsWith('news/')){
  if(document.body){document.body.classList.add('madeo-subpage');document.body.classList.remove('madeo-home');document.body.dataset.madeoRoute='news-detail'}
  $('#main').innerHTML=PortalWatch.storyPage(decodeURIComponent(current.path.slice(5)));
  const pageLabel=document.querySelector('.md-page-label');if(pageLabel)pageLabel.textContent='研究热点';
  $$('[data-nav]').forEach(link=>{const active=link.dataset.nav==='news';link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
  $('#primary-nav').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false');$('#menu-button').setAttribute('aria-label','打开导航');
  document.title='热点详情 · AI Safety Index';updateTray();return;
 }
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
document.addEventListener('click',event=>{if(event.target.closest('[data-watch-reset]'))go('watch');const button=event.target.closest('[data-watch-export]');if(button)PortalWatch.download(button.dataset.watchExport);const toggle=event.target.closest('[data-home-flow-toggle]');if(toggle){const section=toggle.closest('.home-news-flow'),paused=section.classList.toggle('is-paused'),label=paused?'继续动态':'暂停动态';toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',label);toggle.setAttribute('title',label);toggle.innerHTML=portalIcon(paused?'play':'pause')}});
document.addEventListener('ai-safety-news-updated',()=>{const path=route().path;if(path==='home'){const current=document.querySelector('.home-signal-river');if(current)current.outerHTML=PortalWatch.homePreview()}else if(path==='watch'){const current=document.querySelector('.home-hotboard');if(current)current.outerHTML=PortalWatch.hotboard()}});
render();
