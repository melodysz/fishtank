// SPARKLE CURSOR — shared by every page. The resting cursor dot as a four-point sparkle
// (html.cursor-sparkle). It still turns into the link / tab bubbles, the big circle and the
// eye as usual; only the plain dot changes shape. 16px (an 8px sparkle is too small to
// read). It spins as you move, faster the faster you go.
(() => {
  const root = document.documentElement;
  const SPARKLE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 0C12.6 6.4 17.6 11.4 24 12C17.6 12.6 12.6 17.6 12 24C11.4 17.6 6.4 12.6 0 12C6.4 11.4 11.4 6.4 12 0Z'/%3E%3C/svg%3E\")";
  const style = document.createElement('style');
  style.textContent = `
    /* the dot's own fill is clipped away (padding leaves no content box to paint) and the
       sparkle is drawn by ::before in the same colour, so it can spin on its own (--spin)
       while the page's script keeps moving the dot itself */
    html.cursor-sparkle .cursor-dot:not(.is-blob):not(.is-big):not(.is-zoom):not(.has-label) {
      box-sizing: border-box; width: 16px; height: 16px; padding: 8px; border-radius: 50%;   /* (round, not 0: the dot's fill is hidden anyway, and square corners flashed as it grew into a hover shape) */
      background-clip: content-box;
    }
    html.cursor-sparkle .cursor-dot:not(.is-blob):not(.is-big):not(.is-zoom):not(.has-label)::before {
      content: ''; position: absolute; inset: 0;
      background-color: inherit;
      -webkit-mask: ${SPARKLE} center / contain no-repeat; mask: ${SPARKLE} center / contain no-repeat;
      rotate: var(--spin, 0deg);
    }`;
  document.head.appendChild(style);
  root.classList.add('cursor-sparkle');

  // the spin: every px the pointer travels turns the sparkle SPIN_PER_PX degrees, clockwise
  // moving right, anticlockwise moving left (like rolling), so the faster you move the
  // faster it spins. The shown angle eases after the target, so it glides and settles.
  const SPIN_PER_PX = 0.6, SPIN_EASE = 0.2;
  let spinTarget = 0, spinShown = 0, spinLast = null, spinRaf = 0;
  const spinStep = () => {
    spinShown += (spinTarget - spinShown) * SPIN_EASE;
    if (Math.abs(spinTarget - spinShown) < 0.05) spinShown = spinTarget;
    document.getElementById('cursor')?.style.setProperty('--spin', spinShown.toFixed(2) + 'deg');
    spinRaf = spinShown === spinTarget ? 0 : requestAnimationFrame(spinStep);
  };
  document.addEventListener('pointermove', (e) => {
    if (spinLast) {
      const dx = e.clientX - spinLast[0], dy = e.clientY - spinLast[1];
      spinTarget += Math.hypot(dx, dy) * SPIN_PER_PX * (dx < 0 ? -1 : 1);
      if (!spinRaf) spinRaf = requestAnimationFrame(spinStep);
    }
    spinLast = [e.clientX, e.clientY];
  }, { passive: true });
})();
