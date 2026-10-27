// ============================================================
// WHO + PLAY — panels inside the homepage.
// Instead of loading a new page, "who" and "play" open a full-screen panel
// over the homepage behind the same navy splash wipe, so the switch is always
// instant and seamless. The address bar shows #who / #play (so links and the
// Back button work), and closing drops you back exactly where you were.
// Links from the other pages go to ../#who and ../#play.
// ============================================================
(function () {
  const panels = { who: document.getElementById('whoPanel'), play: document.getElementById('playPanel') };
  if (!panels.who || !panels.play) return;
  // PLAY is switched off on the live site for now (see js/favicon.js): drop its panel
  const playOn = document.documentElement.classList.contains('show-play');
  if (!playOn) { panels.play.remove(); delete panels.play; }
  const splash = document.getElementById('work-wipe-overlay');
  const splashText = document.getElementById('work-wipe-text');
  // nav colour while each panel is open (the homepage's section colours don't suit white)
  const NAV_COLOR = { who: '#1D1D1F', play: '#3136E6' };

  let open = null;          // 'who' | 'play' | null
  let busy = false;
  let navColorBefore = null;

  // Splash rises (with its label), `midway` runs while the screen is covered,
  // then the splash carries on up and away.
  function wipe(label, midway) {
    busy = true;
    splash.style.pointerEvents = 'all';
    window.fishtankSplash.render(splash, label);   // design: js/splash.js
    window.fishtankSplash.play(splash, 330);
    gsap.killTweensOf([splash, splashText]);
    gsap.set(splash, { y: window.innerHeight });
    gsap.set(splashText, { opacity: 0, y: 0 });
    gsap.to(splashText, { opacity: 1, duration: 0.3, ease: 'power1.out', delay: 0.1 });   // rides up with the splash
    gsap.to(splash, {
      y: 0, duration: 0.6, ease: 'power3.inOut',
      onComplete: () => {
        midway();
        // (held long enough for the asterisk's spin to settle)
        gsap.to(splashText, { opacity: 0, y: -30, duration: 0.35, ease: 'power2.in', delay: 0.75 });
        gsap.to(splash, {
          y: -(window.innerHeight + 40), duration: 0.6, ease: 'power3.inOut', delay: 0.75,
          onComplete: () => {
            gsap.set(splash, { y: window.innerHeight + 40 });
            splash.style.pointerEvents = 'none';
            window.fishtankSplash.render(splash, '[ work ]');
            busy = false;
          },
        });
      },
    });
  }

  // Switch which panel is showing (instantly — the splash hides the swap).
  function show(name) {
    if (open === 'play' && name !== 'play') playPanel.closeLightbox();
    Object.entries(panels).forEach(([k, el]) => {
      el.classList.toggle('is-open', k === name);
      el.setAttribute('aria-hidden', k === name ? 'false' : 'true');
    });
    if (name && !open) navColorBefore = getComputedStyle(document.querySelector('.nav-wordmark')).color;
    open = name;
    window.fishtankPanelOpen = !!name;
    // each panel has its own cursor colour (see "cursor colour per panel" in style.css)
    document.documentElement.classList.toggle('panel-who', name === 'who');
    document.documentElement.classList.toggle('panel-play', name === 'play');
    if (name) {
      lenis.stop();
      panels[name].scrollTop = 0;
      gsap.set(navItems, { color: NAV_COLOR[name], overwrite: 'auto' });
      if (name === 'play') playPanel.enter();
    } else {
      lenis.start();
      if (navColorBefore) gsap.set(navItems, { color: navColorBefore, overwrite: 'auto' });
    }
  }

  function openPanel(name, { instant = false, updateUrl = true } = {}) {
    if (busy || open === name || !panels[name]) return;
    if (updateUrl) history.pushState({ panel: name }, '', '#' + name);
    if (instant) show(name);
    else wipe(`[ ${name} ]`, () => show(name));
  }

  // label: what the splash says on the way out ("[ work ]" when heading to the work section)
  function closePanel({ then, label = '[ home ]', updateUrl = true } = {}) {
    if (!open || busy) return;
    if (updateUrl) history.replaceState(null, '', location.pathname + location.search);
    wipe(label, () => { show(null); if (then) then(); });
  }

  // Back / Forward buttons
  window.addEventListener('popstate', () => {
    const h = location.hash.slice(1);
    if (panels[h]) openPanel(h, { updateUrl: false });
    else if (open) closePanel({ updateUrl: false });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (playPanel && playPanel.closeLightbox()) return;   // Esc shuts the lightbox first, then the panel
    closePanel();
  });

  // for main.js: the nav links call these
  window.fishtankPanels = { open: openPanel, close: closePanel, isOpen: () => !!open, current: () => open };

  // ============================================================
  // PLAY (mockup): a Cosmos-style masonry board. Every column is the
  // same width; each piece keeps its own height and drops into the
  // shortest column, so the board stays level. How many columns:
  // --play-cols in style.css (changes with screen width).
  // ============================================================
  const playPanel = !playOn ? null : (function () {
    // h = height when the width is 100 (100 = square, 150 = tall, 70 = wide)
    // For the lightbox, a piece can also have its own title, date and desc;
    // until it does, it borrows the placeholders below (DEFAULT_DESC etc.).
    const PIECES = [
      { cat: 'illustration', h: 150, label: 'illustration' },
      { cat: 'magazine',     h: 130, label: 'magazine' },
      { cat: 'graphic',      h: 75,  label: 'poster' },
      { cat: 'merch',        h: 100, label: 'merch' },
      { cat: 'illustration', h: 125, label: 'illustration' },
      { cat: 'graphic',      h: 140, label: 'poster' },
      { cat: 'magazine',     h: 70,  label: 'spread' },
      { cat: 'merch',        h: 90,  label: 'sticker sheet' },
      { cat: 'illustration', h: 178, label: 'illustration' },
      { cat: 'graphic',      h: 150, label: 'poster' },
      { cat: 'magazine',     h: 132, label: 'cover' },
      { cat: 'illustration', h: 95,  label: 'illustration' },
      { cat: 'merch',        h: 120, label: 'tote' },
      { cat: 'graphic',      h: 100, label: 'logo' },
      { cat: 'magazine',     h: 62,  label: 'spread' },
      { cat: 'illustration', h: 140, label: 'illustration' },
      { cat: 'graphic',      h: 160, label: 'poster' },
      { cat: 'merch',        h: 80,  label: 'pin set' },
      { cat: 'magazine',     h: 128, label: 'cover' },
      { cat: 'illustration', h: 110, label: 'illustration' },
      { cat: 'graphic',      h: 56,  label: 'banner' },
      { cat: 'merch',        h: 135, label: 'tee' },
      { cat: 'illustration', h: 100, label: 'illustration' },
      { cat: 'magazine',     h: 145, label: 'spread' },
      { cat: 'graphic',      h: 118, label: 'poster' },
    ];
    const TINTS = { illustration: '#E9E6FB', magazine: '#E3EEFB', graphic: '#F3E6F7', merch: '#EAF3E6' };
    const CAT_NAMES = { illustration: 'Illustration', magazine: 'Magazine design', graphic: 'Graphic design', merch: 'Merch design' };
    const DEFAULT_DATE = 'Spring 2025';
    const DEFAULT_DESC = 'A placeholder description: what this piece is, who it was for, and the idea behind it. A couple of sentences is plenty.';

    const panel = panels.play;
    const grid = panel.querySelector('#playGrid');
    let cat = 'all';
    let cols = 0;

    function columnCount() {
      return parseInt(getComputedStyle(grid).getPropertyValue('--play-cols'), 10) || 1;
    }

    function render(animate = true) {
      cols = columnCount();
      grid.innerHTML = '';
      const colEls = [], heights = [];
      for (let c = 0; c < cols; c++) {
        const col = document.createElement('div');
        col.className = 'play-col';
        grid.appendChild(col);
        colEls.push(col);
        heights.push(0);
      }
      PIECES.filter((p) => cat === 'all' || p.cat === cat).forEach((p, i) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'play-piece';
        el.setAttribute('aria-label', `Open ${titleOf(p)}`);
        el.addEventListener('click', () => openLightbox(p, el));
        // hover: a fresh random tilt each time, 2–5° either way (the bounce is in style.css)
        el.addEventListener('pointerenter', () => {
          el.style.setProperty('--tilt', `${(Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3)}deg`);
        });
        el.style.aspectRatio = `100 / ${p.h}`;
        el.style.setProperty('--piece-bg', TINTS[p.cat]);
        if (animate) el.style.animationDelay = `${i * 40}ms`;
        else el.style.animation = 'none';
        el.textContent = p.label;
        const c = heights.indexOf(Math.min(...heights));   // the shortest column
        colEls[c].appendChild(el);
        heights[c] += p.h;
      });
    }

    // the cursor shows an eye over a piece ("click to see it big"; look in style.css)
    const cursor = document.getElementById('cursor');
    if (cursor) {
      document.addEventListener('pointerover', (e) => {
        const on = open === 'play' && !!e.target.closest?.('.play-piece');
        if (on !== cursor.classList.contains('is-zoom')) cursor.classList.toggle('is-zoom', on);
      });
    }

    function titleOf(p) {
      return p.title || p.label.charAt(0).toUpperCase() + p.label.slice(1);
    }

    // ---------- lightbox: the piece on the left, its info on the right ----------
    const lb = document.getElementById('playLightbox');
    const lbMedia = lb.querySelector('.play-lb-piece');
    const lbClose = lb.querySelector('.play-lb-close');
    let lbFrom = null;   // the piece that opened it (focus goes back there on close)

    function openLightbox(p, from) {
      lbFrom = from;
      cursor?.classList.remove('is-zoom');   // (the lightbox now covers the piece)
      lbMedia.style.setProperty('--ratio', 100 / p.h);
      lbMedia.style.setProperty('--piece-bg', TINTS[p.cat]);
      lbMedia.textContent = p.label;
      lb.querySelector('.play-lb-cat').textContent = CAT_NAMES[p.cat];
      lb.querySelector('.play-lb-title').textContent = titleOf(p);
      lb.querySelector('.play-lb-date').textContent = p.date || DEFAULT_DATE;
      lb.querySelector('.play-lb-desc').textContent = p.desc || DEFAULT_DESC;
      lb.querySelector('.play-lb-info').scrollTop = 0;
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      lbClose.focus({ preventScroll: true });
    }
    // returns true if it was open (so Esc knows it had something to close)
    function closeLightbox() {
      if (!lb.classList.contains('is-open')) return false;
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      if (lbFrom) lbFrom.focus({ preventScroll: true });
      return true;
    }
    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });   // click the dimmed area

    panel.querySelectorAll('.play-cat').forEach((btn) => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.play-cat').forEach((b) => b.classList.toggle('is-active', b === btn));
        cat = btn.dataset.cat;
        render();
      });
    });

    // smooth scrolling inside the panel, like the homepage
    let smooth = null;
    if (typeof Lenis !== 'undefined') {
      smooth = new Lenis({ wrapper: panel, content: panel.firstElementChild, lerp: 0.16 });   // (was 0.1: less glide)
      requestAnimationFrame(function raf(t) { if (open === 'play') smooth.raf(t); requestAnimationFrame(raf); });
    }
    // re-deal the pieces only when the number of columns changes
    window.addEventListener('resize', () => { if (columnCount() !== cols) render(false); });

    render();
    return {
      closeLightbox,
      enter() {
        if (smooth) smooth.scrollTo(0, { immediate: true });
        if (columnCount() !== cols) render(false);
      },
    };
  })();

  // Arrived at #who / #play (a link from another page, or a reload): show it right away
  const start = location.hash.slice(1);
  if (panels[start]) {
    history.replaceState({ panel: start }, '', '#' + start);
    if (document.readyState === 'complete') show(start);
    else window.addEventListener('load', () => show(start));
  }
})();
