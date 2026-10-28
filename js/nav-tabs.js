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
  if (!bar) return;

  // ---------- classic ⇄ tabs ----------
  function setMode(mode, save) {
    root.classList.toggle('nav-tabs', mode === 'tabs');
    toggle?.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    if (save) try { localStorage.setItem('cfNavMode', mode); } catch (e) {}
    if (mode === 'tabs') requestAnimationFrame(() => { placeIndicator(); shapeFrame(); placeCarouselFades(); });
    window.dispatchEvent(new Event('resize'));   // (let anything that measures the page re-measure)
  }
  toggle?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-mode]');
    if (b) setMode(b.dataset.mode, true);
  });

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

  // ---------- the window frame's hole (CSS: .cf-frame) ----------
  // A clip-path covering the whole window minus a rounded rectangle (evenodd), sized
  // from the CSS --frame-top / --frame-side / --frame-radius.
  const frame = document.querySelector('.cf-frame');
  function shapeFrame() {
    if (!frame || !root.classList.contains('nav-tabs')) return;
    const css = getComputedStyle(root), px = (v) => parseFloat(css.getPropertyValue(v)) || 0;
    const W = frame.clientWidth, H = frame.clientHeight;
    const t = px('--frame-top'), sd = px('--frame-side'), r = px('--frame-radius');
    const x0 = sd, y0 = t, x1 = W - sd, y1 = H - sd;
    frame.style.clipPath = `path(evenodd, "M0 0H${W}V${H}H0Z M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y1 - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z")`;
  }
  window.addEventListener('resize', shapeFrame);

  // the carousels' side fades (CSS: .hl-viewport::before / ::after) sit at the frame's
  // inner edges: tell each carousel how far its box is from them
  function placeCarouselFades() {
    if (!root.classList.contains('nav-tabs')) return;
    const sd = parseFloat(getComputedStyle(root).getPropertyValue('--frame-side')) || 0;
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
