import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../visitor-stats.js', import.meta.url), 'utf8');
const scope = { window: {}, URL };
vm.runInNewContext(source, scope);
const { validStats, endpointURL } = scope.window.VisitorStats;
const stats = {
  since: '2026-10-01', updated_at: '2026-11-10T05:00:00Z',
  period: { from: '2026-10-12', to: '2026-11-10' },
  today_unique_ips: 2, period_unique_ips: 4, total_unique_ips: 8,
  countries: [{ code: 'CN', unique_ips: 3 }, { code: 'XX', unique_ips: 1 }]
};
assert.ok(validStats(stats));
assert.ok(validStats({ ...stats, since: null, today_unique_ips: 0, period_unique_ips: 0, total_unique_ips: 0, countries: [] }));
for (const change of [
  { since: null }, { since: '2026-02-30' }, { updated_at: 'not a date' },
  { today_unique_ips: 5 }, { total_unique_ips: 3 }, { period_unique_ips: -1 },
  { total_unique_ips: Number.MAX_SAFE_INTEGER + 1 },
  { countries: [{ code: 'CN', unique_ips: 2 }, { code: 'CN', unique_ips: 2 }] },
  { countries: [{ code: '<svg>', unique_ips: 4 }] },
  { countries: [{ code: 'CN', unique_ips: 3 }] },
  { period: { from: '2026-11-11', to: '2026-11-10' } }
]) assert.equal(validStats({ ...stats, ...change }), false, JSON.stringify(change));
assert.equal(endpointURL('https://stats.example.test/'), 'https://stats.example.test');
for (const value of ['', 'http://stats.example.test', 'https://user:secret@stats.example.test', 'https://stats.example.test/?token=secret', '//stats.example.test']) {
  assert.equal(endpointURL(value), null);
}

// Exercise the collection boundary: opening a local file, an unconfigured site,
// or a browser with DNT/GPC must not send a visit.
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.style = { setProperty() {} }; }
  append(...items) { this.children.push(...items); }
  setAttribute() {}
  replaceChildren(...items) { this.children = items; }
}
async function run({ protocol = 'https:', endpoint = 'https://stats.example.test', privacy = {} } = {}) {
  const requests = [];
  const shell = { en: true, T: (_zh, en) => en };
  const context = {
    window: { Shell: shell, AISafetyVisitorStats: { endpoint } }, Shell: shell,
    document: { hidden: false, createElement: tag => new Element(tag), body: new Element('body'), querySelector: () => null, addEventListener() {} },
    navigator: privacy, location: { protocol, hostname: 'example.test', pathname: '/ai-safety-index/index.html' },
    URL, Intl, AbortSignal, setInterval() {},
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, json: async () => stats };
    }
  };
  vm.runInNewContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return requests;
}
assert.equal((await run({ protocol: 'file:' })).length, 0);
assert.equal((await run({ protocol: 'http:' })).length, 0);
assert.equal((await run({ endpoint: '' })).length, 0);
for (const privacy of [{ doNotTrack: '1' }, { globalPrivacyControl: true }]) {
  const requests = await run({ privacy });
  assert.equal(requests.length, 1);
  assert.ok(requests[0].url.endsWith('/stats'));
}
const requests = await run();
assert.equal(requests.length, 2);
assert.equal(requests[0].options.method, 'POST');
assert.deepEqual(JSON.parse(requests[0].options.body), { path: '/ai-safety-index/index.html' });
assert.equal(requests[0].options.credentials, 'omit');
assert.equal(requests[0].options.referrerPolicy, 'no-referrer');
console.log('Visitor statistics checks passed: aggregate consistency, endpoint validation, and collection boundaries.');
