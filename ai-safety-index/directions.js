// Shared relationship diagram. Topic page templates are in portal-v4.js.
function directionHref(d){return '#directions?pillar='+d.id}
function directionMap(active){
 const node=(d,cls)=>'<a class="direction-node '+cls+(d.id===active?' selected':'')+'" href="'+directionHref(d)+'"'+(d.id===active?' aria-current="true"':'')+'><span class="node-role">'+d.role+'</span><strong>'+d.name+'</strong><span class="node-arrow" aria-hidden="true">↗</span></a>';
 return '<nav class="direction-map" aria-label="拟议研究方向关系导航"><div class="map-label"><span>六个支柱 · 一个关联框架</span><span>点击探索 ↘</span></div><div class="privacy-frame">'+node(researchDirections[0],'privacy-node')+'<div class="map-inside"><span class="map-connector" aria-hidden="true">↕</span>'+node(researchDirections[1],'foundation-node')+'<div class="map-branch" aria-hidden="true"><i></i><span>模型与系统 / 场景联动</span><i></i></div><div class="application-nodes">'+researchDirections.slice(2).map(d=>node(d,'application-node')).join('')+'</div></div><p class="privacy-caption">数据与隐私保护贯穿模型、系统与应用</p></div><p class="map-caption">关系导航依据提供的方案图整理；节点位置不代表研究优先级或安全得分。</p></nav>';
}

