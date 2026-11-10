// Run with Node 22.13+; uses real in-memory SQLite and makes no network requests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHmac} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {canonicalIP, createWorker} from './worker.mjs';

const ORIGIN = 'https://gabrygao.github.io';
const SECRET = 'test-only-secret-with-at-least-32-characters';
const SCHEMA = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

// D1's prepare/bind/batch surface backed by actual SQLite, including batch rollback.
class LocalD1 {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:');
    this.sqlite.exec('PRAGMA foreign_keys = ON;');
    this.sqlite.exec(SCHEMA);
    this.bindings = [];
  }
  prepare(sql) {
    const query = {sql, params: [], bind(...params) { this.params = params; return this; }};
    query.run = async () => (await this.batch([query]))[0];
    return query;
  }
  async batch(queries) {
    this.sqlite.exec('BEGIN');
    try {
      const result = queries.map(({sql, params}) => {
        this.bindings.push(...params);
        const rows = this.sqlite.prepare(sql).all(...params);
        return {success: true, results: rows.map(row => ({...row}))};
      });
      this.sqlite.exec('COMMIT');
      return result;
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
  }
}

function request(path = '/stats', options = {}) {
  const headers = new Headers({Origin: ORIGIN, 'CF-Connecting-IP': options.ip || '8.8.8.8',
    'User-Agent': 'Mozilla/5.0 Safari/605.1.15', ...options.headers});
  const init = {method: options.method || 'GET', headers};
  if (options.body !== undefined) {
    headers.set('Content-Type', options.contentType || 'application/json');
    init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }
  const req = new Request((options.base || 'https://stats.example') + path, init);
  if (options.cf !== null) Object.defineProperty(req, 'cf', {
    value: {colo: 'SJC', country: options.country || 'US', ...options.cf}
  });
  return req;
}

function fixture(t) {
  const db = new LocalD1();
  t.after(() => db.sqlite.close());
  let timestamp = '2026-11-10T12:00:00.000Z';
  const app = createWorker(() => new Date(timestamp));
  const env = {DB: db, IP_HASH_SECRET: SECRET, ALLOWED_ORIGINS: ORIGIN};
  return {
    db, app, env,
    at(value) { timestamp = value; },
    fetch(path, options = {}, override = {}) { return app.fetch(request(path, options), {...env, ...override}); },
    async visit(options = {}) {
      return app.fetch(request('/visit', {method: 'POST', body: {path: '/ai-safety-index/index.html'}, ...options}), env);
    },
    async stats(query = '') {
      const result = await app.fetch(request('/stats' + query), env);
      assert.equal(result.status, 200);
      return result.json();
    }
  };
}

test('empty database has explicit zeros and no invented start date', async t => {
  const f = fixture(t);
  assert.deepEqual(await f.stats(), {since: null, updated_at: '2026-11-10T12:00:00.000Z',
    period: {from: '2026-10-12', to: '2026-11-10'}, today_unique_ips: 0,
    period_unique_ips: 0, total_unique_ips: 0, countries: []});
});

test('repeat visits and different pages share one IP identity; no cookie is set', async t => {
  const f = fixture(t);
  for (const path of ['/ai-safety-index/', '/ai-safety-index/index.html', '/ai-safety-index/about.html']) {
    const response = await f.visit({body: {path}});
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('Set-Cookie'), null);
    assert.equal(response.headers.get('Access-Control-Allow-Credentials'), null);
  }
  const result = await f.stats();
  assert.equal(result.today_unique_ips, 1);
  assert.equal(result.period_unique_ips, 1);
  assert.equal(result.total_unique_ips, 1);
  assert.equal(result.since, '2026-11-10');
});

test('same IP on multiple days is distinct once per period and once for lifetime', async t => {
  const f = fixture(t);
  f.at('2026-11-09T23:59:59.000Z');
  assert.equal((await f.visit()).status, 204);
  f.at('2026-11-10T00:00:01.000Z');
  assert.equal((await f.visit()).status, 204);
  const result = await f.stats();
  assert.equal(result.today_unique_ips, 1);
  assert.equal(result.period_unique_ips, 1);
  assert.equal(result.total_unique_ips, 1);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM daily_visitors').get().n, 2);
});

test('countries partition the period by last observed country of each IP', async t => {
  const f = fixture(t);
  f.at('2026-11-09T10:00:00.000Z');
  await f.visit({country: 'US'});
  await f.visit({ip: '1.1.1.1', country: 'US'});
  f.at('2026-11-10T10:00:00.000Z');
  await f.visit({country: 'SG'});
  await f.visit({ip: '9.9.9.9', country: '<script>alert(1)</script>'});
  f.at('2026-11-10T09:00:00.000Z');
  await f.visit({country: 'DE'}); // A delayed request cannot replace a later observation.
  f.at('2026-11-10T12:00:00.000Z');
  const result = await f.stats();
  assert.deepEqual(result.countries, [{code: 'SG', unique_ips: 1}, {code: 'US', unique_ips: 1}, {code: 'XX', unique_ips: 1}]);
  assert.equal(result.today_unique_ips, 2);
  assert.equal(result.period_unique_ips, 3);
  assert.equal(result.total_unique_ips, 3);
  assert.equal(result.countries.reduce((sum, row) => sum + row.unique_ips, 0), result.period_unique_ips);
});

