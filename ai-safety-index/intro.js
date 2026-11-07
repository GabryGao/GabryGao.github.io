/* Opening animation for the home page: a team of cursors builds the first screen.
 *
 * The real page is rendered first and covered with a sheet in the page colour. Each cursor
 * takes the next piece of the screen from the top down: it drags out a panel and paints it,
 * types a block of text (the sheet is cut away line by line so the real text shows through),
 * or frames a picture and uncovers it. When everything is built the sheet fades and the live
 * page is left. About 15 seconds; runs once per browser session, Esc or the button skips it.
 * ?intro=1 forces it, ?intro=0 turns it off.
 */
(() => {
  const q = new URLSearchParams(location.search);
  if (q.get('intro') === '0' || location.hash) return;
  const force = q.get('intro') === '1';
  try { if (!force && sessionStorage.getItem('asi-intro')) return; sessionStorage.setItem('asi-intro', '1'); } catch (e) { /* storage blocked: still play */ }
  if (!force && document.visibilityState !== 'visible') return;

  const en = /^en/.test(document.documentElement.lang);
  const NAMES = en
    ? ['Alignment', 'Red team', 'Evals', 'Interp', 'Governance', 'Monitoring', 'Robustness', 'Privacy', 'Agents', 'Data', 'Benchmarks', 'Provenance', 'Jailbreak', 'Backdoor', 'Watermark', 'Hallucination', 'Values', 'Incidents', 'Audit', 'Adversarial', 'Prompt injection', 'Reward hacking', 'Sycophancy', 'Deception', 'Unlearning', 'Refusal', 'Guardrails', 'Sandbox', 'Permissions', 'Oversight', 'Constitutional AI', 'Bias', 'Fairness', 'Copyright', 'Deepfakes', 'Misinformation', 'Cybersecurity', 'Biosecurity', 'Chemical risk', 'Self-replication', 'Capability evals', 'Dangerous capabilities', 'Deployment', 'Transparency', 'Accountability', 'Standards', 'Policy', 'Compliance', 'Multimodal', 'Embodied AI', 'Robotics', 'Code security', 'Supply chain', 'Model theft', 'Distillation', 'CoT monitoring', 'Chain of thought', 'Controllability', 'Human feedback', 'Frontier models']
    : ['对齐', '红队', '评测', '可解释性', '治理', '监控', '鲁棒性', '隐私', '智能体', '数据', '基准', '溯源', '越狱', '后门', '水印', '幻觉', '价值观', '安全事件', '审计', '对抗样本', '提示注入', '奖励黑客', '谄媚', '欺骗', '遗忘学习', '拒答', '护栏', '沙箱', '权限', '监督', '宪法 AI', '偏见', '公平', '版权', '深度伪造', '虚假信息', '网络安全', '生物安全', '化学风险', '自主复制', '能力评估', '危险能力', '部署', '透明度', '问责', '标准', '政策', '合规', '多模态', '具身智能', '机器人', '代码安全', '供应链', '模型窃取', '蒸馏', '推理监控', '思维链', '可控性', '人类反馈', '前沿模型'];
  // one colour per cursor, spread round the colour wheel
  const COLORS = NAMES.map((_, i) => 'hsl(' + Math.round((i * 137.5) % 360) + ', 68%, ' + (i % 2 ? 44 : 50) + '%)');
  const SEL = '#2e86de', RULER = 20, BUILD = 13; // seconds of building
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ------------------------------------------------------------------ the sheet, shown at once
  const root = document.documentElement, body = document.body;
  const pageBg = (() => {
    for (const el of [body, root]) { const c = getComputedStyle(el).backgroundColor; if (!/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; }
    return '#fff';
  })();
  const ink = getComputedStyle(body).color;
  const wrap = document.createElement('div');
  wrap.className = 'asi-intro';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;background:' + pageBg + ';transition:opacity .7s ease;cursor:default';
  const cover = document.createElement('canvas'), fx = document.createElement('canvas');
  for (const c of [cover, fx]) c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  const skip = document.createElement('button');
  skip.type = 'button';
  skip.textContent = en ? 'Skip ›' : '跳过 ›';
  skip.style.cssText = 'position:absolute;right:18px;bottom:18px;font:500 13px/1 system-ui,sans-serif;padding:9px 14px;border-radius:999px;border:1px solid currentColor;background:' + pageBg + ';color:' + ink + ';opacity:.75;cursor:pointer';
  wrap.append(cover, fx, skip);
  body.appendChild(wrap);
  const overflow = root.style.overflow;
  root.style.overflow = 'hidden';

  let done = false, raf = 0;
  const finish = (fast) => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    removeEventListener('keydown', onKey);
    removeEventListener('resize', onResize);
    root.style.overflow = overflow;
    wrap.style.transition = 'opacity ' + (fast ? .25 : .7) + 's ease';
    wrap.style.opacity = '0';
    wrap.style.pointerEvents = 'none';
    setTimeout(() => wrap.remove(), fast ? 300 : 800);
  };
  const onKey = e => { if (e.key === 'Escape') finish(true); };
  const onResize = () => finish(true);
  skip.addEventListener('click', () => finish(true));
  addEventListener('keydown', onKey);

  // wait for the page and its fonts so the measured lines match what will be uncovered
  const ready = Promise.all([
    document.readyState === 'complete' ? 0 : new Promise(r => addEventListener('load', r, { once: true })),
    document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => 0) : 0,
  ]);
  Promise.race([ready, new Promise(r => setTimeout(r, 2500))]).then(() => requestAnimationFrame(() => requestAnimationFrame(start)));

  // ------------------------------------------------------------------ reading the page
  function blueprint(vw, vh) {
    const inView = r => r.width > 2 && r.height > 2 && r.bottom > RULER + 2 && r.top < vh && r.right > RULER && r.left < vw;
    const clip = r => {
      const x0 = Math.max(RULER, r.left), y0 = Math.max(RULER, r.top), x1 = Math.min(vw, r.right), y1 = Math.min(vh, r.bottom);
      return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
    };
    const shown = el => {
      for (let e = el; e && e !== body; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
      }
      return true;
    };
    const visibleColor = c => c && !/rgba\([^)]*,\s*0\)|transparent/.test(c);
    const jobs = [];

    // panels: anything with its own background or border
    for (const el of body.querySelectorAll('*')) {
      if (wrap.contains(el) || el.closest('svg')) continue;
      const r = el.getBoundingClientRect();
      if (!inView(r) || r.width < 24 || r.height < 6) continue;
      const cs = getComputedStyle(el);
      const bg = visibleColor(cs.backgroundColor) && cs.backgroundColor !== pageBg ? cs.backgroundColor : null;
      const sides = ['Top', 'Right', 'Bottom', 'Left'].map(s => {
        const w = parseFloat(cs['border' + s + 'Width']) || 0, c = cs['border' + s + 'Color'];
        return w > 0 && visibleColor(c) && cs['border' + s + 'Style'] !== 'none' ? [w, c] : [0, null];
      });
      if (!bg && !sides.some(s => s[0])) continue;
      if (r.width * r.height > vw * vh * 0.7 && !bg) continue;
      if (!shown(el)) continue;
      jobs.push({ kind: 'box', el, r: clip(r), raw: r, bg, sides, radius: parseFloat(cs.borderTopLeftRadius) || 0 });
    }
    // pictures: the crawler canvas, images, icons
    for (const el of body.querySelectorAll('canvas, img, svg, video')) {
      if (wrap.contains(el) || (el.tagName === 'svg' && el.parentElement.closest('svg'))) continue;
      const r = el.getBoundingClientRect();
      if (!inView(r) || r.width < 14 || r.height < 14 || !shown(el)) continue;
      jobs.push({ kind: 'media', el, r: clip(r) });
    }
    // text: group text nodes by their block, then by line
    const blockOf = n => {
      for (let e = n.parentElement; e; e = e.parentElement) if (!/^inline/.test(getComputedStyle(e).display)) return e;
      return body;
    };
    const groups = new Map();
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.nodeValue.trim() && !wrap.contains(n) && !n.parentElement.closest('svg, script, style, noscript, canvas') ? 1 : 3),
    });
    for (let n; (n = walker.nextNode());) {
      const b = blockOf(n);
      if (!groups.has(b)) groups.set(b, []);
      groups.get(b).push(n);
    }
    const range = document.createRange();
    for (const [el, nodes] of groups) {
      if (!shown(el)) continue;
      const lines = [];
      let chars = 0;
      for (const n of nodes) {
        range.selectNodeContents(n);
        for (const rr of range.getClientRects()) {
          if (!inView(rr)) continue;
          const c = clip(rr);
          const line = lines.find(l => Math.abs(l.y0 - c.y0) < 4 && Math.abs(l.y1 - c.y1) < 6);
          if (line) { line.x0 = Math.min(line.x0, c.x0); line.x1 = Math.max(line.x1, c.x1); }
          else lines.push({ ...c });
        }
        chars += n.nodeValue.trim().length;
      }
      if (!lines.length) continue;
      lines.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
      for (const l of lines) { l.x0 -= 1; l.x1 += 2; l.y0 -= 2; l.y1 += 2; l.w = l.x1 - l.x0; }
      for (let k = 0; k < lines.length; k += 2) {
        const part = lines.slice(k, k + 2), share = part.reduce((s, l) => s + l.w, 0) / lines.reduce((s, l) => s + l.w, 0);
        const px0 = Math.min(...part.map(l => l.x0)), px1 = Math.max(...part.map(l => l.x1));
        jobs.push({ kind: 'text', el, lines: part, chars: Math.max(1, Math.round(chars * share)), r: { x0: px0, y0: part[0].y0, x1: px1, y1: part[part.length - 1].y1, w: px1 - px0, h: part[part.length - 1].y1 - part[0].y0 } });
      }
    }
    // a piece inside a panel waits for the panel
    const boxes = jobs.filter(j => j.kind === 'box');
    for (const j of jobs) j.deps = boxes.filter(b => b !== j && b.el !== j.el && b.el.contains(j.el));
    jobs.sort((a, b) => (a.r.y0 - (a.kind === 'box' ? 6 : 0)) - (b.r.y0 - (b.kind === 'box' ? 6 : 0)) || a.r.x0 - b.r.x0);
    return jobs;
  }

  // ------------------------------------------------------------------ running it
  function start() {
    if (done) return;
    const vw = innerWidth, vh = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    scrollTo(0, 0);
    for (const c of [cover, fx]) { c.width = Math.round(vw * dpr); c.height = Math.round(vh * dpr); }
    const cv = cover.getContext('2d'), g = fx.getContext('2d');
    cv.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    cv.fillStyle = pageBg;
    cv.fillRect(0, 0, vw, vh);
    wrap.style.background = 'transparent';
    addEventListener('resize', onResize);

    let jobs = blueprint(vw, vh);
    if (jobs.length > 160) jobs = jobs.filter(j => j.kind !== 'box' || j.bg || j.r.w * j.r.h > 2000).slice(0, 160);
    const base = j => (j.kind === 'box' ? 0.7 : j.kind === 'media' ? 1.3 : 0.35 + Math.min(1.5, j.chars * 0.014));
    const n = vw < 700 ? 24 : 60;
    const work = jobs.reduce((s, j) => s + base(j) + 0.35, 0);
    const speed = Math.max(0.6, Math.min(3.5, work / (n * BUILD)));
    // the build sweeps down the screen: each piece becomes available a little after the one above it
    jobs.forEach((j, i) => { j.dur = base(j) / speed; j.state = 'todo'; j.release = 0.5 + (BUILD - 2.6) * i / Math.max(1, jobs.length - 1); });

    const agents = NAMES.slice(0, n).map((name, i) => {
      const side = i % 4, a = { name, color: COLORS[i % COLORS.length], job: null, phase: 'wait', wake: 0.025 * i + rnd(0, 0.25) };
      a.x = side === 0 ? -30 : side === 1 ? vw + 30 : rnd(0, vw);
      a.y = side === 2 ? -30 : side === 3 ? vh + 30 : rnd(0, vh);
      return a;
    });

    const paintBox = j => {
      const { raw, bg, sides, radius } = j;
      cv.save();
      cv.beginPath();
      cv.rect(RULER, RULER, vw, vh);
      cv.clip();
      if (bg) {
        cv.fillStyle = bg;
        cv.beginPath();
        cv.roundRect ? cv.roundRect(raw.left, raw.top, raw.width, raw.height, radius) : cv.rect(raw.left, raw.top, raw.width, raw.height);
        cv.fill();
      }
      const [[t, tc], [r, rc], [b, bc], [l, lc]] = sides;
      if (t) { cv.fillStyle = tc; cv.fillRect(raw.left, raw.top, raw.width, t); }
      if (b) { cv.fillStyle = bc; cv.fillRect(raw.left, raw.bottom - b, raw.width, b); }
      if (l) { cv.fillStyle = lc; cv.fillRect(raw.left, raw.top, l, raw.height); }
      if (r) { cv.fillStyle = rc; cv.fillRect(raw.right - r, raw.top, r, raw.height); }
      cv.restore();
    };
    const reveal = (x0, y0, w, h) => cv.clearRect(x0, y0, w, h);
    const textAt = (j, p) => { // reveal the first p of the block, line by line; returns the caret
      const total = j.lines.reduce((s, l) => s + l.w, 0);
      let left = total * p, caret = null;
      for (const l of j.lines) {
        const w = Math.min(l.w, Math.max(0, left));
        if (w > 0) reveal(l.x0, l.y0, w, l.y1 - l.y0);
        if (left <= l.w) { caret = { x: l.x0 + w, y0: l.y0, y1: l.y1 }; break; }
        left -= l.w;
      }
      return caret || { x: j.lines[j.lines.length - 1].x1, y0: j.lines[j.lines.length - 1].y0, y1: j.lines[j.lines.length - 1].y1 };
    };
    const startPoint = j => (j.kind === 'text' ? [j.lines[0].x0, (j.lines[0].y0 + j.lines[0].y1) / 2] : [j.r.x0, j.r.y0]);
    const take = () => jobs.find(j => j.state === 'todo' && j.release <= t && j.deps.every(d => d.state === 'done'));

    const flashes = [];
    let t = 0, last = performance.now(), endAt = 0;

    const frame = now => {
      if (done) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      for (const a of agents) {
        if (a.phase === 'wait' && t >= a.wake) a.phase = 'idle';
        if (a.phase === 'idle') {
          const j = take();
          if (j) {
            j.state = 'busy';
            a.job = j;
            a.from = [a.x, a.y];
            a.to = startPoint(j);
            a.t0 = t;
            a.travel = Math.max(0.18, Math.min(0.45, Math.hypot(a.to[0] - a.x, a.to[1] - a.y) / 1800)) / Math.max(1, speed * 0.8);
            a.phase = 'travel';
          } else if (jobs.some(j => j.state !== 'done')) {
            // nothing free yet: drift over to where someone is working and look on
            const busy = agents.filter(b => b.job);
            const r = busy.length ? busy[Math.floor(Math.random() * busy.length)].job.r : { x0: vw * 0.2, y0: vh * 0.2, w: vw * 0.6, h: vh * 0.6 };
            a.from = [a.x, a.y];
            a.to = [r.x0 + rnd(-40, r.w + 40), r.y0 + rnd(-30, r.h + 30)];
            a.t0 = t;
            a.travel = rnd(0.7, 1.4);
            a.phase = 'roam';
          } else {
            a.phase = 'leave';
            a.from = [a.x, a.y];
            a.to = [a.x < vw / 2 ? -40 : vw + 40, a.y + rnd(-80, 80)];
            a.t0 = t;
            a.travel = 0.6;
          }
        }
        if (a.phase === 'travel' || a.phase === 'leave' || a.phase === 'roam') {
          const p = Math.min(1, (t - a.t0) / a.travel), e = ease(p);
          a.x = a.from[0] + (a.to[0] - a.from[0]) * e;
          a.y = a.from[1] + (a.to[1] - a.from[1]) * e;
          if (p >= 1) { a.phase = a.phase === 'leave' ? 'gone' : a.phase === 'roam' ? 'idle' : 'work'; a.t0 = t; }
        }
        if (a.phase === 'work') {
          const j = a.job, p = Math.min(1, (t - a.t0) / j.dur);
          if (j.kind === 'box' || j.kind === 'media') {
            const dp = j.kind === 'box' ? easeOut(Math.min(1, p / 0.8)) : easeOut(Math.min(1, p / 0.45));
            a.x = j.r.x0 + j.r.w * dp;
            a.y = j.r.y0 + j.r.h * dp;
            a.drag = { x0: j.r.x0, y0: j.r.y0, x1: a.x, y1: a.y, color: j.kind === 'media' ? a.color : SEL, media: j.kind === 'media' && p > 0.45 ? (p - 0.45) / 0.55 : 0 };
            if (j.kind === 'media' && p > 0.6) reveal(j.r.x0, j.r.y0, j.r.w, j.r.h * Math.min(1, (p - 0.6) / 0.4));
          } else {
            const c = textAt(j, ease(p));
            a.x = c.x;
            a.y = (c.y0 + c.y1) / 2 + 4;
            a.caret = c;
          }
          if (p >= 1) {
            if (j.kind === 'box') paintBox(j);
            if (j.kind === 'media') reveal(j.r.x0, j.r.y0, j.r.w, j.r.h);
            if (j.kind === 'text') textAt(j, 1);
            if (j.kind !== 'text') flashes.push({ r: j.r, until: t + 0.45, color: j.kind === 'media' ? a.color : SEL });
            j.state = 'done';
            a.job = null;
            a.drag = null;
            a.caret = null;
            a.phase = 'idle';
          }
        }
      }

      draw(g, vw, vh, agents, flashes, t);
      if (!endAt && agents.every(a => a.phase === 'gone')) endAt = t;
      if (endAt && t > endAt + 0.25) { reveal(0, 0, vw, vh); finish(false); return; }
      if (t > 18) { finish(false); return; } // never hold the page longer than this
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------------ drawing the tools
  function draw(g, vw, vh, agents, flashes, t) {
    g.clearRect(0, 0, vw, vh);
    // rulers along the top and left edge, marking where each cursor is working
    g.fillStyle = pageBg;
    g.fillRect(0, 0, vw, RULER);
    g.fillRect(0, 0, RULER, vh);
    g.globalAlpha = 0.07;
    g.fillStyle = ink;
    g.fillRect(0, 0, vw, RULER);
    g.fillRect(0, RULER, RULER, vh);
    g.globalAlpha = 1;
    for (const a of agents) {
      const r = a.job && a.job.r;
      if (!r || a.phase !== 'work') continue;
      g.globalAlpha = 0.28;
      g.fillStyle = a.color;
      g.fillRect(r.x0, 0, r.w, RULER);
      g.fillRect(0, r.y0, RULER, r.h);
      g.globalAlpha = 1;
    }
    g.strokeStyle = ink;
    g.fillStyle = ink;
    g.lineWidth = 1;
    g.globalAlpha = 0.45;
    g.font = '9px ui-monospace, Menlo, monospace';
    g.beginPath();
    for (let x = RULER; x < vw; x += 10) {
      const k = (x - RULER) % 100 === 0 ? 10 : (x - RULER) % 50 === 0 ? 6 : 3;
      g.moveTo(x + 0.5, RULER - k); g.lineTo(x + 0.5, RULER);
      if ((x - RULER) % 100 === 0 && x > RULER) g.fillText(String(x - RULER), x + 3, 9);
    }
    for (let y = RULER; y < vh; y += 10) {
      const k = (y - RULER) % 100 === 0 ? 10 : (y - RULER) % 50 === 0 ? 6 : 3;
      g.moveTo(RULER - k, y + 0.5); g.lineTo(RULER, y + 0.5);
    }
    g.moveTo(0, RULER + 0.5); g.lineTo(vw, RULER + 0.5);
    g.moveTo(RULER + 0.5, 0); g.lineTo(RULER + 0.5, vh);
    g.stroke();
    g.globalAlpha = 1;

    // just-finished pieces keep their selection handles for a moment
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      if (t > f.until) { flashes.splice(i, 1); continue; }
      g.globalAlpha = Math.min(1, (f.until - t) / 0.2);
      selection(g, f.r.x0, f.r.y0, f.r.x1, f.r.y1, f.color, true);
      g.globalAlpha = 1;
    }
    for (const a of agents) {
      if (a.drag) {
        const d = a.drag;
        if (d.media) {
          g.save();
          g.globalAlpha = 0.12;
          g.fillStyle = d.color;
          g.fillRect(d.x0, d.y0, d.x1 - d.x0, d.y1 - d.y0);
          g.globalAlpha = 0.5 * Math.min(1, d.media * 2);
          g.strokeStyle = d.color;
          g.beginPath();
          g.moveTo(d.x0, d.y0); g.lineTo(d.x1, d.y1);
          g.moveTo(d.x1, d.y0); g.lineTo(d.x0, d.y1);
          g.stroke();
          g.restore();
        }
        selection(g, d.x0, d.y0, d.x1, d.y1, d.color, false);
        const label = Math.round(d.x1 - d.x0) + ' × ' + Math.round(d.y1 - d.y0);
        g.font = '600 10px ui-monospace, Menlo, monospace';
        const w = g.measureText(label).width + 10, cx = (d.x0 + d.x1) / 2;
        g.fillStyle = d.color;
        pill(g, cx - w / 2, d.y1 + 6, w, 16, 3);
        g.fillStyle = '#fff';
        g.fillText(label, cx - w / 2 + 5, d.y1 + 17.5);
      }
      if (a.caret && Math.floor(t * 4) % 2 === 0) {
        g.fillStyle = a.color;
        g.fillRect(a.caret.x, a.caret.y0 + 1, 2, a.caret.y1 - a.caret.y0 - 2);
      }
    }
    for (const a of agents) if (a.phase !== 'wait' && a.phase !== 'gone') cursor(g, a);
  }

  function selection(g, x0, y0, x1, y1, color, handles) {
    g.strokeStyle = color;
    g.lineWidth = 1;
    g.strokeRect(Math.round(x0) + 0.5, Math.round(y0) + 0.5, Math.round(x1 - x0), Math.round(y1 - y0));
    if (!handles) return;
    g.fillStyle = '#fff';
    for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
      g.fillRect(x - 3, y - 3, 6, 6);
      g.strokeRect(Math.round(x - 3) + 0.5, Math.round(y - 3) + 0.5, 6, 6);
    }
  }

  function pill(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.fill();
  }

  function cursor(g, a) {
    g.save();
    g.translate(Math.round(a.x), Math.round(a.y));
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(0, 17); g.lineTo(4.6, 13); g.lineTo(7.6, 19.6); g.lineTo(10.4, 18.4); g.lineTo(7.4, 12); g.lineTo(13, 12);
    g.closePath();
    g.fillStyle = a.color;
    g.strokeStyle = '#fff';
    g.lineWidth = 1.4;
    g.lineJoin = 'round';
    g.shadowColor = 'rgba(0,0,0,.25)';
    g.shadowBlur = 3;
    g.shadowOffsetY = 1;
    g.stroke();
    g.fill();
    g.shadowColor = 'transparent';
    g.font = '600 11px system-ui, -apple-system, "PingFang SC", sans-serif';
    const w = g.measureText(a.name).width + 12;
    g.fillStyle = a.color;
    pill(g, 12, 18, w, 18, 4);
    g.fillStyle = '#fff';
    g.fillText(a.name, 18, 31);
    g.restore();
  }
})();
