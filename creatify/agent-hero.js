// CREATIFY AGENT HERO — a non-interactive, coded replica of the Agent welcome
// screen (dark theme), ported from Creatify's own front end:
//   welcome-gradient-background.tsx  → the wave gradients + dot grid
//   welcome-screen.tsx               → the intro timeline + composer sweep
//   hook/use-typing-text.ts          → the typing placeholder
// Values (colours, timings, curves, sizes) are copied from there.
//
// The one deliberate difference: Creatify draws the waves as three
// screen-sized SVGs with a 32–64px blur, which the browser re-blurs every
// frame as the shapes move (the heaviest thing on that page). Here the same
// shapes are drawn onto a small canvas (¼ size) with a ¼-size blur and
// stretched to fill the hero — the blur hides the lower resolution, and it's
// ~16× less work. The canvas also stops completely while the hero is off
// screen or the tab is hidden.
(function () {
  const hero = document.querySelector('.agent-hero');
  if (!hero) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- small helpers ----------
  // cubic-bezier easing (same maths as CSS)
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 6; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; }
      return sy(Math.min(1, Math.max(0, t)));
    };
  }
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

  // ---------- the waves (welcome-gradient-background.tsx) ----------
  // 7 keyframe shapes on a 26s loop (flat / peak A / flat / peak B / flat / peak C / flat),
  // every segment eased with cubic-bezier(0.4, 0, 0.6, 1).
  const WAVE_KEYFRAMES = [
    'M 0,72 L 0,20 C 15,20 18,21 33,21 C 48,21 52,19 67,19 C 82,19 85,20 100,20 L 100,72 Z',
    'M 0,72 L 0,22 C 15,22 18,11 33,11 C 48,11 52,27 67,27 C 82,27 85,17 100,17 L 100,72 Z',
    'M 0,72 L 0,20 C 15,20 18,21 33,21 C 48,21 52,19 67,19 C 82,19 85,20 100,20 L 100,72 Z',
    'M 0,72 L 0,19 C 15,19 18,29 33,29 C 48,29 52,12 67,12 C 82,12 85,21 100,21 L 100,72 Z',
    'M 0,72 L 0,20 C 15,20 18,21 33,21 C 48,21 52,19 67,19 C 82,19 85,20 100,20 L 100,72 Z',
    'M 0,72 L 0,24 C 15,24 18,14 33,14 C 48,14 52,26 67,26 C 82,26 85,18 100,18 L 100,72 Z',
    'M 0,72 L 0,20 C 15,20 18,21 33,21 C 48,21 52,19 67,19 C 82,19 85,20 100,20 L 100,72 Z',
  ].map((d) => d.match(/-?\d+(\.\d+)?/g).map(Number));
  const WAVE_LOOP_MS = 26000;
  const waveEase = bezier(0.4, 0, 0.6, 1);

  // colour cycles (40s), each layer changes on its own schedule
  const PINK_CYCLE = { t: [0, 0.08, 0.5, 0.58, 0.66, 1], c: ['#FF64A4', '#AC82FF', '#AC82FF', '#82DCFF', '#82DCFF', '#FF64A4'] };
  const PURPLE_CYCLE = { t: [0, 0.08, 0.16, 0.58, 0.66, 1], c: ['#6000F1', '#6000F1', '#006ECF', '#006ECF', '#00CF9B', '#6000F1'] };
  const COLOR_LOOP_MS = 40000;

  // back to front: purple (tallest) → pink → grey (shortest, screen-blended, half strength)
  const LAYERS = [
    { color: '#6000F1', cycle: PURPLE_CYCLE, heightPct: 100, riseDelay: 700, blur: 64, xOffset: 0 },
    { color: '#FF64A4', cycle: PINK_CYCLE, heightPct: 60, riseDelay: 950, blur: 58, xOffset: 32 },
    { color: '#D1D1D1', heightPct: 24, riseDelay: 1200, blur: 32, xOffset: 0, blend: 'screen', alpha: 0.5 },
    // Not in Creatify: a white wave in front (same shape + motion as the others) so the
    // bottom of the hero washes out into the white page. Gradient 40% white at its crest
    // → solid white at the hero's bottom edge (Figma: hero "Union"), screen-blended.
    { white: true, heightPct: 55, riseDelay: 1450, blur: 41, xOffset: 0, blend: 'screen' },
  ];
  const riseEase = bezier(0.16, 1, 0.3, 1);   // 900ms "rise" from 35% lower
  const fadeEase = bezier(0.42, 0, 1, 1);     // 2200ms ease-in fade

  function cycleColor(cycle, u) {
    const { t, c } = cycle;
    let i = 0; while (i < t.length - 2 && u > t[i + 1]) i++;
    const k = t[i + 1] > t[i] ? (u - t[i]) / (t[i + 1] - t[i]) : 0;
    const a = hex(c[i]), b = hex(c[i + 1]);
    return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(',')})`;
  }

  function waveShape(ms) {
    ms = Math.max(0, ms);   // (the first frame can be stamped a hair before the start time)
    const u = (ms % WAVE_LOOP_MS) / WAVE_LOOP_MS * 6;
    const seg = Math.min(5, Math.floor(u)), k = waveEase(u - seg);
    const a = WAVE_KEYFRAMES[seg], b = WAVE_KEYFRAMES[seg + 1];
    return a.map((v, i) => v + (b[i] - v) * k);
  }

  const canvas = hero.querySelector('.ah-waves');
  const ctx = canvas.getContext('2d', { alpha: false });
  const SCALE = 0.25;                                  // drawn at ¼ size, stretched to fill
  const canvasBlur = 'filter' in ctx;                  // (older Safari: blur the canvas element instead)
  if (!canvasBlur) canvas.style.filter = 'blur(12px)';
  // The canvas runs BELOW_PX past the hero's bottom edge (hidden: the hero clips it), so the
  // blurred waves have real shape below the edge to blur into, instead of fading out at the
  // canvas edge (which left a visible seam where the hero meets the white page).
  const BELOW_PX = 200;
  let W = 0, H = 0;
  function resize() {
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.max(1, Math.ceil(W * SCALE));
    canvas.height = Math.max(1, Math.ceil((H + BELOW_PX) * SCALE));
  }


  // Creatify sizes these off the viewport height; here, off the hero's height.
  // Each layer's box: full width + 96px bleed each side; top at (1 − 0.0055 × heightPct) × H;
  // height 0.66 × heightPct % of H + 7.2rem; the path's 100×72 viewBox is stretched into it.
  function drawWaves(ms, sinceStart) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    ctx.fillStyle = '#090A0A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    const shape = waveShape(ms);
    const vh = H / 100;
    for (const L of LAYERS) {
      const t = sinceStart - L.riseDelay;
      if (t <= 0) continue;
      const rise = riseEase(Math.min(1, t / 900));
      const fade = fadeEase(Math.min(1, t / 2200));
      const boxX = -96 + L.xOffset, boxW = W + 192;
      const boxH = 0.66 * L.heightPct * vh + 115.2;
      const top = H - 0.55 * L.heightPct * vh + boxH * 0.35 * (1 - rise);
      const X = (x) => boxX + (x / 100) * boxW, Y = (y) => top + (y / 72) * boxH;
      const s = shape;   // M x,y L x,y C (6) C (6) C (6) L x,y
      ctx.beginPath();
      ctx.moveTo(X(s[0]), Y(s[1]));
      ctx.lineTo(X(s[2]), Y(s[3]));
      for (let i = 4; i < 22; i += 6) ctx.bezierCurveTo(X(s[i]), Y(s[i + 1]), X(s[i + 2]), Y(s[i + 3]), X(s[i + 4]), Y(s[i + 5]));
      ctx.lineTo(X(s[22]), Y(s[23]));
      ctx.closePath();
      if (L.white) {
        // 40% white at the wave's crest → solid white 40px lower (and below), so that even
        // after the blur the hero's last row is exactly the page's white
        const restTop = H - 0.55 * L.heightPct * vh, restH = 0.66 * L.heightPct * vh + 115.2;
        const crest = restTop + (20 / 72) * restH;   // the wave's flat line sits 20/72 down its box
        const g = ctx.createLinearGradient(0, crest, 0, crest + 40);
        g.addColorStop(0, 'rgba(255,255,255,0.4)');
        g.addColorStop(1, 'rgba(255,255,255,1)');
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = L.cycle ? cycleColor(L.cycle, (ms % COLOR_LOOP_MS) / COLOR_LOOP_MS) : L.color;
      }
      ctx.globalAlpha = fade * (L.alpha ?? 1);
      ctx.globalCompositeOperation = L.blend || 'source-over';
      if (canvasBlur) ctx.filter = `blur(${L.blur * SCALE}px)`;
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---------- run loop: 60fps while the intro rises, 30fps after; stops when not visible ----------
  let startAt = 0, raf = 0, lastDraw = 0;
  const isVisible = () => !document.hidden && !document.body.classList.contains('hero-covered');
  function frame(now) {
    raf = 0;
    if (!isVisible()) return;
    const since = Math.max(0, now - startAt);
    const interval = since < 3500 ? 0 : 33;
    if (now - lastDraw >= interval) { lastDraw = now; drawWaves(reduceMotion ? 0 : since, reduceMotion ? 1e6 : since); }
    raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && startAt && isVisible()) raf = requestAnimationFrame(frame); }
  document.addEventListener('visibilitychange', wake);
  new MutationObserver(wake).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', () => { resize(); lastDraw = 0; wake(); });
  resize();
  drawWaves(0, 0);   // plain dark background until the intro starts

  // ---------- intro timeline (welcome-screen.tsx), times from the start ----------
  const titleWrap = hero.querySelector('.ah-title-wrap');
  const chipsRow = hero.querySelector('.ah-chips');
  const chips = [...hero.querySelectorAll('.ah-chip-wrap')];
  const slot = hero.querySelector('.ah-composer-slot');
  const composer = hero.querySelector('.ah-composer');
  const content = hero.querySelector('.ah-content');
  const bands = [...hero.querySelectorAll('.ah-sweep-band')];

  const SETTLE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const GROW_EASE = 'cubic-bezier(0.11, 1, 0.24, 1)';
  const SQUARE = 64, PLACEHOLDER_H = 24;

  // final size of the composer (it's laid out at full size, invisibly, to measure)
  const full = { w: composer.offsetWidth, h: composer.offsetHeight };
  slot.style.width = full.w + 'px';
  slot.style.height = full.h + 'px';
  const set = (el, css) => Object.assign(el.style, css);

  // phase 0: everything hidden; the cluster starts tight (title low, chips pulled up)
  set(titleWrap, { opacity: 0, transform: 'translateY(56px)' });
  set(chipsRow, { transform: `translateY(-${full.h - PLACEHOLDER_H}px)` });
  chips.forEach((c) => set(c, { opacity: 0, transform: 'translateY(8px)' }));
  set(composer, { position: 'absolute', top: 0, left: 0, width: SQUARE + 'px', height: PLACEHOLDER_H + 'px', opacity: 0 });
  content.style.opacity = 0;

  const at = (ms, fn) => setTimeout(fn, ms);
  function startIntro() {
    if (startAt) return;
    startAt = performance.now();
    hero.classList.add('is-playing');       // starts the CSS parts (dot-grid reveal)
    wake();
    const d = reduceMotion ? 0 : 1;          // reduced motion: jump straight to the end
    // title + chips appear together (chips one by one, 70ms apart)
    at(120 * d, () => {
      set(titleWrap, { transition: 'opacity 500ms ease-out', opacity: 1 });
      chips.forEach((c, i) => set(c, { transition: `opacity 400ms ease-out ${i * 70}ms, transform 400ms ease-out ${i * 70}ms`, opacity: 1, transform: 'translateY(0)' }));
    });
    // they slide apart to make room for the composer
    at(1050 * d, () => {
      set(titleWrap, { transition: `transform 400ms ${SETTLE_EASE}, opacity 500ms ease-out`, transform: 'translateY(0)' });
      set(chipsRow, { transition: `transform 400ms ${SETTLE_EASE}`, transform: 'translateY(0)' });
    });
    // a small rounded square fades in…
    at(1500 * d, () => set(composer, { transition: 'height 250ms ease-out, opacity 250ms ease-out', height: SQUARE + 'px', opacity: 1 }));
    // …then grows to full size (width and height at the same speed, so height finishes first)
    at(1800 * d, () => {
      const speed = (full.w - SQUARE) / 550;
      const hMs = Math.max(1, (full.h - SQUARE) / speed);
      set(composer, { transition: `width 550ms ${GROW_EASE}, height ${hMs}ms ${GROW_EASE}`, width: full.w + 'px', height: full.h + 'px' });
    });
    // content fades in while the grey light-sweep wipes across and away
    at(2350 * d, () => {
      set(composer, { position: '', top: '', left: '', width: '', height: '', transition: '' });
      set(content, { transition: 'opacity 300ms', opacity: 1 });
      bands.forEach((b) => b.classList.add('is-sweeping'));
      startTyping();
    });
  }

  // ---------- typing placeholder (use-typing-text.ts: 55ms/char, delete at half, 1s hold) ----------
  const PROMPTS = [
    'a 30 seconds UGC ad for your website:', 'a 15 seconds TikTok ad for your product:', '3 Meta image ads for your store:',
    'a YouTube Shorts ad for your brand:', 'a Reels ad for your product:', '5 static image ads for your website:',
    'a Facebook carousel ad for your store:', 'a TikTok hook ad for your app:', 'a 30 seconds CTV ad for your brand:',
  ];
  const typed = hero.querySelector('.ah-typed');
  let current = '';
  const pick = () => { const pool = PROMPTS.filter((p) => p !== current); return pool[Math.floor(Math.random() * pool.length)]; };
  function startTyping() {
    const TYPE = 55, DELETE = 27.5, HOLD = 1000, GAP = 200;
    const run = () => {
      current = pick();
      let i = 0;
      const type = () => {
        typed.textContent = 'Create ' + current.slice(0, ++i);
        if (i < current.length) setTimeout(type, TYPE);
        else setTimeout(del, HOLD);
      };
      const del = () => {
        typed.textContent = 'Create ' + current.slice(0, --i);
        if (i > 0) setTimeout(del, DELETE);
        else setTimeout(run, GAP);
      };
      typed.textContent = 'Create';
      setTimeout(type, TYPE);
    };
    run();
  }

  // Start once the page's entry splash starts sliding away (the page is ready),
  // or straight away if there's no splash.
  const splash = document.getElementById('page-entry-overlay');
  if (!splash) startIntro();
  else {
    new MutationObserver((_, obs) => { if (!document.body.contains(splash)) { obs.disconnect(); startIntro(); } })
      .observe(document.body, { childList: true });
    window.addEventListener('load', () => setTimeout(startIntro, 450));   // (the splash starts leaving ~0.15s after load)
  }
})();
