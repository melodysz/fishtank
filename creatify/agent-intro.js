// AGENT INTRO
// A full-screen stage with the hero's waves + dot grid (window.cfAgentWaves, from
// agent-hero.js). Scroll-linked like the Problem screenshot: from the moment it peeks in
// until its top is 25% down the screen, it grows from the text column's width
// (same shape as the screen, 30px corners) to the whole screen, edge to edge. The title
// fades in once it's most of the way there (OPEN_AT), and stays.
(() => {
  const section = document.getElementById('agentIntro');
  if (!section) return;
  const stage = section.querySelector('.ag-stage');
  const column = document.querySelector('#design .cf-inner');
  const still = window.matchMedia('(max-width: 700px), (prefers-reduced-motion: reduce)');
  const RADIUS = 30;
  const OPEN_AT = 0.82;          // share of the growing at which the title fades in

  // the waves: run only while the stage is on screen
  let onScreen = false;
  // (with the hero's white wave, so its bottom washes into the white page)
  const waves = window.cfAgentWaves ? window.cfAgentWaves(stage, () => onScreen && !document.hidden, { white: true }) : null;
  // its waves drift faster than the page hero's (1 = the hero's / Creatify's own pace)
  const SPEED = 1.8;
  if (waves && waves.setSpeed) waves.setSpeed(SPEED);
  // The first time it's half on screen, a big smooth swell rolls across the waves, left
  // to right (a few crests), then calms into the usual slow drift.
  const SWELL = 0.12;     // crest height, as a share of the screen's height
  const SWELL_S = 4.5;    // seconds until it's calm
  const CRESTS = 2.5;     // how many wavelengths roll past in that time
  let burst = false;
  function playBurst() {
    if (burst || !waves || !waves.setRipple || !window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    burst = true;
    const r = { amp: 0, phase: 0 };
    const H = waves.height();
    const apply = () => waves.setRipple(r.amp, r.phase);
    gsap.timeline({ onUpdate: apply, onComplete: () => waves.setRipple(0, 0) })
      .to(r, { phase: CRESTS, duration: SWELL_S, ease: 'power1.out' }, 0)                 // travels fast, then slows
      .to(r, { amp: SWELL * H, duration: 0.6, ease: 'sine.out' }, 0)                     // swells up…
      .to(r, { amp: 0, duration: SWELL_S - 0.6, ease: 'sine.inOut' }, 0.6);             // …and settles flat
    waves.wake();
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      onScreen = en.isIntersecting;
      if (onScreen && waves) { waves.start(true); waves.wake(); }   // (already settled: no slow rise, the bottom is white straight away)
      if (en.intersectionRatio >= 0.5) playBurst();   // (once it's half on screen, so the burst is seen)
    }, { threshold: [0, 0.5] }).observe(section);
  }

  const reveal = () => section.classList.add('is-in');
  const ease = (t) => t;         // even, like the Problem screenshot's grow (ease: 'none')
  function render(p) {
    if (still.matches) { stage.style.removeProperty('--ag-ix'); stage.style.removeProperty('--ag-iy'); stage.style.removeProperty('--ag-r'); reveal(); return; }
    const W = stage.clientWidth, H = stage.clientHeight;
    const w0 = Math.min(W, column ? column.getBoundingClientRect().width : W * 0.75);
    const h0 = w0 * H / W;
    const e = ease(Math.max(0, Math.min(1, p)));
    stage.style.setProperty('--ag-ix', ((W - w0) / 2 * (1 - e)).toFixed(1) + 'px');
    stage.style.setProperty('--ag-iy', ((H - h0) / 2 * (1 - e)).toFixed(1) + 'px');
    stage.style.setProperty('--ag-r', (RADIUS * (1 - e)).toFixed(1) + 'px');
    if (p >= OPEN_AT) reveal();
  }

  if (window.ScrollTrigger) {
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'top 25%',            // full screen once its top is 25% down: the last stretch stays full, so a little scrolling up and down doesn't shrink it
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });
    render(st.progress);
  } else render(1);
  still.addEventListener('change', () => render(1));
})();
