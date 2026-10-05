// ===================================
// THE PROBLEM: OLD AGENT SCREENSHOT WITH POP-UP LABELS
// ===================================
// The moment the screenshot enters the screen it starts growing (tied to scroll),
// reaching the full section width when it's centred on screen; it darkens near the
// end, then the frosted labels pop in one by one. Nothing is pinned: the stage is
// given the grown image's height up front, so the page just has a little more
// scroll here and the growing image never covers the text below it.
// Hovering a label opens its note (tap/click keeps it open); "See all" opens all.
// Phones and reduced motion skip the growing (see .is-static / .is-list).

(() => {
  const stage = document.getElementById('problemShot');
  if (!stage) return;

  const frame = stage.querySelector('.ps-frame');
  const dim = stage.querySelector('.ps-dim');
  const pillsBox = stage.querySelector('.ps-pills');
  const seeAll = stage.querySelector('.ps-see-all');
  const pills = [...stage.querySelectorAll('.ps-pill:not(.ps-see-all)')];
  const marks = [...stage.querySelectorAll('.ps-marks [data-k]')];   // outlines; data-k = which label they belong to

  const DIM = 0.45;          // how dark the screenshot gets under the labels
  const DIM_FROM = 0.6;      // darkening starts this far through the growing (0–1)
  const FULL_AT = '58%';     // fully grown when its middle is 58% down the screen (50% = centred)
  const LABELS_AT = 0.97;    // labels pop in once the growing is this far along
  const LABELS_HIDE = 0.75;  // ...but once up, they linger while scrolling back until it's shrunk back past this
  const RADIUS = 20;         // corner rounding, kept the same on screen while it grows
  const SCREEN_MARGIN = 45;  // grown image keeps at least this gap to the top/bottom of the screen
  const PILL_PAD_LEFT = 49;  // text starts after the icon (Figma)
  const PILL_PAD_RIGHT = 19;
  const PILL_PAD_Y = 15;
  const PILL_HEIGHT = 55;
  const OPEN_WIDTH = 288;
  const SEE_ALL_HEIGHT = 41;
  const SEE_ALL_PAD_RIGHT = 15;

  [...pills, seeAll].forEach((p, i) => p.style.setProperty('--i', i));

  // ---------- open / close ----------

  let showAll = false;
  const hovered = new Set();
  const stuck = new Set();     // clicked/tapped open

  function sizePill(p) {
    if (stage.classList.contains('is-list')) { p.style.removeProperty('--w'); p.style.removeProperty('--h'); return; }
    const detail = p.querySelector('.ps-detail');
    if (p.classList.contains('is-open') && detail) {
      p.style.setProperty('--w', OPEN_WIDTH + 'px');
      p.style.setProperty('--h', Math.max(PILL_HEIGHT, detail.offsetHeight + PILL_PAD_Y * 2) + 'px');
    } else {
      const label = p.querySelector('.ps-label');
      const isSeeAll = p === seeAll;   // shorter, with a tighter right side (Figma)
      p.style.setProperty('--w', Math.ceil(PILL_PAD_LEFT + label.offsetWidth + (isSeeAll ? SEE_ALL_PAD_RIGHT : PILL_PAD_RIGHT)) + 'px');
      p.style.setProperty('--h', (isSeeAll ? SEE_ALL_HEIGHT : PILL_HEIGHT) + 'px');
    }
  }

  function render() {
    pills.forEach(p => {
      const open = showAll || stuck.has(p) || hovered.has(p);
      if (open === p.classList.contains('is-open')) return;
      p.classList.toggle('is-open', open);
      p.setAttribute('aria-expanded', open);
      sizePill(p);
    });
    seeAll.classList.toggle('is-open', showAll);
    seeAll.setAttribute('aria-expanded', showAll);
    seeAll.querySelector('.ps-label').textContent = showAll ? 'Hide all' : 'See all';
    // a label's outlines show while it's open; hovering a label fades the others back
    marks.forEach(m => {
      m.classList.toggle('is-on', pills[+m.dataset.k].classList.contains('is-open'));
      m.classList.toggle('is-hovered', hovered.has(pills[+m.dataset.k]));
    });
    pills.forEach(p => p.classList.toggle('is-hovered', hovered.has(p)));
    stage.classList.toggle('is-focusing', hovered.size > 0);
    sizePill(seeAll);
  }

  const sizeAllPills = () => [...pills, seeAll].forEach(sizePill);

  // line each label's frost (its ::after, a blurred copy of the screenshot) up with
  // the screenshot behind it: the label's spot in the image + the image's size
  function placeGlass() {
    pillsBox.style.setProperty('--gw', pillsBox.offsetWidth + 'px');
    pillsBox.style.setProperty('--gh', pillsBox.offsetHeight + 'px');
    [...pills, seeAll].forEach(p => {
      p.style.setProperty('--gx', p.offsetLeft + 'px');
      p.style.setProperty('--gy', p.offsetTop + 'px');
    });
  }

  pills.forEach(p => {
    // hover opens (mouse only; on touch the tap below does it)
    p.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovered.add(p); render(); } });
    p.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hovered.delete(p); render(); } });
    p.addEventListener('click', () => {
      if (stuck.has(p)) { stuck.delete(p); hovered.delete(p); } else stuck.add(p);
      render();
    });
  });

  seeAll.addEventListener('click', () => {
    showAll = !showAll;
    if (!showAll) stuck.clear();
    render();
  });

  // ---------- no growing: phones + reduced motion ----------

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = window.matchMedia('(max-width: 760px)');

  if (reduceMotion || phone.matches || !window.gsap || !window.ScrollTrigger) {
    stage.classList.add('is-static', 'is-labeled');
    stage.classList.toggle('is-list', phone.matches);
    sizeAllPills();
    placeGlass();
    window.addEventListener('resize', placeGlass);
    document.fonts.ready.then(() => { sizeAllPills(); placeGlass(); });
    return;
  }

  // ---------- growing on scroll ----------

  let scale = 1;

  // start size = the column width; grown size = the section's full width (its
  // side margins stay), or less if that wouldn't fit the screen's height
  function measure() {
    const w0 = stage.offsetWidth;
    const section = stage.closest('.cf-section') || stage.parentElement;
    const maxByHeight = (window.innerHeight - SCREEN_MARGIN * 2) * 16 / 9;
    const w = Math.max(w0, Math.min(section.clientWidth, maxByHeight));
    scale = w / w0;
    stage.style.setProperty('--ps-w0', w0 + 'px');
    stage.style.setProperty('--ps-h0', w0 * 9 / 16 + 'px');
    stage.style.setProperty('--ps-w', w + 'px');
    stage.style.setProperty('--ps-h', w * 9 / 16 + 'px');
  }

  stage.classList.add('is-anim');
  measure();
  gsap.set(frame, { xPercent: -50 });

  const labelsThreshold = () => stage.classList.contains('is-labeled') ? LABELS_HIDE : LABELS_AT;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: 'top bottom',       // the moment it peeks in
      end: 'center ' + FULL_AT,  // fully grown (labels in) when its middle is this far down the screen
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: self => setLabeled(self.progress >= labelsThreshold()),
      onRefresh: self => { setLabeled(self.progress >= LABELS_AT); sizeAllPills(); placeGlass(); },
    },
  });

  tl.fromTo(frame, { scale: 1, borderRadius: RADIUS }, { scale: () => scale, borderRadius: () => RADIUS / scale, ease: 'none', duration: 1 }, 0)
    .fromTo(dim, { opacity: 0 }, { opacity: DIM, ease: 'none', duration: 1 - DIM_FROM }, DIM_FROM);

  function setLabeled(on) {
    if (on === stage.classList.contains('is-labeled')) return;
    stage.classList.toggle('is-labeled', on);
    pillsBox.inert = !on;        // hidden labels can't be tabbed to
  }

  pillsBox.inert = true;
  ScrollTrigger.addEventListener('refreshInit', measure);   // re-measure on resize
  sizeAllPills();
  placeGlass();
  ScrollTrigger.refresh();       // the stage just got taller: move the triggers below it
  document.fonts.ready.then(() => { sizeAllPills(); ScrollTrigger.refresh(); });
})();
