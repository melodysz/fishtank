document.addEventListener('DOMContentLoaded', () => {

// ===============================
// PILL NAV — EXPAND / COLLAPSE + SPIN
// ===============================

const navWrap = document.getElementById('navWrap');
const navPill = document.getElementById('navPill');
const navAsterisk = document.getElementById('navAsterisk');
const navAsteriskImg = navAsterisk.querySelector('img');

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

gsap.set(navAsteriskImg, { rotation: 0 });

// Nav intro animation
gsap.set(navPill, { opacity: 0 });
gsap.set(navAsteriskImg, { rotation: -720 });

window.addEventListener('load', () => {
  gsap.timeline({ delay: 0.8 })
    .to(navPill, { opacity: 1, duration: 0.4, ease: "power2.out", clearProps: "opacity" })
    .to(navAsteriskImg, { rotation: 0, duration: 2.5, ease: "power2.out" }, "<0.1");
});

let leaveTimer = null;
let navIsAnimating = false;

function onNavEnter() {
  clearTimeout(leaveTimer);
  if (navPill.classList.contains('expanded')) return;
  navPill.classList.add('expanded');
  navIsAnimating = true;
  setTimeout(() => {
    navIsAnimating = false;
    positionBubble();
  }, 560);
  gsap.killTweensOf(navAsteriskImg);
  gsap.to(navAsteriskImg, { rotation: -378, duration: 1.2, ease: "back.out(1.4)" });
}

function onNavLeave(e) {
  if (workBubble.contains(e.relatedTarget)) return;
  leaveTimer = setTimeout(() => {
    if (bubbleOpen) return;
    navPill.classList.remove('expanded');
    navIsAnimating = true;
    setTimeout(() => { navIsAnimating = false; }, 560);
    gsap.killTweensOf(navAsteriskImg);
    gsap.to(navAsteriskImg, { rotation: 0, duration: 1.2, ease: "back.out(1.4)" });
  }, 400);
}

// AFTER
navAsterisk.addEventListener('mouseenter', onNavEnter);
navWrap.addEventListener('mouseleave', onNavLeave);

navAsterisk.addEventListener('mouseenter', () => {
  if (!navPill.classList.contains('expanded')) return;
  gsap.killTweensOf(navAsteriskImg);
  gsap.to(navAsteriskImg, { rotation: '-=720', duration: 1.8, ease: "power2.out" });
});

// ===============================
// LENIS SMOOTH SCROLL
// ===============================

const lenis = new Lenis({
  lerp: 0.15,
  smoothWheel: true,
  wheelMultiplier: 0.7,
  touchMultiplier: 1.5,
  infinite: false,
  syncTouch: true
});

gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', (e) => { ScrollTrigger.update(); });
ScrollTrigger.defaults({ markers: false });

// ===============================
// SCROLL PROGRESS BAR
// ===============================

const scrollProgress = document.getElementById('scroll-progress');

lenis.on('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = pct + '%';
  scrollProgress.style.height = pct > 99 ? '0px' : '3px';
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { ScrollTrigger.refresh(); }, 250);
});

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// ===============================
// HERO ANIMATIONS
// ===============================

function initDeep24HeroAnimations() {
  // (entry splash is handled by ../js/page-wipe.js)

  gsap.set('#hero-d24-icon', { opacity: 0, y: 24 });
  gsap.set('#hero-d24-tagline', { opacity: 0, y: 24 });
  gsap.set('.hero-orbit', { autoAlpha: 0, scale: 0.75 });
  gsap.set('.hero-center-identity', { opacity: 1 });

  gsap.fromTo('#hero-d24-icon',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.5 }
  );
  gsap.fromTo('#hero-d24-tagline',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.75 }
  );

  gsap.set('.hero-orbit', { autoAlpha: 0, scale: 0.75, rotation: 0 });
  gsap.to('.hero-orbit', { autoAlpha: 1, scale: 1, rotation: '+=150', duration: 1.5, ease: 'expo.out' });
}

