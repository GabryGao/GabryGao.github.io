// Editorial presentation. Shared records, topic filters and evaluation logic remain in v4/v5.
function editorialLink(path,label,cls=''){return '<a class="'+cls+'" href="'+path+'">'+label+' <span aria-hidden="true">↗</span></a>'}
function compactDirections(){
 return '<section class="research-index" id="home-topics"><div class="research-index-intro"><h2>六个方向，<br>理解 AI 安全。</h2><p>从数据与模型，到系统、人与专业领域。每个专题连接相关论文、数据和评测。</p>'+editorialLink('#directions','探索全部方向','underlined-link')+'</div><div class="research-index-list">'+researchDirections.map(d=>'<a class="research-index-row" href="'+routeLink('directions',{pillar:d.id})+'"><div><h3>'+d.name+'</h3><span lang="en">'+d.en+'</span></div><p>'+d.short+'<span class="research-paper-count">'+recordListFor('papers',d.id).length+' 篇论文</span></p><span class="index-arrow" aria-hidden="true">↗</span></a>').join('')+'</div></section>';
}
function hotspotStory(n,lead=false){
 return '<article class="hotspot-story '+(lead?'hotspot-lead':'')+'">'+topicTags(n.direction_ids)+'<h2><a href="'+n.url+'" target="_blank" rel="noopener noreferrer">'+esc(n.title)+'</a></h2><p>'+esc(n.description)+'</p><div class="hotspot-meta"><span>'+esc(n.source)+'</span><time datetime="'+n.date+'">'+n.date+'</time></div>'+(lead?'<figure class="hotspot-art"><img src="assets/agent-boundary.jpg" width="1448" height="1086" alt="概念插画：外部指令越过系统边界。"><figcaption>系统边界 · 概念插画</figcaption></figure>':'')+'<a class="underlined-link" href="'+n.url+'" target="_blank" rel="noopener noreferrer">阅读原文 <span aria-hidden="true">↗</span></a></article>';
}
function homepageNews(){
 const list=newsRecords.filter(n=>n.featured).sort((a,b)=>b.order.localeCompare(a.order));
 return '<section class="home-hotspots" id="home-updates" aria-labelledby="hotspots-title"><div class="hotspots-heading"><div><h1 id="hotspots-title">研究热点</h1><p>值得关注的问题、研究与新进展。</p></div><a class="underlined-link" href="#news">全部热点 <span aria-hidden="true">↗</span></a></div><div class="hotspot-grid">'+hotspotStory(list[0],true)+'<div class="hotspot-secondary">'+list.slice(1).map(n=>hotspotStory(n)).join('')+'</div></div><div class="hotspot-note"><span>人工精选 · 按来源发布日期排列</span><span>本次选编 2026.10.18</span></div></section>';
}
function home(){
 return '<div class="wrap editorial-home"><div class="publication-line"><p>AI 安全领域的研究与评测资料索引</p><nav aria-label="资料入口"><a href="#papers">论文</a><a href="#datasets">数据</a><a href="#benchmarks">基准</a><a href="#results">公开结果</a></nav></div>'+homepageNews()+'<section class="search-rail" aria-label="查找资料"><div><h2>带着问题，查找资料。</h2><p>研究方向、论文、基准与数据。</p></div>'+searchForm('hero-search','输入名称或关键词…','',true)+'</section>'+compactDirections()+'<section class="benchmark-editorial">'+pageSection('从问题走向评测','三项基准，三种不同的测量对象。','#benchmarks','浏览基准目录')+'<div class="benchmark-columns">'+[benchmarkData[0],benchmarkData[1],benchmarkData[5]].map(b=>'<article><div class="benchmark-kind">'+esc(b.object)+'</div><h3><a href="#benchmark/'+b.id+'">'+b.name+'</a></h3><p>'+b.desc+'</p><div class="benchmark-bottom"><span>'+b.year+' · '+b.modality+'</span>'+editorialLink('#benchmark/'+b.id,'查看基准')+'</div></article>').join('')+'</div><div class="results-reading-link"><p>已经找到基准？查看对应模型版本与测试条件下的公开结果。</p>'+editorialLink('#results','阅读评测结果','underlined-link')+'</div></section></div>';
}
// One initial render, after both shared data and this presentation have loaded.
render();
