import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Static checks for the dashboard pages: every page loads only files that exist, every inline
// script parses, catalog text has English, and old #route links still reach a page.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const pages=['index.html','records.html','directions.html','results.html','benchmarks.html','methods.html','upload.html','papers.html','detail.html','search.html','about.html'];
const cjk=/[㐀-鿿]/;

for(const page of pages){
 const html=read(page);
 for(const [,ref] of html.matchAll(/(?:src|href)="([^"#?:]+\.(?:js|css|svg|woff2|html))"/g))assert.ok(fs.existsSync(path.join(root,ref)),`${page} points to missing ${ref}`);
 for(const [,code] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))assert.doesNotThrow(()=>new vm.Script(code),`${page} has an inline script that does not parse`);
 assert.match(html,/<header class="bar" id="bar">/,`${page} lacks the shared header`);
 assert.doesNotMatch(html,/"\.\.\//,`${page} still points outside the site folder`);
 assert.doesNotMatch(html,/news-feed\.js|topic-feed\.js/,`${page} still loads the aggregator feed`);
 // visible text and links only: the paper library's data file keeps its historical name
 assert.doesNotMatch(html.replace(/<script src="[^"]*"><\/script>/g,''),/AI Safety HOT|aisafetyhot|OpenTAI/i,`${page} mentions an aggregator source`);
}

for(const f of ['shell.js','catalog.js','i18n.js','site-data.js'])assert.doesNotMatch(read(f),/AI Safety HOT|aisafetyhot|OpenTAI/i,`${f} mentions an aggregator source`);
// the site's own feeds load and carry no aggregator fields
const feeds=vm.createContext({});
vm.runInContext(read('signals-feed.js')+';this.S=siteSignals;this.I=siteSignalsInfo',feeds);
vm.runInContext(read('paper-picks.js')+';this.P=sitePaperPicks',feeds);
assert.ok(feeds.S.length>0,'no safety signals collected');
for(const r of feeds.S){assert.ok(r.id&&r.title&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&/^https:/.test(r.url),`bad signal ${r.id}`);assert.ok(['official','incident'].includes(r.kind),`bad kind ${r.id}`)}
assert.doesNotMatch(JSON.stringify(feeds.S)+JSON.stringify(feeds.P),/aisafetyhot|aihot/i,'feeds contain aggregator data');
for(const p of feeds.P)assert.match(p.arxiv_id,/^\d{4}\.\d{4,5}$/,`bad arXiv id ${p.arxiv_id}`);
const ctx=vm.createContext({console});
for(const f of ['source-catalog.js','site-data.js','i18n.js'])vm.runInContext(read(f),ctx);
vm.runInContext('this.S=SourceCatalogData;this.D=SiteData;this.I=ConceptI18n',ctx);
const {S,D,I}=ctx;
const missing=(field,map)=>[...new Set(S.resources.map(r=>r[field]).filter(s=>s&&cjk.test(s)&&!I[map][s]))];
assert.deepEqual(missing('metric','METRIC'),[],'catalog metrics without English');
assert.deepEqual(missing('subdomain','SUBDOMAIN'),[],'catalog subdomains without English');
for(const id of Object.keys(D.cardCopy))assert.ok(I.COPY[id]?.purpose&&!cjk.test(I.COPY[id].purpose),`card copy ${id} has no English`);
for(const t of D.topics)assert.ok(I.TOPIC[t.name],`topic ${t.name} has no English`);
for(const x of [...D.datasets.flatMap(d=>[d.name,d.kind,d.description]),...D.team.flatMap(m=>[m.institution,m.role])])if(cjk.test(x))assert.ok(I.SITE[x],`site text without English: ${x}`);

// Run the redirect from index.html against old routes with a stand-in location.
const redirect=read('index.html').match(/<script>\n(\/\* Old single-page links[\s\S]*?)<\/script>/)[1];
const go=hash=>{let to=null;vm.runInNewContext(redirect,{URLSearchParams,location:{hash,replace:u=>{to=u}}});return to};
const cases={'':null,'#home':'index.html','#benchmarks':'benchmarks.html','#papers':'papers.html','#datasets':'benchmarks.html#datasets','#watch':'records.html',
 '#news?content=analysis':'records.html?kind=analysis','#directions?direction=agent-software':'directions.html?dir=agent-software','#resource/S055':'detail.html?id=S055',
 '#benchmark/agentdojo':'results.html?benchmark=agentdojo','#benchmark/xstest':'benchmarks.html?related=1&q=xstest','#results':'results.html','#methods':'methods.html',
 '#upload':'upload.html','#teams':'about.html','#day-2026-10-24':null};
for(const [hash,want] of Object.entries(cases))assert.equal(go(hash),want,`old link ${hash||'(none)'}`);

console.log(`Site checks passed: ${pages.length} pages load only existing files and parse, ${S.resources.length} catalog entries have English metrics and subfields, ${Object.keys(cases).length} old links resolve.`);
