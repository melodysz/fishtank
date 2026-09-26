// The ripple intro plays only the first time someone enters the site (per
// browser tab). Coming back to the homepage later — from a project page, the
// who page, or a reload — skips straight to the hero. A #section link
// (e.g. #third-section) also skips it.
let introAlreadySeen = false;
try {
  introAlreadySeen = sessionStorage.getItem('fishtankIntroSeen') === '1';
  sessionStorage.setItem('fishtankIntroSeen', '1');
} catch (e) {}
// old links may still end in #skip — tidy it out of the address bar
if (window.location.hash === '#skip') history.replaceState(null, '', window.location.pathname + window.location.search);
const arrivedUnderWipe = document.documentElement.classList.contains('arrive-wipe'); // came from a project page
const skipIntro = introAlreadySeen || arrivedUnderWipe || !!window.location.hash;

if (skipIntro) {
  document.querySelector('.intro-screen')?.remove();
  document.getElementById('page-entry-overlay')?.remove();
}

// DEV ONLY — shows on the local preview, never on the live site: a small
// "replay intro" button (bottom-left) that forgets the intro was seen and reloads.
if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
  const devBtn = document.createElement('button');
  devBtn.className = 'dev-replay-intro';
  devBtn.textContent = '↻ replay intro';
  devBtn.addEventListener('click', () => {
    try { sessionStorage.removeItem('fishtankIntroSeen'); sessionStorage.removeItem('fishtankWipe'); } catch (e) {}
    window.location.href = window.location.pathname; // (drops any #section, which would skip the intro)
  });
  document.body.appendChild(devBtn);
}

// Add this as the VERY first thing in your JS, before everything else
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Force scroll reset before ANY paint
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

// Belt-and-suspenders: also do it on DOMContentLoaded and load
document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
});

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  // Give browser one frame to settle, then refresh ScrollTrigger
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  });
});

// On the homepage, kill the entry overlay instantly
const entryOverlay = document.getElementById('page-entry-overlay');
if (entryOverlay && document.querySelector('.intro-screen')) {
  entryOverlay.remove();
}

window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;
document.documentElement.classList.add('page-loading');

// Add loading class immediately
document.documentElement.classList.add('page-loading');

// Remove after everything loads
window.addEventListener('load', () => {
  setTimeout(() => {
    document.documentElement.classList.remove('page-loading');
  }, 100);
});

// Skipping the intro: set the hero up in its finished state right away
if (skipIntro) {
  document.documentElement.classList.add('skip-intro');
  document.body.classList.add('skip-intro');
  
  document.addEventListener('DOMContentLoaded', function() {
    const intro = document.querySelector('.intro-screen');
    if (intro) intro.style.display = 'none';
    
    setTimeout(() => {
      playHeroFishIn();
      playHeroIdentityIn();
      playHeroOrbitIn();
    }, 100);

    gsap.set(".scaling-rig", { scale: 1, autoAlpha: 1 });
    gsap.set([".hero-peek-layer", ".hero-halo"], { autoAlpha: 1, scale: 1 });
    gsap.set(".hero-orbit", { autoAlpha: 1, scale: 0.9 });
    gsap.set(".hero-identity-frame", { autoAlpha: 1 });
    gsap.set([".fish-clown-1", ".fish-clown-2", ".fish-tang"], { x: 0, autoAlpha: 1, scale: 1 });
    gsap.set(".hero-star", { autoAlpha: 1 });
  });
  
  const intro = document.querySelector('.intro-screen');
  if (intro) intro.style.display = 'none';
}

function syncScrollOnce() {
  lenis.raf(performance.now());
  ScrollTrigger.update();
}

window.addEventListener('beforeunload', function() {
  window.scrollTo(0, 0);
});

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

let lenis;

let projectCardsReady = true;

// ============================================
// NAVIGATE WITH EXIT RIPPLE — TOP LEVEL
// ============================================
function navigateTo(url, newTab = false) {
  if (newTab) { window.open(url, '_blank'); return; }

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  const container = document.getElementById('exit-ripple-container');
  container.innerHTML = '';
  container.style.pointerEvents = 'all';

  for (let i = 0; i < 2; i++) {
    setTimeout(() => {
      const blue = document.createElement('div');
      blue.className = 'ripple ripple-blue';
      container.appendChild(blue);
      setTimeout(() => {
        const black = document.createElement('div');
        black.className = 'ripple ripple-black';
        container.appendChild(black);
      }, 60);
    }, i * 180);
  }

  // Wait for ripple to FULLY cover before navigating
  // Your ripple animation is 1.3s, so 1.4s gives it breathing room
  setTimeout(() => { window.location.href = url; }, 1400);
}

// CSS "ease-out" = cubic-bezier(0, 0, 0.58, 1); returns eased progress for 0..1
function cssEaseOut(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // solve bezier x(t) = x for t, then return y(t)
  let t = x;
  for (let i = 0; i < 8; i++) {
    const xt = 3 * (1 - t) * t * t * 0.58 + t * t * t;
    const dx = 6 * (1 - t) * t * 0.58 - 3 * t * t * 0.58 + 3 * t * t;
    if (Math.abs(xt - x) < 1e-5 || dx === 0) break;
    t -= (xt - x) / dx;
  }
  return 3 * (1 - t) * t * t + t * t * t;
}

// ============================================
// HERO WINDOW (black surround with the porthole cut out)
// Drawn once onto a canvas instead of using a CSS mask. The hero zoom scales it
// up to 10x; a canvas is a finished picture the browser simply stretches, so its
// graphics memory stays constant at any zoom. (A masked layer could get
// re-prepared at 10x size, which made the hero glitch and turn patchy.)
// ============================================
const heroWindowCanvas = document.querySelector('.scaling-rig-canvas');
const heroWindowMask = new Image();
const heroWindowReady = new Promise((resolve) => {
  heroWindowMask.onload = () => { drawHeroWindow(); resolve(); };
  heroWindowMask.onerror = resolve;
});
heroWindowMask.crossOrigin = 'anonymous';   // (lets the intro read the porthole's shape to find its centre)
heroWindowMask.src = 'https://melodysz.github.io/baubles/mask.webp';

// How open the porthole is: 1 = normal, near 0 = a pinhole (the intro grows it open)
var heroWindowOpen = 1;
let heroHole = null;   // { canvas, cx, cy }: just the porthole shape (solid), for drawing it scaled

function drawHeroWindow() {
  if (!heroWindowCanvas || !heroWindowMask.naturalWidth) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(window.innerWidth * dpr), h = Math.round(window.innerHeight * dpr);
  if (heroWindowCanvas.width !== w || heroWindowCanvas.height !== h) {
    heroWindowCanvas.width = w;
    heroWindowCanvas.height = h;
    heroHole = null;
  }
  const ctx = heroWindowCanvas.getContext('2d');
  // mask image placement — same as CSS mask-size: cover, centered
  const sc = Math.max(w / heroWindowMask.naturalWidth, h / heroWindowMask.naturalHeight);
  const mw = heroWindowMask.naturalWidth * sc, mh = heroWindowMask.naturalHeight * sc;
  const mx = (w - mw) / 2, my = (h - mh) / 2;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);
  if (heroWindowOpen >= 1) {
    // normal: keep the black only where the mask image is solid
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(heroWindowMask, mx, my, mw, mh);
  } else {
    // opening: cut out the porthole shape, scaled down around its own centre
    if (!heroHole) heroHole = buildHeroHole(w, h, mx, my, mw, mh);
    const k = Math.max(0.001, heroWindowOpen);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.setTransform(k, 0, 0, k, heroHole.cx * (1 - k), heroHole.cy * (1 - k));
    ctx.drawImage(heroHole.canvas, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  // Solid black from just under the porthole to the bottom of the screen. (The
  // window image's bottom edge fades out unevenly in the middle, which showed as a
  // ragged cut-off — especially once the hero zooms in.) The porthole's lowest
  // point is at 72.5% of the image's height.
  ctx.globalCompositeOperation = 'source-over';
  const bandTop = my + mh * 0.74;
  ctx.fillRect(0, bandTop, w, h - bandTop);
}

// The porthole on its own (solid where the window is see-through), plus its centre.
function buildHeroHole(w, h, mx, my, mw, mh) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const hc = c.getContext('2d');
  hc.fillStyle = '#000000';
  hc.fillRect(0, 0, w, h);
  hc.globalCompositeOperation = 'destination-out';
  hc.drawImage(heroWindowMask, mx, my, mw, mh);
  // keep only the porthole itself (36–64% across, 27–72% down the image): the image
  // also has a faded bottom edge and a few stray see-through pixels round its
  // border, which showed as a bluish sliver while the porthole was small
  const bx0 = mx + mw * 0.355, bx1 = mx + mw * 0.645, by0 = my + mh * 0.27, by1 = my + mh * 0.728;
  hc.clearRect(0, 0, w, by0);
  hc.clearRect(0, by1, w, h - by1);
  hc.clearRect(0, 0, bx0, h);
  hc.clearRect(bx1, 0, w - bx1, h);
  // find the porthole's centre on a small copy (cheap)
  const sw = 160, sh = Math.max(1, Math.round(160 * h / w));
  const small = document.createElement('canvas');
  small.width = sw; small.height = sh;
  const sctx = small.getContext('2d');
  sctx.drawImage(c, 0, 0, sw, sh);
  let px;
  try { px = sctx.getImageData(0, 0, sw, sh).data; } catch (e) { return { canvas: c, cx: w / 2, cy: h / 2 }; }
  let x0 = sw, x1 = 0, y0 = sh, y1 = 0;
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
    if (px[(y * sw + x) * 4 + 3] > 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const found = x1 >= x0;
  return { canvas: c, cx: found ? ((x0 + x1 + 1) / 2) * (w / sw) : w / 2, cy: found ? ((y0 + y1 + 1) / 2) * (h / sh) : h / 2 };
}

// Intro: the porthole grows from a pinhole to its normal size, easing to a stop.
function openHeroWindow() {
  const state = { k: 0.02 };
  heroWindowOpen = state.k;
  drawHeroWindow();
  gsap.to(state, {
    k: 1, duration: 2.0, ease: 'power3.out',   // fast at first, easing to a gentle stop
    onUpdate: () => { heroWindowOpen = state.k; drawHeroWindow(); },
    onComplete: () => { heroWindowOpen = 1; heroHole = null; drawHeroWindow(); },   // back to the exact drawing
  });
}
window.addEventListener('resize', drawHeroWindow);

// Section 2 dangles: their resting offset (where the old intro animation left them)
// and how much of the frame's movement they follow (1 = locked to the frame).
var DANGLES_REST_Y = -40;
var DANGLES_PARALLAX = 0.45;

// Finds every image the homepage uses (<img> tags, CSS backgrounds and masks)
// and asks the browser to fully download and decode them up front.
window._predecodedImages = []; // held so the browser keeps them decoded
function predecodePageImages() {
  const urls = new Set();
  const jobs = [];
  document.querySelectorAll('img').forEach((img) => {
    if (img.src) { urls.add(img.src); jobs.push(img.decode().catch(() => {})); }
  });
  document.querySelectorAll('body *').forEach((el) => {
    const cs = getComputedStyle(el);
    const before = getComputedStyle(el, '::before');
    [cs.backgroundImage, cs.webkitMaskImage, cs.maskImage, before.backgroundImage].forEach((v) => {
      if (!v || v === 'none') return;
      for (const m of v.matchAll(/url\("([^"]+)"\)/g)) {
        if (urls.has(m[1])) continue;
        urls.add(m[1]);
        const img = new Image();
        if (/mask/i.test(m[1])) img.crossOrigin = 'anonymous'; // masks load in CORS mode
        img.src = m[1];
        window._predecodedImages.push(img);
        jobs.push(img.decode().catch(() => {}));
      }
    });
  });
  jobs.push(heroWindowReady); // the hero window picture
  return Promise.all(jobs);
}

function playHeroFishIn() {
  const fish = [".fish-clown-1", ".fish-clown-2", ".fish-tang"];
  gsap.killTweensOf(fish);
  gsap.set(".fish-clown-1", { x: -100, autoAlpha: 0, scale: 1 });
  gsap.set(".fish-clown-2", { x: -130, autoAlpha: 0, scale: 1 });
  gsap.set(".fish-tang", { x: -45, autoAlpha: 0, scale: 1 });
  gsap.to(".fish-clown-1", { x: 0, autoAlpha: 1, duration: 1.0, ease: "power2.out" });
  gsap.to(".fish-clown-2", { x: 0, autoAlpha: 1, duration: 1.0, ease: "power2.out", delay: 0.10 });
  gsap.to(".fish-tang", { x: 0, autoAlpha: 1, duration: 1.0, ease: "power2.out", delay: 0.20 });
}

// document.querySelectorAll('.fish-clown-1, .fish-clown-2, .fish-tang').forEach(fish => {
//   fish.style.pointerEvents = 'auto';
  
//   const baseScale = 1;

//   fish.addEventListener('mouseenter', () => {
//     gsap.to(fish, {
//       scale: baseScale * 1.15,
//       duration: 0.5,
//       ease: "back.out(3)",
//       overwrite: false
//     });
//   });

//   fish.addEventListener('mouseleave', () => {
//     gsap.to(fish, {
//       scale: baseScale,
//       duration: 0.4,
//       ease: "back.out(2)",
//       overwrite: false
//     });
//   });
// });


gsap.set('.sec2-bubble, .sec2-flower', { opacity: 0, y: 20 });
gsap.set('#scrollHint', { opacity: 0, y: -18 });
// Section 3's background bubbles + pink flowers: how see-through they are once shown (1 = solid)
var THIRD_DECOR_OPACITY = 0.7;
gsap.set('.bubble-decor, .flower-decor', { opacity: 0, y: 20 });
// yPercent: start higher by 20% of their own height, so the tips of the shorter
// strands stay hidden behind the frame until section 3 covers them
gsap.set('.dangles-decor', { y: DANGLES_REST_Y, yPercent: -20, opacity: 1 }); // no intro: they move with the frame (parallax) instead

function playHeroIdentityIn() {
  const heroLines = [
    ".id-top-left .id-accent", ".id-top-left .id-big", ".id-top-left .id-small",
    ".id-bottom-right .id-small", ".id-bottom-right .id-big", ".id-bottom-right .id-tagline", ".id-scroll-arrow"
  ];
  gsap.killTweensOf([".hero-identity-frame", ...heroLines]);
  gsap.set(".hero-identity-frame", { autoAlpha: 1, overwrite: true });
  gsap.set(heroLines, { autoAlpha: 0, y: 15 });
  gsap.to(heroLines, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.12, overwrite: true });
}

