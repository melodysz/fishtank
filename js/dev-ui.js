// DEV UI SHORTCUT — shared by every page, local preview only (never on the live site).
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

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'H' || !e.shiftKey || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.composedPath().some((n) => n.tagName === 'INPUT' || n.tagName === 'TEXTAREA' || n.isContentEditable)) return;
    // (wait until every listener has run: if doubletake took the key, leave it to it)
    setTimeout(() => { if (!e.defaultPrevented) setHidden(!root.classList.contains('dev-ui-hidden')); }, 0);
  });
})();
