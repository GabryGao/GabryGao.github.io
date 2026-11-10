(() => {
  'use strict';

  const text = value => typeof value === 'string' ? value : '';

  function build(paper, options = {}) {
    const T = options.T || ((zh, en) => options.english ? en : zh);
    // Keep the source intact, including decimals, citations, formulas and spacing.
    // Metadata and topic labels do not establish a paper's findings or significance.
    const originalAbstract = text(paper.abstract);
    const hasAbstract = Boolean(originalAbstract.trim());
    const localized = typeof options.abstract === 'function' ? text(options.abstract(paper)) : originalAbstract;
    const abstract = hasAbstract ? (localized.trim() ? localized : originalAbstract) : '';
    return {
      reviewed: false,
      hasAbstract,
      abstract,
      originalAbstract,
      translated: hasAbstract && abstract !== originalAbstract,
      noAbstract: T(
        '摘要暂缺。',
        'Abstract unavailable.'
      )
    };
  }

  window.PaperBrief = { build };
})();
