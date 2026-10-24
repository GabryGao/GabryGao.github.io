/* Animated homepage signal river. The underlying records remain source-linked HTML. */
var PortalRiver=(()=>{
 'use strict';
 if(typeof document==='undefined'||typeof window==='undefined')return {mount(){}};
 let activeController=null;
 const laneColors=['#2d7167','#3d6791','#a35d49'];
 function unit(index,salt){const value=Math.sin((index+1)*12.9898+(salt+1)*78.233)*43758.5453;return value-Math.floor(value)}
 function smooth(value){return value*value*(3-2*value)}
 function strandPoint(strand,progress,width,height,elapsed){
  const sourceTop=height*.08,sourceBottom=height*.82,sourceY=sourceTop+(sourceBottom-sourceTop)*strand.position,laneY=height*(.34+strand.lane*.16),endY=height*.5+(strand.lane-1)*4,wave=Math.sin(progress*strand.frequency+strand.phase+elapsed*strand.speed)*strand.amplitude;
  let yPos;
  if(progress<.62)yPos=sourceY+wave*(1-progress*.45);
  else if(progress<.84){const blend=smooth((progress-.62)/.22);yPos=sourceY+(laneY-sourceY)*blend+wave*(1-blend)*.5}
  else{const blend=smooth((progress-.84)/.16);yPos=laneY+(endY-laneY)*blend+wave*(1-blend)*.15}
  return {xPos:progress*width,yPos};
 }
 function strokeRange(context,strand,start,end,steps,width,height,elapsed){
  context.beginPath();
  for(let step=0;step<=steps;step++){const progress=start+(end-start)*(step/steps),point=strandPoint(strand,progress,width,height,elapsed);if(step===0)context.moveTo(point.xPos,point.yPos);else context.lineTo(point.xPos,point.yPos)}
  context.stroke();
 }
 function drawCanvas(canvas,context,elapsed){
  const bounds=canvas.getBoundingClientRect(),width=Math.max(1,Math.round(bounds.width)),height=Math.max(1,Math.round(bounds.height)),pixelRatio=Math.min(2,window.devicePixelRatio||1),targetWidth=Math.round(width*pixelRatio),targetHeight=Math.round(height*pixelRatio);
  if(canvas.width!==targetWidth||canvas.height!==targetHeight){canvas.width=targetWidth;canvas.height=targetHeight}
  context.setTransform(pixelRatio,0,0,pixelRatio,0,0);context.clearRect(0,0,width,height);
  context.lineCap='round';context.lineJoin='round';
  context.strokeStyle='rgba(80,98,105,.12)';context.lineWidth=1;
  for(const progress of [.31,.62,.84]){context.beginPath();context.moveTo(width*progress,height*.04);context.lineTo(width*progress,height*.88);context.stroke()}
  const recordCount=Math.max(36,Math.min(100,Number(canvas.dataset.recordCount)||72)),strands=[];
  for(let index=0;index<recordCount;index++)strands.push({position:(index+.5)/recordCount,lane:index%3,phase:unit(index,1)*Math.PI*2,amplitude:2+unit(index,2)*8,frequency:8+unit(index,3)*10,speed:.22+unit(index,4)*.28,offset:unit(index,5)});
  for(const strand of strands){context.strokeStyle='rgba(86,108,112,'+(0.12+strand.offset*.13)+')';context.lineWidth=.55+strand.offset*.35;strokeRange(context,strand,0,1,52,width,height,elapsed)}
  for(const strand of strands.filter((item,index)=>index%4===0)){const segmentStart=(elapsed*.035*strand.speed*5+strand.offset*.72)%0.78,segmentEnd=Math.min(.86,segmentStart+.045);context.strokeStyle='rgba(64,83,88,.48)';context.lineWidth=1.1;strokeRange(context,strand,segmentStart,segmentEnd,8,width,height,elapsed)}
  for(let lane=0;lane<3;lane++){const laneStartY=height*(.34+lane*.16),laneEndY=height*.5+(lane-1)*4;context.beginPath();context.moveTo(width*.63,laneStartY);context.bezierCurveTo(width*.78,laneStartY,width*.86,laneEndY,width,laneEndY);context.strokeStyle=laneColors[lane];context.globalAlpha=.58;context.lineWidth=5+lane;context.stroke();context.globalAlpha=1}
  context.fillStyle='#1f5d58';context.fillRect(width-5,height*.5-10,5,20);
 }
 function mount(){
  activeController?.destroy();activeController=null;
  const section=document.querySelector('.home-signal-river'),canvas=section?.querySelector('.home-river-canvas'),focus=section?.querySelector('.home-river-focus');if(!section||!canvas||!focus)return;
  const context=canvas.getContext('2d');if(!context)return;
  const stories=[...section.querySelectorAll('[data-home-river-story]')],counter=section.querySelector('[data-home-river-counter]'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let storyIndex=0,elapsed=0,storyElapsed=0,lastTimestamp=0,frameId=0,needsDraw=true,destroyed=false;
  function showStory(nextIndex){if(!stories.length)return;storyIndex=(nextIndex+stories.length)%stories.length;stories.forEach((story,index)=>{story.hidden=index!==storyIndex});focus.dataset.direction=stories[storyIndex].dataset.direction||'foundation-model';if(counter)counter.textContent=String(storyIndex+1).padStart(2,'0')+' / '+String(stories.length).padStart(2,'0');storyElapsed=0}
  function requestDraw(){needsDraw=true;if(reduced)drawCanvas(canvas,context,elapsed)}
  const resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(requestDraw):null;resizeObserver?.observe(canvas);window.addEventListener('resize',requestDraw,{passive:true});
  function frame(timestamp){
   if(destroyed)return;const delta=lastTimestamp?Math.min(50,timestamp-lastTimestamp):0;lastTimestamp=timestamp;const paused=section.classList.contains('is-paused')||document.hidden,reading=focus.matches(':hover')||focus.matches(':focus-within');
   if(!paused){elapsed+=delta/1000;if(!reading)storyElapsed+=delta}
   if(needsDraw||!paused){drawCanvas(canvas,context,elapsed);needsDraw=false}
   if(!paused&&!reading&&storyElapsed>=6500)showStory(storyIndex+1);
   frameId=window.requestAnimationFrame(frame);
  }
  showStory(0);drawCanvas(canvas,context,0);if(!reduced)frameId=window.requestAnimationFrame(frame);
  activeController={section,step(amount){showStory(storyIndex+amount);requestDraw()},destroy(){destroyed=true;if(frameId)window.cancelAnimationFrame(frameId);resizeObserver?.disconnect();window.removeEventListener('resize',requestDraw)}};
 }
 const riverBaseRender=render;
 render=function(){riverBaseRender();window.requestAnimationFrame(mount)};
 document.addEventListener('ai-safety-news-updated',()=>window.requestAnimationFrame(mount));
 document.addEventListener('click',event=>{const button=event.target.closest('[data-home-river-step]');if(button&&activeController?.section.contains(button))activeController.step(Number(button.dataset.homeRiverStep)||1)});
 window.requestAnimationFrame(mount);
 return {mount};
})();
