const entryOverlay = document.getElementById('page-entry-overlay');
if (entryOverlay) {
  gsap.to(entryOverlay, {
    opacity: 0,
    duration: 1.0,
    delay: 0.2,
    ease: "power2.inOut",
    onComplete: () => entryOverlay.remove()
  });
}

// Animate hero image in first, then logo + tagline
gsap.set('.hero-image', { opacity: 0, y: 20 });
gsap.to('.hero-image', {
  opacity: 1,
  y: 0,
  duration: 1.6,
  ease: "power2.out",
  delay: 0.4
});

// Animate hero logo + tagline in on page load
const heroLines = document.querySelectorAll('.hero-identity-line');
gsap.set(heroLines, { opacity: 0, y: 15 });
gsap.to(heroLines, {
  opacity: 1,
  y: 0,
  duration: 0.9,
  ease: "power2.out",
  stagger: 0.15,
  delay: 1.2  // starts after the entry overlay fades
});

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ===============================
// LENIS SMOOTH SCROLL (GLOBAL)
// ===============================

const lenis = new Lenis({
  lerp: 0.15,
  smoothWheel: true,
  wheelMultiplier: 0.7,
  touchMultiplier: 1.5,
  infinite: false,
  syncTouch: true
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

lenis.on('scroll', (e) => {
  ScrollTrigger.update();
});

ScrollTrigger.defaults({ markers: false });

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  lenis.scrollTo(0, { immediate: true });
  ScrollTrigger.refresh();
});


// ===============================
// CUSTOM CURSOR (NO SCALING - SIZE CHANGE)
// ===============================

const cursorMain = document.getElementById('cursor');
let lastMouseX = 0;
let lastMouseY = 0;
let isHovering = false;

window.addEventListener("mouseenter", () => {
  cursorMain.classList.add("active");
});

window.addEventListener("mouseleave", () => {
  cursorMain.classList.remove("active");
});

window.addEventListener('mousemove', (e) => {
  const { clientX: x, clientY: y } = e;

  cursorMain.classList.add('active');
  gsap.to(cursorMain, { 
    left: x + 'px',
    top: y + 'px',
    duration: 0.1 
  });
});

window.addEventListener("pointermove", (e) => {
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const hovered = elements.find(el => {
    if (el.id === 'cursor' || el.classList.contains('bubble-particle')) {
      return false;
    }
    if (el.closest(".nav-center-star")) return false;

    return el.matches?.(".interactable, a[href], button, [role='button']") ||
           el.closest?.(".interactable, a[href], button, [role='button']");
  });

  const next = !!hovered;
  if (next !== isHovering) {
    isHovering = next;
    gsap.to(cursorMain, {
      width: next ? '48px' : '12px',
      height: next ? '48px' : '12px',
      duration: 0.3,
      ease: "power2.out"
    });
  }
});

// ===================================
// HOME PAGE NAV INTERACTIONS
// ===================================

const navName = document.getElementById('nav-name');
const nameInner = navName.querySelector('.name-inner');

navName.addEventListener('mouseenter', () => {
  gsap.to(nameInner, { 
    y: -10, 
    opacity: 0, 
    duration: 0.2, 
    onComplete: () => {
      nameInner.textContent = "MELODY";
      Object.assign(nameInner.style, { 
        fontFamily: "'Helvetica Neue', sans-serif", 
        fontSize: "0.85rem", 
        letterSpacing: "0.05em", 
        textTransform: "uppercase" 
      });
      gsap.fromTo(nameInner, 
        { y: 10, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.3 }
      );
    }
  });
});

navName.addEventListener('mouseleave', () => {
  gsap.to(nameInner, { 
    y: 10, 
    opacity: 0, 
    duration: 0.2, 
    onComplete: () => {
      nameInner.textContent = "美迪";
      Object.assign(nameInner.style, { 
        fontFamily: "'Zen Old Mincho', serif", 
        fontSize: "1.2rem", 
        letterSpacing: "0.05em", 
        textTransform: "none" 
      });
      gsap.fromTo(nameInner, 
        { y: -10, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.3 }
      );
    }
  });
});