window.addEventListener('load', function() {
  if (!window.location.hash) window.scrollTo(0, 0);  // ← FIXED
  const hasHash = window.location.hash;

  // ============================================
  // SUB-PAGE ENTRY RIPPLE
  // Fades out a blue overlay when arriving on
  // any page that doesn't have .intro-screen
  // ============================================
const entryOverlay = document.getElementById('page-entry-overlay');
if (entryOverlay) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const maxR = Math.ceil(Math.sqrt(w * w + h * h));
  const featherPx = 18;
  const obj = { r: 0 };

  setTimeout(() => {
  introScreen.style.willChange = 'mask-image, -webkit-mask-image';
  introScreen.style.transform = 'translateZ(0)';
    gsap.to(obj, {
      r: maxR,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate: () => {
        entryOverlay.style.webkitMaskImage = `radial-gradient(circle at center, transparent ${obj.r}px, black ${obj.r + featherPx}px)`;
        entryOverlay.style.maskImage = `radial-gradient(circle at center, transparent ${obj.r}px, black ${obj.r + featherPx}px)`;
      },
      onComplete: () => {
        gsap.to(entryOverlay, {
          opacity: 0,
          duration: 0.3,
          ease: "power1.out",
          onComplete: () => entryOverlay.remove()
        });
      }
    });
  }, 120);
}

  if (skipIntro) {
    const introScreen = document.querySelector('.intro-screen');
    if (introScreen) introScreen.style.display = 'none';
    if (hasHash) {
      setTimeout(() => {
        if (hasHash === '#third-section') {
          const thirdSection = document.querySelector('#third-section');
          const sectionTop = thirdSection.offsetTop;
          window.scrollTo({ top: sectionTop, behavior: 'instant' });
        } else {
          const targetSection = document.querySelector(hasHash);
          if (targetSection) targetSection.scrollIntoView({ behavior: 'instant' });
        }
      }, 100);
    }
    return;
  }

  const preventScroll = (e) => e.preventDefault();

  function lockScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    if (typeof lenis !== "undefined") lenis.stop();
  }

  function unlockScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    window.removeEventListener('wheel', preventScroll);
    window.removeEventListener('touchmove', preventScroll);
    if (typeof lenis !== "undefined") lenis.start();
  }

  lockScroll();

  function startRippleTransition() {
    const introScreen = document.querySelector('.intro-screen');
    const introText = document.querySelector('.intro-text');

    // Get the heavy one-time graphics setup out of the way now, while the screen
    // is still black (the hero is hidden behind it): darken the hero onto its own
    // layer here instead of in the very frame the hole starts opening.
    const rigEarly = document.querySelector('.scaling-rig');
    if (rigEarly) {
      rigEarly.style.willChange = 'transform, opacity, filter';
      rigEarly.style.filter = 'brightness(0.25)';
    }
    
    gsap.to(introText, { opacity: 0, duration: 0.4, ease: "power2.out" });
    
    const rippleContainer = document.createElement('div');
    rippleContainer.className = 'ripple-container';
    introScreen.appendChild(rippleContainer);
    
    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        const blueRipple = document.createElement('div');
        blueRipple.className = 'ripple ripple-blue';
        rippleContainer.appendChild(blueRipple);
        setTimeout(() => {
          const blackRipple = document.createElement('div');
          blackRipple.className = 'ripple ripple-black';
          rippleContainer.appendChild(blackRipple);
        }, 60);
      }, i * 200);
    }
    
    setTimeout(() => {
      gsap.to(introText, { opacity: 0, duration: 0.3 });
      gsap.to(rippleContainer.children, { opacity: 0, duration: 0.4, ease: "power1.out" });
      
      setTimeout(() => {
        const finalRipple = document.createElement('div');
        finalRipple.className = 'ripple ripple-blue';
        rippleContainer.appendChild(finalRipple);
        const finalRippleStart = performance.now();
        
        setTimeout(() => {
          introScreen.style.opacity = '1';
          introScreen.style.zIndex = '5000';
          introScreen.style.willChange = 'opacity';

          const scalingRig = document.querySelector('.scaling-rig');
          const w = window.innerWidth;
          const h = window.innerHeight;
          const maxR = Math.ceil(Math.sqrt(w*w + h*h));
          const featherPx = 18;

          if (scalingRig) {
            scalingRig.style.willChange = "transform, opacity, filter";
scalingRig.style.filter = "brightness(0.25)";
          }
          
          const obj = { r: 0 };

          // The reveal is drawn on a canvas instead of a CSS mask. Redrawing a
          // full-screen CSS mask every frame was the main cause of the intro stutter;
          // a canvas redraw is cheap. It paints exactly what was on screen — black,
          // plus the final blue ripple still growing — then cuts the feathered hole.
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const revealCanvas = document.createElement('canvas');
          revealCanvas.className = 'reveal-canvas';
          revealCanvas.width = Math.round(w * dpr);
          revealCanvas.height = Math.round(h * dpr);
          introScreen.appendChild(revealCanvas);
          introScreen.classList.add('is-canvas-reveal');
          rippleContainer.style.display = 'none';
          const ctx = revealCanvas.getContext('2d');
          ctx.scale(dpr, dpr);
          const cx = w / 2, cy = h / 2;
          const rippleMaxR = 0.75 * Math.max(w, h); // .ripple is 150vmax wide

          function applyMask(rPx) {
            // blue ripple: same size + CSS "ease-out" timing as the .ripple animation
            const rippleP = Math.min(1, (performance.now() - finalRippleStart) / 1300);
            const rippleR = rippleMaxR * cssEaseOut(rippleP);

            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#061a8a';
            ctx.beginPath();
            ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
            ctx.fill();

            // cut the hole: fully clear up to rPx, fading back to solid over featherPx
            if (rPx > 0) {
              const outer = rPx + featherPx;
              const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, outer);
              g.addColorStop(rPx / outer, 'rgba(0,0,0,1)');
              g.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.globalCompositeOperation = 'destination-out';
              ctx.fillStyle = g;
              ctx.fillRect(cx - outer, cy - outer, outer * 2, outer * 2);
            }
          }

          applyMask(obj.r);
          openHeroWindow();   // the porthole grows open as the hero is revealed

          gsap.to(obj, {
            r: maxR,
            duration: 2.5,
            ease: "power1.out",
            onUpdate: () => {
              const r = obj.r;
              applyMask(r);
              const t = Math.min(1, r / maxR);
              
if (!window._heroContentStarted && t > 0.55) {
  window._heroContentStarted = true;

  setTimeout(() => {
    const navPill = document.getElementById('navPill');
    const navAsteriskSvg = document.querySelector('#navAsterisk svg');
    gsap.set('#navWrap', { opacity: 1 });
    gsap.set(navAsteriskSvg, { rotation: 0 });
    navPill.classList.add('expanded');
    gsap.to(navAsteriskSvg, {
      rotation: -378,
      duration: 1.2,
      ease: "back.out(1.4)"
    });
  }, 600);

  // delay hero elements so they don't pile on during peak mask expansion
  setTimeout(() => {
    playHeroFishIn();
    playHeroIdentityIn();
    playHeroOrbitIn();
  }, 200);
}
              
if (scalingRig && t < 0.70) {
  const bright = 0.25 + 0.75 * Math.pow(t / 0.70, 0.6);
  scalingRig.style.filter = `brightness(${bright})`;
}

              if (!window._scrollUnlockedEarly && t > 0.75) {
                window._scrollUnlockedEarly = true;
                unlockScroll();
                requestAnimationFrame(() => syncScrollOnce());
              }
            },
            onComplete: () => {
              if (scalingRig) gsap.set(scalingRig, { filter: "none" });
              gsap.to(introScreen, {
                opacity: 0,
                duration: 0.5,
                ease: "power1.out",
onComplete: () => {
  introScreen.style.display = "none";
  unlockScroll();
  gsap.fromTo('#scrollHint',
    { top: '0vh', opacity: 0 },
    { top: 'calc(100vh - 2.5rem)', opacity: 1, duration: 1.1, ease: "power3.out", delay: 0 }
  );
}
              });
            }
          });
        }, 100);
      }, 500);
    }, 800);
  }

  // While "feeding the fish..." shows, download + unpack every homepage image,
  // so nothing has to load or decode mid-animation (that's what caused the stutters).
  const imagesReady = predecodePageImages();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Animate dots one by one, then start ripple
  // Wait for Xanh Mono to load before showing intro text
  const introText = document.querySelector('.intro-text');
  introText.style.opacity = '0';

  document.fonts.load("italic 1.6rem 'Xanh Mono'").finally(() => {
    introText.style.opacity = '1';

    const dotsEl = document.getElementById('intro-dots');
    let dotCount = 0;
    let ready = false;
    // Images ready (or a 15s safety cap on very slow connections, so it never hangs)
    Promise.race([imagesReady, wait(15000)]).then(() => { ready = true; });

    // Dots fill in one by one. If images are still loading after "...",
    // the dots keep looping until they're ready, then the ripple starts.
    const dotInterval = setInterval(() => {
      dotCount = dotCount >= 3 ? 1 : dotCount + 1;
      dotsEl.textContent = '.'.repeat(dotCount);
      if (dotCount === 3 && ready) {
        clearInterval(dotInterval);
        setTimeout(startRippleTransition, 800);
      }
    }, 300);
  });
});

gsap.registerPlugin(ScrollTrigger);

gsap.set('.sky-text-images .sky-anim', { opacity: 0, y: 40, force3D: true });

gsap.set(".hero-peek-layer", { autoAlpha: 1, scale: 1, force3D: true });

const waterEl = document.querySelector(".water-lines");
let waterT0 = performance.now();


// (the section 2 water surface image is now stationary — no scroll drift or wobble)

gsap.set([".fish-clown-1", ".fish-clown-2", ".fish-tang"], { autoAlpha: 0, transformOrigin: "50% 50%" });
gsap.set('.hero-orbit', { autoAlpha: 0, scale: 0.92, rotation: 0 });
gsap.set('.hero-halo', { autoAlpha: 0 });

lenis = new Lenis({ 
  lerp: 0.15,
  duration: 1.0,
  smoothWheel: true,
  wheelMultiplier: 0.7,
  touchMultiplier: 1.5,
  prevent: (node) => node.classList.contains('btn-touch') || !!node.closest('#circularCarousel')
});

let pageReady = false;

setTimeout(() => {
  if (!window.location.hash) window.scrollTo(0, 0);
  pageReady = true;
  ScrollTrigger.refresh();
}, 800);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    gsap.ticker.sleep();
    lenis.stop();
  } else {
    gsap.ticker.wake();
    lenis.start();
    
    // Restart fish animations
    gsap.killTweensOf(fishData.map(d => d.wrapper));
    fishData.forEach((data, i) => {
      const duration = 14;
      const pairIndex = Math.floor(i / 2);
      const withinPair = i % 2;
      const delay = (pairIndex / 4) * duration + (withinPair * 0.4);
      const progress = delay / duration;
      const initialX = data.startX + (data.endX - data.startX) * progress;
      function swim() {
        gsap.fromTo(data.wrapper,
          { x: `${data.startX}vw` },
          { x: `${data.endX}vw`, duration: duration, ease: "none", onComplete: swim }
        );
      }
      gsap.set(data.wrapper, { x: `${initialX}vw` });
      gsap.to(data.wrapper, {
        x: `${data.endX}vw`,
        duration: duration * (1 - progress),
        ease: "none",
        onComplete: swim
      });
    });

    requestAnimationFrame(() => {
      restoreScalingRigMask();

      lenis.raf(performance.now());
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });

      const scrollY = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollRatio = scrollY / docHeight;

      if (scrollRatio < 0.05) {
        gsap.set('.scaling-rig', { scale: 1, autoAlpha: 1, filter: 'none' });
        gsap.set(['.hero-peek-layer', '.hero-halo'], { autoAlpha: 1, scale: 1 });
        gsap.set('.hero-orbit', { autoAlpha: 1, scale: 0.9 });
        gsap.set('.hero-identity-frame', { autoAlpha: 1 });
        gsap.set(['.fish-clown-1', '.fish-clown-2', '.fish-tang'], { x: 0, autoAlpha: 1, scale: 1 });
        gsap.set('.hero-star', { autoAlpha: 1 });
        restoreScalingRigMask();
      }

      const safe = (selector) => !!document.querySelector(selector);

      if (safe('.section-2-wrapper')) onPageScrollLayout();

      if (safe('#blackCover')) {
        if (scrollRatio < 0.55) gsap.set('#blackCover, .section-2-backdrop-black', { opacity: 0 });
        else if (scrollRatio > 0.80) gsap.set('#blackCover, .section-2-backdrop-black', { opacity: 1 });
        else gsap.set('#blackCover, .section-2-backdrop-black', { opacity: (scrollRatio - 0.55) / 0.25 });
      }

      if (safe('.footer-section')) {
        const footerTop = document.querySelector('.footer-section').offsetTop;
        if (scrollY + window.innerHeight > footerTop + 100) {
          if (safe('#footer-main-content')) gsap.set('#footer-main-content', { opacity: 1, y: 0 });
          if (safe('.footer-anim')) gsap.set('.footer-anim', { opacity: 1, y: 0 });
          if (safe('.footer-star-wrapper')) gsap.set('.footer-star-wrapper', { opacity: 1, scale: 1 });
        }
      }

      ScrollTrigger.refresh();
      ScrollTrigger.update();
      restoreScalingRigMask();
    });
  }
});

// ============================================
// CONSOLIDATED HERO EXIT - ONE ScrollTrigger
// ============================================
let lastHeroUpdate = 0;
const HERO_UPDATE_INTERVAL = 16;
let heroLineElements;
let heroVisible = true;

ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "top top",
  end: "30% top",
  scrub: 0.3,
  invalidateOnRefresh: true,
  onUpdate: (self) => {
    if (!pageReady) return;
    
    const now = performance.now();
    if (now - lastHeroUpdate < HERO_UPDATE_INTERVAL) return;
    lastHeroUpdate = now;
    
    const p = self.progress;
    
    if (p < 0.33) {
      const textP = p / 0.33;
      if (!heroLineElements) {
        heroLineElements = document.querySelectorAll(
          ".id-top-left .id-accent, .id-top-left .id-big, .id-top-left .id-small, " +
          ".id-bottom-right .id-small, .id-bottom-right .id-big, .id-bottom-right .id-tagline, .id-scroll-arrow"
        );
      }
      heroLineElements.forEach(line => {
        line.style.opacity = 1 - textP;
        line.style.transform = `translateY(${textP * 15}px)`;
      });
    }
    
gsap.set(".scaling-rig", {
  scale: Math.min(1 + (p * 9), 10),
  opacity: 1 - (p * 1.2)
});
    
    gsap.set([".hero-peek-layer", ".hero-halo", ".hero-orbit"], {
      opacity: Math.max(0, 1 - (p * 2))
    });
    
    gsap.set(".water-lines", { opacity: Math.max(0, 1 - (p * 3)) });
    gsap.set("#sky-text-container", { autoAlpha: p > 0.05 ? 1 : 0 });

    if (p < 0.10) {
      gsap.set(".sky-text-images", { autoAlpha: 0 });
    } else {
      gsap.set(".sky-text-images", { autoAlpha: gsap.utils.clamp(0, 1, (p - 0.10) / 0.15) });
    }
    
    if (p > 0.02) {
      gsap.set(".hero-identity-frame", {
        opacity: Math.max(0, 1 - (((p - 0.02) / 0.98) * 10))
      });
    }
    
    const fishX = window.innerWidth * 1.3 * p;
    gsap.set(".fish-clown-1", { x: fishX, opacity: Math.max(0, 1 - (p * 1.8)), scale: 1 + (p * 0.5) });
    gsap.set(".fish-clown-2", { x: fishX * 1.15, opacity: Math.max(0, 1 - (p * 1.8)), scale: 1 + (p * 0.5) });
    gsap.set(".fish-tang", { x: fishX * 0.9, opacity: Math.max(0, 1 - (p * 1.8)), scale: 1 + (p * 0.5) });
  }
});

