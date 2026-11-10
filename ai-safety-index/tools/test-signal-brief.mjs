import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const ctx = vm.createContext({ window: {}, URL });
vm.runInContext(read('signal-brief.js'), ctx);
const B = ctx.window.SignalBrief;
const generatedKeys = ['sourceFacts', 'significance', 'mechanisms', 'evidence', 'actions', 'watch', 'questions', 'sources'];
const sample = { id: 'unreviewed-example', title: 'A supplied title', description: 'Publisher supplied summary.', date: '2026-11-10', source: 'Example publisher', url: 'https://example.org/report', kind: 'discovered', category: 'research', direction_ids: ['agent-software'], orgs: ['example'] };

// Labels must never create assertions, mechanisms, recommendations, or analysis.
for (const english of [false, true]) {
  for (const category of ['incident', 'attack', 'policy', 'eval', 'defense', 'alignment', 'research', 'unknown']) {
    const record = { ...sample, category };
    const result = B.build(record, { english, desc: r => r.description });
    assert.equal(result.reviewed, false);
    assert.equal(result.sourceSummary, sample.description);
    for (const key of generatedKeys) assert.equal(result[key].length, 0, `${category} generated ${key}`);
    assert.doesNotMatch(JSON.stringify(result), /observed in a real environment|已经进入真实环境|recurring.*blind spot/);
  }
}
assert.equal(B.build({ ...sample, description: '' }).sourceSummary, '');
assert.equal(B.build({ ...sample, reviewedBrief: { status: 'reviewed' } }).reviewed, false, 'Feed text must not approve itself');

const valid = {
  version: 1, recordUrl: sample.url,
  review: { status: 'reviewed', date: '2026-11-10', sourcesChecked: true, proseChecked: true },
  lead: ['简述', 'Brief'], sourceFacts: [['来源内容', 'Source claim']], evidence: [['限制', 'Limit']],
  sources: [{ label: ['来源', 'Source'], url: sample.url }]
};
assert.equal(B.isReviewed(valid, sample), true);
for (const mutate of [
  x => { x.review.status = 'draft'; },
  x => { x.review.sourcesChecked = false; },
  x => { x.review.proseChecked = false; },
  x => { delete x.review.date; },
  x => { x.recordUrl = 'https://example.org/other'; },
  x => { x.sourceFacts = [['缺少英文']]; },
  x => { x.sources[0].url = 'javascript:alert(1)'; },
  x => { x.sources = { length: 1 }; },
  x => { x.mechanisms = [null]; },
  x => { x.evidence = []; }
]) {
  const candidate = JSON.parse(JSON.stringify(valid));
  mutate(candidate);
  assert.equal(B.isReviewed(candidate, sample), false, 'Incomplete or draft briefs must not publish analysis');
}

// Fixed cases remain testable after they age out of the rolling news snapshot.
const guardian = { ...sample, id: 'web-f3135f0075a5', source: 'The Guardian · AI', url: 'https://www.theguardian.com/technology/2026/nov/10/australia-manadatory-reporting-openai-medicare-hack' };
const claude = { ...sample, id: 'web-804a43c3361e', source: 'The Hacker News', kind: 'incident', category: 'incident', url: 'https://thehackernews.com/2026/11/claude-codes-dont-ask-again-file.html' };
for (const english of [false, true]) {
  const brief = B.build(guardian, { english });
  assert.equal(brief.reviewed, true);
  assert.equal(brief.actions.length, 0, 'Policy report must not inherit generic response advice');
  assert.equal(brief.mechanisms.length, 0, 'Policy report must not inherit an attack mechanism');
  assert.ok(brief.sources.some(s => new URL(s.url).hostname === 'www.pm.gov.au'));
  assert.match(JSON.stringify(brief), /18/);
  assert.match(JSON.stringify(brief), english ? /not duties already in force/ : /已经生效的义务/);
  assert.match(JSON.stringify(brief), /Medicare/);
  assert.match(JSON.stringify(brief), english ? /reporting deadlines/ : /通报时限/);
  const preserved = B.build(claude, { english });
  assert.equal(preserved.reviewed, true);
  for (const number of ['104,185', '103,617', '1,122', '1,379']) assert.ok(preserved.sourceFacts.some(text => text.includes(number)), `Lost protected figure ${number}`);
  assert.ok(preserved.evidence.some(text => english ? /not independently reproduced/.test(text) : /没有独立复现/.test(text)));
  assert.ok(preserved.evidence.some(text => english ? /remain valid/.test(text) : /仍然有效/.test(text)));
  assert.doesNotMatch(JSON.stringify(preserved), /—|Taken together|不是.*而是|这类问题揭示了/);
}
assert.equal(B.build({ ...guardian, url: 'https://example.org/reused-id' }).reviewed, false, 'Review must stay bound to the checked source URL');

// Render the actual page script so section visibility and anchor behavior are checked.
const pageScript = [...read('signal.html').matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
function render(record, english, contextRecords = []) {
  const main = { innerHTML: '' };
  const T = (zh, en) => english ? en : zh;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const Shell = {
    en: english, esc, T, title: r => r.title, desc: r => r.description || '', link: r => r.url,
    isIncident: r => r.kind === 'incident', dirName: x => x, orgName: x => x, category: r => r.category,
    params: () => new URLSearchParams({ id: record.id }), header: () => {},
    news: { signals: [record, ...contextRecords] }, DAY: 86400000,
    day: value => new Date(`${value}T00:00:00Z`).getTime()
  };
  const News = { related: () => [], href: r => `signal.html?id=${encodeURIComponent(r.id)}`, ago: () => 'recent' };
  const document = { getElementById: id => id === 'main' ? main : {}, title: '' };
  vm.runInNewContext(pageScript, { Shell, News, SignalBrief: B, document, URL });
  const ids = [...main.innerHTML.matchAll(/<section class="sig-chapter" id="([^"]+)"/g)].map(m => m[1]);
  const toc = [...main.innerHTML.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(toc, ids, 'Contents must include exactly the visible sections');
  assert.match(main.innerHTML, /id="analysis"/, 'Existing #analysis links must remain valid');
  assert.doesNotMatch(main.innerHTML, /id="evidence"|href="#evidence"|证据限制|Evidence limits|尚未阅读全文|Full text not yet reviewed|Sources checked and text edited|内容核对/, 'Review metadata and disclaimers must not become article sections');
  return { html: main.innerHTML, ids };
}
for (const english of [false, true]) {
  const unreviewed = render({ ...sample, description: '<script>unsafe()</script>' }, english);
  assert.deepEqual(unreviewed.ids, ['overview']);
  assert.match(unreviewed.html, /&lt;script&gt;unsafe\(\)&lt;\/script&gt;/);
  assert.doesNotMatch(unreviewed.html, /<script>unsafe/);
  const policy = render(guardian, english, [{ ...sample, id: 'context', category: guardian.category }]);
  assert.deepEqual(policy.ids, ['facts', 'analysis', 'related']);
  assert.doesNotMatch(policy.html, /关联时间线|Related timeline|优先显示同一事件|independent evidence/);
  assert.match(policy.html, english ? /Topic context/ : /同主题记录/);
  const unrelated = render(sample, english, [{ ...sample, id: 'unrelated', category: 'unrelated', direction_ids: [], orgs: [] }]);
  assert.ok(!unrelated.ids.includes('related'), 'Recency alone must not create a related record');
}
console.log('Signal brief checks passed: review contract, no fabricated analysis, protected figures, bilingual exemplar, visible sections, anchors, and topic-context labels.');
