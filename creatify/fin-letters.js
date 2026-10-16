// "FIN." LETTERS: each letter is a little object on a spring. Sweep the cursor through
// them and the letters it touches get shoved along with it (and tip over, depending on
// where they were hit). A shoved letter knocks into its neighbour and passes the bump
// along, then everything wobbles back into place.
(() => {
  const text = document.querySelector('.cf-fin-text');
  if (!text) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const FIN = {
    push: 0.12,       // how much of the cursor's speed a letter picks up when touched (0–1)
    maxPush: 1500,    // fastest cursor speed that counts (px/sec), so a wild flick can't fling them off screen
    spin: 0.18,       // how much a touch tips the letter over (hit near the top or bottom = more spin)
    spring: 140,      // how hard letters are pulled back home (higher = snappier)
    bounce: 0.3,      // damping: lower = more wobbles before settling, higher = settles sooner
    spinSpring: 160,  // same two, for the tilt
    spinBounce: 0.25,
    knock: 0.85,      // how much bump passes from one letter to the next when they collide (0–1)
    knockSpin: 0.05,  // a collision also tips the letter that got hit
    maxTilt: 12,      // degrees
  };

  const letters = [...text.querySelectorAll('.cf-fin-l')].map((el) => ({
    el, x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0,
  }));
  if (!letters.length) return;

  // where each letter sits when still (relative to the "Fin." line; transforms don't move these)
  function measure() {
    letters.forEach((l) => {
      l.left = l.el.offsetLeft;
      l.top = l.el.offsetTop;
      l.w = l.el.offsetWidth;
      l.h = l.el.offsetHeight;
    });
  }
  measure();
  window.addEventListener('resize', measure);
  document.fonts && document.fonts.ready.then(measure);

  // --- cursor contact ---
  let prev = null;
  const zone = text.closest('.cf-fin') || text;
  zone.addEventListener('pointerleave', () => { prev = null; });
  zone.addEventListener('pointermove', (e) => {
    const now = performance.now();
    const base = text.getBoundingClientRect();
    const px = e.clientX - base.left, py = e.clientY - base.top;
    if (!prev || now - prev.t > 100) { prev = { x: px, y: py, t: now }; return; }
    const dt = Math.max(0.008, (now - prev.t) / 1000);
    let mvx = (px - prev.x) / dt, mvy = (py - prev.y) / dt;
    const speed = Math.hypot(mvx, mvy);
    if (speed > FIN.maxPush) { mvx *= FIN.maxPush / speed; mvy *= FIN.maxPush / speed; }

    // check points along the cursor's path, so a fast swipe can't skip over the thin "i" or "."
    const steps = Math.max(1, Math.ceil(Math.hypot(px - prev.x, py - prev.y) / 8));
    const hit = new Set();
    for (let s = 1; s <= steps; s++) {
      const qx = prev.x + (px - prev.x) * (s / steps);
      const qy = prev.y + (py - prev.y) * (s / steps);
      letters.forEach((l) => {
        if (hit.has(l)) return;
        if (qx >= l.left + l.x && qx <= l.left + l.x + l.w && qy >= l.top + l.y && qy <= l.top + l.y + l.h) {
          hit.add(l);
          const dvx = mvx - l.vx, dvy = mvy - l.vy;
          l.vx += dvx * FIN.push;
          l.vy += dvy * FIN.push;
          // tip it: hit off-centre = it spins (same idea as pushing a book near its top edge)
          const rx = (qx - (l.left + l.x + l.w / 2)) / l.h;
          const ry = (qy - (l.top + l.y + l.h / 2)) / l.h;
          l.vr += (rx * dvy - ry * dvx) * FIN.spin;
        }
      });
    }
    prev = { x: px, y: py, t: now };
    if (hit.size) start();
  });

  // --- motion ---
  let raf = 0, last = 0;
  function start() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  }

  function springStep(l, dt) {
    const w = Math.sqrt(FIN.spring), wr = Math.sqrt(FIN.spinSpring);
    l.vx += (-FIN.spring * l.x - 2 * FIN.bounce * w * l.vx) * dt;
    l.vy += (-FIN.spring * l.y - 2 * FIN.bounce * w * l.vy) * dt;
    l.vr += (-FIN.spinSpring * l.r - 2 * FIN.spinBounce * wr * l.vr) * dt;
    l.x += l.vx * dt;
    l.y += l.vy * dt;
    l.r += l.vr * dt;
    if (Math.abs(l.r) > FIN.maxTilt) { l.r = Math.sign(l.r) * FIN.maxTilt; l.vr *= -0.4; }
  }

  // neighbours bump into each other side to side
  function collide(a, b) {
    const restGap = Math.max(0, b.left - (a.left + a.w));
    const overlap = (a.x - b.x) - restGap;   // > 0: a has pushed into b
    if (overlap <= 0) return;
    a.x -= overlap / 2;
    b.x += overlap / 2;
    const closing = a.vx - b.vx;
    if (closing <= 0) return;
    // equal weights: the bump is shared out, with a bit lost
    const j = closing * (1 + FIN.knock) / 2;
    a.vx -= j;
    b.vx += j;
    // whoever was higher up when they met gets tipped a little more
    const lean = Math.sign((b.y - a.y) || 1);
    a.vr -= closing * FIN.knockSpin * lean;
    b.vr += closing * FIN.knockSpin * lean;
  }

  function step(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    const SUB = 3;
    for (let s = 0; s < SUB; s++) {
      letters.forEach((l) => springStep(l, dt / SUB));
      for (let i = 0; i < letters.length - 1; i++) collide(letters[i], letters[i + 1]);
    }
    let moving = false;
    letters.forEach((l) => {
      if (Math.abs(l.x) + Math.abs(l.y) > 0.1 || Math.abs(l.vx) + Math.abs(l.vy) > 2 ||
          Math.abs(l.r) > 0.05 || Math.abs(l.vr) > 1) moving = true;
      l.el.style.transform = `translate(${l.x.toFixed(2)}px, ${l.y.toFixed(2)}px) rotate(${l.r.toFixed(2)}deg)`;
    });
    if (!moving) {
      letters.forEach((l) => { l.x = l.y = l.r = l.vx = l.vy = l.vr = 0; l.el.style.transform = ''; });
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(step);
  }
})();