test('UTC window boundaries and retention preserve lifetime totals', async t => {
  const f = fixture(t);
  f.at('2026-08-01T12:00:00.000Z');
  await f.visit({ip: '1.1.1.1'});
  f.at('2026-10-11T23:59:59.000Z');
  await f.visit({ip: '8.8.4.4'});
  f.at('2026-10-12T00:00:00.000Z');
  await f.visit({ip: '9.9.9.9'});
  f.at('2026-11-10T12:00:00.000Z');
  await f.app.scheduled({}, f.env);
  const result = await f.stats();
  assert.equal(result.since, '2026-08-01');
  assert.equal(result.today_unique_ips, 0);
  assert.equal(result.period_unique_ips, 1);
  assert.equal(result.total_unique_ips, 3);
  assert.equal((await f.stats('?days=90')).period_unique_ips, 2);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM daily_visitors').get().n, 2);
});

test('canonical IPv6 variants and IPv4-mapped IPv6 deduplicate', async t => {
  const f = fixture(t);
  for (const ip of ['2606:4700:4700::1111', '2606:4700:4700:0:0:0:0:1111', '2606:4700:4700:0000::1111']) {
    assert.equal((await f.visit({ip})).status, 204);
  }
  for (const ip of ['8.8.8.8', '::ffff:8.8.8.8', '::FFFF:0808:0808']) {
    assert.equal((await f.visit({ip})).status, 204);
  }
  assert.equal((await f.stats()).total_unique_ips, 2);
});

test('invalid, private and cross-zone substitute addresses are rejected', async t => {
  const f = fixture(t);
  for (const ip of ['1.2.3.999', '1.2.3', '01.2.3.4', '8.8.8.8, 1.1.1.1', '8.8.8.8:80',
    '127.0.0.1', '10.0.0.1', '100.64.1.2', '192.168.0.1', '172.31.0.1', '169.254.1.1',
    '224.0.0.1', '::', '::1', 'fc00::1', 'fe80::1', 'ff02::1', '::ffff:127.0.0.1',
    '2a06:98c0:3600::103', '2606:4700::1%eth0', '<script>']) {
    assert.equal(canonicalIP(ip), null, ip);
    assert.equal((await f.visit({ip})).status, 403, ip);
  }
  assert.equal((await f.stats()).total_unique_ips, 0);
});

test('Cloudflare runtime metadata is required and forwarding headers do not choose identity', async t => {
  const f = fixture(t);
  assert.equal((await f.visit({cf: null})).status, 403);
  assert.equal((await f.visit({cf: {colo: ''}})).status, 403);
  assert.equal((await f.visit({headers: {'CF-Worker': 'attacker.example'}})).status, 403);
  for (const spoofed of ['1.1.1.1', '9.9.9.9']) {
    assert.equal((await f.visit({headers: {'X-Forwarded-For': spoofed, 'X-Real-IP': spoofed, 'CF-IPCountry': 'DE'}})).status, 204);
  }
  assert.equal((await f.stats()).total_unique_ips, 1);
  assert.deepEqual((await f.stats()).countries, [{code: 'US', unique_ips: 1}]);
});

