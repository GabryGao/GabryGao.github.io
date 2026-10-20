import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const el={addEventListener(){},innerHTML:'',classList:{remove(){},toggle(){}},setAttribute(){},removeAttribute(){}};
const c=vm.createContext({console,URL,URLSearchParams,location:{hash:'#home'},document:{querySelector:()=>el,querySelectorAll:()=>[],addEventListener(){},title:''},window:{addEventListener(){},scrollTo(){}},setTimeout(){},clearTimeout(){},AbortController});
for(const f of ['research-data.js','directions.js','app.js','portal-v4.js','portal-v5.js','opentai-papers.js','paper-library.js','portal-editorial.js','news-feed.js','portal-framework.js','portal-madeo.js']){
 vm.runInContext(fs.readFileSync(path.join(root,f),'utf8').replace(/\nrender\(\);\s*$/,'\n'),c,{filename:f});
}
const run=js=>vm.runInContext(js,c);
const home=run('home()');
const sections=['platform-intro','platform-value','platform-vision','platform-progress','platform-blog'];
let pos=-1;for(const id of sections){const p=home.indexOf(`id="${id}"`);assert.ok(p>pos,'Homepage order: '+id);pos=p;}
for(const route of ['directions','news','benchmarks','teams','contact']){c.location.hash='#'+route;run('render()');assert.ok(el.innerHTML&&!el.innerHTML.includes('未找到这个页面'),route);}
assert.equal(run('paperRecords.length'),490);
const automatic=run('allNews().filter(n=>n.automated)');assert.ok(automatic.length>0);
assert.equal(new Set(run('allNews().map(n=>n.url)')).size,run('allNews().length'));
c.location.hash='#news?direction=physical-ai&q=unfindable-xz';assert.ok(run("newsPanel('physical-ai')").includes('当前筛选下暂无已录入动态'));
c.location.hash='#news?origin=auto';assert.ok(!run("newsPanel('')").includes('历史资料'));
const unsafe={id:'x',title:'<img src=x onerror=x>',label:'test',date:'2026-10-20',url:'https://example.com',source:'<script>',description:'<script>',direction_ids:[],automated:true};c.unsafe=unsafe;assert.ok(!run('newsRows([unsafe])').includes('<script>'));
c.location.hash='#contact?intent=join';const contact=run('contactPage()');assert.ok(contact.includes('name="intent"'));assert.ok(contact.includes('接收渠道待配置'));assert.ok(!contact.includes('mailto:'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const nav of ['directions','news','benchmarks','teams','contact'])assert.ok(html.includes(`data-nav="${nav}"`));
const locale=fs.readFileSync(path.join(root,'locale.js'),'utf8');assert.ok(!/location\.(?:hash|href)\s*=|location\.(?:assign|replace|reload)\(/.test(locale));
const bundled=run('JSON.parse(JSON.stringify({info:liveNewsInfo,records:liveAutomatedNews}))');
c.location.hash='#contact?intent=join';
const countBefore=run('allNews().length');
c.fetch=async()=>({ok:true,json:async()=>({info:{...bundled.info,generated_on:'2026-10-21T01:00:00Z'},records:[{...bundled.records[0],url:'javascript:alert(1)'}]})});
await run('refreshPublicNews()');assert.equal(run('allNews().length'),countBefore);assert.equal(run('liveNewsInfo.generated_on'),bundled.info.generated_on);
c.fetch=async()=>({ok:true,json:async()=>({info:{...bundled.info,generated_on:'2026-10-21T01:00:00Z'},records:bundled.records})});
const contentBefore=el.innerHTML;await run('refreshPublicNews()');assert.equal(el.innerHTML,contentBefore,'Background news updates must not rerender a contact draft');assert.equal(run('liveNewsInfo.generated_on'),'2026-10-21T01:00:00Z');
c.fetch=async()=>{throw Error('offline')};await run('refreshPublicNews()');assert.equal(run('allNews().length'),countBefore,'Offline updates retain usable records');
console.log('Framework checks passed: homepage sequence, five routes, shared papers, merged news, empty filters, escaped metadata, honest contact state, stable locale contract.');
