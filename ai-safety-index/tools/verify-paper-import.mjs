import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directions=['data-privacy','foundation-model','agent-software','physical-ai','human-societal','ai-x-science'];
let currentRoute={path:'papers',params:new URLSearchParams()};
const initial=[
 {id:'paper-agentdojo',name:'AgentDojo',year:'2024',url:'https://openreview.net/forum?id=m1YYAQjO3w',direction_ids:['agent-software']},
 {id:'paper-mm-safetybench',name:'MM-SafetyBench',year:'2024',url:'https://arxiv.org/abs/2311.17600',direction_ids:['foundation-model']},
 {id:'paper-xstest',name:'XSTest',year:'2024',url:'https://aclanthology.org/2024.naacl-long.301/',direction_ids:['foundation-model','human-societal']}
];
const context=vm.createContext({
 paperRecords:initial,URLSearchParams,document:{addEventListener(){}},
 route:()=>currentRoute,
 routeLink:(p,params)=>'#'+p+'?'+new URLSearchParams(params),
 getDirection:id=>({id,name:id}),
 recordListFor:(type,d)=>context.paperRecords.filter(r=>!d||r.direction_ids.includes(d)),
 esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 topicTags:()=>'',
});
vm.runInContext(fs.readFileSync(path.join(root,'opentai-papers.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'paper-library.js'),'utf8'),context);
const evaluate=source=>vm.runInContext(source,context);
const info=evaluate('paperImportInfo'),records=evaluate('importedPaperRecords');
assert.equal(info.upstream_count,info.imported_count+info.excluded_count);
assert.equal(records.length,info.imported_count);
assert.ok(records.length>450);
assert.equal(context.paperRecords.length,records.length+3);
assert.equal(new Set(context.paperRecords.map(r=>r.id)).size,context.paperRecords.length);
assert.equal(new Set(context.paperRecords.map(r=>r.url)).size,context.paperRecords.length);
for(const r of records){
 assert.match(r.url,/^https:\/\/arxiv\.org\/abs\/\d{4}\.\d{4,5}$/);
 assert.ok(r.authors.length&&r.authors.every(a=>typeof a==='string'&&a.trim()));
 assert.ok(r.direction_ids.length&&r.direction_ids.every(d=>directions.includes(d)));
 assert.ok(Number(r.year)>=1991&&Number(r.year)<=2026);
}
for(const d of directions)assert.equal(records.filter(r=>r.direction_ids.includes(d)).length,info.by_direction[d]);
const model=(direction='',query='')=>{
 context.testDirection=direction;context.testParams=new URLSearchParams(query);
 return evaluate("libraryModel('papers',testDirection,testParams)");
};
let m=model();assert.equal(m.visible.length,20);assert.equal(m.page,1);
for(let page=1;page<=m.pages;page++){
 const p=model('',`page=${page}`);
 assert.ok(p.visible.length<=20&&p.visible.length>0);
}
const allPages=Array.from({length:m.pages},(_,i)=>model('',`page=${i+1}`).visible).flat();
assert.equal(new Set(allPages.map(r=>r.id)).size,context.paperRecords.length);
assert.equal(model('','page=99999').page,m.pages);
for(const invalid of ['0','-1','NaN','2.5'])assert.equal(model('',`page=${invalid}`).page,1);
const authorPaper=records.find(r=>r.authors.length>8),lastAuthor=authorPaper.authors.at(-1);
assert.ok(model('','q='+encodeURIComponent(lastAuthor)).list.some(r=>r.id===authorPaper.id));
m=model('data-privacy','kind=survey');
assert.ok(m.list.length>0&&m.list.every(r=>r.direction_ids.includes('data-privacy')&&r.kind==='survey'));
assert.equal(model('','q=unfindable-string-4829').list.length,0);
currentRoute={path:'directions',params:new URLSearchParams('pillar=data-privacy&view=papers&q=backdoor&kind=research&page=4')};
const next=evaluate('libraryPageLink(2)');
assert.ok(next.includes('pillar=data-privacy')&&next.includes('view=papers')&&next.includes('q=backdoor')&&next.includes('kind=research')&&next.endsWith('page=2'));
context.unsafeRecord={name:'<script>alert(1)</script>',description:'<img src=x onerror=x>',source:'"fake"',year:'2024',url:'https://arxiv.org/abs/2401.00001',direction_ids:[]};
const html=evaluate("libraryRows([unsafeRecord],'papers')");
assert.ok(!html.includes('<script>')&&!html.includes('<img src=x'));
assert.ok(html.includes('&lt;script&gt;'));
console.log(JSON.stringify({papers:context.paperRecords.length,imported:records.length,pages:model().pages,checks:'unique citations, direction counts, complete pagination, author search, survey filter, safe text rendering, preserved scoped routes'},null,2));
