/* Keep the homepage's supplied content order; join the shared editorial identity. */
const portalHomeBase=home;
home=function(){
 const covers=[['data-privacy','privacy'],['physical-ai','physical'],['human-societal','human']];
 const visual='<div class="md-home-covers">'+covers.map(([id,file])=>{const d=getDirection(id);return '<a href="'+routeLink('directions',{pillar:id})+'"><figure><img src="assets/madeo/'+file+'.webp" width="1100" height="1100" alt="'+esc(d.name)+' · 研究主题概念封面" '+(file==='privacy'?'fetchpriority="high"':'loading="lazy"')+'><figcaption>'+esc(d.name)+portalIcon('arrow')+'</figcaption></figure></a>'}).join('')+'</div>';
 let html=portalHomeBase().replace(/<img class="aw-hero-image"[^>]*>/,visual),i=0;
 const blogCovers=['alignment','agents','human'];
 html=html.replace(/<div class="aw-blog-cover">[\s\S]*?<\/div>/g,()=>'<div class="aw-blog-cover"><img src="assets/madeo/'+blogCovers[i++]+'.webp" width="1100" height="1100" alt="研究主题概念封面" loading="lazy"></div>');
 return html;
};
