// SPINNING FAVICON — shared by every page.
// Browsers don't play animated favicons (except Firefox), so this pre-draws the
// asterisk at a set of angles once, then swaps the tab icon through them.
// Works in Chrome, Edge and Firefox; Safari keeps showing the still icon.
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const links = Array.from(document.querySelectorAll('link[rel~="icon"]'));
  if (!links.length) return;
  // keep a single icon link so the browser doesn't fall back to another one
  const link = links[0];
  links.slice(1).forEach((l) => l.remove());
  link.type = 'image/png';

  const FRAMES = 36;          // one frame every 10°
  const SECONDS_PER_TURN = 4;
  const SIZE = 64;

  const img = new Image();
  img.crossOrigin = 'anonymous'; // needed to turn the drawn frames into icons
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    // shrink a touch so the arms never clip the corners while turning
    const scale = (SIZE * 0.92) / Math.max(img.naturalWidth, img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    const frames = [];
    for (let i = 0; i < FRAMES; i++) {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.save();
      ctx.translate(SIZE / 2, SIZE / 2);
      ctx.rotate((i / FRAMES) * Math.PI * 2);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
      try { frames.push(canvas.toDataURL('image/png')); } catch (e) { return; } // (image not shareable: keep still icon)
    }
    let i = 0;
    setInterval(() => {
      i = (i + 1) % FRAMES;
      link.href = frames[i];
    }, (SECONDS_PER_TURN * 1000) / FRAMES);
  };
  img.src = link.href;
})();