// Background gradient transition
const skyContainer = document.querySelector('.sky-container');
// Copy of the sky inside section 2 (see .section-2-backdrop): drawn on a small
// canvas with the same radial gradient as .sky-container, redrawn when it changes.
const section2SkyCanvas = document.querySelector('.section-2-backdrop-sky');
const section2SkyCtx = section2SkyCanvas ? section2SkyCanvas.getContext('2d') : null;
const skyVars = { '--gradient-y': 50, '--pink-stop': 0, '--blue-mid-stop': 15, '--blue-dark-stop': 60 }; // CSS defaults (body)
let skyCopyQueued = false;

function drawSkyCopy() {
  skyCopyQueued = false;
  if (!section2SkyCtx) return;
  const w = Math.max(16, Math.round(window.innerWidth / 8));
  const h = Math.max(16, Math.round(window.innerHeight / 8));
  if (section2SkyCanvas.width !== w || section2SkyCanvas.height !== h) {
    section2SkyCanvas.width = w;
    section2SkyCanvas.height = h;
  }
  // same as CSS: radial-gradient(circle at 50% Y, pink A, blue B, dark C) — circle reaches the farthest corner
  const cx = w / 2, cy = h * skyVars['--gradient-y'] / 100;
  const r = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
  const clamp01 = (v) => Math.min(1, Math.max(0, v / 100));
  const g = section2SkyCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(clamp01(skyVars['--pink-stop']), '#E7A0FE');
  g.addColorStop(clamp01(skyVars['--blue-mid-stop']), '#006EE9');
  g.addColorStop(clamp01(skyVars['--blue-dark-stop']), '#000240');
  section2SkyCtx.fillStyle = g;
  section2SkyCtx.fillRect(0, 0, w, h);
}

function setSkyVar(name, value) {
  skyContainer.style.setProperty(name, value);
  skyVars[name] = parseFloat(value);
  if (!skyCopyQueued) { skyCopyQueued = true; requestAnimationFrame(drawSkyCopy); }
}
drawSkyCopy();
window.addEventListener('resize', drawSkyCopy);
ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "top top",
  end: "20% top",
  scrub: 0.5,
  onUpdate: (self) => {
    const p = self.progress;
    setSkyVar("--gradient-y", `${50 - (p * 50)}%`);
    setSkyVar("--pink-stop", `${0 + (p * 3)}%`);
    setSkyVar("--blue-mid-stop", `${15 + (p * 25)}%`);
    setSkyVar("--blue-dark-stop", `${60 + (p * 15)}%`);
  }
});

// Hero star
let starAnimated = false;
ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "1% top",
  onEnter: () => {
    if (!starAnimated) {
      starAnimated = true;
      gsap.to(".hero-star", { 
        rotation: "+=360", opacity: 0, duration: 1.5, 
        ease: "power2.out", force3D: true, overwrite: true 
      });
    }
  },
  onLeaveBack: () => {
    starAnimated = false;
    gsap.killTweensOf(".hero-star");
    gsap.set(".hero-star", { opacity: 0 });
    gsap.to(".hero-star", { 
      rotation: 0, opacity: 1, duration: 0.8, 
      ease: "power2.out", force3D: true, overwrite: true 
    });
  }
});

gsap.set([".sky-text-images", ".dangles-decor", ".sec2-bubble", ".sec2-flower", ".hero-star"], {
  force3D: true
});


gsap.ticker.lagSmoothing(0);
ScrollTrigger.refresh();


// Cursor
const cursorMain = document.getElementById('cursor');
let isBlobMode = false;
let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

// Cursor dot follows the mouse with a little lag. The further behind it is
// (i.e. the faster the mouse moves), the bigger it swells — up to ~1.7x —
// then it eases back to normal size as it catches up. Stays normal size while
// it's a hover blob over links. Moves with transform (cheap) instead of left/top.
let cursorScale = 1;
function animateCursor() {
  const dx = mouseX - curX, dy = mouseY - curY;
  const lag = Math.hypot(dx, dy);
  const targetScale = isBlobMode ? 1 : 1 + Math.min(lag / 160, 1) * 0.7;
  const scaleChanging = Math.abs(targetScale - cursorScale) > 0.002;
  if (lag > 0.05 || scaleChanging) {
    const lerp = 0.12;
    curX += dx * lerp;
    curY += dy * lerp;
    cursorScale += (targetScale - cursorScale) * 0.18;
    cursorMain.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%) scale(${cursorScale})`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

const BLOB_HEIGHT = 40;

function expandToBlob(el, pill = false) {
  const rect = el.getBoundingClientRect();
  isBlobMode = true;
  if (pill) {
    cursorMain.style.setProperty('--blob-w', rect.width + 'px');
    cursorMain.style.setProperty('--blob-h', '40px');
    cursorMain.classList.add('is-blob');
    cursorMain.classList.add('is-pill');
  } else {
    cursorMain.style.setProperty('--blob-w', '48px');
    cursorMain.style.setProperty('--blob-h', '48px');
    cursorMain.classList.add('is-blob');
    cursorMain.classList.remove('is-pill');
  }
}

function shrinkBlob() {
  isBlobMode = false;
  cursorMain.classList.remove('is-blob');
  cursorMain.classList.remove('is-pill');
  cursorMain.style.removeProperty('--blob-w');
  cursorMain.style.removeProperty('--blob-h');
}

// Fade the cursor dot out when the mouse leaves the browser window, back in when it returns
document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) cursorMain.classList.add('is-away'); });
document.addEventListener('mouseover', () => cursorMain.classList.remove('is-away'));
window.addEventListener('blur', () => cursorMain.classList.add('is-away')); // switched to another app

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorMain.classList.add('active');
});

// Grow the cursor over links/buttons. Uses the browser's own hover events —
// the old per-mousemove elementsFromPoint() check forced a full layout
// recalculation every frame while scroll animations were running.
const CURSOR_HOVER_SEL = "a[href], button, [role='button'], .btn-touch, .work-nav-pill";
document.addEventListener('pointerover', (e) => {
  const el = e.target.closest?.(CURSOR_HOVER_SEL);
  const hovered = el && !el.closest('.project-card') ? el : null;
  if (hovered && !isBlobMode) expandToBlob(hovered, false);
  else if (!hovered && isBlobMode && !e.target.closest?.('.project-card')) shrinkBlob();
});

document.querySelectorAll('.nav-link-item').forEach(link => {
  link.addEventListener('mouseenter', () => expandToBlob(link, true));
  link.addEventListener('mouseleave', () => shrinkBlob());
});

const navWordmarkEl = document.querySelector('.nav-wordmark');
navWordmarkEl.addEventListener('mouseenter', () => expandToBlob(navWordmarkEl, true));
navWordmarkEl.addEventListener('mouseleave', () => shrinkBlob());

// Nav name
const navName = document.getElementById('nav-name');
const nameInner = navName.querySelector('.name-inner');
navName.addEventListener('mouseenter', () => {
  gsap.to(nameInner, { y: -10, opacity: 0, duration: 0.2, onComplete: () => {
    nameInner.textContent = "MELODY";
    Object.assign(nameInner.style, { fontFamily: "'PP Neue Montreal', 'Helvetica Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase" });
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

const navItems = document.querySelectorAll('.nav-pill, .nav-wordmark, .nav-link-item, .nav-asterisk');

gsap.set(navItems, { color: "#0033FF" });
gsap.set('#navWrap', { opacity: 0 });
const navAsteriskSvg = document.querySelector('#navAsterisk svg');
gsap.set(navAsteriskSvg, { rotation: -378 });
gsap.set('.nav-content', { opacity: 1 }); // let CSS handle individual item transitions

document.getElementById('navAsterisk').addEventListener('mouseenter', () => {
  gsap.killTweensOf(navAsteriskSvg);
  gsap.to(navAsteriskSvg, {
    rotation: '-=720',
    duration: 1.8,
    ease: "power2.out"
  });
});

navName.addEventListener('click', (e) => {
  e.preventDefault();
  if (window.fishtankPanels?.isOpen()) { window.fishtankPanels.close(); return; } // a who/play panel is open: back to home
  const isAtTop = (lenis && lenis.scroll < 50) || window.scrollY < 50;
  if (isAtTop) {
    // already home and at top — do nothing
    return;
  } else {
    lenis.scrollTo(0, { duration: 1.2 });
  }
});

function spinStarLandUpright() {
  const star = document.getElementById("nav-star-icon");
  if (!star) return;
  gsap.killTweensOf(star);
  const current = gsap.getProperty(star, "rotation") || 0;
  const normalized = ((current % 360) + 360) % 360;
  const target = current + (360 - normalized) + 360;
  gsap.to(star, { rotation: target, duration: 3.5, ease: "power1.out", overwrite: "auto" });
}

document.querySelectorAll('.nav-swap').forEach(link => {
  
    link.addEventListener('click', (e) => {
    e.preventDefault();
  });
  
  const originalText = link.textContent.trim();
  link.innerHTML = `<span class="nav-inner">${originalText}</span>`;
  const inner = link.querySelector('.nav-inner');
  const defaultText = link.getAttribute('data-default') || originalText;
  const hoverText = link.getAttribute('data-hover') || originalText;
  inner.style.display = "inline-block";
  inner.style.willChange = "transform, opacity";
  inner.textContent = defaultText;

  link.addEventListener('mouseenter', () => {
    gsap.to(inner, { y: -10, opacity: 0, duration: 0.1, onComplete: () => {
      inner.textContent = hoverText;
      inner.classList.add('nav-hover-italic');
      gsap.fromTo(inner, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.16 });
    }});
  });

  link.addEventListener('mouseleave', () => {
    gsap.to(inner, { y: 10, opacity: 0, duration: 0.1, onComplete: () => {
      inner.textContent = defaultText;
      inner.classList.remove('nav-hover-italic');
      gsap.fromTo(inner, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.16 });
    }});
  });
});


// [WORK] nav link
let wipeInProgress = false;

document.getElementById('navWrap').addEventListener('click', (e) => {
  const workLink = e.target.closest('[data-default="work"]');
  if (!workLink) return;
  e.preventDefault();
  e.stopPropagation();
  if (wipeInProgress) return;

  // a who/play panel is open: close it and land on the work section
  if (window.fishtankPanels?.isOpen()) {
    window.fishtankPanels.close({ label: '[ work ]', then: () => lenis.scrollTo(document.querySelector('#third-section').offsetTop, { immediate: true, force: true }) });
    return;
  }

  const thirdSection = document.querySelector('#third-section');
  const sectionTop = thirdSection.offsetTop;
  const alreadyInWork = window.scrollY >= sectionTop - 100;

  if (alreadyInWork) {
    lenis.scrollTo(sectionTop, { duration: 1.2 });
    return;
  }

  wipeInProgress = true;
  
    gsap.set('#blackCover, .section-2-backdrop-black', { opacity: 0 }); // 👈 add this


  const overlay = document.getElementById('work-wipe-overlay');
  const text = document.getElementById('work-wipe-text');

  lenis.stop();
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  overlay.style.pointerEvents = 'all';

  gsap.killTweensOf(overlay);
  gsap.killTweensOf(text);
  gsap.set(overlay, { y: window.innerHeight });

  gsap.set(text, { opacity: 0 });

gsap.to(overlay, {
    y: 0,
    duration: 0.7,
    ease: "power3.inOut",
onStart: () => {
  gsap.fromTo(text,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.25 }
  );
},
    onComplete: () => {
      window.scrollTo(0, sectionTop);


      gsap.set('.scaling-rig', { scale: 10, autoAlpha: 0, clearProps: 'filter,willChange' });
      gsap.set(['.hero-peek-layer', '.hero-halo', '.hero-orbit'], { autoAlpha: 0 });
      gsap.set('.hero-identity-frame', { autoAlpha: 0 });
      gsap.set(['.fish-clown-1', '.fish-clown-2', '.fish-tang'], { autoAlpha: 0 });
      gsap.set('.hero-star', { autoAlpha: 0 });
      onPageScrollLayout();
      gsap.set('#blackCover, .section-2-backdrop-black', { opacity: 1 });
      restoreScalingRigMask();

      carouselAnimPlayed = false;
      carouselReady = false;
      window._carouselFade = 0;
      carouselEl.style.opacity = '0';
      stopGlide();
      offset = 0;
      velX = 0;
      layoutCards();
      hideAward();
      hideBadge();
      gsap.killTweensOf(badgeEl);
      gsap.killTweensOf(awardEl);
      if (badgeEl) { badgeEl.style.opacity = '0'; badgeEl._currentLift = 0; badgeEl._targetLift = 0; }
      if (awardEl) { awardEl.style.opacity = '0'; awardEl._currentLift = 0; awardEl._targetLift = 0; }

      workNavPills.forEach(pill => {
        gsap.set(pill, { opacity: 0 });
        pill.classList.remove('active');
      });

      setTimeout(() => {
gsap.to(overlay, {
  y: -(window.innerHeight + 40),
  duration: 0.7,
          ease: "power3.inOut",
          delay: 0.15,
onStart: () => {
  gsap.to(text, { opacity: 0, y: -30, duration: 0.4, ease: "power2.in" });
  // settle exactly where section 3 fully covers section 2 (curtain closed)
  gsap.fromTo({ scroll: sectionTop - 20 }, 
    { scroll: sectionTop - 20 },
    {
    scroll: sectionTop,
      duration: 0.85,
      ease: "power2.inOut",
      onUpdate: function() {
        window.scrollTo(0, this.targets()[0].scroll);
      }
    }
  );
},
          onComplete: () => {
            gsap.set(overlay, { y: window.innerHeight + 40 });
            overlay.style.pointerEvents = 'none';
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            wipeInProgress = false;
setTimeout(() => {
  ScrollTrigger.refresh();
  ScrollTrigger.update();
  lenis.start();
}, 100);
          }
        });
      }, 600);
    }
  });
});


const footerStarSpin = gsap.to("#footer-star-icon", { rotation: 360, duration: 25, ease: "none", repeat: -1 });

ScrollTrigger.create({ 
  trigger: ".scroll-tracker", 
  start: "5% top", 
  onEnter: () => {
    document.body.classList.add('reveal-sec2');
    gsap.to(navItems, { color: "#83E7FF", duration: 0.4 });
  }, 
  onLeaveBack: () => {
    document.body.classList.remove('reveal-sec2');
    gsap.to(navItems, { color: "#0033FF", duration: 0.4 });
  }
});

gsap.to("#blackCover, .section-2-backdrop-black", {
  opacity: 1,
  scrollTrigger: { trigger: ".scroll-tracker", start: "55% top", end: "80% top", scrub: true }
});

ScrollTrigger.create({
  trigger: ".footer-section",
  start: "top 85%",
  end: "top 75%",
  onEnter: () => {
    spinStarLandUpright();
    gsap.to(".nav-center-star", { opacity: 0, duration: 0.6 });
  },
  onLeaveBack: () => {
    spinStarLandUpright();
    gsap.to(".nav-center-star", { opacity: 1, duration: 0.6 });
  }
});

// In the work section the main nav takes the colour of the project card in
// front (the same colour as its selected pill), and follows as the carousel turns.
let navInWork = false, navCardColor = null;
function syncNavToCard() {
  if (!navInWork) return;
  let c = '#E7A0FE';
  try {   // (the carousel may not be set up yet on the very first load)
    const i = ((Math.round(offset) % N) + N) % N;
    c = workNavPills[i].style.getPropertyValue('--pill-color').trim() || c;
  } catch (e) {}
  if (c === navCardColor) return;
  navCardColor = c;
  gsap.to(navItems, { color: c, duration: 0.4, overwrite: 'auto' });
}
function setNavInWork(on) { navInWork = on; navCardColor = null; if (on) syncNavToCard(); }

ScrollTrigger.create({
  trigger: ".footer-section",
  start: "top 50%",
  end: "bottom 50%",
  onEnter: () => { setNavInWork(false); gsap.to(navItems, { color: "#D1FFA4", duration: 0.4, overwrite: 'auto' }); },
  onLeaveBack: () => setNavInWork(true)
});

ScrollTrigger.create({
  trigger: ".third-section",
  start: "top 50%",
  end: "bottom 50%",
  onEnter: () => setNavInWork(true),
  onLeaveBack: () => { setNavInWork(false); gsap.to(navItems, { color: "#83E7FF", duration: 0.4, overwrite: 'auto' }); }
});

const workFooterGradient = document.querySelector('.work-footer-gradient');

ScrollTrigger.create({
  trigger: ".third-section",
  start: "top bottom",
  end: "bottom top",
  scrub: 1.5,
  onUpdate: (self) => {
    if (!workFooterGradient) return;
    const p = self.progress;
    const w = 5 + (p * 120);        // 5% → 125%
    const h = 20 + (p * 80);         // 4% → 84%
    const midStop = 20 + (p * 40);  // 20% → 55%
    const darkStop = 55 + (p * 50); // 35% → 70%
    workFooterGradient.style.opacity = Math.min(1, p * 2.5);
    workFooterGradient.style.visibility = p > 0 ? 'visible' : 'hidden'; // no memory used while invisible
const r = Math.round(0 + (p * 0));
const g = Math.round(1 + (p * 109));
const b = Math.round(128 + (p * 105));
const centerOpacity = Math.min(1, p * 3);
workFooterGradient.style.background = `radial-gradient(ellipse ${w}% ${h}% at 50% 100%, rgba(${r}, ${g}, ${b}, ${centerOpacity}) 0%, rgba(${r}, ${g}, ${b}, ${centerOpacity}) 5%, #000180 ${midStop}%, #000000 ${darkStop}%)`;
  }
});

