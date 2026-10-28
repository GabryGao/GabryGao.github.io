// Shared paper/data views, with bounded rendering for the expanded bibliography.
function libraryModel(type,direction='',params=route().params){
 const q=(params.get('q')||'').trim(),kind=type==='papers'?(params.get('kind')||''):'';
 const all=recordListFor(type,direction),term=q.toLocaleLowerCase();
 const list=all.filter(r=>(!kind||(r.kind||'research')===kind)&&[
  r.name,r.title,r.description,r.source,r.venue,r.year,...(r.authors||[]),
  ...(r.direction_ids||[]).map(id=>getDirection(id)?.name||'')
 ].filter(Boolean).map(value=>typeof SiteLocale==='undefined'?value:SiteLocale.searchText(value)).join(' ').toLocaleLowerCase().includes(term));
 const pageSize=20,pages=Math.max(1,Math.ceil(list.length/pageSize));
 const requested=Number(params.get('page')||1),page=Math.min(pages,Math.max(1,Number.isInteger(requested)?requested:1));
 return {q,kind,all,list,page,pages,pageSize,visible:list.slice((page-1)*pageSize,page*pageSize)};
}
function libraryPageLink(page){
 const r=route();return routeLink(r.path,{...Object.fromEntries(r.params),page:String(page)});
}
function libraryPagination(model){
 if(model.pages<2)return '';
 const numbers=[...new Set([1,model.page-1,model.page,model.page+1,model.pages])].filter(p=>p>=1&&p<=model.pages).sort((a,b)=>a-b);
 let previous=0;
 const middle=numbers.map(p=>{
  const gap=previous&&p>previous+1?'<span class="pagination-gap" aria-hidden="true">…</span>':'';previous=p;
  return gap+(p===model.page?'<span aria-current="page" class="pagination-current">'+p+'</span>':'<a aria-label="第 '+p+' 页" href="'+libraryPageLink(p)+'">'+p+'</a>');
 }).join('');
 return '<nav class="library-pagination" aria-label="资料分页">'+(model.page>1?'<a class="pagination-prev" href="'+libraryPageLink(model.page-1)+'">上一页</a>':'<span class="pagination-disabled">上一页</span>')+'<div class="pagination-numbers">'+middle+'</div>'+(model.page<model.pages?'<a class="pagination-next" href="'+libraryPageLink(model.page+1)+'">下一页</a>':'<span class="pagination-disabled">下一页</span>')+'</nav>';
}
function libraryRows(records,type){
 return records.map(r=>{
  const imported=r.import_source==='OpenTAI';
  const publication=type==='papers'?[r.year,r.venue==='arXiv'?'arXiv 预印本':r.venue,r.kind==='survey'?'综述':'研究论文'].filter(Boolean).join(' · '):r.kind;
  const authors=imported?'<span data-keep-original>'+esc(r.authors.slice(0,3).join('、'))+'</span>'+(r.authors.length>3?' <span>等（共 '+r.authors.length+' 位作者）</span>':''):'';
  const direction=esc(r.direction_ids?.[0]||'foundation-model');
  return '<article class="library-row library-card" data-direction="'+direction+'"><div class="library-record"><div class="library-meta">'+(imported?'':'<span>'+esc(r.source)+'</span>')+'<span>'+esc(publication)+'</span></div><h3'+(type==='papers'?' data-keep-original lang="en"':'')+'><a href="'+r.url+'" target="_blank" rel="noopener noreferrer">'+esc(r.name)+' <span aria-hidden="true">↗</span></a></h3><p class="paper-focus">'+esc(r.description)+'</p></div><div class="library-card-details">'+(authors?'<p class="paper-authors">'+authors+'</p>':'')+topicTags(r.direction_ids)+(r.benchmark?'<a class="record-related" href="#benchmark/'+r.benchmark+'">查看关联基准 ↗</a>':'')+'<a class="record-source" href="'+r.url+'" target="_blank" rel="noopener noreferrer">'+(type==='papers'?'论文原文':'数据与文档')+' ↗</a></div></article>';
 }).join('');
}
function libraryPanel(type,direction=''){
 const m=libraryModel(type,direction),paper=type==='papers',label=paper?'论文':'数据与资料';
 const filter=paper?'<label for="paper-kind">文献类型<select id="paper-kind"><option value="">研究与综述</option><option value="research" '+(m.kind==='research'?'selected':'')+'>研究论文</option><option value="survey" '+(m.kind==='survey'?'selected':'')+'>综述</option></select></label>':'';
 const source=paper?'<div class="paper-catalog-source">论文目录参考 <a href="'+paperImportInfo.source_url+'" target="_blank" rel="noopener noreferrer">OpenTAI</a> 整理 · '+paperImportInfo.imported_on+' 导入 · <a href="research-source/opentai-import-provenance.json" target="_blank" rel="noopener noreferrer">来源记录</a></div>':'';
 const r=route(),clearLink=routeLink(r.path,Object.fromEntries([...r.params].filter(([k])=>!['q','kind','page'].includes(k))));
 const empty=m.all.length?contentEmpty('没有找到匹配的'+label,'试试其他关键词，或清除搜索和文献类型筛选。',clearLink,'清除筛选'):contentEmpty('当前范围暂无'+label+'记录','这个方向保留研究问题与候选资源，正式资料确认后再加入目录。',direction?routeLink('directions',{pillar:direction}):'#'+type,direction?'返回方向概览':'查看完整列表');
 return '<div class="panel-toolbar library-toolbar">'+searchForm('library-search',paper?'搜索题名、作者、研究主题或年份':'搜索数据集、任务环境或资料库',m.q)+filter+'</div>'+source+'<div class="count-row"><span>'+m.list.length+' 条'+label+'记录</span><span>'+(paper?'年份由新到旧':'按当前筛选展示')+'</span></div>'+(m.list.length?'<div class="library-list" data-infinite-list data-infinite-batch="'+m.pageSize+'">'+libraryRows(m.list,type)+'</div>':empty)+'<p class="section-footnote">'+(paper?'条目链接到原始论文，研究方向由本站整理。目录收录不代表实验已复现。':'数据集、任务环境和风险资料库分别标注类型；下载、许可与使用条件以原始发布方为准。')+'</p>';
}
document.addEventListener('change',e=>{if(e.target.id==='paper-kind')replaceQuery('kind',e.target.value)});
