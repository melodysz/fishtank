/* ============================================================
   ENTRY OVERLAY
   ============================================================ */
window.addEventListener('load', () => {
  const overlay = document.getElementById('page-entry-overlay');
  if (overlay) overlay.remove();
});

/* ============================================================
   NAVIGATE WITH EXIT RIPPLE
   ============================================================ */
function navigateTo(url, newTab = false) {
  if (newTab) { window.open(url, '_blank'); return; }

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  const container = document.getElementById('exit-ripple-container');
  container.innerHTML = '';
  container.style.pointerEvents = 'all';

  for (let i = 0; i < 2; i++) {
    setTimeout(() => {
      const r1 = document.createElement('div');
      r1.className = 'ripple ripple-brown';
      container.appendChild(r1);
      setTimeout(() => {
        const r2 = document.createElement('div');
        r2.className = 'ripple ripple-cream';
        container.appendChild(r2);
      }, 60);
    }, i * 180);
  }

  setTimeout(() => { window.location.href = url; }, 1400);
}

/* ============================================================
   PILL NAV — EXPAND / COLLAPSE + SPIN
   ============================================================ */

const navWrap      = document.getElementById('navWrap');
const navPill      = document.getElementById('navPill');
const navAsterisk  = document.getElementById('navAsterisk');
const navAsteriskImg = navAsterisk.querySelector('img');

gsap.set(navAsteriskImg, { rotation: 0 });
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

navWrap.addEventListener('mouseenter', onNavEnter);
navWrap.addEventListener('mouseleave', onNavLeave);

navAsterisk.addEventListener('mouseenter', () => {
  if (!navPill.classList.contains('expanded')) return;
  gsap.killTweensOf(navAsteriskImg);
  gsap.to(navAsteriskImg, { rotation: '-=720', duration: 1.8, ease: "power2.out" });
});

/* ============================================================
   WORK DROPDOWN THOUGHT BUBBLE
   ============================================================ */

const workWrap  = document.getElementById('navWorkWrap');
const workBubble = document.getElementById('workBubble');
const dotsWrap  = document.getElementById('bubbleDotsWrap');
const dotSm     = dotsWrap.querySelector('.bubble-dot-sm');
const dotMd     = dotsWrap.querySelector('.bubble-dot-md');
const dotLg     = dotsWrap.querySelector('.bubble-dot-lg');
const bubbleMenu = workBubble.querySelector('.bubble-menu');

let bubbleLeaveTimer = null;
let bubbleOpen = false;

function positionBubble() {
  const rect = workWrap.getBoundingClientRect();
  const menuWidth = bubbleMenu.offsetWidth;
  workBubble.style.left = (rect.left + rect.width / 2 - menuWidth / 2) + 'px';
  workBubble.style.top  = (rect.bottom + 16) + 'px';
  dotsWrap.style.left   = workBubble.style.left;
  dotsWrap.style.top    = workBubble.style.top;
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

/* ============================================================
   CURSOR — BLOB STYLE
   ============================================================ */

const cursorEl = document.getElementById('cursor');

let mouseX = 0, mouseY = 0;
let curX = 0, curY = 0;
let isBlobMode = false;
const LERP_NORMAL = 0.12;
const LERP_BLOB   = 0.10;
const BLOB_HEIGHT = 40;

function animateCursor() {
  const lerp = isBlobMode ? LERP_BLOB : LERP_NORMAL;
  curX += (mouseX - curX) * lerp;
  curY += (mouseY - curY) * lerp;
  cursorEl.style.left = curX + 'px';
  cursorEl.style.top  = curY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

window.addEventListener('mouseenter', () => cursorEl.classList.add('active'));
window.addEventListener('mouseleave', () => cursorEl.classList.remove('active'));
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorEl.classList.add('active');
});

function expandToBlob(el) {
  const rect = el.getBoundingClientRect();
  isBlobMode = true;
  cursorEl.style.setProperty('--blob-w', rect.width + 'px');
  cursorEl.style.setProperty('--blob-h', BLOB_HEIGHT + 'px');
  cursorEl.classList.add('is-blob');
  mouseX = rect.left + rect.width / 2;
  mouseY = rect.top + BLOB_HEIGHT / 2;
}

function shrinkBlob() {
  isBlobMode = false;
  cursorEl.classList.remove('is-blob');
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    isBlobMode = false;
    cursorEl.classList.remove('is-blob');
    gsap.set(cursorEl, { clearProps: 'width,height' });
    clearTimeout(leaveTimer);
    gsap.killTweensOf(navAsteriskImg);
  }
});

// Blob on general interactables
const clickableEls = document.querySelectorAll('a[href], .who-link');
clickableEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (isBlobMode) return;
    cursorEl.classList.add('is-blob');
    gsap.to(cursorEl, { width: '48px', height: '48px', duration: 0.3, ease: "power2.out" });
  });
  el.addEventListener('mouseleave', () => {
    if (isBlobMode) return;
    cursorEl.classList.remove('is-blob');
    gsap.to(cursorEl, { width: '18px', height: '18px', duration: 0.3, ease: "power2.out" });
  });
});

const navWordmarkEl = document.querySelector('.nav-wordmark');
navWordmarkEl.addEventListener('mouseenter', () => expandToBlob(navWordmarkEl));
navWordmarkEl.addEventListener('mouseleave', () => shrinkBlob());
navWordmarkEl.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '/fishtank/#skip';
});

// Nav link items — flip text + blob
document.querySelectorAll('.nav-link-item').forEach(link => {
  const defaultText = link.getAttribute('data-default');
  const hoverText   = link.getAttribute('data-hover');

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

// Bubble items blob
document.querySelectorAll('.bubble-item').forEach(item => {
  item.addEventListener('mouseenter', () => expandToBlob(item));
  item.addEventListener('mouseleave', () => shrinkBlob());
});

/* ============================================================
   BUBBLE ITEM NAVIGATION (thought bubble links)
   ============================================================ */
document.querySelectorAll('.bubble-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(item.getAttribute('href'));
  });
});

/* ============================================================
   NAV WORDMARK — navigate home
   ============================================================ */
navWordmarkEl.addEventListener('click', (e) => {
  e.preventDefault();
  navigateTo('https://melodysz.github.io/fishtank/');
});

/* ============================================================
   WORK LINK — navigate to work section
   ============================================================ */
document.querySelector('.nav-link-item[data-default="work"]')?.addEventListener('click', (e) => {
  e.preventDefault();
  navigateTo('https://melodysz.github.io/fishtank/#third-section');
});

/* ============================================================
   WHO LINK — no-op (already here)
   ============================================================ */
document.querySelector('.nav-link-item[data-default="who"]')?.addEventListener('click', (e) => {
  e.preventDefault();
});