// The footer grows + fades in as it scrolls up. Both finish a little BEFORE the
// very bottom of the page: they used to finish on its exact last pixel, so if the
// scroll stopped a hair short (e.g. the page's height changed a touch after
// loading), the footer got stuck part-way — a bit small and see-through.
gsap.fromTo("#footer-main-content", 
  { scale: 0.8, opacity: 0.3 }, 
  { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: ".footer-section", start: "top bottom", end: "top 12%", scrub: true, invalidateOnRefresh: true } }
);

gsap.fromTo("#footer-bottom-content", 
  { scale: 0.9, opacity: 0 }, 
  { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: ".footer-section", start: "70% bottom", end: "bottom 112%", scrub: true, invalidateOnRefresh: true } }
);

let lastGradientUpdate = 0;
ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "30% top",
  end: "100% top",
  scrub: 0.8,
  onUpdate: (self) => {
    if (!pageReady) return;
    const now = performance.now();
    if (now - lastGradientUpdate < 32) return;
    lastGradientUpdate = now;
    const p = self.progress;
    setSkyVar("--pink-stop", `${3 - (p * 2)}%`);
    setSkyVar("--blue-mid-stop", `${40 - (p * 25)}%`);
    setSkyVar("--blue-dark-stop", `${75 - (p * 50)}%`);
  }
});

const skyText = document.getElementById("skyRevealText");
const fishTank = document.getElementById('fish-tank');
const section2Wrapper = document.querySelector('.section-2-wrapper');
const section2Frame = document.querySelector('.section-2-wrapper > .sky-border-top');
const setDanglesY = gsap.quickSetter('.dangles-decor', 'y', 'px');
const section2Blur = document.querySelector('.section-2-blur');
const thirdSectionEl = document.querySelector('.third-section');
let section2Hidden = false;

// ============================================
// SECTION 2 → 3 "CURTAIN"
// The scalloped black frame scrolls away with the page. The aquarium inside it
// (fish, text, light rays…) drifts up much slower (parallax), and section 3 —
// stitched to the bottom of the frame — rises over it. The aquarium is trimmed off wherever section 3 covers
// it, and hidden entirely (animations paused) once fully covered.
// ============================================
// Where the porthole opening ends on screen: section 3 attaches right there,
// so the project nav sits just under the scallops instead of below the
// frame's thick black bottom band.
const FRAME_IMG_RATIO = 2880 / 1817;   // border-top.webp width ÷ height
const FRAME_HOLE_BOTTOM = 0.859;       // lowest point of the opening, as a fraction of the image height
let frameHoleBottomPx = 0;
let heroEndScrollPx = 0;               // where the hero zoom finishes (the scroll-tracker's 30% point)
const FRAME_ARRIVAL = 0.15;            // frame is nearly centred at this fraction of the hero zoom — lower = starts higher up
const CURTAIN_GAP_PX = 70;             // extra breathing room between the scallops and section 3
const SECTION2_PARALLAX = 0.35;        // aquarium scrolls at 35% of page speed (1 = with the page, 0 = pinned)
const SECTION2_MAX_BLUR = 12;          // px of blur on the aquarium by the time it's fully covered
let thirdSectionTopPx = 0;
function measureSection2Curtain() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const boxW = vw * 1.02, boxH = vh * 1.02, boxTop = -0.01 * vh;  // .sky-border-top is 102vw × 102vh at -1vh
  const imgH = Math.max(boxH, boxW / FRAME_IMG_RATIO);             // background-size: cover
  const imgTop = boxTop + (boxH - imgH) / 2;                       // background-position: center
  frameHoleBottomPx = imgTop + FRAME_HOLE_BOTTOM * imgH;
  thirdSectionTopPx = thirdSectionEl ? thirdSectionEl.offsetTop : 0;
  const tracker = document.querySelector('.scroll-tracker');
  heroEndScrollPx = tracker ? tracker.offsetTop + tracker.offsetHeight * 0.30 : 0; // matches the hero exit's end: "30% top"
}

// Where the frame sits on screen relative to its centred spot (positive = lower),
// for scroll position `scroll`, while it's easing in; null once section 3 has fully
// taken over. It follows the line that's centred when the hero ends (H), shifting
// smoothly onto section 3's line (centred at C) — a smoothstep spread over 3×(C−H)
// keeps its speed between 50% and 100% of the page speed, so it never stops.
function section2FrameY(scroll, frameOffset) {
  const C = scroll - frameOffset;   // scroll position where section 3 would have it centred
  const H = heroEndScrollPx * FRAME_ARRIVAL;  // scroll position where it's (nearly) centred
  const D = C - H;
  if (D <= 0) return frameOffset < 0 ? -frameOffset : null;  // hero ends after hand-off: simple 1:1
  const s1 = H - D, s2 = C + D;
  if (scroll >= s2) return null;
  const t = Math.min(1, Math.max(0, (scroll - s1) / (s2 - s1)));
  const ease = t * t * (3 - 2 * t);  // smoothstep
  return (H - scroll) + D * ease;
}

function updateSection2Curtain() {
  if (!section2Wrapper || !section2Frame || !thirdSectionEl) return;
  const vh = window.innerHeight;
  const s3Top = thirdSectionTopPx - window.scrollY;                  // section 3's top edge on screen
  // Section 3 first rises over the frame's solid-black bottom band (black on
  // black, invisible); once it reaches the opening, the frame rides along with it.
  // A small gap is kept between the scallops and section 3's content; it's
  // hidden inside the frame's solid-black bottom band, so it never shows the aquarium.
  const gap = Math.min(CURTAIN_GAP_PX, (window.innerHeight - frameHoleBottomPx) * 0.7);
  // How far the frame is from its "in place around the aquarium" position.
  // Negative = still below the screen and rising in (hero → section 2);
  // positive = leaving upward with section 3 (the curtain).
  const frameOffset = frameHoleBottomPx + gap - s3Top;
  const frameShift = Math.max(0, frameOffset);
  // Parallax: the aquarium drifts up slower than the page, while the frame
  // (inside it) makes up the difference so it still moves at full page speed.
  const contentShift = frameShift * SECTION2_PARALLAX;
  section2Wrapper.style.transform = contentShift ? `translate3d(0, ${-contentShift}px, 0)` : '';
  // The frame never stops: it rises in from below at page speed, eases to about
  // half speed as it settles around the aquarium (nearly centred as the hero
  // ends), then eases back up to full speed as section 3 takes over. Around the
  // hand-off it may run slightly ahead of section 3 — that only adds a little
  // black between the scallops and section 3's black top, then closes smoothly.
  const frameScreenY = section2FrameY(window.scrollY, frameOffset);
  const frameY = frameScreenY === null
    ? -(frameShift - contentShift)                   // fully handed over: leaving with section 3
    : Math.min(vh * 1.1, frameScreenY + contentShift); // (+contentShift undoes the aquarium's parallax drift)
  section2Frame.style.transform = frameY ? `translate3d(0, ${frameY}px, 0)` : '';
  // Dangles hang from the top of the frame's window: they follow the frame's
  // movement, but only partly (parallax), so they drift more slowly than it.
  const frameOffsetOnScreen = frameScreenY === null ? -frameShift : frameScreenY;
  setDanglesY(DANGLES_REST_Y + DANGLES_PARALLAX * frameOffsetOnScreen + contentShift);
  // trim the aquarium wherever section 3 covers it (measured in the moved layer's own space)
  const covered = Math.min(vh, Math.max(0, vh - s3Top - contentShift));
  // (always set, even at 0 — switching it on/off mid-scroll made the aquarium flicker)
  section2Wrapper.style.clipPath = `inset(0 0 ${covered}px 0)`;
  // blur the aquarium (not the frame) as it's covered up: the overlay's blur
  // grows from 0 to SECTION2_MAX_BLUR. (A backdrop blur keeps the overlay's size
  // no matter how strong it gets, so changing it doesn't force a layer rebuild.)
  // The fish etc. keep moving underneath until the aquarium is fully covered.
  // The overlay stays switched on (at a near-zero blur) the whole time section 2
  // is showing — turning it on right as you scroll away made the first frames
  // render wrong, which looked like the diamond pattern suddenly shifting.
  if (section2Blur) {
    const blurAmount = Math.min(1, frameShift / Math.max(1, frameHoleBottomPx));
    const b = `blur(${Math.max(0.01, blurAmount * SECTION2_MAX_BLUR).toFixed(2)}px)`;
    section2Blur.style.backdropFilter = b;
    section2Blur.style.webkitBackdropFilter = b;
  }
  const hidden = s3Top <= 0;
  if (hidden !== section2Hidden) {
    section2Hidden = hidden;
    section2Wrapper.style.visibility = hidden ? 'hidden' : '';
  }
}
// ============================================
// WORK DIAL — the big circle behind the project cards, drawn as the ridges of a
// dial: short, thin radial ticks, closely and evenly spaced. Same circle, colour
// and placement as the old "work circle" image (whose box was 2880 × 1193 with the
// circle's centre at (50%, 60.34% of the width) and radius 60.33% of the width).
// ============================================
const workDial = document.querySelector('.work-dial');
const WORK_DIAL = {
  color: 'rgba(0, 110, 233, 0.5)',  // same as the unselected project pills' fill
  tickLength: 12,                   // css px, centred on the circle
  majorEvery: 20,                   // every 20th ridge is a longer mark
  majorLength: 22,                  // css px, centred on the circle
  tickSpacing: 8,                   // css px between ticks along the circle
  tickWidth: 1,                     // css px
  // numbers on the long marks: 001, 002, 003… counting up left to right, turning with the dial
  labelFont: "300 10px 'HafferXH', ui-monospace, monospace",   // same font as the nav pills' numbers
  labelGap: 7,                      // css px between a long mark's outer end and its number
};
// Angle between neighbouring project cards on the carousel wheel (smaller = cards closer together).
var CARD_ANGLE = 24;
// The dial turns with the carousel: one card = CARD_ANGLE, the same angle the cards move.
var workDialPhase = 0;           // radians (var: the carousel can ask for a redraw before this line runs)
let workDialDrawnPhase = null;
function turnWorkDial(carouselOffset) {
  const phase = -carouselOffset * CARD_ANGLE * Math.PI / 180;   // same direction the cards travel
  if (phase === workDialDrawnPhase) return;              // nothing moved (e.g. hover-lift redraws)
  workDialPhase = phase;
  drawWorkDial();
}

