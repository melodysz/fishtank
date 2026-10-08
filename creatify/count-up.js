// BIG NUMBERS COUNT UP: each big stat (1.3%, ~39, 71, 38%, 16%…) counts up from 0 to its
// value the first time it's well on screen. Keeps any prefix/suffix (~, %) and decimal
// places. Its width is held at the final number's width so nothing beside it shifts.
// (Numbers with more than one figure in them, like "1 in 3", are left as they are.)
(() => {
  if (!window.gsap || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const DURATION = 1.4;   // s
  const els = [...document.querySelectorAll('.cf-bigstat-num, .sk-stat-num')];
  els.forEach((el) => {
    const m = el.textContent.trim().match(/^(\D*)(\d+(?:\.\d+)?)(\D*)$/);
    if (!m) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num);
    const decimals = (num.split('.')[1] || '').length;
    const show = (v) => { el.textContent = pre + v.toFixed(decimals) + post; };
    const lockWidth = () => { el.style.minWidth = ''; show(target); el.style.minWidth = el.getBoundingClientRect().width + 'px'; };
    el.style.display = 'inline-block';
    el.style.fontVariantNumeric = 'tabular-nums';
    if (el.classList.contains('cf-bigstat-num')) el.style.textAlign = 'right';   // (sits left of its label)
    document.fonts && document.fonts.ready.then(() => { if (!el._counted) { lockWidth(); show(0); } });
    lockWidth();
    show(0);
    new IntersectionObserver(([en], obs) => {
      if (!en.isIntersecting) return;
      obs.disconnect();
      el._counted = true;
      const o = { v: 0 };
      gsap.to(o, { v: target, duration: DURATION, ease: 'power3.out', onUpdate: () => show(o.v), onComplete: () => show(target) });
    }, { threshold: 0.6 }).observe(el);
  });
})();
