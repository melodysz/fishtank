// Wait for GSAP and ScrollTrigger to load
// window.addEventListener('load', () => {
//   if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
//     gsap.registerPlugin(ScrollTrigger);
//   } else {
//     console.error('GSAP or ScrollTrigger failed to load!');
//   }
// });

// ===============================
// LENIS SMOOTH SCROLL (GLOBAL)
// ===============================

const lenis = new Lenis({
  lerp: 0.15,
  smoothWheel: true,
  wheelMultiplier: 0.7,
  touchMultiplier: 1.5,
  infinite: false,  // ✅ ADDED
  syncTouch: true   // ✅ ADDED
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ✅ IMPROVED - Better sync
// lenis.on('scroll', (e) => {
//   ScrollTrigger.update();
// });

// ScrollTrigger.defaults({ markers: false });


// ✅ ADDED - Refresh on resize
// let resizeTimer;
// window.addEventListener('resize', () => {
//   clearTimeout(resizeTimer);
//   resizeTimer = setTimeout(() => {
//     ScrollTrigger.refresh();
//   }, 250);
// });

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// window.addEventListener('load', () => {
//   window.scrollTo(0, 0);
//   lenis.scrollTo(0, { immediate: true });
//   ScrollTrigger.refresh();
// });


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

  const dist = Math.hypot(x - lastMouseX, y - lastMouseY);
  if (dist > 15) { 
    createBubble(x, y);
    lastMouseX = x;
    lastMouseY = y;
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

  gsap.to(bubble, {
    top: (y - (40 + Math.random() * 60)) + 'px',
    left: (x + (Math.random() * 30 - 15)) + 'px',
    opacity: 0,
    width: '2px',
    height: '2px',
    duration: 1.2 + Math.random() * 0.8,
    ease: "power1.out",
    onComplete: () => bubble.remove()
  });
}

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

  // ONLY track these 5 main sections
  const mainSections = ['overview', 'research', 'design', 'launch', 'reflection'];
  let currentSection = '';

  // Find which main section we're in
  mainSections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section && section.offsetTop <= scrollPos) {
      currentSection = sectionId;
    }
  });

  // Update nav highlighting
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

// Bulletproof absolute-top: walks the full offsetParent chain.
// Can't pass elements to lenis.scrollTo here because .main-content
// is position:relative, making it the offsetParent for everything
// inside — lenis uses offsetTop internally which would be relative
// to .main-content, not the document. This walks the chain manually.
function getAbsoluteTop(el) {
  let top = 0;
  while (el) {
    top += el.offsetTop;
    el = el.offsetParent;
  }
  return top;
}

// Register ScrollTo plugin
// gsap.registerPlugin(ScrollToPlugin);

