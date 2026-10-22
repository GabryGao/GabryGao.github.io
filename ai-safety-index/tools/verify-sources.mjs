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
const context=vm.createContext({console,URLSearchParams,location:{hash:'#sources'},document:{title:'',activeElement:element('active'),querySelector:element,querySelectorAll:()=>[],addEventListener(){},createElement:()=>element('created')},window:{addEventListener(){},scrollTo(){},innerWidth:1280},setTimeout:()=>0,clearTimeout(){}});
for(const file of ['research-data.js','directions.js','app.js','portal-v4.js','portal-v5.js','opentai-papers.js','paper-library.js','portal-editorial.js','news-feed.js','source-catalog.js','portal-framework.js','portal-home.js','portal-madeo.js','portal-results.js','portal-compact.js','portal-search.js','resource-submission.js','portal-watch.js','portal-sources.js']){
 const code=fs.readFileSync(path.join(root,file),'utf8').replace(/\nrender\(\);\s*$/,'\n');vm.runInContext(code,context,{filename:file});
}
const data=JSON.parse(vm.runInContext('JSON.stringify(SourceCatalogData)',context));
assert.equal(data.resources.length,171);
assert.equal(data.portals.length,21);
assert.equal(data.summary.historical_candidates,149);
assert.equal(data.summary.result_files,291);
assert.equal(data.summary.numeric_examples,2696);
assert.equal(new Set(data.resources.map(item=>item.id)).size,171);
for(const item of data.resources){
 assert.ok(item.url.startsWith('https://'),item.id+' source URL');
 for(const field of ['result_url','evidence_url'])if(item[field])assert.ok(item[field].startsWith('https://'),item.id+' '+field);
 for(const entry of item.data_entries)assert.ok(entry.url.startsWith('https://'),item.id+' data URL');
}
assert.equal(vm.runInContext('PortalSearch.search("PrivacyLens","sources").length',context),1);
assert.match(vm.runInContext('PortalSearch.search("PrivacyLens","sources")[0].href',context),/^#sources\?q=/);
vm.runInContext('render()',context);
let html=elements.get('#main').innerHTML;
assert.match(html,/AI 安全数据来源目录/);
assert.match(html,/171/);
assert.match(html,/来源目录分页/);
assert.match(html,/source-card/);
context.location.hash='#sources?view=portals';vm.runInContext('render()',context);html=elements.get('#main').innerHTML;
assert.equal((html.match(/source-portal-grid/g)||[]).length,1);
assert.match(html,/CyberAI Observatory/);
context.location.hash='#sources?view=downloads';vm.runInContext('render()',context);html=elements.get('#main').innerHTML;
assert.match(html,/评测结果样例 CSV/);
assert.match(html,/不是跨基准排名/);
assert.match(html,/result-file-manifest\.json/);
const publicRoot=path.join(root,'research-source','catalog-2026-10-22');
for(const file of ['AI_Safety_Index_数据来源汇总.html','六大方向来源清单.csv','source-catalog.json','入口与参考网站.csv','扩展候选线索_149项.csv','结果接入清单.csv','评测结果样例.csv','result-samples.json','result-summary.json','result-file-manifest.json','summary.json','README.txt','WEB_README.txt'])assert.ok(fs.existsSync(path.join(publicRoot,file)),file);
assert.ok(!fs.existsSync(path.join(publicRoot,'evidence')));
assert.ok(!fs.existsSync(path.join(publicRoot,'result-files')));
console.log('Source catalog checks passed: 171 reviewed resources, 21 portals, 149 historical candidates, public manifests, safe URLs and honest result boundaries.');
