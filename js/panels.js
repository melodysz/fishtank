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
  // PLAY: a Cosmos-style masonry board of the artwork in
  // js/play-pieces.js. Every column is the same width; each piece
  // keeps its own height and drops into the shortest column, so the
  // board stays level. How many columns: --play-cols in style.css
  // (changes with screen width).
  // ============================================================
  const playPanel = !playOn ? null : (function () {
    const PIECES = window.PLAY_PIECES || [];
    const ART = 'play/art/';
    const CAT_NAMES = { illustration: 'Illustration', magazine: 'Magazine design', graphic: 'Graphic design',
                        merch: 'Merch design', 'fine-art': 'Fine art', sculpture: 'Sculpture' };
    // several images: "15 pages" for print pieces, "10 photos" for the rest
    const countLabel = (p) => `${p.imgs.length} ${['magazine', 'graphic'].includes(p.cat) ? 'pages' : 'photos'}`;

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
        const cover = p.imgs[0];
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'play-piece';
        el.setAttribute('aria-label', `Open ${p.title}`);
        el.addEventListener('click', () => openLightbox(p, el));
        // hover: a fresh random tilt each time, 1–2.5° either way (was 2–5°; the bounce is in style.css)
        el.addEventListener('pointerenter', () => {
          el.style.setProperty('--tilt', `${(Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 1.5)}deg`);
        });
        el.style.aspectRatio = `${cover.w} / ${cover.h}`;
        if (animate) el.style.animationDelay = `${Math.min(i, 20) * 40}ms`;
        else el.style.animation = 'none';
        const img = document.createElement('img');
        img.src = `${ART}thumb/${cover.src}.webp`;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        el.appendChild(img);
        if (p.imgs.length > 1) {
          const badge = document.createElement('span');
          badge.className = 'play-piece-count';
          badge.textContent = countLabel(p);
          el.appendChild(badge);
        }
        const c = heights.indexOf(Math.min(...heights));   // the shortest column
        colEls[c].appendChild(el);
        heights[c] += cover.h / cover.w;
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

    // ---------- lightbox: the piece on the left, its info on the right ----------
    // One image: as big as fits. Several (a PDF, a zine, more photos): they stack and
    // the left side scrolls through them.
    const lb = document.getElementById('playLightbox');
    const lbCard = lb.querySelector('.play-lb-card');
    const lbMedia = lb.querySelector('.play-lb-media');
    const lbClose = lb.querySelector('.play-lb-close');
    let lbFrom = null;   // the piece that opened it (focus goes back there on close)

    function setText(sel, text) {
      const el = lb.querySelector(sel);
      el.textContent = text || '';
      el.hidden = !text;
    }

    function openLightbox(p, from) {
      lbFrom = from;
      cursor?.classList.remove('is-zoom');   // (the lightbox now covers the piece)
      const many = p.imgs.length > 1;
      lbCard.classList.toggle('is-pages', many);
      lbMedia.replaceChildren(...p.imgs.map((im, i) => {
        const img = document.createElement('img');
        img.className = 'play-lb-piece';
        img.src = `${ART}full/${im.src}.webp`;
        img.width = im.w;
        img.height = im.h;
        img.style.setProperty('--ratio', im.w / im.h);
        img.alt = many ? `${p.title}, ${i + 1} of ${p.imgs.length}` : p.title;
        if (i > 1) img.loading = 'lazy';   // the rest load as you scroll to them
        img.decoding = 'async';
        return img;
      }));
      lbMedia.scrollTop = 0;
      setText('.play-lb-cat', CAT_NAMES[p.cat]);
      setText('.play-lb-title', p.title);
      setText('.play-lb-date', p.date);
      setText('.play-lb-count', many ? `${countLabel(p)} · scroll to see them all` : '');
      setText('.play-lb-desc', p.desc);
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