function drawWorkDial() {
  if (!workDial) return;
  workDialDrawnPhase = workDialPhase;
  const cssW = workDial.clientWidth || window.innerWidth;
  // Extra room above and below (equal, so the dial stays centred where it was):
  // the top of the circle sits right at the old image's top edge, and the ridges
  // stick out half their length past the circle — without this they got cut off.
  const pad = WORK_DIAL.majorLength + 14;   // (+ room for the numbers above the ridges)
  const cssH = cssW * 1193 / 2880 + pad * 2;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  workDial.width = Math.round(cssW * dpr);
  workDial.height = Math.round(cssH * dpr);
  const ctx = workDial.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  const cx = cssW * 0.5, cy = pad + cssW * 0.6034, r = cssW * 0.6033;
  const half = WORK_DIAL.tickLength / 2;
  const majorHalf = WORK_DIAL.majorLength / 2;
  const step = WORK_DIAL.tickSpacing / r;             // angle between ticks
  const maxAngle = Math.asin(Math.min(1, (cssW / 2 + half) / r)) + step; // only the part that's on screen
  ctx.strokeStyle = WORK_DIAL.color;
  ctx.lineWidth = WORK_DIAL.tickWidth;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  const first = Math.ceil((-maxAngle - workDialPhase) / step);
  // k counts ridges from the dial's own zero, so the long marks turn with it
  for (let k = first, a = workDialPhase + first * step; a <= maxAngle; k++, a += step) {
    const sx = Math.sin(a), cy2 = -Math.cos(a);
    const h = (((k % WORK_DIAL.majorEvery) + WORK_DIAL.majorEvery) % WORK_DIAL.majorEvery === 0) ? majorHalf : half;
    ctx.moveTo(cx + sx * (r - h), cy + cy2 * (r - h));
    ctx.lineTo(cx + sx * (r + h), cy + cy2 * (r + h));
  }
  ctx.stroke();

  // numbers just outside each long mark, reading along the circle
  ctx.fillStyle = WORK_DIAL.color;
  ctx.font = WORK_DIAL.labelFont;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0.08em';
  const labelR = r + majorHalf + WORK_DIAL.labelGap;
  for (let k = first, a = workDialPhase + first * step; a <= maxAngle; k++, a += step) {
    if (((k % WORK_DIAL.majorEvery) + WORK_DIAL.majorEvery) % WORK_DIAL.majorEvery !== 0) continue;
    const m = Math.round(k / WORK_DIAL.majorEvery) + 6;   // (+6: the leftmost mark on screen at the start reads 001)
    const n = ((m % 1000) + 1000) % 1000;
    ctx.save();
    ctx.translate(cx + Math.sin(a) * labelR, cy - Math.cos(a) * labelR);
    ctx.rotate(a);
    ctx.fillText(String(n).padStart(3, '0'), 0, 0);
    ctx.restore();
  }
}
drawWorkDial();
window.addEventListener('resize', drawWorkDial);
document.fonts.load("300 10px 'HafferXH'").then(drawWorkDial);   // redraw once the numbers' font is in

// ============================================
// "MAGNETIC" DECOR — section 2 (same feel as the Pent Up stamps)
// Moving the mouse near a bubble, flower or asterisk nudges it along in the direction the
// mouse is travelling — stronger the closer you are — then it springs back.
// Unlike the Pent Up version, the loop only runs while something is moving.
// Uses the CSS `translate` property so it stacks with the decor's own intro
// animation and rotation.
// ============================================
// Section 2's little bubbles and blue flowers (inside the aquarium)
const magnetDecor = Array.from(document.querySelectorAll('.sec2-bubble, .sec2-flower'))
  .map((el) => ({ el, cx: 0, cy: 0, vx: 0, vy: 0, mx: 0, my: 0 }));
// reach: how close (px) the mouse must pass; strength: how much of the mouse's
// movement becomes a push; pushFade: how quickly the push dies once the mouse stops
// (tuned for these tiny pieces — the Pent Up stamps' 300 / 0.3 barely moved them)
// maxShift: the furthest a piece can be pushed (px) — without it, a piece that moves
// along with the mouse stays in reach and keeps getting pushed further and further
const MAGNET = { reach: 220, strength: 0.8, pushFade: 0.9, maxShift: 14 };
let magnetLastX = null, magnetLastY = null, magnetRunning = false;

window.addEventListener('mousemove', (e) => {
  const dx = magnetLastX === null ? 0 : e.clientX - magnetLastX;
  const dy = magnetLastY === null ? 0 : e.clientY - magnetLastY;
  magnetLastX = e.clientX; magnetLastY = e.clientY;
  if (!section2Active || section2Hidden) return;   // only while section 2 is on screen
  let any = false;
  magnetDecor.forEach((d) => {
    const r = d.el.getBoundingClientRect();
    const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    if (dist < MAGNET.reach) {
      const influence = (1 - dist / MAGNET.reach) * MAGNET.strength;
      d.mx = dx * influence; d.my = dy * influence; any = true;
    }
  });
  if (any && !magnetRunning) { magnetRunning = true; requestAnimationFrame(magnetStep); }
}, { passive: true });

function magnetStep() {
  let moving = false;
  magnetDecor.forEach((d) => {
    d.vx += (d.mx - d.vx) * 0.08;  d.vy += (d.my - d.vy) * 0.08;
    d.cx += d.vx;                   d.cy += d.vy;
    d.cx *= 0.9; d.cy *= 0.9; d.vx *= 0.9; d.vy *= 0.9;
    const shift = Math.hypot(d.cx, d.cy);
    if (shift > MAGNET.maxShift) { const k = MAGNET.maxShift / shift; d.cx *= k; d.cy *= k; d.vx *= k; d.vy *= k; }
    d.mx *= MAGNET.pushFade; d.my *= MAGNET.pushFade;  // the push fades once the mouse stops
    if (Math.abs(d.cx) + Math.abs(d.cy) + Math.abs(d.vx) + Math.abs(d.vy) > 0.02) moving = true;
    else { d.cx = d.cy = d.vx = d.vy = 0; }
    d.el.style.translate = `${d.cx.toFixed(2)}px ${d.cy.toFixed(2)}px`;
  });
  if (moving) requestAnimationFrame(magnetStep);
  else magnetRunning = false;
}

// ============================================
// WORK NAV (project pills): STICKY UNTIL THE FOOTER
// Once the pills scroll up to the main nav's height, they stay there, centred
// on the same line as the main nav. When the footer arrives it pushes them up
// and off the screen with it.
// ============================================
const workNavEl = document.getElementById('workNav');
const mainNavEl = document.getElementById('navPill');
const footerSectionEl = document.querySelector('.footer-section');
let workNavNaturalOffset = 0, workNavHeight = 0, workNavStickyTop = 0, footerTopPx = 0;
const WORK_NAV_FOOTER_GAP = 180; // px kept between the pills and the footer — bigger = pills leave earlier

function measureWorkNav() {
  if (!workNavEl || !mainNavEl || !footerSectionEl) return;
  workNavEl.style.transform = '';
  workNavNaturalOffset = workNavEl.offsetTop;              // its spot inside section 3
  workNavHeight = workNavEl.offsetHeight;
  const nav = mainNavEl.getBoundingClientRect();           // main nav is fixed, so this is constant
  workNavStickyTop = nav.top + nav.height / 2 - workNavHeight / 2;
  footerTopPx = footerSectionEl.offsetTop;
}

function updateWorkNavSticky() {
  if (!workNavEl || !footerSectionEl) return;
  const naturalTop = thirdSectionTopPx - window.scrollY + workNavNaturalOffset; // where it would be without sticking
  const footerTop = footerTopPx - window.scrollY;
  const pushedUpTop = footerTop - workNavHeight - WORK_NAV_FOOTER_GAP; // stays this far above the arriving footer
  const top = Math.max(naturalTop, Math.min(workNavStickyTop, pushedUpTop));
  const shift = top - naturalTop;
  workNavEl.style.transform = shift > 0.5 ? `translate3d(0, ${shift}px, 0)` : '';
}

// lenis moves the page inside its animation frame — update in that same frame
// so the frame and section 3 never drift apart
function onPageScrollLayout() { updateSection2Curtain(); updateWorkNavSticky(); requestPillContrastCheck(); }
function onPageLayoutChange() { measureSection2Curtain(); measureWorkNav(); onPageScrollLayout(); }
lenis.on('scroll', onPageScrollLayout);
window.addEventListener('scroll', onPageScrollLayout, { passive: true });
window.addEventListener('resize', onPageLayoutChange);
ScrollTrigger.addEventListener('refresh', onPageLayoutChange);
onPageLayoutChange();

const fishData = [];

if (fishTank) {
  fishTank.innerHTML = '';
  
const fishConfig = [
  { type: 'fish-visual',    y: 20, size: 1.1,  zIndex: 3, startX: -20, endX: 110 },
  { type: 'fish-canvas',    y: 34, size: 1.05, zIndex: 2, startX: -20, endX: 110 },
  { type: 'fish-branding',  y: 50, size: 1.3,  zIndex: 2, startX: -20, endX: 110 },
  { type: 'fish-product',   y: 65, size: 1.08, zIndex: 1, startX: -20, endX: 110 },
  { type: 'fish-narrative', y: 25, size: 1.5,  zIndex: 3, startX: -20, endX: 110 },
  { type: 'fish-ux',        y: 57, size: 1.1,  zIndex: 2, startX: -20, endX: 110 },
  { type: 'fish-ui',        y: 75, size: 1.2,  zIndex: 3, startX: -20, endX: 110 },
  { type: 'fish-layout',    y: 43, size: 1.08, zIndex: 2, startX: -20, endX: 110 },
];

fishConfig.forEach(config => {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.pointerEvents = 'none';
  
  const fish = document.createElement('div');
  fish.classList.add('sky-fish', config.type);
  fish.dataset.scale = config.size;
  fish.style.pointerEvents = 'auto';
  
  wrapper.appendChild(fish);
  fishData.push({ element: fish, wrapper: wrapper, startX: config.startX, endX: config.endX, y: config.y, speed: config.speed });
  gsap.set(wrapper, { x: `${config.startX}vw`, y: `${config.y}vh` });
  gsap.set(fish, { scale: config.size });
  fishTank.appendChild(wrapper);
});
 
  
fishData.forEach((data, i) => {
  const duration = 14;
  const totalFish = fishData.length;
  // Group fish into 4 pairs, spread pairs evenly but keep pairs close
const pairIndex = Math.floor(i / 2);
const withinPair = i % 2;
const delay = (pairIndex / 4) * duration + (withinPair * 0.4);

  function swim() {
    gsap.fromTo(data.wrapper,
      { x: `${data.startX}vw` },
      {
        x: `${data.endX}vw`,
        duration: duration,
        ease: "none",
        onComplete: swim
      }
    );
  }

  // Start mid-cycle based on delay so they're spread out
  const progress = delay / duration;
  const initialX = data.startX + (data.endX - data.startX) * progress;
  
  gsap.set(data.wrapper, { x: `${initialX}vw` });
  gsap.to(data.wrapper, {
    x: `${data.endX}vw`,
    duration: duration * (1 - progress),
    ease: "none",
    onComplete: swim
  });
});

} // ← closes the if (fishTank) block

ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "15% top",
  onEnter: () => {
    const tl = gsap.timeline();
    tl.to('.sky-text-images .sky-anim', { 
      opacity: 1, y: 0, duration: 0.8, stagger: 0.15, 
      ease: "power2.out", force3D: true, overwrite: true 
    })
    .to('.sec2-bubble, .sec2-flower', { 
      opacity: 1, y: 0, duration: 0.6, stagger: 0.08, 
      ease: "power2.out", force3D: true 
    }, 0.25);
  },
  onLeaveBack: () => {
    gsap.to('.sky-text-images .sky-anim', { opacity: 0, y: 40, duration: 0.4, stagger: 0.1, ease: "power2.in", force3D: true, overwrite: true });
    gsap.to('.sec2-bubble, .sec2-flower', { opacity: 0, y: 20, duration: 0.4, stagger: 0.06, ease: "power2.in", force3D: true, overwrite: true });
  }
});

const carouselEl = document.getElementById('circularCarousel');
const cards = Array.from(carouselEl.querySelectorAll('.project-card'));


const N = cards.length;

// Carousel order (matches the cards and pills in index.html)
const projectURLs = [
  '',          // 0 creatify — live HTML card (no case study page yet)
  '',          // 1 settlyfe (coming soon)
  'deep24/',   // 2
  'pent-up/',  // 3
  'knouri/',   // 4
];
const PENT_UP_INDEX = 3;   // card that shows the "winner" award
const SETTLYFE_INDEX = 1;  // card that shows the "coming soon" badge
const projectWipeLabels = ['[ creatify ]', '', '[ deep24 ]', '[ pent up ]', '[ knouri ]'];

// Slide the navy splash up (same as the [ work ] wipe), then open the project.
// The project page starts under the same splash and slides it away, so the
// switch between pages is invisible.
let projectWipeInProgress = false;
function openProject(index) {
  wipeToPage(projectURLs[index], projectWipeLabels[index]);
}

function wipeToPage(url, label) {
  if (!url || projectWipeInProgress) return;
  projectWipeInProgress = true;

  const overlay = document.getElementById('work-wipe-overlay');
  const text = document.getElementById('work-wipe-text');
  lenis.stop();
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  overlay.style.pointerEvents = 'all';
  text.textContent = label;

  gsap.killTweensOf([overlay, text]);
  gsap.set(overlay, { y: window.innerHeight });
  gsap.set(text, { opacity: 0 });
  gsap.to(overlay, {
    y: 0,
    duration: 0.7,
    ease: "power3.inOut",
    onStart: () => {
      gsap.fromTo(text, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.25 });
    },
    onComplete: () => {
      // let the label finish settling, then go
      setTimeout(() => { window.location.href = url; }, 250);
    }
  });
}

// Slides the navy splash up and off the screen, then resets it for next time.
function revealWipeOverlay(delay = 0.15) {
  const overlay = document.getElementById('work-wipe-overlay');
  const text = document.getElementById('work-wipe-text');
  gsap.to(overlay, {
    y: -(window.innerHeight + 40),
    duration: 0.7,
    ease: "power3.inOut",
    delay,
    onStart: () => gsap.to(text, { opacity: 0, y: -30, duration: 0.4, ease: "power2.in" }),
    onComplete: () => {
      document.documentElement.classList.remove('arrive-wipe');
      gsap.set(overlay, { y: window.innerHeight + 40 });
      text.textContent = '[ work ]';
      overlay.style.pointerEvents = 'none';
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      if (!window.fishtankPanelOpen) lenis.start(); // (a who/play panel keeps the homepage still)
    }
  });
}

// Coming back with the browser's Back button restores this page exactly as it
// was left — still covered by the splash. Slide it away again.
window.addEventListener('pageshow', (e) => {
  if (!e.persisted || !projectWipeInProgress) return;
  projectWipeInProgress = false;
  revealWipeOverlay();
});

// Arrived from a project page under the splash: once the page has settled
// into place underneath, slide the splash away.
if (document.documentElement.classList.contains('arrive-wipe')) {
  window.addEventListener('load', () => {
    // the work section finishes arranging itself ~0.8s after load (see the hash handling below)
    const settle = window.location.hash === '#third-section' ? 0.95 : 0.3;
    revealWipeOverlay(settle);
  });
}

