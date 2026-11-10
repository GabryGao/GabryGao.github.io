// Optional Cloudflare Worker. No account setup or deployment happens from this file.
const DAY = 86_400_000;
const RETENTION_DAYS = 90;
const ROOT = '/ai-safety-index/';
const PAGES = new Set(['index.html', 'records.html', 'directions.html', 'results.html',
  'papers.html', 'research-map.html', 'about.html', 'benchmarks.html', 'methods.html',
  'upload.html', 'search.html', 'detail.html', 'signal.html', 'paper.html']);
const COUNTRY_CODES = new Set(('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW XX').split(' '));
const BOT = /bot\b|crawler|spider|slurp|headless|curl|wget|python|node-fetch|httpclient|scrapy|playwright|puppeteer/i;

function ipv4(value) {
  if (!/^(?:0|[1-9]\d{0,2})(?:\.(?:0|[1-9]\d{0,2})){3}$/.test(value)) return null;
  const octets = value.split('.').map(Number);
  if (octets.some(n => n > 255)) return null;
  const [a, b] = octets;
  if (a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19))) return null;
  return octets.join('.');
}

// Canonicalization makes IPv6 spelling variants, and IPv4-mapped IPv6, share one key.
export function canonicalIP(value) {
  if (typeof value !== 'string' || value.length > 45 || value !== value.trim()) return null;
  if (!value.includes(':')) return ipv4(value);
  if (!/^[0-9a-fA-F:.]+$/.test(value)) return null;
  let address;
  try { address = new URL('https://[' + value + ']/').hostname.slice(1, -1); }
  catch { return null; }
  const [left, right] = address.split('::');
  const start = left ? left.split(':') : [], end = right ? right.split(':') : [];
  const words = right === undefined ? start : [...start, ...Array(8 - start.length - end.length).fill('0'), ...end];
  const numbers = words.map(word => parseInt(word, 16));
  if (numbers.length !== 8 || numbers.some(n => !Number.isInteger(n))) return null;
  if (numbers.slice(0, 5).every(n => n === 0) && numbers[5] === 0xffff) {
    return ipv4([numbers[6] >> 8, numbers[6] & 255, numbers[7] >> 8, numbers[7] & 255].join('.'));
  }
  if (numbers.slice(0, 7).every(n => n === 0) || (numbers[0] & 0xfe00) === 0xfc00
    || (numbers[0] & 0xffc0) === 0xfe80 || (numbers[0] & 0xff00) === 0xff00) return null;
  // Cloudflare substitutes this address on cross-zone Worker subrequests.
  if (address === '2a06:98c0:3600::103') return null;
  return address;
}

function originAllowed(origin, setting) {
  if (!origin || typeof setting !== 'string') return false;
  return setting.split(',').map(s => s.trim()).some(allowed => {
    try {
      const url = new URL(allowed);
      return url.protocol === 'https:' && url.origin === allowed && allowed === origin
        && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    } catch { return false; }
  });
}

function edgeIP(request) {
  // `cf` is runtime metadata, not a user-supplied HTTP header. Fail closed off Cloudflare.
  if (!request.cf || !/^[A-Z]{3}$/.test(request.cf.colo || '') || request.headers.has('CF-Worker')) return null;
  return canonicalIP(request.headers.get('CF-Connecting-IP'));
}

function countryCode(value) {
  return typeof value === 'string' && COUNTRY_CODES.has(value) ? value : 'XX';
}

async function ipDigest(ip, secret) {
  const bytes = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', bytes.encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const signed = await crypto.subtle.sign('HMAC', key, bytes.encode(ip));
  return Array.from(new Uint8Array(signed), n => n.toString(16).padStart(2, '0')).join('');
}

function response(body, status, origin, extra = {}) {
  const headers = new Headers({
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'", 'Vary': 'Origin', ...extra
  });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  if (body != null) headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(body == null ? null : JSON.stringify(body), {status, headers});
}

async function visitPath(request) {
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return null;
  if (Number(request.headers.get('Content-Length')) > 512 || !request.body) return null;
  const reader = request.body.getReader(), chunks = [];
  let size = 0;
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 512) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const all = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { all.set(chunk, offset); offset += chunk.byteLength; }
    const data = JSON.parse(new TextDecoder().decode(all));
    if (!data || Array.isArray(data) || typeof data.path !== 'string') return null;
    const page = data.path === ROOT ? 'index.html' : data.path.startsWith(ROOT) ? data.path.slice(ROOT.length) : '';
    return PAGES.has(page) ? page : null;
  } catch { return null; }
  finally { reader.releaseLock(); }
}

async function recordVisit(db, hash, country, timestamp) {
  const day = timestamp.slice(0, 10);
  // Both writes commit together; unique constraints handle simultaneous requests safely.
  await db.batch([
    db.prepare(`INSERT INTO visitors (ip_hash, first_seen, last_seen) VALUES (?, ?, ?)
      ON CONFLICT(ip_hash) DO UPDATE SET first_seen = MIN(visitors.first_seen, excluded.first_seen),
      last_seen = MAX(visitors.last_seen, excluded.last_seen)`).bind(hash, timestamp, timestamp),
    db.prepare(`INSERT INTO daily_visitors (day, ip_hash, country, last_seen) VALUES (?, ?, ?, ?)
      ON CONFLICT(day, ip_hash) DO UPDATE SET
      country = CASE WHEN excluded.last_seen >= daily_visitors.last_seen THEN excluded.country ELSE daily_visitors.country END,
      last_seen = MAX(daily_visitors.last_seen, excluded.last_seen)`).bind(day, hash, country, timestamp)
  ]);
}

