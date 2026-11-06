(() => {
  const S = Shell;
  const { esc, T } = S;
  const B = window.NAV_BOOTSTRAP || { meta: {}, topics: [], graph: {} };
  const papers = [
    ...(Array.isArray(window.NAV_LIBRARY) ? window.NAV_LIBRARY : []),
    ...(Array.isArray(window.NAV_SUPPLEMENT) ? window.NAV_SUPPLEMENT : [])
  ];
  const topics = Array.isArray(B.topics) ? B.topics : [];
  const graph = B.graph || { nodes: [], edges: [] };
  const labels = window.ResearchMapLabels || {};
  const panel = document.getElementById('research-panel');
  const tabs = document.querySelector('.research-tabs');
  const byPaper = new Map(papers.map(p => [String(p.id), p]));
  const byTopic = new Map(topics.map(t => [String(t.id), t]));
  const graphNodes = new Map((graph.nodes || []).map(n => [String(n.id), n]));
  const loadedChunks = new Map();
  const allowedViews = new Set(['topics', 'citations', 'library', 'paper']);
  const p0 = S.params();
  const state = {
    view: allowedViews.has(p0.get('view')) ? p0.get('view') : (p0.get('paper') ? 'paper' : 'topics'),
    paper: p0.get('paper') || 'P302',
    q: p0.get('q') || '',
    topic: p0.get('topic') || 'all',
    publication: p0.get('publication') || 'all',
    classification: p0.get('classification') || 'all',
    collection: p0.get('collection') || 'all',
    year: p0.get('year') || 'all',
    shown: 40
  };

  S.header('research-map.html');

  const array = value => Array.isArray(value) ? value : value == null || value === '' ? [] : [value];
  const text = value => {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.map(text).filter(Boolean).join('；');
    return value.text || value.label || value.title || value.name || value.summary || '';
  };
  const safeUrl = value => {
    const url = text(value).trim();
    return !url || /^(?:javascript|data|vbscript):/i.test(url) ? '' : url;
  };
  const external = (url, label, cls = '') => {
    const href = safeUrl(url);
    return href ? '<a class="' + cls + '" href="' + esc(href) + '" rel="noopener">' + esc(label) + ' ↗</a>' : '';
  };
  const topicName = id => {
    const topic = byTopic.get(String(id));
    return S.en ? (labels[id]?.title || topic?.title || topic?.name || id) : (topic ? (topic.title || topic.name || id) : id);
  };
  const topicKind = topic => S.en ? (labels[topic.id]?.kind || 'Research topic') : (topic.kind || '研究主题');
  const topicSummary = topic => S.en ? (labels[topic.id]?.summary || topic.summary || topic.inclusion || topic.question || '') : (topic.summary || topic.inclusion || topic.question || '');
  const topicCount = topic => papers.filter(paper => array(paper.topics).includes(String(topic.id))).length;
  const classificationLabel = value => value === 'verified' ? T('人工核查', 'Verified') : T('建议归类', 'Suggested');
  const collectionLabel = value => ({
    'se-top-2026': T('软件工程顶会 2026', 'Top software-engineering venues 2026'),
    'hot-coding-agent': T('Coding Agent 安全补充', 'Coding-agent safety supplement')
  })[value] || T('基础论文集', 'Base corpus');
  const publicationKind = value => {
    const status = String(value || '').toLowerCase();
    if (/preprint|arxiv|预印本/.test(status)) return 'preprint';
    if (/accepted|forthcoming|upcoming|program entry|录用|待出版|会议日程|候选/.test(status)) return 'accepted';
    if (/published|正式发表|proceedings|journal/.test(status)) return 'published';
    return 'other';
  };
  const publicationLabel = value => ({
    published: T('正式发表', 'Published'),
    accepted: T('已录用 / 待出版', 'Accepted / forthcoming'),
    preprint: T('预印本', 'Preprint'),
    other: T('状态见详情', 'See status')
  })[publicationKind(value)];
  const authorText = paper => array(paper.authors).map(a => typeof a === 'string' ? a : a.name).filter(Boolean).join(', ');
  const paperTitle = id => byPaper.get(String(id))?.title || graphNodes.get(String(id))?.title || String(id);
  const paperHref = id => 'research-map.html?view=paper&paper=' + encodeURIComponent(id);
  const fitLabel = value => ({ direct: T('直接相关', 'Direct'), cross: T('交叉相关', 'Cross-cutting'), background: T('背景阅读', 'Background'), uncertain: T('待判断', 'Uncertain') })[value] || T('待判断', 'Uncertain');

  function syncUrl() {
    S.setParams({
      view: state.view === 'topics' ? null : state.view,
      paper: ['paper', 'citations'].includes(state.view) ? state.paper : null,
      q: state.view === 'library' ? state.q : null,
      topic: state.view === 'library' ? state.topic : null,
      publication: state.view === 'library' ? state.publication : null,
      classification: state.view === 'library' ? state.classification : null,
      collection: state.view === 'library' ? state.collection : null,
      year: state.view === 'library' ? state.year : null
    });
  }

  function renderStats() {
    const stats = [
      [T('论文记录', 'Paper records'), papers.length],
      [T('研究主题', 'Research topics'), topics.length],
      [T('人工核查', 'Verified'), papers.filter(p => p.classificationStatus === 'verified').length],
      [T('已记录引用边', 'Recorded citation edges'), (graph.edges || []).filter(e => e.type === 'cites').length]
    ];
    document.getElementById('research-stats').innerHTML = stats.map(([label, value]) => '<div><dt>' + esc(label) + '</dt><dd>' + Number(value).toLocaleString() + '</dd></div>').join('');
  }

  function updateTabs() {
    const selected = state.view === 'paper' ? 'library' : state.view;
    for (const button of tabs.querySelectorAll('[data-view]')) button.setAttribute('aria-selected', String(button.dataset.view === selected));
  }

  function setView(view, options = {}) {
    state.view = allowedViews.has(view) ? view : 'topics';
    if (options.paper) state.paper = options.paper;
    if (options.topic) state.topic = options.topic;
    state.shown = 40;
    syncUrl();
    render();
    window.scrollTo({ top: document.querySelector('.research-tabs').offsetTop - 8, behavior: 'smooth' });
  }

  function renderTopics() {
    const cards = topics.slice().sort((a, b) => Number(a.order || 999) - Number(b.order || 999) || topicName(a.id).localeCompare(topicName(b.id), 'zh-CN')).map(topic => {
      const fit = topic.labFit || topic.lab_relevance || {};
      return '<article class="topic-card"><div class="topic-kicker"><span>' + esc(topicKind(topic)) + '</span><span>' + esc(fitLabel(fit.level)) + '</span></div>'
        + '<h3>' + esc(topicName(topic.id)) + '</h3><p>' + esc(topicSummary(topic)) + '</p>'
        + '<div class="topic-actions"><span>' + topicCount(topic).toLocaleString() + ' ' + T('篇关联论文', 'related papers') + '</span><button type="button" data-open-topic="' + esc(topic.id) + '">' + T('查看论文', 'View papers') + ' →</button></div></article>';
    }).join('');
    panel.innerHTML = '<div class="research-toolbar"><div><h2>' + T('从研究问题进入', 'Start with a research question') + '</h2><p>' + T('同一篇论文可以进入多个主题；主题关系用于导航，不自动代表引用或因果关系。', 'A paper may appear under multiple topics. Topic links support navigation and do not imply citation or causality.') + '</p></div><a href="research-map-data/methodology-2026-11-02.pdf">' + T('查看分类与证据说明', 'Classification and evidence notes') + ' ↗</a></div>'
      + '<div class="research-meta-note">' + esc(T('其中 ' + papers.filter(p => p.classificationStatus === 'verified').length + ' 条为人工核查归类，其余保留“建议归类”或“未归类”状态。收录不代表认可论文结论。', papers.filter(p => p.classificationStatus === 'verified').length + ' records have verified classifications; the rest retain suggested or unclassified status. Listing does not endorse a paper’s claims.')) + '</div>'
      + '<div class="topic-grid">' + cards + '</div>';
    panel.querySelectorAll('[data-open-topic]').forEach(button => button.addEventListener('click', () => setView('library', { topic: button.dataset.openTopic })));
  }

  function libraryMatches(paper) {
    if (state.topic !== 'all' && !array(paper.topics).includes(state.topic)) return false;
    if (state.classification !== 'all' && paper.classificationStatus !== state.classification) return false;
    if (state.publication !== 'all' && publicationKind(paper.publicationStatus) !== state.publication) return false;
    if (state.collection !== 'all' && paper.collection !== state.collection) return false;
    if (state.year !== 'all' && String(paper.year) !== state.year) return false;
    const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length) {
      const haystack = [paper.id, paper.title, paper.venue, authorText(paper), ...array(paper.topics).map(topicName), ...array(paper.keywords)].join(' ').toLowerCase();
      if (!words.every(word => haystack.includes(word))) return false;
    }
    return true;
  }

  function paperRow(paper) {
    const authors = array(paper.authors).map(a => typeof a === 'string' ? a : a.name).filter(Boolean);
    const authorLine = authors.slice(0, 4).join(', ') + (authors.length > 4 ? T(' 等', ' et al.') : '');
    const topicBadges = array(paper.topics).slice(0, 3).map(id => '<span class="badge">' + esc(topicName(id)) + '</span>').join('');
    const classification = paper.classificationStatus === 'verified' ? 'verified' : 'suggested';
    return '<li class="research-paper"><span class="paper-id">' + esc(paper.id) + '</span><a class="paper-title" href="' + paperHref(paper.id) + '">' + esc(paper.title) + '</a>'
      + '<span class="paper-authors">' + esc(authorLine || T('作者信息待补充', 'Authors pending')) + '</span>'
      + '<div class="paper-topics"><span class="badge ' + classification + '">' + esc(classificationLabel(paper.classificationStatus)) + '</span>' + topicBadges + '</div>'
      + '<div class="paper-venue"><b>' + esc(paper.venue || T('发表处待核实', 'Venue pending')) + '</b><span>' + esc(paper.year || '') + '</span><br><span class="badge publication">' + esc(publicationLabel(paper.publicationStatus)) + '</span></div></li>';
  }

  function updateLibraryResults() {
    const list = papers.filter(libraryMatches).sort((a, b) => Number(b.year || 0) - Number(a.year || 0) || String(a.title).localeCompare(String(b.title), 'en'));
    const shown = list.slice(0, state.shown);
    document.getElementById('research-library-count').innerHTML = '<span>' + list.length.toLocaleString() + ' ' + T('篇论文', 'papers') + '</span><span>' + T('正式发表、已录用与技术版本分别标注', 'Published, accepted and technical versions are labelled separately') + '</span>';
    document.getElementById('research-library-results').innerHTML = shown.length ? '<ol class="research-papers">' + shown.map(paperRow).join('') + '</ol>' : '<div class="research-empty">' + T('没有符合这些条件的论文。', 'No papers match these filters.') + '</div>';
    document.getElementById('research-more').innerHTML = list.length > state.shown ? '<button type="button" class="btn">' + T('再显示 ' + Math.min(40, list.length - state.shown) + ' 篇', 'Show ' + Math.min(40, list.length - state.shown) + ' more') + '</button>' : '';
    document.querySelector('#research-more button')?.addEventListener('click', () => { state.shown += 40; updateLibraryResults(); });
  }

  function renderLibrary() {
    const years = [...new Set(papers.map(p => String(p.year)).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
    panel.innerHTML = '<div class="research-toolbar"><div><h2>' + T('论文库', 'Paper library') + '</h2><p>' + T('以正式会议、期刊和已录用记录为主，并保留预印本或技术版本链接。', 'Focused on formal venues and accepted work, while preserving preprint or technical-version links.') + '</p></div><a href="research-map-data/methodology-2026-11-02.pdf">' + T('方法说明', 'Methodology') + ' ↗</a></div>'
      + '<div class="library-filters"><div class="library-field"><label for="research-q">' + T('搜索', 'Search') + '</label><input id="research-q" type="search" value="' + esc(state.q) + '" placeholder="' + T('题目、作者、会议、关键词或 P 编号', 'Title, author, venue, keyword or P ID') + '"></div>'
      + '<div class="library-field"><label for="research-topic">' + T('研究主题', 'Topic') + '</label><select id="research-topic"><option value="all">' + T('全部主题', 'All topics') + '</option>' + topics.map(t => '<option value="' + esc(t.id) + '">' + esc(topicName(t.id)) + '</option>').join('') + '</select></div>'
      + '<div class="library-field"><label for="research-publication">' + T('发表状态', 'Publication status') + '</label><select id="research-publication"><option value="all">' + T('全部状态', 'All statuses') + '</option><option value="published">' + T('正式发表', 'Published') + '</option><option value="accepted">' + T('已录用 / 待出版', 'Accepted / forthcoming') + '</option><option value="preprint">' + T('预印本', 'Preprint') + '</option><option value="other">' + T('其他 / 待核实', 'Other / pending') + '</option></select></div>'
      + '<div class="library-field"><label for="research-classification">' + T('归类状态', 'Classification') + '</label><select id="research-classification"><option value="all">' + T('全部归类', 'All classifications') + '</option><option value="verified">' + T('人工核查', 'Verified') + '</option><option value="suggested">' + T('建议归类', 'Suggested') + '</option></select></div>'
      + '<div class="library-field"><label for="research-collection">' + T('收录批次', 'Collection') + '</label><select id="research-collection"><option value="all">' + T('全部来源', 'All collections') + '</option><option value="se-top-2026">' + T('软件工程顶会 2026', 'Top SE venues 2026') + '</option><option value="hot-coding-agent">' + T('Coding Agent 安全补充', 'Coding-agent safety') + '</option></select></div>'
      + '<div class="library-field"><label for="research-year">' + T('年份', 'Year') + '</label><select id="research-year"><option value="all">' + T('全部年份', 'All years') + '</option>' + years.map(year => '<option value="' + esc(year) + '">' + esc(year) + '</option>').join('') + '</select></div></div>'
      + '<div class="library-count" id="research-library-count"></div><div id="research-library-results"></div><div class="research-more" id="research-more"></div>';
    const q = document.getElementById('research-q');
    const topic = document.getElementById('research-topic');
    const publication = document.getElementById('research-publication');
    const classification = document.getElementById('research-classification');
    const collection = document.getElementById('research-collection');
    const year = document.getElementById('research-year');
    topic.value = byTopic.has(state.topic) ? state.topic : 'all'; state.topic = topic.value;
    publication.value = ['all', 'published', 'accepted', 'preprint', 'other'].includes(state.publication) ? state.publication : 'all'; state.publication = publication.value;
    classification.value = ['all', 'verified', 'suggested'].includes(state.classification) ? state.classification : 'all'; state.classification = classification.value;
    collection.value = ['all', 'se-top-2026', 'hot-coding-agent'].includes(state.collection) ? state.collection : 'all'; state.collection = collection.value;
    year.value = years.includes(state.year) ? state.year : 'all'; state.year = year.value;
    let timer;
    q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.q = q.value.trim(); state.shown = 40; syncUrl(); updateLibraryResults(); }, 180); });
    for (const [element, key] of [[topic, 'topic'], [publication, 'publication'], [classification, 'classification'], [collection, 'collection'], [year, 'year']]) element.addEventListener('change', () => { state[key] = element.value; state.shown = 40; syncUrl(); updateLibraryResults(); });
    updateLibraryResults();
  }

  function citationParticipants() {
    const ids = new Set();
    for (const edge of (graph.edges || []).filter(e => e.type === 'cites')) { ids.add(String(edge.source || edge.from)); ids.add(String(edge.target || edge.to)); }
    return [...ids].filter(id => byPaper.has(id) || graphNodes.has(id)).sort((a, b) => paperTitle(a).localeCompare(paperTitle(b), 'en'));
  }

  function truncate(value, limit = 26) {
    const s = String(value || '');
    return s.length > limit ? s.slice(0, limit - 1) + '…' : s;
  }

  function citationNode(node, kind) {
    const width = kind === 'focus' ? 250 : 220;
    const height = 62;
    return '<g class="citation-node ' + kind + (node.id === state.paper ? ' selected' : '') + '" data-paper="' + esc(node.id) + '" transform="translate(' + (node.x - width / 2) + ' ' + (node.y - height / 2) + ')"><rect width="' + width + '" height="' + height + '"></rect><text x="' + (width / 2) + '" y="27" text-anchor="middle">' + esc(truncate(node.title)) + '</text><text class="node-year" x="' + (width / 2) + '" y="45" text-anchor="middle">' + esc(node.year || '') + ' · ' + esc(node.id) + '</text></g>';
  }

  function citationInspector(id) {
    const paper = byPaper.get(String(id)) || graphNodes.get(String(id)) || { id, title: id };
    const fit = paper.labFit || {};
    return '<p class="eyebrow">PAPER · ' + esc(paper.id || id) + '</p><h3>' + esc(paper.title || id) + '</h3><p>' + esc(paper.summary || T('打开论文详情查看证据边界、来源和归类状态。', 'Open the paper detail for evidence boundaries, sources and classification status.')) + '</p>'
      + '<p><span class="badge">' + esc(paper.year || '') + '</span> <span class="badge">' + esc(fitLabel(fit.level)) + '</span></p><a class="btn" href="' + paperHref(id) + '">' + T('查看论文详情', 'Paper details') + ' →</a>';
  }

  function renderCitations() {
    const participants = citationParticipants();
    if (!participants.includes(state.paper)) state.paper = participants.includes('P302') ? 'P302' : participants[0];
    const allEdges = (graph.edges || []).filter(e => e.type === 'cites');
    const localEdges = allEdges.filter(e => String(e.source || e.from) === state.paper || String(e.target || e.to) === state.paper);
    const incoming = [...new Set(localEdges.filter(e => String(e.target || e.to) === state.paper).map(e => String(e.source || e.from)))];
    const outgoing = [...new Set(localEdges.filter(e => String(e.source || e.from) === state.paper).map(e => String(e.target || e.to)))];
    const both = incoming.filter(id => outgoing.includes(id));
    const left = incoming.filter(id => !both.includes(id));
    const right = outgoing.filter(id => !both.includes(id));
    const layout = new Map();
    const place = (ids, x, start, end) => ids.forEach((id, index) => layout.set(id, { id, title: paperTitle(id), year: byPaper.get(id)?.year || graphNodes.get(id)?.year, x, y: ids.length === 1 ? (start + end) / 2 : start + index * ((end - start) / Math.max(1, ids.length - 1)) }));
    layout.set(state.paper, { id: state.paper, title: paperTitle(state.paper), year: byPaper.get(state.paper)?.year || graphNodes.get(state.paper)?.year, x: 500, y: 310 });
    place(left, 155, 115, 505); place(right, 845, 115, 505); place(both, 500, 68, 68 + Math.max(0, both.length - 1) * 74);
    const edgeHtml = localEdges.map(edge => {
      const source = layout.get(String(edge.source || edge.from)), target = layout.get(String(edge.target || edge.to));
      if (!source || !target) return '';
      return '<path class="citation-edge" d="M' + source.x + ' ' + source.y + ' L' + target.x + ' ' + target.y + '" marker-end="url(#research-arrow)"></path>';
    }).join('');
    const nodeHtml = [...layout.values()].map(node => citationNode(node, node.id === state.paper ? 'focus' : 'neighbor')).join('');
    panel.innerHTML = '<div class="research-toolbar"><div><h2>' + T('精选真实引用图', 'Curated citation map') + '</h2><p>' + T('这里只显示已经记录来源定位的引用边，不根据题名或关键词推断引用关系。', 'Only citation edges with recorded source locations are shown; no citation is inferred from titles or keywords.') + '</p></div><a href="research-map-data/methodology-2026-11-02.pdf">' + T('证据说明', 'Evidence notes') + ' ↗</a></div>'
      + '<div class="citation-controls"><div class="library-field"><label for="citation-paper">' + T('聚焦论文', 'Focus paper') + '</label><select id="citation-paper">' + participants.map(id => '<option value="' + esc(id) + '">' + esc(paperTitle(id)) + '</option>').join('') + '</select></div><p>' + T('当前局部图：' + layout.size + ' 个节点、' + localEdges.length + ' 条引用边；全库已记录 ' + allEdges.length + ' 条。', 'Local graph: ' + layout.size + ' nodes and ' + localEdges.length + ' edges; ' + allEdges.length + ' recorded in the curated graph.') + '</p></div>'
      + '<div class="citation-layout"><div class="citation-stage"><svg viewBox="0 0 1000 590" role="group" aria-label="' + T('论文局部引用关系图', 'Local paper citation graph') + '"><defs><marker id="research-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="currentColor"></path></marker></defs>' + edgeHtml + nodeHtml + '</svg><p class="citation-note">' + T('箭头方向：引用方 → 被引用方。选择节点可查看摘要。', 'Arrow direction: citing paper → cited paper. Select a node to preview it.') + '</p></div><aside class="citation-inspector" id="citation-inspector">' + citationInspector(state.paper) + '</aside></div><p class="citation-summary">' + T('这是精选局部图，不是 ' + papers.length.toLocaleString() + ' 篇论文的完整引用网络。', 'This is a curated local graph, not a complete citation network for all ' + papers.length.toLocaleString() + ' papers.') + '</p>';
    const select = document.getElementById('citation-paper'); select.value = state.paper;
    select.addEventListener('change', () => { state.paper = select.value; syncUrl(); renderCitations(); });
    panel.querySelectorAll('.citation-node').forEach(node => node.addEventListener('click', () => {
      panel.querySelectorAll('.citation-node').forEach(item => item.classList.toggle('selected', item === node));
      document.getElementById('citation-inspector').innerHTML = citationInspector(node.dataset.paper);
    }));
  }

  function objectHtml(value) {
    if (value == null || value === '') return '';
    if (typeof value === 'string' || typeof value === 'number') return '<p>' + esc(value) + '</p>';
    if (Array.isArray(value)) return '<ul>' + value.filter(Boolean).map(item => '<li>' + (typeof item === 'object' ? objectHtml(item) : esc(item)) + '</li>').join('') + '</ul>';
    return '<dl class="paper-facts">' + Object.entries(value).filter(([, item]) => item != null && item !== '' && (!Array.isArray(item) || item.length)).map(([key, item]) => '<div><dt>' + esc(key) + '</dt><dd>' + (typeof item === 'object' ? objectHtml(item) : esc(item)) + '</dd></div>').join('') + '</dl>';
  }

  function detailSection(title, value) {
    return value == null || value === '' || (Array.isArray(value) && !value.length) ? '' : '<section class="paper-section"><h3>' + esc(title) + '</h3>' + objectHtml(value) + '</section>';
  }

  function loadPaperDetail(id) {
    if (window.NAV_DETAILS?.[id]) return Promise.resolve(window.NAV_DETAILS[id]);
    const summary = byPaper.get(id);
    if (!summary?.detailChunk) return Promise.resolve(summary);
    if (loadedChunks.has(summary.detailChunk)) return loadedChunks.get(summary.detailChunk).then(() => window.NAV_DETAILS?.[id] || summary);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'research-map-data/details/' + encodeURIComponent(summary.detailChunk);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load ' + summary.detailChunk));
      document.head.append(script);
    });
    loadedChunks.set(summary.detailChunk, promise);
    return promise.then(() => window.NAV_DETAILS?.[id] || summary);
  }

  function renderPaperDetail(paper) {
    const id = String(paper.id || state.paper);
    const relatedEdges = (graph.edges || []).filter(edge => edge.type === 'cites' && [String(edge.source || edge.from), String(edge.target || edge.to)].includes(id));
    const links = [external(paper.url, T('原始发布页', 'Original publication')), external(paper.pdfUrl, 'PDF'), external(paper.codeUrl, T('代码', 'Code'))].filter(Boolean).join('')
      + (relatedEdges.length ? '<a href="research-map.html?view=citations&paper=' + encodeURIComponent(id) + '">' + T('查看引用图', 'Citation map') + ' →</a>' : '');
    const sources = array(paper.sources);
    const relationItems = relatedEdges.map(edge => {
      const source = String(edge.source || edge.from), target = String(edge.target || edge.to), other = source === id ? target : source;
      const direction = source === id ? T('本篇引用', 'Cites') : T('引用本篇', 'Cited by');
      return '<li><a href="' + paperHref(other) + '">' + esc(paperTitle(other)) + '</a><small>' + direction + ' · ' + esc(text(array(edge.evidence)[0]?.locator || edge.label || '')) + '</small></li>';
    }).join('');
    panel.innerHTML = '<a class="paper-back" href="research-map.html?view=library">← ' + T('返回论文库', 'Back to paper library') + '</a><header class="research-paper-head"><p class="eyebrow">PAPER ' + esc(id) + ' · ' + esc(paper.year || '') + '</p><h2>' + esc(paper.title || id) + '</h2><p class="authors">' + esc(authorText(paper) || T('作者信息待补充', 'Authors pending')) + '</p><div class="paper-evidence"><span class="badge publication">' + esc(publicationLabel(paper.publicationStatus)) + '</span><span class="badge ' + (paper.classificationStatus === 'verified' ? 'verified' : 'suggested') + '">' + esc(classificationLabel(paper.classificationStatus)) + '</span><span class="badge">' + esc(paper.evidenceDepth || T('证据深度待补充', 'Evidence depth pending')) + '</span></div><div class="paper-links">' + links + '</div></header>'
      + '<div class="paper-detail-grid"><div>' + detailSection(T('这篇论文研究什么', 'Research question'), paper.summary || paper.question) + detailSection(T('方法与主要发现', 'Methods and findings'), paper.findings || paper.method || paper.contribution) + detailSection(T('影响与适用范围', 'Impact and scope'), paper.impact) + detailSection(T('局限与证据边界', 'Limitations and evidence boundaries'), paper.limitations) + detailSection(T('下一步研究建议', 'Next research steps'), paper.nextSteps) + '</div><aside>'
      + '<section class="paper-section"><h3>' + T('记录信息', 'Record information') + '</h3><dl class="paper-facts"><div><dt>' + T('发表处', 'Venue') + '</dt><dd>' + esc(paper.venue || '') + '</dd></div><div><dt>' + T('发表状态', 'Publication status') + '</dt><dd>' + esc(paper.publicationStatus || '') + '</dd></div>' + (paper.collection ? '<div><dt>' + T('收录批次', 'Collection') + '</dt><dd>' + esc(collectionLabel(paper.collection)) + '</dd></div>' : '') + '<div><dt>' + T('研究主题', 'Topics') + '</dt><dd>' + array(paper.topics).map(topicName).map(esc).join('、') + '</dd></div><div><dt>' + T('归类依据', 'Classification basis') + '</dt><dd>' + esc(paper.classificationReason || paper.labFit?.reason || '') + '</dd></div></dl></section>'
      + (relationItems ? '<section class="paper-section"><h3>' + T('已记录引用关系', 'Recorded citations') + '</h3><ul class="source-list">' + relationItems + '</ul></section>' : '')
      + (sources.length ? '<section class="paper-section"><h3>' + T('来源与定位', 'Sources and locations') + '</h3><ul class="source-list">' + sources.map(source => '<li>' + external(source.url, source.title || T('来源', 'Source')) + '<small>' + esc([source.section, source.note, source.accessedAt].filter(Boolean).join(' · ')) + '</small></li>').join('') + '</ul></section>' : '') + '</aside></div>';
  }

  function renderPaper() {
    const summary = byPaper.get(state.paper);
    if (!summary) { panel.innerHTML = '<div class="research-empty">' + T('没有找到这篇论文。', 'Paper not found.') + '</div>'; return; }
    panel.innerHTML = '<div class="paper-loading">' + T('正在加载论文详情…', 'Loading paper details…') + '</div>';
    loadPaperDetail(state.paper).then(paper => {
      if (state.view === 'paper' && state.paper === String(paper.id)) renderPaperDetail(paper);
    }).catch(() => { panel.innerHTML = '<div class="research-empty">' + T('论文详情加载失败，请刷新后重试。', 'Paper details failed to load. Refresh and try again.') + '</div>'; });
  }

  function render() {
    updateTabs();
    if (state.view === 'topics') renderTopics();
    else if (state.view === 'citations') renderCitations();
    else if (state.view === 'library') renderLibrary();
    else renderPaper();
  }

  tabs.addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (button) setView(button.dataset.view);
  });
  renderStats();
  render();
})();
