(() => {
  const TAU = Math.PI * 2;
  const COLORS = {
    bg: '#07110d', grid: 'rgba(126,168,145,.09)', line: 'rgba(104,165,133,.23)',
    lineHot: 'rgba(88,211,145,.55)', text: '#dcefe4', muted: '#82a18f',
    ok: '#58d391', retry: '#f0c233', paper: '#6fc9ff', incident: '#ff806f', packet: '#9af0bd'
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const hash = value => {
    let out = 2166136261;
    for (const char of String(value || '')) out = Math.imul(out ^ char.charCodeAt(0), 16777619);
    return out >>> 0;
  };
  const norm = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const short = (value, limit) => String(value || '').length > limit ? String(value).slice(0, limit - 1) + '…' : String(value || '');
  const roundedRect = (ctx, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  };
  const curvePoint = (a, b, bend, progress) => {
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.max(1, Math.hypot(dx, dy));
    const control = { x: (a.x + b.x) / 2 - dy / length * bend, y: (a.y + b.y) / 2 + dx / length * bend };
    const back = 1 - progress;
    return {
      x: back * back * a.x + 2 * back * progress * control.x + progress * progress * b.x,
      y: back * back * a.y + 2 * back * progress * control.y + progress * progress * b.y
    };
  };

  function mount(root) {
    if (!root) return { setDirection() {} };
    const S = window.Shell;
    const T = S.T;
    const records = typeof siteSignals !== 'undefined' ? siteSignals.slice() : [];
    const signalInfo = typeof siteSignalsInfo !== 'undefined' ? siteSignalsInfo : {};
    const papers = typeof sitePaperPicks !== 'undefined' ? sitePaperPicks.slice() : [];
    const paperInfo = typeof sitePaperPicksInfo !== 'undefined' ? sitePaperPicksInfo : {};
    const canvas = root.querySelector('#crawler-canvas');
    const ctx = canvas.getContext('2d');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sourceNodes = (signalInfo.sources || []).map(source => ({
      id: source.id, label: source.name, status: source.status, count: Number(source.records || 0)
    }));
    sourceNodes.push({ id: 'arxiv', label: 'arXiv', status: paperInfo.status === 'current' ? 'ok' : paperInfo.status || 'ok', count: papers.length });
    root.dataset.health = signalInfo.status || 'current';

    const sourceCount = root.querySelector('#crawler-source-count');
    const recordCount = root.querySelector('#crawler-record-count');
    const paperCount = root.querySelector('#crawler-paper-count');
    const summary = root.querySelector('#crawler-summary');
    const updated = root.querySelector('#crawler-updated');
    const current = root.querySelector('#crawler-current');
    const currentKind = root.querySelector('#crawler-current-kind');
    const currentSource = root.querySelector('#crawler-current-source');
    const currentTime = root.querySelector('#crawler-current-time');
    const currentTitle = root.querySelector('#crawler-current-title');

    let direction = 'all';
    let width = 0, height = 0, dpr = 1;
    let sources = [], center = {}, outputs = [];
    let events = [], lastCaption = -1, captionPaused = false;
    let frame = 0, visible = !document.hidden;

    const formatStamp = value => {
      if (!value) return T('更新时间待确认', 'Update time pending');
      const date = new Date(value);
      return new Intl.DateTimeFormat(S.lang === 'en' ? 'en-US' : 'zh-CN', {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }).format(date);
    };
    const latestUpdate = [signalInfo.generated_on, paperInfo.generated_on].filter(Boolean).sort().at(-1);
    updated.textContent = T('更新于 ', 'Updated ') + formatStamp(latestUpdate);
    sourceCount.textContent = sourceNodes.length.toLocaleString();

    function sourceFor(event) {
      if (event.type === 'paper') return Math.max(0, sourceNodes.findIndex(source => source.id === 'arxiv'));
      const key = norm(event.source);
      const match = sourceNodes.findIndex(source => key.includes(norm(source.label)) || norm(source.label).includes(key));
      return match >= 0 ? match : hash(event.source) % Math.max(1, sourceNodes.length - 1);
    }

    function rebuildEvents() {
      const filteredRecords = records.filter(record => direction === 'all' || (record.direction_ids || []).includes(direction));
      const filteredPapers = papers.filter(paper => direction === 'all' || (paper.direction_ids || []).includes(direction));
      const signalEvents = filteredRecords.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 18).map(record => ({
        id: record.id, type: record.kind === 'incident' ? 'incident' : 'signal', source: record.source,
        title: S.title(record), date: record.date, target: record.kind === 'incident' ? 'incidents' : 'signals',
        href: 'records.html?item=' + encodeURIComponent(record.id), direction_ids: record.direction_ids || []
      }));
      const paperEvents = filteredPapers.slice(0, 10).map(paper => ({
        id: paper.arxiv_id, type: 'paper', source: 'arXiv', title: paper.title, date: paper.date,
        target: 'papers', href: 'papers.html', direction_ids: paper.direction_ids || []
      }));
      events = [...signalEvents, ...paperEvents].sort((a, b) => String(b.date).localeCompare(String(a.date)) || hash(a.id) - hash(b.id));
      if (!events.length) events = [{ id: 'empty', type: 'signal', source: 'AI Safety Index', title: T('这个方向暂无新采集记录', 'No newly collected records in this direction'), date: '', target: 'signals', href: 'records.html' }];

      const incidentTotal = filteredRecords.filter(record => record.kind === 'incident').length;
      recordCount.textContent = filteredRecords.length.toLocaleString();
      paperCount.textContent = filteredPapers.length.toLocaleString();
      const available = sourceNodes.filter(source => source.status === 'ok' || source.status === 'current').length;
      summary.textContent = T(
        available + '/' + sourceNodes.length + ' 个来源本轮可用 · 每 3 小时自动更新',
        available + '/' + sourceNodes.length + ' sources available · updates every 3 hours'
      );
      outputs = [
        { id: 'signals', label: T('站内记录', 'Records'), count: filteredRecords.length, color: COLORS.ok },
        { id: 'incidents', label: T('安全事件', 'Incidents'), count: incidentTotal, color: COLORS.incident },
        { id: 'papers', label: T('本周论文', 'Weekly papers'), count: filteredPapers.length, color: COLORS.paper }
      ];
      lastCaption = -1;
      layout();
      showCaption(0);
    }

    function layout() {
      if (!width || !height) return;
      const compact = width < 720;
      const top = compact ? 218 : 135;
      const bottom = compact ? 170 : 122;
      const usable = Math.max(120, height - top - bottom);
      if (compact) {
        const cols = Math.min(4, sourceNodes.length);
        sources = sourceNodes.map((source, index) => ({
          ...source,
          x: width * (.15 + (index % cols) * (.70 / Math.max(1, cols - 1))),
          y: top + 18 + Math.floor(index / cols) * 50
        }));
        center = { x: width * .5, y: top + 128 };
        outputs = outputs.map((output, index) => ({ ...output, x: width * (.18 + index * .32), y: Math.min(height - bottom + 24, top + 216) }));
      } else {
        const rows = Math.ceil(sourceNodes.length / 2);
        sources = sourceNodes.map((source, index) => ({
          ...source,
          x: width * (index % 2 ? .32 : .10),
          y: top + (Math.floor(index / 2) + .35) * usable / rows
        }));
        center = { x: width * .57, y: top + usable * .5 };
        outputs = outputs.map((output, index) => ({ ...output, x: width * .84, y: top + (index + .55) * usable / outputs.length }));
      }
    }

    function resize() {
      const rect = root.getBoundingClientRect();
      width = Math.max(320, rect.width);
      height = Math.max(360, rect.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
      if (reduced) draw(performance.now());
      else if (visible && !frame) frame = requestAnimationFrame(draw);
    }

    function drawGrid() {
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      const step = width < 720 ? 32 : 42;
      for (let x = step / 2; x < width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = step / 2; y < height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    }

    function drawCurve(a, b, bend, time, hot) {
      ctx.beginPath();
      const first = curvePoint(a, b, bend, 0);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i <= 24; i++) {
        const point = curvePoint(a, b, bend, i / 24);
        ctx.lineTo(point.x, point.y);
      }
      ctx.strokeStyle = hot ? COLORS.lineHot : COLORS.line;
      ctx.lineWidth = hot ? 1.4 : 1;
      ctx.setLineDash(hot ? [5, 8] : [2, 7]);
      ctx.lineDashOffset = -time / (hot ? 70 : 120);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function nodeBox(node, options = {}) {
      const compact = width < 720;
      const label = short(node.label, compact ? 16 : 22);
      ctx.font = '600 ' + (compact ? 10 : 11) + 'px Archivo, sans-serif';
      const textWidth = ctx.measureText(label).width;
      const boxWidth = clamp(textWidth + 28, compact ? 64 : 88, compact ? 92 : 154);
      const boxHeight = options.center ? 48 : 36;
      const x = node.x - boxWidth / 2, y = node.y - boxHeight / 2;
      roundedRect(ctx, x, y, boxWidth, boxHeight, options.center ? 7 : 5);
      ctx.fillStyle = options.center ? 'rgba(12,47,32,.96)' : 'rgba(6,25,17,.9)';
      ctx.fill();
      ctx.strokeStyle = options.color || (node.status === 'failed' ? 'rgba(240,194,51,.75)' : 'rgba(104,203,149,.48)');
      ctx.lineWidth = options.center ? 1.5 : 1;
      ctx.stroke();
      ctx.fillStyle = options.color || (node.status === 'failed' ? COLORS.retry : COLORS.ok);
      ctx.beginPath(); ctx.arc(x + 12, node.y, options.center ? 4 : 3, 0, TAU); ctx.fill();
      ctx.fillStyle = COLORS.text;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(label, x + 21, node.y - (node.count != null ? 5 : 0));
      if (node.count != null) {
        ctx.font = '400 9px Archivo, sans-serif';
        ctx.fillStyle = COLORS.muted;
        ctx.fillText(Number(node.count).toLocaleString() + ' ' + T('条', 'items'), x + 21, node.y + 9);
      }
    }

    function drawCenter(time) {
      const phase = (time % 2400) / 2400;
      for (let i = 0; i < 2; i++) {
        const radius = 30 + ((phase + i / 2) % 1) * 28;
        ctx.beginPath(); ctx.arc(center.x, center.y, radius, 0, TAU);
        ctx.strokeStyle = 'rgba(88,211,145,' + (.22 * (1 - (radius - 30) / 28)) + ')';
        ctx.lineWidth = 1; ctx.stroke();
      }
      nodeBox({ ...center, label: 'AI SAFETY INDEX' }, { center: true, color: COLORS.ok });
    }

    function drawPacket(event, index, time) {
      const source = sources[sourceFor(event)] || sources[0];
      const target = outputs.find(output => output.id === event.target) || outputs[0];
      if (!source || !target) return;
      const duration = 6800 + index * 260;
      const progress = ((time + index * 930) % duration) / duration;
      const bendA = ((hash(event.id) % 31) - 15) * .75;
      const bendB = ((hash(event.source) % 25) - 12) * .65;
      const point = progress < .62
        ? curvePoint(source, center, bendA, progress / .62)
        : curvePoint(center, target, bendB, (progress - .62) / .38);
      const color = event.type === 'paper' ? COLORS.paper : event.type === 'incident' ? COLORS.incident : COLORS.packet;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(point.x, point.y, event.type === 'incident' ? 4 : 3, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0;
      if (index === 0 && progress > .2 && progress < .84 && width >= 720) {
        const label = short(event.source, 17);
        ctx.font = '600 9px Archivo, sans-serif';
        const labelWidth = ctx.measureText(label).width + 14;
        roundedRect(ctx, point.x + 8, point.y - 22, labelWidth, 18, 3);
        ctx.fillStyle = 'rgba(5,20,14,.92)'; ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = COLORS.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(label, point.x + 15, point.y - 13);
      }
    }

    function showCaption(index) {
      if (captionPaused || !events.length) return;
      const event = events[index % events.length];
      current.href = event.href;
      currentKind.textContent = event.type === 'paper' ? T('论文', 'Paper') : event.type === 'incident' ? T('安全事件', 'Safety incident') : T('安全信号', 'Safety signal');
      currentSource.textContent = event.source;
      currentTime.textContent = event.date || '';
      currentTime.dateTime = event.date || '';
      currentTitle.textContent = event.title;
    }

    function draw(time) {
      frame = 0;
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, width, height);
      drawGrid();
      sources.forEach((source, index) => drawCurve(source, center, ((index % 2 ? -1 : 1) * (12 + index * 2)), time, source.status !== 'failed'));
      outputs.forEach((output, index) => drawCurve(center, output, (index - 1) * 18, time, true));
      sources.forEach(source => nodeBox(source));
      outputs.forEach(output => nodeBox(output, { color: output.color }));
      drawCenter(time);
      events.slice(0, Math.min(8, events.length)).forEach((event, index) => drawPacket(event, index, time));
      const captionIndex = reduced ? 0 : Math.floor(time / 3600) % events.length;
      if (captionIndex !== lastCaption) { lastCaption = captionIndex; showCaption(captionIndex); }
      if (!reduced && visible) frame = requestAnimationFrame(draw);
    }

    function setDirection(next) {
      direction = next || 'all';
      rebuildEvents();
      if (reduced) draw(performance.now());
    }

    current.addEventListener('mouseenter', () => { captionPaused = true; });
    current.addEventListener('mouseleave', () => { captionPaused = false; lastCaption = -1; });
    current.addEventListener('focus', () => { captionPaused = true; });
    current.addEventListener('blur', () => { captionPaused = false; lastCaption = -1; });
    document.addEventListener('visibilitychange', () => {
      visible = !document.hidden;
      if (visible && !reduced && !frame) frame = requestAnimationFrame(draw);
      if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
    });
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(root);
    else window.addEventListener('resize', resize);
    resize();
    rebuildEvents();
    return { setDirection };
  }

  window.HomeCrawler = { mount };
})();
