// SKILLS INTRO
// The grey card starts empty. Once the section is half on screen, nine skill cards
// slide up from the bottom centre of the screen one after another, each starting
// tilted at its own angle and straightening out as it lands in a pile in the middle.
// The moment the last card is in place, the pile fans out into a 3 × 3 grid, holds, and the
// cards blink out one by one in random order. Halfway through the blinking, the title
// unblurs into view and "Skills" shines.
// (The previous version, screenshots pulled out to the corners, is in git history.)
(() => {
  const section = document.getElementById('skillsIntro');
  if (!section || !window.gsap) return;
  const title = section.querySelector('.sk-intro-text');
  const card = section.querySelector('.sk-card');
  const cards = [...section.querySelectorAll('.sk-skill')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const INTRO = {
    showAt: 0.5,        // share of the section on screen before it plays
    replay: false,      // true = plays again each time you scroll away and come back (handy while designing)

    // size: the 3×3 grid fills this much of the grey card (whichever runs out first)
    gridW: 0.96,
    gridH: 0.9,
    gap: 0.04,          // space between cards in the grid, as a share of a card's width

    // 1. swoop in
    swoopTime: 0.9,     // s each card takes to fly in
    cascade: 0.08,      // s between one card starting and the next (lower = more rapid)
    swoopEase: 'power3.out',   // fast launch, soft landing
    spread: 0,          // how far left/right of centre the cards start, as a share of the screen's width (0 = all from bottom centre)
    curve: 0.65,        // how much the path bends (0 = straight line, 1 = rises straight up then swings across)
    tiltMin: 12,        // starting tilt, degrees (each card gets a random angle between these, either way)
    tiltMax: 38,

    // 2. fan out into the grid, as soon as the last card is in place
    landedAt: 0.7,      // share of its flight when a card looks in place (the rest is a barely-moving soft landing)
    pause: 0,           // s with the pile sitting still before it fans out
    fanTime: 0.75,
    fanStagger: 0,      // s between cards starting to fan out (0 = all at once)
    fanEase: 'expo.out',

    // 3. hold, then blink out in random order
    hold: 0,            // s the grid stays up before the blinking starts
    blinkGap: 0.07,     // s between one card blinking out and the next
    blinkDip: 0.15,     // how far it drops at first (0 = gone, 1 = no dip)
    blinkBack: 0.45,    // how bright it flashes back (1 = full strength; was 1, felt too intense)
    blinkFade: 0.12,    // s for the last fade to nothing (0 = cuts out instantly)

    // 4. title unblurs into view while the cards are blinking away
    titleAt: 0.5,       // when it starts, as a share of the way through the blinking (0 = first blink, 1 = last)
    titleTime: 0.8,     // s to come fully into focus
    titleBlur: 16,      // px of blur it starts at
  };

  const RATIO = 1624 / 1024;      // card image width ÷ height
  const COLS = 3, ROWS = 3;
  let w = 0, h = 0, slots = [], paths = [], tl = null, played = false;

  function measure() {
    const W = card.clientWidth, H = card.clientHeight;
    w = Math.min(
      (W * INTRO.gridW) / (COLS + (COLS - 1) * INTRO.gap),
      (H * INTRO.gridH) / (ROWS / RATIO + (ROWS - 1) * INTRO.gap)
    );
    h = w / RATIO;
    const gap = w * INTRO.gap;
    section.style.setProperty('--sk-card-w', w + 'px');
    // grid spots, measured from the middle of the section
    slots = cards.map((_, i) => ({
      x: ((i % COLS) - (COLS - 1) / 2) * (w + gap),
      y: (Math.floor(i / COLS) - (ROWS - 1) / 2) * (h + gap),
    }));
  }

  // each card's own start: below the screen, off to one side, tilted
  function pickPaths() {
    const W = section.clientWidth, H = section.clientHeight;
    paths = cards.map((_, i) => {
      const side = i % 2 ? 1 : -1;                                // alternate left / right
      const sx = side * (0.35 + Math.random() * 0.65) * INTRO.spread * W;
      const sy = H / 2 + h * 0.75;                                // just past the bottom edge
      const tilt = (INTRO.tiltMin + Math.random() * (INTRO.tiltMax - INTRO.tiltMin)) * (Math.random() < 0.5 ? -1 : 1);
      // bend point: mostly straight up from the start, then across into the middle
      return { sx, sy, cx: sx * INTRO.curve, cy: sy * (1 - INTRO.curve) * 0.4, tilt };
    });
  }

  // a point along the curve from the start (t = 0) to the middle (t = 1)
  function along(p, t) {
    const u = 1 - t;
    return { x: u * u * p.sx + 2 * u * t * p.cx, y: u * u * p.sy + 2 * u * t * p.cy };
  }

  function reset() {
    if (tl) tl.kill();
    tl = null;
    played = false;
    gsap.killTweensOf(title);
    gsap.set(cards, { x: 0, y: 0, rotation: 0, autoAlpha: 0 });
    gsap.set(title, { opacity: 0, filter: `blur(${INTRO.titleBlur}px)` });
    section.classList.remove('is-shining');
  }

  function finished() {            // (reduced motion: straight to the title)
    gsap.set(cards, { autoAlpha: 0 });
    gsap.set(title, { opacity: 1, filter: 'none' });
    section.classList.add('is-shining');
  }

  function play() {
    if (played) return;
    played = true;
    if (reduceMotion) { finished(); return; }
    measure();
    pickPaths();
    tl = gsap.timeline();

    // 1. swoop in, one after another (later cards land on top)
    cards.forEach((el, i) => {
      const p = paths[i];
      const prog = { t: 0 };
      el._fanning = false;
      const draw = () => {
        if (el._fanning) return;      // (the fan-out has taken over)
        const pt = along(p, prog.t);
        gsap.set(el, { x: pt.x, y: pt.y, rotation: p.tilt * (1 - prog.t) });
      };
      tl.add(() => { draw(); gsap.set(el, { autoAlpha: 1 }); }, i * INTRO.cascade);
      tl.to(prog, { t: 1, duration: INTRO.swoopTime, ease: INTRO.swoopEase, onUpdate: draw }, i * INTRO.cascade);
    });
    const landed = (cards.length - 1) * INTRO.cascade + INTRO.swoopTime * INTRO.landedAt;

    // 2. fan out into the grid
    const fanAt = landed + INTRO.pause;
    cards.forEach((el, i) => {
      tl.to(el, { x: slots[i].x, y: slots[i].y, rotation: 0, duration: INTRO.fanTime, ease: INTRO.fanEase,
                  onStart: () => { el._fanning = true; } }, fanAt + i * INTRO.fanStagger);
    });
    const fanned = fanAt + (cards.length - 1) * INTRO.fanStagger + INTRO.fanTime * 0.6;   // (expo is basically there by 60%)

    // 3. blink out in a random order: a quick dip, a soft flash back, then a fade
    const order = cards.map((_, i) => i).sort(() => Math.random() - 0.5);
    const blinkAt = fanned + INTRO.hold;
    order.forEach((idx, k) => {
      const at = blinkAt + k * INTRO.blinkGap;
      const el = cards[idx];
      tl.set(el, { opacity: INTRO.blinkDip }, at)
        .set(el, { opacity: INTRO.blinkBack }, at + 0.04)
        .to(el, { autoAlpha: 0, duration: INTRO.blinkFade, ease: 'power1.in' }, at + 0.08);
    });
    const gone = blinkAt + (cards.length - 1) * INTRO.blinkGap + 0.08 + INTRO.blinkFade;

    // 4. title unblurs into view, partway through the blinking
    const titleAt = blinkAt + (gone - blinkAt) * INTRO.titleAt;
    tl.to(title, { opacity: 1, filter: 'blur(0px)', duration: INTRO.titleTime, ease: 'power2.out',
                   onComplete: () => gsap.set(title, { filter: 'none' }) }, titleAt)
      .add(() => { section.classList.remove('is-shining'); void section.offsetWidth; section.classList.add('is-shining'); }, titleAt + 0.08);
  }

  measure();
  reset();
  window.addEventListener('resize', () => {
    measure();
    if (played && (!tl || !tl.isActive())) gsap.set(cards, { autoAlpha: 0 });
  });

  // DESIGN HELPER: a "replay" button in the corner, only on localhost (never on the live site)
  if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '↻ replay skills intro';
    btn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:99999;padding:10px 16px;border:0;border-radius:999px;' +
      'background:#111;color:#fff;font:500 14px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2)';
    btn.addEventListener('click', () => { reset(); play(); });
    document.body.appendChild(btn);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      if (en.intersectionRatio >= INTRO.showAt) play();
      else if (INTRO.replay && en.intersectionRatio === 0 && played) reset();
    }, { threshold: [0, INTRO.showAt] }).observe(section);
  } else {
    played = true; finished();
  }
})();
