(() => {
  'use strict';
  const DAY = 864e5;
  const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  function validStats(data) {
    if (!data || !(isDate(data.since) || data.since === null && data.total_unique_ips === 0) || !data.period || !isDate(data.period.from) || !isDate(data.period.to)
      || data.period.from > data.period.to || data.since !== null && data.since > data.period.to
      || Date.parse(data.period.to) - Date.parse(data.period.from) > 30 * DAY
      || typeof data.updated_at !== 'string' || !Number.isFinite(Date.parse(data.updated_at))) return false;
    if (![data.today_unique_ips, data.period_unique_ips, data.total_unique_ips].every(n => Number.isSafeInteger(n) && n >= 0)
      || data.today_unique_ips > data.period_unique_ips || data.period_unique_ips > data.total_unique_ips
      || !Array.isArray(data.countries) || data.countries.length > 300) return false;
    const seen = new Set();
    let sum = 0;
    for (const country of data.countries) {
      if (!country || !/^[A-Z]{2}$/.test(country.code) || seen.has(country.code)
        || !Number.isSafeInteger(country.unique_ips) || country.unique_ips < 1) return false;
      seen.add(country.code); sum += country.unique_ips;
    }
    return sum === data.period_unique_ips;
  }
  function endpointURL(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return null;
      return url.href.replace(/\/$/, '');
    } catch { return null; }
  }
  window.VisitorStats = { validStats, endpointURL };
  if (!window.Shell) return;
  const { T, en } = Shell;
  const endpoint = endpointURL(window.AISafetyVisitorStats?.endpoint);
  const isLocal = location.protocol !== 'https:' || /^(localhost|127\.|\[::1\])/.test(location.hostname);
  const optedOut = navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  const format = n => n.toLocaleString(en ? 'en-US' : 'zh-CN');
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  const root = el('section', 'visitor-stats wrap');
  root.setAttribute('aria-label', T('全球访问统计', 'Global visitor statistics'));
  const panel = el('details', 'visitor-panel');
  const summary = el('summary', 'visitor-summary');
  summary.append(el('span', 'visitor-label', T('全球访问', 'Global visits')));
  const headline = el('span', 'visitor-headline', T('统计尚未启用', 'Statistics are not enabled'));
  summary.append(headline);
  panel.append(summary);
  const body = el('div', 'visitor-body');
  const status = el('p', 'visitor-status', isLocal ? T('本地预览不计入访问。', 'Local previews are not counted.')
    : T('访问统计尚未启用。', 'Visitor statistics are not enabled.'));
  body.append(status); panel.append(body); root.append(panel);
  const footer = document.querySelector('footer');
  if (footer) footer.before(root); else document.body.append(root);
  if (!endpoint || isLocal) return;

  let busy = false, registered = false;
  const api = async (route, options = {}) => {
    const response = await fetch(endpoint + route, {
      ...options, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(6500)
    });
    if (!response.ok) throw new Error('Visitor statistics unavailable');
    return response;
  };
  function render(data) {
    if (!validStats(data)) throw new Error('Invalid visitor statistics');
    headline.textContent = T('近 30 天 ', 'Last 30 days ') + format(data.period_unique_ips) + T(' 个独立 IP', ' unique IPs');
    const metrics = el('dl', 'visitor-metrics');
    for (const [label, value] of [[T('今日 · UTC', 'Today · UTC'), data.today_unique_ips],
      [T('近 30 天', 'Last 30 days'), data.period_unique_ips], [T('累计独立 IP', 'All-time unique IPs'), data.total_unique_ips]]) {
      const cell = el('div'); cell.append(el('dt', '', label), el('dd', '', format(value))); metrics.append(cell);
    }
    const heading = el('h3', '', T('近 30 天的地区分布', 'Regions over the last 30 days'));
    const list = el('ol', 'visitor-countries');
    let names;
    try { names = new Intl.DisplayNames([en ? 'en' : 'zh-CN'], { type: 'region' }); } catch {}
    const largest = Math.max(1, ...data.countries.map(c => c.unique_ips));
    for (const country of [...data.countries].sort((a, b) => b.unique_ips - a.unique_ips || a.code.localeCompare(b.code))) {
      const row = el('li');
      const label = country.code === 'XX' ? T('未知地区', 'Unknown region') : names?.of(country.code) || country.code;
      const bar = el('i', 'visitor-country-bar'); bar.setAttribute('aria-hidden', 'true');
      bar.style.setProperty('--share', (country.unique_ips / largest * 100).toFixed(2) + '%');
      row.append(el('span', '', label), bar, el('b', '', format(country.unique_ips))); list.append(row);
    }
    const note = el('p', 'visitor-note', data.since === null ? T('尚无访问记录。', 'No visits have been recorded yet.') : T(
      `从 ${data.since} 开始统计。每个时段内，同一 IP 只计一次，地区按该时段最近一次访问确定。IP 数不等于人数，校园共用网络、动态地址和 VPN 都会影响结果。`,
      `Counting since ${data.since}. Each IP is counted once per period and assigned to the region of its latest visit in that period. IP counts are not people counts; shared networks, changing addresses, and VPNs affect the results.`));
    const privacy = el('p', 'visitor-note', T('仅统计到达接口的访问，过滤部分已知机器人。不存储原始 IP，不使用访问统计 Cookie。',
      'Counts cover visits that reach the collection endpoint, excluding some known bots. No raw IP addresses or analytics cookies are stored.'));
    const updated = el('p', 'visitor-note', T('数据时间 ', 'Updated ') + new Date(data.updated_at).toLocaleString(en ? 'en-US' : 'zh-CN')
      + (optedOut ? T(' · 已按浏览器隐私设置停止发送访问记录', ' · Collection disabled by your browser privacy preference') : ''));
    body.replaceChildren(metrics, heading, list, note, privacy, updated);
  }
  async function refresh() {
    if (busy || document.hidden) return;
    busy = true;
    try {
      if (!registered && !optedOut) {
        await api('/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: location.pathname }) });
        registered = true;
      }
      render(await (await api('/stats')).json());
    } catch {
      headline.textContent = T('统计暂不可用', 'Statistics unavailable');
      body.replaceChildren(el('p', 'visitor-status', T('暂时无法读取访问统计，请稍后再试。', 'Visitor statistics could not be loaded. Please try again later.')));
    } finally { busy = false; }
  }
  headline.textContent = T('读取统计…', 'Loading statistics…');
  refresh();
  setInterval(refresh, 120000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
