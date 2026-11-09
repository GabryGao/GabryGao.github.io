import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Static checks for the dashboard pages: every page loads only files that exist, every inline
// script parses, catalog text has English, and old #route links still reach a page.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const pages=['index.html','records.html','directions.html','results.html','benchmarks.html','methods.html','upload.html','papers.html','research-map.html','detail.html','signal.html','paper.html','search.html','about.html'];
const cjk=/[㐀-鿿]/;

for(const page of pages){
 const html=read(page);
 for(const [,ref] of html.matchAll(/(?:src|href)="([^"#?:]+\.(?:js|css|svg|woff2|html))"/g))assert.ok(fs.existsSync(path.join(root,ref)),`${page} points to missing ${ref}`);
 for(const [,code] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))assert.doesNotThrow(()=>new vm.Script(code),`${page} has an inline script that does not parse`);
 assert.match(html,/<header class="bar" id="bar">/,`${page} lacks the shared header`);
 assert.doesNotMatch(html,/"\.\.\//,`${page} still points outside the site folder`);
 assert.doesNotMatch(html,/news-feed\.js|topic-feed\.js/,`${page} still loads the aggregator feed`);
 // Only research provenance pages may name a discovery source; news and paper feeds remain independent.
 if(!['research-map.html','about.html'].includes(page))assert.doesNotMatch(html.replace(/<script src="[^"]*"><\/script>/g,''),/AI Safety HOT|aisafetyhot|OpenTAI/i,`${page} mentions an aggregator source`);
}

for(const f of ['shell.js','catalog.js','i18n.js','site-data.js','research-map.js','home-crawler.js','signal-web.js','home-live.js','news.js','signal-brief.js','paper-brief.js'])assert.doesNotMatch(read(f),/AI Safety HOT|aisafetyhot|OpenTAI/i,`${f} mentions an aggregator source`);
for(const f of ['shell.js','home-crawler.js','signal-web.js','home-live.js','news.js','signal-brief.js','paper-brief.js','research-map.js','research-map-labels.js','research-map-data/bootstrap.js','research-map-data/library.js','research-map-data/supplement.js','research-map-data/details/supplement.js'])assert.doesNotThrow(()=>new vm.Script(read(f)),`${f} does not parse`);
assert.match(read('index.html'),/<canvas id="web"/,'home page lacks the signal crawler canvas');
assert.match(read('index.html'),/src="signal-web\.js(\?v=\d+)?"/,'home page does not load the signal crawler');
assert.doesNotMatch(read('index.html'),/id="crawl-title"|id="crawl-sub"|>信号爬虫</,'home page still shows the removed signal crawler heading');
assert.match(read('index.html'),/src="home-live\.js"/,'home page does not load the live-update adapter');
assert.match(read('index.html'),/name="ai-safety-signals-endpoint" content="research-source\/signals-provenance\.json"/,'home page lacks the historical signals endpoint');
assert.doesNotMatch(read('index.html'),/\.slice\(0,\s*48\)\.reverse\(\)/,'signal crawler still caps the cumulative 14-day feed at 48 records');
assert.match(read('index.html'),/T\('累计 ' \+ RECS\.length \+ ' 条'/,'signal crawler does not label its record total as cumulative');
assert.match(read('signal-web.js'),/counts = countRecords\(records\)/,'signal crawler does not initialise cumulative direction totals');
assert.doesNotMatch(read('signal-web.js'),/counts\[f\.d\]\s*=\s*\(counts\[f\.d\]/,'signal crawler still increments totals while replaying its animation');
assert.match(read('signal.html'),/src="news\.js"/,'signal detail page does not load the news helpers');
assert.match(read('signal.html'),/src="signal-brief\.js"/,'signal detail page does not load the dossier generator');
for(const section of ['overview','facts','analysis','mechanism','evidence','response','watch','related'])assert.match(read('signal.html'),new RegExp(`['"]${section}['"]`),`signal detail page lacks ${section}`);
assert.match(read('paper.html'),/src="paper-brief\.js"/,'paper detail page does not load the paper guide generator');
for(const section of ['quick','question','method','findings','significance','limitations','analysis','related'])assert.match(read('paper.html'),new RegExp(`['"]${section}['"]`),`paper detail page lacks ${section}`);
assert.match(read('papers.html'),/const detail = detailId \? 'paper\.html\?id='/,'paper library titles do not enter the internal detail page');
assert.match(read('shell.js'),/\['research-map\.html', '研究地图', 'Research map'\]/,'research map is missing from the global navigation');
assert.match(read('papers.html'),/href="research-map\.html"/,'papers page lacks a research-map entry');
assert.match(read('search.html'),/research-map-data\/library\.js/,'global search does not load the research corpus');
assert.match(read('search.html'),/research-map-data\/supplement\.js/,'global search does not load the research supplement');
assert.match(read('about.html'),/research-map-data\/bootstrap\.js/,'about page lacks research-corpus provenance');
assert.match(read('research-map.html'),/AI Safety HOT[^<]*仅作发现入口/,'research map lacks discovery-source attribution');

const researchBase={console};researchBase.window=researchBase;
const research=vm.createContext(researchBase);
for(const f of ['research-map-data/bootstrap.js','research-map-data/library.js','research-map-data/supplement.js'])vm.runInContext(read(f),research);
const researchMeta=research.NAV_BOOTSTRAP;
const baseResearchPapers=research.NAV_LIBRARY;
const supplementPapers=research.NAV_SUPPLEMENT;
const researchPapers=[...baseResearchPapers,...supplementPapers];
assert.equal(baseResearchPapers.length,3639,'base research corpus paper count changed');
assert.equal(supplementPapers.length,56,'research supplement paper count changed');
assert.equal(researchPapers.length,3695,'combined research corpus paper count changed');
assert.equal(researchMeta.meta.totalPapers,baseResearchPapers.length,'research metadata count does not match the base library');
assert.equal(researchMeta.topics.length,24,'research topic count changed');
assert.equal(new Set(researchPapers.map(p=>p.id)).size,researchPapers.length,'research corpus contains duplicate paper ids');
assert.equal(new Set(researchPapers.map(p=>String(p.title).toLowerCase().replace(/[^a-z0-9]+/g,''))).size,researchPapers.length,'research corpus contains duplicate paper titles');
assert.equal(baseResearchPapers.filter(p=>p.classificationStatus==='verified').length,researchMeta.meta.manualClassifications,'base verified classification count does not match metadata');
assert.equal(researchPapers.filter(p=>p.classificationStatus==='verified').length,110,'combined verified classification count changed');
assert.equal(supplementPapers.filter(p=>p.collection==='hot-coding-agent').length,30,'coding-agent supplement count changed');
assert.equal(supplementPapers.filter(p=>p.collection==='se-top-2026').length,26,'software-engineering supplement count changed');
assert.ok(supplementPapers.filter(p=>p.collection==='hot-coding-agent').every(p=>p.classificationStatus==='suggested'),'discovery-only papers must remain suggested classifications');
const detailChunks=[...new Set(researchPapers.map(p=>p.detailChunk))];
for(const chunk of detailChunks){
 assert.match(chunk,/^(?:papers-\d{2}|supplement)\.js$/,`bad detail chunk name ${chunk}`);
 const file='research-map-data/details/'+chunk;
 assert.ok(fs.existsSync(path.join(root,file)),`missing research detail chunk ${chunk}`);
 vm.runInContext(read(file),research);
}
assert.equal(Object.keys(research.NAV_DETAILS||{}).length,researchPapers.length,'research detail records do not cover the library');
for(const p of researchPapers)assert.equal(research.NAV_DETAILS[p.id]?.detailChunk,p.detailChunk,`detail mismatch for ${p.id}`);
for(const p of supplementPapers){
 const detail=research.NAV_DETAILS[p.id];
 assert.ok(detail?.url&&detail?.sources?.length,`supplement paper ${p.id} lacks source links`);
}
for(const p of supplementPapers.filter(p=>p.collection==='hot-coding-agent')){
 const detail=research.NAV_DETAILS[p.id];
 assert.ok(detail.sources.some(source=>/arxiv\.org/.test(source.url))&&detail.sources.some(source=>/aisafetyhot\.com/.test(source.url)),`discovery paper ${p.id} lacks arXiv or AI Safety HOT provenance`);
}
const futurePapers=researchPapers.filter(p=>Number(p.year)>2026);
assert.equal(futurePapers.length,49,'future publication count changed');
assert.ok(futurePapers.every(p=>String(p.publicationStatus).toLowerCase()!=='published'),'future papers must not be presented as completed publications');
assert.ok(fs.existsSync(path.join(root,'research-map-data/methodology-2026-11-02.pdf')),'research methodology PDF is missing');
// public records load, use original HTTPS links, and carry no aggregator branding
const feeds=vm.createContext({});
vm.runInContext(read('signals-feed.js')+';this.S=siteSignals;this.I=siteSignalsInfo',feeds);
vm.runInContext(read('paper-picks.js')+';this.P=sitePaperPicks',feeds);
assert.ok(feeds.S.length>0,'no safety signals collected');
for(const r of feeds.S){assert.ok(r.id&&r.title&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&/^https:/.test(r.url),`bad signal ${r.id}`);assert.ok(['official','incident','discovered'].includes(r.kind),`bad kind ${r.id}`)}
assert.doesNotMatch(JSON.stringify(feeds.S)+JSON.stringify(feeds.P),/aisafetyhot|aihot/i,'feeds contain aggregator data');
for(const p of feeds.P)assert.match(p.arxiv_id,/^\d{4}\.\d{4,5}$/,`bad arXiv id ${p.arxiv_id}`);
const paperBriefContext=vm.createContext({window:{}});
vm.runInContext(read('paper-brief.js'),paperBriefContext);
for(const p of feeds.P){
 const guide=paperBriefContext.window.PaperBrief.build(p,{english:true,T:(_zh,en)=>en,abstract:x=>x.abstract||'',dirName:id=>id});
 assert.ok(guide.quickRead.length&&guide.researchQuestion.length&&guide.method.length&&guide.findings.length,`paper guide ${p.arxiv_id} is incomplete`);
 assert.equal(guide.questions.length,6,`paper guide ${p.arxiv_id} lacks six analysis questions`);
}
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
const cases={'':null,'#home':'index.html','#benchmarks':'benchmarks.html','#papers':'papers.html','#map?mode=citations&paper=P302':'research-map.html?view=citations&paper=P302','#datasets':'benchmarks.html#datasets','#watch':'records.html',
 '#news?content=analysis':'records.html?kind=analysis','#directions?direction=agent-software':'directions.html?dir=agent-software','#resource/S055':'detail.html?id=S055',
 '#benchmark/agentdojo':'results.html?benchmark=agentdojo','#benchmark/xstest':'benchmarks.html?related=1&q=xstest','#results':'results.html','#methods':'methods.html',
 '#upload':'upload.html','#teams':'about.html','#day-2026-10-24':null};
for(const [hash,want] of Object.entries(cases))assert.equal(go(hash),want,`old link ${hash||'(none)'}`);

console.log(`Site checks passed: ${pages.length} pages load only existing files and parse, ${S.resources.length} catalog entries have English metrics and subfields, ${Object.keys(cases).length} old links resolve.`);
