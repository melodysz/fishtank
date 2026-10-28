// PROBLEM STRIP: Agent's capabilities as white icon circles across the Problem card, edge
// to edge (Figma "Oscillating strip"). The circles bob in one smooth, evenly spaced wave
// (bob idea from Bramus's Antigravity rework, brm.us/antigravity), and the whole row drifts
// slowly left forever. When you scroll to it,
// the circles fade in one by one, left to right, already bobbing and drifting.
// Look + sizes + speeds: style.css "Problem strip".
(() => {
  // icon = a file in agent-icons/ (the same capabilities the corner wheel used). No 'mic':
  // it's from a different, thicker-lined set than the others
  const ICONS = ['quick', 'play', 'image', 'search', 'product', 'fast-forward', 'add'];
  // circles in one loop of the drift: enough to fill the widest card, and a multiple of the
  // wave's length (--pb-length in style.css, 10) so the wave carries on seamlessly where the
  // loop starts over
  const PER_LOOP = 20;

  const strip = document.querySelector('.pb-strip');
  if (!strip) return;
  const track = strip.querySelector('.pb-strip-track');

  // two identical copies side by side: the row drifts one copy's width, then starts over
  // where it looks exactly the same
  for (let copy = 0; copy < 2; copy++) {
    for (let n = 0; n < PER_LOOP; n++) {
      const bob = document.createElement('span');
      bob.className = 'pb-bob';
      bob.style.setProperty('--n', n);
      bob.style.setProperty('--k', copy * PER_LOOP + n);   // (its place in the whole row: the fade-in order)
      bob.innerHTML = `<i class="pb-strip-icon" style="--icon-url:url(agent-icons/${ICONS[n % ICONS.length]}.svg)"></i>`;
      track.appendChild(bob);
    }
  }

  // fade in once 30% of it is on screen (the CodePen's "cover 30%" trigger)…
  const slideIn = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    strip.classList.add('is-in');
    slideIn.disconnect();
  }, { threshold: 0.3 });
  slideIn.observe(strip);

  // …and stop moving while it's off screen
  new IntersectionObserver(([entry]) => {
    strip.classList.toggle('is-paused', !entry.isIntersecting);
  }).observe(strip);
})();