let offset = 0;
let dragging = false;
let startX = 0;
let startOffset = 0;
let velX = 0;
let lastX = 0;
let didDrag = false;
let rafId;
let carouselReady = false;
let isInteracting = false;
const awardEl = document.querySelector('.pent-up-award');
const badgeEl = document.querySelector('.coming-soon-badge');
const workNavPills = document.querySelectorAll('.work-nav-pill');

// Pills show just their number. While hovered — or while its card is the one
// in front (selected) — a pill springs wider and its name fades in; the other
// pills slide along to make room. (The spring is a CSS easing curve on the
// width, see .work-nav-pill in style.css.)
workNavPills.forEach((pill) => {
  const label = pill.textContent.trim();
  const m = label.match(/^(\d+)\s+(.*)$/);
  pill.innerHTML = m
    ? `<span class="pill-num">${m[1]}</span><span class="pill-name">${m[2]}</span>`
    : `<span class="pill-name">${label}</span>`;
  pill._hover = false;
  pill.addEventListener('mouseenter', () => { pill._hover = true; setPillOpen(pill); });
  pill.addEventListener('mouseleave', () => { pill._hover = false; setPillOpen(pill); });
});

function setPillOpen(pill, force) {
  const open = pill._hover || pill.classList.contains('active');
  if (pill._open === open && !force) return;
  pill._open = open;
  pill.classList.toggle('is-open', open);
  if (pill._wOpen) pill.style.width = (open ? pill._wOpen : pill._wClosed) + 'px';
}

// Measure each pill's two widths: number only, and number + name.
function sizeWorkNavPills() {
  workNavPills.forEach((pill) => {
    const num = pill.querySelector('.pill-num');
    const name = pill.querySelector('.pill-name');
    const cs = getComputedStyle(pill);
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const numW = num ? num.getBoundingClientRect().width : 0;
    const nameW = name.getBoundingClientRect().width + parseFloat(getComputedStyle(name).marginLeft);
    pill._wClosed = Math.ceil(pad + numW);
    pill._wOpen = Math.ceil(pad + numW + nameW);
    pill.style.transition = 'none';               // jump straight to the right size
    setPillOpen(pill, true);
    void pill.offsetWidth;
    pill.style.transition = '';
  });
}
document.fonts.ready.then(sizeWorkNavPills);
document.fonts.load("300 16px 'HafferXH'").then(sizeWorkNavPills); // re-measure once the numbers' font arrives
window.addEventListener('resize', sizeWorkNavPills);

function layoutCards() {
  cards.forEach((card, i) => {
    let pos = i - offset;
    // Wrap into (-N/2, N/2] — using strict less-than avoids the boundary flip at exactly N/2
    pos = ((pos % N) + N) % N;
    if (pos > N / 2) pos -= N;

    const absDist = Math.abs(pos);
    const angle = pos * CARD_ANGLE;
    const rad = angle * Math.PI / 180;
    const RADIUS = 1400;
    const x = Math.sin(rad) * RADIUS;
    const y = RADIUS - Math.cos(rad) * RADIUS;

    card.style.position = 'absolute';
    card.style.width = '380px';
    card.style.transformOrigin = 'center center';
    card.style.transition = 'none';
    const lift = card._currentLift || 0;

card.style.transform = `translate(-50%, -50%) translateX(${x}px) translateY(${y + lift}px) rotate(${angle}deg)`;
const distOpacity = absDist > 2.5 ? 0 : Math.max(0, 1 - (absDist - 1.5) * 0.7);
card.style.opacity = String(distOpacity * (window._carouselFade ?? 1));
    card.style.zIndex = String(Math.round(100 - absDist * 10));
  });
  requestPillContrastCheck();
  if (typeof turnWorkDial === 'function' && workDial) turnWorkDial(offset);
}

// Pills over a project card get darker text (the default blue is hard to read
// on the light cards). Checked at most once per frame, only when cards or the
// page have moved.
var pillContrastQueued = false; // var (not let): the scroll code can ask for a check before this line runs
function requestPillContrastCheck() {
  if (pillContrastQueued) return;
  pillContrastQueued = true;
  requestAnimationFrame(updatePillContrast);
}
function updatePillContrast() {
  pillContrastQueued = false;
  if (typeof workNavPills === 'undefined' || !workSectionVisible) return;
  const cardRects = cards
    .filter((c) => parseFloat(c.style.opacity || '1') > 0.3)
    .map((c) => c.getBoundingClientRect());
  workNavPills.forEach((pill) => {
    const r = pill.getBoundingClientRect();
    const overCard = cardRects.some((c) => r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top);
    pill.classList.toggle('over-card', overCard);
  });
}

// ============================================
// CAROUSEL MOTION — "glide"
// When you let go (drag release, or a trackpad flick), we work out where the
// spin would naturally coast to and pick the card nearest that spot. Then one
// smooth slow-down carries it there: it starts at exactly the speed you let go
// at and eases to a stop right on the card — no separate "course-correct",
// and no long creep at the end (it finishes at a definite moment).
// offset is in cards; velX is in cards per second.
// ============================================
const GLIDE = {
  coast: 0.3,      // how far a flick coasts: speed × this (seconds). Higher = spins further
  minTime: 0.3,    // shortest / longest a glide can take (seconds)
  maxTime: 1.1,
  maxCards: 4,     // the most cards one flick can travel
};
let glide = null;

// Moves from here to `target` in `duration` seconds, starting at speed v0 and
// arriving at speed 0 (a cubic curve). When duration = 3 × distance ÷ v0 the
// speed just fades away smoothly, like friction.
function glideTo(target, v0, duration, opts = {}) {
  cancelAnimationFrame(rafId);
  velX = v0;
  glide = { from: offset, target, v0, duration: Math.max(0.05, duration), t0: performance.now(), ...opts };
  rafId = requestAnimationFrame(glideStep);
}
function glideStep(now) {
  const g = glide;
  if (!g) return;
  const D = g.duration, u = Math.min(1, (now - g.t0) / 1000 / D);
  const dist = g.target - g.from;
  offset = g.from + dist * (3 * u * u - 2 * u * u * u) + g.v0 * D * (u - 2 * u * u + u * u * u);
  velX = dist * (6 * u - 6 * u * u) / D + g.v0 * (1 - 4 * u + 3 * u * u);
  if (u >= 1) offset = g.target;
  layoutCards();
  // onNear fires once the card has nearly arrived — or earlier, at nearAt (fraction of the glide's time)
  if (g.onNear && !g.nearDone && (u >= (g.nearAt ?? 1) || Math.abs(g.target - offset) < 0.03)) { g.nearDone = true; g.onNear(); }
  if (u >= 1) {
    velX = 0; glide = null;
    if (g.onArrive) g.onArrive();
    return;
  }
  rafId = requestAnimationFrame(glideStep);
}
function stopGlide() { cancelAnimationFrame(rafId); glide = null; }

// Let go at speed v: coast onto the card nearest where it would naturally stop.
function settleFrom(v) {
  hideAward();
  const reach = Math.max(-GLIDE.maxCards, Math.min(GLIDE.maxCards, v * GLIDE.coast));
  let target = Math.round(offset + reach);
  const moving = Math.abs(v) > 0.05;
  // a real swipe never gets pulled backwards: go to the next card ahead instead
  if (Math.abs(v) > 1.5 && Math.sign(target - offset) !== Math.sign(v)) {
    target = v > 0 ? Math.ceil(offset + 0.001) : Math.floor(offset - 0.001);
  }
  // too fast to stop that soon without overshooting and coming back? go one card further
  if (moving && Math.sign(target - offset) === Math.sign(v) && 3 * Math.abs(target - offset) / Math.abs(v) < GLIDE.minTime) {
    target += Math.sign(v);
  }
  const dist = target - offset;
  let duration = moving && Math.sign(dist) === Math.sign(v)
    ? 3 * Math.abs(dist) / Math.abs(v)          // pure slow-down from your speed
    : 0.35 + 0.35 * Math.min(1, Math.abs(dist) * 2); // (barely moving: a gentle settle)
  duration = Math.min(GLIDE.maxTime, Math.max(GLIDE.minTime, duration));
  glideTo(target, v, duration, { onArrive: () => onCarouselSettled(target) });
}

function onCarouselSettled(target) {
  isInteracting = false;
  updateWorkNav();
  const settled = ((target % N) + N) % N;
  if (settled === PENT_UP_INDEX) {
    const myToken = ++awardToken;
    setTimeout(() => { if (myToken === awardToken && !isInteracting) showAward(); }, 0);
  }
  if (settled === SETTLYFE_INDEX) {
    const myToken = ++awardToken;
    setTimeout(() => { if (myToken === awardToken && !isInteracting) showBadge(); }, 0);
  }
}

// Recent positions while dragging/swiping, to measure the speed at let-go.
const motionSamples = [];
function sampleMotion() {
  const t = performance.now();
  motionSamples.push({ t, x: offset });
  while (motionSamples.length > 2 && t - motionSamples[0].t > 100) motionSamples.shift();
}
function releaseVelocity() {
  const t = performance.now();
  const recent = motionSamples.filter((m) => t - m.t <= 100);
  if (recent.length < 2) return 0;
  const a = recent[0], b = recent[recent.length - 1];
  if (t - b.t > 60) return 0;            // they stopped moving before letting go
  const dt = (b.t - a.t) / 1000;
  return dt > 0.008 ? (b.x - a.x) / dt : 0;
}

carouselEl.addEventListener('click', (e) => {
  const card = e.target.closest?.('.project-card');
  if (!card) return;
  e.preventDefault();
  if (e.detail === 0) openProject(Number(card.getAttribute('data-index'))); // keyboard
});

// Cards are links, and browsers turn press-and-drag on a link into "drag this URL
// somewhere", which stole the gesture from the carousel. Block that so dragging a
// card spins the carousel (a plain click still opens the project).
carouselEl.addEventListener('dragstart', (e) => e.preventDefault());

carouselEl.addEventListener('pointerdown', (e) => {
  if (!carouselReady) return;
  isInteracting = true;
  // hideAward();
  // hideBadge();
  dragging = true;
  didDrag = false;
  startX = e.clientX; startOffset = offset; velX = 0; lastX = e.clientX;
  carouselEl.setPointerCapture(e.pointerId);
  stopGlide();
  motionSamples.length = 0;
  sampleMotion();
});

carouselEl.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  if (Math.abs(e.clientX - startX) > 6) {
    didDrag = true;
    hideAward();
    hideBadge(); // ← only hides once actual drag movement detected
  }
  offset += -(e.clientX - lastX) / 360;
  lastX = e.clientX;
  sampleMotion();
  layoutCards();
});

carouselEl.addEventListener('pointerup', (e) => {
  if (!dragging) return;
  dragging = false;
  if (!didDrag) {
    // Use elementFromPoint to find what's visually under the click
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const clickedCard = el?.closest('.project-card');
    if (clickedCard) openProject(Number(clickedCard.getAttribute('data-index')));
    return;
  }
  settleFrom(releaseVelocity());
});

carouselEl.addEventListener('touchstart', (e) => {
  if (!carouselReady) return;
  isInteracting = true;
  hideAward();
  hideBadge();
  lenis.stop();
  dragging = true; didDrag = false;
  startX = e.touches[0].clientX;
  startOffset = offset;
  velX = 0;
  lastX = e.touches[0].clientX;
  stopGlide();
  motionSamples.length = 0;
  sampleMotion();
}, { passive: true });

carouselEl.addEventListener('touchmove', (e) => {
  if (!dragging) return;
  const dx = e.touches[0].clientX - startX;
  if (Math.abs(dx) > 6) {
    didDrag = true;
    hideAward(); // ← add this
  }
  offset = startOffset - dx / 360;
  lastX = e.touches[0].clientX;
  sampleMotion();
  layoutCards();
}, { passive: false });

carouselEl.addEventListener('touchend', () => {
  if (!dragging) return;
  dragging = false;
  lenis.start();
  
  if (!didDrag) {
    const idx = ((Math.round(offset) % N) + N) % N;
    openProject(Number(cards[idx]?.getAttribute('data-index')));
    return;
  }
  settleFrom(releaseVelocity());
});

window._carouselFade = 0;
carouselEl.style.opacity = '0';
layoutCards();

carouselEl.addEventListener('mousemove', (e) => {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const hoveredCard = el?.classList.contains('project-card') ? el : el?.closest('.project-card');
  cards.forEach(card => {
    card._targetLift = card === hoveredCard ? -30 : 0;
    const hovered = card === hoveredCard;
    if (hovered && !card.classList.contains('cta-hover')) jostleCardGraphics(card);
    card.classList.toggle('cta-hover', hovered);
  });
  
  // Move award with pent up card when it's hovered
  const pentUpCard = cards[PENT_UP_INDEX];
  const award = awardEl;
  if (award && awardVisible) {
    pentUpCard._targetLift === pentUpCard._targetLift; // already set above
    award._targetLift = award._targetLift || 0;
    award._targetLift = (hoveredCard === pentUpCard) ? -50 : 0;
  }
  
  const settlyfeCard = cards[SETTLYFE_INDEX];
const badge = badgeEl;
if (badge) {
  badge._targetLift = (hoveredCard === settlyfeCard) ? -50 : 0;
}


const onCard = !!hoveredCard;
if (onCard && !isBlobMode) expandToBlob(hoveredCard, false);
  else if (!onCard && isBlobMode) {
    const hovered = document.elementsFromPoint(e.clientX, e.clientY).find(el =>
      el.matches?.("a[href], button, [role='button'], .btn-touch") ||
      el.closest?.("a[href], button, [role='button'], .btn-touch")
    );
    if (!hovered) shrinkBlob();
  }
});

carouselEl.addEventListener('mouseleave', () => {
  cards.forEach(card => { card._targetLift = 0; card.classList.remove('cta-hover'); });
  setBadgeTilt(awardEl, false, AWARD_TILT);
  setBadgeTilt(badgeEl, false, BADGE_TILT);
  shrinkBlob();
});

carouselEl.addEventListener('mouseleave', () => {
  cards.forEach(card => { card._hoverLift = 0; });
  shrinkBlob();
});

carouselEl.addEventListener('mouseleave', () => shrinkBlob());

function updateWorkNavHighlight() {
  const pills = workNavPills;
  const active = ((Math.round(offset) % N) + N) % N;
  pills.forEach(pill => {
    const isActive = parseInt(pill.dataset.index) === active;
    pill.classList.toggle('active', isActive);
    setPillOpen(pill);
  });
  syncNavToCard();
}

function updateWorkNav() {
  updateWorkNavHighlight();
}

let awardVisible = false;

