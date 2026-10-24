import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const el={addEventListener(){},innerHTML:'',classList:{remove(){},toggle(){}},setAttribute(){},removeAttribute(){}};
const c=vm.createContext({console,URL,URLSearchParams,location:{hash:'#home'},document:{querySelector:s=>s==='#main'?el:{...el},querySelectorAll:()=>[],addEventListener(){},title:''},window:{addEventListener(){},scrollTo(){}},setTimeout(){},clearTimeout(){},AbortController});
for(const f of ['research-data.js','directions.js','app.js','portal-v4.js','portal-v5.js','opentai-papers.js','paper-library.js','portal-editorial.js','news-feed.js','portal-framework.js','portal-home.js','portal-madeo.js','evaluation-data.js','portal-results.js','portal-compact.js','portal-search.js','resource-submission.js']){
 vm.runInContext(fs.readFileSync(path.join(root,f),'utf8').replace(/\nrender\(\);\s*$/,'\n'),c,{filename:f});
}
const run=js=>vm.runInContext(js,c);
const api=run('ResultExplorer');
assert.equal(run('results.length'),9);
const provenance=JSON.parse(fs.readFileSync(path.join(root,'research-source/helm-safety-results-provenance.json'),'utf8'));
assert.deepEqual(JSON.parse(run('JSON.stringify(results)')),provenance.records);
const all=api.select(new URLSearchParams());assert.equal(all.list.length,9);assert.equal(all.list[0].id,'claude');assert.equal(api.display(all.list[0].score),'98.1');
const anthropic=api.select(new URLSearchParams('creator=Anthropic&metric=attack&sort=asc'));assert.equal(anthropic.metric,'attack');assert.equal(anthropic.list.length,2);assert.equal(anthropic.list[0].id,'haiku');
assert.equal(api.select(new URLSearchParams('model=GPT-4o')).list.length,2);
assert.equal(api.select(new URLSearchParams('model=missing')).list.length,0);
const csv=api.csv(anthropic.list,anthropic.metric);assert.equal(csv.split('\r\n').length,3);assert.ok(csv.includes('"62.5","0.625"'));assert.ok(csv.includes('GCG-T'));assert.ok(csv.includes(api.source));assert.ok(!csv.includes('GPT-4o'));
c.location.hash='#results?benchmark=helm-safety&creator=Anthropic&metric=attack';const html=run("resultPanel('')");assert.equal((html.match(/data-result-model=/g)||[]).length,2);assert.equal((html.match(/class="compare-check"/g)||[]).length,2);assert.ok(html.includes('87.9'));assert.ok(html.includes('2024 年公开历史结果'));assert.ok(html.includes('data-result-export'));
c.location.hash='#results?benchmark=helm-safety&model=missing';assert.ok(!run("resultPanel('')").includes('result-plot'));
c.location.hash='#results?benchmark=agentdojo';const agentdojo=run("resultPanel('')");assert.ok(agentdojo.includes('evaluation-rank'));assert.ok(agentdojo.includes('双指标对照'));assert.ok(agentdojo.includes('任务表现矩阵'));assert.ok(agentdojo.includes('important_instructions'));assert.ok(agentdojo.includes('Targeted ASR'));
assert.equal(run('EvaluationData.summary.records'),451);assert.equal(run('EvaluationData.summary.benchmarks'),4);assert.equal(run("EvaluationExplorer.selection('safevla',new URLSearchParams()).list.length"),16);assert.equal(run("EvaluationExplorer.selection('finsafety',new URLSearchParams()).list.length"),6);
c.location.hash='#home';const home=run('home()');assert.ok(home.includes('home-resource-search'));assert.ok(home.includes('home-evaluation'));assert.ok(home.includes('安全率与任务成功率')||home.includes('安全与任务成功要分开看'));assert.ok(home.includes('不生成跨基准')||home.includes('不能横向合成'));assert.ok(!home.includes('研究推荐'));assert.ok(!home.includes('团队成果'));
console.log('Results checks passed: HELM source fidelity plus 451 official AgentDojo, SafeVLA, FLAMES and FinSafetyBench metrics with scoped charts, filters, tables and CSV exports.');