test('only exact configured HTTPS origins are accepted', async t => {
  const f = fixture(t);
  for (const origin of ['', 'null', 'http://gabrygao.github.io', ORIGIN + '/ai-safety-index/',
    'https://gabrygao.github.io.evil.example', 'https://localhost']) {
    const result = await f.visit({headers: {Origin: origin}});
    assert.equal(result.status, 403, origin);
    assert.equal(result.headers.get('Access-Control-Allow-Origin'), null);
  }
  assert.equal((await f.fetch('/stats', {base: 'http://stats.example'})).status, 403);
  assert.equal((await f.fetch('/stats', {headers: {Origin: 'https://localhost'}}, {ALLOWED_ORIGINS: 'https://localhost'})).status, 403);
  const valid = await f.fetch('/stats');
  assert.equal(valid.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  assert.equal(valid.headers.get('Cache-Control'), 'no-store');
});

test('CORS preflight admits only the supported method and Content-Type', async t => {
  const f = fixture(t);
  const headers = {'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'};
  const accepted = await f.fetch('/visit', {method: 'OPTIONS', headers});
  assert.equal(accepted.status, 204);
  assert.equal(accepted.headers.get('Access-Control-Allow-Methods'), 'POST');
  assert.equal((await f.fetch('/visit', {method: 'OPTIONS', headers: {...headers, 'Access-Control-Request-Headers': 'x-spoofed-ip'}})).status, 403);
  assert.equal((await f.fetch('/stats', {method: 'OPTIONS', headers})).status, 403);
});

test('missing or weak configuration fails closed without storing visits', async t => {
  const f = fixture(t);
  for (const secret of [undefined, '', 'too-short', ' '.repeat(64)]) {
    assert.equal((await f.fetch('/visit', {method: 'POST', body: {path: '/ai-safety-index/'}}, {IP_HASH_SECRET: secret})).status, 503);
  }
  assert.equal((await f.fetch('/stats', {}, {DB: undefined})).status, 503);
  assert.equal((await f.stats()).total_unique_ips, 0);
});

test('all known pages are accepted; invalid paths, oversized bodies and XSS are rejected', async t => {
  const f = fixture(t);
  for (const page of ['index', 'records', 'directions', 'results', 'papers', 'research-map', 'about',
    'benchmarks', 'methods', 'upload', 'search', 'detail', 'signal', 'paper']) {
    assert.equal((await f.visit({body: {path: '/ai-safety-index/' + page + '.html'}})).status, 204, page);
  }
  for (const path of ['<script>alert(1)</script>', '/ai-safety-index/index.html?secret=x',
    '/ai-safety-index/../index.html', '/unknown.html', '/ai-safety-index/index.html#x']) {
    const result = await f.visit({body: {path}});
    assert.equal(result.status, 400);
    assert.ok(!(await result.text()).includes(path));
  }
  for (const body of ['not-json', 'null', '[]', JSON.stringify({path: '/ai-safety-index/', padding: 'a'.repeat(600)})]) {
    assert.equal((await f.visit({body})).status, 400);
  }
  assert.equal((await f.visit({contentType: 'text/plain'})).status, 400);
  assert.equal((await f.fetch('/visit?path=anything', {method: 'POST', body: {path: '/ai-safety-index/'}})).status, 400);
  assert.equal((await f.stats()).total_unique_ips, 1);
});

test('common bots, missing user agent and verified bots are skipped', async t => {
  const f = fixture(t);
  for (const ua of ['', 'Googlebot/2.1', 'curl/8.0', 'Mozilla HeadlessChrome/130', 'python-requests/2']) {
    assert.equal((await f.visit({headers: {'User-Agent': ua}})).status, 204);
  }
  assert.equal((await f.visit({cf: {botManagement: {verifiedBot: true}}})).status, 204);
  assert.equal((await f.stats()).total_unique_ips, 0);
});

test('SQL receives only HMAC digests, dates and validated country codes, never raw IPs or secrets', async t => {
  const f = fixture(t);
  await f.visit();
  await f.visit({ip: '2606:4700:4700::1111', country: 'T1'});
  const visitors = f.db.sqlite.prepare('SELECT * FROM visitors').all();
  const daily = f.db.sqlite.prepare('SELECT * FROM daily_visitors').all();
  const stored = JSON.stringify({visitors, daily, bindings: f.db.bindings});
  for (const forbidden of ['8.8.8.8', '2606:4700:4700::1111', SECRET, 'Mozilla', 'index.html']) {
    assert.ok(!stored.includes(forbidden), forbidden);
  }
  assert.ok(visitors.every(row => /^[a-f0-9]{64}$/.test(row.ip_hash)));
  assert.ok(visitors.some(row => row.ip_hash === createHmac('sha256', SECRET).update('8.8.8.8').digest('hex')));
  assert.deepEqual(daily.map(row => row.country).sort(), ['US', 'XX']);
});

test('unsupported windows, paths and methods have explicit errors', async t => {
  const f = fixture(t);
  for (const days of ['0', '91', '-1', '1.5', 'abc', '']) {
    assert.equal((await f.fetch('/stats?days=' + days)).status, 400);
  }
  assert.equal((await f.fetch('/stats?days=1')).status, 200);
  assert.equal((await f.fetch('/unknown')).status, 404);
  assert.equal((await f.fetch('/visit')).status, 405);
  assert.equal((await f.fetch('/stats', {method: 'POST'})).status, 405);
});

test('failed batch rolls back both tables and error response leaks no SQL or request data', async t => {
  const f = fixture(t);
  f.db.sqlite.exec("CREATE TRIGGER reject_daily BEFORE INSERT ON daily_visitors BEGIN SELECT RAISE(ABORT, 'private database error'); END;");
  const result = await f.visit();
  assert.equal(result.status, 503);
  assert.deepEqual(await result.json(), {error: 'stats_unavailable'});
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM visitors').get().n, 0);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM daily_visitors').get().n, 0);
});
