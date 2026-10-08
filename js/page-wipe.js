// PAGE WIPE — shared by the project pages and the who page.
// (Also holds small shared helpers: cursor-dot fade, off-screen loop pausing.)
//  • Entering: the page opens under the navy splash, which slides up and away
//    once the page has loaded (or after 4s at most, so it never gets stuck).
//  • Leaving: links to the homepage or another project first slide the splash
//    up over the screen, then navigate — the next page opens under the same splash.
(function () {
  const PROJECT_LABELS = { 'creatify': '[ creatify ]', 'deep24': '[ deep24 ]', 'knouri': '[ knouri ]', 'pent-up': '[ pent up ]', 'contact': '[ say hi ]' };

  // ---------- entering ----------
  const overlay = document.getElementById('page-entry-overlay');
  if (overlay) {
    const label = overlay.querySelector('.page-wipe-label');
    let revealed = false;

    function reveal() {
      if (revealed) return;
      revealed = true;
      gsap.to(overlay, {
        y: -(window.innerHeight + 40),
        duration: 0.7,
        ease: 'power3.inOut',
        delay: 0.15,
        onStart: () => {
          if (label) { label.style.transition = 'none'; gsap.to(label, { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }); }
        },
        onComplete: () => overlay.remove(),
      });
    }

    if (document.readyState === 'complete') reveal();
    else window.addEventListener('load', reveal);
    setTimeout(reveal, 4000);
  }

  // ---------- leaving ----------
  // Works out where a link goes. Returns { url, label } for the homepage or a
  // project page (as a relative link, so it works locally and on the live site),
  // or null for anything else (email, LinkedIn…).
  function wipeTarget(a) {
    let u;
    try { u = new URL(a.getAttribute('href'), location.href); } catch (e) { return null; }
    const sameSite = u.origin === location.origin || u.hostname === 'melodysz.github.io';
    if (!sameSite) return null;
    // a link within this same page (e.g. a section link like "#problem"): not a page change, no wipe
    if (u.origin === location.origin && u.pathname === location.pathname) return null;
    const seg = u.pathname.replace(/^\/fishtank/, '').split('/').filter(Boolean)[0] || '';
    if (seg === '' || seg === 'index.html') {
      const hash = u.hash && u.hash !== '#' && u.hash !== '#skip' ? u.hash : '';
      const HASH_LABELS = { '#third-section': '[ work ]', '#who': '[ who ]', '#play': '[ play ]' };
      return { url: '../' + hash, label: HASH_LABELS[hash] || '[ home ]', home: true };
    }
    if (PROJECT_LABELS[seg]) return { url: '../' + seg + '/', label: PROJECT_LABELS[seg] };
    return null;
  }

  let leaving = false;
  function wipeOut(target) {
    if (leaving) return;
    leaving = true;
    if (typeof lenis !== 'undefined' && lenis.stop) lenis.stop();

    const cover = document.createElement('div');
    cover.className = 'page-wipe label-ready';
    const text = document.createElement('div');
    text.className = 'page-wipe-label';
    text.style.transition = 'none';
    cover.appendChild(text);
    window.fishtankSplash?.render(cover, target.label);   // design: js/splash.js
    document.body.appendChild(cover);

    // tells the homepage to open under the splash too
    if (target.home) { try { sessionStorage.setItem('fishtankWipe', target.label); } catch (e) {} }

    gsap.set(text, { opacity: 0 });
    window.fishtankSplash?.play(cover);
    gsap.fromTo(cover, { y: window.innerHeight }, {
      y: 0,
      duration: 0.7,
      ease: 'power3.inOut',
      onStart: () => gsap.fromTo(text, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out', delay: 0.1 }),
      onComplete: () => setTimeout(() => { window.location.href = target.url; }, 850),   // linger till the asterisk's spin settles
    });
  }

  // Runs before the page's own link handlers, so every route home / to a project gets the wipe
  document.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new-tab clicks behave normally
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    const target = wipeTarget(a);
    if (!target) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    wipeOut(target);
  }, true);

  // ---------- cursor dot: fade out when the mouse leaves the window ----------
  const cursorDot = document.getElementById('cursor');
  if (cursorDot) {
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) cursorDot.classList.add('is-away'); });
    document.addEventListener('mouseover', () => cursorDot.classList.remove('is-away'));
    window.addEventListener('blur', () => cursorDot.classList.add('is-away')); // switched to another app
  }

  // ---------- pause looping decorations while they're off screen ----------
  // (spinning footer star, Deep24's hero orbit) — nothing to redraw when you can't see them.
  // "Visible" = inside the window AND not faded out (Deep24's hero stays pinned
  // but fades its orbit to nothing as you scroll).
  window.addEventListener('load', () => {
    const loops = ['#case-footer-star-icon', '#deep24-orbit-inner']
      .map((sel) => document.querySelector(sel))
      .filter(Boolean)
      .map((el) => ({ el, faded: el.closest('.hero-orbit-wrapper') || el, onScreen: true }));
    if (!loops.length) return;

    const update = () => loops.forEach((l) => {
      const visible = l.onScreen && Number(gsap.getProperty(l.faded, 'opacity')) > 0.01;
      gsap.getTweensOf(l.el).forEach((t) => t.paused(!visible));
    });

    if ('IntersectionObserver' in window) {
      loops.forEach((l) => new IntersectionObserver(([entry]) => { l.onScreen = entry.isIntersecting; update(); }).observe(l.faded));
    }
    let queued = false;
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; update(); });
    }, { passive: true });
  });
  // ---------- nav pill turns grey over bright backgrounds ----------
  // The top nav is see-through white, so over a white (or very bright) section
  // it disappears. While the background behind it is a bright solid colour,
  // body gets .nav-on-light and the pill takes the bottom nav's grey frost
  // (css/page-wipe.css). Pictures, videos and gradients count as "not bright".
  (function () {
    const pill = document.getElementById('navPill');
    if (!pill) return;
    const SKIP = '.nav-pill-wrap, .work-bubble, .bubble-dots-wrap, .cursor-dot, #scroll-progress, .sidebar-nav, #page-entry-overlay, .page-wipe';
    const MEDIA = /^(IMG|VIDEO|CANVAS|SVG|PICTURE|IFRAME)$/i;
    const BRIGHT = 0.95; // 1 = pure white. The grey section boxes (#F5F5F7 = 0.91) stay below it

    function brightness(rgb) {
      const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
      return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
    }

    // Is the first solid thing under this point bright?
    function brightAt(x, y) {
      for (const el of document.elementsFromPoint(x, y)) {
        if (el.closest(SKIP)) continue;
        if (MEDIA.test(el.tagName)) return false;
        const cs = getComputedStyle(el);
        if (parseFloat(cs.opacity) < 0.5) continue; // faded out: look further down
        if (cs.backgroundImage !== 'none') return false;
        const m = cs.backgroundColor.match(/[\d.]+/g);
        if (!m) continue;
        const alpha = m.length > 3 ? parseFloat(m[3]) : 1;
        if (alpha < 0.85) continue; // see-through: look further down
        return brightness(m.map(Number)) >= BRIGHT;
      }
      return true; // nothing solid at all = the plain page (white)
    }

    function update() {
      const r = pill.getBoundingClientRect();
      if (!r.width) return;
      // elementsFromPoint skips anything with pointer-events: none (lots of
      // pictures/decorations), so switch those back on just while we look
      const root = document.documentElement;
      root.classList.add('nav-probe');
      const y = r.top + r.height / 2;
      const steps = 5;
      let bright = 0;
      for (let i = 0; i < steps; i++) {
        if (brightAt(r.left + (r.width * (i + 0.5)) / steps, y)) bright++;
      }
      root.classList.remove('nav-probe');
      document.body.classList.toggle('nav-on-light', bright > steps / 2);
      updateSide();
    }

    // The bottom section nav (case studies) does the same, the other way round: its pills
    // are grey frost, which is right over white, but over grey boxes, pictures, videos and
    // dark sections they switch to the top nav's lighter white frost (.sidenav-off-light).
    const side = document.querySelector('.sidebar-nav');
    function updateSide() {
      if (!side) return;
      const links = [...side.querySelectorAll('.nav-link')];
      const boxes = links.map((l) => l.getBoundingClientRect()).filter((b) => b.width);
      if (!boxes.length || !side.classList.contains('visible')) return;
      const root = document.documentElement;
      root.classList.add('nav-probe');
      let bright = 0;
      boxes.forEach((b) => { if (brightAt(b.left + b.width / 2, b.top + b.height / 2)) bright++; });
      root.classList.remove('nav-probe');
      document.body.classList.toggle('sidenav-off-light', bright <= boxes.length / 2);
    }
    if (side) new MutationObserver(updateSide).observe(side, { attributes: true, attributeFilter: ['class'] });

    // check while scrolling (at most ~3 times a second: each check costs ~10ms) and once it settles
    let last = 0, timer = null;
    function schedule() {
      const now = performance.now();
      if (now - last > 330) { last = now; update(); }
      clearTimeout(timer);
      timer = setTimeout(update, 140);
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    pill.addEventListener('transitionend', schedule); // opened / closed
    window.addEventListener('load', update);
    update();
  })();
})();
