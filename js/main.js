if (window.location.hash) {
  document.querySelector('.intro-screen')?.remove();
  document.getElementById('page-entry-overlay')?.remove();
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

// Check for hash IMMEDIATELY
if (window.location.hash) {
  document.documentElement.classList.add('skip-intro');
  document.body.classList.add('skip-intro');
  
  document.addEventListener('DOMContentLoaded', function() {
    const intro = document.querySelector('.intro-screen');
    if (intro) intro.style.display = 'none';
    
    setTimeout(() => {
      const scalingRig = document.querySelector('.scaling-rig');
      if (scalingRig) {
       scalingRig.style.webkitMaskImage = "url('https://melodysz.github.io/baubles/mask.png')";
scalingRig.style.maskImage = "url('https://melodysz.github.io/baubles/mask.png')";
        scalingRig.style.webkitMaskSize = 'cover';
        scalingRig.style.maskSize = 'cover';
        scalingRig.style.webkitMaskPosition = 'center';
        scalingRig.style.maskPosition = 'center';
        scalingRig.style.webkitMaskRepeat = 'no-repeat';
        scalingRig.style.maskRepeat = 'no-repeat';
      }

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
gsap.set('.bubble-decor, .flower-decor', { opacity: 0, y: 20 });
gsap.set('.dangles-decor', { y: -50, opacity: 0 });

function playHeroIdentityIn() {
  const heroLines = [
    ".id-top-left .id-accent", ".id-top-left .id-big", ".id-top-left .id-small",
    ".id-bottom-right .id-small", ".id-bottom-right .id-big", ".id-bottom-right .id-tagline"
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

  if (hasHash) {
    const introScreen = document.querySelector('.intro-screen');
    if (introScreen) introScreen.style.display = 'none';
setTimeout(() => {
  if (hasHash === '#third-section') {
    const thirdSection = document.querySelector('#third-section');
    const nav = document.querySelector('nav');
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;
    const sectionTop = thirdSection.offsetTop - navHeight + 50;
    window.scrollTo({ top: sectionTop, behavior: 'instant' });
  } else {
    const targetSection = document.querySelector(hasHash);
    if (targetSection) targetSection.scrollIntoView({ behavior: 'instant' });
  }
}, 100);
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
        
        setTimeout(() => {
          introScreen.style.background = '#000000';
          introScreen.style.opacity = '1';
          introScreen.style.zIndex = '5000';
          introScreen.style.willChange = 'opacity, -webkit-mask-image, mask-image';

          const scalingRig = document.querySelector('.scaling-rig');
          const w = window.innerWidth;
          const h = window.innerHeight;
          const maxR = Math.ceil(Math.sqrt(w*w + h*h));
          const featherPx = 18;

          if (scalingRig) {
            scalingRig.style.willChange = "filter";
scalingRig.style.filter = "brightness(0.25)";
          }
          
          const obj = { r: 0 };

          function applyMask(rPx) {
           const r = Math.round(rPx); introScreen.style.webkitMaskImage = `radial-gradient(circle at center, transparent ${rPx}px, black ${rPx + featherPx}px)`;
            introScreen.style.maskImage = `radial-gradient(circle at center, transparent ${rPx}px, black ${rPx + featherPx}px)`;
          }

          applyMask(obj.r);

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

  const scalingRig = document.querySelector('.scaling-rig');
  if (scalingRig) {
    scalingRig.style.webkitMaskImage = "url('https://melodysz.github.io/baubles/mask.png')";
    scalingRig.style.maskImage = "url('https://melodysz.github.io/baubles/mask.png')";
    scalingRig.style.webkitMaskSize = 'cover';
    scalingRig.style.maskSize = 'cover';
    scalingRig.style.webkitMaskPosition = 'center';
    scalingRig.style.maskPosition = 'center';
    scalingRig.style.webkitMaskRepeat = 'no-repeat';
    scalingRig.style.maskRepeat = 'no-repeat';
  }

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
              if (scalingRig) gsap.set(scalingRig, { filter: "none", willChange: "" });
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

  // Animate dots one by one, then start ripple
  // Wait for Xanh Mono to load before showing intro text
  const introText = document.querySelector('.intro-text');
  introText.style.opacity = '0';

  document.fonts.load("italic 1.6rem 'Xanh Mono'").finally(() => {
    introText.style.opacity = '1';

    const dotsEl = document.getElementById('intro-dots');
    let dotCount = 0;
    const dotInterval = setInterval(() => {
      dotCount++;
      dotsEl.textContent = '.'.repeat(dotCount);
      if (dotCount >= 3) {
        clearInterval(dotInterval);
        setTimeout(() => startRippleTransition(), 800);
      }
    }, 300);
  });
});

gsap.registerPlugin(ScrollTrigger);

gsap.set('.sky-text-images .sky-anim', { opacity: 0, y: 40, force3D: true });

gsap.set(".hero-peek-layer", { autoAlpha: 1, scale: 1, force3D: true });

const waterEl = document.querySelector(".water-lines");
let waterT0 = performance.now();


const waterSurface = document.querySelector(".water-surface");
let waterDrift = 0; // tracks scroll-driven offset separately



ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "10% top",
  end: "75% top",
  scrub: 3.0,        // slightly laggier than the border for a layered feel
  onUpdate: (self) => {
    waterDrift = self.progress * 6;  // max 6vh — a touch more than the border's 4vh
  }
});

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

      if (safe('.section-2-wrapper')) {
        const thirdSection = document.querySelector('.third-section');
        const thirdTop = thirdSection ? thirdSection.offsetTop : 0;
        gsap.set('.section-2-wrapper', { y: scrollY >= thirdTop ? '-100vh' : '0vh' });
      }

      if (safe('#blackCover')) {
        if (scrollRatio < 0.55) gsap.set('#blackCover', { opacity: 0 });
        else if (scrollRatio > 0.80) gsap.set('#blackCover', { opacity: 1 });
        else gsap.set('#blackCover', { opacity: (scrollRatio - 0.55) / 0.25 });
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

ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "top top",
  end: "30% top",
  scrub: 0.3,
  onUpdate: (self) => {
    if (!pageReady) return;
    
    const now = performance.now();
    if (now - lastHeroUpdate < HERO_UPDATE_INTERVAL) return;
    lastHeroUpdate = now;
    
    const p = self.progress;
    
    if (p < 0.05) {
      const scalingRig = document.querySelector('.scaling-rig');
      if (scalingRig) {
        scalingRig.style.willChange = 'auto';
        scalingRig.style.transform = 'translateZ(0)';
        void scalingRig.offsetHeight;
        scalingRig.style.willChange = 'transform';
      }
    }
    
    if (p < 0.33) {
      const textP = p / 0.33;
      if (!heroLineElements) {
        heroLineElements = document.querySelectorAll(
          ".id-top-left .id-accent, .id-top-left .id-big, .id-top-left .id-small, " +
          ".id-bottom-right .id-small, .id-bottom-right .id-big, .id-bottom-right .id-tagline"
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
ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "top top",
  end: "20% top",
  scrub: 0.5,
  onUpdate: (self) => {
    const p = self.progress;
    document.body.style.setProperty("--gradient-y", `${50 - (p * 50)}%`);
    document.body.style.setProperty("--pink-stop", `${0 + (p * 3)}%`);
    document.body.style.setProperty("--blue-mid-stop", `${15 + (p * 25)}%`);
    document.body.style.setProperty("--blue-dark-stop", `${60 + (p * 15)}%`);
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

requestAnimationFrame(() => {
  const thirdSection = document.querySelector(".third-section");
  if (!thirdSection) return;
  const rect = thirdSection.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.7) playProjectCardsIn();
});

// Cursor
const cursorMain = document.getElementById('cursor');
let lastMouseX = 0, lastMouseY = 0, isHovering = false;
let isBlobMode = false;
let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

function animateCursor() {
  curX += (mouseX - curX) * 0.12;
  curY += (mouseY - curY) * 0.12;
  cursorMain.style.left = curX + 'px';
  cursorMain.style.top = curY + 'px';
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

window.addEventListener("mouseenter", () => cursorMain.classList.add("active"));
window.addEventListener("mouseleave", () => cursorMain.classList.remove("active"));

function createBubble(x, y) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble-particle';
  document.body.appendChild(bubble);
  const baseSize = isHovering ? 6 : 4;
  bubble.style.width = (Math.random() * baseSize + baseSize) + 'px';
  bubble.style.height = bubble.style.width;
  bubble.style.left = x + 'px';
  bubble.style.top = y + 'px';
  gsap.to(bubble, {
    top: (y - (40 + Math.random() * 60)) + 'px',
    left: (x + (Math.random() * 30 - 15)) + 'px',
    opacity: 0, width: '2px', height: '2px',
    duration: 1.2 + Math.random() * 0.8,
    ease: "power1.out",
    onComplete: () => bubble.remove()
  });
}

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorMain.classList.add('active');
  if (!isBlobMode) {
    if (Math.hypot(e.clientX - lastMouseX, e.clientY - lastMouseY) > 25) {
      createBubble(e.clientX, e.clientY);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  }
});

window.addEventListener("pointermove", (e) => {
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const hovered = elements.find(el => {
    if (el.id === 'cursor' || el.classList.contains('bubble-particle')) return false;
    if (el.classList.contains('project-card') || el.closest('.project-card')) return false;
    return el.matches?.("a[href], button, [role='button'], .btn-touch, .work-nav-pill") ||
           el.closest?.("a[href], button, [role='button'], .btn-touch, .work-nav-pill");
  });
if (hovered && !isBlobMode) expandToBlob(hovered, false);
  else if (!hovered && isBlobMode) shrinkBlob();
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
  if (window.location.hash) {
    window.location.href = window.location.pathname;
  } else {
    const isAtTop = (lenis && lenis.scroll < 50) || window.scrollY < 50;
    if (isAtTop) {
      window.location.reload();
    } else {
      lenis.scrollTo(0, { duration: 1.2 });
    }
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
  const originalText = link.textContent.trim();
  link.innerHTML = `<span class="nav-inner">${originalText}</span>`;
  const inner = link.querySelector('.nav-inner');
  const defaultText = link.getAttribute('data-default') || originalText;
  const hoverText = link.getAttribute('data-hover') || originalText;
  inner.style.display = "inline-block";
  inner.style.willChange = "transform, opacity";
  inner.textContent = defaultText;

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

// [WORK] nav link
document.querySelector('.nav-swap[data-default="work"]').addEventListener('click', (e) => {
  e.preventDefault();
  const thirdSection = document.querySelector('#third-section');
  const sectionTop = thirdSection.offsetTop;
  gsap.set('#blackCover', { opacity: 0 });
  
  gsap.set('.scaling-rig', { scale: 10, autoAlpha: 0, clearProps: 'filter,willChange' });
  gsap.set(['.hero-peek-layer', '.hero-halo', '.hero-orbit'], { autoAlpha: 0 });
  gsap.set('.hero-identity-frame', { autoAlpha: 0 });
  gsap.set(['.fish-clown-1', '.fish-clown-2', '.fish-tang'], { autoAlpha: 0 });
  gsap.set('.hero-star', { autoAlpha: 0 });
  gsap.set('.section-2-wrapper', { y: '-100vh' });
  restoreScalingRigMask();
  
  lenis.scrollTo(sectionTop, { duration: 1.2 });
});

gsap.to("#footer-star-icon", { rotation: 360, duration: 25, ease: "none", repeat: -1 });

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

gsap.to("#blackCover", {
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

ScrollTrigger.create({
  trigger: ".footer-section",
  start: "top 50%",
  end: "bottom 50%",
  onEnter: () => gsap.to(navItems, { color: "#D1FFA4", duration: 0.4 }),
  onLeaveBack: () => gsap.to(navItems, { color: "#E7A0FE", duration: 0.4 })
});

ScrollTrigger.create({
  trigger: ".third-section",
  start: "top 50%",
  end: "bottom 50%",
  onEnter: () => gsap.to(navItems, { color: "#E7A0FE", duration: 0.4 }),
  onLeaveBack: () => gsap.to(navItems, { color: "#83E7FF", duration: 0.4 })
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
const r = Math.round(0 + (p * 0));
const g = Math.round(1 + (p * 109));
const b = Math.round(128 + (p * 105));
const centerOpacity = Math.min(1, p * 3);
workFooterGradient.style.background = `radial-gradient(ellipse ${w}% ${h}% at 50% 100%, rgba(${r}, ${g}, ${b}, ${centerOpacity}) 0%, rgba(${r}, ${g}, ${b}, ${centerOpacity}) 5%, #000180 ${midStop}%, #000000 ${darkStop}%)`;
  }
});

gsap.fromTo("#footer-main-content", 
  { scale: 0.8, opacity: 0.3 }, 
  { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: ".footer-section", start: "top bottom", end: "top top", scrub: true } }
);

gsap.fromTo("#footer-bottom-content", 
  { scale: 0.9, opacity: 0 }, 
  { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: ".footer-section", start: "70% bottom", end: "bottom bottom", scrub: true } }
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
    document.body.style.setProperty("--pink-stop", `${3 - (p * 2)}%`);
    document.body.style.setProperty("--blue-mid-stop", `${40 - (p * 25)}%`);
    document.body.style.setProperty("--blue-dark-stop", `${75 - (p * 50)}%`);
  }
});

const skyText = document.getElementById("skyRevealText");
const fishTank = document.getElementById('fish-tank');
const section2Wrapper = document.querySelector('.section-2-wrapper');

ScrollTrigger.create({
  trigger: ".third-section",
  start: "top bottom",
  end: "top center",
  scrub: 1,
  onUpdate: (self) => {
    const p = self.progress;
    section2Wrapper.style.transform = `translateY(${-100 * p}vh)`;
    if (fishTank) fishTank.style.opacity = 1 - p;
  }
});

if (fishTank) {
  fishTank.innerHTML = '';
  
  const fishConfig = [
    { type: 'fish-visual',    y: 20, size: 1.0,  zIndex: 3, startX: 0,   endX: 80, speed: 1.6 },
    { type: 'fish-canvas',    y: 24, size: 0.95, zIndex: 2, startX: 3,   endX: 83, speed: 1.8 },
    { type: 'fish-branding',  y: 50, size: 1.2,  zIndex: 2, startX: 13,  endX: 93, speed: 2.0 },
    { type: 'fish-product',   y: 65, size: 0.98, zIndex: 1, startX: 7,   endX: 87, speed: 1.7 },
    { type: 'fish-narrative', y: 25, size: 1.4,  zIndex: 3, startX: -37, endX: 43, speed: 2.2 },
    { type: 'fish-ux',        y: 57, size: 1.0,  zIndex: 2, startX: -33, endX: 47, speed: 1.9 },
    { type: 'fish-ui',        y: 65, size: 1.1,  zIndex: 3, startX: -30, endX: 50, speed: 2.0 },
    { type: 'fish-layout',    y: 33, size: 0.98, zIndex: 2, startX: -35, endX: 30, speed: 1.8 }
  ];

  const fishData = [];

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
 
  
  ScrollTrigger.create({
    trigger: ".scroll-tracker",
    start: "0% top",
    end: "75% top",
    scrub: 0.3,
onUpdate: (self) => {
      if (!pageReady) return;
      fishData.forEach(data => {
        const xPos = data.startX + ((data.endX - data.startX) * self.progress * data.speed);
        data.wrapper.style.transform = `translate(${xPos}vw, ${data.y}vh)`;
      });
    }
});

//   fishData.forEach(data => {
//     data.element.addEventListener('mouseenter', () => {
//       gsap.to(data.element, {
//         scale: parseFloat(data.element.dataset.scale) * 1.15,
//         duration: 0.5,
//         ease: "back.out(3)",
//         overwrite: true
//       });
//     });

//     data.element.addEventListener('mouseleave', () => {
//       gsap.to(data.element, {
//         scale: parseFloat(data.element.dataset.scale),
//         duration: 0.4,
//         ease: "back.out(2)",
//         overwrite: true
//       });
//     });
//   });

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
    .fromTo('.dangles-decor', 
      { y: -40, opacity: 0 },
      { y: 10, opacity: 1, duration: 0.9, ease: "power3.out", force3D: true },
      0.1
    )
    .to('.sec2-bubble, .sec2-flower', { 
      opacity: 1, y: 0, duration: 0.6, stagger: 0.08, 
      ease: "power2.out", force3D: true 
    }, 0.25);
  },
  onLeaveBack: () => {
    gsap.to('.sky-text-images .sky-anim', { opacity: 0, y: 40, duration: 0.4, stagger: 0.1, ease: "power2.in", force3D: true, overwrite: true });
    gsap.to('.dangles-decor', { y: -40, opacity: 0, duration: 0.4, ease: "power2.in", force3D: true, overwrite: true });
    gsap.to('.sec2-bubble, .sec2-flower', { opacity: 0, y: 20, duration: 0.4, stagger: 0.06, ease: "power2.in", force3D: true, overwrite: true });
  }
});

const carouselEl = document.getElementById('circularCarousel');
const cards = Array.from(carouselEl.querySelectorAll('.project-card'));


const N = cards.length;

const projectURLs = [
  'https://melodysz.github.io/fishtank/deep24/',
  'https://melodysz.github.io/fishtank/knouri/',
  'https://melodysz.github.io/fishtank/pent-up/',
  '',
];

let offset = 0;
let dragging = false;
let startX = 0;
let startOffset = 0;
let velX = 0;
let lastX = 0;
let didDrag = false;
let rafId;
let carouselReady = false;
let spinToAborted = false;
let isInteracting = false;
const awardEl = document.querySelector('.pent-up-award');
const badgeEl = document.querySelector('.coming-soon-badge');
const workNavPills = document.querySelectorAll('.work-nav-pill');

function layoutCards() {
  cards.forEach((card, i) => {
    let pos = i - offset;
    // Wrap into (-N/2, N/2] — using strict less-than avoids the boundary flip at exactly N/2
    pos = ((pos % N) + N) % N;
    if (pos > N / 2) pos -= N;

    const absDist = Math.abs(pos);
    const angle = pos * 26;
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
}

function snapToNearest() {
  cancelAnimationFrame(rafId);
  velX = 0;
  const target = Math.round(offset);
  function step() {
    const remaining = target - offset;
    if (Math.abs(remaining) < 0.001) {
      offset = target;
      layoutCards();
      return;
    }
    offset += remaining * 0.14;
    layoutCards();
    rafId = requestAnimationFrame(step);
  }
  rafId = requestAnimationFrame(step);
}

// REPLACE applyMomentum entirely:
function applyMomentum() {
  hideAward();
  cancelAnimationFrame(rafId);
  
  const target = Math.round(offset + velX * 8);
  const distToTarget = target - offset;
  velX = distToTarget * 0.18;
  
  function step() {
    offset += velX;
    velX *= 0.82;
    layoutCards();
    
    if (Math.abs(velX) > 0.0001) {
      rafId = requestAnimationFrame(step);
} else {
  offset = target;
  velX = 0;
  isInteracting = false;
  layoutCards();
  updateWorkNav();
const settled = ((target % N) + N) % N;
if (settled === 2) {
  const myToken = ++awardToken;
  setTimeout(() => {
    if (myToken === awardToken && !isInteracting) showAward();
  }, 0);
}
if (settled === 3) {
  const myToken = ++awardToken;
  setTimeout(() => {
    if (myToken === awardToken && !isInteracting) showBadge();
  }, 0);
}
}
  }
  step();
}

carouselEl.addEventListener('pointerdown', (e) => {
  if (!carouselReady) return;
  isInteracting = true;
  spinToAborted = true;
  // hideAward();
  // hideBadge();
  dragging = true;
  didDrag = false;
  startX = e.clientX; startOffset = offset; velX = 0; lastX = e.clientX;
  carouselEl.setPointerCapture(e.pointerId);
  cancelAnimationFrame(rafId);
});

carouselEl.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  if (Math.abs(e.clientX - startX) > 6) {
    didDrag = true;
    hideAward();
    hideBadge(); // ← only hides once actual drag movement detected
  }
  const rawDelta = -(e.clientX - lastX) / 360;
  velX = rawDelta;
  offset += rawDelta;
  lastX = e.clientX;
  layoutCards();
});

carouselEl.addEventListener('pointerup', (e) => {
  if (!dragging) return;
  dragging = false;
  if (!didDrag) {
    // Use elementFromPoint to find what's visually under the click
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const clickedCard = el?.closest('.project-card');
    if (clickedCard) {
      const idx = ((Math.round(offset) % N) + N) % N;
      const url = projectURLs[clickedCard.getAttribute('data-index')];
      if (url) navigateTo(url);
    }
    return;
  }
  applyMomentum();
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
  cancelAnimationFrame(rafId);
}, { passive: true });

carouselEl.addEventListener('touchmove', (e) => {
  if (!dragging) return;
  const dx = e.touches[0].clientX - startX;
  if (Math.abs(dx) > 6) {
    didDrag = true;
    hideAward(); // ← add this
  }
  velX = -(e.touches[0].clientX - lastX) / 360;
  offset = startOffset - dx / 360;
  lastX = e.touches[0].clientX;
  layoutCards();
}, { passive: false });

carouselEl.addEventListener('touchend', () => {
  if (!dragging) return;
  dragging = false;
  lenis.start();
  
  if (!didDrag) {
    const idx = ((Math.round(offset) % N) + N) % N;
    const url = projectURLs[cards[idx]?.getAttribute('data-index')];
    if (url) navigateTo(url);
    return;
  }
  applyMomentum();
});

window._carouselFade = 0;
carouselEl.style.opacity = '0';
layoutCards();

carouselEl.addEventListener('mousemove', (e) => {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const hoveredCard = el?.classList.contains('project-card') ? el : el?.closest('.project-card');
  cards.forEach(card => { card._targetLift = card === hoveredCard ? -30 : 0; });
  
  // Move award with pent up card when it's hovered
  const pentUpCard = cards[2];
  const award = awardEl;
  if (award && awardVisible) {
    pentUpCard._targetLift === pentUpCard._targetLift; // already set above
    award._targetLift = award._targetLift || 0;
    award._targetLift = (hoveredCard === pentUpCard) ? -50 : 0;
  }
  
  const iproDentalCard = cards[3];
const badge = badgeEl;
if (badge) {
  badge._targetLift = (hoveredCard === iproDentalCard) ? -50 : 0;
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
  cards.forEach(card => { card._targetLift = 0; });
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
  });
}

function updateWorkNav() {
  updateWorkNavHighlight();
}

let awardVisible = false;
let awardToken = 0;
let lastHideTime = 0;

function showAward() {
  // if (performance.now() - lastHideTime < 500) return;
  awardVisible = true;
  const award = awardEl;

  if (award) {
    gsap.killTweensOf(award);
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

function animateWorkNavIn() {
  const pills = workNavPills;

  pills.forEach((pill, i) => {
    setTimeout(() => {
      gsap.to(pill, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out",
        onComplete: () => {
          if (i === pills.length - 1) setTimeout(() => updateWorkNav(), 50);
        }
      });
    }, i * 80);
  });
}

workNavPills.forEach(pill => {

pill.addEventListener('click', () => {
  hideAward();
  hideBadge(); // ← add this
  spinToAborted = false;
  const target = parseInt(pill.dataset.index);
    const current = ((Math.round(offset) % N) + N) % N;
    if (target === current) return;

    let delta = target - current;
    if (delta > N / 2) delta -= N;
    if (delta < -N / 2) delta += N;

    const destination = Math.round(offset) + delta;
    cancelAnimationFrame(rafId);
    velX = (destination - offset) * 0.18;

function spinTo() {
  if (spinToAborted) return;
  offset += velX;
  velX *= 0.82;
  layoutCards();
  if (Math.abs(destination - offset) > 0.001) {
    rafId = requestAnimationFrame(spinTo);
  } else {
    offset = destination;
    velX = 0;
    layoutCards();
    updateWorkNav();
const settled = ((destination % N) + N) % N;
if (settled === 2) showAward();
if (settled === 3) showBadge();
  }
}
    rafId = requestAnimationFrame(spinTo);
  });
});

// Continuous redraw for hover lift
function renderLoop() {
  cards.forEach(card => {
    const target = card._targetLift || 0;
    card._currentLift = card._currentLift || 0;
    card._currentLift += (target - card._currentLift) * 0.12;

    // Calculate how far the card has actually lifted (0 = resting, 1 = fully up)
    const liftProgress = Math.max(0, -card._currentLift / 30); // 30 = max lift amount
    const shadowBlur = liftProgress * 40;
    const shadowY = liftProgress * 20;
    const shadowOpacity = liftProgress * 0.6;

    if (liftProgress > 0.01) {
      card.style.filter = `drop-shadow(0px ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}))`;
    } else {
      card.style.filter = 'none';
    }
  });
  layoutCards();

  // Animate award lift in sync with pent up card
  const award = awardEl;

  if (award && awardVisible) {
    award._currentLift = award._currentLift || 0;
    award._targetLift = award._targetLift || 0;
    award._currentLift += (award._targetLift - award._currentLift) * 0.12;
    const currentY = gsap.getProperty(award, 'y') || 0;
    gsap.set(award, { y: award._currentLift });
  }
  
const badge = badgeEl;

if (badge) {
  badge._currentLift = badge._currentLift || 0;
  badge._targetLift = badge._targetLift || 0;
  badge._currentLift += (badge._targetLift - badge._currentLift) * 0.12;
  if (gsap.getProperty(badge, 'opacity') > 0.01) {
    gsap.set(badge, { y: badge._currentLift });
  }
}

  updateWorkNavHighlight();
  requestAnimationFrame(renderLoop);
}
requestAnimationFrame(renderLoop);

// REPLACE the first ScrollTrigger.create at "top 69.8%" with:
let carouselAnimPlayed = false;

ScrollTrigger.create({
  trigger: ".third-section",
  start: "top 100%",
  onEnter: () => {
    carouselReady = true;
    if (!carouselAnimPlayed) {
      carouselAnimPlayed = true;
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
          setTimeout(() => animateWorkNavIn(), 400);
          const settled = ((Math.round(offset) % N) + N) % N;
          if (settled === 2) showAward();
          if (settled === 3) showBadge();
        }
      }
      rafId = requestAnimationFrame(spinIn);
      setTimeout(() => animateWorkNavIn(), 400);
    }
    gsap.fromTo('.bubble-decor',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.4, overwrite: true }
    );
    gsap.fromTo('.flower-decor',
      { opacity: 0, y: 20, scale: 0.2, rotation: 0 },
      { opacity: 1, y: 0, scale: 1.5, rotation: 2160, duration: 2.5, stagger: 0.15, ease: "expo.out", delay: 0.4, overwrite: true }
    );
  },
onLeaveBack: () => {
    carouselAnimPlayed = false;
    carouselReady = false;
    window._carouselFade = 0;
    carouselEl.style.opacity = '0';
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
    pills.forEach(pill => {
      gsap.to(pill, { opacity: 0, duration: 0.3 });
      pill.classList.remove('active');
    });
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

gsap.set("#footer-main-content", { opacity: 0, y: 20 });
gsap.set('.footer-anim', { opacity: 0, y: 40 });
gsap.set(".footer-star-wrapper", { opacity: 0, scale: 0.6 });

ScrollTrigger.create({
  trigger: ".footer-section", 
  start: "top 75%",
  onEnter: () => {
    gsap.to("#footer-main-content", { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" });
    gsap.to('#footer-main-content .footer-anim', { 
      opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out",
      onComplete: () => {
        const btn = document.querySelector('.btn-touch');
        if (btn) btn.style.pointerEvents = 'auto';
      }
    });
    gsap.to('.footer-left .footer-anim', { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out", delay: 0.3 });
    gsap.to('.footer-right .footer-anim', { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out", delay: 0.3 });
    gsap.to(".footer-star-wrapper", { opacity: 1, scale: 1, rotation: "+=720", duration: 1.5, ease: "expo.out" });
  },
  onLeaveBack: () => {
    gsap.to("#footer-main-content", { opacity: 0, y: 20, duration: 0.6, ease: "power2.in" });
    gsap.to('.footer-anim', { opacity: 0, y: 20, duration: 0.6, stagger: 0.15, ease: "power2.in" });
    gsap.to(".footer-star-wrapper", { opacity: 0, scale: 0.6, duration: 1, ease: "power2.in" });
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
    gsap.set("#footer-main-content", { opacity: 0, y: 20 });
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

gsap.to(".hero-orbit-inner", { rotation: 360, duration: 120, ease: "none", repeat: -1 });

function playHeroOrbitIn() {
  gsap.killTweensOf(".hero-orbit");
  gsap.set(".hero-orbit", { autoAlpha: 0, scale: 0.75, rotation: 0 });
  gsap.to(".hero-orbit", { autoAlpha: 1, scale: 0.9, rotation: "+=150", duration: 1.5, ease: "expo.out" });
}

function restoreScalingRigMask() {
  const scalingRig = document.querySelector('.scaling-rig');
  if (!scalingRig) return;
scalingRig.style.webkitMaskImage = "url('https://melodysz.github.io/baubles/mask.png')";
scalingRig.style.maskImage = "url('https://melodysz.github.io/baubles/mask.png')";
  scalingRig.style.webkitMaskSize = 'cover';
  scalingRig.style.maskSize = 'cover';
  scalingRig.style.webkitMaskPosition = 'center';
  scalingRig.style.maskPosition = 'center';
  scalingRig.style.webkitMaskRepeat = 'no-repeat';
  scalingRig.style.maskRepeat = 'no-repeat';
}

const projectCards = document.querySelectorAll(".project-card");
const thirdDecor = document.querySelectorAll(".third-decor");

document.addEventListener('DOMContentLoaded', () => {
  const whoNavLink = document.querySelector('.nav-swap[data-default="who"]');
  if (whoNavLink) {
    whoNavLink.addEventListener('click', (e) => {
      e.preventDefault();
     navigateTo('/fishtank/who/');
    });
  }
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
      gsap.set("#blackCover", { opacity: 1 });
      gsap.set(".section-2-wrapper", { y: "-100vh" });
      gsap.killTweensOf(badgeEl);
gsap.killTweensOf(awardEl);
if (badgeEl) { badgeEl.style.opacity = '0'; badgeEl._currentLift = 0; badgeEl._targetLift = 0; }
if (awardEl) { awardEl.style.opacity = '0'; awardEl._currentLift = 0; awardEl._targetLift = 0; }
      ScrollTrigger.refresh();
    }, 800);
  }
  // Fix nav visibility when skipping intro via hash
if (window.location.hash) {
  gsap.set('#navWrap', { opacity: 1 });
  document.getElementById('navPill').classList.add('expanded');
}
});


document.querySelector('.btn-touch').addEventListener('click', () => {
  navigator.clipboard.writeText('melodyserenazhang@gmail.com');
  const btn = document.querySelector('.btn-touch');
  const original = btn.textContent;
  btn.textContent = 'copied!';
  setTimeout(() => btn.textContent = original, 2000);
});

window.addEventListener('wheel', (e) => {
  const overCarousel = carouselEl.contains(e.target) || e.target === carouselEl;

  if (overCarousel) {
    e.preventDefault();
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      hideAward();
hideBadge(); // ← add this
      cancelAnimationFrame(rafId);
      velX = e.deltaX / 600;
      offset += e.deltaX / 360;
      layoutCards();
      clearTimeout(window._carouselSnapTimer);
      window._carouselSnapTimer = setTimeout(() => applyMomentum(), 80);
    }
    return;
  }

  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    e.preventDefault();
    lenis.scrollTo(lenis.scroll + e.deltaX * 0.8, { immediate: false });
  }
}, { passive: false });

const diamondPattern = document.querySelector('.diamond-pattern');
ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "10% top",
  end: "75% top",
  scrub: 2.5,
  onUpdate: (self) => {
    if (!diamondPattern) return;
    const drift = self.progress * 5;
    diamondPattern.style.transform = `translateY(${drift}vh)`;
  }
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

    if (waterEl) {
      const a = (t / 10) * Math.PI * 2;
      waterEl.style.setProperty("--wx", `${Math.cos(a) * 14}px`);
      waterEl.style.setProperty("--wy", `${Math.sin(a) * 14}px`);
    }

    if (waterSurface) {
      const a = (t / 6) * Math.PI * 2;
      waterSurface.style.transform = `translate(calc(-50% + ${Math.cos(a) * 4}px), calc(${Math.sin(a) * 3}px + ${waterDrift}vh))`;
    }
  }

  frameCount++;
});

ScrollTrigger.create({
  trigger: ".scroll-tracker",
  start: "top top",
  onLeaveBack: () => {
    gsap.set(".scaling-rig", { scale: 1, opacity: 1 });
    gsap.set([".hero-peek-layer", ".hero-halo", ".hero-orbit"], { opacity: 1 });
    gsap.set(".water-lines", { opacity: 1 });
    gsap.set(".sky-text-images", { autoAlpha: 0 });
    gsap.set("#sky-text-container", { autoAlpha: 0 });
    gsap.set(".hero-identity-frame", { opacity: 1 });
    gsap.set([".hero-peek-layer", ".hero-halo", ".hero-orbit"], { autoAlpha: 1 });
gsap.set(".hero-identity-frame", { autoAlpha: 1 });
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