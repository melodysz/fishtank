// ===================================
// THE PROBLEM: V2 → DEEP DIVE (OLD AGENT SCREENSHOT WITH POP-UP LABELS)
// ===================================
// V2 starts as a card like V1 above it; once centred on screen it stays there while you
// scroll, growing to the section's width, then darkens and the frosted labels pop in.
// Hovering a label opens its note (tap/click keeps it open); "See all" opens all.
// Phones and reduced motion skip the growing (see .is-static / .is-list).

// The pop-up labels themselves (open/close, sizing, frost), shared by every .ps-stage:
// the Problem's old-Agent screenshot and the Navigation section's chat sidebar video.
function psInitPills(stage) {
  const pillsBox = stage.querySelector('.ps-pills');
  const seeAll = stage.querySelector('.ps-see-all');
  const pills = [...stage.querySelectorAll('.ps-pill:not(.ps-see-all)')];
  const marks = [...stage.querySelectorAll('.ps-marks [data-k]')];   // outlines; data-k = which label they belong to

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

  return { pillsBox, sizeAllPills, placeGlass };
}

(() => {
  const stage = document.getElementById('problemShot');
  if (!stage) return;

  const track = stage.parentElement;   // .ps-track: the scroll distance it stays on screen for
  const frame = stage.querySelector('.ps-frame');
  const dim = stage.querySelector('.ps-dim');
  const v2 = stage.querySelector('.ps-v2');            // V2's caption (fades out as it grows)
  const title = stage.querySelector('.ps-deep-title'); // "Deep dive into V2" (fades in)
  const captionBits = [...v2.querySelectorAll('.cf-version-title, .cf-version-by, .cf-version-tag')];
  const captionBack = [...v2.querySelectorAll('.cf-version-blurs, .cf-version-fade')];
  const shade = stage.querySelector('.ps-deep-shade'); // the dark blur behind it
  const { pillsBox, sizeAllPills, placeGlass } = psInitPills(stage);

  // V2 → DEEP DIVE. V2 starts as a card the size of V1 (just under it). When it's centred on
  // screen it stays there while you scroll (sticky), growing to the section's width; its
  // caption fades out, "Deep dive into V2" fades in bottom-left, it darkens, and the labels
  // pop in. Then it scrolls on. Scrolling back up plays it backwards.
  const CARD = 0.72, CARD_MAX = 900;   // V2's starting width: same as V1 (.cf-versions --v-card)
  const UNDER_V1 = 24;       // gap from V1 to V2 (px)
  const HOLD = 1.0;          // how long it stays on screen while growing (in screen heights of scrolling)
  // V2's caption isn't tied to the scroll: once the growing passes CAPTION_AT it PLAYS (its own
  // timing, however fast you scroll), and scrolling back above that plays it in reverse.
  // Its lines slide up as they fade, one after another: title, then the "By…" line, then each
  // pill a beat after the one before; the dark blur behind them fades over the same time.
  // (2026-11-18: sliding off to the right was tried, she preferred up; scroll-scrubbed was tried,
  // she wanted trigger-and-play)
  const CAPTION_AT = 0.01;         // how far into the growing (0–1) it starts leaving
  const CAPTION_RISE = 28;         // px each piece travels up as it goes
  const CAPTION_EACH = 0.45;       // seconds each piece takes
  const CAPTION_STAGGER = 0.07;    // seconds between one piece and the next
  const GROW_END = 0.82;           // fully grown here (the rest is a short hold, labels up)
  const DIM = 0.45;                // how dark the screenshot gets under the labels
  const DIM_AT = [0.5, 0.82];
  const TITLE_IN = [0.36, 0.56];   // "Deep dive into V2"'s dark blur fades in over this, riding the corner as it grows (0.62–0.82 was too late, 0.1–0.3 too soon)
  // ...and at TITLE_IN's start its letters PLAY in (not tied to the scroll, like the caption):
  // each slides up and fades in, one after another. Scrolling back above it plays them back out.
  const LETTER_RISE = 0.5;         // how far each letter rises (in em: half a letter's height)
  const LETTER_EACH = 0.55;        // seconds per letter
  const LETTER_STAGGER = 0.028;    // seconds between one letter and the next
  const LABELS_AT = 0.86;          // labels pop in
  const LABELS_HIDE = 0.7;         // ...and linger while scrolling back until it's shrunk back past this
  const RADIUS = 15;               // corner rounding (V1's), kept the same on screen while it grows
  const SCREEN_MARGIN = 36;        // grown image keeps at least this gap to the nav bar above and the screen's bottom

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

  // ---------- growing while it stays on screen ----------

  let scale = 1;

  // start size = V1's; grown size = the section's full width (its side margins stay), or less
  // if that wouldn't fit the screen's height. The stage is the grown size and sticks with it
  // centred on screen; the small card sits in its middle, and the track is pulled up so the
  // small card lands UNDER_V1 below V1.
  // the screen space it's centred in: below the nav bar (tab bar mode) and above the window
  // frame's bottom edge, so it looks centred rather than tucked up under the bar
  function viewArea() {
    const css = getComputedStyle(document.documentElement);
    const tabbed = document.documentElement.classList.contains('nav-tabs');
    const top = tabbed ? (parseFloat(css.getPropertyValue('--frame-top')) || 0) : 0;
    const bottom = tabbed ? (parseFloat(css.getPropertyValue('--frame-side')) || 0) : 0;
    return { top, h: window.innerHeight - top - bottom };
  }
  let stickTop = 0;

  function measure() {
    const col = track.parentElement.clientWidth;
    const w0 = Math.min(col * CARD, CARD_MAX);
    const section = stage.closest('.cf-section') || stage.parentElement;
    const area = viewArea();
    const maxByHeight = (area.h - SCREEN_MARGIN * 2) * 16 / 9;
    const w = Math.max(w0, Math.min(section.clientWidth, maxByHeight));
    const h0 = w0 * 9 / 16, h = w * 9 / 16;
    scale = w / w0;
    stage.style.setProperty('--ps-w0', w0 + 'px');
    stage.style.setProperty('--ps-h0', h0 + 'px');
    stage.style.setProperty('--ps-w', w + 'px');
    stage.style.setProperty('--ps-h', h + 'px');
    stickTop = area.top + (area.h - h) / 2;
    stage.style.setProperty('--ps-top', stickTop + 'px');
    const gap = parseFloat(getComputedStyle(track.parentElement).rowGap) || 0;
    track.style.marginTop = (UNDER_V1 - gap - (h - h0) / 2) + 'px';
    track.style.height = (h + window.innerHeight * HOLD) + 'px';
  }

  stage.classList.add('is-anim');
  measure();
  gsap.set(frame, { xPercent: -50 });

  // how far the small card's bottom-left corner is from the grown one's
  const cornerShift = () => {
    const px = (v) => parseFloat(stage.style.getPropertyValue(v));
    return { x: (px('--ps-w') - px('--ps-w0')) / 2, y: -(px('--ps-h') - px('--ps-h0')) / 2 };
  };

  const labelsThreshold = () => stage.classList.contains('is-labeled') ? LABELS_HIDE : LABELS_AT;
  const span = ([a, b]) => ({ at: a, d: b - a });

  const caption = gsap.timeline({ paused: true })
    .fromTo(captionBits, { y: 0, opacity: 1 }, { y: -CAPTION_RISE, opacity: 0, ease: 'power2.in', duration: CAPTION_EACH, stagger: CAPTION_STAGGER }, 0)
    .fromTo(captionBack, { opacity: 1 }, { opacity: 0, ease: 'power1.inOut', duration: CAPTION_EACH + CAPTION_STAGGER * (captionBits.length - 1) }, 0);
  let captionShown = true;

  // "Deep dive into V2", one letter at a time (screen readers still read the whole title)
  title.setAttribute('aria-label', title.textContent.trim());
  title.innerHTML = [...title.textContent.trim()].map((ch) => ch === ' ' ? ' ' : `<span class="ps-letter" aria-hidden="true">${ch}</span>`).join('');
  const letters = [...title.querySelectorAll('.ps-letter')];
  gsap.set(title, { opacity: 1 });
  const titleLetters = gsap.timeline({ paused: true })
    .fromTo(letters, { yPercent: LETTER_RISE * 100, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'power3.out', duration: LETTER_EACH, stagger: LETTER_STAGGER });
  let titleShown = false;
  function setTitle(show) {
    if (show === titleShown) return;
    titleShown = show;
    show ? titleLetters.play() : titleLetters.reverse();
  }
  function setCaption(show) {
    if (show === captionShown) return;
    captionShown = show;
    show ? caption.reverse() : caption.play();
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: track,
      start: () => 'top top+=' + stickTop,   // the moment it sticks
      end: () => '+=' + window.innerHeight * HOLD,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: self => { setLabeled(self.progress >= labelsThreshold()); setCaption(self.progress < CAPTION_AT); setTitle(self.progress >= TITLE_IN[0]); },
      onRefresh: self => {
        setLabeled(self.progress >= LABELS_AT); sizeAllPills(); placeGlass();
        captionShown = self.progress < CAPTION_AT; caption.pause().progress(captionShown ? 0 : 1);   // (no animation on load/resize)
        titleShown = self.progress >= TITLE_IN[0]; titleLetters.pause().progress(titleShown ? 1 : 0);
      },
    },
  });

  const d = span(DIM_AT), t = span(TITLE_IN);
  tl.fromTo(frame, { scale: 1, borderRadius: RADIUS }, { scale: () => scale, borderRadius: () => RADIUS / scale, ease: 'power1.inOut', duration: GROW_END }, 0)
    .fromTo(dim, { opacity: 0 }, { opacity: DIM, ease: 'none', duration: d.d }, d.at)
    .fromTo(shade, { opacity: 0 }, { opacity: 1, ease: 'none', duration: t.d }, t.at)
    // the title sits at the grown image's bottom-left corner; while it's still growing, shift it
    // in to wherever that corner is right now (same easing as the growing, so it stays put on it)
    .fromTo(title, { x: () => cornerShift().x, y: () => cornerShift().y }, { x: 0, y: 0, ease: 'power1.inOut', duration: GROW_END }, 0)
    .to({}, { duration: 1 - GROW_END }, GROW_END);   // (the timeline runs the whole 0–1)

  function setLabeled(on) {
    if (on === stage.classList.contains('is-labeled')) return;
    stage.classList.toggle('is-labeled', on);
    pillsBox.inert = !on;        // hidden labels can't be tabbed to
  }

  pillsBox.inert = true;
  ScrollTrigger.addEventListener('refreshInit', measure);   // re-measure on resize
  sizeAllPills();
  placeGlass();
  ScrollTrigger.refresh();       // the track just got taller: move the triggers below it
  document.fonts.ready.then(() => { sizeAllPills(); ScrollTrigger.refresh(); });
})();

