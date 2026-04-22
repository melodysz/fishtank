document.addEventListener('DOMContentLoaded', () => {

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  
window.addEventListener('scroll', () => {
  heroBgImg.style.transform = `translateY(${window.scrollY * 1.3}px)`;
  document.getElementById('heroPostcards').style.transform = `translateY(${window.scrollY * 0.09}px)`;
});

const heroBgImg     = document.getElementById('heroBgImg');
const postcardFront = document.getElementById('postcardFront');
const postcardBack  = document.getElementById('postcardBack');
const stampOrange   = document.getElementById('stampOrange');
const stampRed      = document.getElementById('stampRed');
const stampBlue     = document.getElementById('stampBlue');
const stampGreen    = document.getElementById('stampGreen');

gsap.set(postcardBack,  { x: 0, y: 0, rotation: 0, opacity: 0, scale: 0.92 });
gsap.set(postcardFront, { x: 0, y: 500, rotation: 0, opacity: 0, scale: 0.92 });
gsap.set(stampOrange, { opacity: 0, scale: 0, rotation: -15 });
gsap.set(stampRed,    { opacity: 0, scale: 0, rotation: 10 });
gsap.set(stampBlue,   { opacity: 0, scale: 0, rotation: -8 });
gsap.set(stampGreen,  { opacity: 0, scale: 0, rotation: 12 });

window.addEventListener('load', () => {
  heroBgImg.style.transform = `translateY(-80px)`;
  setTimeout(() => {
    heroBgImg.style.transition = 'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)';
    heroBgImg.style.transform = `translateY(0px)`;
    setTimeout(() => { heroBgImg.style.transition = ''; }, 1300);
  }, 100);

  const tl = gsap.timeline({ delay: 1.2 });

  tl.to(postcardFront, {
    opacity: 1, scale: 1, y: 0,
    duration: 0.7, ease: 'power3.out'
  })
  .to(postcardFront, {
    x: '-45%', y: '-10%', rotation: -6,
    duration: 0.5, ease: 'back.out(1.7)'
  }, '-=0.15')
  .to(postcardBack, {
    opacity: 1, scale: 1,
    x: '45%', y: '-32%', rotation: 4,
    duration: 0.5, ease: 'back.out(1.7)'
  }, '<')
  .to(stampOrange, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(3)' }, '<')
  .to(stampRed,    { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(3)', delay: 0.05 }, '<')
  .to(stampBlue,   { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(3)', delay: 0.1 }, '<')
  .to(stampGreen,  { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(3)', delay: 0.15 }, '<');

  // Momentum hover on stamps
  [stampOrange, stampRed, stampBlue, stampGreen].forEach(stamp => {
    let mx = 0, my = 0;
    let vx = 0, vy = 0;
    let cx = 0, cy = 0;

let lastX = 0, lastY = 0;
    document.addEventListener('mousemove', (e) => {
      const rect = stamp.getBoundingClientRect();
      const stampCenterX = rect.left + rect.width / 2;
      const stampCenterY = rect.top + rect.height / 2;
      const dist = Math.sqrt(
        Math.pow(e.clientX - stampCenterX, 2) +
        Math.pow(e.clientY - stampCenterY, 2)
      );
      const maxDist = 300;
      if (dist < maxDist) {
        const influence = (1 - dist / maxDist) * 0.3;
        mx = (e.clientX - lastX) * influence;
        my = (e.clientY - lastY) * influence;
      } else {
        mx = 0;
        my = 0;
      }
      lastX = e.clientX;
      lastY = e.clientY;
    });

    function update() {
      vx += (mx - vx) * 0.08;
      vy += (my - vy) * 0.08;
      cx += vx;
      cy += vy;
      cx *= 0.9;
      cy *= 0.9;
      vx *= 0.9;
      vy *= 0.9;
      gsap.set(stamp, { x: cx, y: cy });
      requestAnimationFrame(update);
    }

    update();
  });
});
                           

  

// ===============================
// PILL NAV — EXPAND / COLLAPSE + SPIN
// ===============================

const navWrap = document.getElementById('navWrap');
const navPill = document.getElementById('navPill');
const navAsterisk = document.getElementById('navAsterisk');
const navAsteriskImg = navAsterisk.querySelector('img');

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

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { ScrollTrigger.refresh(); }, 250);
});

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  lenis.scrollTo(0, { immediate: true });
  ScrollTrigger.refresh();

  // Entry overlay fade
  const entryOverlay = document.getElementById('page-entry-overlay');
  if (entryOverlay) {
    gsap.to(entryOverlay, {
      opacity: 0, duration: 0.8, delay: 0.1, ease: "power2.inOut",
      onComplete: () => entryOverlay.remove()
    });
  }
});

// ===============================
// SCROLL PROGRESS BAR
// ===============================

const scrollProgress = document.getElementById('scroll-progress');

lenis.on('scroll', ({ scroll }) => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = pct + '%';
  scrollProgress.style.height = pct > 99 ? '0px' : '5px';
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
navWordmarkEl.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '/fishtank/#skip';
});

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
  gsap.fromTo(dotSm, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.5)', delay: 0 });
  gsap.fromTo(dotMd, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.38, ease: 'back.out(2.5)', delay: 0.09 });
  gsap.fromTo(dotLg, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.40, ease: 'back.out(2.5)', delay: 0.18 });
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
  const mainSections = ['overview', 'research', 'design', 'launch', 'reflection'];
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
    const validSections = ['overview', 'research', 'design', 'launch', 'reflection'];
    if (!validSections.includes(targetId)) return;
    const target = document.querySelector(`section#${targetId}.content-section`);
    if (!target) return;
    const offsets = { overview: -50, research: 15, design: 10, launch: -150, reflection: -150 };
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
// IMAGE MODAL FOR PROTO-PERSONAS
// ===================================

const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const closeModal = document.querySelector('.modal-close');

document.querySelectorAll('.persona-image').forEach(img => {
  img.addEventListener('click', function() {
    modal.classList.add('active');
    modalImg.src = this.src;
    document.body.style.overflow = 'hidden';
  });
});

closeModal.addEventListener('click', () => {
  modal.classList.remove('active');
  document.body.style.overflow = '';
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ===================================
// IMAGE LOADING
// ===================================

function handleImageLoad(img) {
  img.classList.add('loaded');
  const container = img.closest('.dilemma-image, .unsent-project-image, .sidechat-image, .persona-card, .market-audit-image, .large-image-section, .ideation-image-section, .prototype-image, .hero-section');
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
document.querySelectorAll(
  '.overview-block, .stamp-card, .results-circle, .conclusion-circle, .market-audit-image, .unsent-project-image, .sidechat-image, .unsent-analysis, .sidechat-analysis, .dilemma-row, .large-image-section, .market-audit-text, .dilemma-text, .personas-intro, .ideation-section, .ideation-image-section, .ideation-quote, .user-flow-section, .lofi-section, .midfi-section, .wireframe-grid img, .mascot-exploration-section, .feedback-section, .feedback-grid, .prototype-block, .persona-card'
).forEach(el => {
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

  // Fade nav pill
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

  // Tint pill nav for footer (yellow tones to match pent up footer)
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

});