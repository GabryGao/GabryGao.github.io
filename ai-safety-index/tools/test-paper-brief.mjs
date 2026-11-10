import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const ctx = vm.createContext({ window: {} });
vm.runInContext(read('paper-brief.js'), ctx);
const B = ctx.window.PaperBrief;
const original = String.raw`We report 95.2% accuracy on 1,379 samples, compared with 91.7% [12].
The bound is $p \leq 0.05$ and \textbf{Table 2} reports v1.2.3. This may not generalize.`;
const translation = String.raw`作者报告，在 1,379 个样本上准确率为 95.2%，对照结果为 91.7% [12]。
界限为 $p \leq 0.05$，\textbf{Table 2} 报告 v1.2.3。这一结果可能无法推广。`;
const sample = {
  arxiv_id: '2611.00001', title: 'A supplied paper title', abstract: original,
  authors: ['Example Author'], date: '2026-11-10', venue: 'arXiv',
  direction_ids: ['agent-software'], score: 99
};
const generatedKeys = ['quickRead', 'researchQuestion', 'method', 'findings', 'experiment', 'significance', 'limitations', 'nextSteps', 'selectionReason', 'questions'];

// Topic labels and scores must never create methods, contributions, or conclusions.
for (const english of [false, true]) {
  for (const direction of ['data-privacy', 'foundation-model', 'agent-software', 'physical-ai', 'human-societal', 'ai-x-science', 'unknown']) {
    const paper = { ...sample, direction_ids: [direction] };
    const before = JSON.stringify(paper);
    const result = B.build(paper, { english });
    assert.equal(result.reviewed, false);
    assert.equal(result.hasAbstract, true);
    assert.equal(result.abstract, original, 'Decimals, citations, formulas, versions and whitespace must remain intact');
    assert.equal(result.originalAbstract, original);
    assert.equal(result.translated, false);
    for (const key of generatedKeys) assert.equal(key in result, false, `Generated unsupported ${key}`);
    assert.equal(JSON.stringify(paper), before, 'Source record must not be changed');
    assert.equal('reviewStatus' in result, false, 'Do not generate an editorial workflow notice');
    assert.doesNotMatch(JSON.stringify(result), /physical consequences|adaptive attacks|现实安全|系统风险|direct relevance|直接相关/);
  }
}
const localized = B.build(sample, { abstract: () => translation });
assert.equal(localized.abstract, translation);
assert.equal(localized.originalAbstract, original);
assert.equal(localized.translated, true);
assert.equal(B.build(sample, { abstract: () => '  ' }).abstract, original, 'Empty localization falls back to the intact source');
assert.equal(B.build({ ...sample, reviewed: true }).reviewed, false, 'A feed flag must not approve its own analysis');

for (const english of [false, true]) {
  for (const abstract of [undefined, null, '', '  \n  ']) {
    const result = B.build({ ...sample, abstract }, { english, abstract: () => 'Unsupported stored text' });
    assert.equal(result.hasAbstract, false);
    assert.equal(result.abstract, '');
    assert.equal(result.translated, false);
    assert.equal(result.noAbstract, english ? 'Abstract unavailable.' : '摘要暂缺。');
  }
}

// Run the real detail-page script to check escaping, links, anchors and duplication.
const pageScript = [...read('paper.html').matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
function render(paper, english, localizedAbstract = '') {
  const main = { innerHTML: '' };
  const Shell = {
    en: english, esc, T: (zh, en) => english ? en : zh,
    title: record => record.title, dirName: value => value, category: value => value.category,
    isIncident: () => false, header: () => {}, params: () => new URLSearchParams({ id: paper.arxiv_id }),
    picks: [paper], news: { signals: [] }, CJK: /[㐀-鿿]/,
    paperTitle: record => record.title,
    paperAbstract: record => !english && localizedAbstract ? localizedAbstract : record.abstract || ''
  };
  const document = { getElementById: id => id === 'main' ? main : {}, title: '' };
  const News = { related: () => [], ago: () => 'recent' };
  vm.runInNewContext(pageScript, { Shell, News, PaperBrief: B, document, paperRecords: [], URLSearchParams });
  const html = main.innerHTML;
  const ids = [...html.matchAll(/<section class="sig-chapter" id="([^"]+)"/g)].map(match => match[1]);
  const toc = [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(ids, ['analysis', 'related']);
  assert.deepEqual(toc, ids, 'Contents must match visible sections and preserve #analysis');
  assert.equal(document.title, `${paper.title} · AI Safety Index`);
  assert.ok(html.includes(`href="https://arxiv.org/abs/${paper.arxiv_id}"`));
  assert.ok(html.includes(`href="https://arxiv.org/pdf/${paper.arxiv_id}"`));
  assert.doesNotMatch(html, /paper-questions|paper-selection|paper-findings|id="(?:question|method|findings|significance|limitations)"/);
  assert.doesNotMatch(html, /未审读|尚未提供|语言审校|has not yet published an analysis|reviewed for clarity/);
  assert.match(html, /id="quick"/, 'Previous quick-read anchor remains available');
  return html;
}
for (const english of [false, true]) {
  const html = render(sample, english);
  assert.equal(html.split(esc(original)).length - 1, 1, 'Full abstract must appear exactly once, not be sliced into repeated facts');
  const empty = render({ ...sample, abstract: '' }, english);
  assert.match(empty, english ? /Abstract unavailable\./ : /摘要暂缺。/);
  assert.doesNotMatch(empty, /<blockquote|paper-abstract-card/);
  const hostile = render({ ...sample, abstract: '<script>bad()</script> 95.2%' }, english);
  assert.ok(hostile.includes('&lt;script&gt;bad()&lt;/script&gt; 95.2%'));
  assert.doesNotMatch(hostile, /<script>bad/);
}
const translatedPage = render(sample, false, translation);
assert.equal(translatedPage.split(esc(original)).length - 1, 1);
assert.equal(translatedPage.split(esc(translation)).length - 1, 1);
assert.match(translatedPage, /摘要译文|查看原文摘要/);

console.log('Paper brief checks passed: intact source abstracts, decimals/citations/formulas, bilingual empty states, no unsupported analysis, escaping, links, and section anchors.');
