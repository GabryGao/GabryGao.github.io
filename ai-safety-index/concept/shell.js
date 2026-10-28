/* Shared helpers for the dashboard concept pages. Load after ../news-feed.js. */
(() => {
  const DAY = 864e5;
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
  const dirName = id => (DIRS.find(d => d[0] === id) || [, id])[1];

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
  const category = r => String(r.label || '').replace(/^AI Safety HOT · /, '');
  const title = r => r.title_zh || r.title;
  const link = r => r.original_url || r.url;

  /* chrome */
  const PAGES = [['index.html', '看板'], ['records.html', '全部记录'], ['benchmarks.html', '基准目录'], ['papers.html', '论文']];
  function header(current) {
    const el = document.getElementById('bar');
    const stamp = generated
      ? '数据更新于 ' + iso(generated) + ' ' + String(generated.getHours()).padStart(2, '0') + ':' + String(generated.getMinutes()).padStart(2, '0')
      : '数据更新时间未知';
    el.innerHTML = '<div class="wrap"><a class="brand" href="index.html"><i aria-hidden="true"></i>AI Safety Index</a>'
      + '<nav class="nav" aria-label="主导航">' + PAGES.map(([href, name]) => '<a href="' + href + '"' + (href === current ? ' aria-current="page"' : '') + '>' + name + '</a>').join('')
      + '<a href="../">现站</a></nav><span class="stamp">' + stamp + '</span></div>';
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
      el.innerHTML = [['all', '全部方向'], ...DIRS].map(([id, name]) => {
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
      const label = gap ? k + '：尚未采集' : k + '：' + list.length + ' 起安全事件';
      const inner = '<span class="n">' + (gap ? '–' : list.length) + '</span><span class="col" style="--i:' + i + ';height:' + (gap ? 100 : Math.max(3, list.length / maxN * 100)) + '%"></span><span class="d">' + md(k) + '</span>';
      return '<li class="' + cls + '" title="' + label + '">' + (opts.link && !gap ? '<a href="#day-' + k + '" aria-label="' + label + '">' + inner + '</a>' : '<span aria-label="' + label + '">' + inner + '</span>') + '</li>';
    }).join('');
  }

  /* expandable signal item */
  function itemHTML(r, open) {
    const did = 'd-' + r.id;
    const summary = r.description_zh || r.description || '';
    const lang = !r.description_zh && r.language === 'en' ? '<span class="lang">英文原文摘要</span>' : '';
    const terms = (r.terms || []).filter(t => !t.startsWith('entity:') && t !== 'AI Safety HOT').slice(0, 6);
    return '<li><button type="button" class="item" data-id="' + esc(r.id) + '" aria-expanded="' + !!open + '" aria-controls="' + esc(did) + '">'
      + '<span class="heat" aria-label="热度 ' + heat(r) + '">' + heat(r) + '</span>'
      + '<span class="t">' + esc(title(r)) + '</span>' + chevron
      + '<span class="m"><span class="tag' + (isIncident(r) ? ' inc' : '') + '">' + esc(category(r)) + '</span>' + esc(r.source) + ' · ' + md(r.date) + '</span></button>'
      + '<div class="detail" id="' + esc(did) + '"' + (open ? '' : ' hidden') + '>'
      + (summary ? '<p>' + esc(summary) + lang + '</p>' : '')
      + '<div class="terms">' + (r.direction_ids || []).map(id => '<span class="tag">' + esc(dirName(id)) + '</span>').join('') + terms.map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>'
      + '<div class="go"><a href="' + esc(link(r)) + '" rel="noopener">阅读原文 ↗</a>'
      + (r.url && r.url !== link(r) ? '<a href="' + esc(r.url) + '" rel="noopener">AI Safety HOT 条目 ↗</a>' : '') + '</div></div></li>';
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

  window.Shell = { DAY, esc, day, iso, md, chevron, arrow, DIRS, dirName, news, isIncident, heat, category, title, link,
    header, params, setParams, dirParam, dirSeg, seg, plates, stripHTML, itemHTML, bindItems, sortHead };
})();
