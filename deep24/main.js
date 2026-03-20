document.addEventListener('DOMContentLoaded', () => {


gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const lenis = new Lenis({ lerp: 0.15, smoothWheel: true, wheelMultiplier: 0.7, touchMultiplier: 1.5, infinite: false, syncTouch: true });
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', (e) => { ScrollTrigger.update(); });
ScrollTrigger.defaults({ markers: false });

// NOW lenis exists, safe to use it
const entryOverlay = document.getElementById('page-entry-overlay');
if (entryOverlay) {
  gsap.to(entryOverlay, {
    opacity: 0, duration: 1.0, delay: 0.2, ease: "power2.inOut",
    onComplete: () => entryOverlay.remove()
  });
}

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  lenis.scrollTo(0, { immediate: true });
  ScrollTrigger.refresh();
});

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { ScrollTrigger.refresh(); }, 250);
});

// CURSOR
const cursorMain = document.getElementById('cursor');
let lastMouseX = 0, lastMouseY = 0, isHovering = false;
window.addEventListener("mouseenter", () => cursorMain.classList.add("active"));
window.addEventListener("mouseleave", () => cursorMain.classList.remove("active"));
window.addEventListener('mousemove', (e) => {
  cursorMain.classList.add('active');
  gsap.to(cursorMain, { left: e.clientX + 'px', top: e.clientY + 'px', duration: 0.1 });
  if (Math.hypot(e.clientX - lastMouseX, e.clientY - lastMouseY) > 15) {
    createBubble(e.clientX, e.clientY);
    lastMouseX = e.clientX; lastMouseY = e.clientY;
  }
});

function createBubble(x, y) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble-particle';
  document.body.appendChild(bubble);
  const baseSize = isHovering ? 12 : 8;
  bubble.style.width = (Math.random() * baseSize + baseSize) + 'px';
  bubble.style.height = bubble.style.width;
  bubble.style.left = x + 'px';
  bubble.style.top = y + 'px';
  gsap.to(bubble, { top: (y - (40 + Math.random() * 60)) + 'px', left: (x + (Math.random() * 30 - 15)) + 'px', opacity: 0, width: '2px', height: '2px', duration: 1.2 + Math.random() * 0.8, ease: "power1.out", onComplete: () => bubble.remove() });
}

window.addEventListener("pointermove", (e) => {
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const hovered = elements.find(el => {
    if (el.id === 'cursor' || el.classList.contains('bubble-particle') || el.closest(".nav-center-star")) return false;
    return el.matches?.(".interactable, a[href], button, [role='button']") || el.closest?.(".interactable, a[href], button, [role='button']");
  });
  const next = !!hovered;
  if (next !== isHovering) {
    isHovering = next;
    gsap.to(cursorMain, { width: next ? '48px' : '12px', height: next ? '48px' : '12px', duration: 0.3, ease: "power2.out" });
  }
});

// NAV
const navName = document.getElementById('nav-name');
const nameInner = navName.querySelector('.name-inner');
navName.addEventListener('mouseenter', () => {
  gsap.to(nameInner, { y: -10, opacity: 0, duration: 0.2, onComplete: () => {
    nameInner.textContent = "MELODY";
    Object.assign(nameInner.style, { fontFamily: "'Helvetica Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase" });
    gsap.fromTo(nameInner, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
  }});
});
navName.addEventListener('mouseleave', () => {
  gsap.to(nameInner, { y: 10, opacity: 0, duration: 0.2, onComplete: () => {
    nameInner.textContent = "美迪";
    Object.assign(nameInner.style, { fontFamily: "'Zen Old Mincho', serif", fontSize: "1.2rem", letterSpacing: "0.05em", textTransform: "none" });
    gsap.fromTo(nameInner, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
  }});
});

document.querySelectorAll('.nav-swap').forEach(link => {
  const originalText = link.textContent.trim();
  link.innerHTML = `<span class="nav-inner">${originalText}</span>`;
  const inner = link.querySelector('.nav-inner');
  const defaultText = link.getAttribute('data-default') || originalText;
  const hoverText = link.getAttribute('data-hover') || originalText;
  inner.style.display = "inline-block";
  inner.style.willChange = "transform, opacity";
  function lockNavWidth() {
    inner.textContent = defaultText;
    const w1 = inner.getBoundingClientRect().width;
    inner.textContent = hoverText;
    const w2 = inner.getBoundingClientRect().width;
    link.style.width = `${Math.ceil(Math.max(w1, w2)) + 2}px`;
    inner.textContent = defaultText;
  }
  lockNavWidth();
  window.addEventListener("resize", lockNavWidth);
  link.addEventListener('mouseenter', () => {
    gsap.to(inner, { y: -10, opacity: 0, duration: 0.2, onComplete: () => { inner.textContent = hoverText; gsap.fromTo(inner, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }); }});
  });
  link.addEventListener('mouseleave', () => {
    gsap.to(inner, { y: 10, opacity: 0, duration: 0.2, onComplete: () => { inner.textContent = defaultText; gsap.fromTo(inner, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }); }});
  });
});

