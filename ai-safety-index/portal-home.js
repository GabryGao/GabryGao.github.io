/* Keep the homepage's supplied content order; join the shared editorial identity. */
const portalHomeBase=home;
home=function(){
 const covers=[['paper-agentdojo','agents'],['paper-mm-safetybench','alignment'],['paper-xstest','human']];
 const visual='<section class="home-recommendations" aria-labelledby="home-recommendations-title"><div class="home-recommendations-head"><h2 id="home-recommendations-title">研究推荐</h2><a href="#papers">浏览全部论文'+portalIcon('arrow')+'</a></div><div class="md-home-covers">'+covers.map(([id,file])=>{const item=paperRecords.find(x=>x.id===id);return '<article><a href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer"><img src="assets/madeo/'+file+'.webp" width="1100" height="1100" alt="研究主题概念封面" loading="lazy"><h3 data-keep-original>'+esc(item.name)+'</h3></a><p>'+esc(item.description)+'</p>'+topicTags(item.direction_ids)+'<div class="home-work-links"><a href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">论文原文'+portalIcon('arrow')+'</a>'+(item.source_url?'<a href="'+esc(item.source_url)+'" target="_blank" rel="noopener noreferrer">项目与代码'+portalIcon('arrow')+'</a>':'<a href="#benchmark/'+item.benchmark+'">查看基准'+portalIcon('arrow')+'</a>')+'</div></article>'}).join('')+'</div></section>';
 let html=portalHomeBase().replace(/<img class="aw-hero-image"[^>]*>/,visual),i=0;
 html=html.replace('让 AI 安全研究，<br><span>有据可循。</span>','找到需要的<br><span>AI 安全研究。</span>').replace('AI Safety Index · 研究与评测门户','论文、数据、基准与评测，一站查找。');
 const finder='<div class="home-finder">'+searchForm('home-resource-search','搜索论文、基准、数据或工具','',true)+'<nav class="home-quick-links" aria-label="常用入口">'+[['papers','论文资料'],['datasets','数据与任务'],['benchmarks','评测基准'],['results','公开结果'],['upload','上传资源']].map(([path,label])=>'<a href="#'+path+'">'+label+portalIcon('arrow')+'</a>').join('')+'</nav></div>';
 html=html.replace('<section class="home-recommendations"',finder+'<section class="home-recommendations"');
 html=html.replace('一起完善 AI 安全的研究入口。','让更多人看到你的研究。').replace('参与平台建设，或分享值得收录的公开资源。','提供论文、项目或数据的公开链接与研究简介，供推荐栏目整理。');

 const blogCovers=['alignment','agents','human'];
 html=html.replace(/<div class="aw-blog-cover">[\s\S]*?<\/div>/g,()=>'<div class="aw-blog-cover"><img src="assets/madeo/'+blogCovers[i++]+'.webp" width="1100" height="1100" alt="研究主题概念封面" loading="lazy"></div>');
 return html;
};
