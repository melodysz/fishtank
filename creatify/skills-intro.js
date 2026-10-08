// SKILLS INTRO
// Four stages of Skills (+ menu → chip → first gallery → redesigned gallery) start as a
// tidy 2×2 in the middle of the grey card. Once the section is at least 3/4 on screen,
// after a short pause, they're "pulled apart" to the screen's corners with a bouncy
// overshoot (partly off screen, like Figma's "Animated 4"), while the title fades in and
// "Skills" shines pink → purple before settling to ink. It plays once per page visit:
// scrolling away and back leaves it in its finished state.
(() => {
  const section = document.getElementById('skillsIntro');
  if (!section || !window.gsap) return;
  const title = section.querySelector('.sk-intro-text')   // the number + title;
  const shots = [...section.querySelectorAll('.sk-shot')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SHOW_AT = 0.5;       // share of the section on screen before it plays (was 0.75)
  const DELAY = 0.08;        // s pause before the pull (was 0.35)
  // Figma proportions (frame 1469×993, card 1380×746, each screenshot 610×394):
  const RATIO = 1728 / 1117;          // screenshot width ÷ height
  const W_OF_CARD = 610 / 1380;       // screenshot width as a share of the card's width
  const GRID_OF_CARD_H = 799 / 746;   // the 2×2 can spill a little past the card's height
  const GAP = 10 / 610;               // gap between screenshots, per screenshot width
  const OFF_X = 0.25, OFF_Y = 0.16;   // how far past the screen edge they end (share of their own size; Figma was 0.167 / 0.072)

  let start = [], end = [], played = false;

  function measure() {
    const W = section.clientWidth, H = section.clientHeight;
    const g = parseFloat(getComputedStyle(section.querySelector('.sk-card')).left) || 0;
    const cardW = W - 2 * g, cardH = H - 2 * g;
    const w = Math.min(cardW * W_OF_CARD, (cardH * GRID_OF_CARD_H) / (2 / RATIO + GAP));
    const h = w / RATIO, gap = w * GAP, cx = W / 2, cy = H / 2;
    section.style.setProperty('--sk-w', w + 'px');
    section.style.setProperty('--sk-w-px', w);
    start = {
      tl: [cx - gap / 2 - w, cy - gap / 2 - h], tr: [cx + gap / 2, cy - gap / 2 - h],
      bl: [cx - gap / 2 - w, cy + gap / 2],     br: [cx + gap / 2, cy + gap / 2],
    };
    end = {
      tl: [-OFF_X * w, -OFF_Y * h],             tr: [W - (1 - OFF_X) * w, -OFF_Y * h],
      bl: [-OFF_X * w, H - (1 - OFF_Y) * h],    br: [W - (1 - OFF_X) * w, H - (1 - OFF_Y) * h],
    };
    shots.forEach((el) => {
      const c = el.dataset.corner;
      el.style.left = start[c][0] + 'px';
      el.style.top = start[c][1] + 'px';
    });
  }
  const pullFor = (el) => {
    const c = el.dataset.corner;
    return { x: end[c][0] - start[c][0], y: end[c][1] - start[c][1] };
  };

  function reset() {
    played = false;
    gsap.killTweensOf([...shots, title]);
    gsap.set(shots, { x: 0, y: 0 });
    gsap.set(title, { opacity: 0, y: 16 });
    section.classList.remove('is-shining');
  }
  function settled() {            // the finished state (resizes, reduced motion)
    shots.forEach((el) => gsap.set(el, pullFor(el)));
    gsap.set(title, { opacity: 1, y: 0 });
  }
  function play() {
    if (played) return;
    played = true;
    if (reduceMotion) { settled(); return; }   // (no magnet either)
    const tl = gsap.timeline({ delay: DELAY, onComplete: () => { enableMagnet(); enableParallax(); } });
    shots.forEach((el, i) => {
      // pulled out past their spot, then springing back a touch: bouncy, like hands tugging
      tl.to(el, { ...pullFor(el), duration: 0.5, ease: 'back.out(0.6)' }, i * 0.03);   // (overshoot: was 1.3; duration: was 0.75)
    });
    tl.to(title, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.22)
      .add(() => { section.classList.remove('is-shining'); void section.offsetWidth; section.classList.add('is-shining'); }, 0.3);
  }

  // ---------- magnetic screenshots (once they've been pulled apart) ----------
  // Same momentum feel as the Pent Up hero's postcards: moving the mouse near a
  // screenshot nudges it the way the mouse is going (more when closer), then it glides
  // back to its spot. Each one's travel is capped below how far it hangs off screen, so
  // its outer edges never slide into view — the section itself does all the clipping.
  // (Uses CSS `translate`, separate from the pull's transform.)
  const MAGNET = { reach: 500, strength: 0.15, follow: 0.05, settle: 0.95, cap: 0.8 };   // (Pent Up's postcards: 500 / 0.08 / 0.04)
  const mag = shots.map((el) => ({ el, mx: 0, my: 0, vx: 0, vy: 0, cx: 0, cy: 0 }));
  let magnetOn = false, magRaf = 0, lastX = null, lastY = null, onScreen = false;
  // How far it may move each way. Moving outward only hides more of it, so that's free;
  // moving inward is limited to (part of) how far its outer edge hangs past the section.
  function capFor(el) {
    const r = el.getBoundingClientRect(), s = section.getBoundingClientRect(), k = MAGNET.cap;
    const hangL = s.left - r.left, hangR = r.right - s.right, hangT = s.top - r.top, hangB = r.bottom - s.bottom;
    return {
      maxX: hangL > 0 ? hangL * k : Infinity,  minX: hangR > 0 ? -hangR * k : -Infinity,
      maxY: hangT > 0 ? hangT * k : Infinity,  minY: hangB > 0 ? -hangB * k : -Infinity,
    };
  }
  function magTick() {
    magRaf = 0;
    let moving = false;
    mag.forEach((m) => {
      m.vx += (m.mx - m.vx) * MAGNET.follow; m.vy += (m.my - m.vy) * MAGNET.follow;
      m.cx = (m.cx + m.vx) * MAGNET.settle;   m.cy = (m.cy + m.vy) * MAGNET.settle;
      m.vx *= MAGNET.settle; m.vy *= MAGNET.settle;
      m.mx *= 0.8; m.my *= 0.8;               // (the push fades if the mouse stops)
      const cap = m.cap || (m.cap = capFor(m.el));
      m.cx = Math.max(cap.minX, Math.min(cap.maxX, m.cx));
      m.cy = Math.max(cap.minY, Math.min(cap.maxY, m.cy));
      m.el.style.translate = `${m.cx.toFixed(2)}px ${m.cy.toFixed(2)}px`;
      if (Math.abs(m.cx) + Math.abs(m.cy) + Math.abs(m.vx) + Math.abs(m.vy) + Math.abs(m.mx) + Math.abs(m.my) > 0.05) moving = true;
    });
    if (moving) magRaf = requestAnimationFrame(magTick);
  }
  window.addEventListener('mousemove', (e) => {
    if (!magnetOn || !onScreen || reduceMotion) { lastX = e.clientX; lastY = e.clientY; return; }
    if (lastX !== null) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      mag.forEach((m) => {
        const r = m.el.getBoundingClientRect();
        // distance from the mouse to the screenshot's nearest edge (0 when over it)
        const ex = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
        const ey = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
        const d = Math.hypot(ex, ey);
        const k = d < MAGNET.reach ? (1 - d / MAGNET.reach) * MAGNET.strength : 0;
        m.mx = dx * k; m.my = dy * k;
      });
      if (!magRaf) magRaf = requestAnimationFrame(magTick);
    }
    lastX = e.clientX; lastY = e.clientY;
  });
  const MAGNET_ENABLED = false;   // switched off for now: true brings the magnetic screenshots back
  const enableMagnet = () => { if (!MAGNET_ENABLED) return; mag.forEach((m) => { m.cap = null; }); magnetOn = true; };

  // ---------- parallax: the screenshots drift at PARALLAX of the page's speed ----------
  // (moves their shared container, so it stacks with the pull-apart and the magnet; the
  // offset is 0 when the section fills the screen, and its edges never come into view:
  // they're off screen by more than the drift whenever it would matter.) It stays off
  // until the four screenshots have reached their corners, then eases in (par.k 0 → 1)
  // so nothing jumps.
  const PARALLAX = 0.75;          // 1 = with the page, 0 = fixed to the screen
  const layer = section.querySelector('.sk-shots');
  const par = { k: 0, target: 0 };
  const applyPar = () => gsap.set(layer, { y: par.target * par.k });
  let enableParallax = () => {};
  if (window.ScrollTrigger && !reduceMotion) {
    const range = () => section.offsetHeight * 2 * (1 - PARALLAX);   // total drift across the section's pass
    const track = (self) => { par.target = (self.progress - 0.5) * range(); applyPar(); };
    ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top', onUpdate: track, onRefresh: track });
    enableParallax = () => gsap.to(par, { k: 1, duration: 0.8, ease: 'power2.out', onUpdate: applyPar });
  }

  measure();
  reset();
  window.addEventListener('resize', () => { measure(); if (played) { settled(); mag.forEach((m) => { m.cap = null; }); } });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      onScreen = en.intersectionRatio > 0;
      if (en.intersectionRatio >= SHOW_AT) play();   // plays once; then stays pulled apart
    }, { threshold: [0, 0.01, SHOW_AT] }).observe(section);
  } else {
    played = true; settled();
  }
})();
