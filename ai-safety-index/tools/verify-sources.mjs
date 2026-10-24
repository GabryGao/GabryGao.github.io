import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context=vm.createContext({console});
vm.runInContext(fs.readFileSync(path.join(root,'source-catalog.js'),'utf8'),context,{filename:'source-catalog.js'});
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

const publicRoot=path.join(root,'research-source','catalog-2026-10-22');
for(const file of ['AI_Safety_Index_数据来源汇总.html','六大方向来源清单.csv','source-catalog.json','入口与参考网站.csv','扩展候选线索_149项.csv','结果接入清单.csv','评测结果样例.csv','result-samples.json','result-summary.json','result-file-manifest.json','summary.json','README.txt','WEB_README.txt'])assert.ok(fs.existsSync(path.join(publicRoot,file)),file);
assert.ok(!fs.existsSync(path.join(publicRoot,'evidence')));
assert.ok(!fs.existsSync(path.join(publicRoot,'result-files')));

const shell=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.doesNotMatch(shell,/href="#sources"/);
assert.doesNotMatch(shell,/portal-sources\.js/);
assert.match(shell,/source-catalog\.js/);
assert.match(shell,/portal-catalog\.js/);
assert.match(fs.readFileSync(path.join(root,'portal-compact.js'),'utf8'),/if\(path==='sources'\)path='results'/);
assert.doesNotMatch(fs.readFileSync(path.join(root,'portal-madeo.js'),'utf8'),/href="#sources"/);
assert.doesNotMatch(fs.readFileSync(path.join(root,'portal-interactions.js'),'utf8'),/href:'#sources'/);
assert.match(fs.readFileSync(path.join(root,'portal-catalog.js'),'utf8'),/benchmarkRecords/);

console.log('Source checks passed: the reviewed 171-record package remains intact for provenance and now powers benchmark/method pages, while the public source-directory route stays removed.');
