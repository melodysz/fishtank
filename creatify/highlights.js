// "GET THE HIGHLIGHTS." CAROUSEL
// Same feel as the homepage carousel's trackpad flick (and Apple's highlights
// gallery): while your fingers (or the mouse) are down the cards follow them
// exactly; let go and they launch quickly onto the next card, then ease into
// place with a long soft slow-down. Past either end the cards stretch like a
// rubber band and spring back. The dots show where you are and can be clicked.
(function () {
  const viewport = document.querySelector('.hl-viewport');
  if (!viewport) return;
  const track = viewport.querySelector('.hl-track');
  const cards = [...track.children];
  const dotsBox = viewport.querySelector('.hl-dots');

  const FLICK = {
    minPeak: 8,       // a flick = fingers moving at least this fast (trackpad px per event, ~500px/sec);
                      // anything slower just follows your fingers, so you can swipe slowly or hold
    minSpeed: 300,    // mouse/touch drags: slower than this (px/sec) on release = settle on the nearest card
    boost: 1.5,       // the glide launches at your fingers' speed × this…
    floor: 6000,      // …but never slower than this (px/sec): a fast launch even for a light flick
    power: 5,         // the glide's curve: high = fast launch, then a long soft slow-down at the end
    reach: 0.12,      // how far a flick carries: launch speed × this (seconds), then onto the nearest card
    minTime: 0.45,    // shortest / longest the whole glide takes, soft tail included (seconds);
    maxTime: 1.0,     // with power 5 it's ~90% of the way there in the first third of this
    maxCards: 2,      // the most cards one flick can travel
    holdMs: 450,      // fingers stopped (holding, or lifted slowly) this long = settle onto the nearest card
  };

  // where each card sits when it's "the current one": the first lines up with the
  // page's left column edge (like the heading above it); every card after that sits
  // centred on the screen
  let snaps = [];
  function measure() {
    const screenCentre = window.innerWidth / 2 - viewport.getBoundingClientRect().left;   // in the track's coordinates
    snaps = cards.map((c, i) => i === 0 ? 0 : c.offsetLeft + c.offsetWidth / 2 - screenCentre);
    render();
  }

  let x = 0;              // how far the track is moved left (px)
  let glide = null, raf = 0;
  const minX = () => snaps[0], maxX = () => snaps[snaps.length - 1];
  const nearest = (v) => snaps.reduce((best, s, i) => Math.abs(s - v) < Math.abs(snaps[best] - v) ? i : best, 0);

  // Apple-style text parallax: each card's text slides further than the card itself
  // and fades out in proportion to how far that card is from its resting spot — so
  // it follows your fingers mid-swipe as well as the glide.
  // The text's position also trails behind the card and eases in on its own, slowly —
  // while its fade follows the card directly, so it's fully visible before it settles.
  const PARALLAX = {
    extra: 0.12,     // the text moves this much further than the card (× the distance the card has moved)
    fadeBy: 0.55,    // fully faded once the card is this far from its spot (in card widths)
    ease: 0.09,      // how quickly the text catches up each frame (lower = slower, softer settle)
  };
  const texts = cards.map((c) => [...c.querySelectorAll('.hl-caption, .hl-soon')]);
  // cards laid out in Figma's own pixels (the angled-MacBook card) scale with the card
  const setScale = () => cards.forEach((c) => c.style.setProperty('--s', c.offsetWidth / 1240));
  setScale();
  if ('ResizeObserver' in window) new ResizeObserver(setScale).observe(cards[0]);
  else window.addEventListener('resize', setScale);
  const textTarget = cards.map(() => 0), textNow = cards.map(() => 0);
  let textRaf = 0;
  function textTick() {
    textRaf = 0;
    let moving = false;
    cards.forEach((c, k) => {
      if (!texts[k].length) return;
      const d = textTarget[k] - textNow[k];
      textNow[k] = Math.abs(d) < 0.3 ? textTarget[k] : textNow[k] + d * PARALLAX.ease;
      if (textNow[k] !== textTarget[k]) moving = true;
      texts[k].forEach((t) => { t.style.transform = `translate3d(${textNow[k]}px, 0, 0)`; });
    });
    if (moving) textRaf = requestAnimationFrame(textTick);
  }
  let activeCard = 0;
  let onActiveCard = () => {};   // (set by the screen recordings below)
  function render() {
    track.style.transform = `translate3d(${-x}px, 0, 0)`;
    const i = nearest(x);
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    if (i !== activeCard) { activeCard = i; onActiveCard(); }
    const unit = cards[0].offsetWidth || 1;
    cards.forEach((c, k) => {
      if (!texts[k].length) return;
      const moved = snaps.length ? x - snaps[k] : 0;          // px this card has moved away from its spot (+ = to the left)
      textTarget[k] = -moved * PARALLAX.extra;
      const fade = Math.max(0, 1 - Math.abs(moved) / (unit * PARALLAX.fadeBy));
      texts[k].forEach((t) => { t.style.opacity = fade; });
    });
    if (!textRaf) textRaf = requestAnimationFrame(textTick);
  }

  // ---------- dots ----------
  const dots = cards.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hl-dot interactable';
    b.setAttribute('aria-label', `Highlight ${i + 1}`);
    b.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(b);
    return b;
  });

  // ---------- gliding (ease-out curve: fastest at the start, soft tail) ----------
  // power sets the curve: its starting speed is power × distance ÷ duration
  // headStartMs: flicks begin one frame "into" the glide, so it picks up exactly where the
  // fingers left off (otherwise there's a frame of near-standstill at the hand-off)
  function glideTo(target, duration, power, headStartMs = 0) {
    cancelAnimationFrame(raf);
    const from = x, dist = target - from;
    const t0 = performance.now() - headStartMs;
    glide = { target };
    const step = () => {
      // (clock read here, not the frame's timestamp: that can be a hair before t0, which
      // made the first frame step backwards — a one-frame hitch right at the hand-off)
      const u = Math.min(1, Math.max(0, (performance.now() - t0) / 1000 / duration));
      x = from + dist * (1 - Math.pow(1 - u, power));
      render();
      if (u < 1) raf = requestAnimationFrame(step); else { glide = null; raf = 0; }
    };
    // a flick draws its first step right now (on the lift event itself), so every frame
    // across the hand-off moves by a normal amount: no frozen frame, no catch-up jump
    if (headStartMs) step(); else raf = requestAnimationFrame(step);
  }
  function stopGlide() { cancelAnimationFrame(raf); raf = 0; glide = null; }
  function goTo(i) { glideTo(snaps[Math.max(0, Math.min(snaps.length - 1, i))], 0.7, 4); }
  function settle() { glideTo(snaps[nearest(x)], 0.45, 3); }

  // A flick at speed v (px/sec, + = towards later cards). The glide STARTS at that same
  // speed — no ramp-up, no sudden jump — and eases onto the card it carries to.
  function release(v, startIndex, headStartMs = 0) {
    if (Math.abs(v) < FLICK.minSpeed) { settle(); return; }
    const dir = Math.sign(v);
    const launch = dir * Math.max(Math.abs(v) * FLICK.boost, FLICK.floor);
    let i = nearest(x + launch * FLICK.reach);
    // always at least the next card in the flick's direction…
    const next = dir > 0 ? snaps.findIndex((s) => s > x + 1) : snaps.length - 1 - [...snaps].reverse().findIndex((s) => s < x - 1);
    if (next >= 0 && next < snaps.length && (i - next) * dir < 0) i = next;
    // …and at most maxCards from where this swipe began
    i = Math.max(startIndex - FLICK.maxCards, Math.min(startIndex + FLICK.maxCards, i));
    i = Math.max(0, Math.min(snaps.length - 1, i));
    const dist = Math.abs(snaps[i] - x);
    if (dist < 1) { settle(); return; }
    // the curve starts at power × distance ÷ duration: pick the duration that makes that the launch speed
    const D = Math.min(FLICK.maxTime, Math.max(FLICK.minTime, FLICK.power * dist / Math.abs(launch)));
    glideTo(snaps[i], D, FLICK.power, headStartMs);
  }

  // moving by the fingers: 1:1 inside the range; it stops dead at the first and last
  // cards (no bounce past either end)
  function moveBy(dx) {
    x = Math.min(maxX(), Math.max(minX(), x + dx));
    render();
  }

  // recent positions, for the speed at the moment of letting go
  const samples = [];
  const sample = () => { samples.push({ t: performance.now(), x }); if (samples.length > 12) samples.shift(); };
  function releaseSpeed() {
    const now = performance.now();
    const recent = samples.filter((s) => now - s.t <= 100);
    if (recent.length < 2) return 0;
    const a = recent[0], b = recent[recent.length - 1];
    if (now - b.t > 60) return 0;
    const dt = (b.t - a.t) / 1000;
    return dt > 0.008 ? (b.x - a.x) / dt : 0;
  }

  // ---------- trackpad (sideways swipes) ----------
  // macOS keeps sending fading "coasting" events after your fingers lift; the moment
  // they start fading we take over and glide, ignoring the rest of the fade.
  // Each gesture is locked to ONE direction, decided by its first events: a sideways
  // swipe moves only the cards (the page doesn't scroll at all, even though a swipe
  // always carries a little up/down movement too); an up/down swipe scrolls the page
  // as normal. A gesture ends once the events stop for a moment.
  const swipe = { mode: 'idle', lastT: 0, mags: [], times: [], fading: 0, timer: 0, dir: 0, startIndex: 0 };
  // …but the lock is soft: after a scroll or flick, macOS keeps sending "coasting"
  // movement in the old direction for up to a second, so a couple of movements in a row
  // clearly going the OTHER way switch the lock straight away (coasting never changes
  // direction, so this can't be triggered by it).
  const gesture = { axis: null, lastT: 0, other: 0 };
  viewport.addEventListener('wheel', (e) => {
    const now = performance.now();
    if (now - gesture.lastT > 160) gesture.axis = null;     // a new gesture
    gesture.lastT = now;
    const ax = Math.abs(e.deltaX), ay = Math.abs(e.deltaY);
    const dominant = ax >= 2 * ay && ax >= 2 ? 'x' : ay >= 2 * ax && ay >= 2 ? 'y' : null;
    if (!gesture.axis) {
      if (ax < 1 && ay < 1) return;
      gesture.axis = ax > ay ? 'x' : 'y';
      gesture.other = 0;
    } else if (dominant && dominant !== gesture.axis) {
      if (++gesture.other >= 2) {                                // switch direction
        if (gesture.axis === 'x' && swipe.mode === 'track') { clearTimeout(swipe.timer); swipe.mode = 'idle'; settle(); }
        if (dominant === 'x') { swipe.lastT = 0; }               // start a fresh sideways swipe
        gesture.axis = dominant; gesture.other = 0;
      }
    } else if (dominant === gesture.axis) {
      gesture.other = 0;
    }
    if (gesture.axis === 'y') return;                         // up/down: let the page scroll
    e.preventDefault();
    e.stopPropagation();                                      // …and keep the smooth-scroll library from scrolling either
    if (!e.deltaX) return;
    const dx = e.deltaX, mag = Math.abs(dx), dir = Math.sign(dx);
    const w = swipe;
    const prev = w.mags.length ? w.mags[w.mags.length - 1] : 0;
    if (now - w.lastT > (w.mode === 'coast' ? 350 : 140)) {   // a brand-new swipe
      w.mode = 'track'; w.mags = []; w.times = []; w.fading = 0; samples.length = 0; w.startIndex = nearest(x);
    }
    w.lastT = now;
    if (w.mode === 'coast') {
      const reversed = dir !== w.dir && mag > 2;
      const speedingUp = mag >= 4 && mag > Math.max(...w.mags.slice(-3), 0) * 1.2;
      w.mags.push(mag); if (w.mags.length > 8) w.mags.shift();
      if (!reversed && !speedingUp) return;   // just the fade-out: ignore
      w.mode = 'track'; w.fading = 0; w.times = []; samples.length = 0; w.startIndex = nearest(x);
    } else {
      w.mags.push(mag); if (w.mags.length > 8) w.mags.shift();
    }
    w.times.push(now); if (w.times.length > 8) w.times.shift();
    if (glide) stopGlide();
    clearTimeout(w.timer);
    const peak = Math.max(...w.mags);
    w.fading = mag < prev && prev > 0 ? w.fading + 1 : 0;
    // A fast movement that has just started slowing = the fingers lifted mid-flick
    // (macOS's own coasting takes over). The glide takes over from this very event —
    // starting at the fingers' last speed, already "into" its motion by the time since
    // their last movement — so there's no stalled frame or speed-up at the hand-off.
    if (peak >= FLICK.minPeak && w.fading >= 1 && mag < peak * 0.9) {
      const n = w.times.length, span = n >= 3 ? (w.times[n - 2] - w.times[n - 3]) : 16;
      const speed = dir * (prev / Math.max(8, span)) * 1000;      // px/sec, from the last full-speed event
      const sinceLastMove = Math.min(32, Math.max(0, now - (w.times[n - 2] ?? now)));
      w.mode = 'coast';
      release(speed, w.startIndex, sinceLastMove);
      return;
    }
    if (!samples.length) sample();
    moveBy(dx);
    w.dir = dir;
    sample();
    // Otherwise it's a slow swipe or a hold: keep following the fingers. Once they stop
    // (for longer if they stopped abruptly = probably holding), settle onto the nearest card.
    w.timer = setTimeout(() => { if (w.mode === 'track') { w.mode = 'idle'; settle(); } }, w.fading >= 2 ? 150 : FLICK.holdMs);
  }, { passive: false });

  // ---------- dragging (mouse / touch / pen) ----------
  let drag = null;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('.hl-dots')) return;
    stopGlide();
    drag = { id: e.pointerId, lastX: e.clientX, startX: e.clientX, startY: e.clientY, startIndex: nearest(x), axis: null };
    samples.length = 0; sample();
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.axis) {                      // decide: sideways drag, or a vertical scroll on touch?
      const dx = Math.abs(e.clientX - drag.startX), dy = Math.abs(e.clientY - drag.startY);
      if (dx < 4 && dy < 4) return;
      drag.axis = dx > dy ? 'x' : 'y';
      if (drag.axis === 'x') { viewport.classList.add('is-dragging'); try { viewport.setPointerCapture(drag.id); } catch (err) {} }
    }
    if (drag.axis !== 'x') return;
    moveBy(drag.lastX - e.clientX);
    drag.lastX = e.clientX;
    sample();
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const wasX = drag.axis === 'x', startIndex = drag.startIndex;
    drag = null;
    viewport.classList.remove('is-dragging');
    if (wasX) release(releaseSpeed(), startIndex);
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('dragstart', (e) => e.preventDefault());

  // keep the current card in place when the window resizes
  window.addEventListener('resize', () => { const i = nearest(x); stopGlide(); measure(); x = snaps[i]; render(); });
  measure();

  // ---------- intro: the heading and the first card's text fade in, sliding in from the left ----------
  // Replays each time the carousel comes back on screen (resets once it's fully off screen).
  const section = viewport.closest('.cf-highlights');
  if (section && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      if (en.intersectionRatio >= 0.3) section.classList.add('is-in');
      else if (en.intersectionRatio === 0) section.classList.remove('is-in');
    }, { threshold: [0, 0.3] }).observe(section);
  } else if (section) section.classList.add('is-in');

  // ---------- screen recordings (and other card animations): only the card you're on plays ----------
  // It starts once the carousel is almost fully on screen (≥ 90% visible — or, on a window
  // too short for that, as much of it as fits) and that card is the one you're on.
  // Swiping to another card, or scrolling the carousel fully off screen, stops it and
  // rewinds it, so it plays from the start when you come back.
  // A card can hold several recordings that take turns: when one ends, the next slides
  // up over it from below the screen (sitting on its first frame) and, once in place,
  // plays from its start (light → dark → light…).
  const screens = [...viewport.querySelectorAll('.hl-screen')];
  if ('IntersectionObserver' in window) {
    const steps = Array.from({ length: 21 }, (_, i) => i / 20);
    let inView = false;
    const updaters = [];
    screens.forEach((screen) => {
      const vids = [...screen.querySelectorAll('video')];
      const cardIndex = cards.indexOf(screen.closest('.hl-card'));
      let playing = false, cur = 0;

      const reset = () => {
        cur = 0;
        vids.forEach((v, k) => {
          v.pause(); v.currentTime = 0;
          v.classList.remove('is-entering');
          v.classList.toggle('is-current', k === 0);
        });
      };
      reset();

      vids.forEach((v, k) => v.addEventListener('ended', () => {
        if (!playing || k !== cur) return;
        if (vids.length === 1) { v.currentTime = 0; v.play().catch(() => {}); return; }
        const prev = v, next = vids[(k + 1) % vids.length];
        cur = (k + 1) % vids.length;
        next.currentTime = 0;
        next.classList.remove('is-current');
        void next.offsetWidth;                       // start it from below the screen…
        next.classList.add('is-entering');           // …and slide it up over the last one
        next.addEventListener('transitionend', function done(e) {
          if (e.propertyName !== 'transform') return;
          next.removeEventListener('transitionend', done);
          if (!playing || vids[cur] !== next) return;
          next.classList.replace('is-entering', 'is-current');
          next.play().catch(() => {});               // only starts once it's fully in place, so its intro plays unobstructed
          prev.classList.remove('is-current');       // the covered one drops back below, out of sight
          prev.currentTime = 0;
        });
      }));

      updaters.push(() => {
        const should = inView && activeCard === cardIndex;
        if (should && !playing) { playing = true; reset(); vids[0].play().catch(() => {}); }
        else if (!should && playing) { playing = false; reset(); }
      });
    });

    // ---------- logo bubbles: drop in from above and bounce into a pile ----------
    // Choreographed rather than simulated, so they always settle exactly on the Figma
    // layout: bottom ones first, each falling under gravity with a few shrinking bounces
    // (squashing a touch on each landing), rolling sideways into its tilt as it comes down.
    // When one lands, the bubbles it lands on get jostled. It plays whenever you arrive on
    // the card; the pile stays put when you leave, and quickly fades away to drop in
    // again the next time you come back.
    const BOUNCE = {
      gravity: 4200,    // design px/s²
      bounciness: 0.38, // each bounce keeps this much of the speed
      stagger: 0.16,    // s between drops
      squash: 0.1,      // how much a bubble flattens on landing
      jolt: 7,          // px the bubbles underneath get knocked
    };
    const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    viewport.querySelectorAll('.hl-bubbles').forEach((stage) => {
      if (reduceMotion) return;                     // (just the finished pile)
      const cardIndex = cards.indexOf(stage.closest('.hl-card'));
      const G = BOUNCE.gravity;
      const balls = [...stage.querySelectorAll('.hl-bubble')].map((el, n) => {
        const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
        const r = (w + h) / 4;
        return { el, r, cx: parseFloat(el.style.left) + w / 2, cy: parseFloat(el.style.top) + h / 2,
                 rot: parseFloat(el.style.getPropertyValue('--rot')) || 0, n };
      });
      // the lowest bubbles drop first, so the pile builds upwards
      [...balls].sort((a, b) => (b.cy + b.r) - (a.cy + a.r)).forEach((b, k) => {
        b.delay = k * BOUNCE.stagger;
        b.drop = b.cy + b.r + 30;                   // start just above the card
        b.dx = (k % 2 ? 1 : -1) * (24 + (k * 17) % 30);   // drifts in from the side…
        b.roll = -b.dx / b.r * 180 / Math.PI;       // …rolling as it goes
        const vHit = Math.sqrt(2 * G * b.drop);
        b.hits = [{ t: b.delay + vHit / G, v: vHit }];
        for (let v = vHit * BOUNCE.bounciness; v > 90 && b.hits.length < 4; v *= BOUNCE.bounciness) {
          const last = b.hits[b.hits.length - 1];
          b.hits.push({ t: last.t + 2 * last.v * BOUNCE.bounciness / G, v });
        }
        b.hits.forEach((hit, i) => { hit.up = b.hits[i + 1] ? b.hits[i + 1].v : 0; });
        b.end = b.hits[b.hits.length - 1].t + 0.2;
      });
      // who lands on whom: touching bubbles that were already there get knocked
      balls.forEach((b) => { b.knocks = []; });
      balls.forEach((b) => {
        balls.forEach((o) => {
          if (o === b || o.hits[0].t >= b.hits[0].t) return;
          const d = Math.hypot(o.cx - b.cx, o.cy - b.cy);
          if (d < b.r + o.r + 8) o.knocks.push({ t: b.hits[0].t, ux: (o.cx - b.cx) / d, uy: (o.cy - b.cy) / d, a: BOUNCE.jolt * b.r / 130 });
        });
      });
      const total = Math.max(...balls.map((b) => b.end)) + 0.5;

      const ease = (u) => 1 - Math.pow(1 - Math.min(1, Math.max(0, u)), 3);
      function pose(b, t) {
        let y, q = 0;
        if (t < b.hits[0].t) {                      // falling
          const tt = Math.max(0, t - b.delay);
          y = -b.drop + 0.5 * G * tt * tt;
        } else {                                    // bouncing: a little hop after each landing
          let i = b.hits.length - 1;
          while (i > 0 && t < b.hits[i].t) i--;
          const hit = b.hits[i], tau = t - hit.t;
          y = hit.up ? -Math.max(0, hit.up * tau - 0.5 * G * tau * tau) : 0;
          const s = BOUNCE.squash * (hit.v / b.hits[0].v);
          q = s * Math.pow(Math.max(0, 1 - tau / 0.12), 2);   // squash, springing back
        }
        const u = ease((t - b.delay) / (b.hits[0].t - b.delay + 0.35));
        let x = b.dx * (1 - u), rot = b.rot + b.roll * (1 - u);
        (b.knocks || []).forEach((k) => {           // knocked by one landing on top
          const tau = t - k.t;
          if (tau <= 0) return;
          const j = k.a * Math.exp(-tau / 0.12) * Math.sin(tau * Math.PI * 2 / 0.22);
          x += k.ux * j; y += k.uy * j;
        });
        y += q * b.r;                               // (flattened against whatever it landed on)
        return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${(1 + q * 0.8).toFixed(4)}, ${(1 - q).toFixed(4)}) rotate(${rot.toFixed(2)}deg)`;
      }

      let raf = 0, t0 = 0, playing = false;
      function frame(now) {
        const t = (now - t0) / 1000;
        balls.forEach((b) => { b.el.style.transform = pose(b, t); });
        if (t < total) raf = requestAnimationFrame(frame);
        else { raf = 0; balls.forEach((b) => { b.el.style.transform = ''; }); }   // at rest: back to the plain layout
      }
      function reset() {
        cancelAnimationFrame(raf); raf = 0;
        stage.classList.add('is-waiting');
        balls.forEach((b) => { b.el.style.transform = pose(b, 0); });
      }
      reset();
      let shown = false, clearTimer = 0;
      const start = () => {
        reset();
        stage.classList.remove('is-waiting');
        t0 = performance.now(); raf = requestAnimationFrame(frame);
        shown = true;
      };
      updaters.push(() => {
        const should = inView && activeCard === cardIndex;
        if (should && !playing) {
          playing = true;
          if (!shown) return start();
          stage.classList.add('is-clearing');       // fade the old pile away first
          clearTimer = setTimeout(() => { stage.classList.remove('is-clearing'); start(); }, 250);
        } else if (!should && playing) {
          playing = false;
          clearTimeout(clearTimer); stage.classList.remove('is-clearing');   // (left again mid-fade: leave the pile as it was)
        }
      });
    });

    // ---------- interview quotes: pop in one by one, left to right (the delays are in style.css) ----------
    // Like the bubbles, they stay when you leave, and fade away to pop in again when you come back.
    viewport.querySelectorAll('.hl-quotes').forEach((stage) => {
      if (reduceMotion) return;
      const cardIndex = cards.indexOf(stage.closest('.hl-card'));
      stage.classList.add('is-waiting');
      let playing = false, shown = false, clearTimer = 0;
      const start = () => {
        stage.classList.remove('is-clearing');
        stage.classList.add('is-waiting');
        void stage.offsetWidth;                     // (so they animate from hidden)
        stage.classList.remove('is-waiting');
        shown = true;
      };
      updaters.push(() => {
        const should = inView && activeCard === cardIndex;
        if (should && !playing) {
          playing = true;
          if (!shown) return start();
          stage.classList.add('is-clearing');
          clearTimer = setTimeout(start, 250);
        } else if (!should && playing) {
          playing = false;
          clearTimeout(clearTimer); stage.classList.remove('is-clearing');
        }
      });
    });
    const updateAll = () => updaters.forEach((u) => u());
    onActiveCard = updateAll;
    new IntersectionObserver(([en]) => {
      const need = Math.min(0.9, 0.9 * window.innerHeight / en.boundingClientRect.height);
      if (!inView && en.intersectionRatio >= need - 0.001) inView = true;
      else if (inView && en.intersectionRatio === 0) inView = false;
      updateAll();
    }, { threshold: steps }).observe(viewport);
  }
})();
