import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ctx=vm.createContext({console});
vm.runInContext(fs.readFileSync(path.join(root,'locale.js'),'utf8'),ctx);
const api=ctx.SiteLocale;
assert.ok(api);
assert.deepEqual(Array.from(api.languages),['zh','en','ja','de']);
for(const [lang,label] of [['zh','论文资料'],['en','Papers'],['ja','論文資料'],['de','Publikationen']])assert.equal(api.translate('论文资料',lang),label);
for(const lang of ['en','ja','de']){
 for(const s of ['490 条论文记录','年份由新到旧 · 显示 21–40 条 · 第 2 / 25 页','第 2 页','已选 2 条同协议记录','当前范围：物理 AI 安全','选择 GPT-4o 进行对比']){
  const t=api.translate(s,lang);assert.ok(t!==s,`${lang}: ${s}`);assert.ok(!/[\u3400-\u9fff]/u.test(t)||lang==='ja',`${lang} left source text: ${t}`);
 }
 assert.equal(api.translate('HELM Safety v1.0',lang),'HELM Safety v1.0');
 assert.equal(api.translate('A Study of Agent Safety',lang),'A Study of Agent Safety');
 assert.equal(api.translate('   论文资料 ↗ ',lang),'   '+api.translate('论文资料',lang)+' ↗ ');
}
assert.equal(api.translate('论文资料','invalid'),'论文资料');
assert.ok(api.searchText('数据与隐私安全').includes('Datenschutz'));
assert.ok(api.searchText('提示注入攻击').includes('プロンプト'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(html.includes('id="site-language"'));
assert.ok(html.includes('locale.js'));
const runtime=fs.readFileSync(path.join(root,'locale.js'),'utf8');
assert.ok(!/location\.(?:hash|href)\s*=|location\.(?:assign|replace|reload)\(/.test(runtime),'Language switch must not navigate');
const coverage=JSON.parse(fs.readFileSync(path.join(root,'tools/locale-ui-coverage.json'),'utf8'));
for(const source of coverage)for(const lang of ['en','de'])assert.ok(!/[\u3400-\u9fff]/u.test(api.translate(source,lang)),`${lang}: untranslated UI: ${source}`);
for(const source of coverage)assert.ok(api.translate(source,'ja').trim());
console.log(`Locale checks passed: four locales, dynamic counts, fallback, original titles, multilingual search, in-place switch contract, ${coverage.length} UI strings across collected routes and dialogs.`);
