// ================================================================
// CASE STUDY v2 (script side of css/case-v2.css), shared by the case studies
// that use the newer design. Load after the page's own main.js.
//   1. the big title fills the summary block's height
//   2. bottom section nav pills: number only, spring open for the current
//      section or on hover. window.replaySideNavIntro() replays the intro; the
//      page's main.js calls it when it shows the nav (.visible).
// ================================================================

(() => {
  // ---------- 1. title fills the summary block's height ----------
  // Sized so its letters (top of the tallest letter → bottom of the lowest) run
  // exactly from the top of the summary text to the bottom of the tags, measured
  // from the real letter shapes. Re-fitted whenever the text re-wraps.
  function fitTitle() {
    const title = document.querySelector('.cf-summary .cf-title');
    const text = document.querySelector('.cf-summary-text'), tags = document.querySelector('.cf-tags');
    if (!title || !text || !tags) return;
    if (window.matchMedia('(max-width: 1100px)').matches) { title.style.fontSize = ''; title.style.transform = ''; return; }
    const cs = getComputedStyle(title);
    const font = (px) => `${cs.fontStyle} ${cs.fontWeight} ${px}px ${cs.fontFamily}`;
    const c = fitTitle.ctx || (fitTitle.ctx = document.createElement('canvas').getContext('2d'));
    // start small each time: a big title narrows the text column, which can wrap the
    // tags onto another row, which grows the title… starting small settles compact
    title.style.fontSize = '72px';
    title.style.transform = '';
    for (let pass = 0; pass < 4; pass++) {
      const top = text.getBoundingClientRect().top, bottom = tags.getBoundingClientRect().bottom;
      c.font = font(100);
      const m = c.measureText(title.textContent);
      const ink = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 100;   // letter height per 1px of font size
      const size = (bottom - top) / ink;
      title.style.fontSize = size + 'px';
      c.font = font(size);
      const mm = c.measureText(title.textContent);
      const box = title.getBoundingClientRect();
      const baseline = box.top + (size - (mm.fontBoundingBoxAscent + mm.fontBoundingBoxDescent)) / 2 + mm.fontBoundingBoxAscent;
      const inkTop = baseline - mm.actualBoundingBoxAscent - (parseFloat(title.style.transform.replace(/[^\d.-]/g, '')) || 0);
      title.style.transform = `translateY(${top - inkTop}px)`;
    }
  }
  fitTitle();
  window.addEventListener('resize', fitTitle);
  document.fonts.ready.then(fitTitle);

  // ---------- 2. bottom section nav pills ----------
  // (the spring is a CSS easing curve on the width, see .sidebar-nav .nav-link)
  const sideLinks = [...document.querySelectorAll('.sidebar-nav .nav-link')];
  if (!sideLinks.length || !sideLinks[0].querySelector('.nav-num')) return;

  function setSideOpen(link, force) {
    const open = link._hover || link.parentElement.classList.contains('active');
    if (link._open === open && !force) return;
    link._open = open;
    link.classList.toggle('is-open', open);
    if (link._wOpen) link.style.width = (open ? link._wOpen : link._wClosed) + 'px';
  }

  // measure each pill's two widths: number only, and number + name
  function sizeSideLinks() {
    sideLinks.forEach((link) => {
      const num = link.querySelector('.nav-num');
      const name = link.querySelector('.nav-name');
      const cs = getComputedStyle(link);
      const edges = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
      const numW = num.getBoundingClientRect().width;
      if (!numW) return;                               // nav hidden (narrow screen)
      const nameW = name.getBoundingClientRect().width + parseFloat(getComputedStyle(name).marginLeft);
      link._wClosed = Math.ceil(edges + numW);
      link._wOpen = Math.ceil(edges + numW + nameW);
      link.style.transition = 'none';                  // jump straight to the right size
      setSideOpen(link, true);
      void link.offsetWidth;
      link.style.transition = '';
    });
  }

  sideLinks.forEach((link) => {
    link._hover = false;
    link.addEventListener('mouseenter', () => { link._hover = true; setSideOpen(link); });
    link.addEventListener('mouseleave', () => { link._hover = false; setSideOpen(link); });
  });

  // the page's scroll spy moves .active between items; open/close the pills to follow it
  new MutationObserver(() => sideLinks.forEach((l) => setSideOpen(l)))
    .observe(document.querySelector('.nav-sections'), { subtree: true, attributes: true, attributeFilter: ['class'] });

  // intro each time the nav appears: every pill closed, then the current one springs open
  window.replaySideNavIntro = () => {
    sideLinks.forEach((l) => {
      if (!l._wClosed) return;
      l.style.transition = 'none';
      l._open = false;
      l.classList.remove('is-open');
      l.style.width = l._wClosed + 'px';
    });
    void document.body.offsetWidth;
    sideLinks.forEach((l) => { l.style.transition = ''; });
    setTimeout(() => sideLinks.forEach((l) => setSideOpen(l)), 220);
  };

  sizeSideLinks();
  document.fonts.ready.then(sizeSideLinks);
  document.fonts.load("300 16px 'HafferXH'").then(sizeSideLinks);
  window.addEventListener('resize', sizeSideLinks);
})();