window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.location.reload();
});

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  lenis.scrollTo(0, { immediate: true });
  ScrollTrigger.refresh();
  initDeep24HeroAnimations();
});

// ===============================
// CUSTOM CURSOR — BLOB STYLE
// ===============================

const cursorMain = document.getElementById('cursor');

let mouseX = 0, mouseY = 0;
let curX = 0, curY = 0;
let isBlobMode = false;

const LERP_NORMAL = 0.12;
const LERP_BLOB = 0.10;
const BLOB_HEIGHT = 40;

// Cursor dot follows the mouse with a little lag. The further behind it is
// (i.e. the faster the mouse moves), the bigger it swells — up to ~1.7x —
// then it eases back to normal size as it catches up. Stays normal size while
// it's a hover blob over links. Moves with transform (cheap) instead of left/top.
let cursorScale = 1;
// While hovering a link, the cursor bubble locks onto it: centred on the link's
// text and sized to that text plus even padding (it also follows the text if it
// changes width, e.g. "work" → "work!"). Otherwise it follows the mouse.
let blobTarget = null;
const BLOB_PAD_X = 14;   // px of bubble either side of the text
const BLOB_PAD_Y = 5;    // px of bubble above and below the text
let blobTargetX = 0, blobTargetY = 0, blobW = 0, blobH = 0;
function blobTextBox(el) {
  const r = document.createRange();
  r.selectNodeContents(el);
  const b = r.getBoundingClientRect();
  return b.width ? b : el.getBoundingClientRect();
}
function followBlobTarget() {
  const b = blobTextBox(blobTarget);
  blobTargetX = b.left + b.width / 2;
  blobTargetY = b.top + b.height / 2;
  const w = Math.round(b.width + BLOB_PAD_X * 2);
  if (w !== blobW) { blobW = w; cursorMain.style.setProperty('--blob-w', w + 'px'); }
  const h = Math.round(b.height + BLOB_PAD_Y * 2);
  if (h !== blobH) { blobH = h; cursorMain.style.setProperty('--blob-h', h + 'px'); }
}

