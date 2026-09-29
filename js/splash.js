// SPLASH SCREENS — what's shown on the full-screen splash between pages.
// (The slide-in / slide-away animations live where they always did; this file
// only decides what the splash looks like.) Designs: Figma "Projcard Splash"
// and "Other Splashes". The site intro ("feeding the fish...") is styled in
// css/style.css.
//
//   fishtankSplash.render(overlayEl, '[ knouri ]')
//
// Labels are the old splash labels ("[ work ]", "[ deep24 ]"…), so every place
// that used to set the label text just hands it to render() instead.
(function () {
  // a project: its card's colour, navy text, its name and card number
  const PROJECTS = {
    'creatify': { num: '01', bg: '#D2ABFF' },
    'settlyfe': { num: '02', bg: '#83E7FF' },
    'deep24':   { num: '03', bg: '#EFEDF8' },
    'pent up':  { num: '04', bg: '#F5B7FF' },
    'knouri':   { num: '05', bg: '#D1FFA4' },
  };
  const PROJECT_TEXT = '#000180';

  // everything else: black with pink text
  const OTHERS = { 'work': 'work!', 'who': 'who?', 'play': 'play!', 'home': 'home', 'say hi': 'say hi!' };
  const OTHER_BG = '#000000';
  const OTHER_TEXT = '#F5B7FF';

  // the site's asterisk, sitting at its usual tilt (the shape from the Figma
  // splash frames). It spins once as each splash arrives (see play() below).
  const STAR = '<svg class="splash-star" viewBox="0 0 37 37" aria-hidden="true"><path fill="currentColor" d="M14.9018 37L8.52099 34.3464L16.8443 20.3641C16.9029 20.2655 16.9065 20.1449 16.8539 20.0433C16.793 19.9258 16.6675 19.8533 16.5322 19.8576L0 20.3772L0.660807 13.6936L16.7029 17.1781C16.8549 17.2111 17.0132 17.1592 17.1136 17.0434C17.2096 16.9326 17.2375 16.7805 17.1868 16.6443L11.5507 1.48424L18.278 0L19.9355 16.0379C19.9504 16.182 20.0432 16.3074 20.1791 16.367C20.321 16.4294 20.4869 16.4098 20.6093 16.3162L33.5283 6.44202L37 12.2139L21.9545 18.661C21.8307 18.7141 21.7498 18.8321 21.7471 18.9635C21.7448 19.0774 21.8018 19.1847 21.8985 19.249L35.6223 28.3671L31.0473 33.4378L20.0382 21.3783C19.9576 21.29 19.8338 21.2513 19.7152 21.2775C19.5967 21.3036 19.5022 21.3904 19.4688 21.504L14.9018 37Z"/></svg>';

  // Figma: asterisk 37, gap 50, name 30px PP Neue Montreal Book, gap 15,
  // number 30px Haffer Mono Light; the whole block sits a touch below centre.
  // Scaled down (Figma sizes read big on screen): text 30 → 20px, asterisk 37 → 32px.
  const css = `
    .splash-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 44px;
      color: var(--splash-fg, ${OTHER_TEXT});
      font-family: 'PP Neue Montreal', sans-serif;
      font-weight: 400;
      font-style: normal;
      font-size: 20px;
      line-height: 1;
      letter-spacing: 0;
      white-space: nowrap;
    }
    .splash-inner { display: flex; flex-direction: column; align-items: center; }
    .splash-star { display: block; width: 32px; height: auto; margin-bottom: 44px; }
    .splash-num { margin-top: 10px; font-family: 'HafferXH', monospace; font-weight: 300; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  function specFor(label) {
    const key = String(label || '').replace(/[\[\]]/g, '').trim().toLowerCase();
    if (PROJECTS[key]) return { bg: PROJECTS[key].bg, fg: PROJECT_TEXT, name: key, num: PROJECTS[key].num };
    return { bg: OTHER_BG, fg: OTHER_TEXT, name: OTHERS[key] || key, num: '' };
  }

  // overlay: the full-screen splash element. Its content goes into the child
  // that the page's animations already move (#work-wipe-text on the homepage,
  // .page-wipe-label on the other pages), or a new one.
  function render(overlay, label) {
    if (!overlay) return;
    const s = specFor(label);
    overlay.style.background = s.bg;
    overlay.style.setProperty('--splash-fg', s.fg);
    let box = overlay.querySelector('#work-wipe-text, .page-wipe-label, .splash-content');
    if (!box) { box = document.createElement('div'); overlay.appendChild(box); }
    box.classList.add('splash-content');
    box.innerHTML = '<div class="splash-inner">' + STAR + `<span class="splash-name">${s.name}</span>` + (s.num ? `<span class="splash-num">[${s.num}]</span>` : '') + '</div>';
  }

  // The splash's arrival flourish: as the rising screen brakes to a stop, it
  // "throws" its contents up into the air; they hang for a split second and drop
  // back into place — the asterisk lands first, then each line of text in turn —
  // while the asterisk spins once round and eases to a stop. `delay` (ms) is when
  // the screen starts braking (about halfway through its slide).
  const SETTLE_MS = 1450;
  const RISE = 440, HANG = 50, FALL = 260;   // ms
  const START = 50;                           // px below their resting spot they ride up at, before the throw
  const HEIGHT = 22;                          // px above it they're thrown
  const LAND_STAGGER = 70;                    // ms between each piece landing
  function play(overlay, delay = 380) {
    const inner = overlay && overlay.querySelector('.splash-inner');
    if (!inner || !inner.animate) return;
    [...inner.children].forEach((el, k) => {
      const total = RISE + HANG + k * LAND_STAGGER + FALL;
      el.animate(
        [{ translate: `0 ${START}px`, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' },                  // thrown up from low down, slowing…
         { translate: `0 -${HEIGHT}px`, offset: RISE / total },                                     // …hangs at the top…
         { translate: `0 -${HEIGHT}px`, offset: (total - FALL) / total, easing: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)' }, // …and drops
         { translate: '0 0' }],
        { duration: total, delay, fill: 'backwards' }   // (sits at the low start while the screen rises)
      );
    });
    const star = inner.querySelector('.splash-star');
    if (star) star.animate(
      [{ rotate: '0deg' }, { rotate: '360deg' }],
      { duration: 900, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }   // spins as it's thrown, easing to a stop
    );
  }

  window.fishtankSplash = { render, play, SETTLE_MS };
})();
