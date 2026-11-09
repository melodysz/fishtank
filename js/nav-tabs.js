// NAV EXPERIMENT: a ChatGPT-style tab bar instead of the pill nav + side nav + progress
// bar (html.nav-tabs; the toggle in the bottom-left corner switches and remembers it).
//   asterisk   back to the homepage; spins on hover like the classic nav's
//   tabs       one tab per section (no tab for the top of the page any more: nothing is
//              selected up there). They mirror the side nav, so the same tab lights up as you scroll (main.js
//              keeps working out which section you're in) and clicking one lands where
//              the side nav would.
//   works      the classic nav's thought-bubble dropdown of case studies (hover)
//   who, play  the rest of the main nav
(() => {
  const root = document.documentElement;
  const bar = document.querySelector('.cf-tabbar');
  const toggle = document.querySelector('.nav-mode-toggle');
  // (the switch is a design helper: only shown on localhost, never on the live site)
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) root.classList.add('is-dev');
  if (!bar) return;

  // ---------- classic ⇄ tabs ----------
  function setMode(mode, save) {
    root.classList.toggle('nav-tabs', mode === 'tabs');
    toggle?.querySelectorAll('button[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    if (save) try { localStorage.setItem('cfNavMode', mode); } catch (e) {}
    if (mode === 'tabs') requestAnimationFrame(() => { placeIndicator(); shapeFrame(); placeCarouselFades(); });
    window.dispatchEvent(new Event('resize'));   // (let anything that measures the page re-measure)
  }
  toggle?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-mode]');
    if (b) setMode(b.dataset.mode, true);
  });

  // ---------- EXPERIMENT: inset window (localhost only) ----------
  // The frame + tab bar pulled in from the screen edges by WIN_M px, with the page still
  // showing in the margins around it (CSS: html.win-inset). The "window" button next to
  // classic / tabs switches it and remembers it; ?win=1 / ?win=0 also work, ?win=28 sets
  // the margin.
  const WIN_M_DEFAULT = 12;   // (was 20: too big)
  let winM = WIN_M_DEFAULT;
  function setWin(on, save) {
    if (on && !document.querySelector('.win-blur')) {
      ['top', 'bottom', 'left', 'right'].forEach((side) => {
        const blur = document.createElement('div');
        blur.className = 'win-blur win-blur--' + side;
        blur.setAttribute('aria-hidden', 'true');
        document.body.appendChild(blur);
      });
    }
    root.classList.toggle('win-inset', on);
    if (on) root.style.setProperty('--win-m', winM + 'px'); else root.style.removeProperty('--win-m');
    // (Creatify's hero sits under the tab bar: its padding is the bar's height plus the margin.
    // Set as plain px because main.js reads it as a number.)
    const t = parseFloat(getComputedStyle(root).getPropertyValue('--frame-top')) || 0;
    if (on) root.style.setProperty('--hero-pad', (t + winM) + 'px'); else root.style.removeProperty('--hero-pad');
    winBtn?.setAttribute('aria-pressed', String(on));
    // (remembered as '1' = the default margin, or a custom one from ?win=<px>)
    if (save) try { localStorage.setItem('cfWinInset', on ? (winM === WIN_M_DEFAULT ? '1' : String(winM)) : ''); } catch (e) {}
    shapeFrame?.();
    window.dispatchEvent(new Event('resize'));
  }
  let winBtn = null;
  if (root.classList.contains('is-dev')) {
    let saved = null;
    const qWin = new URLSearchParams(location.search).get('win');
    try { saved = localStorage.getItem('cfWinInset'); } catch (e) {}
    if (qWin !== null) saved = qWin === '0' ? '' : qWin;
    if (saved && +saved > 1) winM = +saved;
    if (toggle) {
      winBtn = document.createElement('button');
      winBtn.type = 'button';
      winBtn.className = 'interactable';
      winBtn.textContent = 'window';
      winBtn.addEventListener('click', () => setWin(!root.classList.contains('win-inset'), true));
      toggle.appendChild(winBtn);
    }
    if (saved) requestAnimationFrame(() => setWin(true, qWin !== null));
    buildWinPanel();
  }

  // the margin colour panel: a gradient (two colours + its direction) laid over the blurred
  // margins, how strong it is, and how much blur. Remembered in localStorage cfWinGrad.
  // (One gradient across the whole screen, shared by the four margin strips: CSS
  // background-attachment: fixed, so it doesn't restart on each edge.)
  function buildWinPanel() {
    // her ask, 2026-11-08: Creatify's bold purple (#6F68FF) into the lilac (#D6C9FF)
    const DEFAULTS = { from: '#6f68ff', to: '#d6c9ff', angle: 135, alpha: 80, blur: 30 };
    let s = { ...DEFAULTS };
    try { Object.assign(s, JSON.parse(localStorage.getItem('cfWinGrad') || '{}')); } catch (e) {}
    const PRESETS = [
      ['#6f68ff', '#d6c9ff', 'Purple → lilac'], ['#7354f2', '#d6c9ff', 'Accent purple → lilac'],
      ['#6f68ff', '#e7a0fe', 'Purple → pink'], ['#d6c9ff', '#ffffff', 'Lilac → white'],
      ['#eaeaeb', '#eaeaeb', 'The old grey (20%)', 20]];

    const panel = document.createElement('div');
    panel.className = 'win-panel';
    panel.dataset.devUi = '';
    panel.innerHTML = `
      <div class="wp-row"><span>colours</span><input type="color" class="wp-from"><input type="color" class="wp-to">
        <button type="button" class="wp-reset interactable" title="Back to the default (purple → lilac)">reset</button></div>
      <div class="wp-hex"></div>
      <div class="wp-swatches">${PRESETS.map(([f, t, title, al]) => `<button type="button" class="wp-swatch interactable" data-from="${f}" data-to="${t}"${al ? ` data-alpha="${al}"` : ''} title="${title}" style="background:linear-gradient(135deg, ${f}, ${t})"></button>`).join('')}</div>
      <div class="wp-row"><span>angle</span><input type="range" class="wp-angle" min="0" max="360" step="5"><span class="wp-val wp-angle-val"></span></div>
      <div class="wp-row"><span>opacity</span><input type="range" class="wp-alpha" min="0" max="100"><span class="wp-val wp-alpha-val"></span></div>
      <div class="wp-row"><span>blur</span><input type="range" class="wp-blur" min="0" max="40"><span class="wp-val wp-blur-val"></span></div>`;
    document.body.appendChild(panel);
    const $ = (c) => panel.querySelector(c);
    const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`; };

    function apply(save) {
      const a = s.alpha / 100;
      root.style.setProperty('--win-tint', `linear-gradient(${s.angle}deg, ${rgba(s.from, a)}, ${rgba(s.to, a)})`);
      root.style.setProperty('--win-blur', s.blur + 'px');
      $('.wp-from').value = s.from; $('.wp-to').value = s.to;
      $('.wp-hex').textContent = `${s.from.toUpperCase()} → ${s.to.toUpperCase()} · ${s.angle}° · ${s.alpha}%`;
      $('.wp-angle').value = s.angle; $('.wp-angle-val').textContent = s.angle + '°';
      $('.wp-alpha').value = s.alpha; $('.wp-alpha-val').textContent = s.alpha + '%';
      $('.wp-blur').value = s.blur; $('.wp-blur-val').textContent = s.blur + 'px';
      panel.querySelectorAll('.wp-swatch').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.from === s.from && b.dataset.to === s.to)));
      if (save) try { localStorage.setItem('cfWinGrad', JSON.stringify(s)); } catch (e) {}
    }
    // (picking a colour while the opacity is 0 would show nothing, so it jumps to 60%)
    const bump = () => { if (!s.alpha) s.alpha = 60; };
    $('.wp-from').addEventListener('input', (e) => { s.from = e.target.value; bump(); apply(true); });
    $('.wp-to').addEventListener('input', (e) => { s.to = e.target.value; bump(); apply(true); });
    panel.querySelectorAll('.wp-swatch').forEach((b) => b.addEventListener('click', () => {
      s.from = b.dataset.from; s.to = b.dataset.to;
      if (b.dataset.alpha) s.alpha = +b.dataset.alpha; else if (s.alpha <= 20) s.alpha = DEFAULTS.alpha;
      apply(true);
    }));
    $('.wp-angle').addEventListener('input', (e) => { s.angle = +e.target.value; apply(true); });
    $('.wp-alpha').addEventListener('input', (e) => { s.alpha = +e.target.value; apply(true); });
    $('.wp-blur').addEventListener('input', (e) => { s.blur = +e.target.value; apply(true); });
    $('.wp-reset').addEventListener('click', () => { s = { ...DEFAULTS }; apply(true); });
    apply(false);
  }

  // ---------- the tabs ----------
  const tabsEl = bar.querySelector('.tb-tabs');
  const indicator = bar.querySelector('.tb-indicator');
  const sideItems = [...document.querySelectorAll('.sidebar-nav .nav-item')];
  const makeTab = (num, name, onClick) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'tb-tab interactable';
    t.innerHTML = `<span class="tb-num">${num}</span><span class="tb-name">${name}</span>`;
    t.addEventListener('click', onClick);
    tabsEl.appendChild(t);
    return t;
  };
  const tabs = sideItems.map((item) => {
    const link = item.querySelector('.nav-link');
    return makeTab(item.querySelector('.nav-num')?.textContent || '', item.querySelector('.nav-name')?.textContent || '', () => link.click());
  });

  let active = null;
  function sync() {
    const i = sideItems.findIndex((item) => item.classList.contains('active'));
    // (the side nav marks 01 as current before you've scrolled: that's still the top, where
    // no tab is selected)
    const next = i < 0 || (i === 0 && window.scrollY < window.innerHeight * 0.5) ? null : tabs[i];
    if (next === active) return;
    active?.classList.remove('is-active');
    active?.removeAttribute('aria-current');
    active = next;
    active?.classList.add('is-active');
    active?.setAttribute('aria-current', 'true');
    placeIndicator();
  }
  function placeIndicator() {
    indicator.style.opacity = active ? '' : '0';   // (fades out at the top of the page, where no tab is selected)
    if (!active || !root.classList.contains('nav-tabs')) return;
    indicator.style.width = active.offsetWidth + 'px';
    indicator.style.transform = `translateX(${active.offsetLeft}px)`;
    // keep it on screen when the tabs scroll sideways (narrow screens)
    const l = active.offsetLeft, r = l + active.offsetWidth;
    if (l < tabsEl.scrollLeft || r > tabsEl.scrollLeft + tabsEl.clientWidth) tabsEl.scrollTo({ left: l - 24, behavior: 'smooth' });
  }
  const mo = new MutationObserver(sync);
  sideItems.forEach((item) => mo.observe(item, { attributes: true, attributeFilter: ['class'] }));
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', placeIndicator);
  document.fonts?.ready.then(placeIndicator);
  sync();
  // no slide on the very first placement
  indicator.style.transition = 'none';
  requestAnimationFrame(() => { placeIndicator(); requestAnimationFrame(() => { indicator.style.transition = ''; }); });

  // ---------- home: your asterisk, with the classic nav's spin ----------
  // It rests tilted (-18°, like the homepage's), and hovering plays the pill nav's spin
  // (main.js, onNavEnter / onNavLeave): a full turn with a little overshoot, landing
  // tilted again; leaving spins it back.
  const REST = -18;
  const star = bar.querySelector('.tb-home img');
  const home = bar.querySelector('.tb-home');
  if (window.gsap) gsap.set(star, { rotation: REST });
  const spin = (deg) => { if (!window.gsap) return; gsap.killTweensOf(star); gsap.to(star, { rotation: deg, duration: 1.2, ease: 'back.out(1.4)' }); };
  home.addEventListener('mouseenter', () => spin(REST - 360));
  home.addEventListener('mouseleave', () => spin(REST));

  // ---------- "works": the classic nav's thought-bubble dropdown ----------
  // A copy of the classic work dropdown (#workBubble + #bubbleDotsWrap, same styles), with
  // the same animation as main.js: three dots pop out one after another, then the menu
  // bounces in. Opens on hover; leaving it (or "works") closes it after a moment.
  const works = bar.querySelector('.tb-works');
  const bubble = document.getElementById('workBubble').cloneNode(true);
  const dots = document.getElementById('bubbleDotsWrap').cloneNode(true);
  bubble.id = 'tbWorkBubble'; dots.id = 'tbBubbleDots';
  bubble.classList.add('tb-bubble'); dots.classList.add('tb-bubble');
  document.body.append(dots, bubble);
  const [dSm, dMd, dLg] = ['sm', 'md', 'lg'].map((k) => dots.querySelector('.bubble-dot-' + k));
  const menu = bubble.querySelector('.bubble-menu');
  const bridge = bubble.querySelector('.bubble-bridge');
  let open = false, closeTimer = 0;
  function place() {
    const r = works.getBoundingClientRect(), w = menu.offsetWidth;
    const left = Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 12);
    bubble.style.left = dots.style.left = left + 'px';
    bubble.style.top = dots.style.top = (r.bottom + 16) + 'px';
    if (bridge) { bridge.style.top = '-16px'; bridge.style.width = w + 'px'; bridge.style.height = (16 + menu.offsetTop + 4) + 'px'; }
  }
  function openBubble() {
    clearTimeout(closeTimer);
    if (open || !window.gsap) return;
    open = true;
    place();
    bubble.style.pointerEvents = 'auto';
    bubble.setAttribute('aria-hidden', 'false');
    gsap.killTweensOf([dSm, dMd, dLg, menu]);
    gsap.fromTo(dSm, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.5)', delay: 0 });
    gsap.fromTo(dMd, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.38, ease: 'back.out(2.5)', delay: 0.09 });
    gsap.fromTo(dLg, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.40, ease: 'back.out(2.5)', delay: 0.18 });
    gsap.fromTo(menu, { opacity: 0, scale: 0.88, y: -6 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)', delay: 0.28 });
  }
  function closeBubble() {
    if (!open || !window.gsap) return;
    open = false;
    bubble.style.pointerEvents = 'none';
    bubble.setAttribute('aria-hidden', 'true');
    gsap.killTweensOf([dSm, dMd, dLg, menu]);
    gsap.to(menu, { opacity: 0, scale: 0.88, y: -6, duration: 0.20, ease: 'power2.in' });
    gsap.to(dLg, { opacity: 0, scale: 0.3, duration: 0.16, ease: 'power2.in', delay: 0.04 });
    gsap.to(dMd, { opacity: 0, scale: 0.3, duration: 0.14, ease: 'power2.in', delay: 0.08 });
    gsap.to(dSm, { opacity: 0, scale: 0.3, duration: 0.12, ease: 'power2.in', delay: 0.12 });
  }
  const closeSoon = () => { clearTimeout(closeTimer); closeTimer = setTimeout(closeBubble, 120); };
  works.addEventListener('mouseenter', openBubble);
  works.addEventListener('mouseleave', closeSoon);
  bubble.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  bubble.addEventListener('mouseleave', closeSoon);
  works.addEventListener('focus', openBubble);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBubble(); });
  window.addEventListener('resize', () => { if (open) place(); });

  // ---------- the window frame (CSS: .cf-frame) ----------
  // Frosted glass in four strips (the tab bar band, the two sides, the bottom edge) cut
  // round a rounded hole, sized from the CSS --frame-top / --frame-side / --frame-radius.
  // (Not one full-screen layer clipped to a ring: the browser blurs a backdrop layer's
  // whole box every frame, even the clipped-away part, so that re-blurred the entire screen
  // while scrolling.) Each strip's box reaches PAD px in past what shows, so the blur still
  // takes in the page beside it, then it's clipped to its visible part.
  const frame = document.querySelector('.cf-frame');
  const framePieces = frame ? ['top', 'bottom', 'left', 'right'].map((side) => {
    const el = document.createElement('div');
    el.className = 'cf-frame-piece cf-frame-piece--' + side;
    frame.appendChild(el);
    return el;
  }) : [];
  const placePiece = (el, x, y, w, h, clip) =>
    Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', clipPath: clip });
  function shapeFrame() {
    if (!frame || !root.classList.contains('nav-tabs')) return;
    const css = getComputedStyle(root), px = (v) => parseFloat(css.getPropertyValue(v)) || 0;
    const W = frame.clientWidth, H = frame.clientHeight;
    const t = px('--frame-top'), sd = px('--frame-side'), r = px('--frame-radius'), PAD = 40;
    // (inset window experiment: the outer corners are rounded too, one frame-width rounder)
    const Ro = root.classList.contains('win-inset') ? r + sd : 0;
    const [top, bottom, left, right] = framePieces;
    // top: the tab bar band, down to where the hole's top corners finish curving
    const tb = t + r;
    placePiece(top, 0, 0, W, tb + PAD,
      `path("M0 ${tb}V${Ro}A${Ro} ${Ro} 0 0 1 ${Ro} 0H${W - Ro}A${Ro} ${Ro} 0 0 1 ${W} ${Ro}V${tb}H${W - sd}A${r} ${r} 0 0 0 ${W - sd - r} ${t}H${sd + r}A${r} ${r} 0 0 0 ${sd} ${tb}Z")`);
    // bottom: the thin bottom edge plus the hole's bottom corners (its box starts PAD higher)
    const hb = sd + r + PAD;
    placePiece(bottom, 0, H - hb, W, hb,
      `path("M0 ${PAD}H${sd}A${r} ${r} 0 0 0 ${sd + r} ${hb - sd}H${W - sd - r}A${r} ${r} 0 0 0 ${W - sd} ${PAD}H${W}V${hb - Ro}A${Ro} ${Ro} 0 0 1 ${W - Ro} ${hb}H${Ro}A${Ro} ${Ro} 0 0 1 0 ${hb - Ro}Z")`);
    // the two sides, between the corners
    const sh = Math.max(0, H - tb - (sd + r));
    placePiece(left, 0, tb, sd + PAD, sh, `inset(0 ${PAD}px 0 0)`);
    placePiece(right, W - sd - PAD, tb, sd + PAD, sh, `inset(0 0 0 ${PAD}px)`);
    // (inset window experiment: the blurred margins, one strip per edge. Each strip's box
    // reaches PAD px in past the margin, so the blur still takes in the page beside it,
    // but it's clipped to show only the margin itself.)
    const strips = document.querySelectorAll('.win-blur');
    if (strips.length && root.classList.contains('win-inset')) {
      const VW = root.clientWidth, VH = window.innerHeight, m = frame.getBoundingClientRect().left;
      const R = r + sd, band = m + R;
      const [top, bottom, left, right] = strips;
      // top: the strip above the frame, cut round the frame's top corners
      placePiece(top, 0, 0, VW, band + PAD,
        `path("M0 0H${VW}V${band}H${VW - m}A${R} ${R} 0 0 0 ${VW - m - R} ${m}H${m + R}A${R} ${R} 0 0 0 ${m} ${band}H0Z")`);
      // bottom: the same, mirrored (its box starts PAD above the band)
      const hb = band + PAD;
      placePiece(bottom, 0, VH - hb, VW, hb,
        `path("M0 ${PAD}H${m}A${R} ${R} 0 0 0 ${m + R} ${hb - m}H${VW - m - R}A${R} ${R} 0 0 0 ${VW - m} ${PAD}H${VW}V${hb}H0Z")`);
      // the two sides, between the corners
      placePiece(left, 0, band, m + PAD, Math.max(0, VH - 2 * band), `inset(0 ${PAD}px 0 0)`);
      placePiece(right, VW - m - PAD, band, m + PAD, Math.max(0, VH - 2 * band), `inset(0 0 0 ${PAD}px)`);
    }
  }
  window.addEventListener('resize', shapeFrame);

  // the carousels' side fades (CSS: .hl-viewport::before / ::after) sit at the frame's
  // inner edges: tell each carousel how far its box is from them
  function placeCarouselFades() {
    if (!root.classList.contains('nav-tabs')) return;
    const sd = (parseFloat(getComputedStyle(root).getPropertyValue('--frame-side')) || 0)
      + (parseFloat(getComputedStyle(root).getPropertyValue('--win-m')) || 0);
    const W = document.documentElement.clientWidth;
    document.querySelectorAll('.hl-viewport').forEach((v) => {
      const r = v.getBoundingClientRect();
      v.style.setProperty('--edge-l', (r.left - sd) + 'px');
      v.style.setProperty('--edge-r', (W - sd - r.right) + 'px');
    });
  }
  window.addEventListener('resize', placeCarouselFades);
  window.addEventListener('load', placeCarouselFades);

  setMode(root.classList.contains('nav-tabs') ? 'tabs' : 'classic', false);
})();