function animateCursor() {
  if (blobTarget) followBlobTarget();
  const tx = blobTarget ? blobTargetX : mouseX, ty = blobTarget ? blobTargetY : mouseY;
  const dx = tx - curX, dy = ty - curY;
  const lag = Math.hypot(dx, dy);
  const targetScale = isBlobMode ? 1 : 1 + Math.min(lag / 160, 1) * 0.7;
  const scaleChanging = Math.abs(targetScale - cursorScale) > 0.002;
  if (lag > 0.05 || scaleChanging) {
    const lerp = isBlobMode ? LERP_BLOB : LERP_NORMAL;
    curX += dx * lerp;
    curY += dy * lerp;
    cursorScale += (targetScale - cursorScale) * 0.18;
    cursorMain.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%) scale(${cursorScale})`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

window.addEventListener('mouseenter', () => cursorMain.classList.add('active'));
window.addEventListener('mouseleave', () => cursorMain.classList.remove('active'));
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorMain.classList.add('active');
});

// Is this link sitting on a dark background? (first solid-ish background found going
// up from it). The bubble blends with "screen" on dark, "multiply" on light, so it
// keeps its colour either way.
function onDarkBackground(el) {
  const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
  for (let n = el; n; n = n.parentElement) {
    const cs = getComputedStyle(n);
    // a gradient background (like the case-study footer's): average its colours
    if (cs.backgroundImage.includes('gradient')) {
      const cols = [...cs.backgroundImage.matchAll(/rgba?\(([^)]+)\)/g)].map((c) => c[1].split(',').map(Number));
      if (cols.length) return cols.reduce((a, c) => a + lum(c[0], c[1], c[2]), 0) / cols.length < 110;
    }
    const m = cs.backgroundColor.match(/[\d.]+/g);
    if (m && (m[3] === undefined || +m[3] > 0.5)) {
      const [r, g, b] = m.map(Number);
      return lum(r, g, b) < 110;
    }
  }
  return false;
}

function expandToBlob(el) {
  isBlobMode = true;
  gsap.set(cursorMain, { clearProps: 'width,height' });   // size comes from --blob-w/--blob-h only
  blobTarget = el;                 // lock onto this link (see followBlobTarget)
  cursorMain.classList.toggle('on-dark', onDarkBackground(el));
  blobW = 0; blobH = 0;
  followBlobTarget();
  cursorMain.classList.add('is-blob');
}

function shrinkBlob() {
  blobTarget = null;
  isBlobMode = false;
  cursorMain.classList.remove('is-blob');
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    isBlobMode = false;
    cursorMain.classList.remove('is-blob');
    gsap.set(cursorMain, { clearProps: 'width,height' });
    clearTimeout(leaveTimer);
    gsap.killTweensOf(navAsteriskImg);
  }
});

// Blob on sidebar/footer links
const clickableEls = document.querySelectorAll(
  '.case-footer a, .case-footer-right a, .case-footer-links a, .sidebar-nav a, .nav-link'
);

const navWordmarkEl = document.querySelector('.nav-wordmark');
navWordmarkEl.addEventListener('mouseenter', () => expandToBlob(navWordmarkEl));
navWordmarkEl.addEventListener('mouseleave', () => shrinkBlob());
navWordmarkEl.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '../';
});

clickableEls.forEach(el => {
  // footer + sidebar text links: the bubble locks onto the text, like the nav
  el.addEventListener('mouseenter', () => expandToBlob(el));
  el.addEventListener('mouseleave', () => { if (blobTarget === el) shrinkBlob(); });
});

// Nav link items — flip text on hover + blob cursor
document.querySelectorAll('.nav-link-item').forEach(link => {
  const defaultText = link.getAttribute('data-default');
  const hoverText = link.getAttribute('data-hover');

  link.innerHTML = `<span class="nav-link-inner" style="display:inline-block;will-change:transform,opacity;">${defaultText}</span>`;
  const inner = link.querySelector('.nav-link-inner');
  inner.style.setProperty('cursor', 'pointer', 'important');

  link.addEventListener('mouseenter', () => {
    expandToBlob(link);
    gsap.to(inner, {
      y: -10, opacity: 0, duration: 0.1, ease: "power2.in",
      onComplete: () => {
        inner.textContent = hoverText;
        inner.style.color = '#000000';
        inner.classList.add('nav-hover-italic');
        inner.style.setProperty('cursor', 'pointer', 'important');
        gsap.fromTo(inner, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.14, ease: "power2.out" });
      }
    });
  });

  link.addEventListener('mouseleave', () => {
    shrinkBlob();
    gsap.to(inner, {
      y: 10, opacity: 0, duration: 0.1, ease: "power2.in",
      onComplete: () => {
        inner.textContent = defaultText;
        inner.style.color = '#181812';
        inner.classList.remove('nav-hover-italic');
        inner.style.setProperty('cursor', 'pointer', 'important');
        gsap.fromTo(inner, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.14, ease: "power2.out" });
      }
    });
  });
});

// ===================================
// WORK DROPDOWN THOUGHT BUBBLE
// ===================================

const workWrap = document.getElementById('navWorkWrap');
const workBubble = document.getElementById('workBubble');
const dotsWrap = document.getElementById('bubbleDotsWrap');
const dotSm = dotsWrap.querySelector('.bubble-dot-sm');
const dotMd = dotsWrap.querySelector('.bubble-dot-md');
const dotLg = dotsWrap.querySelector('.bubble-dot-lg');
const bubbleMenu = workBubble.querySelector('.bubble-menu');

let bubbleLeaveTimer = null;
let bubbleOpen = false;

function positionBubble() {
  const rect = workWrap.getBoundingClientRect();
  const menuWidth = bubbleMenu.offsetWidth;
  workBubble.style.left = (rect.left + rect.width / 2 - menuWidth / 2) + 'px';
  workBubble.style.top = (rect.bottom + 16) + 'px';
  dotsWrap.style.left = workBubble.style.left;
  dotsWrap.style.top = workBubble.style.top;
}

function openBubble() {
  if (bubbleOpen) return;
  bubbleOpen = true;
  positionBubble();
  workBubble.style.pointerEvents = 'auto';
  workBubble.setAttribute('aria-hidden', 'false');

  gsap.killTweensOf([dotSm, dotMd, dotLg, bubbleMenu]);
  gsap.fromTo(dotSm, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.5)', delay: 0, zIndex: 2 });
  gsap.fromTo(dotMd, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.38, ease: 'back.out(2.5)', delay: 0.09, zIndex: 2 });
  gsap.fromTo(dotLg, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.40, ease: 'back.out(2.5)', delay: 0.18, zIndex: 2 });
  gsap.fromTo(bubbleMenu, { opacity: 0, scale: 0.88, y: -6 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)', delay: 0.28 });
}

function closeBubble() {
  bubbleOpen = false;
  workBubble.style.pointerEvents = 'none';
  workBubble.setAttribute('aria-hidden', 'true');

  gsap.killTweensOf([dotSm, dotMd, dotLg, bubbleMenu]);
  gsap.to(bubbleMenu, { opacity: 0, scale: 0.88, y: -6, duration: 0.20, ease: 'power2.in' });
  gsap.to(dotLg, { opacity: 0, scale: 0.3, duration: 0.16, ease: 'power2.in', delay: 0.04 });
  gsap.to(dotMd, { opacity: 0, scale: 0.3, duration: 0.14, ease: 'power2.in', delay: 0.08 });
  gsap.to(dotSm, { opacity: 0, scale: 0.3, duration: 0.12, ease: 'power2.in', delay: 0.12 });
}

workWrap.addEventListener('mouseenter', () => {
  clearTimeout(bubbleLeaveTimer);
  if (navPill.classList.contains('expanded') && !navIsAnimating) openBubble();
});

workWrap.addEventListener('mouseleave', () => {
  bubbleLeaveTimer = setTimeout(closeBubble, 120);
});

workBubble.addEventListener('mouseenter', () => {
  clearTimeout(bubbleLeaveTimer);
  clearTimeout(leaveTimer);
});
workBubble.addEventListener('mouseleave', (e) => {
  bubbleLeaveTimer = setTimeout(closeBubble, 120);
  if (!navWrap.contains(e.relatedTarget)) {
    leaveTimer = setTimeout(() => {
      navPill.classList.remove('expanded');
      navIsAnimating = true;
      setTimeout(() => { navIsAnimating = false; }, 560);
      gsap.killTweensOf(navAsteriskImg);
      gsap.to(navAsteriskImg, { rotation: 0, duration: 1.2, ease: "back.out(1.4)" });
    }, 200);
  }
});

navWrap.addEventListener('mouseleave', (e) => {
  if (!workBubble.contains(e.relatedTarget)) closeBubble();
});

document.querySelectorAll('.bubble-item').forEach(item => {
  item.addEventListener('mouseenter', () => expandToBlob(item));
  item.addEventListener('mouseleave', () => shrinkBlob());
});

// ===================================
// SIDEBAR NAV SCROLL SPY
// ===================================

const navItems = document.querySelectorAll('.nav-item');

function updateActiveNav() {
  const scrollPos = window.scrollY + 200;
  const mainSections = ['overview', 'research', 'design', 'pivot', 'reflection'];
  let currentSection = '';
  mainSections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section && section.offsetTop <= scrollPos) currentSection = sectionId;
  });
  navItems.forEach(item => {
    item.classList.remove('active');
    const link = item.querySelector('.nav-link');
    if (link && link.getAttribute('href') === `#${currentSection}`) item.classList.add('active');
  });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

