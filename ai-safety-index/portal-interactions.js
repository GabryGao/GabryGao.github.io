/* Reference-led interactions; research records and locale rendering stay independent. */
var PortalInteractions=(()=>{
 'use strict';
 function routeKey(hash){const [path='home',query='']=String(hash).replace(/^#/,'').split('?');return (path||'home')+(path==='directions'?':'+new URLSearchParams(query).get('pillar'):'' )}
 function createTransitionGate(effect,timeout=1000){
  let generation=0,timer;
  return {run(commit,animated=true){
   const token=++generation;clearTimeout(timer);effect.reset();let applied=false;
   const apply=()=>{if(token!==generation||applied)return;applied=true;commit()};
   if(!animated){apply();return Promise.resolve()}
   timer=setTimeout(()=>{if(token!==generation)return;apply();++generation;effect.reset()},timeout);
   return Promise.resolve().then(()=>token===generation?effect.cover():undefined).catch(()=>{}).then(()=>{if(token!==generation)return;apply();return effect.reveal()}).catch(()=>{}).finally(()=>{if(token===generation){clearTimeout(timer);effect.reset()}});
  }};
 }
 const api={routeKey,createTransitionGate};
 if(typeof document==='undefined'||!document.body)return api;
 const fine=window.matchMedia('(hover: hover) and (pointer: fine)'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const nav=document.querySelector('#primary-nav');
 const definitions={
  directions:researchDirections.map(d=>({label:d.name,href:'#directions?pillar='+d.id})),
  news:[{label:'全部热点',href:'#news'},{label:'论文与项目',href:'#news?type=projects'},{label:'报告与指南',href:'#news?type=reports'},{label:'人工精选与归档',href:'#news?origin=curated'}],
  benchmarks:[{label:'基准目录',href:'#benchmarks'},{label:'公开结果',href:'#results'},{label:'方法与工具',href:'#methods'}],
  teams:[{label:'研究团队',href:'#teams'},{label:'加入我们',href:'#contact?intent=join'}],
  contact:[{label:'加入我们',href:'#contact?intent=join'},{label:'上传资源',href:'#contact?intent=resource'}]
 };
 const names={home:'AI Safety Index',directions:'研究方向',papers:'论文资料',datasets:'数据与任务',methods:'方法与工具',news:'研究热点',benchmarks:'基准与评测',benchmark:'基准与评测',results:'公开结果',teams:'研究团队',about:'研究团队',contact:'联系我们'};
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

 // A short, interruptible panel wipe marks a new collection, never a filter or locale update.
 const curtain=document.createElement('div');curtain.className='md-route-curtain';curtain.hidden=true;curtain.setAttribute('aria-hidden','true');
 curtain.innerHTML='<div class="md-curtain-brand" data-keep-original>AI SAFETY INDEX</div><div class="md-curtain-title"></div><div class="md-curtain-bars"><i></i><i></i><i></i></div>';document.body.append(curtain);
 let animations=[],nextTitle='',nextColor='#5fc79f';
 const gate=createTransitionGate({
  reset(){for(const a of animations)a.cancel();animations=[];curtain.hidden=true;curtain.dataset.phase='idle'},
  cover(){curtain.hidden=false;curtain.dataset.phase='cover';curtain.style.background=nextColor;curtain.querySelector('.md-curtain-title').textContent=typeof SiteLocale==='undefined'?nextTitle:SiteLocale.translate(nextTitle,SiteLocale.current());const a=curtain.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:210,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});animations.push(a);return a.finished},
  reveal(){curtain.dataset.phase='reveal';const a=curtain.animate([{transform:'translateY(0)'},{transform:'translateY(-100%)'}],{duration:300,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards',delay:50});animations.push(a);return a.finished}
 });
 const priorRender=render;let previousKey=routeKey(location.hash);
 render=function(){
  const next=routeKey(location.hash),changed=next!==previousKey;previousKey=next;closeSubnav();
  const p=route().path.split('/')[0];nextTitle=names[p]||'AI Safety Index';nextColor=p==='news'?'#f1a56f':p==='benchmarks'||p==='results'?'#b9c8f5':'#5fc79f';
  const animate=changed&&!reduced.matches&&!document.hidden&&typeof curtain.animate==='function';
  if(animate&&typeof closeMadeoMenu==='function')closeMadeoMenu(false);
  gate.run(()=>{priorRender();if(changed)window.scrollTo({top:0,behavior:'instant'})},animate);
 };
 reduced.addEventListener('change',()=>{if(reduced.matches&&!curtain.hidden)render()});

 // Fine mouse pointers get the reference's teal dot. Text inputs retain their text cursor.
 const dot=document.createElement('div');dot.className='md-pointer-dot';dot.setAttribute('aria-hidden','true');document.body.append(dot);
 let frame=0,x=0,y=0;
 function hideDot(){document.documentElement.classList.remove('md-dot-active');dot.classList.remove('is-visible')}
 function positionDot(){frame=0;dot.style.transform='translate3d('+x+'px,'+y+'px,0)'}
 document.addEventListener('pointermove',e=>{
  if(innerWidth<768||!fine.matches||reduced.matches||e.pointerType!=='mouse'||e.target.closest('input,textarea,select,[contenteditable="true"],iframe')){hideDot();return}
  const parent=e.target.closest('dialog[open]')||document.body;if(dot.parentElement!==parent)parent.append(dot);
  x=e.clientX;y=e.clientY;if(!frame)frame=requestAnimationFrame(positionDot);
  document.documentElement.classList.add('md-dot-active');dot.classList.add('is-visible');dot.classList.toggle('is-link',!!e.target.closest('a,button,summary'));
 },{passive:true});
 document.addEventListener('pointerout',e=>{if(!e.relatedTarget)hideDot()});
 document.addEventListener('keydown',hideDot);window.addEventListener('blur',hideDot);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hideDot()});
 document.addEventListener('close',()=>{if(dot.parentElement!==document.body)document.body.append(dot)},true);
 window.addEventListener('resize',hideDot);fine.addEventListener('change',hideDot);reduced.addEventListener('change',hideDot);
 return api;
})();
