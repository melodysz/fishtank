// HIGHLIGHTED PHRASES: every bolded phrase (<strong>) in the case study becomes a lilac
// highlight that sweeps in when it comes on screen (and resets once it's far away, so it
// plays again), staggered 0.15s within a paragraph. Same behaviour as the other case
// studies' .highlight.
(() => {
  const marks = [...document.querySelectorAll('main strong, .cf-overview strong, .cf-summary strong')].filter((s) => !s.closest('.lf-pill'));   // (not the look & feel pills' names)
  if (!marks.length) return;
  const groups = new Map();
  marks.forEach((m) => {
    m.classList.add('cf-hl');
    const p = m.closest('p, li, h3, h4') || m.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(m);
  });
  groups.forEach((g) => g.forEach((m, i) => { m.style.transitionDelay = `${i * 0.15}s`; }));
  if (!('IntersectionObserver' in window)) { marks.forEach((m) => m.classList.add('animate-in')); return; }
  // on: once it's on screen · off: once it's more than a screen away
  const on = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add('animate-in'); }), { threshold: 1 });
  const off = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) e.target.classList.remove('animate-in'); }), { rootMargin: '100% 0px' });
  marks.forEach((m) => { on.observe(m); off.observe(m); });
})();
