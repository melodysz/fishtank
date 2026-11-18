// DEV SLIDERS (local preview only, never on the live site): the smallest "Creatify" may get, and the gap
// between it and the summary (a wider title or gap leaves less room, and the pills wrap).
// The title is normally sized to the summary + tags beside it (main.js fitTitle); on wide
// screens that block is short, so this sets a floor. Above the floor, the block drops down to
// line up with the bottom of the title. Shows the title's actual size; Shift+H hides it.
(() => {
  if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
  const title = document.querySelector('.cf-summary .cf-title');
  if (!title) return;
  const KEY = 'cfTitleMin';
  const root = document.documentElement;
  const DEFAULT = parseFloat(getComputedStyle(root).getPropertyValue('--cf-title-min')) || 0;
  const box = document.createElement('div');
  box.setAttribute('data-dev-ui', '');
  box.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:99999;display:flex;gap:10px;align-items:center;padding:10px 14px;border-radius:12px;background:rgba(20,20,20,.85);color:#fff;font:12px/1.2 system-ui,sans-serif;backdrop-filter:blur(8px)';
  box.innerHTML = '<span>title size</span><input type="range" class="sz" min="72" max="240" step="1" style="width:150px"><span>gap</span><input type="range" class="gp" min="24" max="140" step="2" style="width:110px"><span class="v" style="min-width:190px;font-variant-numeric:tabular-nums"></span><button type="button" style="all:unset;cursor:pointer;opacity:.6">reset</button>';
  const input = box.querySelector('.sz'), gap = box.querySelector('.gp'), out = box.querySelector('.v');
  let saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  input.value = saved || DEFAULT;
  const GAP_DEFAULT = 56;
  let savedGap = null; try { savedGap = localStorage.getItem(KEY + 'Gap'); } catch (e) {}
  gap.value = savedGap || GAP_DEFAULT;
  const apply = () => {
    root.style.setProperty('--cf-title-min', input.value + 'px');
    root.style.setProperty('--cf-summary-gap', gap.value + 'px');
    try { localStorage.setItem(KEY, input.value); localStorage.setItem(KEY + 'Gap', gap.value); } catch (e) {}
    if (typeof fitTitle === 'function') fitTitle();
    if (typeof sizeHero === 'function') sizeHero();
    const rows = new Set([...document.querySelectorAll('.cf-tags > *')].map((t) => Math.round(t.getBoundingClientRect().top))).size;
    out.textContent = `title ${Math.round(parseFloat(getComputedStyle(title).fontSize))}px · gap ${gap.value}px · pills: ${rows} row${rows > 1 ? 's' : ''}`;
  };
  input.addEventListener('input', apply);
  gap.addEventListener('input', apply);
  box.querySelector('button').addEventListener('click', () => { input.value = DEFAULT; gap.value = GAP_DEFAULT; apply(); });
  window.addEventListener('resize', () => requestAnimationFrame(apply));
  document.body.appendChild(box);
  apply();
  document.fonts.ready.then(apply);
})();