document.querySelectorAll('.sidebar-nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    const targetId = href.substring(1);
    const validSections = ['overview', 'research', 'design', 'pivot', 'reflection'];
    if (!validSections.includes(targetId)) return;
    const target = document.querySelector(`section#${targetId}.content-section`);
    if (!target) return;
    const offsets = { overview: -50, research: 15, design: 10, pivot: -150, reflection: -150 };
    lenis.scrollTo(`#${targetId}`, { offset: offsets[targetId] ?? -150, immediate: true });
    navItems.forEach(item => {
      item.classList.remove('active');
      const link = item.querySelector('.nav-link');
      if (link && link.getAttribute('href') === href) item.classList.add('active');
    });
  });
});

ScrollTrigger.create({
  trigger: ".overview-section .section-title",
  start: "top 80%",
  onEnter: () => document.querySelector('.sidebar-nav').classList.add('visible'),
  onLeaveBack: () => document.querySelector('.sidebar-nav').classList.remove('visible')
});

// ===================================
// IMAGE LOADING
// ===================================

function handleImageLoad(img) {
  img.classList.add('loaded');
  const container = img.closest('.dilemma-image, .unsent-project-image, .sidechat-image, .persona-card, .market-audit-image, .large-image-section, .ideation-image-section, .prototype-image, .hero-section, .original-interface-image-section, .style-guide-image-section, .constraints-image-section, .onboarding-image-section, .chat-layout-image-section, .pivot-styles-image-section, .pivot-chat-buttons-section');
  if (container) container.classList.add('image-loaded');
}

