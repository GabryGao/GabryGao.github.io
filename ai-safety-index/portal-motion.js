/* Progressive motion: content is visible without this module.
   Observe route replacements only; translating text must never restart a page. */
var PortalMotion=(()=>{
 'use strict';
 const main=document.querySelector('#main');
 if(!main)return {};
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const easing='cubic-bezier(0.16, 1, 0.3, 1)';
 const seen=new WeakSet(),active=new Set();
 const cards='.library-card,.research-index-row,.topic-directory>a,.index-list>.bench-row,.news-list>.news-row,.resource-list>.resource-row,.hotspot-secondary>.hotspot-story';
 let page=null,intersection=null;
 function stop(){
  intersection?.disconnect();intersection=null;
  for(const animation of active)animation.cancel();active.clear();
 }
 function play(element,frames,timing){
  if(reduced.matches||document.hidden||!element)return;
  if(typeof element.animate!=='function'){element.dataset.motionPlayback='unsupported';return}
  try{
   const animation=element.animate(frames,{easing,fill:'none',...timing});
   active.add(animation);element.dataset.motionPlayback='playing';
   animation.finished.then(()=>{active.delete(animation);element.dataset.motionPlayback='settled'},()=>{active.delete(animation);element.dataset.motionPlayback='cancelled'});
  }catch{element.dataset.motionPlayback='unavailable'/* Content remains visible. */}
 }
 function reveal(entries){
  let index=0;
  for(const entry of entries){
   const node=entry.target;
   if(!entry.isIntersecting||!node.isConnected||seen.has(node))continue;
   seen.add(node);intersection?.unobserve(node);node.dataset.motionState='shown';
   // Keyboard navigation should land on an immediately stable target.
   if(node.contains(document.activeElement))continue;
   play(node,[
    {opacity:.68,transform:'translateY(28px)',clipPath:'inset(6% 0 0 0)'},
    {opacity:1,transform:'translateY(0)',clipPath:'inset(0 0 0 0)'}
   ],{duration:620,delay:Math.min(index++,2)*65});
  }
 }
 function refresh(){
  if(page===main.firstElementChild)return;
  page=main.firstElementChild;stop();
  const nodes=[...main.querySelectorAll(cards)];
  if(reduced.matches||document.hidden){for(const node of nodes)node.dataset.motionState='shown';return}
  // The lead illustration opens like an editorial cover, once per route visit.
  const image=main.querySelector('.hotspot-art img,.aw-hero-image');
  if(image)play(image,[
   {clipPath:'inset(0 0 100% 0)',transform:'scale(1.045)'},
   {clipPath:'inset(0 0 0 0)',transform:'scale(1)'}
  ],{duration:760});
  const title=main.querySelector('.page-head h1,.topic-heading h1,.hotspots-heading h1');
  if(title)play(title,[{opacity:.5,transform:'translateX(-14px)'},{opacity:1,transform:'translateX(0)'}],{duration:320});
  if(typeof IntersectionObserver==='undefined'){
   for(const node of nodes)node.dataset.motionState='shown';return;
  }
  intersection=new IntersectionObserver(reveal,{rootMargin:'0px 0px -24px 0px',threshold:.06});
  for(const node of nodes){node.dataset.motionState='waiting';intersection.observe(node)}
 }
 const routeObserver=new MutationObserver(records=>{
  if(records.some(record=>record.type==='childList'&&record.target===main))refresh();
 });
 routeObserver.observe(main,{childList:true});
 reduced.addEventListener('change',()=>{
  stop();
  for(const node of main.querySelectorAll(cards))node.dataset.motionState='shown';
 });
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){for(const animation of active)animation.cancel();active.clear()}
 });
 refresh();
 return {refresh};
})();