// ---------- plain stages (no growing): the Navigation chat-sidebar video ----------
// The labels pop in once it's mostly on screen; the video plays while it's on screen.
// TRIAL: add ?nopills to the page address to see it without the labels.
document.querySelectorAll('.ps-stage--plain').forEach((stage) => {
  const video = stage.querySelector('video');
  const SPEED = 0.8;   // playback speed (1 = the recording's own pace)
  if (video) { video.defaultPlaybackRate = SPEED; video.playbackRate = SPEED; }
  if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting) video.play().catch(() => {}); else if (!video.paused) video.pause();
    }, { threshold: 0.25 }).observe(video);
  }
  const box = stage.querySelector('.ps-pills');
  if (!box) return;   // (just the video, no labels)
  if (/[?&]nopills\b/.test(location.search)) { box.remove(); return; }

  const { pillsBox, sizeAllPills, placeGlass } = psInitPills(stage);
  const phone = window.matchMedia('(max-width: 760px)');
  stage.classList.toggle('is-list', phone.matches);
  const show = () => { stage.classList.add('is-labeled'); pillsBox.inert = false; sizeAllPills(); placeGlass(); };
  pillsBox.inert = true;
  sizeAllPills();
  placeGlass();
  window.addEventListener('resize', placeGlass);
  document.fonts.ready.then(() => { sizeAllPills(); placeGlass(); });
  if (phone.matches || !('IntersectionObserver' in window)) { show(); return; }
  new IntersectionObserver(([en], obs) => {
    if (en.intersectionRatio >= 0.6) { show(); obs.disconnect(); }
  }, { threshold: [0.6] }).observe(stage);
});
