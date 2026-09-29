/* ============================================================
   ENTRY OVERLAY — handled by ../js/page-wipe.js (navy splash)
   ============================================================ */

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
  if (w !== blobW) { blobW = w; cursorEl.style.setProperty('--blob-w', w + 'px'); }
  const h = Math.round(b.height + BLOB_PAD_Y * 2);
  if (h !== blobH) { blobH = h; cursorEl.style.setProperty('--blob-h', h + 'px'); }
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
    cursorEl.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%) scale(${cursorScale})`;
  }
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
  gsap.set(cursorEl, { clearProps: 'width,height' });   // size comes from --blob-w/--blob-h only
  blobTarget = el;                 // lock onto this link (see followBlobTarget)
  cursorEl.classList.toggle('on-dark', onDarkBackground(el));
  blobW = 0; blobH = 0;
  followBlobTarget();
  cursorEl.classList.add('is-blob');
}

function shrinkBlob() {
  blobTarget = null;
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

// email / LinkedIn text links: the bubble locks onto the text, like the nav
document.querySelectorAll('.contact-alt-link').forEach((a) => {
  a.addEventListener('mouseenter', () => expandToBlob(a));
  a.addEventListener('mouseleave', () => { if (blobTarget === a) shrinkBlob(); });
});

// Blob on general interactables
const clickableEls = document.querySelectorAll('a[href], button, .receipt-check');
clickableEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (isBlobMode) return;
    cursorEl.classList.add('is-blob');
    cursorEl.style.setProperty('--blob-w', '48px'); cursorEl.style.setProperty('--blob-h', '48px');
  });
  el.addEventListener('mouseleave', () => {
    if (isBlobMode) return;
    cursorEl.classList.remove('is-blob');
    cursorEl.style.removeProperty('--blob-w'); cursorEl.style.removeProperty('--blob-h');
  });
});

const navWordmarkEl = document.querySelector('.nav-wordmark');
navWordmarkEl.addEventListener('mouseenter', () => expandToBlob(navWordmarkEl));
navWordmarkEl.addEventListener('mouseleave', () => shrinkBlob());
navWordmarkEl.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '../';
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
  navigateTo('../');
});

/* ============================================================
   WORK LINK — navigate to work section
   ============================================================ */
document.querySelector('.nav-link-item[data-default="work"]')?.addEventListener('click', (e) => {
  e.preventDefault();
  navigateTo('../#third-section');
});

/* ============================================================
   WHO LINK — go to the who page
   ============================================================ */
document.querySelector('.nav-link-item[data-default="who"]')?.addEventListener('click', (e) => {
  e.preventDefault();
  navigateTo('../#who');
});