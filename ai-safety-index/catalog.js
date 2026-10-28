/* Catalog helpers for the site pages. Load after ../source-catalog.js and ../site-data.js. */
(() => {
  const D = typeof SiteData !== 'undefined' ? SiteData : {};
  const resources = (typeof SourceCatalogData !== 'undefined' ? SourceCatalogData.resources : []) || [];
  const isTool = r => r.result_state === '工具/环境' || r.relation === '工具' || r.relation === '环境';
  const integrated = r => (D.integrated || {})[r.id] || '';
  const dirsOf = r => [r.direction_id, ...(r.related_direction_ids || [])];
  const topics = D.topics || [];
  const topicText = r => [r.name, r.subdomain, r.relation, r.metric, r.note, r.data_access].filter(Boolean).join(' ').toLowerCase();
  const topicMatches = (r, t) => !t || ((!t.directionIds || t.directionIds.includes(r.direction_id)) && t.terms.some(term => topicText(r).includes(term.toLowerCase())));
  const toolRules = (D.toolCopy?.rules || []).map(x => ({ ...x, re: new RegExp(x.pattern, x.flags) }));
  function toolCopy(r) {
    const text = [r.name, r.subdomain, r.direction, r.metric, r.note].join(' ').toLowerCase();
    return toolRules.find(x => x.re.test(text)) || D.toolCopy?.fallback || { tag: '', purpose: '', contents: '' };
  }
  /* evidence ladder shared by the catalog, detail and direction pages */
  const LEVELS = [
    { id: 'l1', zh: '站内已有结果', en: 'Results on this site', filled: 3, test: r => !!integrated(r) },
    { id: 'l2', zh: '已下载结果', en: 'Downloaded results', filled: 3, test: r => !integrated(r) && /已下载/.test(r.result_state) },
    { id: 'l3', zh: '公开榜单或结果文件', en: 'Public leaderboard or files', filled: 2, test: r => !integrated(r) && /公开榜单|公开结果文件/.test(r.result_state) },
    { id: 'l4', zh: '只有论文图表', en: 'Paper figures only', filled: 1, test: r => !integrated(r) && r.result_state === '论文/图表' },
    { id: 'l5', zh: '待核验', en: 'Pending verification', filled: 0, test: r => !integrated(r) && r.result_state === '待核验' }
  ];
  const levelOf = r => { const i = LEVELS.findIndex(l => l.test(r)); return i < 0 ? 4 : i; };
  const squares = (n, cls = '') => '<span class="sq ' + cls + '" aria-hidden="true">' + [0, 1, 2].map(i => '<i class="' + (i < n ? 'f' : '') + '"></i>').join('') + '</span>';
  const papers = () => [...(typeof paperRecords !== 'undefined' ? paperRecords : []), ...(D.handPapers || [])];
  window.Catalog = { data: D, resources, benchmarks: resources.filter(r => !isTool(r)), tools: resources.filter(isTool), isTool, integrated, dirsOf, topics, topicMatches, toolCopy, LEVELS, levelOf, squares, papers, checked: typeof SourceCatalogData !== 'undefined' ? SourceCatalogData.checked_date : '' };
})();
