/* Shared helpers for the dashboard concept pages. Load after ../news-feed.js. */
(() => {
  const DAY = 864e5;
  const I = typeof ConceptI18n !== 'undefined' ? ConceptI18n : {};

  /* language: ?lang wins, then this page set's own memory; the live site's setting is left alone */
  const LANG_KEY = 'asi-concept-lang';
  const lang = (() => {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'zh') { try { localStorage.setItem(LANG_KEY, q); } catch {} return q; }
    try { if (localStorage.getItem(LANG_KEY) === 'en') return 'en'; } catch {}
    return 'zh';
  })();
  const en = lang === 'en';
  const T = (zh, english) => en ? english : zh;
  const tx = (map, s) => en && s != null ? ((I[map] || {})[s] ?? s) : s;
  const CJK = /[\u3400-\u9fff]/;
  document.documentElement.lang = en ? 'en' : 'zh-CN';
  if (en) {
    for (const el of document.querySelectorAll('[data-en]')) el.textContent = el.dataset.en;
    for (const attr of ['placeholder', 'aria-label', 'title'])
      for (const el of document.querySelectorAll('[data-en-' + attr + ']')) el.setAttribute(attr, el.getAttribute('data-en-' + attr));
  }
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const day = s => new Date(s + 'T00:00:00');
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const md = s => { const [, m, d] = s.split('-'); return (+m) + '/' + (+d); };
  const chevron = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  const arrow = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

  const DIRS = [
    ['data-privacy', '数据与隐私'], ['foundation-model', '基础模型'], ['agent-software', '智能体与软件系统'],
    ['physical-ai', '物理 AI'], ['human-societal', '人机交互与社会'], ['ai-x-science', 'AI+X 与科学']
  ];
  const dirName = id => en ? ((I.DIR || {})[id] || id) : (DIRS.find(d => d[0] === id) || [, id])[1];

  /* news records */
  const all = (typeof automatedNewsRecords !== 'undefined' ? automatedNewsRecords : []).slice();
  const info = typeof automatedNewsInfo !== 'undefined' ? automatedNewsInfo : {};
  const generated = info.generated_on ? new Date(info.generated_on) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dates = all.map(r => r.date).sort();
  const firstDay = dates.length ? day(dates[0]) : today;
  const lastCollected = generated ? new Date(generated.getFullYear(), generated.getMonth(), generated.getDate()) : (dates.length ? day(dates.at(-1)) : today);
  const span = Math.max(1, Math.round((today - firstDay) / DAY) + 1);
  const news = {
    all, info, generated, today, firstDay, lastCollected, span,
    signals: all.filter(r => !r.paper_pick),
    papers: all.filter(r => r.paper_pick).sort((a, b) => b.date.localeCompare(a.date)),
    days: Array.from({ length: span }, (_, i) => new Date(firstDay.getTime() + i * DAY)),
    ref: generated || today
  };
  const isIncident = r => (r.terms || []).includes('安全事件');
  const heat = r => r.aihot_score || 0;
  const categoryZh = r => String(r.label || '').replace(/^AI Safety HOT · /, '');
  const category = r => tx('CATEGORY', categoryZh(r));
  const title = r => en ? (r.title || r.title_zh) : (r.title_zh || r.title);
  /* long catalog prose has no English yet: keep the Chinese and say so */
  const zhOnly = text => en && CJK.test(text) ? '<span lang="zh-CN">' + esc(text) + '</span> <span class="zh-only">Chinese only</span>' : esc(text);
  const link = r => r.original_url || r.url;

  /* chrome */
  const EVAL_PAGES = [['results.html', '评测看板', 'Results'], ['benchmarks.html', '基准目录', 'Benchmarks'], ['methods.html', '方法与说明', 'Methods'], ['upload.html', '上传资源', 'Submit']];
  const PAGES = [['index.html', '看板', 'Board'], ['records.html', '全部记录', 'Records'], ['results.html', '基准与评测', 'Evaluation'], ['papers.html', '论文', 'Papers']];
  function header(current) {
    const el = document.getElementById('bar');
    const inEval = EVAL_PAGES.some(p => p[0] === current);
    const hm = generated ? String(generated.getHours()).padStart(2, '0') + ':' + String(generated.getMinutes()).padStart(2, '0') : '';
    const stamp = generated ? T('数据更新于 ', 'Data updated ') + iso(generated) + ' ' + hm : T('数据更新时间未知', 'Update time unknown');
    const other = new URL(location.href); other.searchParams.set('lang', en ? 'zh' : 'en');
    el.innerHTML = '<div class="wrap"><a class="brand" href="index.html"><i aria-hidden="true"></i>AI Safety Index</a>'
      + '<nav class="nav" aria-label="' + T('主导航', 'Main') + '">' + PAGES.map(([href, zh, english]) => '<a href="' + href + '"' + (href === current || (inEval && href === 'results.html') ? ' aria-current="page"' : '') + '>' + T(zh, english) + '</a>').join('')
      + '<a href="../">' + T('现站', 'Live site') + '</a></nav><span class="stamp">' + stamp + '</span>'
      + '<a class="langlink" href="' + esc(other.pathname + other.search + other.hash) + '" hreflang="' + (en ? 'zh' : 'en') + '" lang="' + (en ? 'zh-CN' : 'en') + '">' + (en ? '中文' : 'EN') + '</a></div>';
    const sub = document.getElementById('subnav');
    if (sub && inEval) sub.innerHTML = '<nav class="subnav" aria-label="' + T('基准与评测', 'Evaluation') + '">' + EVAL_PAGES.map(([href, zh, english]) => '<a href="' + href + '"' + (href === current ? ' aria-current="page"' : '') + '>' + T(zh, english) + '</a>').join('') + '</nav>';
  }

  /* URL state */
  const params = () => new URLSearchParams(location.search);
  function setParams(obj) {
    const u = new URL(location.href);
    for (const [k, v] of Object.entries(obj)) { if (v == null || v === '' || v === 'all' || v === false) u.searchParams.delete(k); else u.searchParams.set(k, v); }
    history.replaceState(null, '', u);
  }
  const dirParam = () => { const d = params().get('dir'); return DIRS.some(x => x[0] === d) ? d : 'all'; };

  /* direction segmented control: count(id) gives the number shown on each button */
  function dirSeg(el, get, count, onChange) {
    const render = () => {
      el.innerHTML = [['all', T('全部方向', 'All directions')], ...DIRS.map(([id]) => [id, dirName(id)])].map(([id, name]) => {
        const n = count(id);
        return '<button type="button" data-dir="' + id + '" aria-pressed="' + (get() === id) + '"' + (n ? '' : ' disabled') + '>' + name + '<b>' + n + '</b></button>';
      }).join('');
    };
    el.addEventListener('click', e => {
      const b = e.target.closest('button[data-dir]'); if (!b || b.disabled) return;
      onChange(b.dataset.dir); setParams({ dir: b.dataset.dir }); render();
    });
    render();
    return render;
  }

  /* generic pressed-state group for buttons carrying data-v */
  function seg(el, onChange) {
    el.addEventListener('click', e => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      for (const x of el.querySelectorAll('button[data-v]')) x.setAttribute('aria-pressed', x === b);
      onChange(b.dataset.v);
    });
  }

  /* enamel number plates */
  const plates = (n, label) => '<div class="plates" role="img" aria-label="' + esc(label ?? n) + '">'
    + String(n).padStart(2, '0').split('').map(d => '<span class="plate" aria-hidden="true">' + d + '</span>').join('') + '</div>';

  /* daily incident strip; perDay maps yyyy-mm-dd to incident records */
  function stripHTML(perDay, opts = {}) {
    const maxN = Math.max(1, ...Object.values(perDay).map(a => a.length));
    return news.days.map((d, i) => {
      const k = iso(d), list = perDay[k] || [], gap = d > lastCollected;
      const cls = gap ? 'gap' : list.length ? (list.some(r => heat(r) >= 90) ? 'hot' : '') : 'none';
      const label = gap ? k + T('：尚未采集', ': not collected yet') : k + T('：' + list.length + ' 起安全事件', ': ' + list.length + ' safety incident' + (list.length === 1 ? '' : 's'));
      const inner = '<span class="n">' + (gap ? '–' : list.length) + '</span><span class="col" style="--i:' + i + ';height:' + (gap ? 100 : Math.max(3, list.length / maxN * 100)) + '%"></span><span class="d">' + md(k) + '</span>';
      return '<li class="' + cls + '" title="' + label + '">' + (opts.link && !gap ? '<a href="#day-' + k + '" aria-label="' + label + '">' + inner + '</a>' : '<span aria-label="' + label + '">' + inner + '</span>') + '</li>';
    }).join('');
  }

  /* expandable signal item */
  function itemHTML(r, open) {
    const did = 'd-' + r.id;
    const summary = en ? (r.description || r.description_zh || '') : (r.description_zh || r.description || '');
    const note = en ? (CJK.test(summary) ? '<span class="lang">Chinese only</span>' : '') : (!r.description_zh && r.language === 'en' ? '<span class="lang">英文原文摘要</span>' : '');
    const terms = (r.terms || []).filter(t => !t.startsWith('entity:') && t !== 'AI Safety HOT').slice(0, 6).map(t => tx('TERM', t));
    return '<li><button type="button" class="item" data-id="' + esc(r.id) + '" aria-expanded="' + !!open + '" aria-controls="' + esc(did) + '">'
      + '<span class="heat" aria-label="' + T('热度 ', 'Heat ') + heat(r) + '">' + heat(r) + '</span>'
      + '<span class="t"' + (en && CJK.test(title(r)) ? ' lang="zh-CN"' : '') + '>' + esc(title(r)) + (en && CJK.test(title(r)) ? ' <span class="zh-only">Chinese only</span>' : '') + '</span>' + chevron
      + '<span class="m"><span class="tag' + (isIncident(r) ? ' inc' : '') + '">' + esc(category(r)) + '</span>' + esc(r.source) + ' · ' + md(r.date) + '</span></button>'
      + '<div class="detail" id="' + esc(did) + '"' + (open ? '' : ' hidden') + '>'
      + (summary ? '<p' + (CJK.test(summary) ? ' lang="zh-CN"' : '') + '>' + esc(summary) + note + '</p>' : '')
      + '<div class="terms">' + (r.direction_ids || []).map(id => '<span class="tag">' + esc(dirName(id)) + '</span>').join('') + terms.map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>'
      + '<div class="go"><a href="' + esc(link(r)) + '" rel="noopener">' + T('阅读原文', 'Read the source') + ' ↗</a>'
      + (r.url && r.url !== link(r) ? '<a href="' + esc(r.url) + '" rel="noopener">' + T('AI Safety HOT 条目', 'AI Safety HOT entry') + ' ↗</a>' : '') + '</div></div></li>';
  }
  /* one open item per container; state.open keeps it across re-renders */
  function bindItems(container, state) {
    container.addEventListener('click', e => {
      const b = e.target.closest('button.item'); if (!b) return;
      const opening = state.open !== b.dataset.id;
      for (const x of container.querySelectorAll('button.item')) {
        const on = opening && x === b;
        x.setAttribute('aria-expanded', on);
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      }
      state.open = opening ? b.dataset.id : null;
    });
  }

  /* sortable header row: cols are {k,label,num}; a col without k is not sortable */
  function sortHead(tr, cols, state, onSort) {
    const render = () => {
      tr.innerHTML = cols.map(c => {
        const sorted = c.k && c.k === state.sortKey;
        return '<th' + (c.num ? ' class="num"' : '') + (sorted ? ' aria-sort="' + (state.order < 0 ? 'descending' : 'ascending') + '"' : '') + ' scope="col">'
          + (c.k ? '<button type="button" data-k="' + c.k + '">' + c.label + arrow + '</button>' : '<span class="th">' + c.label + '</span>') + '</th>';
      }).join('');
    };
    tr.addEventListener('click', e => {
      const b = e.target.closest('button[data-k]'); if (!b) return;
      const k = b.dataset.k, col = cols.find(c => c.k === k);
      if (k === state.sortKey) state.order = -state.order; else { state.sortKey = k; state.order = col.num ? -1 : 1; }
      render(); onSort();
    });
    render();
    return render;
  }

  window.Shell = { DAY, esc, day, iso, md, chevron, arrow, DIRS, dirName, news, isIncident, heat, category, categoryZh, title, link, lang, en, T, tx, zhOnly, CJK,
    header, params, setParams, dirParam, dirSeg, seg, plates, stripHTML, itemHTML, bindItems, sortHead };
})();
