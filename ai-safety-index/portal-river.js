/* Animated homepage signal river. The underlying records remain source-linked HTML. */
var PortalRiver=(()=>{
 'use strict';
 function isPaused(section,hidden){return Boolean(hidden)||section.classList.contains('is-paused')}
 if(typeof document==='undefined'||typeof window==='undefined')return {mount(){},isPaused};
 let activeController=null;
 const directionIds=researchDirections.map(direction=>direction.id);
 const laneColors=['#287363','#315aa7','#a14f37','#af7c1f','#75527f','#367949'];
 function unit(index,salt){const value=Math.sin((index+1)*12.9898+(salt+1)*78.233)*43758.5453;return value-Math.floor(value)}
 function smooth(value){return value*value*(3-2*value)}
 function laneY(lane,height){return height*(.15+lane*(.7/Math.max(1,directionIds.length-1)))}
 function strandPoint(strand,progress,width,height,elapsed){
  const sourceTop=height*.06,sourceBottom=height*.88,sourceY=sourceTop+(sourceBottom-sourceTop)*strand.position,targetY=laneY(strand.lane,height),centerY=height*.5,endY=centerY+(strand.lane-(directionIds.length-1)/2)*1.2,wave=Math.sin(progress*strand.frequency+strand.phase+elapsed*strand.speed)*strand.amplitude;
  let yPos;
  if(progress<.58)yPos=sourceY+wave*(1-progress*.42);
  else if(progress<.82){const blend=smooth((progress-.58)/.24);yPos=sourceY+(targetY-sourceY)*blend+wave*(1-blend)*.48}
  else{const blend=smooth((progress-.82)/.18);yPos=targetY+(endY-targetY)*blend+wave*(1-blend)*.12}
  return {xPos:progress*width,yPos};
 }
 function bundlePoint(lane,progress,width,height){
  const targetY=laneY(lane,height),centerY=height*.5;
  if(progress<=.67)return {xPos:progress*width,yPos:targetY};
  const blend=smooth(Math.min(1,(progress-.67)/.27));
  return {xPos:progress*width,yPos:targetY+(centerY-targetY)*blend};
 }
 function strokeRange(context,strand,start,end,steps,width,height,elapsed){
  context.beginPath();
  for(let step=0;step<=steps;step++){const progress=start+(end-start)*(step/steps),point=strandPoint(strand,progress,width,height,elapsed);if(step===0)context.moveTo(point.xPos,point.yPos);else context.lineTo(point.xPos,point.yPos)}
  context.stroke();
 }
 function strokeBundleRange(context,lane,start,end,steps,width,height){
  context.beginPath();
  for(let step=0;step<=steps;step++){const progress=start+(end-start)*(step/steps),point=bundlePoint(lane,progress,width,height);if(step===0)context.moveTo(point.xPos,point.yPos);else context.lineTo(point.xPos,point.yPos)}
  context.stroke();
 }
 function strokeGrowingBundle(context,lane,start,end,segments,startWidth,endWidth,width,height,startAlpha,endAlpha){
  const span=end-start,originalLineCap=context.lineCap;context.lineCap='butt';
  for(let segment=0;segment<segments;segment++){
   const progressStart=segment/segments,progressEnd=(segment+1)/segments,eased=smooth(progressEnd),overlap=segment?span*.004:0;
   context.lineWidth=startWidth+(endWidth-startWidth)*eased;context.globalAlpha=startAlpha+(endAlpha-startAlpha)*eased;
   strokeBundleRange(context,lane,start+span*progressStart-overlap,start+span*progressEnd,4,width,height);
  }
  context.globalAlpha=1;context.lineCap=originalLineCap;
 }
 function riverRecords(){
  const sourceRows=PortalCompact.stories().filter(row=>!row.paper_pick).slice(0,105),totals=new Map(directionIds.map(id=>[id,0]));
  return sourceRows.map((row,index)=>{
   const candidates=(row.direction_ids||[]).filter(id=>totals.has(id)),direction=(candidates.length?candidates:[directionIds[0]]).sort((left,right)=>(totals.get(left)||0)-(totals.get(right)||0))[0];
   totals.set(direction,(totals.get(direction)||0)+1);
   return {direction,lane:Math.max(0,directionIds.indexOf(direction)),position:(index+.5)/Math.max(1,sourceRows.length),phase:unit(index,1)*Math.PI*2,amplitude:2+unit(index,2)*7,frequency:8+unit(index,3)*10,speed:.22+unit(index,4)*.28,offset:unit(index,5)};
  });
 }
 function drawCanvas(canvas,context,records,elapsed,activeDirection){
  const bounds=canvas.getBoundingClientRect(),width=Math.max(1,Math.round(bounds.width)),height=Math.max(1,Math.round(bounds.height)),pixelRatio=Math.min(2,window.devicePixelRatio||1),targetWidth=Math.round(width*pixelRatio),targetHeight=Math.round(height*pixelRatio);
  if(canvas.width!==targetWidth||canvas.height!==targetHeight){canvas.width=targetWidth;canvas.height=targetHeight}
  context.setTransform(pixelRatio,0,0,pixelRatio,0,0);context.clearRect(0,0,width,height);context.lineCap='round';context.lineJoin='round';
  context.strokeStyle='rgba(80,98,105,.12)';context.lineWidth=1;
  for(const progress of [.31,.58,.82]){context.beginPath();context.moveTo(width*progress,height*.04);context.lineTo(width*progress,height*.9);context.stroke()}
  for(const strand of records){const selected=!activeDirection||strand.direction===activeDirection;context.strokeStyle='rgba(86,108,112,'+(selected ? .14+strand.offset*.13 : .025)+')';context.lineWidth=.42+strand.offset*.34;strokeRange(context,strand,0,.7,42,width,height,elapsed)}
  for(const strand of records){const selected=!activeDirection||strand.direction===activeDirection;context.strokeStyle='rgba(86,108,112,'+(selected ? .05+strand.offset*.05 : .012)+')';context.lineWidth=1+strand.offset*.5;strokeRange(context,strand,.54,.84,18,width,height,elapsed)}
  for(const strand of records.filter((item,index)=>index%4===0&&(!activeDirection||item.direction===activeDirection))){const segmentStart=(elapsed*.035*strand.speed*5+strand.offset*.62)%0.68,segmentEnd=Math.min(.72,segmentStart+.045);context.strokeStyle='rgba(64,83,88,.5)';context.lineWidth=1.05;strokeRange(context,strand,segmentStart,segmentEnd,8,width,height,elapsed)}
  const laneCounts=directionIds.map(id=>records.filter(record=>record.direction===id).length);
  for(let lane=0;lane<directionIds.length;lane++){
   if(!laneCounts[lane])continue;
   const selected=!activeDirection||directionIds[lane]===activeDirection,bundleWidth=Math.min(19,4+laneCounts[lane]*.34),coreWidth=Math.max(3,bundleWidth*.42);
   context.strokeStyle='#59686b';strokeGrowingBundle(context,lane,.5,.75,20,.7,bundleWidth*.42,width,height,selected ? .04 : .012,selected ? .12 : .025);
   context.strokeStyle=laneColors[lane];strokeGrowingBundle(context,lane,.61,.94,30,1.2,bundleWidth,width,height,selected ? .08 : .018,selected ? .23 : .04);
   strokeGrowingBundle(context,lane,.69,.95,28,1.6,coreWidth,width,height,selected ? .34 : .04,selected ? .78 : .08);
  }
  const visibleCount=activeDirection?records.filter(record=>record.direction===activeDirection).length:records.length,trunkWidth=Math.min(17,8+visibleCount*.07),centerY=height*.5;
  context.beginPath();context.moveTo(width*.92,centerY);context.bezierCurveTo(width*.955,centerY,width*.98,centerY,width,centerY);context.strokeStyle='#1f6b67';context.globalAlpha=.16;context.lineWidth=trunkWidth*1.25;context.stroke();context.globalAlpha=1;
  context.strokeStyle='#1f6b67';strokeGrowingBundle(context,Math.floor(directionIds.length/2),.92,1,18,3,trunkWidth,width,height,.78,.96);
  context.fillStyle='#1f5d58';context.fillRect(width-6,centerY-trunkWidth*.72,6,trunkWidth*1.44);
 }
 function mount(){
  activeController?.destroy();activeController=null;
  const section=document.querySelector('.home-signal-river'),canvas=section?.querySelector('.home-river-canvas'),focus=section?.querySelector('.home-river-focus');if(!section||!canvas||!focus)return;
  const context=canvas.getContext('2d');if(!context)return;
  const records=riverRecords(),stories=[...section.querySelectorAll('[data-home-river-story]')],buttons=[...section.querySelectorAll('[data-home-river-filter]')],counter=section.querySelector('[data-home-river-counter]'),tooltip=section.querySelector('.home-river-tooltip'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counts=Object.fromEntries(directionIds.map(id=>[id,records.filter(record=>record.direction===id).length]));
  let activeDirection='',storyIndex=0,elapsed=0,storyElapsed=0,lastTimestamp=0,frameId=0,needsDraw=true,destroyed=false,hoveredDirection='';
  function visibleStories(){const filtered=activeDirection?stories.filter(story=>story.dataset.direction===activeDirection):stories;return filtered.length?filtered:stories}
  function showStory(nextIndex){const available=visibleStories();if(!available.length)return;storyIndex=(nextIndex+available.length)%available.length;stories.forEach(story=>{story.hidden=true});available[storyIndex].hidden=false;focus.dataset.direction=available[storyIndex].dataset.direction||'foundation-model';if(counter)counter.textContent=String(storyIndex+1).padStart(2,'0')+' / '+String(available.length).padStart(2,'0');storyElapsed=0}
  function requestDraw(){needsDraw=true;if(reduced)drawCanvas(canvas,context,records,elapsed,activeDirection)}
  function filter(direction){activeDirection=directionIds.includes(direction)?direction:'';section.dataset.activeDirection=activeDirection;buttons.forEach(button=>{const selected=(button.dataset.homeRiverFilter||'')===activeDirection;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected))});showStory(0);requestDraw()}
  function directionAt(event){const bounds=canvas.getBoundingClientRect(),ratio=(event.clientY-bounds.top)/Math.max(1,bounds.height),lane=Math.round((ratio-.15)/(.7/Math.max(1,directionIds.length-1)));return lane>=0&&lane<directionIds.length?directionIds[lane]:''}
  function moveTooltip(event){hoveredDirection=directionAt(event);if(!tooltip||!hoveredDirection){if(tooltip)tooltip.hidden=true;return}const direction=getDirection(hoveredDirection),bounds=canvas.getBoundingClientRect();tooltip.textContent=(direction?.name||hoveredDirection)+' · '+(counts[hoveredDirection]||0)+' 条记录 · 点击筛选';tooltip.hidden=false;tooltip.style.left=Math.min(bounds.width-190,Math.max(8,event.clientX-bounds.left+12))+'px';tooltip.style.top=Math.min(bounds.height-42,Math.max(8,event.clientY-bounds.top-18))+'px'}
  function leaveCanvas(){hoveredDirection='';if(tooltip)tooltip.hidden=true}
  function clickCanvas(event){const direction=directionAt(event);if(direction&&counts[direction])filter(activeDirection===direction?'':direction)}
  const resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(requestDraw):null;resizeObserver?.observe(canvas);window.addEventListener('resize',requestDraw,{passive:true});canvas.addEventListener('pointermove',moveTooltip);canvas.addEventListener('pointerleave',leaveCanvas);canvas.addEventListener('click',clickCanvas);
  function frame(timestamp){
   if(destroyed)return;const delta=lastTimestamp?Math.min(50,timestamp-lastTimestamp):0;lastTimestamp=timestamp;const paused=isPaused(section,document.hidden),reading=focus.matches(':hover')||focus.matches(':focus-within');
   if(!paused){elapsed+=delta/1000;if(!reading)storyElapsed+=delta}
   if(needsDraw||!paused){drawCanvas(canvas,context,records,elapsed,activeDirection);needsDraw=false}
   if(!paused&&!reading&&storyElapsed>=6500)showStory(storyIndex+1);
   frameId=window.requestAnimationFrame(frame);
  }
  showStory(0);drawCanvas(canvas,context,records,0,'');if(!reduced)frameId=window.requestAnimationFrame(frame);
  activeController={section,step(amount){showStory(storyIndex+amount);requestDraw()},filter,destroy(){destroyed=true;if(frameId)window.cancelAnimationFrame(frameId);resizeObserver?.disconnect();window.removeEventListener('resize',requestDraw);canvas.removeEventListener('pointermove',moveTooltip);canvas.removeEventListener('pointerleave',leaveCanvas);canvas.removeEventListener('click',clickCanvas)}};
 }
 const riverBaseRender=render;
 render=function(){riverBaseRender();window.requestAnimationFrame(mount)};
 document.addEventListener('ai-safety-news-updated',()=>window.requestAnimationFrame(mount));
 document.addEventListener('click',event=>{const step=event.target.closest('[data-home-river-step]');if(step&&activeController?.section.contains(step))activeController.step(Number(step.dataset.homeRiverStep)||1);const filter=event.target.closest('[data-home-river-filter]');if(filter&&activeController?.section.contains(filter))activeController.filter(filter.dataset.homeRiverFilter||'')});
 window.requestAnimationFrame(mount);
 return {mount,isPaused};
})();
