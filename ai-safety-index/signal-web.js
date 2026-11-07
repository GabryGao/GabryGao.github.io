/* Signal web: recent safety signals are picked off a list by a small mechanical spider,
   flown through a web and routed into their research direction.
   Visual idea after Prompt Spider UI by Kirito14IT (MIT); this is an independent implementation. */
(() => {
  'use strict';

  function mountSignalWeb(cv, opts) {
    let { records } = opts;
    const { dirs, dirName, T, onFocus } = opts;
    const ctx = cv.getContext('2d');
    const still = false; // always animated, by request
    let W = 0, H = 0, C = {}, frame = 0;
    let L = {};                       // layout
    let cur = -1, startAt = 0, pinned = -1, hoverBox = -1;
    let scroll = 0, flights = [], counts = {}, flash = {}, spokes = [];
    const STEP = 170, FLY = 620;     // ms between signals, ms per flight: fast, many in the air at once
    let routes = [];                  // finished routes keep carrying light
    const mono = '12px ui-monospace,"SF Mono",Menlo,Consolas,monospace';

    const clear = c => { const m = /^#([0-9a-f]{6})$/i.exec(c); if (!m) return 'rgba(0,0,0,0)'; const n = parseInt(m[1], 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',0)'; };
    const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967295; };

    function colors() {
      const cs = getComputedStyle(document.documentElement), v = n => cs.getPropertyValue(n).trim();
      const dark = document.documentElement.dataset.theme === 'dark';
      C = { ink: v('--ink'), muted: v('--muted'), line: v('--line'), ground: v('--ground'), rail: v('--rail'),
            inc: dark ? '#f0c233' : '#d99a00', sig: dark ? '#5cc28f' : '#0b7a4b', core: '#ff5a5f', leg: dark ? '#7b8cff' : '#3f51d8', dark };
    }

    function layout() {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = Math.round(W < 900 ? W * 0.82 : Math.max(380, Math.min(460, W * 0.36))); // wide screens get a flat band
      cv.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const narrow = W < 520;
      L.listW = W * (narrow ? 0.44 : W > 1000 ? 0.36 : 0.4);
      L.rowH = narrow ? 20 : 22;
      L.boxX = W * (narrow ? 0.7 : W > 1000 ? 0.79 : 0.73); L.boxW = W - L.boxX;
      L.gap = 8; L.boxH = (H - L.gap * (dirs.length - 1)) / dirs.length;
      L.cx = W > 1000 ? W * 0.05 : -W * 0.32; L.cy = H / 2; L.R = W > 1000 ? W * 0.6 : W * 0.9;
      L.a0 = Math.asin((-H / 2 + 14) / L.R); L.a1 = Math.asin((H / 2 - 14) / L.R);
      spokes = Array.from({ length: 96 }, (_, i) => ({ a: L.a0 + (L.a1 - L.a0) * (i + 0.5) / 96, len: 0, color: null }));
    }

    const arcPt = (a, dr = 0) => [L.cx + (L.R + dr) * Math.cos(a), L.cy + (L.R + dr) * Math.sin(a)];
    const rowY = i => 10 + i * L.rowH - scroll + L.rowH / 2;
    const boxY = d => d * (L.boxH + L.gap);
    const dirIndex = r => Math.max(0, dirs.indexOf((r.direction_ids || [])[0]));

    function reset() {
      counts = {}; flash = {}; flights = []; cur = -1;
      for (const s of spokes) { s.len = 0; s.color = null; }
    }

    function launch(i, now) {
      const rec = records[i], d = dirIndex(rec.r);
      const a = L.a0 + (L.a1 - L.a0) * (0.1 + 0.8 * hash(rec.r.id || rec.r.title));
      flights.push({ i, d, a, t0: now, color: rec.inc ? C.inc : C.sig, done: false });
      onFocus(i, true);
    }

    // spider: a small outlined body on long, thin, jointed legs. Feet snap to grid cells
    // (words in the list, crossings in the web), one leg at a time, and box what they touch.
    const spider = { x: 0, y: 0, legs: [], next: 0 };
    let cells = [], marks = [];
    const LEGS = [ // direction in degrees, reach as a share of the canvas width
      [200, .17], [168, .2], [140, .15], [222, .14],
      [-28, .2], [6, .22], [34, .19], [-58, .15]
    ];
    function initSpider() {
      spider.x = L.listW * 0.8; spider.y = 40; spider.next = 0;
      spider.legs = LEGS.map(([deg, share]) => {
        const a = deg * Math.PI / 180, reach = Math.max(60, W * share);
        return { a, reach, foot: null, from: null, t: 1, left: Math.cos(a) < 0 };
      });
      marks = [];
    }
    const footXY = f => f.kind === 'text' ? [f.x, rowY(f.row)] : arcPt(f.a, f.dr);
    function pickCell(g) {
      const ix = spider.x + Math.cos(g.a) * g.reach, iy = spider.y + Math.sin(g.a) * g.reach;
      let best = null, bd = Infinity;
      if (g.left) {
        for (const c of cells) { const d = Math.hypot(c.cx - ix, rowY(c.row) - iy); if (d < bd) bd = d, best = { kind: 'text', row: c.row, x: c.cx, cell: c }; }
      } else {
        for (const s of spokes) for (const dr of [-70, -34, 0, 26]) { const [x, y] = arcPt(s.a, dr), d = Math.hypot(x - ix, y - iy); if (d < bd) bd = d, best = { kind: 'web', a: s.a, dr }; }
      }
      return best;
    }
    function stepSpider(tx, ty, t, dt) {
      const k = Math.min(1, dt / 70);
      spider.x += (tx - spider.x) * k; spider.y += (ty - spider.y) * k;
      // legs move one after another, alternating sides, like walking across a grid
      let moving = spider.legs.filter(g => g.t < 1).length;
      for (let n = 0; n < spider.legs.length && moving < 2; n++) {
        const g = spider.legs[spider.next];
        spider.next = (spider.next + 3) % spider.legs.length;
        if (g.t < 1) continue;
        const [fx, fy] = g.foot ? footXY(g.foot) : [spider.x, spider.y];
        const ix = spider.x + Math.cos(g.a) * g.reach, iy = spider.y + Math.sin(g.a) * g.reach;
        if (!g.foot || Math.hypot(fx - ix, fy - iy) > g.reach * 0.38 || fy < -10 || fy > H + 10) {
          const to = pickCell(g); if (!to) continue;
          g.from = [fx, fy]; g.to = to; g.t = 0; moving++;
          if (g.mark) g.mark.off = t;
        }
      }
      for (const g of spider.legs) if (g.t < 1) {
        g.t = Math.min(1, g.t + dt / 85);
        if (g.t >= 1) {
          g.foot = g.to;
          if (g.to.kind === 'text') { g.mark = { row: g.to.row, x: g.to.cell.x, w: g.to.cell.w, on: t, off: 0 }; marks.push(g.mark); }
          else g.mark = null;
        }
      }
      marks = marks.filter(m => !m.off || t - m.off < 500).slice(-24);
    }
    function legPoints(g) {
      let foot;
      if (g.t < 1) {
        const to = footXY(g.to), e = g.t * g.t * (3 - 2 * g.t), lift = Math.sin(g.t * Math.PI) * 14;
        foot = [g.from[0] + (to[0] - g.from[0]) * e, g.from[1] + (to[1] - g.from[1]) * e - lift];
      } else foot = g.foot ? footXY(g.foot) : [spider.x, spider.y];
      const dx = foot[0] - spider.x, dy = foot[1] - spider.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      const up = (g.left ? -1 : 1) * Math.min(26, len * 0.28); // knees bend upward and outward
      const j1 = [spider.x + dx * 0.32 + nx * up, spider.y + dy * 0.32 + ny * up - len * 0.12];
      const j2 = [spider.x + dx * 0.68 + nx * up * 0.55, spider.y + dy * 0.68 + ny * up * 0.55 - len * 0.06];
      return [[spider.x, spider.y], j1, j2, foot];
    }
    function drawSpider(t) {
      // boxes around the cells the feet are holding
      ctx.lineWidth = 1;
      for (const m of marks) {
        const y = rowY(m.row), a = m.off ? Math.max(0, 1 - (t - m.off) / 500) : Math.min(1, (t - m.on) / 120);
        ctx.globalAlpha = a; ctx.strokeStyle = C.leg; ctx.strokeRect(m.x + 0.5, y - L.rowH / 2 + 2.5, m.w, L.rowH - 5);
        ctx.globalAlpha = a * 0.12; ctx.fillStyle = C.leg; ctx.fillRect(m.x, y - L.rowH / 2 + 2, m.w, L.rowH - 4);
      }
      ctx.globalAlpha = 1;
      for (const g of spider.legs) {
        const pts = legPoints(g);
        ctx.strokeStyle = C.leg; ctx.lineWidth = 1.4;
        ctx.beginPath(); pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
        ctx.fillStyle = C.leg;
        for (const p of pts.slice(1)) { ctx.beginPath(); ctx.arc(p[0], p[1], 2.6, 0, 6.283); ctx.fill(); }
      }
      const beat = Math.max(0, Math.sin(t / 90)) ** 8 + 0.6 * Math.max(0, Math.sin(t / 90 - 0.9)) ** 8;
      ctx.save(); ctx.translate(spider.x, spider.y); ctx.rotate(0.28);
      ctx.fillStyle = C.ground; ctx.strokeStyle = C.core; ctx.lineWidth = 1.6;
      ctx.fillRect(-6, -11, 12, 22); ctx.strokeRect(-6, -11, 12, 22); ctx.strokeRect(-3.5, -8.5, 7, 17);
      ctx.restore();
      ctx.fillStyle = C.core; ctx.beginPath(); ctx.arc(spider.x, spider.y, 2 + beat * 1.4, 0, 6.283); ctx.fill();
    }

    const quad = (p0, c, p1, u) => [(1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]];
    function flightPath(f) {
      const p0 = [L.listW + 4, rowY(f.i)], p1 = arcPt(f.a), p2 = [L.boxX, boxY(f.d) + L.boxH / 2];
      const c1 = [(p0[0] + p1[0]) / 2, Math.min(p0[1], p1[1]) - 30], c2 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 - 18];
      return u => u < 0.55 ? quad(p0, c1, p1, u / 0.55) : quad(p1, c2, p2, (u - 0.55) / 0.45);
    }

    function fit(s, w) {
      if (ctx.measureText(s).width <= w) return s;
      let lo = 0, hi = s.length;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; ctx.measureText(s.slice(0, m) + '…').width <= w ? lo = m : hi = m - 1; }
      return s.slice(0, lo) + '…';
    }

    let last = 0;
    let lastPaint = 0;
    function draw(t, once) {
      lastPaint = performance.now();
      const dt = last ? Math.min(64, t - last) : 16; last = t;
      if (++frame % 40 === 0) colors();
      if (!still) {
        if (cur < 0 && !startAt) startAt = t + 400;
        if (startAt && t >= startAt) {
          if (cur + 1 < records.length) { cur++; launch(cur, t); startAt = t + STEP; }
          else { startAt = t + 900; cur = records.length; }
        }
        if (cur >= records.length && t >= startAt - 10) { reset(); startAt = t + 300; }
      }
      const focus = pinned >= 0 ? pinned : Math.min(cur, records.length - 1);
      // keep the active row a third of the way down
      const target = Math.max(0, Math.min(records.length * L.rowH + 20 - H, focus * L.rowH - H * 0.33));
      scroll += (target - scroll) * Math.min(1, dt / 90);

      ctx.clearRect(0, 0, W, H);

      // web: concentric arcs and a fan of spokes
      ctx.strokeStyle = C.line; ctx.lineWidth = 1;
      for (const dr of [-70, -34, 0, 26]) { ctx.beginPath(); ctx.arc(L.cx, L.cy, L.R + dr, L.a0 - 0.02, L.a1 + 0.02); ctx.stroke(); }
      const scan = L.a0 + (L.a1 - L.a0) * (0.5 + 0.5 * Math.sin(t / 650));
      spokes.forEach((s, k) => {
        const a = s.a + 0.004 * Math.sin(t / 1300 + k * 0.7);
        const near = Math.max(0, 1 - Math.abs(a - scan) / 0.06);
        const grow = s.len + (s.color ? 6 * Math.sin(t / 500 + k) : 0) + near * 30;
        const [x0, y0] = arcPt(a, -70), [x1, y1] = arcPt(a, 26 + grow);
        ctx.strokeStyle = near > 0.3 && !s.color ? C.core : (s.color || C.line);
        ctx.globalAlpha = s.color ? 0.9 : 0.55 + near * 0.45; ctx.lineWidth = s.color || near > 0.3 ? 1.6 : 1;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      // scanning beam along the web
      { const [bx, by] = arcPt(scan, -18); const g = ctx.createRadialGradient(bx, by, 0, bx, by, 46);
        g.addColorStop(0, 'rgba(255,90,95,.28)'); g.addColorStop(1, 'rgba(255,90,95,0)'); ctx.fillStyle = g; ctx.fillRect(bx - 46, by - 46, 92, 92); }
      // finished routes keep a faint thread and light running along it
      for (const r of routes) {
        const path = flightPath(r), age = t - r.born, life = Math.min(1, age / 300) * Math.max(0, 1 - age / 9000);
        if (life <= 0) continue;
        ctx.strokeStyle = r.color; ctx.globalAlpha = 0.16 * life; ctx.lineWidth = 1;
        ctx.beginPath(); for (let k = 12; k <= 40; k++) { const p = path(k / 40); k > 12 ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke();
        ctx.fillStyle = r.color;
        for (let q = 0; q < 2; q++) {
          const u = 0.3 + 0.7 * (((t / 900 + r.seed + q * 0.5) % 1)), p = path(u);
          ctx.globalAlpha = 0.85 * life; ctx.beginPath(); ctx.arc(p[0], p[1], 1.8, 0, 6.283); ctx.fill();
        }
      }
      routes = routes.filter(r => t - r.born < 9000).slice(-60);
      ctx.globalAlpha = 1;

      // list of signals
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, L.listW + 2, H); ctx.clip();
      ctx.font = mono; ctx.textBaseline = 'middle';
      cells = [];
      records.forEach((rec, i) => {
        const y = rowY(i); if (y < -L.rowH || y > H + L.rowH) return;
        const r = rec.r, col = rec.inc ? C.inc : C.sig, active = i === focus, past = i <= cur;
        const date = r.date.slice(5).replace('-', '/') + ' ', dw = ctx.measureText(date).width;
        const text = fit(opts.titleOf ? opts.titleOf(r) : r.title, L.listW - dw - 10);
        if (active) { ctx.fillStyle = col; ctx.fillRect(dw - 3, y - L.rowH / 2 + 2, ctx.measureText(text).width + 8, L.rowH - 4); }
        ctx.fillStyle = C.muted; ctx.fillText(date, 0, y);
        ctx.fillStyle = active ? (rec.inc ? '#171b19' : '#fff') : past ? C.ink : C.muted;
        ctx.globalAlpha = active || past ? 1 : 0.55; ctx.fillText(text, dw + 1, y); ctx.globalAlpha = 1;
        if (past && !active) { ctx.fillStyle = col; ctx.fillRect(dw + 1, y + 7, Math.min(28, ctx.measureText(text).width), 2); }
        cells.push({ row: i, x: -2, w: ctx.measureText(date.trim()).width + 4, cx: ctx.measureText(date.trim()).width / 2 });
        let cx = dw + 1;
        for (const word of text.split(' ')) { const ww = ctx.measureText(word).width; if (ww > 6) cells.push({ row: i, x: cx - 2, w: ww + 4, cx: cx + ww / 2 }); cx += ww + ctx.measureText(' ').width; }
      });
      const fade = (y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, y0, L.listW + 2, y1 - y0); };
      const g0 = clear(C.ground); fade(0, 26, C.ground, g0); fade(H - 26, H, g0, C.ground);
      ctx.restore();

      // flights
      for (const f of flights) {
        const age = (still ? FLY : t - f.t0), u = Math.min(1, age / FLY), path = flightPath(f);
        const alpha = u < 1 ? 1 : Math.max(0, 1 - (age - FLY) / 800);
        if (alpha <= 0) continue;
        ctx.strokeStyle = f.color; ctx.lineWidth = u < 1 ? 1.8 : 1.1; ctx.globalAlpha = alpha * (u < 1 ? 1 : 0.55);
        ctx.beginPath(); for (let k = 0; k <= 40; k++) { const p = path(u * k / 40); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke();
        if (u < 1) { const p = path(u); ctx.fillStyle = f.color; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, 6.283); ctx.fill(); }
        if (u >= 1 && !f.done) {
          f.done = true; counts[f.d] = (counts[f.d] || 0) + 1; flash[f.d] = t;
          routes.push({ i: f.i, d: f.d, a: f.a, color: f.color, born: t, seed: Math.random() });
          const s = spokes.reduce((b, s) => Math.abs(s.a - f.a) < Math.abs(b.a - f.a) ? s : b);
          s.color = f.color; s.len = Math.min(70, s.len + 22);
        }
      }
      ctx.globalAlpha = 1;
      flights = flights.filter(f => t - f.t0 < FLY + 900 || !f.done);

      // direction boxes
      dirs.forEach((id, d) => {
        const y = boxY(d), x = L.boxX, fl = !still && flash[d] ? Math.max(0, 1 - (t - flash[d]) / 350) : 0;
        ctx.fillStyle = C.ground; ctx.fillRect(x, y, L.boxW, L.boxH);
        if (fl) { ctx.globalAlpha = 0.18 * fl; ctx.fillStyle = C.sig; ctx.fillRect(x, y, L.boxW, L.boxH); ctx.globalAlpha = 1; }
        ctx.strokeStyle = d === hoverBox || fl ? C.ink : C.line; ctx.lineWidth = d === hoverBox || fl > 0.2 ? 1.6 : 1;
        ctx.strokeRect(x + 0.5, y + 0.5, L.boxW - 1, L.boxH - 1);
        ctx.fillStyle = C.muted; ctx.font = '11.5px ' + getComputedStyle(document.body).fontFamily; ctx.textBaseline = 'top';
        ctx.fillText(fit(dirName(id), L.boxW - 14), x + 8, y + 7);
        const n = counts[d] || 0;
        ctx.fillStyle = n ? C.ink : C.line; ctx.font = '800 ' + Math.min(30, L.boxH * 0.42) + 'px ' + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(String(n), x + L.boxW - 8, y + L.boxH - 5); ctx.textAlign = 'left';
      });

      if (focus >= 0) stepSpider(L.listW * 0.8, rowY(focus) - L.rowH * 0.6, t, dt);
      drawSpider(t);

      if (!still && !once) requestAnimationFrame(draw);
    }

    // a still frame: everything already routed
    function settle() {
      reset();
      records.forEach((rec, i) => { cur = i; launch(i, 0); });
      draw(1);
    }

    function hit(e) {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < L.listW + 4) { const i = Math.round((y + scroll - 10 - L.rowH / 2) / L.rowH); return i >= 0 && i < records.length ? { row: i } : null; }
      if (x >= L.boxX) { const d = Math.floor(y / (L.boxH + L.gap)); return d >= 0 && d < dirs.length ? { box: d } : null; }
      return null;
    }
    cv.addEventListener('pointermove', e => {
      const h = hit(e); cv.style.cursor = h ? 'pointer' : 'default';
      hoverBox = h && h.box != null ? h.box : -1;
      if (h && h.row != null) { if (pinned !== h.row) { pinned = h.row; onFocus(h.row); } } else if (pinned >= 0) { pinned = -1; if (cur >= 0 && cur < records.length) onFocus(cur); }
      if (still) draw(1);
    });
    cv.addEventListener('pointerleave', () => { pinned = -1; hoverBox = -1; if (still) draw(1); });
    cv.addEventListener('click', e => {
      const h = hit(e); if (!h) return;
      if (h.row != null) { if (e.pointerType === 'touch' && pinned !== h.row) { pinned = h.row; onFocus(h.row); } else location.href = opts.href ? opts.href(records[h.row].r) : opts.link(records[h.row].r); }
      else location.href = 'directions.html?dir=' + encodeURIComponent(dirs[h.box]);
    });

    colors(); layout(); initSpider();
    // a resize clears the canvas, so paint again straight away instead of waiting for the next frame
    new ResizeObserver(() => { const w = cv.getBoundingClientRect().width; if (Math.abs(w - W) > 1) { layout(); initSpider(); draw(performance.now(), true); } }).observe(cv);
    // keep painting even where animation frames are held back
    setInterval(() => { if (document.visibilityState === 'visible' && performance.now() - lastPaint > 400) draw(performance.now(), true); }, 250);
    document.addEventListener('click', e => { if (e.target.closest('#themebtn')) { colors(); draw(performance.now(), true); } });
    draw(performance.now(), true); requestAnimationFrame(draw);

    return {
      setRecords(next) { records = next; reset(); pinned = -1; scroll = 0; routes = []; startAt = 0; },
      focusPoint(i) { // where the card should sit for record i
        const y = Math.max(0, Math.min(H, rowY(i)));
        return { x: L.listW * 0.15, y: y + L.rowH, below: y < H * 0.55, W, H };
      }
    };
  }

  window.mountSignalWeb = mountSignalWeb;
})();
