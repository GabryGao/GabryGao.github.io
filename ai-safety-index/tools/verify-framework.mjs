import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const el={addEventListener(){},innerHTML:'',classList:{remove(){},toggle(){}},setAttribute(){},removeAttribute(){}};
const c=vm.createContext({console,URL,URLSearchParams,location:{hash:'#home'},document:{querySelector:s=>s==='#main'?el:{...el},querySelectorAll:()=>[],addEventListener(){},title:''},window:{addEventListener(){},scrollTo(){}},setTimeout(){},clearTimeout(){},AbortController});
for(const f of ['research-data.js','directions.js','app.js','portal-v4.js','portal-v5.js','opentai-papers.js','paper-library.js','portal-editorial.js','news-feed.js','portal-framework.js','portal-home.js','portal-madeo.js','evaluation-data.js','portal-results.js','portal-compact.js','portal-search.js','resource-submission.js','portal-watch.js']){
 vm.runInContext(fs.readFileSync(path.join(root,f),'utf8').replace(/\nrender\(\);\s*$/,'\n'),c,{filename:f});
}
const run=js=>vm.runInContext(js,c);
const home=run('home()');
const sections=['mh-intro','home-evaluation','watch-home-strip','六大研究方向','近期研究','从结论回到证据。'];
let pos=-1;for(const id of sections){const p=home.indexOf(id);assert.ok(p>pos,'Homepage order: '+id);pos=p;}
assert.ok(!home.includes('mh-grid'));assert.ok(!home.includes('平台更新记录'));
for(const route of ['directions','watch','sources','news','benchmarks','teams','upload']){c.location.hash='#'+route;run('render()');assert.ok(el.innerHTML&&!el.innerHTML.includes('未找到这个页面'),route);}
assert.equal(run('paperRecords.length'),490);
const automatic=run('allNews().filter(n=>n.automated)');assert.ok(automatic.length>0);
assert.equal(new Set(run('allNews().map(n=>n.url)')).size,run('allNews().length'));
assert.equal(run('PortalCompact.stories().length'),automatic.length);
assert.equal(run("PortalCompact.posts('','latest','','').length+PortalCompact.posts('','analysis','','').length+PortalCompact.posts('','share','','').length"),automatic.length);
assert.ok(run("PortalCompact.posts('','analysis','','').length")>0);
assert.equal(run("PortalCompact.posts('','share','','').length"),5);
assert.ok(run("PortalCompact.posts('','share','','').every(n=>n.source_id==='aisafetyhot'&&n.paper_pick&&n.original_url)"));
c.location.hash='#news?direction=physical-ai&q=unfindable-xz';assert.ok(run("newsPanel('physical-ai')").includes('此栏目暂无已发布内容'));
c.location.hash='#news?origin=auto';assert.ok(run("newsPanel('')").includes('来源：AI Safety HOT'));
const unsafe={id:'x',title:'<img src=x onerror=x>',label:'test',date:'2026-10-20',url:'https://example.com',source:'<script>',description:'<script>',direction_ids:[],automated:true};c.unsafe=unsafe;assert.ok(!run('newsRows([unsafe])').includes('<script>'));
c.location.hash='#upload?direction=physical-ai';const upload=run('uploadPage()');assert.ok(upload.includes('name="type"'));assert.ok(upload.includes('提交渠道未接通'));assert.ok(upload.includes('value="physical-ai" selected'));assert.ok(!upload.includes('mailto:'));assert.ok(upload.includes('#results?direction=physical-ai'));assert.ok(!run('teamsPage()').includes('#contact'));assert.ok(!run('home()').includes('#contact'));c.location.hash='#contact';run('render()');assert.ok(el.innerHTML.includes('cp-evaluation'),'Legacy contact root goes to the evaluation dashboard');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const nav of ['directions','news','benchmarks','teams'])assert.ok(html.includes(`data-nav="${nav}"`));
assert.ok(!html.includes('data-nav="contact"'));assert.ok(!html.includes('href="#contact"'));
const locale=fs.readFileSync(path.join(root,'locale.js'),'utf8');assert.ok(!/location\.(?:hash|href)\s*=|location\.(?:assign|replace|reload)\(/.test(locale));
const bundled=run('JSON.parse(JSON.stringify({info:liveNewsInfo,records:liveAutomatedNews}))');
c.location.hash='#upload';
const countBefore=run('allNews().length');
const newer=new Date(Date.parse(bundled.info.generated_on)+60000).toISOString();
c.fetch=async()=>({ok:true,json:async()=>({info:{...bundled.info,generated_on:newer},records:[{...bundled.records[0],url:'javascript:alert(1)'}]})});
await run('refreshPublicNews()');assert.equal(run('allNews().length'),countBefore);assert.equal(run('liveNewsInfo.generated_on'),bundled.info.generated_on);
c.fetch=async()=>({ok:true,json:async()=>({info:{...bundled.info,generated_on:newer},records:bundled.records})});
const contentBefore=el.innerHTML;await run('refreshPublicNews()');assert.equal(el.innerHTML,contentBefore,'Background news updates must not rerender a resource draft');assert.equal(run('liveNewsInfo.generated_on'),newer);
c.fetch=async()=>{throw Error('offline')};await run('refreshPublicNews()');assert.equal(run('allNews().length'),countBefore,'Offline updates retain usable records');
console.log('Framework checks passed: homepage sequence, observatory and source routes, shared papers, merged news, empty filters, escaped metadata, honest resource submission state, stable locale contract.');
