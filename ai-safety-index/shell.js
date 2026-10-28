/* Shared helpers for the site pages. Load after signals-feed.js (and paper-picks.js where papers are shown). */
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
  const tx = (map, s) => {
    if (!en || s == null) return s;
    const hit = (I[map] || {})[s];
    return hit ?? (map === 'NAME' ? String(s).replace(/（/g, ' (').replace(/）/g, ')') : s);
  };
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

  /* safety signals collected by tools/update-signals.py from primary feeds, kept for 90 days */
  const all = (typeof siteSignals !== 'undefined' ? siteSignals : []).slice();
  const info = typeof siteSignalsInfo !== 'undefined' ? siteSignalsInfo : {};
  const generated = info.generated_on ? new Date(info.generated_on) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dates = all.map(r => r.date).sort();
  const firstDay = dates.length ? day(dates[0]) : today;
  const lastCollected = generated ? new Date(generated.getFullYear(), generated.getMonth(), generated.getDate()) : (dates.length ? day(dates.at(-1)) : today);
  /* strips always show the last two weeks; the organisation table counts the last 30 days */
  const span = 14;
  const since30 = iso(new Date(today.getTime() - 29 * DAY));
  const news = {
    all, info, generated, today, firstDay, lastCollected, span, since30,
    signals: all,
    recent: all.filter(r => r.date >= since30),
    days: Array.from({ length: span }, (_, i) => new Date(today.getTime() - (span - 1 - i) * DAY)),
    ref: generated || today
  };
  /* paper picks chosen by tools/update-papers.py from arXiv with this site's keyword rules */
  const picks = (typeof sitePaperPicks !== 'undefined' ? sitePaperPicks : []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  function picksHTML(list) {
    return list.map(p => {
      const href = 'https://arxiv.org/abs/' + p.arxiv_id;
      return '<li><time datetime="' + esc(p.date) + '">' + md(p.date) + '</time>'
        + '<a class="pt" href="' + esc(href) + '" rel="noopener" lang="en">' + esc(p.title) + '</a>'
        + '<span class="pm">arXiv ' + esc(p.arxiv_id) + ((p.direction_ids || []).length ? ' · ' + p.direction_ids.map(dirName).join(T('、', ', ')) : '') + '</span>'
        + '<span class="pl"><a href="' + esc(href) + '" rel="noopener">arXiv ↗</a></span></li>';
    }).join('');
  }
  const isIncident = r => r.kind === 'incident';
  const CATEGORY = { incident: ['安全事件', 'Safety incident'], attack: ['攻击与漏洞', 'Attacks & vulnerabilities'], policy: ['政策与治理', 'Policy & governance'], eval: ['评测与红队', 'Evaluation & red teaming'], defense: ['防御与护栏', 'Defenses & guardrails'], alignment: ['对齐', 'Alignment'], research: ['研究与动态', 'Research & updates'] };
  const ORG_NAMES = { openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google DeepMind', meta: 'Meta', xai: 'xAI', microsoft: 'Microsoft', deepseek: 'DeepSeek', mistral: 'Mistral', nvidia: 'NVIDIA', 'uk-aisi': ['英国 AI 安全研究所', 'UK AI Security Institute'], metr: 'METR', nist: 'NIST' };
  const orgName = id => { const n = ORG_NAMES[id] || id; return Array.isArray(n) ? (en ? n[1] : n[0]) : n; };
  const categoryZh = r => (CATEGORY[r.category] || CATEGORY.research)[0];
  const category = r => { const c = CATEGORY[r.category] || CATEGORY.research; return en ? c[1] : c[0]; };
  const title = r => r.title;
  /* long catalog prose has no English yet: keep the Chinese and say so */
  const zhOnly = text => en && CJK.test(text) ? '<span lang="zh-CN">' + esc(text) + '</span> <span class="zh-only">Chinese only</span>' : esc(text);
  const link = r => r.url;

  /* chrome */
  const EVAL_PAGES = [['results.html', '评测看板', 'Results'], ['benchmarks.html', '基准目录', 'Benchmarks'], ['methods.html', '方法与说明', 'Methods'], ['upload.html', '上传资源', 'Submit']];
  const PAGES = [['index.html', '看板', 'Board'], ['records.html', '全部记录', 'Records'], ['directions.html', '研究方向', 'Directions'], ['results.html', '基准与评测', 'Evaluation'], ['papers.html', '论文', 'Papers'], ['about.html', '关于', 'About']];
  function header(current) {
    const el = document.getElementById('bar');
    const inEval = EVAL_PAGES.some(p => p[0] === current);
    const hm = generated ? String(generated.getHours()).padStart(2, '0') + ':' + String(generated.getMinutes()).padStart(2, '0') : '';
    const stamp = generated ? T('数据更新于 ', 'Data updated ') + iso(generated) + ' ' + hm : T('数据更新时间未知', 'Update time unknown');
    const other = new URL(location.href); other.searchParams.set('lang', en ? 'zh' : 'en');
    el.innerHTML = '<div class="wrap"><a class="brand" href="index.html"><i aria-hidden="true"></i>AI Safety Index</a>'
      + '<nav class="nav" aria-label="' + T('主导航', 'Main') + '">' + PAGES.map(([href, zh, english]) => '<a href="' + href + '"' + (href === current || (inEval && href === 'results.html') ? ' aria-current="page"' : '') + '>' + T(zh, english) + '</a>').join('')
      + '</nav><form class="hsearch" action="search.html" role="search"><input type="search" name="q" value="' + esc(current === 'search.html' ? (params().get('q') || '') : '') + '" placeholder="' + T('搜索全站', 'Search the site') + '" aria-label="' + T('搜索全站', 'Search the site') + '"></form><span class="stamp">' + stamp + '</span>'
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
      const k = iso(d), list = perDay[k] || [], gap = d > lastCollected || d < firstDay;
      const cls = gap ? 'gap' : list.length ? '' : 'none';
      const label = gap ? k + T('：尚未采集', ': not collected yet') : k + T('：' + list.length + ' 起安全事件', ': ' + list.length + ' safety incident' + (list.length === 1 ? '' : 's'));
      const inner = '<span class="n">' + (gap ? '–' : list.length) + '</span><span class="col" style="--i:' + i + ';height:' + (gap ? 100 : Math.max(3, list.length / maxN * 100)) + '%"></span><span class="d">' + (i === 0 || d.getDate() === 1 ? '<b>' + (d.getMonth() + 1) + '/</b>' : '') + d.getDate() + '</span>';
      return '<li class="' + cls + '" title="' + label + '">' + (opts.link && !gap ? '<a href="#day-' + k + '" aria-label="' + label + '">' + inner + '</a>' : '<span aria-label="' + label + '">' + inner + '</span>') + '</li>';
    }).join('');
  }

  /* expandable signal item: titles and summaries stay in the publisher's language */
  function itemHTML(r, open) {
    const did = 'd-' + r.id, summary = r.description || '';
    const note = !en && summary && !CJK.test(summary) ? '<span class="lang">英文原文摘要</span>' : '';
    return '<li><button type="button" class="item" data-id="' + esc(r.id) + '" aria-expanded="' + !!open + '" aria-controls="' + esc(did) + '">'
      + '<time class="heat" datetime="' + esc(r.date) + '">' + md(r.date) + '</time>'
      + '<span class="t" lang="' + (CJK.test(title(r)) ? 'zh-CN' : 'en') + '">' + esc(title(r)) + (en && CJK.test(title(r)) ? ' <span class="zh-only">Chinese only</span>' : '') + '</span>' + chevron
      + '<span class="m"><span class="tag' + (isIncident(r) ? ' inc' : '') + '">' + esc(category(r)) + '</span>' + esc(r.source) + '</span></button>'
      + '<div class="detail" id="' + esc(did) + '"' + (open ? '' : ' hidden') + '>'
      + (summary ? '<p lang="' + (CJK.test(summary) ? 'zh-CN' : 'en') + '">' + esc(summary) + note + (en && CJK.test(summary) ? ' <span class="zh-only">Chinese only</span>' : '') + '</p>' : '')
      + '<div class="terms">' + (r.direction_ids || []).map(id => '<span class="tag">' + esc(dirName(id)) + '</span>').join('') + (r.orgs || []).map(o => '<span class="tag">' + esc(orgName(o)) + '</span>').join('') + '</div>'
      + '<div class="go"><a href="' + esc(link(r)) + '" rel="noopener">' + T('阅读原文', 'Read the source') + ' ↗</a></div></div></li>';
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

  window.Shell = { DAY, esc, day, iso, md, chevron, arrow, DIRS, dirName, news, isIncident, category, categoryZh, CATEGORY, orgName, title, link, lang, en, T, tx, zhOnly, CJK,
    header, params, setParams, picks, picksHTML, dirParam, dirSeg, seg, plates, stripHTML, itemHTML, bindItems, sortHead };
})();
