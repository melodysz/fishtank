// PAGE WIPE — shared by the project pages and the who page.
// (Also holds small shared helpers: cursor-dot fade, off-screen loop pausing.)
//  • Entering: the page opens under the navy splash, which slides up and away
//    once the page has loaded (or after 4s at most, so it never gets stuck).
//  • Leaving: links to the homepage or another project first slide the splash
//    up over the screen, then navigate — the next page opens under the same splash.
(function () {
  const PROJECT_LABELS = { 'deep24': '[ deep24 ]', 'knouri': '[ knouri ]', 'pent-up': '[ pent up ]', 'who': '[ who ]', 'contact': '[ say hi ]' };

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
    const seg = u.pathname.replace(/^\/fishtank/, '').split('/').filter(Boolean)[0] || '';
    if (seg === '' || seg === 'index.html') {
      const hash = u.hash && u.hash !== '#' && u.hash !== '#skip' ? u.hash : '';
      return { url: '../' + hash, label: hash === '#third-section' ? '[ work ]' : '[ home ]', home: true };
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
    const text = document.createElement('span');
    text.className = 'page-wipe-label';
    text.textContent = target.label;
    text.style.transition = 'none';
    cover.appendChild(text);
    document.body.appendChild(cover);

    // tells the homepage to open under the splash too
    if (target.home) { try { sessionStorage.setItem('fishtankWipe', target.label); } catch (e) {} }

    gsap.set(text, { opacity: 0 });
    gsap.fromTo(cover, { y: window.innerHeight }, {
      y: 0,
      duration: 0.7,
      ease: 'power3.inOut',
      onStart: () => gsap.fromTo(text, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.25 }),
      onComplete: () => setTimeout(() => { window.location.href = target.url; }, 250),
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
})();
