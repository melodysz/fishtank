// SKILLS SECTION: its screen recordings only play while they're on screen (they're
// loaded lazily, so the page doesn't fetch ~7 MB of video up front).
(() => {
  const videos = [...document.querySelectorAll('#design video.sk-video, video.vd-proto')];
  if (!videos.length) return;
  if (!('IntersectionObserver' in window)) { videos.forEach((v) => { v.autoplay = true; v.preload = 'auto'; }); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting) { v.play().catch(() => {}); } else if (!v.paused) v.pause();
  }), { threshold: 0.25 });
  videos.forEach((v) => io.observe(v));
})();

// EVOLUTION OF THE SKILL CARD: plays once, when the box is well on screen. All four cards
// start stacked in the middle with the final card (04) on top; 04 slides quickly to its
// spot on the right while the earlier versions appear from under it (fading in, in case
// 04 doesn't fully cover them) and slide to theirs, each a beat after the one above it,
// easing in on a curve. Then the captions fade in.
(() => {
  const box = document.getElementById('skEvo');
  if (!box || !window.gsap || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const row = box.querySelector('.sk-evo-row');
  const items = [...box.querySelectorAll('.sk-evo-item')];
  const cards = items.map((i) => i.querySelector('.sk-evo-card'));
  const caps = items.map((i) => i.querySelector('figcaption'));
  const last = cards.length - 1;
  let played = false;

  // how far each card is from the row's middle (so it can start there)
  function toMiddle() {
    const r = row.getBoundingClientRect(), mid = r.left + r.width / 2;
    return cards.map((c) => { const b = c.getBoundingClientRect(); return mid - (b.left + b.width / 2); });
  }
  function setStart() {
    gsap.set(cards, { x: 0 });                       // (measure from their real spots)
    const dx = toMiddle();
    cards.forEach((c, i) => gsap.set(c, { x: dx[i], opacity: i === last ? 1 : 0, position: 'relative', zIndex: i + 1 }));
    gsap.set(caps, { opacity: 0, y: 8 });
  }
  setStart();
  window.addEventListener('resize', () => { if (!played) setStart(); });

  function play() {
    played = true;
    const tl = gsap.timeline({ delay: 0.2, onComplete: () => gsap.set([...cards, ...caps], { clearProps: 'transform,opacity,zIndex,position' }) });
    // 04 first, then 03, 02, 01, each revealed from under the one before
    cards.slice().reverse().forEach((c, k) => {
      const t = k * 0.09;
      tl.to(c, { x: 0, duration: 0.85, ease: 'power4.out' }, t);
      if (c !== cards[last]) tl.to(c, { opacity: 1, duration: 0.22, ease: 'power1.out' }, t);
    });
    tl.to(caps, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.07 }, 0.55);
  }

  new IntersectionObserver(([en], obs) => {
    if (en.intersectionRatio >= 0.5) { obs.disconnect(); play(); }
  }, { threshold: [0.5] }).observe(box);
})();
