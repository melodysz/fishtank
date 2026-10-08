// LARGE MEDIA GROW IN: every image / video that spans the full content width (marked
// data-grow) starts a little smaller and grows to full size as it scrolls up the screen,
// tied to scroll. Uses the CSS `scale` property, so it stacks with the fade-in rise
// (.cf-reveal) instead of fighting it over `transform`.
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const FROM = 0.9;                 // starting size (share of full size)
  const ease = gsap.parseEase('power2.out');
  document.querySelectorAll('[data-grow]').forEach((el) => {
    const set = (p) => { el.style.scale = (FROM + (1 - FROM) * ease(p)).toFixed(4); };
    set(0);
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',          // starts growing the moment its top peeks in…
      end: 'center 55%',            // …full size once its middle is just below the screen's middle
      onUpdate: (self) => set(self.progress),
      onRefresh: (self) => set(self.progress),
    });
  });

  // data-grow-edge: media that ends up wider than the column (the Navigation section's
  // final video, edge to edge of its grey box) starts exactly the column's width and
  // grows to its full width as it scrolls up, anchored at its bottom edge (which sits on
  // the box's bottom), fully grown once its bottom reaches the bottom of the screen.
  document.querySelectorAll('[data-grow-edge]').forEach((el) => {
    const col = el.closest('.cf-inner');
    el.style.transformOrigin = '50% 100%';
    const from = () => Math.min(1, (col ? col.clientWidth : el.offsetWidth) / el.offsetWidth);
    const set = (p) => { const f = from(); el.style.scale = (f + (1 - f) * ease(p)).toFixed(4); };
    set(0);
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom bottom',
      onUpdate: (self) => set(self.progress),
      onRefresh: (self) => set(self.progress),
    });
  });
})();
