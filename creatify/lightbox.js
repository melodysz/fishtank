// LIGHTBOX
// window.cfLightbox.open(src, alt) shows a full-size image (or a video: a src ending in
// .mp4, played on a loop) over the page. Closes
// on a click anywhere, the × button, or Escape. Page scrolling is paused while
// it's open. Any element with data-full="…" (and no handler of its own) opens it
// on click; research.js calls it directly for card 03's front screenshot.
(() => {
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Enlarged image');
  box.innerHTML = '<img class="lightbox-img" alt=""><video class="lightbox-img lightbox-video" muted loop playsinline hidden></video><button class="lightbox-close interactable" type="button" aria-label="Close">×</button>';
  document.body.appendChild(box);
  const img = box.querySelector('img.lightbox-img');
  const video = box.querySelector('video.lightbox-video');
  const closeBtn = box.querySelector('.lightbox-close');
  let lastFocus = null;

  function open(src, alt) {
    lastFocus = document.activeElement;
    const isVideo = /\.mp4(\?|$)/.test(src);
    img.hidden = isVideo; video.hidden = !isVideo;
    if (isVideo) { video.src = src; video.setAttribute('aria-label', alt || ''); video.currentTime = 0; video.play().catch(() => {}); }
    else { img.src = src; img.alt = alt || ''; }
    box.classList.add('is-open');
    if (window.cfLenis) window.cfLenis.stop();
    closeBtn.focus({ preventScroll: true });
  }
  function close() {
    if (!box.classList.contains('is-open')) return;
    box.classList.remove('is-open');
    video.pause();
    if (window.cfLenis) window.cfLenis.start();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  box.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  box.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });   // (page stays put underneath)

  // (images inside the research cards are wired up by research.js, which knows a drag from a click)
  document.querySelectorAll('img[data-full], video[data-full]').forEach((el) => {
    if (el.closest('.rs-strip')) return;
    el.addEventListener('click', () => open(el.dataset.full, el.alt || el.getAttribute('aria-label')));
  });

  window.cfLightbox = { open, close };
})();
