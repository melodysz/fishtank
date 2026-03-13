/* ============================================================
   ENTRY OVERLAY — radial wipe reveal
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
   CURSOR + BUBBLE TRAIL
   ============================================================ */
const cursorEl = document.getElementById('cursor');
let lastX = 0, lastY = 0, isHovering = false;
 
window.addEventListener('mouseenter', () => cursorEl.classList.add('active'));
window.addEventListener('mouseleave', () => cursorEl.classList.remove('active'));
 
window.addEventListener('mousemove', (e) => {
  cursorEl.classList.add('active');
  gsap.to(cursorEl, { left: e.clientX + 'px', top: e.clientY + 'px', duration: 0.1 });
  if (Math.hypot(e.clientX - lastX, e.clientY - lastY) > 25) {
    createBubble(e.clientX, e.clientY);
    lastX = e.clientX; lastY = e.clientY;
  }
});
 
function createBubble(x, y) {
  const b = document.createElement('div');
  b.className = 'bubble-particle';
  document.body.appendChild(b);
  const sz = (Math.random() * 4 + 4) + 'px';
  b.style.width = sz; b.style.height = sz;
  b.style.left = x + 'px'; b.style.top = y + 'px';
  gsap.to(b, {
    top:  (y - (40 + Math.random() * 60)) + 'px',
    left: (x + (Math.random() * 30 - 15)) + 'px',
    opacity: 0, width: '2px', height: '2px',
    duration: 1.2 + Math.random() * 0.8,
    ease: 'power1.out',
    onComplete: () => b.remove()
  });
}
 
window.addEventListener('pointermove', (e) => {
  const els = document.elementsFromPoint(e.clientX, e.clientY);
  const hovered = els.find(el => {
    if (el.id === 'cursor' || el.classList.contains('bubble-particle') || el.closest('.nav-center-star')) return false;
    return el.matches?.('.interactable, a[href], button, [role="button"]') ||
           el.closest?.('.interactable, a[href], button, [role="button"]');
  });
  const next = !!hovered;
  if (next !== isHovering) {
    isHovering = next;
    gsap.to(cursorEl, { width: next ? '40px' : '12px', height: next ? '40px' : '12px', duration: 0.3, ease: 'power2.out' });
  }
});
 
/* ============================================================
   NAV NAME HOVER (Chinese ↔ MELODY)
   ============================================================ */
const navName   = document.getElementById('nav-name');
const nameInner = navName.querySelector('.name-inner');
 
navName.addEventListener('mouseenter', () => {
  gsap.to(nameInner, { y: -10, opacity: 0, duration: 0.2, onComplete: () => {
    nameInner.textContent = 'MELODY';
    Object.assign(nameInner.style, {
      fontFamily: "'Helvetica Neue', sans-serif",
      fontSize: '0.85rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    });
    gsap.fromTo(nameInner, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
  }});
});
navName.addEventListener('mouseleave', () => {
  gsap.to(nameInner, { y: 10, opacity: 0, duration: 0.2, onComplete: () => {
    nameInner.textContent = '美迪';
    Object.assign(nameInner.style, {
      fontFamily: "'Zen Old Mincho', serif",
      fontSize: '1.2rem',
      letterSpacing: '0.05em',
      textTransform: 'none'
    });
    gsap.fromTo(nameInner, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
  }});
});
 
navName.addEventListener('click', (e) => {
  e.preventDefault();
  navigateTo('https://melodysz.github.io/fishtank/');
});
 
/* ============================================================
   NAV STAR HOVER SPIN
   ============================================================ */
const starContainer = document.querySelector('.nav-center-star');
const starIcon      = document.getElementById('nav-star-icon');
 
gsap.to(starIcon, { rotation: 360, duration: 25, ease: 'none', repeat: -1 });
 
if (starContainer && starIcon) {
  starContainer.addEventListener('mouseenter', () => {
    gsap.killTweensOf(starIcon);
    const cur = gsap.getProperty(starIcon, 'rotation') || 0;
    gsap.to(starIcon, { rotation: cur + 720, duration: 2.5, ease: 'power2.out', overwrite: 'auto' });
  });
}
 
/* ============================================================
   NAV SWAP LINKS (text flip on hover)
   ============================================================ */
document.querySelectorAll('.nav-swap').forEach(link => {
  const original = link.textContent.trim();
  link.innerHTML = `<span class="nav-inner">${original}</span>`;
  const inner       = link.querySelector('.nav-inner');
  const defaultText = link.getAttribute('data-default') || original;
  const hoverText   = link.getAttribute('data-hover')   || original;
  inner.style.display = 'inline-block';
  inner.style.willChange = 'transform, opacity';
 
  /* Lock width to widest option so layout doesn't shift */
  function lockWidth() {
    inner.textContent = defaultText;
    const w1 = inner.getBoundingClientRect().width;
    inner.textContent = hoverText;
    const w2 = inner.getBoundingClientRect().width;
    link.style.width = `${Math.ceil(Math.max(w1, w2)) + 2}px`;
    inner.textContent = defaultText;
  }
  lockWidth();
  window.addEventListener('resize', lockWidth);
 
  link.addEventListener('mouseenter', () => {
    gsap.to(inner, { y: -10, opacity: 0, duration: 0.2, onComplete: () => {
      inner.textContent = hoverText;
      gsap.fromTo(inner, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
    }});
  });
  link.addEventListener('mouseleave', () => {
    gsap.to(inner, { y: 10, opacity: 0, duration: 0.2, onComplete: () => {
      inner.textContent = defaultText;
      gsap.fromTo(inner, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
    }});
  });
});
 
/* [WORK] → home page third section */
document.querySelector('.nav-swap[data-default="[WORK]"]')?.addEventListener('click', (e) => {
  e.preventDefault();
navigateTo('https://melodysz.github.io/fishtank/#third-section');
});
 
/* [WHO?] → stays on this page (no-op) */
document.querySelector('.nav-swap[data-default="[WHO?]"]')?.addEventListener('click', (e) => {
  e.preventDefault();
});

const whoHighlights = document.querySelectorAll('.who-text-col .highlight');

function checkWhoHighlights() {
  whoHighlights.forEach(highlight => {
    const rect = highlight.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      highlight.classList.add('animate-in');
    }
  });
}

window.addEventListener('scroll', checkWhoHighlights);
checkWhoHighlights();