/* Shared helpers for the news-style homepage and the signal detail page.
   "Related" is worked out from the data we hold: shared organisations,
   shared research direction, and overlapping title words. */
(() => {
  'use strict';
  const S = window.Shell;
  const STOP = new Set(('about after against also among another because been being between both could does from have into just more most much must over said says should since some such than that their them then there these they this those through under were what when where which while will with without would your your your '
    + 'today report reports new news update updates week year years first last says using used make makes made among company companies '
    // names and words every AI-safety record shares say nothing about whether two records are the same story
    + 'openai anthropic google deepmind microsoft meta nvidia chatgpt claude gemini model models frontier safety secure security agent agents agentic artificial intelligence system systems research researchers user users people data tool tools risk risks').split(' '));
  const words = t => new Set(String(t || '').toLowerCase().match(/[a-z0-9][a-z0-9-]{3,}/g)?.filter(w => !STOP.has(w)) || []);
  const cache = new Map();
  const wordsOf = r => { if (!cache.has(r.id)) cache.set(r.id, words(r.title + ' ' + (r.description || '').slice(0, 160))); return cache.get(r.id); };

  // two records are about the same story when their words overlap; a shared organisation or direction only strengthens that
  function score(a, b) {
    if (a.id === b.id) return 0;
    const aw = wordsOf(a), bw = wordsOf(b);
    let shared = 0; for (const w of aw) if (bw.has(w)) shared++;
    const orgs = (a.orgs || []).some(o => (b.orgs || []).includes(o));
    const dir = (a.direction_ids || []).some(d => (b.direction_ids || []).includes(d));
    if (shared < 2) return 0;
    return shared + (orgs ? 2 : 0) + (dir ? 1 : 0);
  }

  // related records within a window around the record's date, strongest first
  function related(r, pool, days = 30, limit = 12) {
    const t = S.day(r.date);
    return pool
      .filter(x => Math.abs(S.day(x.date) - t) <= days * S.DAY)
      .map(x => ({ x, s: score(r, x) }))
      .filter(o => o.s >= 3)
      .sort((p, q) => q.s - p.s || q.x.date.localeCompare(p.x.date))
      .slice(0, limit).map(o => o.x);
  }

  // how much a record is being talked about: related records nearby, freshness, and incidents weigh a little more
  function heat(r, pool) {
    const n = related(r, pool, 14, 99).length;
    const age = Math.max(0, (S.news.ref - S.day(r.date)) / S.DAY);
    return n * 1.6 + Math.max(0, 7 - age) * 0.5 + (S.isIncident(r) ? 0.8 : 0) + ((r.description || '').length > 120 ? 0.4 : 0);
  }

  const href = r => 'signal.html?id=' + encodeURIComponent(r.id);
  const ago = date => {
    const d = Math.round((S.news.ref - S.day(date)) / S.DAY);
    return d <= 0 ? S.T('今天', 'today') : d === 1 ? S.T('昨天', 'yesterday') : S.T(d + ' 天前', d + ' days ago');
  };

  window.News = { related, heat, href, ago, score };
})();
