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
 function bundlePoint(lane,progress,width,height){
  const laneY=height*(.34+lane*.16),centerY=height*.5;
  if(progress<=.64)return {xPos:progress*width,yPos:laneY};
  const blend=smooth(Math.min(1,(progress-.64)/.29));
  return {xPos:progress*width,yPos:laneY+(centerY-laneY)*blend};
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
 function drawCanvas(canvas,context,elapsed){
  const bounds=canvas.getBoundingClientRect(),width=Math.max(1,Math.round(bounds.width)),height=Math.max(1,Math.round(bounds.height)),pixelRatio=Math.min(2,window.devicePixelRatio||1),targetWidth=Math.round(width*pixelRatio),targetHeight=Math.round(height*pixelRatio);
  if(canvas.width!==targetWidth||canvas.height!==targetHeight){canvas.width=targetWidth;canvas.height=targetHeight}
  context.setTransform(pixelRatio,0,0,pixelRatio,0,0);context.clearRect(0,0,width,height);
  context.lineCap='round';context.lineJoin='round';
  context.strokeStyle='rgba(80,98,105,.12)';context.lineWidth=1;
  for(const progress of [.31,.62,.84]){context.beginPath();context.moveTo(width*progress,height*.04);context.lineTo(width*progress,height*.88);context.stroke()}
  const recordCount=Math.max(36,Math.min(100,Number(canvas.dataset.recordCount)||72)),strands=[];
  for(let index=0;index<recordCount;index++)strands.push({position:(index+.5)/recordCount,lane:index%3,phase:unit(index,1)*Math.PI*2,amplitude:2+unit(index,2)*8,frequency:8+unit(index,3)*10,speed:.22+unit(index,4)*.28,offset:unit(index,5)});
  for(const strand of strands){context.strokeStyle='rgba(86,108,112,'+(0.12+strand.offset*.13)+')';context.lineWidth=.45+strand.offset*.3;strokeRange(context,strand,0,.7,42,width,height,elapsed)}
  for(const strand of strands){context.strokeStyle='rgba(86,108,112,'+(0.045+strand.offset*.045)+')';context.lineWidth=1+strand.offset*.5;strokeRange(context,strand,.56,.83,18,width,height,elapsed)}
  for(const strand of strands.filter((item,index)=>index%4===0)){const segmentStart=(elapsed*.035*strand.speed*5+strand.offset*.62)%0.68,segmentEnd=Math.min(.72,segmentStart+.045);context.strokeStyle='rgba(64,83,88,.48)';context.lineWidth=1.05;strokeRange(context,strand,segmentStart,segmentEnd,8,width,height,elapsed)}
  const laneCounts=[0,0,0];for(const strand of strands)laneCounts[strand.lane]++;
  for(let lane=0;lane<3;lane++){
   const bundleWidth=Math.min(22,8+laneCounts[lane]*.32),coreWidth=Math.max(6,bundleWidth*.48);
   context.strokeStyle='#59686b';strokeGrowingBundle(context,lane,.5,.74,20,1.2,bundleWidth*.58,width,height,.04,.12);
   context.strokeStyle=laneColors[lane];strokeGrowingBundle(context,lane,.6,.93,30,1.5,bundleWidth,width,height,.07,.18);
   strokeGrowingBundle(context,lane,.68,.945,28,1.8,coreWidth,width,height,.3,.72);
  }
  const trunkWidth=Math.min(17,11+recordCount*.055),centerY=height*.5;
  context.beginPath();context.moveTo(width*.9,centerY);context.bezierCurveTo(width*.945,centerY,width*.97,centerY,width,centerY);context.strokeStyle='#1f6b67';context.globalAlpha=.14;context.lineWidth=trunkWidth*1.2;context.stroke();context.globalAlpha=1;
  context.strokeStyle='#1f6b67';strokeGrowingBundle(context,1,.9,1,18,4,trunkWidth,width,height,.78,.94);
  context.fillStyle='#1f5d58';context.fillRect(width-6,centerY-trunkWidth*.72,6,trunkWidth*1.44);
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