document.querySelectorAll('img').forEach(img => {
  if (img.complete && img.naturalHeight !== 0) { handleImageLoad(img); }
  else {
    img.addEventListener('load', () => handleImageLoad(img));
    img.addEventListener('error', () => handleImageLoad(img));
  }
});

// REPLACE with:
document.querySelectorAll('.overview-block, .stamp-card, .results-circle, .conclusion-circle, .market-audit-image, .unsent-project-image, .sidechat-image, .unsent-analysis, .sidechat-analysis, .dilemma-row, .market-audit-text, .dilemma-text, .personas-intro, .ideation-section, .ideation-image-section, .ideation-quote, .user-flow-section, .lofi-section, .midfi-section, .wireframe-grid img, .mascot-exploration-section, .feedback-section, .feedback-grid, .prototype-block').forEach(el => {
  el.style.opacity = '1';
  el.style.transform = 'none';
});

// ===================================
// ANIMATED HIGHLIGHTS
// ===================================

const highlights = document.querySelectorAll('.highlight');
const paragraphGroups = new Map();
highlights.forEach(highlight => {
  const parent = highlight.closest('p, h3, h4, .meta-text, .stamp-text');
  if (!paragraphGroups.has(parent)) paragraphGroups.set(parent, []);
  paragraphGroups.get(parent).push(highlight);
});
paragraphGroups.forEach(group => { group.forEach((h, i) => { h.style.transitionDelay = `${i * 0.15}s`; }); });

lenis.on('scroll', () => {
  highlights.forEach(highlight => {
    const rect = highlight.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.top < viewH && rect.bottom > 0) highlight.classList.add('animate-in');
    if (rect.bottom < -1000 || rect.top > viewH + 1000) highlight.classList.remove('animate-in');
  });
});

// ===================================
// FOOTER STAR + NAV FOOTER MODE
// ===================================

gsap.to("#case-footer-star-icon", { rotation: 360, duration: 25, ease: "none", repeat: -1 });

const footerState = { sidebarHidden: false, navHidden: false, footerStarShown: false, navFaded: false };
const SIDEBAR_THRESHOLD = 350;
const NAV_THRESHOLD = 200;
const FOOTSTAR_THRESHOLD = 50;
const NAV_FADE_THRESHOLD = 400;

