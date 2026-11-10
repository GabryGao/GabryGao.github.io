(() => {
  'use strict';
  const EVENT = 'ai-safety:signals-update';
  const DEFAULT_INTERVAL = 30_000;
  let lastGenerated = typeof siteSignalsInfo !== 'undefined' ? Date.parse(siteSignalsInfo.generated_on) || 0 : 0;
  let polling = false;

  function validDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const time = Date.parse(value + 'T00:00:00Z');
    // Date.parse normalizes dates such as February 31; reject that normalization.
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
  }

  function validRecord(record) {
    if (!record || typeof record !== 'object' || Array.isArray(record)
      || typeof record.id !== 'string' || !record.id
      || typeof record.title !== 'string' || !validDay(record.date)) return false;
    // Omitted optional fields remain valid. Supplied fields must match their consumers.
    return ['description', 'source', 'source_id', 'url', 'kind', 'category']
      .every(key => record[key] === undefined || typeof record[key] === 'string')
      && ['orgs', 'direction_ids'].every(key => record[key] === undefined
        || (Array.isArray(record[key]) && record[key].every(id => typeof id === 'string')));
  }

  function valid(snapshot) {
    return snapshot && typeof snapshot === 'object'
      && snapshot.info && typeof snapshot.info === 'object'
      && typeof snapshot.info.generated_on === 'string'
      && Number.isFinite(Date.parse(snapshot.info.generated_on))
      && (snapshot.info.sources === undefined || (Array.isArray(snapshot.info.sources)
        && snapshot.info.sources.every(source => source && typeof source === 'object' && !Array.isArray(source))))
      && Array.isArray(snapshot.records)
      && snapshot.records.every(validRecord)
      && new Set(snapshot.records.map(record => record.id)).size === snapshot.records.length;
  }

  function push(snapshot, source = 'agent') {
    if (!valid(snapshot)) return false;
    const generated = Date.parse(snapshot.info.generated_on);
    if (generated <= lastGenerated) return false;
    lastGenerated = generated;
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { ...snapshot, source } }));
    return true;
  }

  async function read(endpoint) {
    if (polling || document.hidden || location.protocol === 'file:') return false;
    polling = true;
    try {
      const url = new URL(endpoint, location.href);
      url.searchParams.set('_', Date.now().toString(36));
      const response = await fetch(url, { cache: 'no-store', headers: { accept: 'application/json' } });
      if (!response.ok) return false;
      return push(await response.json(), 'poll');
    } catch {
      return false;
    } finally {
      polling = false;
    }
  }

  function start(options = {}) {
    const endpoint = options.endpoint
      || document.querySelector('meta[name="ai-safety-signals-endpoint"]')?.content
      || 'research-source/signals-provenance.json';
    const streamEndpoint = options.streamEndpoint
      || document.querySelector('meta[name="ai-safety-stream-endpoint"]')?.content
      || '';
    const interval = Math.max(30_000, Number(options.interval) || DEFAULT_INTERVAL);
    let timer = 0;
    let stream = null;
    const check = () => read(endpoint);
    const onVisibility = () => { if (!document.hidden) check(); };
    if (streamEndpoint && 'EventSource' in window) {
      stream = new EventSource(new URL(streamEndpoint, location.href));
      stream.addEventListener('message', event => {
        try { push(JSON.parse(event.data), 'stream'); } catch {}
      });
    }
    const firstCheck = window.setTimeout(check, 1500);
    timer = window.setInterval(check, interval);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearTimeout(firstCheck);
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      if (stream) stream.close();
    };
  }

  // Future server adapter: call push({info:{generated_on: ISO timestamp}, records:[...]})
  // with a complete snapshot. Duplicate/older snapshots are ignored. start({streamEndpoint})
  // accepts an SSE endpoint; the default empty endpoint keeps this static deployment server-free.
  window.HomeLive = { EVENT, start, push, read };
})();
