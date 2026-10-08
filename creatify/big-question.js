// THE BIG QUESTION
// Once the scene is at least 2/3 on screen, the grey box grows from a small circle into
// its rounded rectangle, then the eyebrow and the question fade in and
// un-blur. Plays once; it doesn't touch scrolling.
// (Used by every .bq-scene: the Problem's big question and Research's opportunity.)
document.querySelectorAll('.bq-scene').forEach((scene) => {
  const box = scene.querySelector('.bq-box');
  const words = [...scene.querySelectorAll('.bq-in')];
  const still = window.matchMedia('(max-width: 700px), (prefers-reduced-motion: reduce)');

  const SHOW_AT = 2 / 3;      // share of the scene on screen before it plays
  const DURATION = 1.9;       // s for the whole thing
  const CIRCLE_OF_H = 0.8;    // the starting circle, as a share of the box's height (was a 72px dot)
  const RADIUS = 30;          // the box's corner rounding at the end
  const GROW = [0, 0.3];      // share of DURATION spent growing (~0.57s; was 0.5 ≈ 0.95s)…
  const WORDS = [0.1, 0.5];   // …and fading the words in (starts early, while the box is still growing; was 0.26–0.7)

  const clamp = (v) => Math.max(0, Math.min(1, v));
  const span = (p, [a, b]) => clamp((p - a) / (b - a));
  const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const out = (t) => 1 - Math.pow(1 - t, 3);

  function render(p) {
    if (p >= 1 || still.matches) {
      box.style.clipPath = '';
      words.forEach((w) => { w.style.opacity = ''; w.style.transform = ''; w.style.filter = ''; });
      return;
    }
    const g = inOut(span(p, GROW));
    const W = box.offsetWidth, H = box.offsetHeight, CIRCLE = Math.min(W, H) * CIRCLE_OF_H;
    const ix = ((W - CIRCLE) / 2) * (1 - g), iy = ((H - CIRCLE) / 2) * (1 - g);
    const r = CIRCLE / 2 + (RADIUS - CIRCLE / 2) * g;
    box.style.clipPath = `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px round ${r.toFixed(1)}px)`;
    words.forEach((w, i) => {
      const t = out(span(p, [WORDS[0] + i * 0.08, WORDS[1] + i * 0.08]));   // the question a beat after the eyebrow
      w.style.opacity = t.toFixed(3);                                         // just fades in and un-blurs (no rise)
      w.style.filter = t < 1 ? `blur(${((1 - t) * 14).toFixed(1)}px)` : 'none';
    });
  }

  let played = false;
  function play() {
    if (played) return;
    played = true;
    if (still.matches || !window.gsap) { render(1); return; }
    const state = { p: 0 };
    gsap.to(state, { p: 1, duration: DURATION, ease: 'none', onUpdate: () => render(state.p), onComplete: () => render(1) });
  }

  if (still.matches || !('IntersectionObserver' in window)) { render(1); return; }
  render(0);                                  // waiting: just the small circle
  new IntersectionObserver(([en], obs) => {
    if (en.intersectionRatio >= SHOW_AT) { play(); obs.disconnect(); }
  }, { threshold: [SHOW_AT] }).observe(scene);
});