// Smooth scroll - ONLY main sections with CUSTOM OFFSETS
document.querySelectorAll('.sidebar-nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    const targetId = href.substring(1);
    
    // ONLY allow the 5 main section IDs - whitelist approach
    const validSections = ['overview', 'research', 'design', 'launch', 'reflection'];
    
    if (!validSections.includes(targetId)) {
      console.log('Not a main section:', targetId);
      return;
    }
    
    // Find the section with this EXACT id using querySelector for precision
    const target = document.querySelector(`section#${targetId}.content-section`);
    
    if (!target) {
      console.log('Target not found:', targetId);
      return;
    }
    
    console.log('Scrolling to:', targetId);
    
    // Custom offset for each section - ADJUST THESE VALUES!
    let offset;
    switch(targetId) {
      case 'overview':
        offset = -50;  // Adjust this for overview
        break;
      case 'research':
        offset = 15;  // Adjust this for research
        break;
      case 'design':
        offset = 10;   // Adjust this for design (needs to skip dilemmas)
        break;
      case 'launch':
        offset = -150;  // Adjust this for launch
        break;
      case 'reflection':
        offset = -150;  // Adjust this for reflection
        break;
      default:
        offset = -150;
    }
    
//     INSTRUCTIONS:
// 1. Test each section one by one
// 2. For each section that lands in the wrong spot, adjust its offset value:
//    - If title is cut off at TOP → make offset MORE NEGATIVE (e.g., -150 → -200)
//    - If you're seeing content BEFORE the section → make offset MORE POSITIVE (e.g., -150 → -100)
//    - If you're landing in dilemmas when clicking design → make design offset MORE POSITIVE (e.g., 200 → 250 → 300)

// 3. Keep adjusting in increments of 50px until each section lands perfectly!
    
lenis.scrollTo(`#${targetId}`, {
  offset: offset,
  immediate: true  // KEEP THIS - it fixes the inconsistency!
});
    
    // Update active state
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
// ScrollTrigger.create({
//   trigger: ".overview-section .section-title",
//   start: "top center",
//   end: "bottom top",
//   onEnter: () => {
//     document.querySelector('.sidebar-nav').classList.add('visible');
//   },
//   onLeaveBack: () => {
//     document.querySelector('.sidebar-nav').classList.remove('visible');
//   }
// });


// Just make sidebar always visible for now
document.querySelector('.sidebar-nav').classList.add('visible');


// ===================================
// IMAGE MODAL FOR PROTO-PERSONAS
// ===================================

const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const personaImages = document.querySelectorAll('.persona-image');
const closeModal = document.querySelector('.modal-close');

// Open modal when clicking persona images
personaImages.forEach(img => {
  img.addEventListener('click', function() {
    modal.classList.add('active');
    modalImg.src = this.src;
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  });
});

// Close modal when clicking X
closeModal.addEventListener('click', () => {
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Re-enable scrolling
});

// Close modal when clicking outside the image
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Close modal with Escape key
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
  
// AFTER — added .prototype-image
const container = img.closest('.dilemma-image, .unsent-project-image, .sidechat-image, .persona-card, .market-audit-image, .large-image-section, .ideation-image-section, .prototype-image, .hero-section');
  if (container) {
    container.classList.add('image-loaded');
  }
}

// Handle all images on the page
document.querySelectorAll('img').forEach(img => {
  if (img.complete) {
    // Image already loaded
    handleImageLoad(img);
  } else {
    // Wait for image to load
    img.addEventListener('load', () => handleImageLoad(img));
    
    // Handle load errors
    img.addEventListener('error', () => {
      console.warn('Image failed to load:', img.src);
      handleImageLoad(img); // Still remove skeleton even on error
    });
  }
});

// ===================================
// RELOCATE DOTS INTO BACKDROP LAYER
// ===================================
// .prototype-block has z-index: 2, which creates a stacking context.
// Anything inside it (including dots at z-index: 0) still renders
// above siblings at z-index: 1 (the dashed line).
// Fix: measure each dots img's position, move it out of .prototype-block
// and into .final-prototype-backdrop as a direct child at z-index: 0.
// Now dots are behind the line (z-index 1) AND behind the blocks (z-index 2).

// ===================================
// SCROLL FADE-IN ANIMATIONS
// ===================================

// Elements to animate on scroll
const fadeElements = document.querySelectorAll('.overview-block, .stamp-card, .results-circle, .conclusion-circle, .market-audit-image, .unsent-project-image, .sidechat-image, .unsent-analysis, .sidechat-analysis, .dilemma-row, .large-image-section, .market-audit-text, .dilemma-text, .personas-intro, .ideation-section, .ideation-image-section, .ideation-quote, .user-flow-section, .userflow-image-section, .lofi-section, .midfi-section, .wireframe-grid img, .mascot-exploration-section, .mascot-image, .feedback-section, .feedback-grid, .prototype-block');


// Add index to stamp cards for stagger effect
document.querySelectorAll('.stamp-card').forEach((card, index) => {
  card.style.setProperty('--index', index);
});

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.15, // Trigger when 15% visible
  rootMargin: '0px 0px -50px 0px' // Start slightly before element enters
};

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Observe all fade elements
fadeElements.forEach(element => {
  element.classList.add('fade-in-element');
  fadeObserver.observe(element);
});

// Don't animate hero content (already visible)
document.querySelectorAll('.hero-meta *').forEach(el => {
  el.classList.remove('fade-in-element');
  el.classList.add('visible');
});