// Nav swap links
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
    const w = Math.ceil(Math.max(w1, w2)) + 2;
    link.style.width = `${w}px`;
    inner.textContent = defaultText;
  }

  lockNavWidth();
  window.addEventListener("resize", lockNavWidth);

  link.addEventListener('mouseenter', () => {
    gsap.to(inner, {
      y: -10,
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        inner.textContent = hoverText;
        gsap.fromTo(inner, 
          { y: 10, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.3 }
        );
      }
    });
  });

  link.addEventListener('mouseleave', () => {
    gsap.to(inner, {
      y: 10,
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        inner.textContent = defaultText;
        gsap.fromTo(inner, 
          { y: -10, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.3 }
        );
      }
    });
  });
});

// ===============================
// NAV STAR HOVER SPIN
// ===============================

const navStarContainer = document.querySelector('.nav-center-star');
const navStarIcon = document.getElementById('nav-star-icon');

if (navStarContainer && navStarIcon) {
  navStarContainer.addEventListener('mouseenter', () => {
    gsap.killTweensOf(navStarIcon);

    const currentRotation =
      gsap.getProperty(navStarIcon, "rotation") || 0;

    gsap.to(navStarIcon, {
      rotation: currentRotation + 720,
      duration: 2.5,
      ease: "power2.out",
      overwrite: "auto"
    });
  });
}


// ===================================
// SIDEBAR NAV SCROLL SPY
// ===================================

const sections = document.querySelectorAll('.content-section');
const navItems = document.querySelectorAll('.nav-item');
const subNavLinks = document.querySelectorAll('.nav-subsections a');

function updateActiveNav() {
  const scrollPos = window.scrollY + 200;

  const mainSections = ['overview', 'research', 'design', 'launch', 'reflection'];
  let currentSection = '';

  mainSections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section && section.offsetTop <= scrollPos) {
      currentSection = sectionId;
    }
  });

  navItems.forEach(item => {
    item.classList.remove('active');
    const link = item.querySelector('.nav-link');
    if (link && link.getAttribute('href') === `#${currentSection}`) {
      item.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

function getAbsoluteTop(el) {
  let top = 0;
  while (el) {
    top += el.offsetTop;
    el = el.offsetParent;
  }
  return top;
}

document.querySelectorAll('.sidebar-nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    const targetId = href.substring(1);
    
    const validSections = ['overview', 'research', 'design', 'launch', 'reflection'];
    
    if (!validSections.includes(targetId)) {
      console.log('Not a main section:', targetId);
      return;
    }
    
    const target = document.querySelector(`section#${targetId}.content-section`);
    
    if (!target) {
      console.log('Target not found:', targetId);
      return;
    }
    
    console.log('Scrolling to:', targetId);
    
    let offset;
    switch(targetId) {
      case 'overview':
        offset = -50;
        break;
      case 'research':
        offset = 15;
        break;
      case 'design':
        offset = 10;
        break;
      case 'launch':
        offset = -150;
        break;
      case 'reflection':
        offset = -150;
        break;
      default:
        offset = -150;
    }
    
    lenis.scrollTo(`#${targetId}`, {
      offset: offset,
      immediate: true
    });
    
    navItems.forEach(item => {
      item.classList.remove('active');
      const link = item.querySelector('.nav-link');
      if (link && link.getAttribute('href') === href) {
        item.classList.add('active');
      }
    });
  });
});


// Show sidebar after scrolling past Overview title
ScrollTrigger.create({
  trigger: ".overview-section .section-title",
  start: "top 80%",
  end: "bottom top",
  onEnter: () => {
    document.querySelector('.sidebar-nav').classList.add('visible');
  },
  onLeaveBack: () => {
    document.querySelector('.sidebar-nav').classList.remove('visible');
  }
});

// ===================================
// IMAGE MODAL FOR PROTO-PERSONAS
// ===================================

const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const personaImages = document.querySelectorAll('.persona-image');
const closeModal = document.querySelector('.modal-close');

