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
  scrollProgress.style.height = pct > 99 ? '0px' : '5px';
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
  const entryOverlay = document.getElementById('page-entry-overlay');
  if (entryOverlay) {
    gsap.to(entryOverlay, {
      opacity: 0, duration: 0.8, delay: 0.1, ease: "power2.inOut",
      onComplete: () => entryOverlay.remove()
    });
  }

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

function animateCursor() {
  const lerp = isBlobMode ? LERP_BLOB : LERP_NORMAL;
  curX += (mouseX - curX) * lerp;
  curY += (mouseY - curY) * lerp;
  cursorMain.style.left = curX + 'px';
  cursorMain.style.top = curY + 'px';
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

function expandToBlob(el) {
  const rect = el.getBoundingClientRect();
  isBlobMode = true;
  cursorMain.style.setProperty('--blob-w', rect.width + 'px');
  cursorMain.style.setProperty('--blob-h', BLOB_HEIGHT + 'px');
  cursorMain.classList.add('is-blob');
  mouseX = rect.left + rect.width / 2;
  mouseY = rect.top + BLOB_HEIGHT / 2;
}

function shrinkBlob() {
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

clickableEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (isBlobMode) return;
    cursorMain.classList.add('is-blob');
    gsap.to(cursorMain, { width: '48px', height: '48px', duration: 0.3, ease: "power2.out" });
  });
  el.addEventListener('mouseleave', () => {
    if (isBlobMode) return;
    cursorMain.classList.remove('is-blob');
    gsap.to(cursorMain, { width: '18px', height: '18px', duration: 0.3, ease: "power2.out" });
  });
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
      y: -10, opacity: 0, duration: 0.18, ease: "power2.in",
      onComplete: () => {
        inner.textContent = hoverText;
        inner.style.color = '#000000';
        inner.style.fontWeight = '500';
        inner.style.setProperty('cursor', 'pointer', 'important');
        gsap.fromTo(inner, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: "power2.out" });
      }
    });
  });

  link.addEventListener('mouseleave', () => {
    shrinkBlob();
    gsap.to(inner, {
      y: 10, opacity: 0, duration: 0.18, ease: "power2.in",
      onComplete: () => {
        inner.textContent = defaultText;
        inner.style.color = '#181812';
        inner.style.fontWeight = '400';
        inner.style.setProperty('cursor', 'pointer', 'important');
        gsap.fromTo(inner, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: "power2.out" });
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

// ===================================
// SCROLL FADE-IN ANIMATIONS
// ===================================

const fadeElements = document.querySelectorAll('.overview-block, .stamp-card, .results-circle, .conclusion-circle, .market-audit-image, .unsent-project-image, .sidechat-image, .unsent-analysis, .sidechat-analysis, .dilemma-row, .market-audit-text, .dilemma-text, .personas-intro, .ideation-section, .ideation-image-section, .ideation-quote, .user-flow-section, .lofi-section, .midfi-section, .wireframe-grid img, .mascot-exploration-section, .feedback-section, .feedback-grid, .prototype-block');

document.querySelectorAll('.stamp-card').forEach((card, index) => card.style.setProperty('--index', index));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.9, rootMargin: '0px 0px -450px 0px' });

fadeElements.forEach(element => { element.classList.add('fade-in-element'); fadeObserver.observe(element); });
document.querySelectorAll('.hero-meta *').forEach(el => { el.classList.remove('fade-in-element'); el.classList.add('visible'); });

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