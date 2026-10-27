// Sky Glow on the homepage/dark surfaces; multiply on light reading surfaces.
(() => {
  const companion = document.getElementById('cursor');
  if (!companion) return;
  // the cursor eye's "boiling" wobble (look: companion-blend.css): wavy noise nudges the
  // eye's edges and changes 8 times a second, so it shimmers like hand-drawn animation
  document.body.insertAdjacentHTML('beforeend', `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
      <filter id="eye-boil" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="0" result="noise">
          <animate attributeName="seed" values="1;2;3;4" dur="0.5s" calcMode="discrete" repeatCount="indefinite"/>
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>`);
  // load the closed eye now, so the first blink doesn't flash empty
  if (document.currentScript) new Image().src = new URL('../images/eye-closed.svg', document.currentScript.src).href;
  const homepage = !!document.getElementById('circularCarousel');
  // Case studies: the companion takes the page's highlight colour (the bolded-phrase
  // highlight, strong.cf-hl on Creatify, .highlight elsewhere), read from its CSS, so
  // changing a highlight colour changes the cursor too. Other pages keep Sky Glow.
  const mark = document.querySelector('strong.cf-hl, .highlight');
  const hl = mark && getComputedStyle(mark).backgroundImage.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
  if (hl) companion.style.setProperty('--companion-color', `rgb(${hl[1]}, ${hl[2]}, ${hl[3]})`);
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
