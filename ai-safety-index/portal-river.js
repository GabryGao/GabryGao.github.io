/* Animated homepage signal river. Source records remain accessible as HTML below the canvas. */
var PortalRiver=(()=>{
 'use strict';
 function isPaused(section,hidden){return Boolean(hidden)||section.classList.contains('is-paused')}
 if(typeof document==='undefined'||typeof window==='undefined')return {mount(){},isPaused};

 const directionIds=researchDirections.map(direction=>direction.id);
 const laneColors=['#287363','#315aa7','#a14f37','#af7c1f','#75527f','#367949'];
 let controller=null;

 function seeded(index,salt){const value=Math.sin((index+1)*12.9898+(salt+1)*78.233)*43758.5453;return value-Math.floor(value)}
 function lanePosition(lane,height){return height*(.14+lane*(.68/Math.max(1,directionIds.length-1)))}
 function records(){
  const rows=PortalCompact.stories().filter(row=>!row.paper_pick).slice(0,105),loads=new Map(directionIds.map(id=>[id,0]));
  return rows.map((row,index)=>{
   const candidates=(row.direction_ids||[]).filter(id=>loads.has(id));
   const direction=(candidates.length?candidates:[directionIds[0]]).sort((left,right)=>(loads.get(left)||0)-(loads.get(right)||0))[0];
   loads.set(direction,(loads.get(direction)||0)+1);
   return {direction,lane:Math.max(0,directionIds.indexOf(direction)),source:(index+.5)/Math.max(1,rows.length),phase:seeded(index,1)*Math.PI*2,wave:2+seeded(index,2)*7,speed:.18+seeded(index,3)*.3,alpha:.1+seeded(index,4)*.16};
  });
 }
 function resizeCanvas(canvas,context){
  const bounds=canvas.getBoundingClientRect(),width=Math.max(1,Math.round(bounds.width)),height=Math.max(1,Math.round(bounds.height)),ratio=Math.min(2,window.devicePixelRatio||1),pixelWidth=Math.round(width*ratio),pixelHeight=Math.round(height*ratio);
  if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight}
  context.setTransform(ratio,0,0,ratio,0,0);
  return {width,height};
 }
 function draw(canvas,context,items,elapsed,activeDirection){
  const {width,height}=resizeCanvas(canvas,context),mergeY=height*.48;
  context.clearRect(0,0,width,height);
  context.lineCap='round';context.lineJoin='round';
  context.strokeStyle='rgba(82,101,108,.12)';context.lineWidth=1;
  for(const ratio of [.3,.58,.82]){context.beginPath();context.moveTo(width*ratio,height*.04);context.lineTo(width*ratio,height*.9);context.stroke()}

  for(const item of items){
   const selected=!activeDirection||item.direction===activeDirection,startY=height*(.055+item.source*.84),targetY=lanePosition(item.lane,height),wave=Math.sin(elapsed*item.speed+item.phase)*item.wave;
   context.beginPath();context.moveTo(-8,startY);context.bezierCurveTo(width*.2,startY+wave,width*.42,targetY-wave*.35,width*.68,targetY);
   context.strokeStyle='rgba(74,94,101,'+(selected?item.alpha:.025)+')';context.lineWidth=.45+(selected ? 0.45 : 0);context.stroke();
  }

  directionIds.forEach((direction,lane)=>{
   const count=items.filter(item=>item.direction===direction).length;if(!count)return;
   const selected=!activeDirection||direction===activeDirection,targetY=lanePosition(lane,height),color=laneColors[lane%laneColors.length];
   context.beginPath();context.moveTo(width*.68,targetY);context.bezierCurveTo(width*.78,targetY,width*.86,mergeY,width*.94,mergeY);
   context.strokeStyle=color;context.globalAlpha=selected?.62:.08;context.lineWidth=selected?Math.max(2.5,Math.min(10,2+count*.12)):1.2;context.stroke();
  });
  context.globalAlpha=1;
  context.beginPath();context.moveTo(width*.94,mergeY);context.lineTo(width+8,mergeY);context.strokeStyle='#266f72';context.lineWidth=8;context.stroke();
 }
 function mount(){
  const section=document.querySelector('.home-signal-river'),canvas=section?.querySelector('.home-river-canvas'),focus=section?.querySelector('.home-river-focus');
  if(!section||!canvas||!focus){controller?.destroy();controller=null;return}
  if(controller?.section===section)return;
  controller?.destroy();
  const context=canvas.getContext('2d');if(!context)return;
  const items=records(),stories=[...section.querySelectorAll('[data-home-river-story]')],buttons=[...section.querySelectorAll('[data-home-river-filter]')],counter=section.querySelector('[data-home-river-counter]'),tooltip=section.querySelector('.home-river-tooltip'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches,counts=Object.fromEntries(directionIds.map(id=>[id,items.filter(item=>item.direction===id).length]));
  let activeDirection='',storyIndex=0,elapsed=0,storyElapsed=0,lastTime=0,frameId=0,destroyed=false;
  function availableStories(){const filtered=activeDirection?stories.filter(story=>story.dataset.direction===activeDirection):stories;return filtered.length?filtered:stories}
  function showStory(nextIndex){const available=availableStories();if(!available.length)return;storyIndex=(nextIndex+available.length)%available.length;stories.forEach(story=>{story.hidden=true});available[storyIndex].hidden=false;focus.dataset.direction=available[storyIndex].dataset.direction||'foundation-model';if(counter)counter.textContent=String(storyIndex+1).padStart(2,'0')+' / '+String(available.length).padStart(2,'0');storyElapsed=0}
  function redraw(){draw(canvas,context,items,elapsed,activeDirection)}
  function filter(direction){activeDirection=directionIds.includes(direction)?direction:'';buttons.forEach(button=>{const selected=(button.dataset.homeRiverFilter||'')===activeDirection;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected))});showStory(0);redraw()}
  function directionAt(event){const bounds=canvas.getBoundingClientRect(),ratio=(event.clientY-bounds.top)/Math.max(1,bounds.height),lane=Math.round((ratio-.14)/(.68/Math.max(1,directionIds.length-1)));return lane>=0&&lane<directionIds.length?directionIds[lane]:''}
  function moveTooltip(event){const direction=directionAt(event);if(!tooltip||!direction){if(tooltip)tooltip.hidden=true;return}const bounds=canvas.getBoundingClientRect(),definition=getDirection(direction);tooltip.textContent=(definition?.name||direction)+' · '+(counts[direction]||0)+' 条记录 · 点击筛选';tooltip.hidden=false;tooltip.style.left=Math.min(bounds.width-198,Math.max(8,event.clientX-bounds.left+12))+'px';tooltip.style.top=Math.min(bounds.height-42,Math.max(8,event.clientY-bounds.top-18))+'px'}
  function clearTooltip(){if(tooltip)tooltip.hidden=true}
  function clickCanvas(event){const direction=directionAt(event);if(direction&&counts[direction])filter(activeDirection===direction?'':direction)}
  function frame(timestamp){
   if(destroyed)return;
   const delta=lastTime?Math.min(50,timestamp-lastTime):0;lastTime=timestamp;
   if(!isPaused(section,document.hidden)){elapsed+=delta/1000;if(!focus.matches(':hover')&&!focus.matches(':focus-within'))storyElapsed+=delta}
   draw(canvas,context,items,elapsed,activeDirection);
   if(!isPaused(section,document.hidden)&&storyElapsed>=6500)showStory(storyIndex+1);
   frameId=window.requestAnimationFrame(frame);
  }
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(redraw):null;observer?.observe(canvas);canvas.addEventListener('pointermove',moveTooltip);canvas.addEventListener('pointerleave',clearTooltip);canvas.addEventListener('click',clickCanvas);
  showStory(0);redraw();if(!reduced)frameId=window.requestAnimationFrame(frame);
  controller={section,step(amount){showStory(storyIndex+amount);redraw()},filter,destroy(){destroyed=true;if(frameId)window.cancelAnimationFrame(frameId);observer?.disconnect();canvas.removeEventListener('pointermove',moveTooltip);canvas.removeEventListener('pointerleave',clearTooltip);canvas.removeEventListener('click',clickCanvas)}};
 }

 const baseRender=render;
 render=function(){baseRender();window.requestAnimationFrame(mount)};
 document.addEventListener('ai-safety-news-updated',()=>window.requestAnimationFrame(mount));
 document.addEventListener('click',event=>{const step=event.target.closest('[data-home-river-step]');if(step&&controller?.section.contains(step))controller.step(Number(step.dataset.homeRiverStep)||1);const filterButton=event.target.closest('[data-home-river-filter]');if(filterButton&&controller?.section.contains(filterButton))controller.filter(filterButton.dataset.homeRiverFilter||'')});
 window.requestAnimationFrame(mount);
 return {mount,isPaused};
})();
