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
    splashText.textContent = label;
    gsap.killTweensOf([splash, splashText]);
    gsap.set(splash, { y: window.innerHeight });
    gsap.set(splashText, { opacity: 0, y: 30 });
    gsap.to(splashText, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.2 });
    gsap.to(splash, {
      y: 0, duration: 0.6, ease: 'power3.inOut',
      onComplete: () => {
        midway();
        gsap.to(splashText, { opacity: 0, y: -30, duration: 0.35, ease: 'power2.in', delay: 0.25 });
        gsap.to(splash, {
          y: -(window.innerHeight + 40), duration: 0.6, ease: 'power3.inOut', delay: 0.25,
          onComplete: () => {
            gsap.set(splash, { y: window.innerHeight + 40 });
            splash.style.pointerEvents = 'none';
            splashText.textContent = '[ work ]';
            busy = false;
          },
        });
      },
    });
  }

  // Switch which panel is showing (instantly — the splash hides the swap).
  function show(name) {
    Object.entries(panels).forEach(([k, el]) => {
      el.classList.toggle('is-open', k === name);
      el.setAttribute('aria-hidden', k === name ? 'false' : 'true');
    });
    if (name && !open) navColorBefore = getComputedStyle(document.querySelector('.nav-wordmark')).color;
    open = name;
    window.fishtankPanelOpen = !!name;
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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

  // for main.js: the nav links call these
  window.fishtankPanels = { open: openPanel, close: closePanel, isOpen: () => !!open, current: () => open };

  // ============================================================
  // PLAY (mockup): placeholder pieces in two same-width columns,
  // filtered by the sidebar; the right column scrolls a little slower.
  // ============================================================
  const playPanel = !playOn ? null : (function () {
    const PIECES = [
      { cat: 'illustration', h: 150, label: 'illustration' },
      { cat: 'magazine',     h: 130, label: 'magazine' },
      { cat: 'graphic',      h: 118, label: 'poster' },
      { cat: 'merch',        h: 100, label: 'merch' },
      { cat: 'illustration', h: 125, label: 'illustration' },
      { cat: 'graphic',      h: 140, label: 'poster' },
      { cat: 'magazine',     h: 128, label: 'spread' },
      { cat: 'merch',        h: 90,  label: 'sticker sheet' },
      { cat: 'illustration', h: 110, label: 'illustration' },
      { cat: 'graphic',      h: 150, label: 'poster' },
      { cat: 'magazine',     h: 132, label: 'cover' },
      { cat: 'illustration', h: 95,  label: 'illustration' },
    ];
    const TINTS = { illustration: '#E9E6FB', magazine: '#E3EEFB', graphic: '#F3E6F7', merch: '#EAF3E6' };
    const PARALLAX = 0.12;   // right column lags by 12% of the scroll (0 = no parallax)

    const panel = panels.play;
    const leftCol = panel.querySelector('.play-col--left');
    const rightCol = panel.querySelector('.play-col--right');
    const heading = panel.querySelector('#playHeading');
    const main = panel.querySelector('.play-main');
    let shift = 0;
    let smooth = null;

    function render(cat) {
      leftCol.querySelectorAll('.play-piece').forEach((el) => el.remove());
      rightCol.innerHTML = '';
      let hL = 0, hR = 0;   // fill whichever column is shorter, so they stay balanced
      PIECES.filter((p) => cat === 'all' || p.cat === cat).forEach((p, i) => {
        const el = document.createElement('div');
        el.className = 'play-piece';
        el.style.aspectRatio = `100 / ${p.h}`;
        el.style.setProperty('--piece-bg', TINTS[p.cat]);
        el.style.animationDelay = `${i * 50}ms`;
        el.textContent = p.label;
        if (hL <= hR) { leftCol.appendChild(el); hL += p.h; } else { rightCol.appendChild(el); hR += p.h; }
      });
      requestAnimationFrame(fitScrollLength);
    }

    // The right column moves slower, so it needs extra scroll to reach its end.
    function fitScrollLength() {
      main.style.minHeight = '';
      const vh = panel.clientHeight;
      const rightBottom = rightCol.getBoundingClientRect().bottom + panel.scrollTop - shift;
      const need = Math.max(0, (rightBottom + 80 - vh) / (1 - PARALLAX));
      if (need + vh > panel.scrollHeight) main.style.minHeight = `${need + vh}px`;
      update();
    }

    function update(y) {
      const scroll = y ?? panel.scrollTop;
      shift = window.matchMedia('(max-width: 800px)').matches ? 0 : scroll * PARALLAX;
      rightCol.style.transform = shift ? `translate3d(0, ${shift}px, 0)` : '';
    }

    panel.querySelectorAll('.play-cat').forEach((btn) => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.play-cat').forEach((b) => b.classList.toggle('is-active', b === btn));
        heading.textContent = btn.dataset.heading || btn.textContent;
        render(btn.dataset.cat);
      });
    });

    // smooth scrolling inside the panel, like the homepage
    if (typeof Lenis !== 'undefined') {
      smooth = new Lenis({ wrapper: panel, content: panel.firstElementChild, lerp: 0.1 });
      smooth.on('scroll', ({ scroll }) => update(scroll));
      requestAnimationFrame(function raf(t) { if (open === 'play') smooth.raf(t); requestAnimationFrame(raf); });
    } else {
      panel.addEventListener('scroll', () => update(), { passive: true });
    }
    window.addEventListener('resize', () => { if (open === 'play') fitScrollLength(); });

    render('all');
    return {
      enter() {
        if (smooth) smooth.scrollTo(0, { immediate: true });
        requestAnimationFrame(fitScrollLength);
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