// Hovering a live card lifts it; its graphic images get "jostled" by the lift: a
// quick vertical bounce that settles back into place — the back image first, the
// front one a beat later. (Each image also has blurred copies; all move together.)
function jostleCardGraphics(card) {
  spinCardAsterisk(card);
  // some live cards have their own hover animation
  if (card.dataset.hoverAnim === 'circle') return regrowPhotoShape(card, '--circle-r', 204.26);
  if (card.dataset.hoverAnim === 'stadium') return regrowPhotoShape(card, '--shape-k', 1);
  const back = card.querySelectorAll('.pc-graphic--back');
  const front = card.querySelectorAll('.pc-graphic--front');
  if (!back.length && !front.length) return;               // image-only cards: nothing to jostle
  const u = card.offsetWidth / 447;                        // 1 design px in screen px
  // settlyfe's phones get a bigger, bouncier hop: higher, and a couple of little
  // rebounds as they land
  const big = !!card.querySelector('.pc-card--settlyfe');
  const bounce = (imgs, delay) => {
    gsap.killTweensOf(imgs);
    if (big) {
      gsap.timeline({ delay })
        .to(imgs, { y: -30 * u, duration: 0.22, ease: 'power2.out' })  // big hop up…
        .to(imgs, { y: 0, duration: 0.7, ease: 'bounce.out' });        // …and bounce to a stop
      return;
    }
    gsap.timeline({ delay })
      .to(imgs, { y: -11 * u, duration: 0.16, ease: 'power2.out' }) // one hop up…
      .to(imgs, { y: 0, duration: 0.26, ease: 'power2.in' });        // …and straight back down into place
  };
  bounce(back, 0);
  bounce(front, 0.08);
}

// deep24 (circle) + knouri (stadium): the photo's shape fades away, then springs
// back from its centre — growing fast, overshooting a touch, and settling at
// its usual size. `sizeVar` is the CSS variable that sizes the shape.
function regrowPhotoShape(card, sizeVar, fullSize) {
  const pc = card.querySelector('.pc-card');
  const photos = card.querySelectorAll('.pc-graphic--circle, .pc-graphic--shape');
  if (!pc || !photos.length) return;
  gsap.killTweensOf([pc, photos]);
  gsap.timeline()
    .to(photos, { opacity: 0, duration: 0.2, ease: 'power1.out' })            // fade away
    .set(pc, { [sizeVar]: 0 })
    .set(photos, { opacity: 1 })
    .to(pc, { [sizeVar]: fullSize, duration: 0.65, ease: 'back.out(1.5)' });  // pop back in
}

// (trying it out) the card's asterisk spins once, from its resting tilt back to it
function spinCardAsterisk(card) {
  const ast = card.querySelector('.pc-asterisk');
  if (!ast || !ast.animate) return;
  ast.animate(
    [{ transform: 'rotate(-12.8deg)' }, { transform: 'rotate(347.2deg)' }],
    { duration: 900, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }   // quick start, easing to a stop
  );
}

// Resting tilt of each badge (degrees); hovering its card flips it to the opposite tilt
const AWARD_TILT = 12.46;   // Pent Up award
const BADGE_TILT = -12.46;  // "coming soon" badge
function setBadgeTilt(el, hovered, restTilt) {
  if (!el || el._tiltHovered === hovered) return;
  el._tiltHovered = hovered;
  if (Number(gsap.getProperty(el, 'opacity')) < 0.05) return; // badge not showing
  gsap.to(el, { rotate: hovered ? -restTilt : restTilt, duration: 0.5, ease: "back.out(3)", overwrite: "auto" });
}
let awardToken = 0;
let lastHideTime = 0;

function showAward() {
  // if (performance.now() - lastHideTime < 500) return;
  awardVisible = true;
  const award = awardEl;

  if (award) {
    gsap.killTweensOf(award);
    award._tiltHovered = false;
    gsap.fromTo(award,
      { opacity: 0, rotate: -25, scale: 0.9 },
      { opacity: 1, rotate: 12.46, scale: 1, duration: 0.5, ease: "back.out(4)" }
    );
  }
}

function hideBadge() {
  lastHideTime = performance.now();
  const badge = badgeEl;

  if (!badge) return;
  gsap.killTweensOf(badge);
  gsap.to(badge, { opacity: 0, duration: 0.15, ease: "power1.out", overwrite: true });
  badge.style.transition = '';
}

function showBadge() {
  const badge = badgeEl;

  if (!badge) return;
  badge.style.transition = '';
  badge.style.opacity = '';  // clear any inline opacity hideBadge() set
  gsap.killTweensOf(badge);
  badge._tiltHovered = false;
  gsap.fromTo(badge,
    { opacity: 0, rotate: 25, scale: 0.9 },
    { opacity: 1, rotate: -12.46, scale: 1, duration: 0.5, ease: "back.out(4)" }
  );
}

function hideAward() {
  awardVisible = false;
  awardToken++;
  lastHideTime = performance.now();
  const award = awardEl;

  if (!award) return;
  gsap.killTweensOf(award);
  gsap.to(award, { opacity: 0, duration: 0.15, ease: "power1.out", overwrite: true });
  award.style.transition = '';
}

// Pills fade in one after another. One staggered tween (not a timer per pill), so
// it can be cancelled if you scroll back out mid-animation — the old timers could
// fire after the pills were hidden and leave the last pill stuck visible.
function animateWorkNavIn(delay = 0) {
  gsap.to(workNavPills, {
    opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.08, overwrite: true, delay,
    onComplete: updateWorkNav
  });
}

workNavPills.forEach(pill => {

pill.addEventListener('click', () => {
  const target = parseInt(pill.dataset.index);
    const current = ((Math.round(offset) % N) + N) % N;
    // already in front: just give its graphics their hop (badge/award stay as they are)
    if (target === current) { jostleCardGraphics(cards[target]); return; }
  hideAward();
  hideBadge(); // ← add this

    let delta = target - current;
    if (delta > N / 2) delta -= N;
    if (delta < -N / 2) delta += N;

    const destination = Math.round(offset) + delta;
    // same smooth slow-down as a flick, bent to land on the chosen card
    const duration = 0.6 + 0.12 * Math.abs(destination - offset);
    glideTo(destination, 3 * (destination - offset) / duration, duration, {
      // the card's hover animation plays as it's pulling in (not once it's fully still)
      nearAt: 0.4,   // 40% of the glide's time ≈ 78% of the way there
      onNear: () => jostleCardGraphics(cards[((destination % N) + N) % N]),
      onArrive: () => {
        updateWorkNav();
        const settled = ((destination % N) + N) % N;
        if (settled === PENT_UP_INDEX) showAward();
        if (settled === SETTLYFE_INDEX) showBadge();
      },
    });
  });
});

// Continuous redraw for hover lift
let workSectionVisible = false;
let lastHighlightOffset = null;
ScrollTrigger.create({
  trigger: ".third-section",
  start: "top bottom",
  end: "bottom top",
  onToggle: (self) => { workSectionVisible = self.isActive; }
});

function renderLoop() {
  requestAnimationFrame(renderLoop);
  if (!workSectionVisible || document.hidden) return;

  let liftMoving = false;
  cards.forEach(card => {
    const target = card._targetLift || 0;
    card._currentLift = card._currentLift || 0;
    const diff = target - card._currentLift;
    if (Math.abs(diff) < 0.05) {
      if (card._currentLift === target && card._shadowCleared) return;
      card._currentLift = target;
    } else {
      liftMoving = true;
      card._currentLift += diff * 0.12;
    }

    // Calculate how far the card has actually lifted (0 = resting, 1 = fully up)
    const liftProgress = Math.max(0, -card._currentLift / 30); // 30 = max lift amount
    const shadowBlur = liftProgress * 40;
    const shadowY = liftProgress * 20;
    const shadowOpacity = liftProgress * 0.6;

    if (liftProgress > 0.01) {
      card.style.filter = `drop-shadow(0px ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}))`;
      card._shadowCleared = false;
    } else if (!card._shadowCleared) {
      card.style.filter = 'none';
      card._shadowCleared = true;
    }
    liftMoving = true;
  });
  if (liftMoving) layoutCards();

  // Animate award lift in sync with pent up card
  const award = awardEl;

  if (award && awardVisible) {
    award._currentLift = award._currentLift || 0;
    award._targetLift = award._targetLift || 0;
    if (Math.abs(award._targetLift - award._currentLift) > 0.05) {
      award._currentLift += (award._targetLift - award._currentLift) * 0.12;
      gsap.set(award, { y: award._currentLift });
    }
  }
  
const badge = badgeEl;

if (badge) {
  badge._currentLift = badge._currentLift || 0;
  badge._targetLift = badge._targetLift || 0;
  if (Math.abs(badge._targetLift - badge._currentLift) > 0.05) {
    badge._currentLift += (badge._targetLift - badge._currentLift) * 0.12;
    if (gsap.getProperty(badge, 'opacity') > 0.01) {
      gsap.set(badge, { y: badge._currentLift });
    }
  }
}

  if (offset !== lastHighlightOffset) {
    lastHighlightOffset = offset;
    updateWorkNavHighlight();
  }
}
requestAnimationFrame(renderLoop);

// Work-section asterisks: after their spin-in, they rotate as the page scrolls
const FLOWER_SPIN_PER_PX = [0.3, 0.4, 0.35]; // degrees per pixel scrolled, one per asterisk
const flowerEls = Array.from(document.querySelectorAll('.flower-decor'));

function startFlowerScrollSpin(el) {
  el._spinBase = gsap.getProperty(el, 'rotation');
  el._spinScroll0 = lenis.scroll;
  el._spinSet = el._spinSet || gsap.quickSetter(el, 'rotation', 'deg');
  el._spinReady = true;
}

function stopFlowerScrollSpin() {
  flowerEls.forEach(el => { el._spinReady = false; });
}

lenis.on('scroll', () => {
  if (!workSectionVisible) return;
  flowerEls.forEach((el, i) => {
    if (!el._spinReady) return;
    el._spinSet(el._spinBase + (lenis.scroll - el._spinScroll0) * FLOWER_SPIN_PER_PX[i % FLOWER_SPIN_PER_PX.length]);
  });
});

// REPLACE the first ScrollTrigger.create at "top 69.8%" with:
let carouselAnimPlayed = false;
let scrollEnteredWork = false; // 👈 add this


ScrollTrigger.create({
  trigger: ".third-section",
  start: "top 130%", // a bit before section 3 reaches the screen, so the intro is underway as it arrives
onEnter: () => {
      scrollEnteredWork = true; // 👈 add this

    carouselReady = true;
    if (!carouselAnimPlayed) {
      carouselAnimPlayed = true;

      setTimeout(() => {
        offset = -1;
        velX = 1 / 20;
        window._carouselFade = 0;
        carouselEl.style.opacity = '1';
        cancelAnimationFrame(rafId);
        function spinIn() {
          offset += velX;
          velX *= 0.95;
          window._carouselFade = Math.min(1, window._carouselFade + 0.02);
          layoutCards();
          if (Math.abs(velX) > 0.0001) {
            rafId = requestAnimationFrame(spinIn);
          } else {
            offset = Math.round(offset);
            window._carouselFade = 1;
            layoutCards();

            const settled = ((Math.round(offset) % N) + N) % N;
if (settled === PENT_UP_INDEX && scrollEnteredWork) showAward();
if (settled === SETTLYFE_INDEX && scrollEnteredWork) showBadge();
          }
        }
        rafId = requestAnimationFrame(spinIn);
        if (scrollEnteredWork) animateWorkNavIn(0.8); // pills fade in after the cards have started spinning in

      }, 150);  // ← adjust this delay to taste
    }
    gsap.fromTo('.bubble-decor',
      { opacity: 0, y: 30 },
      { opacity: THIRD_DECOR_OPACITY, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.2, overwrite: true }
    );
    stopFlowerScrollSpin();
    gsap.fromTo('.flower-decor',
      { opacity: 0, y: 20, scale: 0.2, rotation: 0 },
      { opacity: THIRD_DECOR_OPACITY, y: 0, scale: 1.5, rotation: 2160, duration: 2.5, ease: "expo.out", delay: 0.2, overwrite: true,
        // each asterisk hands off to scroll-spinning once its own spin-in finishes
        stagger: { each: 0.15, onComplete() { startFlowerScrollSpin(this.targets()[0]); } }
      }
    );
  },
onLeaveBack: () => {
      scrollEnteredWork = false; // 👈 add this
    stopFlowerScrollSpin();

    carouselAnimPlayed = false;
    carouselReady = false;
    window._carouselFade = 0;
    carouselEl.style.opacity = '0';
    stopGlide();
    offset = 3;
    velX = 0;
    layoutCards();
    hideAward();
    hideBadge();
    // Hard reset badge and award to avoid stuck state
    gsap.killTweensOf(badgeEl);
    gsap.killTweensOf(awardEl);
    if (badgeEl) { badgeEl.style.opacity = '0'; badgeEl.style.transition = ''; }
    if (awardEl) { awardEl.style.opacity = '0'; awardEl.style.transition = ''; }
      if (badgeEl) { badgeEl._currentLift = 0; badgeEl._targetLift = 0; }
    if (awardEl) { awardEl._currentLift = 0; awardEl._targetLift = 0; }  
  const pills = workNavPills;
    gsap.to(pills, { opacity: 0, duration: 0.3, overwrite: true }); // also cancels a fade-in still in progress
    pills.forEach(pill => pill.classList.remove('active'));
    gsap.to('.bubble-decor, .flower-decor', {
      opacity: 0, y: 20, duration: 0.4, stagger: 0.06, ease: "power2.in", overwrite: true
    });
    gsap.to('.flower-decor', { opacity: 0, y: 20, rotation: 0, scale: 1.5, duration: 0.4, overwrite: true });
  }
});


document.querySelectorAll('.footer-anim').forEach(el => {
  el.style.transitionDelay = '';
  el.style.transition = '';
});

// (the block itself only drifts up — each line does its own fade + slide. The
// block used to fade in too, which hid the first line's slide: it moved while
// the whole block was still nearly invisible.)
gsap.set("#footer-main-content", { y: 20 });
gsap.set('.footer-anim', { opacity: 0, y: 40 });
gsap.set(".footer-star-wrapper", { opacity: 0, scale: 0.6 });