async function stats(db, now, days) {
  const to = now.toISOString().slice(0, 10);
  const from = new Date(Date.parse(to + 'T00:00:00Z') - (days - 1) * DAY).toISOString().slice(0, 10);
  const result = await db.batch([
    db.prepare(`SELECT (SELECT MIN(first_seen) FROM visitors) AS since,
      (SELECT COUNT(*) FROM visitors) AS total_unique_ips,
      (SELECT COUNT(*) FROM daily_visitors WHERE day = ?) AS today_unique_ips,
      (SELECT COUNT(DISTINCT ip_hash) FROM daily_visitors WHERE day BETWEEN ? AND ?) AS period_unique_ips`).bind(to, from, to),
    db.prepare(`WITH ranked AS (
      SELECT ip_hash, country, ROW_NUMBER() OVER (PARTITION BY ip_hash ORDER BY last_seen DESC, day DESC) AS position
      FROM daily_visitors WHERE day BETWEEN ? AND ?
    ) SELECT country AS code, COUNT(*) AS unique_ips FROM ranked WHERE position = 1
      GROUP BY country ORDER BY unique_ips DESC, country ASC`).bind(from, to)
  ]);
  const counts = result[0].results[0];
  return {
    since: counts.since ? counts.since.slice(0, 10) : null,
    updated_at: now.toISOString(), period: {from, to},
    today_unique_ips: counts.today_unique_ips, period_unique_ips: counts.period_unique_ips,
    total_unique_ips: counts.total_unique_ips, countries: result[1].results
  };
}

// A clock parameter supports deterministic local tests; production always uses the system clock.
export function createWorker(now = () => new Date()) {
  return {
    async fetch(request, env) {
      const origin = request.headers.get('Origin');
      if (!originAllowed(origin, env.ALLOWED_ORIGINS)) return response({error: 'origin_not_allowed'}, 403);
      const url = new URL(request.url);
      if (url.protocol !== 'https:') return response({error: 'https_required'}, 403, origin);
      if (!env.DB || typeof env.IP_HASH_SECRET !== 'string' || env.IP_HASH_SECRET.trim().length < 32) {
        return response({error: 'service_not_configured'}, 503, origin);
      }
      const ip = edgeIP(request);
      if (!ip) return response({error: 'trusted_client_address_required'}, 403, origin);
      if (!['/stats', '/visit'].includes(url.pathname)) return response({error: 'not_found'}, 404, origin);
      if (request.method === 'OPTIONS') {
        const method = url.pathname === '/stats' ? 'GET' : 'POST';
        const requested = request.headers.get('Access-Control-Request-Method');
        const suppliedHeaders = (request.headers.get('Access-Control-Request-Headers') || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
        if (requested !== method || suppliedHeaders.some(h => h !== 'content-type')) return response({error: 'invalid_preflight'}, 403, origin);
        return response(null, 204, origin, {'Access-Control-Allow-Methods': method,
          'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600'});
      }
      try {
        if (url.pathname === '/stats' && request.method === 'GET') {
          const raw = url.searchParams.get('days') ?? '30';
          if (!/^[1-9]\d?$/.test(raw) || Number(raw) > RETENTION_DAYS) return response({error: 'days_must_be_1_to_90'}, 400, origin);
          return response(await stats(env.DB, now(), Number(raw)), 200, origin);
        }
        if (url.pathname === '/visit' && request.method === 'POST') {
          if (url.search) return response({error: 'query_not_supported'}, 400, origin);
          if (!await visitPath(request)) return response({error: 'invalid_page'}, 400, origin);
          const ua = request.headers.get('User-Agent') || '';
          if (!ua || BOT.test(ua) || request.cf.botManagement?.verifiedBot) return response(null, 204, origin);
          const hash = await ipDigest(ip, env.IP_HASH_SECRET);
          await recordVisit(env.DB, hash, countryCode(request.cf.country), now().toISOString());
          return response(null, 204, origin);
        }
        return response({error: 'method_not_allowed'}, 405, origin, {Allow: url.pathname === '/stats' ? 'GET, OPTIONS' : 'POST, OPTIONS'});
      } catch {
        // Do not return SQL, request headers, raw IPs, or secret values on errors.
        return response({error: 'stats_unavailable'}, 503, origin);
      }
    },
    async scheduled(_event, env) {
      const today = now().toISOString().slice(0, 10);
      const cutoff = new Date(Date.parse(today + 'T00:00:00Z') - (RETENTION_DAYS - 1) * DAY).toISOString().slice(0, 10);
      await env.DB.prepare('DELETE FROM daily_visitors WHERE day < ?').bind(cutoff).run();
    }
  };
}

export default createWorker();