personaImages.forEach(img => {
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
// IMAGE LOADING - SKELETON TO FADE
// ===================================

function handleImageLoad(img) {
  img.classList.add('loaded');
  
  const container = img.closest('.dilemma-image, .unsent-project-image, .sidechat-image, .persona-card, .market-audit-image, .large-image-section, .ideation-image-section, .prototype-image, .hero-section');
  if (container) {
    container.classList.add('image-loaded');
  }
}

document.querySelectorAll('img').forEach(img => {
  if (img.complete && img.naturalHeight !== 0) {
    handleImageLoad(img);
  } else {
    img.addEventListener('load', () => handleImageLoad(img));
    img.addEventListener('error', () => {
      console.warn('Image failed to load:', img.src);
      handleImageLoad(img);
    });
  }
});


// ===================================
// SCROLL FADE-IN ANIMATIONS
// ===================================

const fadeElements = document.querySelectorAll('.overview-block, .stamp-card, .results-circle, .conclusion-circle, .market-audit-image, .unsent-project-image, .sidechat-image, .unsent-analysis, .sidechat-analysis, .dilemma-row, .market-audit-text, .dilemma-text, .personas-intro, .ideation-section, .ideation-image-section, .ideation-quote, .user-flow-section, .userflow-image-section, .lofi-section, .midfi-section, .wireframe-grid img, .mascot-exploration-section, .mascot-image, .feedback-section, .feedback-grid, .prototype-block');

document.querySelectorAll('.stamp-card').forEach((card, index) => {
  card.style.setProperty('--index', index);
});

const observerOptions = {
  threshold: 0.5,
  rootMargin: '0px 0px -150px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

fadeElements.forEach(element => {
  element.classList.add('fade-in-element');
  fadeObserver.observe(element);
});

document.querySelectorAll('.hero-meta *').forEach(el => {
  el.classList.remove('fade-in-element');
  el.classList.add('visible');
});


// ===================================
// ANIMATED HIGHLIGHTS ON SCROLL
// ===================================

const highlights = document.querySelectorAll('.highlight');

const paragraphGroups = new Map();

highlights.forEach(highlight => {
  const parent = highlight.closest('p, h3, h4, .meta-text, .stamp-text');
  if (!paragraphGroups.has(parent)) {
    paragraphGroups.set(parent, []);
  }
  paragraphGroups.get(parent).push(highlight);
});

paragraphGroups.forEach(group => {
  group.forEach((highlight, index) => {
    highlight.style.transitionDelay = `${index * 0.15}s`;
  });
});

lenis.on('scroll', () => {
  highlights.forEach(highlight => {
    const rect = highlight.getBoundingClientRect();
    const viewH = window.innerHeight;
    
    if (rect.top < viewH && rect.bottom > 0) {
      highlight.classList.add('animate-in');
    }
    
    if (rect.bottom < -1000 || rect.top > viewH + 1000) {
      highlight.classList.remove('animate-in');
    }
  });
});


// ===================================
// FOOTER STAR & NAV STAR INTERACTION
// ===================================

gsap.to("#case-footer-star-icon", { 
  rotation: 360, 
  duration: 25, 
  ease: "none", 
  repeat: -1 
});

function spinStarLandUpright() {
  const star = document.getElementById("nav-star-icon");
  if (!star) return;
  gsap.killTweensOf(star);
  const current = gsap.getProperty(star, "rotation") || 0;
  const normalized = ((current % 360) + 360) % 360;
  const target = current + (360 - normalized) + 360;
  gsap.to(star, {
    rotation: target,
    duration: 3.5,
    ease: "power1.out",
    overwrite: "auto"
  });
}

const footerState = {
  sidebarHidden: false,
  navStarHidden: false,
  footerStarShown: false
};

const SIDEBAR_THRESHOLD  = 350;
const NAVSTAR_THRESHOLD  = 200;
const FOOTSTAR_THRESHOLD = 50;

lenis.on('scroll', (e) => {
  ScrollTrigger.update();

  const footer = document.querySelector('.case-footer');
  if (!footer) return;

  const rect = footer.getBoundingClientRect();
  const viewH = window.innerHeight;
  const distanceFromBottom = viewH - rect.top;

  if (distanceFromBottom > SIDEBAR_THRESHOLD && !footerState.sidebarHidden) {
    footerState.sidebarHidden = true;
    gsap.to('.sidebar-nav', { opacity: 0, duration: 0.3 });
  } else if (distanceFromBottom <= SIDEBAR_THRESHOLD && footerState.sidebarHidden) {
    footerState.sidebarHidden = false;
    gsap.to('.sidebar-nav', { opacity: 1, duration: 0.3 });
  }

  if (distanceFromBottom > NAVSTAR_THRESHOLD && !footerState.navStarHidden) {
    footerState.navStarHidden = true;
    spinStarLandUpright();
    gsap.to(".nav-center-star", { opacity: 0, duration: 0.6 });
    gsap.to(".top-nav", { color: "#FFF3BF", duration: 0.6 });
  } else if (distanceFromBottom <= NAVSTAR_THRESHOLD && footerState.navStarHidden) {
    footerState.navStarHidden = false;
    spinStarLandUpright();
    gsap.to(".nav-center-star", { opacity: 1, duration: 0.6 });
    gsap.to(".top-nav", { color: "var(--nav-orange)", duration: 0.6 });
  }

  if (distanceFromBottom > FOOTSTAR_THRESHOLD && !footerState.footerStarShown) {
    footerState.footerStarShown = true;
    gsap.to(".case-footer-star-wrapper", { 
      opacity: 1, 
      scale: 1, 
      rotation: "+=720", 
      duration: 1.5, 
      ease: "expo.out" 
    });
  } else if (distanceFromBottom <= FOOTSTAR_THRESHOLD && footerState.footerStarShown) {
    footerState.footerStarShown = false;
    gsap.to(".case-footer-star-wrapper", { 
      opacity: 0, 
      scale: 0.6, 
      duration: 1, 
      ease: "power2.in" 
    });
  }
});

// Hero parallax
gsap.to(".hero-image", {
  yPercent: 10,
  filter: "blur(12px)",
  ease: "none",
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "bottom top",
    scrub: true
  }
});

gsap.to(".hero-identity-frame", {
  opacity: 0,
  filter: "blur(4px)",
  ease: "none",
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "100% top",
    scrub: true
  }
});

// hijaking
// (function() {
//   const backdrop = document.querySelector('.final-prototype-backdrop');
//   if (!backdrop) return;

//   const slides = document.querySelectorAll('.proto-slide');
//   const textSlides = document.querySelectorAll('.proto-text-slide');
//   let currentIndex = 0;
//   let isPinned = false;
//   let isTransitioning = false;

//   function goToSlide(index) {
//     if (isTransitioning || index === currentIndex) return;
//     if (index < 0 || index >= slides.length) return;
//     isTransitioning = true;

//     textSlides[currentIndex].classList.remove('active');
//     textSlides[currentIndex].classList.add('exit');
//     slides[currentIndex].classList.remove('active');

//     const prev = currentIndex;
//     currentIndex = index;
//     slides[currentIndex].classList.add('active');

//     setTimeout(() => {
//       textSlides[prev].classList.remove('exit');
//       textSlides[currentIndex].classList.add('active');
//       setTimeout(() => { isTransitioning = false; }, 500);
//     }, 100);
//   }

//   function pin() {
//     if (isPinned) return;
//     isPinned = true;
//     lenis.stop();
//     // Lock scroll position
//     const scrollY = window.scrollY;
//     document.body.style.overflow = 'hidden';
//     document.body.style.position = 'fixed';
//     document.body.style.top = `-${scrollY}px`;
//     document.body.style.width = '100%';
//   }

//   function unpin(direction) {
//     if (!isPinned) return;
//     isPinned = false;
//     const scrollY = Math.abs(parseInt(document.body.style.top || '0'));
//     document.body.style.overflow = '';
//     document.body.style.position = '';
//     document.body.style.top = '';
//     document.body.style.width = '';
//     window.scrollTo(0, scrollY);
//     lenis.start();
//   }

//   document.addEventListener('wheel', (e) => {
//     if (!isPinned) return;
//     e.preventDefault();

//     if (e.deltaY > 0) {
//       if (currentIndex < slides.length - 1) {
//         goToSlide(currentIndex + 1);
//       } else {
//         unpin();
//       }
//     } else {
//       if (currentIndex > 0) {
//         goToSlide(currentIndex - 1);
//       } else {
//         unpin();
//       }
//     }
//   }, { passive: false });

//   lenis.on('scroll', () => {
//     const rect = backdrop.getBoundingClientRect();
//     if (rect.top <= 0 && rect.bottom >= window.innerHeight && !isPinned) {
//       pin();
//     }
//   });
// })();