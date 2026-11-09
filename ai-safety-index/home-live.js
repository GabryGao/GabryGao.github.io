(() => {
  'use strict';
  const EVENT = 'ai-safety:signals-update';
  const DEFAULT_INTERVAL = 30_000;
  let lastGenerated = typeof siteSignalsInfo !== 'undefined' ? String(siteSignalsInfo.generated_on || '') : '';
  let polling = false;

  function valid(snapshot) {
    return snapshot && typeof snapshot === 'object'
      && snapshot.info && typeof snapshot.info === 'object'
      && Array.isArray(snapshot.records);
  }

  function push(snapshot, source = 'agent') {
    if (!valid(snapshot)) return false;
    const generated = String(snapshot.info.generated_on || '');
    if (generated && lastGenerated && generated <= lastGenerated) return false;
    if (generated) lastGenerated = generated;
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
    window.setTimeout(check, 1500);
    timer = window.setInterval(check, interval);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      if (stream) stream.close();
    };
  }

  window.HomeLive = { EVENT, start, push, read };
})();