const navStarContainer = document.querySelector('.nav-center-star');
const navStarIcon = document.getElementById('nav-star-icon');
if (navStarContainer && navStarIcon) {
  navStarContainer.addEventListener('mouseenter', () => {
    gsap.killTweensOf(navStarIcon);
    gsap.to(navStarIcon, { rotation: (gsap.getProperty(navStarIcon, "rotation") || 0) + 720, duration: 2.5, ease: "power2.out", overwrite: "auto" });
  });
}

// SIDEBAR SCROLL SPY
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

// IMAGE LOADING
function handleImageLoad(img) {
  img.classList.add('loaded');
  const container = img.closest('.dilemma-image, .unsent-project-image, .sidechat-image, .persona-card, .market-audit-image, .large-image-section, .ideation-image-section, .prototype-image, .hero-section, .original-interface-image-section, .style-guide-image-section, .constraints-image-section, .onboarding-image-section, .chat-layout-image-section, .pivot-styles-image-section, .pivot-chat-buttons-section');
  if (container) container.classList.add('image-loaded');
}
document.querySelectorAll('img').forEach(img => {
  if (img.complete) { handleImageLoad(img); }
  else {
    img.addEventListener('load', () => handleImageLoad(img));
    img.addEventListener('error', () => handleImageLoad(img));
  }
});

// FADE ANIMATIONS
const fadeElements = document.querySelectorAll('.overview-block, .stamp-card, .results-circle, .conclusion-circle, .market-audit-image, .unsent-project-image, .sidechat-image, .unsent-analysis, .sidechat-analysis, .dilemma-row, .market-audit-text, .dilemma-text, .personas-intro, .ideation-section, .ideation-image-section, .ideation-quote, .user-flow-section, .lofi-section, .midfi-section, .wireframe-grid img, .mascot-exploration-section, .feedback-section, .feedback-grid, .prototype-block');
document.querySelectorAll('.stamp-card').forEach((card, index) => card.style.setProperty('--index', index));
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.9, rootMargin: '0px 0px -450px 0px' });
fadeElements.forEach(element => { element.classList.add('fade-in-element'); fadeObserver.observe(element); });
document.querySelectorAll('.hero-meta *').forEach(el => { el.classList.remove('fade-in-element'); el.classList.add('visible'); });

// HIGHLIGHTS
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

