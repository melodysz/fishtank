// RESEARCH CARDS
// Four cards in a row, one open at a time (the others fold into tabs). Clicking a
// tab, a sideways trackpad swipe or a sideways drag changes card.
// (Optional, off: SCROLL_DRIVEN locks the row in place while scrolling opens the
// next card, and moves the page's scroll to match when you pick one yourself.) (Same idea as the shelved scroll-pinned
// highlights experiment in ~/fishtank-experiments.)
// Small screens (≤1000px) skip all this: the cards simply stack, all open (CSS).
(() => {
  const pin = document.getElementById('researchPin');
  if (!pin) return;
  const stick = pin.querySelector('.rs-stick');
  const strip = pin.querySelector('.rs-strip');
  const cards = [...strip.querySelectorAll('.rs-card')];
  const wide = window.matchMedia('(min-width: 1001px)');

  // Scroll-driven mode (row locks in place, scrolling opens the next card) is off: it
  // interrupted scrolling momentum. true turns it back on.
  const SCROLL_DRIVEN = false;
  const SCROLL_STEP = () => window.innerHeight * 0.2;    // px of scrolling per card
  const SWIPE_MIN = 40;                                   // px of sideways movement that counts as a swipe

  // Every card starts folded (the tabs sit centred); card 01 opens once the row is
  // far enough up the screen — the same trigger as the Problem screenshot's labels:
  // its middle reaching 58% down the screen. It only happens once: after that the
  // cards stay open, whichever way you scroll.
  const OPEN_AT = 0.97;   // (progress from "top peeks in" to "middle 58% down")
  let active = -1, lastOpen = 0;
  function open(i) {
    i = i < 0 ? -1 : Math.min(cards.length - 1, i);
    if (i === active) return;
    if (i >= 0) lastOpen = i;
    active = i;
    cards.forEach((c, k) => {
      c.classList.toggle('is-open', k === i);
      c.querySelector('.rs-tab').setAttribute('aria-expanded', k === i);
    });
    setSlideSides();
    if (i >= 0 && cards[i].querySelector('.rs-shot')) introShots();
  }

  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: strip,
      start: 'top bottom',
      end: 'center 58%',
      // opens once; after that the cards stay open (scrolling back up doesn't fold them)
      onUpdate: (self) => {
        if (!wide.matches) return;
        if (active < 0 && self.progress >= OPEN_AT) open(lastOpen);
      },
      onRefresh: (self) => { if (self.progress >= OPEN_AT && active < 0) open(lastOpen); },
    });
  } else open(0);

  // Which side each folded card's contents will slide in from, set ahead of time (so
  // it's already in place when the card opens): a card right of the open one grows
  // leftwards, so its contents come from the right; left of it, from the left. With all
  // folded, the left two open rightwards (from the left), the right two leftwards.
  function setSlideSides() {
    cards.forEach((c, k) => {
      if (k === active) return;
      c.dataset.from = active >= 0 ? (k > active ? 'right' : 'left') : (k < cards.length / 2 ? 'left' : 'right');
    });
  }
  setSlideSides();

  // ---------- card 03: the two screenshots bounce in, one after the other ----------
  // (like the homepage project cards' graphics: a hop up, then a bounce to a stop).
  // Higgsfield starts on top; the one behind lands first.
  const shots = [...strip.querySelectorAll('.rs-shot')];
  const shotImgs = shots.map((s) => s.querySelector('img'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function introShots() {
    shots.forEach((s) => s.classList.toggle('is-top', s.classList.contains('rs-shot-back')));
    if (!window.gsap || reduceMotion || !wide.matches) return;
    const order = [shotImgs[1], shotImgs[0]];        // behind (Creatify) first, then Higgsfield on top
    gsap.killTweensOf(shotImgs);
    gsap.set(shotImgs, { y: 70, opacity: 0 });
    const delay = parseFloat(getComputedStyle(strip).getPropertyValue('--rs-dur')) * 0.55 || 0.3;
    order.forEach((img, k) => {
      gsap.timeline({ delay: delay + k * 0.12 })
        .to(img, { y: -14, opacity: 1, duration: 0.24, ease: 'power2.out' })   // hop up past its spot…
        .to(img, { y: 0, duration: 0.6, ease: 'bounce.out' });                 // …and bounce to a stop
    });
  }

  // ---------- locked in place while scrolling ----------
  let stickTop = 0, lastH = '';
  const lenis = () => window.cfLenis || null;
  const pinStart = () => pin.getBoundingClientRect().top + window.scrollY - stickTop;
  pin.classList.toggle('is-scroll-driven', SCROLL_DRIVEN);
  function measure() {
    if (!SCROLL_DRIVEN || !wide.matches) { pin.style.height = ''; lastH = ''; return; }
    const h = stick.offsetHeight;
    stickTop = Math.round((window.innerHeight - h) / 2);
    stick.style.setProperty('--rs-stick-top', stickTop + 'px');
    const pinH = h + (cards.length - 1) * SCROLL_STEP() + 'px';
    if (pinH === lastH) return;
    lastH = pin.style.height = pinH;
    if (window.ScrollTrigger) ScrollTrigger.refresh();   // (everything below moved down)
  }
  const cardForScroll = () =>
    Math.max(0, Math.min(cards.length - 1, Math.round((window.scrollY - pinStart()) / SCROLL_STEP())));

  let scrollIndex = 0, syncUntil = 0;
  function onScroll() {
    if (!SCROLL_DRIVEN || !wide.matches || performance.now() < syncUntil) return;
    const i = cardForScroll();
    if (i === scrollIndex) return;
    scrollIndex = i;
    open(i);
  }
  // picking a card yourself moves the page's scroll to that card's spot
  function go(i) {
    i = Math.max(0, Math.min(cards.length - 1, i));
    if (i === active) return;
    open(i);
    if (!SCROLL_DRIVEN || !wide.matches || i === scrollIndex) return;
    scrollIndex = i;
    const start = pinStart(), y = start + i * SCROLL_STEP();
    const locked = window.scrollY >= start - 1 && window.scrollY <= start + (cards.length - 1) * SCROLL_STEP() + 1;
    const duration = locked ? 0 : 0.9;              // locked in: jump (nothing on screen moves); otherwise glide there
    syncUntil = performance.now() + duration * 1000 + 150;
    const l = lenis();
    if (l) l.scrollTo(y, locked ? { immediate: true, force: true } : { duration, force: true });
    else window.scrollTo({ top: y, behavior: locked ? 'auto' : 'smooth' });
  }

  // ---------- clicking a tab ----------
  cards.forEach((c, k) => {
    const tab = c.querySelector('.rs-tab');
    tab.setAttribute('aria-expanded', k === active);
    tab.addEventListener('click', () => { if (!dragMoved) go(k); });
  });

  // ---------- sideways trackpad swipe: one card per swipe ----------
  let swipe = { acc: 0, done: false, lastT: 0 };
  strip.addEventListener('wheel', (e) => {
    if (!wide.matches) return;
    const now = performance.now();
    if (now - swipe.lastT > 250) swipe = { acc: 0, done: false, lastT: now };   // a new gesture
    swipe.lastT = now;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;                  // up/down: let the page scroll
    e.preventDefault();          // (no browser back/forward swipe)
    e.stopPropagation();         // (keep the smooth-scroll library out of it)
    if (swipe.done) return;      // the rest of this swipe (incl. its coasting) does nothing
    swipe.acc += e.deltaX;
    if (Math.abs(swipe.acc) >= SWIPE_MIN) { swipe.done = true; go(Math.max(0, active + Math.sign(swipe.acc))); }
  }, { passive: false });

  // ---------- sideways drag (mouse / pen): one card per drag ----------
  let drag = null, dragMoved = false;
  strip.addEventListener('pointerdown', (e) => {
    if (!wide.matches || e.pointerType === 'touch' || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY };
    dragMoved = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (drag && Math.abs(e.clientX - drag.x) > 6) dragMoved = true;
  });
  window.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag = null;
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) go(Math.max(0, active - Math.sign(dx)));
    setTimeout(() => { dragMoved = false; }, 0);   // (a drag that ends on a tab isn't a click)
  });
  strip.addEventListener('dragstart', (e) => e.preventDefault());

  // ---------- card 03: click the screenshot behind to bring it to the front ----------
  // (the one already in front opens full size instead)
  shots.forEach((shot) => shot.addEventListener('click', () => {
    if (dragMoved) return;
    if (shot.classList.contains('is-top')) {
      if (window.cfLightbox) window.cfLightbox.open(shot.dataset.full, shot.querySelector('img').alt);
      return;
    }
    shots.forEach((s) => s.classList.toggle('is-top', s === shot));
    shot.classList.remove('is-popping'); void shot.offsetWidth; shot.classList.add('is-popping');
  }));

  // ---------- card 04 screenshots: click to see full size ----------
  strip.querySelectorAll('.rs-zoom').forEach((el) => el.addEventListener('click', () => {
    if (!dragMoved && window.cfLightbox) window.cfLightbox.open(el.dataset.full, el.alt);
  }));

  // ---------- set up ----------
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  wide.addEventListener('change', () => { measure(); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(stick);
  window.addEventListener('load', () => { measure(); if (SCROLL_DRIVEN) { scrollIndex = cardForScroll(); open(scrollIndex); } });
  measure();
  if (SCROLL_DRIVEN) { scrollIndex = cardForScroll(); open(scrollIndex); }
})();