ScrollTrigger.create({
  trigger: ".footer-section", 
  start: "top 75%",
  onEnter: () => {
    gsap.to("#footer-main-content", { y: 0, duration: 1.0, ease: "power2.out", overwrite: 'auto' });
    gsap.to('#footer-main-content .footer-anim', { 
      opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out", overwrite: 'auto',
      onComplete: () => {
        const btn = document.querySelector('.btn-touch');
        if (btn) btn.style.pointerEvents = 'auto';
      }
    });
    gsap.to('.footer-left .footer-anim', { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out", delay: 0.3, overwrite: 'auto' });
    gsap.to('.footer-right .footer-anim', { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out", delay: 0.3, overwrite: 'auto' });
    gsap.to(".footer-star-wrapper", { opacity: 1, scale: 1, rotation: "+=720", duration: 1.5, ease: "expo.out", overwrite: 'auto' });
  },
  onLeaveBack: () => {
    gsap.to("#footer-main-content", { y: 20, duration: 0.6, ease: "power2.in", overwrite: 'auto' });
    gsap.to('.footer-anim', { opacity: 0, y: 20, duration: 0.6, stagger: 0.15, ease: "power2.in", overwrite: 'auto' });
    gsap.to(".footer-star-wrapper", { opacity: 0, scale: 0.6, duration: 1, ease: "power2.in", overwrite: 'auto' });
  }
});

ScrollTrigger.create({
  trigger: ".footer-section",
  start: "top 85%",
  end: "top 75%",
  onEnter: () => {
    spinStarLandUpright();
    gsap.to(".nav-center-star", { opacity: 0, duration: 0.6 });
  },
  onLeaveBack: () => {
    gsap.killTweensOf("#footer-main-content");
    gsap.killTweensOf('.footer-anim');
    gsap.killTweensOf(".footer-star-wrapper");
    // (the block itself only drifts up — each line does its own fade + slide. The
// block used to fade in too, which hid the first line's slide: it moved while
// the whole block was still nearly invisible.)
gsap.set("#footer-main-content", { y: 20 });
    gsap.set('.footer-anim', { opacity: 0, y: 20 });
    gsap.set(".footer-star-wrapper", { opacity: 0, scale: 0.6 });
  }
});

const navStarContainer = document.querySelector('.nav-center-star');
const navStarIcon = document.getElementById('nav-star-icon');

if (navStarContainer && navStarIcon) {
  navStarContainer.addEventListener('mouseenter', () => {
    gsap.killTweensOf(navStarIcon);
    const currentRotation = gsap.getProperty(navStarIcon, "rotation") || 0;
    gsap.to(navStarIcon, { rotation: currentRotation + 720, duration: 2.5, ease: "power2.out", overwrite: "auto" });
  });
}

// The orbit turns one full circle every 2 minutes. It's updated in the water
// ticker below at 30fps (in step with the water lines) instead of 60fps — at
// this speed the difference is invisible, and the hero redraws half as often.
const setOrbitRotation = gsap.quickSetter(".hero-orbit-inner", "rotation", "deg");
const setScrollArrowBob = gsap.quickSetter(".id-scroll-arrow svg", "y", "px"); // the svg bobs; its wrapper does the intro/fade

// ============================================
// ONLY ANIMATE WHAT'S ON SCREEN
// Looping animations keep the browser redrawing the whole page every frame,
// even when you can't see them. Each section's loops pause while it's off screen.
// ============================================
let section2Active = false;

function setHeroActive(on) {
  heroVisible = on;                 // water ripple lines + orbit spin (see water ticker)
  // Once scrolled past, the hero layers are faded to fully transparent — but
  // transparent layers still take graphics memory. Switching them off frees it
  // (the page was going over Chrome's limit, making parts of section 2 vanish).
  document.body.classList.toggle('hero-offscreen', !on);
}

function setSection2Active(on) {
  section2Active = on;              // diamond pattern + water surface
  // At the very top, the hero completely covers section 2 — switch section 2's
  // layers off there so hero + section 2 don't overflow graphics memory together.
  document.body.classList.toggle('section2-offscreen', !section2Zone.isActive);
  fishData.forEach((d) => gsap.getTweensOf(d.wrapper).forEach((t) => t.paused(!on)));
}

const heroZone = ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: -1,                        // active right from the top of the page
  end: "35% top",                   // hero has fully faded by here
  onToggle: (self) => setHeroActive(self.isActive),
});

const section2Zone = ScrollTrigger.create({
  start: 1,                         // section 2 starts showing with the first scroll
  endTrigger: ".third-section",
  end: "top top",                   // fully slid away by here
  onToggle: (self) => setSection2Active(self.isActive),
});

const footerZone = ScrollTrigger.create({
  trigger: ".footer-section",
  start: "top bottom",
  end: "bottom top",
  onToggle: (self) => footerStarSpin.paused(!self.isActive),
});

function syncActiveZones() {
  setHeroActive(heroZone.isActive);
  setSection2Active(section2Zone.isActive);
  footerStarSpin.paused(!footerZone.isActive);
}
syncActiveZones();
ScrollTrigger.addEventListener('refresh', syncActiveZones);

function playHeroOrbitIn() {
  gsap.killTweensOf(".hero-orbit");
  gsap.set(".hero-orbit", { autoAlpha: 0, scale: 0.75, rotation: 0 });
  gsap.to(".hero-orbit", { autoAlpha: 1, scale: 0.9, rotation: "+=150", duration: 1.5, ease: "expo.out" });
}

// The hero window used to be a CSS mask that had to be re-applied in many places.
// It's now drawn once on a canvas (see drawHeroWindow), so there's nothing to restore.
function restoreScalingRigMask() {}

const projectCards = document.querySelectorAll(".project-card");
const thirdDecor = document.querySelectorAll(".third-decor");

document.addEventListener('DOMContentLoaded', () => {
  const whoNavLink = document.querySelector('.nav-swap[data-default="who"]');
  if (whoNavLink) {
    whoNavLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.fishtankPanels?.open('who');   // opens over the homepage (js/panels.js)
    });
  }
  const playNavLink = document.querySelector('.nav-swap[data-default="play"]');
  if (playNavLink) {
    playNavLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.fishtankPanels?.open('play');
    });
  }
  // footer "with me!" button → contact page
  document.querySelector('.btn-touch')?.addEventListener('click', (e) => {
    e.preventDefault();
    wipeToPage('contact/', '[ say hi ]');
  });
});

// After ALL ScrollTrigger setup, handle hash load clean state
window.addEventListener('load', () => {
  if (window.location.hash === '#third-section') {
    setTimeout(() => {
      gsap.set(".scaling-rig", { 
        scale: 10, 
        autoAlpha: 0,
        clearProps: "filter,willChange"
      });
      gsap.set([".hero-peek-layer", ".hero-halo", ".hero-orbit"], { 
        autoAlpha: 0,
        clearProps: "filter,willChange"
      });
      gsap.set(".hero-identity-frame", { 
        autoAlpha: 0,
        clearProps: "filter,willChange" 
      });
      gsap.set([".fish-clown-1", ".fish-clown-2", ".fish-tang"], { 
        autoAlpha: 0,
        clearProps: "filter,willChange"
      });
      gsap.set(".hero-star", { autoAlpha: 0 });
      gsap.set("#blackCover, .section-2-backdrop-black", { opacity: 1 });
      onPageScrollLayout();
      gsap.killTweensOf(badgeEl);
gsap.killTweensOf(awardEl);
if (badgeEl) { badgeEl.style.opacity = '0'; badgeEl._currentLift = 0; badgeEl._targetLift = 0; }
if (awardEl) { awardEl.style.opacity = '0'; awardEl._currentLift = 0; awardEl._targetLift = 0; }
      ScrollTrigger.refresh();
    }, 800);
  }
  // Fix nav visibility when skipping the intro
if (skipIntro) {
  gsap.set('#navWrap', { opacity: 1 });
  document.getElementById('navPill').classList.add('expanded');
}
});




// TRACKPAD SWIPES on the carousel.
// While your fingers are on the trackpad, the carousel follows them 1:1. The
// moment you let go, macOS keeps sending "coasting" events that fade out slowly
// — that fade used to be followed, then corrected, which caused the lull + nudge.
// Now, as soon as the events start fading, we take the current speed and glide
// onto a card ourselves, and ignore the rest of the fade (unless your fingers
// come back: a reversal, or the swipe speeding up again).
const wheelSwipe = { mode: 'idle', lastT: 0, dir: 0, mags: [], fading: 0, timer: 0 };
function carouselWheel(dx) {
  const w = wheelSwipe;
  const now = performance.now();
  const mag = Math.abs(dx), dir = Math.sign(dx);
  const prev = w.mags.length ? w.mags[w.mags.length - 1] : 0;
  if (now - w.lastT > (w.mode === 'coast' ? 350 : 140)) {   // a brand-new swipe
    w.mode = 'track'; w.mags = []; w.fading = 0;
    motionSamples.length = 0;
  }
  w.lastT = now;

  if (w.mode === 'coast') {
    const reversed = dir !== w.dir && mag > 2;
    const speedingUp = mag >= 4 && mag > Math.max(...w.mags.slice(-3), 0) * 1.2;
    w.mags.push(mag); if (w.mags.length > 8) w.mags.shift();
    if (!reversed && !speedingUp) return;   // just the fade-out: ignore
    w.mode = 'track'; w.fading = 0; motionSamples.length = 0;
  } else {
    w.mags.push(mag); if (w.mags.length > 8) w.mags.shift();
  }

  // following the fingers
  hideAward();
  hideBadge();
  isInteracting = true;
  if (glide) stopGlide();
  if (!motionSamples.length) sampleMotion();
  offset += dx / 360;
  w.dir = dir;
  sampleMotion();
  layoutCards();

  // the fade has started (5 events in a row each no bigger than the last)?
  const peak = Math.max(...w.mags);
  w.fading = mag <= prev && prev > 0 ? w.fading + 1 : 0;
  clearTimeout(w.timer);
  if (w.fading >= 5 && mag < peak * 0.85) { letGoOfWheel(); return; }
  // or the events simply stopped (no coasting, or a mouse wheel)
  w.timer = setTimeout(() => { if (w.mode === 'track') letGoOfWheel(); }, 70);
}
function letGoOfWheel() {
  wheelSwipe.mode = 'coast';
  clearTimeout(wheelSwipe.timer);
  settleFrom(releaseVelocity());
}

window.addEventListener('wheel', (e) => {
  const overCarousel = carouselEl.contains(e.target) || e.target === carouselEl;

  if (overCarousel) {
    e.preventDefault();
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) carouselWheel(e.deltaX);
    return;
  }

  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    e.preventDefault();
    lenis.scrollTo(lenis.scroll + e.deltaX * 0.8, { immediate: false });
  }
}, { passive: false });

const diamondPattern = document.querySelector('.diamond-pattern');
let diamondOffset = 0;
let lastDiamondTime = performance.now();
let diamondTileW = 0; // width of one pattern tile on screen

// The pattern element is one tile wider than the screen; we slide it with a
// transform and wrap every tile-width, which looks identical to scrolling the
// background but doesn't force the browser to repaint the whole layer each frame.
function measureDiamondTile() {
  if (!diamondPattern || !diamondImg.naturalHeight) return;
  diamondTileW = diamondImg.naturalWidth * (diamondPattern.offsetHeight / diamondImg.naturalHeight);
  diamondPattern.style.left = `-${diamondTileW}px`;
  diamondPattern.style.width = `calc(100% + ${diamondTileW}px)`;
}
const diamondImg = new Image();
diamondImg.onload = measureDiamondTile;
diamondImg.src = 'https://melodysz.github.io/baubles/fish/diamond%20pattern.webp';
window.addEventListener('resize', measureDiamondTile);

gsap.ticker.add(() => {
  const now = performance.now();
  const delta = now - lastDiamondTime;
  lastDiamondTime = now;
  if (!diamondPattern || !diamondTileW || document.hidden || !section2Active) return;
  diamondOffset = (diamondOffset + delta * 0.015) % diamondTileW; // speed: lower = slower, raise to taste
  diamondPattern.style.transform = `translate3d(${diamondOffset}px, 0, 0)`;
});


ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "3% top",
  onEnter: () => {
    document.getElementById('scrollHint').classList.add('hidden');
  },
onLeaveBack: () => {
  if (!pageReady) return; // add this line at the top
  gsap.set(".scaling-rig", { scale: 1, autoAlpha: 1 });
restoreScalingRigMask();
    document.getElementById('scrollHint').classList.remove('hidden');
  }
});

let frameCount = 0;
gsap.ticker.add((time) => {
  if (document.hidden) return;

  lenis.raf(time * 1000);

  // water updates every 2nd frame — imperceptible but halves the work
  if (frameCount % 2 === 0) {
    const t = (performance.now() - waterT0) / 1000;

    if (heroVisible) {
      setOrbitRotation((t / 120) * 360 % 360);
      setScrollArrowBob(Math.sin((t / 1.8) * Math.PI * 2) * 4); // gentle 4px bob every 1.8s
    }

    if (waterEl && heroVisible) {
      const a = (t / 10) * Math.PI * 2;
      waterEl.style.setProperty("--wx", `${Math.cos(a) * 14}px`);
      waterEl.style.setProperty("--wy", `${Math.sin(a) * 14}px`);
    }
  }

  frameCount++;
});

ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "top top",
onLeaveBack: () => {
    gsap.to(".scaling-rig", { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" });
    gsap.to([".hero-peek-layer", ".hero-halo", ".hero-orbit"], { opacity: 1, autoAlpha: 1, duration: 0.4, ease: "power2.out" });
    gsap.to(".water-lines", { opacity: 1, duration: 0.4, ease: "power2.out" });
    gsap.set(".sky-text-images", { autoAlpha: 0 });
    gsap.set("#sky-text-container", { autoAlpha: 0 });
    gsap.to(".hero-identity-frame", { opacity: 1, autoAlpha: 1, duration: 0.4, ease: "power2.out" });
    if (heroLineElements) {
      heroLineElements.forEach(line => {
        line.style.opacity = 1;
        line.style.transform = 'translateY(0px)';
      });
    }
gsap.set(".fish-clown-1", { x: 0, autoAlpha: 1, scale: 1 });
gsap.set(".fish-clown-2", { x: 0, autoAlpha: 1, scale: 1 });
gsap.set(".fish-tang",   { x: 0, autoAlpha: 1, scale: 1 });
    restoreScalingRigMask(); // ← add this
    gsap.set(".hero-star", { autoAlpha: 1 });
  },
onEnterBack: () => {
    const scrollY = window.scrollY;
    const scrollTracker = document.querySelector('.scroll-tracker');
    const trackerHeight = scrollTracker ? scrollTracker.offsetHeight : 0;
    const trackerTop = scrollTracker ? scrollTracker.offsetTop : 0;
    // Only restore hero if we're back at the very top (hero section)
    // scroll-tracker is 200vh, hero is only visible in first ~30% of it
    const heroEnd = trackerTop + trackerHeight * 0.30;
    if (scrollY > heroEnd) return;
    gsap.set('.scaling-rig', { scale: 1, autoAlpha: 1, clearProps: 'filter,willChange' });
    restoreScalingRigMask();
    gsap.set(['.hero-peek-layer', '.hero-halo', '.hero-orbit'], { autoAlpha: 1 });
    gsap.set('.hero-identity-frame', { autoAlpha: 1 });
    playHeroFishIn();
    playHeroOrbitIn();
    playHeroIdentityIn();
  }
});