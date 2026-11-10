/* Signal web: recent safety signals are picked off a list by a small mechanical spider,
   carried along fine transmission lines and routed into their research direction.
   Visual idea after Prompt Spider UI by Kirito14IT (MIT); this is an independent implementation. */
(() => {
  'use strict';

  function mountSignalWeb(cv, opts) {
    let { records } = opts;
    const { dirs, dirName, T, onFocus } = opts;
    const ctx = cv.getContext('2d');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let still = motion.matches;
    let W = 0, H = 0, C = {}, frame = 0;
    let L = {};                       // layout
    let cur = 0, pinned = -1, hoverBox = -1;
    let flights = [], counts = {}, flash = {}, pending = [];
    const MOTION_SPEED = 4.5;
    const STEP = 420 / MOTION_SPEED, FLY = 1800 / MOTION_SPEED, SCAN_STEP = 1400 / MOTION_SPEED;
    const TRAIL = 4200 / MOTION_SPEED, FADE = 800 / MOTION_SPEED;
    let scanIndex = 0, nextScan = 0, animationFrame = 0;
    let hovering = false, focusWithin = false, touching = false, manualUntil = 0;
    let scrollTarget = 0, pointerY = null, lastPointerType = '', touchPreviewId = null;
    let highlighted = -1, rowNodes = [], rebuilding = false;
    let routes = [];                  // finished routes keep carrying light
    const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967295; };

    // The browser owns scrolling, text selection and keyboard focus. The canvas shares
    // its scroll offset so the creature and transmission lines stay attached to each row.
    const stage = document.createElement('div'); stage.className = 'crawler-stage';
    cv.parentNode.insertBefore(stage, cv); stage.appendChild(cv);
    const viewport = document.createElement('div'); viewport.className = 'crawler-history';
    viewport.tabIndex = 0; viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', T('安全记录。滚动浏览，方向键选择，回车打开。', 'Safety records. Scroll to browse, use arrow keys to select, and Enter to open.'));
    const list = document.createElement('ol'); list.className = 'crawler-history-list';
    const position = document.createElement('div'); position.className = 'crawler-history-position';
    position.setAttribute('aria-live', 'off');
    viewport.appendChild(list); stage.append(viewport, position);
    const isReading = t => hovering || focusWithin || touching || t < manualUntil;
    const maxScroll = () => Math.max(0, records.length * L.rowH + 20 - L.listH);
    const clampRow = i => Math.max(0, Math.min(records.length - 1, i));
    const recordHref = r => opts.href ? opts.href(r) : opts.link(r);

    function renderRows() {
      rebuilding = true;
      const fragment = document.createDocumentFragment();
      rowNodes = records.map(({ r, inc }, i) => {
        const item = document.createElement('li');
        const link = document.createElement('a'); link.className = 'crawler-history-row';
        link.dataset.index = String(i); link.dataset.recordId = r.id;
        link.href = recordHref(r); link.tabIndex = -1;
        link.style.setProperty('--row-color', inc ? C.inc : C.sig);
        const title = String(opts.titleOf ? opts.titleOf(r) : r.title);
        link.title = r.date + ' · ' + title;
        link.setAttribute('aria-label', link.title);
        const date = document.createElement('time'); date.className = 'crawler-record-date';
        date.dateTime = r.date; date.textContent = r.date.slice(5).replace('-', '/');
        const text = document.createElement('span'); text.className = 'crawler-record-title'; text.textContent = title;
        link.append(date, text); item.appendChild(link); fragment.appendChild(item);
        return link;
      });
      if (!records.length) {
        const empty = document.createElement('li'); empty.className = 'crawler-history-empty';
        empty.textContent = T('暂无记录', 'No records'); fragment.appendChild(empty);
      }
      list.replaceChildren(fragment); highlighted = -1;
      rebuilding = false;
    }

    function syncHistory(focus, t) {
      if (highlighted !== focus) {
        if (rowNodes[highlighted]) { rowNodes[highlighted].classList.remove('is-current'); rowNodes[highlighted].removeAttribute('aria-current'); rowNodes[highlighted].tabIndex = -1; }
        if (rowNodes[focus]) { rowNodes[focus].classList.add('is-current'); rowNodes[focus].setAttribute('aria-current', 'true'); rowNodes[focus].tabIndex = 0; }
        highlighted = focus;
      }
      const first = records.length ? clampRow(Math.floor((viewport.scrollTop - 10) / L.rowH)) + 1 : 0;
      const end = Math.min(records.length, Math.max(first, Math.ceil((viewport.scrollTop + L.listH - 10) / L.rowH)));
      const range = first + '–' + end + ' / ' + records.length;
      const mode = still ? T('手动浏览', 'Manual') : isReading(t) ? T('阅读中', 'Reading') : T('自动浏览', 'Auto');
      position.textContent = range + (W < 520 ? '' : ' · ' + mode);
      position.setAttribute('aria-label', range + ' · ' + mode);
    }

    function pauseManual() {
      manualUntil = performance.now() + 4000;
      scrollTarget = viewport.scrollTop;
    }

    function selectReading(i) {
      if (!records[i]) return;
      if (pinned !== i) { pinned = i; cur = i; onFocus(i); }
      scanIndex = (i + 1) % records.length;
    }

    function revealRow(i, immediate = false) {
      const top = 10 + i * L.rowH, bottom = top + L.rowH;
      if (top < viewport.scrollTop + 8 || bottom > viewport.scrollTop + L.listH - 8)
        scrollTarget = Math.max(0, Math.min(maxScroll(), top - L.listH * .38));
      if (immediate) viewport.scrollTop = scrollTarget;
    }

    function colors() {
      C = { ink: '#c6d7d0', muted: '#718d80', line: '#24382f', ground: '#09120f',
        inc: '#c7ac55', sig: '#58bc91', core: '#dd7299', leg: '#8bcabc' };
    }

    function layout() {
      const oldRowH = L.rowH;
      const first = oldRowH ? clampRow(Math.floor((viewport.scrollTop - 10) / oldRowH)) : 0;
      const anchorOffset = oldRowH ? 10 + first * oldRowH - viewport.scrollTop : 10;
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      W = Math.max(1, r.width);
      H = W < 520 ? 316 : W < 900 ? 370 : 420;
      cv.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      L.listW = W * (W < 520 ? 0.36 : 0.32);
      L.rowH = W < 520 ? 24 : 26;
      L.listH = H - 24;
      L.boxX = W * (W < 520 ? 0.79 : 0.84); L.boxW = W - L.boxX;
      L.gap = 8; L.boxH = (H - L.gap * (dirs.length - 1)) / dirs.length;
      L.collectX = L.boxX - (W < 520 ? 12 : 26);
      L.bend = Math.min(40, (L.collectX - L.listW) * .17);
      L.a0 = 0; L.a1 = 1;
      stage.classList.toggle('is-narrow', W < 520);
      stage.style.setProperty('--crawler-row-height', L.rowH + 'px');
      viewport.style.width = L.listW + 'px'; viewport.style.height = L.listH + 'px';
      position.style.width = L.listW + 'px'; position.style.top = (L.listH + 3) + 'px';
      viewport.scrollTop = Math.max(0, Math.min(10 + first * L.rowH - anchorOffset, maxScroll()));
      scrollTarget = viewport.scrollTop;
    }

    // A receiving rail, bowed gently toward the incoming stream.
    const arcPt = (a, dr = 0) => [L.collectX - Math.sin(a * Math.PI) * L.bend + dr, 14 + a * (H - 28)];
    const rowY = i => 10 + i * L.rowH + L.rowH / 2 - viewport.scrollTop;
    const boxY = d => d * (L.boxH + L.gap);
    const dirIndex = r => Math.max(0, dirs.indexOf((r.direction_ids || [])[0]));

    function countRecords(list = records) {
      const next = {};
      for (const record of list) {
        const direction = dirIndex(record.r);
        next[direction] = (next[direction] || 0) + 1;
      }
      return next;
    }

    function launch(i, now, changeFocus = true) {
      const rec = records[i], d = dirIndex(rec.r);
      const a = L.a0 + (L.a1 - L.a0) * (0.1 + 0.8 * hash(rec.r.id || rec.r.title));
      flights.push({ i, d, a, t0: now, color: rec.inc ? C.inc : C.sig, done: false });
      if (changeFocus && !isReading(now)) { cur = i; onFocus(i, true); }
    }

    // Long, jointed mechanical legs keep the crawler recognisable while the DOM list
    // remains responsible for scrolling, selection and accessibility.
    const crawler = { x: 0, y: 0, tilt: 0, legs: [], next: 0, lastStep: 0 };
    const LEG_PLAN = [
      [-1, -8, -34, .76], [-1, -4, -13, .98], [-1, 4, 14, .9], [-1, 8, 35, .72],
      [1, -8, -35, .8], [1, -4, -14, 1], [1, 4, 13, .92], [1, 8, 34, .74]
    ];
    const STEP_ORDER = [0, 5, 2, 7, 4, 1, 6, 3];

    function idealFoot(leg, t) {
      const baseReach = Math.max(38, Math.min(78, W * (W < 520 ? .13 : .085)));
      const idle = still ? 0 : Math.sin(t / 760 + leg.phase) * 2.2;
      return [
        Math.max(5, Math.min(W - 5, crawler.x + leg.side * baseReach * leg.reach)),
        Math.max(6, Math.min(H - 6, crawler.y + leg.offsetY + idle))
      ];
    }

    function initCrawler() {
      crawler.x = L.listW + 7; crawler.y = 48; crawler.tilt = 0;
      crawler.next = 0; crawler.lastStep = 0;
      crawler.legs = LEG_PLAN.map(([side, attachY, offsetY, reach], i) => {
        const leg = { side, attachY, offsetY, reach, phase: i * .83, foot: null, from: null, to: null, step: 1, moved: 0 };
        leg.foot = idealFoot(leg, 0);
        return leg;
      });
    }

    function stepCrawler(tx, ty, t, dt) {
      const targetY = Math.max(34, Math.min(H - 34, ty));
      const k = still ? 1 : 1 - Math.exp(-dt / (240 / MOTION_SPEED)), dy = targetY - crawler.y;
      crawler.x += (tx - crawler.x) * k;
      crawler.y += dy * k;
      crawler.tilt += (Math.max(-.18, Math.min(.18, dy / 100)) - crawler.tilt) * k;

      for (const leg of crawler.legs) {
        if (leg.step >= 1) continue;
        leg.step = Math.min(1, leg.step + dt / 150);
        const eased = leg.step * leg.step * (3 - 2 * leg.step);
        const lift = Math.sin(leg.step * Math.PI) * 9;
        leg.foot = [
          leg.from[0] + (leg.to[0] - leg.from[0]) * eased,
          leg.from[1] + (leg.to[1] - leg.from[1]) * eased - lift
        ];
        if (leg.step === 1) leg.foot = leg.to;
      }

      if (still) {
        for (const leg of crawler.legs) leg.foot = idealFoot(leg, t);
        return;
      }

      const moving = crawler.legs.filter(leg => leg.step < 1).length;
      if (moving >= 2 || t - crawler.lastStep < 500) return;
      for (let attempt = 0; attempt < STEP_ORDER.length; attempt++) {
        const leg = crawler.legs[STEP_ORDER[crawler.next]];
        crawler.next = (crawler.next + 1) % STEP_ORDER.length;
        if (leg.step < 1) continue;
        const target = idealFoot(leg, t);
        const distance = Math.hypot(target[0] - leg.foot[0], target[1] - leg.foot[1]);
        if (distance < 7 && t - leg.moved < 2800) continue;
        leg.from = leg.foot.slice(); leg.to = target; leg.step = 0; leg.moved = t;
        crawler.lastStep = t;
        break;
      }
    }

    function bodyPoint(x, y) {
      const c = Math.cos(crawler.tilt), s = Math.sin(crawler.tilt);
      return [crawler.x + x * c - y * s, crawler.y + x * s + y * c];
    }

    function drawCrawler(t) {
      const scale = W < 520 ? .78 : 1;
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      for (const leg of crawler.legs) {
        const attach = bodyPoint(leg.side * 4.5 * scale, leg.attachY * scale);
        const foot = leg.foot || idealFoot(leg, t);
        const dx = foot[0] - attach[0], dy = foot[1] - attach[1];
        const kneeY = Math.sign(leg.offsetY || 1) * Math.min(15, 7 + Math.abs(leg.offsetY) * .2);
        const joint1 = [attach[0] + dx * .34, attach[1] + dy * .2 + kneeY];
        const joint2 = [attach[0] + dx * .7, attach[1] + dy * .64 + kneeY * .35];
        ctx.strokeStyle = C.leg; ctx.globalAlpha = .82; ctx.lineWidth = W < 520 ? 1.05 : 1.25;
        ctx.beginPath(); ctx.moveTo(attach[0], attach[1]);
        ctx.lineTo(joint1[0], joint1[1]); ctx.lineTo(joint2[0], joint2[1]); ctx.lineTo(foot[0], foot[1]); ctx.stroke();
        ctx.fillStyle = C.leg; ctx.globalAlpha = .9;
        for (const point of [joint1, joint2]) {
          ctx.beginPath(); ctx.arc(point[0], point[1], W < 520 ? 1.15 : 1.4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = .68;
        ctx.beginPath(); ctx.arc(foot[0], foot[1], 1.25, 0, Math.PI * 2); ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.translate(crawler.x, crawler.y); ctx.rotate(crawler.tilt); ctx.scale(scale, scale);
      const pulse = .5 + .5 * Math.sin(t / 250);
      ctx.fillStyle = C.ground; ctx.strokeStyle = '#8cd1bc'; ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.ellipse(0, 5, 7, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -8, 6, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#4d8f76'; ctx.globalAlpha = .72; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.ellipse(0, 5, 4.3, 7.1, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = '#c9e9de';
      for (const eyeX of [-2.1, 2.1]) { ctx.beginPath(); ctx.arc(eyeX, -9.3, 1.05, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = C.core; ctx.globalAlpha = .72 + pulse * .28;
      ctx.beginPath(); ctx.arc(0, 4.5, 1.6 + pulse * .8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    const cubic = (p0, c1, c2, p1, u) => {
      const v = 1 - u;
      return [v*v*v*p0[0] + 3*v*v*u*c1[0] + 3*v*u*u*c2[0] + u*u*u*p1[0],
        v*v*v*p0[1] + 3*v*v*u*c1[1] + 3*v*u*u*c2[1] + u*u*u*p1[1]];
    };
    function transmission(y, a, u) {
      const p0 = [L.listW + 5, y], p1 = arcPt(a), width = p1[0] - p0[0];
      return cubic(p0, [p0[0] + width * .33, y], [p1[0] - width * .28, p1[1]], p1, u);
    }
    function flightPath(f) {
      const y = Math.max(12, Math.min(L.listH - 12, rowY(f.i))), p1 = arcPt(f.a);
      const p2 = [L.boxX, boxY(f.d) + L.boxH / 2];
      return u => u < .88 ? transmission(y, f.a, u / .88)
        : cubic(p1, [p1[0] + 12, p1[1]], [p2[0] - 12, p2[1]], p2, (u - .88) / .12);
    }
    function drawTransmissionBed(t) {
      // Calm, low-contrast curves give the moving packets a readable route.
      const n = W < 520 ? 22 : 44;
      for (let i = 0; i < n; i++) {
        const y = 16 + (i + .5) / n * (H - 32), a = .03 + hash('port-' + (i * i + 73)) * .94;
        ctx.strokeStyle = i % 7 === 0 ? C.core : i % 3 === 0 ? C.inc : C.sig;
        ctx.globalAlpha = i % 7 === 0 ? .22 : .18; ctx.lineWidth = .65;
        ctx.beginPath();
        for (let k = 0; k <= 28; k++) {
          const p = transmission(y + Math.sin(t / 2400 + i) * 2, a, k / 28);
          k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = .8; ctx.strokeStyle = '#4f675c'; ctx.lineWidth = .7;
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) { const p = arcPt(k / 40); k ? ctx.lineTo(...p) : ctx.moveTo(...p); }
      ctx.stroke();
      for (let k = 0; k <= 36; k++) {
        const p = arcPt(k / 36); ctx.globalAlpha = .35;
        ctx.beginPath(); ctx.moveTo(p[0] - 5, p[1]); ctx.lineTo(p[0] - 1, p[1]); ctx.stroke();
      }
      const scan = .15 + .7 * (.5 + .5 * Math.sin(t / 2600));
      ctx.strokeStyle = '#b5d4c6'; ctx.globalAlpha = .8; ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let k = 0; k <= 8; k++) { const p = arcPt(scan + k * .003); k ? ctx.lineTo(...p) : ctx.moveTo(...p); }
      ctx.stroke(); ctx.globalAlpha = 1;
    }

    function fit(s, w) {
      if (ctx.measureText(s).width <= w) return s;
      let lo = 0, hi = s.length;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; ctx.measureText(s.slice(0, m) + '…').width <= w ? lo = m : hi = m - 1; }
      return s.slice(0, lo) + '…';
    }

    let last = 0;
    let lastPaint = 0;
    function draw(t) {
      lastPaint = performance.now();
      const dt = last ? Math.min(64, t - last) : 16; last = t;
      if (++frame % 40 === 0) colors();
      const reading = isReading(t);
      if (!reading && pinned >= 0) pinned = -1;
      if (!reading && !still) {
        const delta = scrollTarget - viewport.scrollTop;
        if (Math.abs(delta) > .5) viewport.scrollTop += delta * (1 - Math.exp(-dt / 65));
        else if (delta) viewport.scrollTop = scrollTarget;
      }
      // Scanning traverses every record. Reading pauses its position, not the lines.
      while (pending.length && pending[0].at <= t) {
        const item = pending.shift();
        if (!still) launch(item.i, t, false);
        nextScan = t + SCAN_STEP;
      }
      if (!still && records.length && !pending.length && t >= nextScan) {
        if (reading) {
          const visibleRow = clampRow(Math.floor((viewport.scrollTop + 10) / L.rowH));
          launch(pinned >= 0 ? pinned : visibleRow, t);
        } else {
          scanIndex = clampRow(scanIndex);
          if (scanIndex === 0 && cur === records.length - 1) viewport.scrollTop = scrollTarget = 0;
          revealRow(scanIndex);
          launch(scanIndex, t);
          scanIndex = (scanIndex + 1) % records.length;
        }
        nextScan = t + SCAN_STEP;
      }
      const focus = pinned >= 0 ? pinned : Math.min(cur, records.length - 1);
      const visualTime = still ? 0 : t * MOTION_SPEED;

      ctx.clearRect(0, 0, W, H);

      drawTransmissionBed(visualTime);
      // Completed routes fade, without accumulating a bright web.
      for (const r of routes) {
        const path = flightPath(r), life = Math.max(0, 1 - (t - r.born) / TRAIL);
        ctx.strokeStyle = r.color; ctx.globalAlpha = .12 * life; ctx.lineWidth = .65;
        ctx.beginPath();
        for (let k = 0; k <= 32; k++) { const p = path(k / 32); k ? ctx.lineTo(...p) : ctx.moveTo(...p); }
        ctx.stroke();
      }
      routes = routes.filter(r => t - r.born < TRAIL).slice(-12);
      ctx.globalAlpha = 1;

      syncHistory(focus, t);

      // flights
      for (const f of flights) {
        const age = (still ? FLY : t - f.t0), u = Math.min(1, age / FLY), path = flightPath(f);
        const alpha = u < 1 ? 1 : Math.max(0, 1 - (age - FLY) / FADE);
        if (alpha <= 0) continue;
        ctx.strokeStyle = f.color; ctx.lineWidth = .8; ctx.globalAlpha = alpha * (u < 1 ? .42 : .16);
        ctx.beginPath(); for (let k = 0; k <= 40; k++) { const p = path(u * k / 40); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke();
        if (u < 1) {
          const p = path(u); ctx.fillStyle = f.color; ctx.globalAlpha = .85;
          ctx.beginPath(); ctx.arc(p[0], p[1], 1.6, 0, 6.283); ctx.fill();
          if (W > 600 && f.i % 3 === 0 && u > .22 && u < .8) {
            const source = records[f.i]?.r;
            const label = ((source?.title || '').match(/\b(?:OpenAI|GPT|LLMs?|MCP|METR|Gemini|Claude|AI)\b/i) || [T('信号', 'signal')])[0];
            ctx.font = '9px ui-monospace,Menlo,monospace';
            const tw = ctx.measureText(label).width;
            ctx.fillStyle = C.core; ctx.fillRect(p[0] - tw / 2 - 3, p[1] - 7, tw + 6, 13);
            ctx.fillStyle = C.ground; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(label, p[0], p[1]); ctx.textAlign = 'left';
          }
        }
        if (u >= 1 && !f.done) {
          f.done = true; flash[f.d] = t;
          routes.push({ i: f.i, d: f.d, a: f.a, color: f.color, born: t, seed: Math.random() });
        }
      }
      ctx.globalAlpha = 1;
      flights = flights.filter(f => t - f.t0 < FLY + FADE);

      // direction boxes
      dirs.forEach((id, d) => {
        const y = boxY(d), x = L.boxX, fl = !still && flash[d] ? Math.max(0, 1 - (t - flash[d]) / (350 / MOTION_SPEED)) : 0;
        ctx.fillStyle = C.ground; ctx.fillRect(x, y, L.boxW, L.boxH);
        if (fl) { ctx.globalAlpha = 0.06 * fl; ctx.fillStyle = C.sig; ctx.fillRect(x, y, L.boxW, L.boxH); ctx.globalAlpha = 1; }
        ctx.strokeStyle = d === hoverBox ? '#79b69d' : C.line; ctx.lineWidth = .8;
        ctx.strokeRect(x + 0.5, y + 0.5, L.boxW - 1, L.boxH - 1);
        ctx.fillStyle = C.muted; ctx.font = '11.5px ' + getComputedStyle(document.body).fontFamily; ctx.textBaseline = 'top';
        ctx.fillText(fit(dirName(id), L.boxW - 14), x + 8, y + 7);
        const n = counts[d] || 0;
        ctx.fillStyle = n ? '#82c5a7' : C.line; ctx.font = '500 ' + Math.min(30, L.boxH * 0.42) + 'px ' + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(String(n), x + L.boxW - 8, y + L.boxH - 5); ctx.textAlign = 'left';
      });

      if (focus >= 0) stepCrawler(L.listW + 7 + Math.sin(visualTime / 2400) * 2, rowY(focus), visualTime, dt);
      drawCrawler(visualTime);

    }

    function animate(t) {
      animationFrame = 0;
      draw(t);
      if (!still) animationFrame = requestAnimationFrame(animate);
    }
    function resumeAnimation() {
      if (!still && !animationFrame) animationFrame = requestAnimationFrame(animate);
    }

    function hit(e) {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > W || y > H) return null;
      if (x < L.listW && y < L.listH) { const i = Math.floor((y + viewport.scrollTop - 10) / L.rowH); return i >= 0 && i < records.length ? { row: i } : null; }
      if (x >= L.boxX) { const d = Math.floor(y / (L.boxH + L.gap)); return d >= 0 && d < dirs.length ? { box: d } : null; }
      return null;
    }

    const eventRow = e => {
      const link = e.target.closest?.('.crawler-history-row');
      return link && viewport.contains(link) ? Number(link.dataset.index) : -1;
    };
    viewport.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'touch') { hovering = true; scrollTarget = viewport.scrollTop; }
    });
    viewport.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      hovering = true; pointerY = e.clientY - viewport.getBoundingClientRect().top;
      const i = eventRow(e); if (i >= 0) selectReading(i);
      draw(performance.now());
    });
    viewport.addEventListener('pointerleave', e => {
      if (e.pointerType === 'touch') return;
      hovering = false; pointerY = null;
      if (!focusWithin) pinned = -1;
      nextScan = performance.now() + SCAN_STEP;
      draw(performance.now());
    });
    viewport.addEventListener('pointerdown', e => {
      lastPointerType = e.pointerType; touching = e.pointerType === 'touch'; pauseManual();
    });
    const endTouch = () => { touching = false; pauseManual(); };
    viewport.addEventListener('pointerup', endTouch);
    viewport.addEventListener('pointercancel', endTouch);
    viewport.addEventListener('wheel', pauseManual, { passive: true });
    viewport.addEventListener('scroll', () => {
      const now = performance.now();
      if (isReading(now)) {
        manualUntil = now + 4000; scrollTarget = viewport.scrollTop;
        scanIndex = clampRow(Math.floor((viewport.scrollTop + L.listH * .38 - 10) / L.rowH));
        if (hovering && !focusWithin && pointerY != null) selectReading(clampRow(Math.floor((viewport.scrollTop + pointerY - 10) / L.rowH)));
      }
      syncHistory(pinned >= 0 ? pinned : cur, now);
      if (still) draw(now);
    }, { passive: true });
    viewport.addEventListener('focusin', e => {
      if (rebuilding) return;
      focusWithin = true; pauseManual();
      let i = eventRow(e);
      if (i < 0 && records.length) i = records[cur] && rowY(cur) >= 0 && rowY(cur) < L.listH
        ? cur : clampRow(Math.floor((viewport.scrollTop + 10) / L.rowH));
      if (i >= 0) selectReading(i);
      draw(performance.now());
    });
    viewport.addEventListener('focusout', e => {
      if (rebuilding || viewport.contains(e.relatedTarget)) return;
      focusWithin = false; if (!hovering) pinned = -1;
      pauseManual(); draw(performance.now());
    });
    viewport.addEventListener('keydown', e => {
      if (!records.length || e.altKey || e.ctrlKey || e.metaKey) return;
      let i = pinned >= 0 ? pinned : clampRow(Math.floor((viewport.scrollTop + 10) / L.rowH));
      const page = Math.max(1, Math.floor(L.listH / L.rowH) - 1);
      if (e.key === 'ArrowDown') i++;
      else if (e.key === 'ArrowUp') i--;
      else if (e.key === 'PageDown' || e.key === ' ') i += e.shiftKey ? -page : page;
      else if (e.key === 'PageUp') i -= page;
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = records.length - 1;
      else if (e.key === 'Enter') { e.preventDefault(); location.href = recordHref(records[i].r); return; }
      else return;
      e.preventDefault(); pauseManual(); i = clampRow(i); selectReading(i);
      revealRow(i, true); rowNodes[i].focus({ preventScroll: true });
      draw(performance.now());
    });
    viewport.addEventListener('click', e => {
      const i = eventRow(e); if (i < 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return;
      e.preventDefault(); pauseManual();
      const touch = e.pointerType === 'touch' || (!e.pointerType && lastPointerType === 'touch');
      const id = records[i].r.id;
      if (touch && touchPreviewId !== id) {
        touchPreviewId = id; selectReading(i); draw(performance.now());
      } else location.href = recordHref(records[i].r);
    });

    cv.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const h = hit(e); cv.style.cursor = h ? 'pointer' : 'default';
      hoverBox = h && h.box != null ? h.box : -1;
      if (h && h.row != null) { hovering = true; selectReading(h.row); }
      draw(performance.now());
    });
    cv.addEventListener('pointerleave', () => { hoverBox = -1; draw(performance.now()); });
    cv.addEventListener('click', e => {
      const h = hit(e); if (!h) return;
      if (h.row != null) { if (e.pointerType === 'touch' && pinned !== h.row) { pinned = h.row; onFocus(h.row); draw(performance.now()); } else location.href = opts.href ? opts.href(records[h.row].r) : opts.link(records[h.row].r); }
      else location.href = 'directions.html?dir=' + encodeURIComponent(dirs[h.box]);
    });

    colors(); layout(); renderRows(); initCrawler(); counts = countRecords(records);
    // a resize clears the canvas, so paint again straight away instead of waiting for the next frame
    new ResizeObserver(() => { const w = cv.getBoundingClientRect().width; if (Math.abs(w - W) > 1) { layout(); initCrawler(); draw(performance.now()); } }).observe(cv);
    // keep painting even where animation frames are held back
    setInterval(() => { if (!still && document.visibilityState === 'visible' && performance.now() - lastPaint > 400) draw(performance.now()); }, 250);
    document.addEventListener('click', e => { if (e.target.closest('#themebtn')) { colors(); draw(performance.now()); } });
    motion.addEventListener('change', event => {
      still = event.matches;
      if (still) {
        cancelAnimationFrame(animationFrame); animationFrame = 0;
        flights = []; pending = []; routes = [];
      }
      nextScan = performance.now(); last = 0;
      draw(performance.now());
      resumeAnimation();
    });
    draw(performance.now()); resumeAnimation();

    return {
      setRecords(next, options = {}) {
        const pinnedId = pinned >= 0 ? records[pinned]?.r.id : null;
        const currentId = records[cur]?.r.id;
        const scanId = records[scanIndex]?.r.id;
        const first = clampRow(Math.floor((viewport.scrollTop - 10) / L.rowH));
        const anchorId = records[first]?.r.id;
        const anchorOffset = 10 + first * L.rowH - viewport.scrollTop;
        const oldScroll = viewport.scrollTop;
        const focusedId = viewport.contains(document.activeElement) ? document.activeElement.dataset.recordId : null;
        const sameOrder = next.length === records.length && next.every((record, i) => record.r.id === records[i].r.id);
        const preserve = sameOrder || Object.prototype.hasOwnProperty.call(options, 'arrivalIds');
        const known = new Set(records.map(record => record.r.id));
        records = next;
        counts = countRecords(records);
        pinned = !preserve || pinnedId == null ? -1 : records.findIndex(record => record.r.id === pinnedId);
        cur = preserve ? Math.max(0, records.findIndex(record => record.r.id === currentId)) : 0;
        scanIndex = preserve ? Math.max(0, records.findIndex(record => record.r.id === scanId)) : 0;
        flights = []; routes = []; pending = []; flash = {};
        if (!preserve || !records.some(record => record.r.id === touchPreviewId)) touchPreviewId = null;
        const now = performance.now();
        renderRows();
        const anchor = preserve ? records.findIndex(record => record.r.id === anchorId) : -1;
        scrollTarget = Math.max(0, Math.min(maxScroll(), preserve ? (anchor >= 0 ? 10 + anchor * L.rowH - anchorOffset : oldScroll) : 0));
        viewport.scrollTop = scrollTarget;
        if (preserve && focusedId) {
          const focused = rowNodes.find(node => node.dataset.recordId === focusedId);
          if (focused) focused.focus({ preventScroll: true });
          else viewport.focus({ preventScroll: true });
        } else if (!preserve) {
          manualUntil = 0; focusWithin = viewport.contains(document.activeElement);
        }
        nextScan = now + SCAN_STEP;
        // Filtering is not an arrival. The snapshot adapter supplies new IDs explicitly.
        const arrivalIds = new Set(options.arrivalIds || []);
        const arrivals = records.map((record, i) => ({ record, i }))
          .filter(({ record }) => arrivalIds.has(record.r.id) && !known.has(record.r.id));
        for (const { record } of arrivals) flash[dirIndex(record.r)] = now;
        if (!still) pending = arrivals.slice(0, 4).map(({ i }, k) => ({ i, at: now + k * STEP }));
        if (pinned >= 0) onFocus(pinned);
        else if (records.length) onFocus(cur);
        draw(now);
      },
      focusPoint(i) { // where the card should sit for record i
        const y = Math.max(0, Math.min(H, rowY(i)));
        return { x: L.listW * 0.15, y: y + L.rowH, below: y < H * 0.55, W, H };
      }
    };
  }

  window.mountSignalWeb = mountSignalWeb;
})();
