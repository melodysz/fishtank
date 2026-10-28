// PROBLEM WHEEL (DRAFT): Agent's capabilities on a big wheel around a hub just off the
// Problem card's top-right corner. Scroll drives it: the wheel turns as you scroll (and
// back when you scroll up). Look + sizes: style.css "Problem wheel".
//
// What's on the wheel (data-shape on .pb-wheel, or the "wheel" switch bottom-left, which
// remembers your pick):
//   chips  capability chips (icon + name), like the hero's chips; they stay upright
//   icons  round badges with just the icon; also upright
//   bars / dots  the plain placeholder shapes from the first draft
// …and, for chips + icons, which way they face (data-orient, same switch):
//   upright  level, like seats on a Ferris wheel
//   radial   lined up with their spoke, pointing at the hub (chips whose words would end
//            up upside down are turned round, so they always read left to right)
(() => {
  const TURN = 40;   // degrees it turns while the corner crosses the screen (was 90: lower = slower than your scrolling)

  // The capabilities, in order around the wheel. Names from the case study + placeholders
  // to swap for real ones; icon = a file in agent-icons/.
  const CAPABILITIES = [
    ['Skills', 'quick'], ['Video ads', 'play'], ['Image ads', 'image'], ['Competitor research', 'search'],
    ['UGC Unwrap', 'quick'], ['Voiceover', 'mic'], ['Product ads', 'product'], ['UGC Showcase', 'quick'],
    ['Auto mode', 'fast-forward'], ['UGC Confessional', 'quick'], ['Ad analysis', 'search'], ['Product photos', 'image'],
    ['Custom skills', 'add'], ['TikTok hooks', 'play'], ['Brand kit', 'product'], ['Script writer', 'quick'],
    ['Avatar videos', 'play'], ['URL to video', 'fast-forward'], ['Batch mode', 'add'], ['Hook ideas', 'quick'],
    ['Meta ads', 'image'], ['Captions', 'mic'], ['Trend research', 'search'],
  ];
  // how many go round the wheel (fewer = farther apart): chips + icons are packed closer
  // than the plain shapes
  const COUNT = { chips: 22, icons: 16 };   // (icons sit on a smaller wheel: fewer, so they don't touch)
  const SHAPES = ['chips', 'icons', 'bars', 'dots'];
  const STORE = 'cfWheelShape', STORE_ORIENT = 'cfWheelOrient';
  // icons: the circle in the middle of the corner is the biggest, and they shrink the further
  // they are from it (it follows the turn: each one grows as it passes the middle)
  const SIZE_MAX = 1.35;    // the middle one (1 = the normal size in style.css)
  const SIZE_MIN = 0.8;     // the ones furthest away (was 0.55)
  const SIZE_SPREAD = 28;   // degrees round the wheel it takes to shrink (bigger = gentler)

  const wheel = document.querySelector('.pb-wheel');
  if (!wheel) return;
  const area = wheel.parentElement;   // the corner (what the scroll is measured on)
  const baseCount = Number(wheel.dataset.count) || 15;

  function build(shape) {
    wheel.dataset.shape = shape;
    wheel.replaceChildren();
    const count = COUNT[shape] || baseCount;
    for (let i = 0; i < count; i++) {
      const w = document.createElement('div');
      w.className = 'pb-widget';
      const a = (360 / count) * i;
      w.style.setProperty('--a', `${a}deg`);
      // (radial: turn it round if its words would read upside down, judged halfway through the turn)
      if (Math.cos((a + TURN / 2) * Math.PI / 180) < 0) w.style.setProperty('--flip', '180deg');
      const [name, icon] = CAPABILITIES[i % CAPABILITIES.length];
      const ic = `<i class="pb-icon" style="--i:url(agent-icons/${icon}.svg)"></i>`;
      if (shape === 'chips') w.innerHTML = `${ic}<span>${name}</span>`;
      if (shape === 'icons') { w.innerHTML = ic; w.title = name; }
      wheel.appendChild(w);
    }
    document.querySelectorAll('.wheel-toggle button[data-shape]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.shape === shape)));
  }
  function orient(o) {
    wheel.dataset.orient = o;
    document.querySelectorAll('.wheel-toggle button[data-orient]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.orient === o)));
  }

  // the draft switch (bottom-left, above classic / tabs)
  let saved = null, savedOrient = null;
  try { saved = localStorage.getItem(STORE); savedOrient = localStorage.getItem(STORE_ORIENT); } catch (e) {}
  const toggle = document.createElement('div');
  toggle.className = 'wheel-toggle';
  toggle.dataset.devUi = '';   // (doubletake's Shift+H hides it)
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Problem wheel visuals (draft)');
  toggle.innerHTML = '<span>wheel</span>' + SHAPES.map((s) => `<button type="button" class="interactable" data-shape="${s}">${s}</button>`).join('')
    + '<i class="wheel-toggle-sep"></i>' + ['upright', 'radial'].map((o) => `<button type="button" class="interactable" data-orient="${o}">${o}</button>`).join('');
  document.body.appendChild(toggle);
  toggle.addEventListener('click', (e) => {
    const ob = e.target.closest('button[data-orient]');
    if (ob) { try { localStorage.setItem(STORE_ORIENT, ob.dataset.orient); } catch (err) {} orient(ob.dataset.orient); return; }
    const b = e.target.closest('button[data-shape]');
    if (!b) return;
    try { localStorage.setItem(STORE, b.dataset.shape); } catch (err) {}
    build(b.dataset.shape);
    schedule();
  });
  build(SHAPES.includes(saved) ? saved : (wheel.dataset.shape || 'chips'));
  orient(savedOrient === 'radial' ? 'radial' : 'upright');

  // the middle = halfway along the stretch of the wheel that shows inside the gray card
  function sizeByMiddle() {
    const card = area.parentElement.getBoundingClientRect();
    if (!card.width) return;   // (corner hidden on narrow screens)
    const hub = wheel.getBoundingClientRect();
    const ws = [...wheel.children];
    const pts = ws.map((w) => { const b = w.getBoundingClientRect(); return [b.left + b.width / 2 - hub.left, b.top + b.height / 2 - hub.top]; });
    const R = Math.hypot(...pts[0]);
    let first = null, last = null;
    for (let t = 0; t < 360; t += 0.5) {
      const x = hub.left + R * Math.cos(t * Math.PI / 180), y = hub.top + R * Math.sin(t * Math.PI / 180);
      if (x >= card.left && x <= card.right && y >= card.top && y <= card.bottom) { if (first === null) first = t; last = t; }
    }
    if (first === null) return;
    const mid = (first + last) / 2;
    ws.forEach((w, i) => {
      const ang = Math.atan2(pts[i][1], pts[i][0]) * 180 / Math.PI;
      const d = ((ang - mid + 540) % 360) - 180;
      w.style.setProperty('--s', (SIZE_MIN + (SIZE_MAX - SIZE_MIN) * Math.exp(-((d / SIZE_SPREAD) ** 2))).toFixed(3));
    });
  }

  let queued = false;
  function update() {
    queued = false;
    const r = area.getBoundingClientRect(), vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));   // 0 = entering at the bottom, 1 = gone off the top
    const deg = (TURN * p).toFixed(2) + 'deg';
    wheel.style.rotate = deg;
    wheel.style.setProperty('--wheel-rot', deg);   // (chips + icons turn back by this, to stay upright)
    if (wheel.dataset.shape === 'icons') sizeByMiddle();
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { schedule(); return; }
  window.addEventListener('resize', schedule);

  // only listen while the corner is near the screen
  let on = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting === on) return;
    on = e.isIntersecting;
    window[on ? 'addEventListener' : 'removeEventListener']('scroll', schedule, { passive: true });
    if (on) schedule();
  }, { rootMargin: '20% 0px' }).observe(area);
  schedule();
})();