// ===================================
// ANIMATED HIGHLIGHTS ON SCROLL
// ===================================

const highlights = document.querySelectorAll('.highlight');

// Group highlights by parent paragraph
const paragraphGroups = new Map();

highlights.forEach(highlight => {
  const parent = highlight.closest('p, h3, h4, .meta-text, .stamp-text');
  if (!paragraphGroups.has(parent)) {
    paragraphGroups.set(parent, []);
  }
  paragraphGroups.get(parent).push(highlight);
});

// Add index to each highlight within its paragraph for stagger
paragraphGroups.forEach(group => {
  group.forEach((highlight, index) => {
    highlight.style.transitionDelay = `${index * 0.15}s`; // 150ms between each
  });
});

const highlightObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    } else {
      // Re-enable animation when scrolling away
      entry.target.classList.remove('animate-in');
    }
  });
}, {
  threshold: 0.1, // Trigger early
  rootMargin: '-100px 0px -100px 0px' // Need to scroll farther away to reset
});

highlights.forEach(highlight => {
  highlightObserver.observe(highlight);
});


// ===================================
// FOOTER STAR & NAV STAR INTERACTION (from home page)
// ===================================

// Continuous rotation for footer star (keep this unchanged, runs on page load)
gsap.to("#case-footer-star-icon", { 
  rotation: 360, 
  duration: 25, 
  ease: "none", 
  repeat: -1 
});

// Spin star and land upright (keep this unchanged)
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

// ── State tracking (so we only fire enter/leave once each) ──
const footerState = {
  sidebarHidden: false,
  navStarHidden: false,
  footerStarShown: false
};

// ── The thresholds are distances from the BOTTOM of the viewport.
//     When the footer's top edge is this many px above the bottom, trigger fires.
//     Adjust these three values if timing feels off:
const SIDEBAR_THRESHOLD  = 350;  // sidebar hides first (earliest)
const NAVSTAR_THRESHOLD  = 200;  // nav star fades second
const FOOTSTAR_THRESHOLD = 50;   // footer star pops in last (latest — nearly on-screen)

// ── REPLACE your lenis.on('scroll') with this: ──
lenis.on('scroll', (e) => {
  // Keep ScrollTrigger in sync for everything else on the page
  // ScrollTrigger.update();

  // Read where the footer actually is RIGHT NOW on screen.
  // getBoundingClientRect().top = distance from viewport top to footer top.
  // If footer top is at 800px and viewport is 900px tall,
  // then distanceFromBottom = 900 - 800 = 100px (footer is 100px from bottom).
  const footer = document.querySelector('.case-footer');
  if (!footer) return;

  const rect = footer.getBoundingClientRect();
  const viewH = window.innerHeight;
  const distanceFromBottom = viewH - rect.top;
  // distanceFromBottom > 0 means footer top has entered the viewport from the bottom.
  // The larger it is, the more the footer has scrolled up into view.

  // ── SIDEBAR ──
  if (distanceFromBottom > SIDEBAR_THRESHOLD && !footerState.sidebarHidden) {
    footerState.sidebarHidden = true;
    gsap.to('.sidebar-nav', { opacity: 0, duration: 0.3 });
  } else if (distanceFromBottom <= SIDEBAR_THRESHOLD && footerState.sidebarHidden) {
    footerState.sidebarHidden = false;
    gsap.to('.sidebar-nav', { opacity: 1, duration: 0.3 });
  }

  // ── NAV STAR + NAV COLOR ──
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

  // ── FOOTER STAR POP-IN ──
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

// [WHO?] / [ME!] navigation - About Me page
document.addEventListener('DOMContentLoaded', () => {
  const whoNavLink = document.querySelector('.nav-right a[data-default="[WHO?]"]');
  
  if (whoNavLink) {
    whoNavLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('https://www.figma.com/proto/JkoTxNMhLWrapPSvopyXEp/portfolio?page-id=310%3A2587&node-id=852-4986&viewport=-4079%2C1347%2C0.2&t=CsBovf6LvnJhJpB3-1&scaling=scale-down-width&content-scaling=fixed&hide-ui=1', '_blank');
    });
  }
});