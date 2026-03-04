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
    
    // NEW: Force reset the scaling rig mask completely
setTimeout(() => {
  const scalingRig = document.querySelector('.scaling-rig');
  if (scalingRig) {
    scalingRig.style.webkitMaskImage = "url('https://raw.githubusercontent.com/melodysz/baubles/main/mask.png')";
    scalingRig.style.maskImage = "url('https://raw.githubusercontent.com/melodysz/baubles/main/mask.png')";
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

    // Initialize hero elements to their default state
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

let lenis;

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

gsap.set('.sec2-bubble, .sec2-flower', { opacity: 0, y: 20 });
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
  const hasHash = window.location.hash;
  
  if (hasHash) {
    const introScreen = document.querySelector('.intro-screen');
    if (introScreen) introScreen.style.display = 'none';
    setTimeout(() => {
      const targetSection = document.querySelector(hasHash);
      if (targetSection) targetSection.scrollIntoView({ behavior: 'instant' });
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
            scalingRig.style.filter = "brightness(0.25) blur(18px)";
          }
          
          const obj = { r: 0 };

          function applyMask(rPx) {
            introScreen.style.webkitMaskImage = `radial-gradient(circle at center, transparent ${rPx}px, black ${rPx + featherPx}px)`;
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
  gsap.to('.nav-left', { opacity: 1, duration: 0.4, ease: "power2.out" });
  gsap.to('.nav-right a', { opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" });
  gsap.to('.nav-center-star', { opacity: 1, duration: 0.1, ease: "none", onComplete: () => {
    gsap.to('.nav-center-star', { rotation: "+=720", duration: 1.5, ease: "expo.out" });
  }});

                const scalingRig = document.querySelector('.scaling-rig');
                if (scalingRig) {
                  scalingRig.style.webkitMaskImage = "url('https://raw.githubusercontent.com/melodysz/baubles/main/mask.png')";
                  scalingRig.style.maskImage = "url('https://raw.githubusercontent.com/melodysz/baubles/main/mask.png')";
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
              }
              
              if (scalingRig && t < 0.90) {
                const blurAmount = 18 * (1 - Math.pow(t, 1.9));
                const bright = 0.25 + 0.75 * Math.pow(t, 0.6);
                scalingRig.style.filter = `brightness(${bright}) blur(${blurAmount}px)`;
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

gsap.set(".hero-peek-layer", { autoAlpha: 1, scale: 1, force3D: true });

const waterEl = document.querySelector(".water-lines");
let waterT0 = performance.now();

if (waterEl) {
  gsap.ticker.add(() => {
    const t = (performance.now() - waterT0) / 1000;
    const a = (t / 10) * Math.PI * 2;
    waterEl.style.setProperty("--wx", `${Math.cos(a) * 14}px`);
    waterEl.style.setProperty("--wy", `${Math.sin(a) * 14}px`);
  });
}

const waterSurface = document.querySelector(".water-surface");
if (waterSurface) {
  gsap.ticker.add(() => {
    const t = (performance.now() - waterT0) / 1000;
    const a = (t / 6) * Math.PI * 2;
    waterSurface.style.transform = `translate(calc(-50% + ${Math.cos(a) * 4}px), ${Math.sin(a) * 3}px)`;
  });
}

gsap.set([".fish-clown-1", ".fish-clown-2", ".fish-tang"], { autoAlpha: 0, transformOrigin: "50% 50%" });
gsap.set('.hero-orbit', { autoAlpha: 0, scale: 0.92, rotation: 0 });
gsap.set('.hero-halo', { autoAlpha: 0 });

lenis = new Lenis({ 
  lerp: 0.15,
  duration: 1.0,
  smoothWheel: true,
  wheelMultiplier: 0.7,
  touchMultiplier: 1.5
});

let pageReady = false;

setTimeout(() => {
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
      // Always restore the mask FIRST before anything else
      restoreScalingRigMask();

      lenis.raf(performance.now());
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });

      const scrollY = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollRatio = scrollY / docHeight;

      // Only restore hero state if we're actually near the top
      if (scrollRatio < 0.05) {
        gsap.set('.scaling-rig', { scale: 1, autoAlpha: 1, filter: 'none' });
        gsap.set(['.hero-peek-layer', '.hero-halo'], { autoAlpha: 1, scale: 1 });
        gsap.set('.hero-orbit', { autoAlpha: 1, scale: 0.9 });
        gsap.set('.hero-identity-frame', { autoAlpha: 1 });
        gsap.set(['.fish-clown-1', '.fish-clown-2', '.fish-tang'], { x: 0, autoAlpha: 1, scale: 1 });
        gsap.set('.hero-star', { autoAlpha: 1 });
        // Re-apply mask after gsap.set (gsap can wipe inline styles)
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

      // Final mask insurance after ScrollTrigger.update() runs
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
    
        // ADD THIS - force repaint when nearly at top
    if (p < 0.05) {
      const scalingRig = document.querySelector('.scaling-rig');
      if (scalingRig) {
        scalingRig.style.willChange = 'auto';
        scalingRig.style.transform = 'translateZ(0)';
        void scalingRig.offsetHeight; // force reflow
        scalingRig.style.willChange = 'transform';
      }
    }
    
    // Hero text fade
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
    
    // Scaling rig - NO BLUR
    gsap.set(".scaling-rig", {
      scale: Math.min(1 + (p * 9), 10),
      opacity: 1 - (p * 1.2)
    });
    
    // Background layers
    gsap.set([".hero-peek-layer", ".hero-halo", ".hero-orbit"], {
      opacity: Math.max(0, 1 - (p * 2))
    });
    
    gsap.set(".water-lines", { opacity: Math.max(0, 1 - (p * 3)) });
    gsap.set("#sky-text-container", { autoAlpha: p > 0.05 ? 1 : 0 });

    // Sky text images
    if (p < 0.10) {
      gsap.set(".sky-text-images", { autoAlpha: 0 });
    } else {
      gsap.set(".sky-text-images", { autoAlpha: gsap.utils.clamp(0, 1, (p - 0.10) / 0.15) });
    }
    
    // Identity frame - NO BLUR
    if (p > 0.02) {
      gsap.set(".hero-identity-frame", {
        opacity: Math.max(0, 1 - (((p - 0.02) / 0.98) * 10))
      });
    }
    
    // Fish - NO BLUR
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
    // Set opacity first without triggering visibility/display changes
    gsap.set(".hero-star", { opacity: 0 });
    gsap.to(".hero-star", { 
      rotation: 0, opacity: 1, duration: 0.8, 
      ease: "power2.out", force3D: true, overwrite: true 
    });
  }
});

// Pre-promote compositor layers
gsap.set([".sky-text-images", ".dangles-decor", ".sec2-bubble", ".sec2-flower", ".hero-star"], {
  force3D: true
});

gsap.ticker.add((time) => {
  if (!document.hidden) lenis.raf(time * 1000);
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

window.addEventListener("mouseenter", () => cursorMain.classList.add("active"));
window.addEventListener("mouseleave", () => cursorMain.classList.remove("active"));

window.addEventListener('mousemove', (e) => {
  cursorMain.classList.add('active');
  gsap.to(cursorMain, { left: e.clientX + 'px', top: e.clientY + 'px', duration: 0.1 });
  if (Math.hypot(e.clientX - lastMouseX, e.clientY - lastMouseY) > 25) {
    createBubble(e.clientX, e.clientY);
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }
});

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

window.addEventListener("pointermove", (e) => {
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const hovered = elements.find(el => {
    if (el.id === 'cursor' || el.classList.contains('bubble-particle') || el.closest(".nav-center-star")) return false;
    return el.matches?.(".interactable, a[href], button, [role='button'], .btn-touch") ||
           el.closest?.(".interactable, a[href], button, [role='button'], .btn-touch");
  });
  const next = !!hovered;
  if (next !== isHovering) {
    isHovering = next;
    gsap.to(cursorMain, { width: next ? '48px' : '12px', height: next ? '48px' : '12px', duration: 0.3, ease: "power2.out" });
  }
});

// Nav name
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

const navItems = document.querySelectorAll('nav, nav a, .nav-center-star');

navName.addEventListener('click', (e) => {
  e.preventDefault();
  
  // If there's a hash, remove it and reload to go home
  if (window.location.hash) {
    window.location.href = window.location.pathname; // Removes hash and reloads
  } else {
    // If already at top, just reload
    const isAtTop = (lenis && lenis.scroll < 50) || window.scrollY < 50;
    if (isAtTop) {
      window.location.reload();
    } else {
      // Scroll to top smoothly
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

// [WORK] nav link - HASH-BASED APPROACH (FIXED)
document.querySelector('.nav-swap[data-default="[WORK]"]').addEventListener('click', (e) => {
  e.preventDefault();
  
  // If we're already at the hash, just scroll there
  if (window.location.hash === '#third-section') {
    lenis.scrollTo('#third-section', { duration: 1.2 });
  } else {
    // Add hash and reload
    window.location.hash = '#third-section';
    window.location.reload();
  }
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
    gsap.to(navItems, { color: "#0313E4", duration: 0.4 });
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

// AFTER
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
    { type: 'fish-visual', y: 20, size: 1.0, zIndex: 3, startX: 0, endX: 80, speed: 1.6 },
    { type: 'fish-canvas', y: 24, size: 0.95, zIndex: 2, startX: 3, endX: 83, speed: 1.8 },
    { type: 'fish-branding', y: 50, size: 1.2, zIndex: 2, startX: 13, endX: 93, speed: 2.0 },
    { type: 'fish-product', y: 65, size: 0.98, zIndex: 1, startX: 7, endX: 87, speed: 1.7 },
    { type: 'fish-narrative', y: 25, size: 1.4, zIndex: 3, startX: -37, endX: 43, speed: 2.2 },
    { type: 'fish-ux', y: 57, size: 1.0, zIndex: 2, startX: -33, endX: 47, speed: 1.9 },
    { type: 'fish-ui', y: 65, size: 1.1, zIndex: 3, startX: -30, endX: 50, speed: 2.0 },
    { type: 'fish-layout', y: 33, size: 0.98, zIndex: 2, startX: -35, endX: 30, speed: 1.8 }
  ];

  const fishData = [];

  fishConfig.forEach(config => {
    const fish = document.createElement('div');
    fish.classList.add('sky-fish', config.type);
    fish.dataset.scale = config.size;
    fishData.push({ element: fish, startX: config.startX, endX: config.endX, y: config.y, speed: config.speed });
    gsap.set(fish, { x: `${config.startX}vw`, y: `${config.y}vh`, scale: config.size, zIndex: config.zIndex, autoAlpha: 1 });
    fishTank.appendChild(fish);
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
        data.element.style.transform = `translate(${xPos}vw, ${data.y}vh) scale(${data.element.dataset.scale})`;
      });
    }
  });
}

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
      { y: -40, opacity: 0 },  // reduced from -60 to lessen travel
      { y: 10, opacity: 1, duration: 0.9, ease: "power3.out", force3D: true },  // removed back.out overshoot
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


let projectCardsReady = false;

function playProjectCardsIn() {
  projectCardsReady = false;
  const cards = document.querySelectorAll(".project-card");
  cards.forEach((card, index) => {
    gsap.to(card, { opacity: 1, y: 0, duration: 0.8, delay: index * 0.15, ease: "back.out(4)", overwrite: true });
  });
  setTimeout(() => { projectCardsReady = true; }, ((cards.length - 1) * 0.15 + 0.8) * 1000);
}

function resetProjectCards() {
  projectCardsReady = false;
  gsap.set(".project-card", { opacity: 0, y: 60 });
}

resetProjectCards();

function startBubbleFloat() {
  document.querySelectorAll('.bubble-decor').forEach((bubble, i) => {
    gsap.to(bubble, {
      y: "-=12",
      duration: 1.8 + i * 0.3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: i * 0.2
    });
  });
}

ScrollTrigger.create({
  trigger: ".third-section",
  start: "top 80%",
  onEnter: () => startBubbleFloat(),
  onLeaveBack: () => {
    gsap.killTweensOf('.bubble-decor');
    gsap.set('.bubble-decor', { y: 20, opacity: 0 });
  },
  once: false
});

ScrollTrigger.create({
  trigger: ".third-section",
  start: "top 95%",
onEnter: () => {
    // Title animates in first
    gsap.to('.third-title .third-anim', {
      opacity: 1, y: 0, duration: 0.8, ease: "power2.out", overwrite: true
    });

// Cards animate in after title
    setTimeout(() => {
      playProjectCardsIn();
    }, 500);

    // Bubbles and flowers after title too
gsap.fromTo('.bubble-decor',
  { opacity: 0, y: 30 },
  { opacity: 1, y: 0, duration: 0.8, stagger: 0.1,
    ease: "power2.out", delay: 0.4, overwrite: true,
    onComplete: () => startBubbleFloat()
  }
);
    gsap.fromTo('.flower-decor', 
      { opacity: 0, y: 20, scale: 0.2, rotation: 0 }, 
      { opacity: 1, y: 0, scale: 1.5, rotation: 2160, duration: 2.5, stagger: 0.15, 
        ease: "expo.out", delay: 0.4, overwrite: true }
    );
  },
onLeaveBack: () => {
    gsap.killTweensOf(".project-card");
    resetProjectCards();
    gsap.set('.third-title .third-anim', { opacity: 0, y: 40 });

    gsap.to('.bubble-decor, .flower-decor', { 
      opacity: 0, y: 20, duration: 0.4, stagger: 0.06, 
      ease: "power2.in", overwrite: true
    });
gsap.to('.flower-decor', { opacity: 0, y: 20, rotation: 0, scale: 1.5, duration: 0.4, overwrite: true });
  },
  once: false
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
    gsap.to('#footer-main-content .footer-anim', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" });
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
  scalingRig.style.webkitMaskImage = "url('https://raw.githubusercontent.com/melodysz/baubles/main/mask.png')";
  scalingRig.style.maskImage = "url('https://raw.githubusercontent.com/melodysz/baubles/main/mask.png')";
  scalingRig.style.webkitMaskSize = 'cover';
  scalingRig.style.maskSize = 'cover';
  scalingRig.style.webkitMaskPosition = 'center';
  scalingRig.style.maskPosition = 'center';
  scalingRig.style.webkitMaskRepeat = 'no-repeat';
  scalingRig.style.maskRepeat = 'no-repeat';
}

const projectCards = document.querySelectorAll(".project-card");
const thirdDecor = document.querySelectorAll(".third-decor");

projectCards.forEach(card => {
  card.addEventListener("mouseenter", () => {
    if (!projectCardsReady) return;    
    card.classList.add("is-hovered");
    projectCards.forEach(c => {
      if (c === card) {
        const tilt = Math.random() > 0.5 ? (Math.random() * 6 + 6).toFixed(2) : -(Math.random() * 6 + 6).toFixed(2);
        gsap.to(c, { filter: "blur(0px)", opacity: 1, scale: 1.18, rotate: tilt, duration: 0.28, ease: "back.out(2.5)", overwrite: true });
      } else {
        gsap.to(c, { filter: "blur(8px)", opacity: 0.4, scale: 1, rotate: 0, duration: 0.15, ease: "power2.out", overwrite: true });
      }
    });
    gsap.to(thirdDecor, { filter: "blur(8px)", opacity: 0.4, duration: 0.15, ease: "power2.out", overwrite: true });
  });

card.addEventListener("mouseleave", () => {
    if (!projectCardsReady) return;
    card.classList.remove("is-hovered");
    gsap.to(projectCards, { filter: "none", opacity: 1, scale: 1, rotate: 0, duration: 0.18, ease: "power2.out", overwrite: true });
    gsap.to(thirdDecor, { filter: "none", opacity: 1, duration: 0.2, ease: "power2.out", overwrite: true });
  });
  
  card.addEventListener('click', () => {
    if (!projectCardsReady) return;
    const index = parseInt(card.getAttribute('data-index'));
    const projectURLs = [
      'pent-up/',
      'https://www.figma.com/proto/JkoTxNMhLWrapPSvopyXEp/portfolio?page-id=310%3A2587&node-id=1089-7447&viewport=-5516%2C392%2C0.36&t=DSUZyNEtafQgqLTf-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=339%3A2991&hide-ui=1',
      'https://www.figma.com/proto/JkoTxNMhLWrapPSvopyXEp/portfolio?page-id=310%3A2587&node-id=1086-7743&viewport=-5516%2C392%2C0.36&t=DSUZyNEtafQgqLTf-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=1086%3A7743&hide-ui=1',
      'https://www.figma.com/proto/JkoTxNMhLWrapPSvopyXEp/portfolio?page-id=310%3A2587&node-id=1089-442&viewport=-5516%2C392%2C0.36&t=DSUZyNEtafQgqLTf-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=339%3A2991&hide-ui=1',
      'https://www.figma.com/proto/JkoTxNMhLWrapPSvopyXEp/portfolio?page-id=310%3A2587&node-id=1064-356&viewport=-5516%2C392%2C0.36&t=DSUZyNEtafQgqLTf-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=1064%3A356&hide-ui=1'
    ];
    if (projectURLs[index] && projectURLs[index] !== '#') {
      if (projectURLs[index].includes('figma.com')) {
        window.open(projectURLs[index], '_blank');
      } else {
        window.location.href = projectURLs[index];
      }
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const whoNavLink = document.querySelector('.nav-right a[data-default="[WHO?]"]');
  if (whoNavLink) {
    whoNavLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('https://www.figma.com/proto/JkoTxNMhLWrapPSvopyXEp/portfolio?page-id=310%3A2587&node-id=852-4986&viewport=-4079%2C1347%2C0.2&t=CsBovf6LvnJhJpB3-1&scaling=scale-down-width&content-scaling=fixed&hide-ui=1', '_blank');
    });
  }
});


// After ALL ScrollTrigger setup, handle hash load clean state
window.addEventListener('load', () => {
  if (window.location.hash === '#third-section') {
    // Wait for ScrollTrigger to fully initialize
    setTimeout(() => {
      // Force ALL hero elements completely off
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
      
      // Now force ScrollTrigger to recalculate from current scroll position
      ScrollTrigger.refresh();
      
    }, 500); // Give ScrollTrigger time to initialize
  }
});

document.querySelector('.btn-touch').addEventListener('click', (e) => {
  e.stopImmediatePropagation();
  e.stopPropagation();
  e.preventDefault();
  window.open('mailto:melodyserenazhang@gmail.com', '_self');
}, true);