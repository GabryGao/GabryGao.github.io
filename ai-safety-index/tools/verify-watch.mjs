import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const elements=new Map();
function element(key){
 if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',value:'',open:false,hidden:false,dataset:{},classList:{add(){},remove(){},toggle(){return false}},addEventListener(){},setAttribute(){},removeAttribute(){},focus(){},showModal(){this.open=true},close(){this.open=false},scrollIntoView(){},querySelector:q=>element(q),querySelectorAll:()=>[],insertAdjacentHTML(position,value){this.innerHTML+=value}});
 return elements.get(key);
}
const context=vm.createContext({console,URLSearchParams,URL:{createObjectURL(){return 'blob:test'},revokeObjectURL(){}},Blob:class{},FormData:class{constructor(){this.values=new Map()}get(){return ''}},location:{hash:'#watch'},document:{title:'',activeElement:element('active'),querySelector:element,querySelectorAll:()=>[],addEventListener(){},createElement:()=>element('created')},window:{addEventListener(){},scrollTo(){},innerWidth:1280},setTimeout:()=>0,clearTimeout(){}});
for(const file of ['research-data.js','directions.js','app.js','portal-v4.js','portal-v5.js','opentai-papers.js','paper-library.js','portal-editorial.js','news-feed.js','portal-framework.js','portal-home.js','portal-madeo.js','source-catalog.js','evaluation-data.js','portal-results.js','portal-compact.js','portal-catalog.js','portal-search.js','resource-submission.js','portal-watch.js']){
 const code=fs.readFileSync(path.join(root,file),'utf8').replace(/\nrender\(\);\s*$/,'\n');vm.runInContext(code,context,{filename:file});
}
vm.runInContext('render()',context);
const html=elements.get('#main').innerHTML;
assert.match(html,/AI 安全动态观察台/);
assert.match(html,/近 72 小时信息流/);
assert.match(html,/每日研究简报/);
assert.match(html,/来源与数据状态/);
assert.match(html,/data-watch-export="json"/);
assert.match(html,/research-source\/news-feed-provenance\.json/);
assert.equal(context.document.title,'动态观察台 · AI Safety Index');
context.location.hash='#home';vm.runInContext('render()',context);
const home=elements.get('#main').innerHTML;
assert.match(home,/home-news-flow/);
assert.match(home,/home-signal-river/);
assert.ok(home.indexOf('home-signal-river')<home.indexOf('mh-intro'),'Signal river must be the first homepage section');
assert.match(home,/home-river-canvas/);
assert.match(home,/AI 安全每天都有新动态/);
assert.match(home,/home-river-focus/);
assert.match(home,/data-home-flow-toggle/);
assert.match(home,/data-home-river-step="-1"/);
assert.match(home,/data-home-river-step="1"/);
const homeRecordCount=vm.runInContext('PortalCompact.stories().filter(row=>!row.paper_pick).length',context);
assert.match(home,new RegExp(`data-record-count="${homeRecordCount}"`));
assert.match(home,/aria-hidden="true"/);
assert.equal((home.match(/class="home-river-story"/g)||[]).length,Math.min(6,homeRecordCount));
assert.doesNotMatch(home,/home-news-track/);
assert.match(home,/href="#watch"/);
assert.doesNotMatch(home,/href="#sources"/);
assert.match(home,/href="#results"/);
const river=fs.readFileSync(path.join(root,'portal-river.js'),'utf8');
assert.match(river,/getContext\('2d'\)/);
assert.match(river,/requestAnimationFrame/);
assert.match(river,/ResizeObserver/);
assert.match(river,/prefers-reduced-motion/);
assert.match(river,/bezierCurveTo/);
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(page,/portal-river\.js/);
const workflow=fs.readFileSync(path.resolve(root,'../.github/workflows/update-ai-safety-index.yml'),'utf8');
assert.match(workflow,/20 \*\/3 \* \* \*/);
assert.match(workflow,/50 1 \* \* \*/);
console.log('Watch checks passed: animated homepage signal river, rotating focus stories, three-hour news schedule, evaluation shortcut, route, recent flow, topic signals, daily brief, source status and exports.');
