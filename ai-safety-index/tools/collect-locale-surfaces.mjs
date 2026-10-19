import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const elements=new Map(),html=[];
function element(key){
 if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',value:'',open:false,hidden:false,dataset:{},classList:{add(){},remove(){},toggle(){return false}},addEventListener(){},setAttribute(){},removeAttribute(){},focus(){},showModal(){this.open=true},close(){this.open=false},scrollIntoView(){},querySelector:q=>element(q),querySelectorAll:()=>[],insertAdjacentHTML(p,s){this.innerHTML+=s}});
 return elements.get(key);
}
const context=vm.createContext({console,URLSearchParams,location:{hash:''},document:{title:'',activeElement:element('active'),querySelector:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){},scrollTo(){},innerWidth:1280},setTimeout:()=>0,clearTimeout(){}});
for(const file of ['research-data.js','directions.js','app.js','portal-v4.js','portal-v5.js','opentai-papers.js','paper-library.js','portal-editorial.js']){
 const code=fs.readFileSync(path.join(root,file),'utf8').replace(/\nrender\(\);\s*$/,'\n');vm.runInContext(code,context,{filename:file});
}
const directions=vm.runInContext('researchDirections',context),benchmarks=vm.runInContext('benchmarkData',context);
const routes=['home','directions','papers','papers?page=25','papers?q=notfound','datasets','datasets?direction=data-privacy','benchmarks','benchmarks?q=notfound','results','methods','news','news?direction=data-privacy','news?q=notfound','about','unknown'];
for(let i=1;i<=25;i++)routes.push('papers?page='+i);
for(const d of directions)for(const view of ['overview','papers','datasets','benchmarks','results'])routes.push('directions?pillar='+d.id+'&view='+view);
for(const b of benchmarks)routes.push('benchmark/'+b.id,'results?benchmark='+b.id,'results?benchmark='+b.id+'&metric=attack');
for(const route of routes){
 context.location.hash='#'+route;vm.runInContext('render()',context);
 for(const [key,e] of elements)if(e.innerHTML){html.push({route,key,html:e.innerHTML});e.innerHTML=''}
}
for(const fn of ['showMethod()','showSubmit()','showSearch("zzzz")','state.selected.add("claude");state.selected.add("mini");showCompare()']){
 try{vm.runInContext(fn,context);for(const [key,e] of elements)if(e.innerHTML){html.push({route:fn,key,html:e.innerHTML});e.innerHTML=''}}catch(e){console.error(fn,e.message)}
}
html.push({route:'shell',html:fs.readFileSync(path.join(root,'index.html'),'utf8')});
html.push({route:'design-spec',html:fs.readFileSync(path.join(root,'design-spec.html'),'utf8')});
fs.writeFileSync(process.argv[2],JSON.stringify(html));
console.log('Collected '+html.length+' rendered surfaces');