// FOOTER STAR
gsap.to("#case-footer-star-icon", { rotation: 360, duration: 25, ease: "none", repeat: -1 });
function spinStarLandUpright() {
  const star = document.getElementById("nav-star-icon");
  if (!star) return;
  gsap.killTweensOf(star);
  const current = gsap.getProperty(star, "rotation") || 0;
  const normalized = ((current % 360) + 360) % 360;
  gsap.to(star, { rotation: current + (360 - normalized) + 360, duration: 3.5, ease: "power1.out", overwrite: "auto" });
}
const footerState = { sidebarHidden: false, navStarHidden: false, footerStarShown: false };
const SIDEBAR_THRESHOLD = 350, NAVSTAR_THRESHOLD = 200, FOOTSTAR_THRESHOLD = 50;
lenis.on('scroll', (e) => {
  ScrollTrigger.update();
  const footer = document.querySelector('.case-footer');
  if (!footer) return;
  const rect = footer.getBoundingClientRect();
  const viewH = window.innerHeight;
  const distanceFromBottom = viewH - rect.top;
  if (distanceFromBottom > SIDEBAR_THRESHOLD && !footerState.sidebarHidden) { footerState.sidebarHidden = true; gsap.to('.sidebar-nav', { opacity: 0, duration: 0.3 }); }
  else if (distanceFromBottom <= SIDEBAR_THRESHOLD && footerState.sidebarHidden) { footerState.sidebarHidden = false; gsap.to('.sidebar-nav', { opacity: 1, duration: 0.3 }); }
  if (distanceFromBottom > NAVSTAR_THRESHOLD && !footerState.navStarHidden) { footerState.navStarHidden = true; spinStarLandUpright(); gsap.to(".nav-center-star", { opacity: 0, duration: 0.6 }); gsap.to(".top-nav", { color: "#83E7FF", duration: 0.6 }); }
  else if (distanceFromBottom <= NAVSTAR_THRESHOLD && footerState.navStarHidden) { footerState.navStarHidden = false; spinStarLandUpright(); gsap.to(".nav-center-star", { opacity: 1, duration: 0.6 }); gsap.to(".top-nav", { color: "var(--nav-orange)", duration: 0.6 }); }
  if (distanceFromBottom > FOOTSTAR_THRESHOLD && !footerState.footerStarShown) { footerState.footerStarShown = true; gsap.to(".case-footer-star-wrapper", { opacity: 1, scale: 1, rotation: "+=720", duration: 1.5, ease: "expo.out" }); }
  else if (distanceFromBottom <= FOOTSTAR_THRESHOLD && footerState.footerStarShown) { footerState.footerStarShown = false; gsap.to(".case-footer-star-wrapper", { opacity: 0, scale: 0.6, duration: 1, ease: "power2.in" }); }
});

// ORBIT WIDGET BUILDER
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

// HERO ANIMATION FUNCTIONS
function playDeep24OrbitIn() {
  gsap.killTweensOf('.hero-orbit');
  gsap.set('.hero-orbit', { autoAlpha: 0, scale: 0.75, rotation: 0 });
  gsap.to('.hero-orbit', { autoAlpha: 1, scale: 1, rotation: '+=150', duration: 1.5, ease: 'expo.out' });
}
function playDeep24IdentityIn() {
  const icon = document.getElementById('hero-d24-icon');
  const tagline = document.getElementById('hero-d24-tagline');
  gsap.killTweensOf([icon, tagline, '.hero-center-identity']);
  gsap.set('.hero-center-identity', { opacity: 1, filter: 'none', y: 0 });
  gsap.fromTo(icon, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', overwrite: true });
  gsap.fromTo(tagline, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.25, overwrite: true });
}

function initDeep24HeroAnimations() {
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
  playDeep24OrbitIn();
}

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    window.location.reload();
  } else {
    initDeep24HeroAnimations();
  }
});

gsap.to(".hero-image", { yPercent: 10, ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true }});
gsap.to(".hero-tagline-bg", { yPercent: 1, opacity: 0, filter: "blur(12px)", ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero-section", start: "top top", end: "100% top", scrub: true }});
gsap.to(".hero-orbit-wrapper", { yPercent: 8, opacity: 0, filter: "blur(8px)", ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero-section", start: "top top", end: "100% top", scrub: true }});
gsap.to(".hero-center-identity", { yPercent: 12, opacity: 0, filter: "blur(12px)", ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero-section", start: "top top", end: "100% top", scrub: true }});

ScrollTrigger.create({
  trigger: ".overview-section .section-title",
  start: "top 80%",
  onEnter: () => document.querySelector('.sidebar-nav').classList.add('visible'),
  onLeaveBack: () => document.querySelector('.sidebar-nav').classList.remove('visible')
});
  
  });