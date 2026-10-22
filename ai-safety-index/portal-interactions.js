/* Reference-led interactions; research records and locale rendering stay independent. */
var PortalInteractions=(()=>{
 'use strict';
 function routeKey(hash){const [path='home',query='']=String(hash).replace(/^#/,'').split('?');return (path||'home')+(path==='directions'?':'+new URLSearchParams(query).get('pillar'):'' )}
 function renderImmediately(commit){commit()}
 const api={routeKey,renderImmediately};
 if(typeof document==='undefined'||!document.body)return api;
 const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
 const nav=document.querySelector('#primary-nav');
 const definitions={
  directions:[...researchDirections.map(d=>({label:d.name,href:'#directions?pillar='+d.id})),{label:'来源目录',href:'#sources'}],
  news:[{label:'动态观察台',href:'#watch'},{label:'最新资讯',href:'#news?content=latest'},{label:'研究解读',href:'#news?content=analysis'},{label:'成果分享',href:'#news?content=share'}],
  results:[{label:'评测看板',href:'#results'},{label:'基准目录',href:'#benchmarks'},{label:'方法与说明',href:'#methods'}],
  benchmarks:[{label:'评测看板',href:'#results'},{label:'基准目录',href:'#benchmarks'},{label:'方法与说明',href:'#methods'}],
  teams:[{label:'研究团队',href:'#teams'}]
 };
 let openGroup=null,leaveTimer,suppressFocus=false;
 function closeSubnav(){clearTimeout(leaveTimer);if(!openGroup)return;openGroup.querySelector('.md-nav-panel').hidden=true;openGroup.querySelectorAll('[aria-expanded]').forEach(e=>e.setAttribute('aria-expanded','false'));openGroup.classList.remove('is-open');openGroup=null}
 function openSubnav(group){
  clearTimeout(leaveTimer);if(openGroup!==group)closeSubnav();openGroup=group;
  const panel=group.querySelector('.md-nav-panel');panel.hidden=false;group.classList.add('is-open');
  panel.style.top=Math.round(document.querySelector('.site-header').getBoundingClientRect().bottom)+'px';
  group.querySelectorAll('[aria-expanded]').forEach(e=>e.setAttribute('aria-expanded','true'));
 }
 function submenuLinks(items){return items.map(x=>'<a href="'+esc(x.href)+'">'+esc(x.label)+portalIcon('arrow')+'</a>').join('')}
 for(const a of [...nav.querySelectorAll('[data-nav]')]){
  const key=a.dataset.nav,group=document.createElement('div');group.className='md-nav-group';group.dataset.subnav=key;
  a.replaceWith(group);group.append(a);
  a.setAttribute('aria-controls','md-subnav-'+key);a.setAttribute('aria-expanded','false');
  group.insertAdjacentHTML('beforeend','<button class="md-nav-toggle" type="button" aria-label="展开子栏目" aria-expanded="false" aria-controls="md-subnav-'+key+'"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg></button><div id="md-subnav-'+key+'" class="md-nav-panel" hidden>'+submenuLinks(definitions[key])+'</div>');
  group.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&fine.matches)openSubnav(group)});
  group.addEventListener('pointerleave',()=>{leaveTimer=setTimeout(()=>{if(!group.contains(document.activeElement)||!document.activeElement.matches(':focus-visible'))closeSubnav()},180)});
  group.addEventListener('focusin',e=>{if(!suppressFocus&&e.target.matches(':focus-visible'))openSubnav(group)});
  group.addEventListener('focusout',e=>{if(!group.contains(e.relatedTarget))closeSubnav()});
  group.querySelector('button').addEventListener('click',e=>{e.preventDefault();const wasOpen=openGroup===group&&!group.querySelector('.md-nav-panel').hidden;if(wasOpen)closeSubnav();else openSubnav(group)});
  group.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();suppressFocus=true;closeSubnav();a.focus();suppressFocus=false}else if(e.key==='ArrowDown'){e.preventDefault();openSubnav(group);group.querySelector('.md-nav-panel a').focus()}});
 }
 // Touch navigation exposes the same real destinations inside the full-screen menu.
 const menuNav=document.querySelector('#madeo-menu .md-menu-layout>nav');
 if(menuNav)for(const a of [...menuNav.children]){
  const key=a.getAttribute('href').slice(1),group=document.createElement('div');group.className='md-menu-group';
  a.replaceWith(group);const head=document.createElement('div');head.className='md-menu-group-head';group.append(head);head.append(a);
  head.insertAdjacentHTML('beforeend','<button type="button" class="md-menu-sub-toggle" aria-label="展开子栏目" aria-expanded="false" aria-controls="md-menu-sub-'+key+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg></button>');
  group.insertAdjacentHTML('beforeend','<div class="md-menu-sub" id="md-menu-sub-'+key+'" hidden>'+submenuLinks(definitions[key]||[])+'</div>');
  head.querySelector('button').addEventListener('click',e=>{const button=e.currentTarget,panel=group.querySelector('.md-menu-sub'),open=panel.hidden;panel.hidden=!open;button.setAttribute('aria-expanded',String(open))});
  group.querySelectorAll('.md-menu-sub a').forEach(link=>link.setAttribute('data-madeo-destination',''));
 }
 document.addEventListener('click',e=>{if(!e.target.closest('.md-nav-group')||e.target.closest('.md-nav-panel a'))closeSubnav()},true);
 window.addEventListener('resize',closeSubnav);window.addEventListener('scroll',closeSubnav,{passive:true});

 // Pages render immediately; use the platform's native pointer.
 const priorRender=render;let previousKey=routeKey(location.hash);
 render=function(){
  const next=routeKey(location.hash),changed=next!==previousKey;previousKey=next;closeSubnav();
  if(changed&&typeof closeMadeoMenu==='function')closeMadeoMenu(false);
  renderImmediately(()=>{priorRender();if(changed)window.scrollTo({top:0,behavior:'instant'})});
 };
 return api;
})();