lenis.on('scroll', (e) => {
  ScrollTrigger.update();

  const footer = document.querySelector('.case-footer');
  if (!footer) return;
  const rect = footer.getBoundingClientRect();
  const viewH = window.innerHeight;
  const distanceFromBottom = viewH - rect.top;

  // Hide sidebar near footer
  if (distanceFromBottom > SIDEBAR_THRESHOLD && !footerState.sidebarHidden) {
    footerState.sidebarHidden = true;
    gsap.to('.sidebar-nav', { opacity: 0, duration: 0.3 });
  } else if (distanceFromBottom <= SIDEBAR_THRESHOLD && footerState.sidebarHidden) {
    footerState.sidebarHidden = false;
    gsap.to('.sidebar-nav', { opacity: 1, duration: 0.3 });
  }

  // Fade nav pill when footer fills screen
  if (distanceFromBottom > NAV_FADE_THRESHOLD && !footerState.navFaded) {
    footerState.navFaded = true;
    navWrap.classList.add('nav-hidden');
  } else if (distanceFromBottom <= NAV_FADE_THRESHOLD && footerState.navFaded) {
    footerState.navFaded = false;
    navWrap.classList.remove('nav-hidden');
    isBlobMode = false;
    cursorMain.classList.remove('is-blob');
    cursorMain.style.removeProperty('--blob-w');
    cursorMain.style.removeProperty('--blob-h');
    gsap.set(cursorMain, { clearProps: 'width,height' });
    navPill.classList.remove('expanded');
    clearTimeout(leaveTimer);
    gsap.killTweensOf(navAsteriskImg);
  }

  // Tint pill nav for footer
  if (distanceFromBottom > NAV_THRESHOLD && !footerState.navHidden) {
    footerState.navHidden = true;
    navPill.classList.add('footer-mode');
  } else if (distanceFromBottom <= NAV_THRESHOLD && footerState.navHidden) {
    footerState.navHidden = false;
    navPill.classList.remove('footer-mode');
  }

  // Footer star entrance
  if (distanceFromBottom > FOOTSTAR_THRESHOLD && !footerState.footerStarShown) {
    footerState.footerStarShown = true;
    gsap.to(".case-footer-star-wrapper", { opacity: 1, scale: 1, rotation: "+=720", duration: 1.5, ease: "expo.out" });
  } else if (distanceFromBottom <= FOOTSTAR_THRESHOLD && footerState.footerStarShown) {
    footerState.footerStarShown = false;
    gsap.to(".case-footer-star-wrapper", { opacity: 0, scale: 0.6, duration: 1, ease: "power2.in" });
  }
});

// ===================================
// HERO PARALLAX
// ===================================

gsap.to(".hero-image", { yPercent: 10, ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true }});
gsap.to(".hero-tagline-bg", { yPercent: 1, opacity: 0, filter: "blur(12px)", ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero-section", start: "top top", end: "100% top", scrub: true }});
gsap.to(".hero-orbit-wrapper", { yPercent: 8, opacity: 0, ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero-section", start: "top top", end: "100% top", scrub: true }});
gsap.to(".hero-center-identity", { yPercent: 12, opacity: 0, ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero-section", start: "top top", end: "100% top", scrub: true }});

// ===================================
// ORBIT WIDGET BUILDER
// ===================================

(function() {
  const WIDGET_COUNT = 10, TOTAL_SLOTS = 20, ORBIT_RADIUS = 410, WIDGET_SIZE = 66;
  const BASE_URL = 'https://raw.githubusercontent.com/melodysz/baubles/main/deep24/widget%20';
  const inner = document.getElementById('deep24-orbit-inner');
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const imgNum = (i % WIDGET_COUNT) + 1;
    const angleDeg = (360 / TOTAL_SLOTS) * i - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const cx = Math.cos(angleRad) * ORBIT_RADIUS;
    const cy = Math.sin(angleRad) * ORBIT_RADIUS;
    const card = document.createElement('div');
    card.className = 'orbit-widget';
    card.style.cssText = `left: calc(50% + ${cx}px - ${WIDGET_SIZE / 2}px); top: calc(50% + ${cy}px - ${WIDGET_SIZE / 2}px); transform: rotate(${angleDeg + 90}deg);`;
    const img = document.createElement('img');
    img.src = `${BASE_URL}${imgNum}.png`;
    img.alt = `Widget ${imgNum}`;
    img.loading = 'lazy';
    card.appendChild(img);
    inner.appendChild(card);
  }
  gsap.to('#deep24-orbit-inner', { rotation: 360, duration: 90, ease: 'none', repeat: -1 });
})();

});