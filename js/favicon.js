// SPINNING FAVICON — shared by every page.
// Browsers don't play animated favicons (except Firefox), so this pre-draws the
// asterisk at a set of angles once, then swaps the tab icon through them.
// Works in Chrome, Edge and Firefox; Safari keeps showing the still icon.
// PLAY SWITCH — "play" only shows on the local preview until it's ready.
// (To launch it on the live site, delete this line.)
if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) document.documentElement.classList.add('show-play');

(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const links = Array.from(document.querySelectorAll('link[rel~="icon"]'));
  if (!links.length) return;
  // keep a single icon link so the browser doesn't fall back to another one
  const link = links[0];
  links.slice(1).forEach((l) => l.remove());

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
    link.type = 'image/png';
    link.href = frames[0];

    // Spin only while the tab is being looked at. In the background it rests on
    // the upright asterisk. (Swapping the icon non-stop made it sometimes go blank
    // when you clicked back into the tab: the page is busy waking up then, and each
    // new icon cancelled the one Chrome was still loading.) When you come back, it
    // waits a moment for the page to settle before spinning again.
    let i = 0, timer = null, resume = null;
    const spin = () => {
      if (timer) return;
      timer = setInterval(() => {
        i = (i + 1) % FRAMES;
        link.href = frames[i];
      }, (SECONDS_PER_TURN * 1000) / FRAMES);
    };
    const rest = () => {
      clearInterval(timer); timer = null;
      clearTimeout(resume);
      i = 0;
      link.href = frames[0];
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) rest();
      else { clearTimeout(resume); resume = setTimeout(spin, 800); }
    });
    if (!document.hidden) spin();
  };
  img.src = link.href;
})();
