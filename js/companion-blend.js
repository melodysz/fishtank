// Sky Glow on the homepage/dark surfaces; multiply on light reading surfaces.
(() => {
  const companion = document.getElementById('cursor');
  if (!companion) return;
  const homepage = !!document.getElementById('circularCarousel');
  let px = 0, py = 0, queued = false, lastCheck = -Infinity;
  function update() {
    queued = false;
    lastCheck = performance.now();
    if (homepage && !document.documentElement.matches('.panel-who, .panel-play')) {
      companion.dataset.companionSurface = 'dark';
      return;
    }
    let surface = homepage ? 'light' : 'light';
    const hit = document.elementFromPoint(px, py);
    for (let el = hit; el; el = el.parentElement) {
      const style = getComputedStyle(el);
      const channels = style.backgroundColor.match(/[\d.]+/g);
      if (!channels || (channels.length > 3 && Number(channels[3]) < .85)) continue;
      const [r, g, b] = channels.map(Number);
      const luminance = (.2126*r + .7152*g + .0722*b) / 255;
      surface = luminance > .6 ? 'light' : 'dark';
      break;
    }
    companion.dataset.companionSurface = surface;
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  document.addEventListener('pointermove', event => {
    px = event.clientX; py = event.clientY;
    if (performance.now() - lastCheck > 80) schedule();
  }, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true });
  new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  companion.dataset.companionSurface = homepage ? 'dark' : 'light';
})();
