import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const el={addEventListener(){},innerHTML:'',classList:{remove(){},toggle(){}},setAttribute(){},removeAttribute(){}};
const c=vm.createContext({console,URL,URLSearchParams,location:{hash:'#home'},document:{querySelector:s=>s==='#main'?el:{...el},querySelectorAll:()=>[],addEventListener(){},title:''},window:{addEventListener(){},scrollTo(){}},setTimeout(){},clearTimeout(){},AbortController});
for(const f of ['research-data.js','directions.js','app.js','portal-v4.js','portal-v5.js','opentai-papers.js','paper-library.js','portal-editorial.js','news-feed.js','portal-framework.js','portal-home.js','portal-madeo.js','portal-results.js','portal-compact.js','portal-search.js','resource-submission.js']){
 vm.runInContext(fs.readFileSync(path.join(root,f),'utf8').replace(/\nrender\(\);\s*$/,'\n'),c,{filename:f});
}
const run=js=>vm.runInContext(js,c);
const runJson=js=>JSON.parse(run('JSON.stringify('+js+')'));
assert.equal(run("PortalCompact.normalize({path:'contact',params:new URLSearchParams('intent=join')}).path"),'teams');
assert.equal(run("PortalCompact.normalize({path:'contact',params:new URLSearchParams('intent=resource')}).path"),'upload');
assert.equal(run("PortalCompact.normalize({path:'contact',params:new URLSearchParams()}).path"),'results');
const home=run('home()');assert.ok(home.includes('98.1'));assert.ok(home.includes('84.9'));assert.ok(!home.includes('<img'));assert.ok(!home.includes('内容筹备中'));assert.ok(home.includes('2024 年历史结果示例'));
c.location.hash='#home?metric=attack';assert.ok(run('home()').includes('87.9'));assert.ok(run('home()').includes('metric=attack'));
c.location.hash='#results?models=mini,gpt4o';assert.equal(run('ResultExplorer.select(route().params).list.length'),2);
c.location.hash='#directions';assert.ok(!run('directionsPage()').includes('<img'));
c.location.hash='#directions?pillar=agent-software&subtopic='+encodeURIComponent('提示注入');assert.ok(run("recordListFor('papers','agent-software').some(r=>r.id==='paper-agentdojo')"));assert.ok(!run('directionsPage()').includes('md-topic-cover'));
assert.ok(run('compactUniquePapers().length<=paperRecords.length'));assert.equal(run('compactUniquePapers().filter(r=>r.url.includes("2311.17600")).length'),1);assert.ok(!run('teamsPage()').includes('<img'));assert.ok(run('teamsPage()').includes('Xinfeng Li'));
assert.ok(run('PortalSearch.search("Xinfeng").some(r=>r.category==="teams")'));assert.ok(run('PortalSearch.search("AgentDojo").length>0'));const search=runJson('PortalSearch.records().filter(r=>!["articles","teams"].includes(r.category)).map(r=>r.href)');assert.equal(new Set(search).size,search.length,'Each canonical resource occurs once');
assert.ok(run('PortalSearch.search("AgentDojo","papers").every(r=>r.categories.has("papers"))'));
const submission=run('ResourceSubmission');await assert.rejects(()=>submission.send({}),/unconfigured/);submission.config.endpoint='https://example.invalid/test-only';await assert.rejects(()=>submission.send({},async()=>({ok:false})),/failed/);await assert.rejects(()=>submission.send({},async()=>({ok:true,json:async()=>({status:'ok'})})),/invalid_response/);assert.equal((await submission.send({},async()=>({ok:true,json:async()=>({status:'pending_review',receipt_id:'test'})}))).receipt_id,'test');submission.config.endpoint=null;
assert.ok(run('uploadPage()').includes('hidden disabled'));assert.ok(run('uploadPage()').includes('提交渠道未接通'));assert.ok(run('uploadPage()').includes('name="authors"'));
console.log('Compact portal checks passed: shared home scores, compact resource routes, legacy destinations, subtopic filtering, search deduplication, model subset, honest receiver state and validated failure/success responses.');
