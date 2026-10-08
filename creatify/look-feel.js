// LOOK & FEEL — an Apple-style explorer ("Take a closer look").
// Hovering a pill opens its note (the others close; clicking pins it open) and sets the
// explorer's data-state:
// the CSS then moves the laptop (zooming into the detail) and this script swaps which
// recording plays on its screen. "A glass composer" swaps the laptop for a live copy of
// the page's Agent hero and replays its composer intro. Clicking the open pill's × (or
// the open pill again) goes back to the default: the full walkthrough.
(() => {
  const ex = document.getElementById('lfExplorer');
  if (!ex) return;
  const pills = [...ex.querySelectorAll('.lf-pill')];
  const screens = [...ex.querySelectorAll('.lf-v')];
  const heroEl = ex.querySelector('.lf-hero');

  const PAD_LEFT = 52, PAD_RIGHT = 24, PAD_Y = 14, CLOSED_H = 53, OPEN_W = 420;

  let state = 'default';
  let onScreen = false;

  // ---- the live hero copy: its waves only run while it's showing ----
  let intro = null;
  if (heroEl && window.cfAgentWaves && window.cfAgentHeroIntro) {
    const waves = window.cfAgentWaves(heroEl, () => !document.hidden && onScreen && state === 'composer');
    intro = window.cfAgentHeroIntro(heroEl, waves);
  }
  let resetTimer = 0;

  // ---- pill sizes (measured, so width/height can animate) ----
  function sizePill(p) {
    if (p.classList.contains('is-open')) {
      const d = p.querySelector('.lf-detail');
      p.style.setProperty('--w', Math.min(OPEN_W, ex.clientWidth - 32) + 'px');
      p.style.setProperty('--h', Math.max(CLOSED_H, d.offsetHeight + PAD_Y * 2) + 'px');
    } else {
      const l = p.querySelector('.lf-label');
      p.style.setProperty('--w', Math.ceil(PAD_LEFT + l.offsetWidth + PAD_RIGHT) + 'px');
      p.style.setProperty('--h', CLOSED_H + 'px');
    }
  }
  const sizeAll = () => pills.forEach(sizePill);

  // the hero's headline + composer, scaled like Figma (1.16× at the 1472×741 frame size)
  function scaleHero() {
    if (!heroEl) return;
    const phone = window.matchMedia('(max-width: 760px)').matches;
    const u = phone ? (window.innerWidth - 32) / 1140 : Math.min(window.innerWidth / 1472, window.innerHeight / 741);
    heroEl.querySelector('.ah-stage').style.setProperty('--ah-scale', (phone ? 0.75 : 1.16) * u);
  }

  // ---- which recording plays ----
  function syncScreens() {
    const key = state === 'composer' ? '' : state;
    screens.forEach((s) => {
      const on = s.dataset.for.split(' ').includes(key);
      const wasOn = s.classList.contains('is-on');
      s.classList.toggle('is-on', on);
      const v = s.tagName === 'VIDEO' ? s : s.querySelector('video');
      if (on && onScreen) {
        if (!wasOn) v.currentTime = 0;     // each pill's recording starts from the top
        v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    });
  }

  function setState(next) {
    const prev = state;
    state = next;
    ex.dataset.state = next === 'default' ? '' : next;
    pills.forEach((p) => {
      const open = p.dataset.state === next;
      p.classList.toggle('is-open', open);
      p.setAttribute('aria-expanded', open);
      sizePill(p);
    });
    syncScreens();
    if (intro) {
      clearTimeout(resetTimer);
      if (next === 'composer') intro.replay();
      else if (prev === 'composer') resetTimer = setTimeout(() => intro.reset(), 700);   // after the fade-out
    }
  }

  // Hovering a pill (mouse) previews it; clicking pins it open, so it stays after the mouse
  // leaves (click it again to unpin). Leaving goes back to the pinned pill, or the default.
  // While pills resize (SETTLE ms after a change) hover is ignored; then whatever is under
  // the mouse wins, so pills growing/shrinking under a still mouse can't make them flicker.
  const HOVER_IN = 120, HOVER_OUT = 180, SETTLE = 480;   // ms
  let pinned = 'default', hoverTimer = 0, ignoreHover = null, lockUntil = 0, settleTimer = 0;
  let mx = -1, my = -1, needMove = false;   // needMove: after a click-to-close, wait for the mouse to actually move
  ex.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (needMove && Math.hypot(e.clientX - mx, e.clientY - my) > 3) needMove = false;
    mx = e.clientX; my = e.clientY;
  });
  ex.addEventListener('pointerleave', () => { mx = my = -1; });
  const later = (fn, ms) => { clearTimeout(hoverTimer); hoverTimer = setTimeout(fn, ms); };
  function hoverTo(next) {
    if (state === next) return;
    setState(next);
    lockUntil = performance.now() + SETTLE;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(recheck, SETTLE);
  }
  function recheck() {                       // after the resize: act on what's under the mouse now
    if (needMove) return;
    if (mx < 0) { if (state !== pinned) hoverTo(pinned); return; }
    const p = document.elementFromPoint(mx, my)?.closest('.lf-pill');
    if (p && p !== ignoreHover && pills.includes(p)) hoverTo(p.dataset.state);
    else if (!p && state !== pinned) hoverTo(pinned);
  }
  pills.forEach((p) => {
    p.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || ignoreHover === p || needMove || performance.now() < lockUntil) return;
      later(() => hoverTo(p.dataset.state), HOVER_IN);
    });
    p.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (ignoreHover === p) ignoreHover = null;
      if (performance.now() < lockUntil) return;
      later(() => { if (!document.elementFromPoint(mx, my)?.closest('.lf-pill')) hoverTo(pinned); }, HOVER_OUT);
    });
    p.addEventListener('click', () => {
      clearTimeout(hoverTimer);
      if (pinned === p.dataset.state) {        // unpin: close it, even though the mouse is still over it
        pinned = 'default';
        ignoreHover = p;                       // (until the mouse leaves, so hover doesn't reopen it)
        needMove = true;                       // (and the pill sliding up under a still mouse doesn't open either)
        clearTimeout(settleTimer);
        setState('default');
      } else {
        pinned = p.dataset.state;
        if (state !== pinned) setState(pinned);
      }
    });
  });

  // play only while the explorer is on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      onScreen = en.isIntersecting;
      syncScreens();
    }, { threshold: 0.15 }).observe(ex);
  } else { onScreen = true; }

  // ---- intro: like the Overview pills, each pops in as a circle around its plus, then one
  // by one they stretch open (a little bouncy) to show their name, so they read as
  // something to click. Replays whenever the explorer comes back on screen, unless a
  // pill is open.
  const labels = pills.map((p) => p.querySelector('.lf-label'));
  let introTl = null;
  const canIntro = window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function introReset() {
    if (introTl) { introTl.kill(); introTl = null; }
    if (state !== 'default') return;
    ex.classList.add('is-intro');                       // (no CSS width transitions while gsap drives it)
    gsap.set(pills, { width: CLOSED_H, scale: 0, opacity: 0 });
    gsap.set(labels, { opacity: 0 });
  }
  function introPlay() {
    if (state !== 'default') return;
    introReset();
    const widths = pills.map((p) => parseFloat(p.style.getPropertyValue('--w')) || p.offsetWidth);
    introTl = gsap.timeline({ onComplete: () => { gsap.set(pills, { clearProps: 'width,scale,opacity,transform' }); gsap.set(labels, { clearProps: 'opacity' }); ex.classList.remove('is-intro'); } })
      .to(pills, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.4)', stagger: 0.07 })
      .to(pills, { width: (i) => widths[i], duration: 0.7, ease: 'back.out(1.7)', stagger: 0.11 }, '-=0.2')   // (starts as the last circles land; was a 0.15s pause after)
      .to(labels, { opacity: 1, duration: 0.35, ease: 'power1.out', stagger: 0.11 }, '<0.05');
  }
  // clicking mid-intro: finish it at once
  pills.forEach((p) => p.addEventListener('pointerdown', () => { if (introTl) introTl.progress(1); }));

  scaleHero();
  setState('default');
  if (canIntro) {
    introReset();
    ScrollTrigger.create({
      trigger: ex,
      start: 'top 60%',      // plays when the explorer's top is 60% down the screen (scrolling down)…
      end: 'bottom 40%',     // …or its bottom is 40% down (scrolling back up)
      onEnter: introPlay,
      onEnterBack: introPlay,
      onLeave: introReset,
      onLeaveBack: introReset,
    });
  }
  window.addEventListener('resize', () => { scaleHero(); sizeAll(); });
  document.fonts && document.fonts.ready.then(sizeAll);
})();
