// CREATIFY HERO — the dot grid behind the Agent replica, made "liquid".
//
// The CSS dot grid (.ah-dots, a repeating radial-gradient) is swapped for a
// canvas that draws the same 12px grid. Every dot is tied to its home spot by
// a spring, and to its four neighbours by springs too, so a push on one dot
// travels outward as a ripple, like a surface of water. Moving the mouse
// drags the dots it passes along with it (faster = stronger); they wobble
// back into place, and dots brighten a little while they're moving.
//
// When nothing is moving the loop stops, so a still hero costs nothing.
// Touch screens and "reduce motion" keep the plain CSS dots.
(function () {
  const host = document.querySelector('.hero-section .agent-hero .ah-dots');
  if (!host) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // ---------- feel (tweak these) ----------
  const GAP = 12;          // grid spacing, same as the CSS background-size
  const REACH = 70;        // how far from the cursor dots feel it (px, gaussian sigma ≈ REACH / 2)
  const STIR = 0.11;       // how strongly the cursor drags dots along its path
  const PUSH = 0.05;       // a little outward push too, so the cursor parts the dots
  const HOME = 0.018;      // spring back to each dot's own spot (lower = slower, gooier)
  const RIPPLE = 0.13;     // spring between neighbours (higher = ripples travel further/faster)
  const DAMP = 0.915;      // velocity kept each frame (lower = thicker liquid, settles sooner)
  const MAX_SHIFT = 26;    // a dot never strays further than this from home (px)
  const GLOW = 0.09;       // how quickly a moving dot brightens
  const LEVELS = 8;        // brightness steps (pre-drawn dot sprites)

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, dpr = 1, cols = 0, rows = 0, n = 0;
  let dx, dy, vx, vy;
  let sprites = [];

  // dot sprites: level 0 matches the CSS dot (0.5px solid white @ 50%, soft edge to 0.8px),
  // higher levels are brighter and a touch bigger
  function makeSprites() {
    sprites = [];
    for (let l = 0; l < LEVELS; l++) {
      const t = l / (LEVELS - 1);
      const r = 0.8 + t * 0.55, a = 0.5 + t * 0.5;
      const size = Math.ceil((r + 1) * 2 * dpr);
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const g = c.getContext('2d');
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, r * dpr);
      grad.addColorStop(0, `rgba(255,255,255,${a})`);
      grad.addColorStop(0.62, `rgba(255,255,255,${a})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      sprites.push(c);
    }
  }

  function build() {
    const w = host.clientWidth, h = host.clientHeight;
    const d = Math.min(window.devicePixelRatio || 1, 2);
    if (!w || !h || (w === W && h === H && d === dpr)) return;
    W = w; H = h; dpr = d;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    cols = Math.ceil(W / GAP) + 1;
    rows = Math.ceil(H / GAP) + 1;
    n = cols * rows;
    dx = new Float32Array(n); dy = new Float32Array(n);
    vx = new Float32Array(n); vy = new Float32Array(n);
    makeSprites();
    draw();
  }

  // ---------- the cursor ----------
  let px = null, py = null;          // cursor, in the canvas's own px (null = not over the hero)
  let lastX = null, lastY = null;    // where it was last frame
  let onScreen = true;
  let moved = false;                 // the mouse moved since the last frame

  function toLocal(e) {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return null;
    const s = W / r.width;           // the hero can be scaled while it parallaxes away
    const x = (e.clientX - r.left) * s, y = (e.clientY - r.top) * s;
    if (x < -REACH || y < -REACH || x > W + REACH || y > H + REACH) return null;
    return [x, y];
  }
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || !onScreen) return;
    const p = toLocal(e);
    if (!p) { px = py = lastX = lastY = null; return; }
    [px, py] = p;
    moved = true;
    if (lastX === null) { lastX = px; lastY = py; }
    wake();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { px = py = lastX = lastY = null; });

  // stir every dot near one point on the cursor's path
  function stir(x, y, mx, my) {
    const sig2 = 2 * (REACH / 2) ** 2;
    const c0 = Math.max(0, Math.floor((x - REACH) / GAP)), c1 = Math.min(cols - 1, Math.ceil((x + REACH) / GAP));
    const r0 = Math.max(0, Math.floor((y - REACH) / GAP)), r1 = Math.min(rows - 1, Math.ceil((y + REACH) / GAP));
    const speed = Math.hypot(mx, my);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const i = r * cols + c;
        const hx = c * GAP + GAP / 2 + dx[i] - x, hy = r * GAP + GAP / 2 + dy[i] - y;
        const d2 = hx * hx + hy * hy;
        if (d2 > REACH * REACH) continue;
        const f = Math.exp(-d2 / sig2);
        const d = Math.sqrt(d2) || 1;
        vx[i] += (mx * STIR + (hx / d) * speed * PUSH) * f;
        vy[i] += (my * STIR + (hy / d) * speed * PUSH) * f;
      }
    }
  }

  // ---------- one step of the liquid ----------
  function step() {
    // the cursor's movement since last frame, applied along its path (no gaps on fast flicks)
    if (px !== null && lastX !== null) {
      const mx = px - lastX, my = py - lastY;
      const dist = Math.hypot(mx, my);
      if (dist > 0.3) {
        const k = Math.max(1, Math.ceil(dist / (GAP * 1.5)));
        const cmx = Math.max(-40, Math.min(40, mx)), cmy = Math.max(-40, Math.min(40, my));
        for (let s = 1; s <= k; s++) stir(lastX + (mx * s) / k, lastY + (my * s) / k, cmx / k * Math.min(k, 3), cmy / k * Math.min(k, 3));
      }
      lastX = px; lastY = py;
    }
    // springs: home + neighbours (edges count a missing neighbour as resting)
    let energy = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const x = dx[i], y = dy[i];
        let lx = -4 * x, ly = -4 * y;
        if (c > 0) { lx += dx[i - 1]; ly += dy[i - 1]; }
        if (c < cols - 1) { lx += dx[i + 1]; ly += dy[i + 1]; }
        if (r > 0) { lx += dx[i - cols]; ly += dy[i - cols]; }
        if (r < rows - 1) { lx += dx[i + cols]; ly += dy[i + cols]; }
        vx[i] = (vx[i] + lx * RIPPLE - x * HOME) * DAMP;
        vy[i] = (vy[i] + ly * RIPPLE - y * HOME) * DAMP;
        energy += Math.abs(vx[i]) + Math.abs(vy[i]) + (Math.abs(x) + Math.abs(y)) * 0.05;
      }
    }
    for (let i = 0; i < n; i++) {
      let x = dx[i] + vx[i], y = dy[i] + vy[i];
      const m = Math.hypot(x, y);
      if (m > MAX_SHIFT) { x *= MAX_SHIFT / m; y *= MAX_SHIFT / m; vx[i] *= 0.5; vy[i] *= 0.5; }
      dx[i] = x; dy[i] = y;
    }
    return energy;
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const s0 = sprites[0];
    for (let r = 0; r < rows; r++) {
      const y0 = (r * GAP + GAP / 2) * dpr;
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const x = (c * GAP + GAP / 2 + dx[i]) * dpr, y = y0 + dy[i] * dpr;
        const g = (Math.abs(vx[i]) + Math.abs(vy[i])) * GLOW * 3 + (Math.abs(dx[i]) + Math.abs(dy[i])) * GLOW * 0.25;
        const spr = g < 0.06 ? s0 : sprites[Math.min(LEVELS - 1, 1 + ((g * (LEVELS - 1)) | 0))];
        const hw = spr.width / 2;
        ctx.drawImage(spr, x - hw, y - hw);
      }
    }
  }

  // ---------- run only while something moves ----------
  let raf = 0, calm = 0;
  function frame() {
    raf = 0;
    if (document.hidden || !onScreen) return;
    const e = step();
    draw();
    const moving = moved; moved = false;
    calm = e < n * 0.002 ? calm + 1 : 0;
    if (calm > 20 && !moving) {        // settled: snap home exactly, draw once, sleep
      dx.fill(0); dy.fill(0); vx.fill(0); vy.fill(0); draw();
      return;
    }
    raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && n) { calm = 0; raf = requestAnimationFrame(frame); } }

  new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; if (onScreen) wake(); })
    .observe(host);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
  new ResizeObserver(build).observe(host);

  host.appendChild(canvas);
  host.classList.add('is-live');     // drops the CSS dots (style.css) now the canvas draws them
  build();
})();
