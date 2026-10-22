import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const elements=new Map();
function element(key){
 if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',value:'',open:false,hidden:false,dataset:{},classList:{add(){},remove(){},toggle(){return false}},addEventListener(){},setAttribute(){},removeAttribute(){},focus(){},showModal(){this.open=true},close(){this.open=false},scrollIntoView(){},querySelector:q=>element(q),querySelectorAll:()=>[]});
 return elements.get(key);
}
const context=vm.createContext({console,URLSearchParams,location:{hash:''},document:{title:'',activeElement:element('active'),querySelector:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){},scrollTo(){},innerWidth:1280},setTimeout:()=>0,clearTimeout(){}});
for(const file of ['research-data.js','directions.js','app.js','portal-v4.js','portal-v5.js','opentai-papers.js','news-feed.js','source-catalog.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const content=JSON.parse(vm.runInContext('JSON.stringify({directions:researchDirections.length,papers:paperRecords.length,benchmarks:benchmarkData.length,automated_news:automatedNewsRecords.length,source_catalog:SourceCatalogData.summary.resources,reference_portals:SourceCatalogData.summary.portals,historical_candidates:SourceCatalogData.summary.historical_candidates,result_file_manifest:SourceCatalogData.summary.result_files})',context));
const feeds=JSON.parse(vm.runInContext('JSON.stringify(automatedNewsInfo)',context));
const status={generated_on:new Date().toISOString(),site:'https://gabrygao.github.io/ai-safety-index/',content,feeds:{generated_on:feeds.generated_on,status:feeds.status,record_count:feeds.record_count,sources:feeds.sources.map(source=>({id:source.id,name:source.name,status:source.status,last_successful_fetch:source.last_successful_fetch}))}};
fs.writeFileSync(path.join(root,'status.json'),JSON.stringify(status,null,2)+'\n');
console.log(`Status written: ${content.papers} papers, ${content.benchmarks} benchmarks, ${content.source_catalog} source records, ${content.automated_news} automated news records.`);
