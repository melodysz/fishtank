// PROBLEM CARDS: the little pictures in the three Problem cards all play at the same time,
// over and over, while the cards are on screen:
//   01  the "+" lifts up toward you (its shadow appears), the lightning circle peeks out
//       from behind it and bounces back into hiding, then the "+" settles back down
//   02  a blinking cursor in the empty prompt box types "...", then "?", then deletes it all
//   03  the four shapes hop in place, one slightly after another
// First, as an intro, the cards fan open from a pile like a hand of cards (see INTRO below).
// Resting look + the still fallback: style.css "Problem cards". Timings below.
(() => {
  const cards = document.querySelector('.pb-cards');
  if (!cards) return;

  // FIT: the fanned stage is 1076px wide; on narrower screens shrink it to fit (--pb-s, used in
  // style.css). Phones stack the cards instead, at full size.
  const fan = cards.parentElement;
  const fit = () => fan.style.setProperty('--pb-s', window.innerWidth <= 760 ? 1 : Math.min(1, fan.clientWidth / 1076).toFixed(4));
  fit();
  new ResizeObserver(fit).observe(fan);

  // HOVER: a card lifts and comes to the top of the pile, and stays on top after the cursor
  // leaves (the last card hovered is always on top). It only counts when the mouse actually
  // MOVES over a card once the fan-out has finished: a cursor that was just resting there while
  // the cards fanned out under it doesn't count. (.is-hover = the lift, style.css)
  let top = 10;
  const ready = () => !cards.classList.contains('pb-anim') || cards.classList.contains('is-dealt');
  cards.querySelectorAll('.pb-card').forEach((c) => {
    c.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || window.innerWidth <= 760 || !ready()) return;
      if (!e.movementX && !e.movementY) return;   // (the browser's own "moves" after scrolling or layout changes: not a real one)
      if (c.classList.contains('is-hover')) return;
      c.classList.add('is-hover');
      c.style.zIndex = ++top;
    });
    c.addEventListener('pointerleave', () => c.classList.remove('is-hover'));
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // (stays the still Figma picture)
  cards.classList.add('pb-anim');

  const T = {
    lift: 380,        // 01: the "+" lifting up (and settling back down at the end) (ms)
    liftScale: 1.08,  //     how much bigger it gets when lifted (closer to you)
    peekOut: 520,     //     the lightning sliding out
    peekHold: 700,    //     staying out
    peekIn: 620,      //     bouncing back into hiding
    beforeDrop: 150,  //     pause before the "+" settles down
    blinkFirst: 500,  // 02: the cursor blinking in the empty box before it starts typing (ms)
    typeEach: 230,    //     between each typed dot
    beforeQ: 380,     //     pause before the "?"
    hold: 1000,       //     how long "...?" stays (cursor blinking) before deleting
    deleteEach: 110,  //     between each deleted character (faster than typing)
    hop: 560,         // 03: one hop
    hopHeight: 22,    //     how high (px)
    hopStagger: 110,  //     each shape starts this much after the one before
    loopRest: 900,    // pause after each round before starting over
    dealIn: 650,      // intro: the hand fanning open (ms)
    dealStagger: 40,  //        (phones) 03 starts this much after 01
    fanPivot: 450,    //        how far below the pile's centre the cards turn about (px; smaller = more curve)
    fanOver: 0.04,    //        bounce: how far past their tilt / spot they go before settling (4%; 12% overshot too much)
    liftHand: 36,     //        how much lower the pile starts, so the hand rises as it opens (px)
    handScale: 0.95,  //        and how much smaller
    dealAt: 0.6,      //        starts once the top of the cards is this far up the screen (0.6 = 60% down from the top)
    afterDeal: 150,   // intro: pause before the pictures start playing
  };

  const bolt = cards.querySelector('.pb-chip--bolt');
  const add = cards.querySelector('.pb-chip--add');
  const chars = [...cards.querySelectorAll('.pb-type i')];
  const shapes = [...cards.querySelectorAll('.pb-shape')];

  // only play while the cards are on screen; wait between rounds when they're not
  let visible = false, wake = null;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && wake) { wake(); wake = null; }
  }, { threshold: 0.35 }).observe(cards);
  const whenVisible = () => visible ? Promise.resolve() : new Promise((r) => { wake = r; });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const TUCKED = { translate: '0px 0px', rotate: '0deg' };
  const OUT = { translate: '46px 1px', rotate: '16.67deg' };   // (= the Figma spot)

  // the "+": flat on the card (no shadow) ↔ lifted toward you (a bit bigger, with the Figma shadow)
  const FLAT = { scale: '1', filter: 'drop-shadow(0px 0px 0px rgba(0, 0, 0, 0))' };
  const LIFTED = { scale: String(T.liftScale), filter: 'drop-shadow(4px 4px 2px rgba(0, 0, 0, 0.25))' };

  async function peek() {
    // 1. the "+" lifts up
    const up = add.animate([FLAT, LIFTED], { duration: T.lift, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' });
    await up.finished;
    // 2. the lightning peeks out from behind it…
    const out = bolt.animate([TUCKED, OUT], { duration: T.peekOut, easing: 'cubic-bezier(.2,.9,.3,1.15)', fill: 'forwards' });
    await out.finished;
    await wait(T.peekHold);
    // 3. …and bounces back into hiding: in fast, a little rebound out, then in again
    const r = { translate: '7px 0px', rotate: '2.5deg' };   // (the rebound: peeks back out a touch)
    const back = bolt.animate([
      { ...OUT, offset: 0, easing: 'cubic-bezier(.55,0,.8,.3)' },
      { ...TUCKED, offset: 0.55, easing: 'cubic-bezier(.2,.6,.4,1)' },
      { ...r, offset: 0.75, easing: 'cubic-bezier(.6,0,.8,.4)' },
      { ...TUCKED, offset: 1 },
    ], { duration: T.peekIn, fill: 'forwards' });
    out.cancel();   // (each step starts where the last one ended, so dropping the old one doesn't jump)
    await back.finished;
    back.cancel();  // (back to the CSS resting spot, which is the same place)
    // 4. the "+" settles back down
    await wait(T.beforeDrop);
    const down = add.animate([LIFTED, FLAT], { duration: T.lift, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
    up.cancel();
    await down.finished;
    down.cancel();  // (back to resting flat in CSS)
  }

  // the cursor sits right after the last typed character (n = how many are typed)
  const caret = document.createElement('b');
  caret.className = 'pb-caret';
  chars[0].before(caret);
  function typed(n) {
    chars.forEach((c, i) => c.classList.toggle('is-on', i < n));
    if (n) chars[n - 1].after(caret); else chars[0].before(caret);
  }
  async function type() {
    await wait(T.blinkFirst);
    caret.classList.add('is-typing');   // (solid while typing)
    for (let n = 1; n <= 3; n++) { typed(n); await wait(n < 3 ? T.typeEach : T.beforeQ); }
    typed(4);
    caret.classList.remove('is-typing');   // (blinks while "...?" sits there)
    await wait(T.hold);
    caret.classList.add('is-typing');
    for (let n = 3; n >= 0; n--) { await wait(T.deleteEach); typed(n); }
    caret.classList.remove('is-typing');
  }

  async function hop() {
    const h = T.hopHeight;
    const runs = shapes.map((s, i) => s.animate([
      { translate: '0 0', offset: 0, easing: 'cubic-bezier(.3,.7,.4,1)' },
      { translate: `0 -${h}px`, offset: 0.45, easing: 'cubic-bezier(.6,0,.8,.4)' },
      { translate: '0 0', offset: 0.8 },
      { translate: '0 -3px', offset: 0.9 },   // (a tiny bounce as it lands)
      { translate: '0 0', offset: 1 },
    ], { duration: T.hop, delay: i * T.hopStagger }).finished);
    await Promise.all(runs);
  }

  // INTRO (once, the first time the cards come into view): all three start squared up in a
  // stack on 02's spot (01 under it, 03 on top, as in the fan), then 01 and 03 swing out into
  // their tilted spots, overshooting a touch and settling (on phones, where the cards stack
  // upright, they slide up/down out of the pile instead)
  const [c1, c2, c3] = cards.querySelectorAll('.pb-card');
  const under = (c) => `${c2.offsetLeft - c.offsetLeft}px ${c2.offsetTop - c.offsetTop}px`;   // (offsets ignore transforms)
  const tilt = (c) => getComputedStyle(c).getPropertyValue('--rot').trim() || '0deg';
  function tuck() { [c1, c3].forEach((c) => { c.style.translate = under(c); c.style.rotate = '0deg'; }); c2.style.rotate = '0deg'; }   // (the pile is squared up)
  tuck();
  window.addEventListener('resize', tuck);
  async function dealIn() {
    window.removeEventListener('resize', tuck);
    const pile = (c) => c.style.translate.split(' ').map(parseFloat);   // (offset from its spot to the pile)
    let runs;
    if (window.innerWidth > 760) {
      // FAN: the hand rises a little as it opens. 01 and 03 turn outward round a shared pivot
      // below the pile (only ever outward, with a small bounce past their tilt at the end) while
      // 02, carrying the pile, lifts from slightly lower and smaller into place.
      const h = T.fanPivot, D = T.dealIn;
      const k = Array.from({ length: 21 }, (_, i) => i / 20);   // sample times (enough that the path stays smooth)
      // progress at each sample: a quick ease-out to a small overshoot, then settle
      const prog = (t) => t < 0.72 ? (1 + T.fanOver) * (1 - Math.pow(1 - t / 0.72, 3)) : 1 + T.fanOver * (1 - (t - 0.72) / 0.28) * Math.cos((t - 0.72) / 0.28 * Math.PI / 2);
      const rise = (t) => (1 - prog(t));   // 1 = lowest (start), 0 = in place
      const fanned = (c) => {
        const [px, py] = pile(c), end = parseFloat(tilt(c)), rad = (deg) => deg * Math.PI / 180;
        const fanAt = (a) => [h * Math.sin(rad(a)), h * (1 - Math.cos(rad(a)))];   // where turning by a about the pivot puts it
        const [fx, fy] = fanAt(end);
        return k.map((t) => {
          const p = prog(t), a = end * p, [ax, ay] = fanAt(a);
          // pile → spot: the turn about the pivot, plus a straight share that makes it land exactly
          const x = px + ax + p * (-px - fx), y = py + ay + p * (-py - fy) + T.liftHand * rise(t);
          return { offset: t, translate: `${x}px ${y}px`, rotate: `${a}deg`, scale: String(1 - (1 - T.handScale) * rise(t)) };
        });
      };
      const end2 = parseFloat(tilt(c2));   // (02 turns into its own small tilt as the hand opens)
      const middle = k.map((t) => ({ offset: t, translate: `0px ${T.liftHand * rise(t)}px`, rotate: `${end2 * prog(t)}deg`, scale: String(1 - (1 - T.handScale) * rise(t)) }));
      runs = [
        c1.animate(fanned(c1), { duration: D, fill: 'backwards' }),
        c2.animate(middle, { duration: D, fill: 'backwards' }),
        c3.animate(fanned(c3), { duration: D, fill: 'backwards' }),
      ];
    } else {
      // phones (cards stacked upright): 01 and 03 slide up/down out of the pile
      runs = [c1, c3].map((c, i) => c.animate([
        { translate: c.style.translate, rotate: '0deg', easing: 'cubic-bezier(.3,.7,.35,1)' },
        { translate: '0px 0px', rotate: '0deg' },
      ], { duration: 520, delay: i * T.dealStagger, fill: 'backwards' }));
    }
    [c1, c3].forEach((c) => { c.style.translate = ''; c.style.rotate = ''; });
    c2.style.rotate = '';
    await Promise.all(runs.map((r) => r.finished));
  }

  // (the fan-out waits until the cards are well up the screen, not just peeking in)
  const whenDealable = () => new Promise((r) => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); r(); } },
      { rootMargin: `0px 0px -${Math.round((1 - T.dealAt) * 100)}% 0px` });
    io.observe(fan);
  });

  (async function loop() {
    await whenDealable();
    await dealIn();
    cards.classList.add('is-dealt');   // (card 02's cursor shows up from here on, and hovering works once the mouse moves)
    await wait(T.afterDeal);
    for (;;) {
      await whenVisible();
      await Promise.all([peek(), type(), hop()]);
      await wait(T.loopRest);
    }
  })();
})();
