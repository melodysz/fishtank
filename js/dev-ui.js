// DEV UI SHORTCUT — shared by every page, local preview only (never on the live site).
// (Also holds the sparkle cursor experiment, below.)
// Shift+H hides every design helper (anything marked data-dev-ui: the classic / tabs /
// window switch, the "replay" buttons) until pressed again, for clean screenshots and
// recordings. Remembered for the tab, so it survives reloads and page changes;
// ?hidedev in the link opens a page with them already hidden.
// (doubletake's overlay has the same shortcut: when it's running it handles the key and
// this one stands back, so the two don't cancel each other out.)
(() => {
  if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
  const KEY = 'devUiHidden';
  const root = document.documentElement;
  const style = document.createElement('style');
  style.textContent = 'html.dev-ui-hidden [data-dev-ui] { display: none !important; }';
  document.head.appendChild(style);

  function setHidden(on) {
    root.classList.toggle('dev-ui-hidden', on);
    try { on ? sessionStorage.setItem(KEY, '1') : sessionStorage.removeItem(KEY); } catch (e) {}
  }
  try { if (sessionStorage.getItem(KEY) || new URLSearchParams(location.search).has('hidedev')) setHidden(true); } catch (e) {}

  // EXPERIMENT: the resting cursor dot as a four-point sparkle (html.cursor-sparkle). It
  // still turns into the link / tab bubbles, the big circle and the eye as usual; only the
  // plain dot changes shape. 16px (an 8px sparkle is too small to read). It spins as you
  // move, faster the faster you go. On unless switched off; the "sparkle cursor" button
  // switches it and remembers it.
  const SPARKLE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 0C12.6 6.4 17.6 11.4 24 12C17.6 12.6 12.6 17.6 12 24C11.4 17.6 6.4 12.6 0 12C6.4 11.4 11.4 6.4 12 0Z'/%3E%3C/svg%3E\")";
  const sparkleStyle = document.createElement('style');
  sparkleStyle.textContent = `
    /* the dot's own fill is clipped away (padding leaves no content box to paint) and the
       sparkle is drawn by ::before in the same colour, so it can spin on its own (--spin)
       while the page's script keeps moving the dot itself */
    html.cursor-sparkle .cursor-dot:not(.is-blob):not(.is-big):not(.is-zoom):not(.has-label) {
      box-sizing: border-box; width: 16px; height: 16px; padding: 8px; border-radius: 50%;   /* (round, not 0: the dot's fill is hidden anyway, and square corners flashed as it grew into a hover shape) */
      background-clip: content-box;
    }
    html.cursor-sparkle .cursor-dot:not(.is-blob):not(.is-big):not(.is-zoom):not(.has-label)::before {
      content: ''; position: absolute; inset: 0;
      background-color: inherit;
      -webkit-mask: ${SPARKLE} center / contain no-repeat; mask: ${SPARKLE} center / contain no-repeat;
      rotate: var(--spin, 0deg);
    }
    .dev-sparkle-btn { position: fixed; right: 16px; bottom: 112px; z-index: 99999; padding: 10px 16px; border: 0; border-radius: 999px;
      background: #111; color: #fff; font: 500 14px/1 system-ui, sans-serif; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.2); }
    .dev-sparkle-btn[aria-pressed="true"] { background: #fff; color: #111; }`;
  document.head.appendChild(sparkleStyle);
  const sparkleBtn = document.createElement('button');
  sparkleBtn.type = 'button';
  sparkleBtn.className = 'dev-sparkle-btn';
  sparkleBtn.dataset.devUi = '';
  sparkleBtn.textContent = '✦ sparkle cursor';
  const setSparkle = (on, save) => {
    root.classList.toggle('cursor-sparkle', on);
    sparkleBtn.setAttribute('aria-pressed', String(on));
    if (save) try { localStorage.setItem('cursorSparkle', on ? '1' : '0'); } catch (e) {}
  };
  sparkleBtn.addEventListener('click', () => setSparkle(!root.classList.contains('cursor-sparkle'), true));
  let sparkleOn = true;
  try { sparkleOn = localStorage.getItem('cursorSparkle') !== '0'; } catch (e) {}
  setSparkle(sparkleOn, false);
  // the spin: every px the pointer travels turns the sparkle SPIN_PER_PX degrees, clockwise
  // moving right, anticlockwise moving left (like rolling), so the faster you move the
  // faster it spins. The shown angle eases after the target, so it glides and settles.
  const SPIN_PER_PX = 0.6, SPIN_EASE = 0.2;
  let spinTarget = 0, spinShown = 0, spinLast = null, spinRaf = 0;
  const spinStep = () => {
    spinShown += (spinTarget - spinShown) * SPIN_EASE;
    if (Math.abs(spinTarget - spinShown) < 0.05) spinShown = spinTarget;
    document.getElementById('cursor')?.style.setProperty('--spin', spinShown.toFixed(2) + 'deg');
    spinRaf = spinShown === spinTarget ? 0 : requestAnimationFrame(spinStep);
  };
  document.addEventListener('pointermove', (e) => {
    if (!root.classList.contains('cursor-sparkle')) return;
    if (spinLast) {
      const dx = e.clientX - spinLast[0], dy = e.clientY - spinLast[1];
      spinTarget += Math.hypot(dx, dy) * SPIN_PER_PX * (dx < 0 ? -1 : 1);
      if (!spinRaf) spinRaf = requestAnimationFrame(spinStep);
    }
    spinLast = [e.clientX, e.clientY];
  }, { passive: true });

  const addBtn = () => document.body.appendChild(sparkleBtn);
  if (document.body) addBtn(); else document.addEventListener('DOMContentLoaded', addBtn);

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'H' || !e.shiftKey || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.composedPath().some((n) => n.tagName === 'INPUT' || n.tagName === 'TEXTAREA' || n.isContentEditable)) return;
    // (wait until every listener has run: if doubletake took the key, leave it to it)
    setTimeout(() => { if (!e.defaultPrevented) setHidden(!root.classList.contains('dev-ui-hidden')); }, 0);
  });
})();
