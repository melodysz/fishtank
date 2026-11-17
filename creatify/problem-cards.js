// PROBLEM CARDS: the little pictures in the three Problem cards all play at the same time,
// over and over, while the cards are on screen:
//   01  the lightning circle peeks out from behind the "+" and tucks back in
//   02  the empty prompt box types "...", then "?", then clears
//   03  the four shapes hop in place, one slightly after another
// First, as an intro, cards 01 + 03 slide out from under 02 (see INTRO below).
// Resting look + the still fallback: style.css "Problem cards". Timings below.
(() => {
  const cards = document.querySelector('.pb-cards');
  if (!cards || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // (stays the still Figma picture)
  cards.classList.add('pb-anim');

  const T = {
    peekOut: 520,     // 01: sliding out (ms)
    peekHold: 900,    //     staying out
    peekIn: 460,      //     tucking back in
    typeEach: 230,    // 02: between each typed dot
    beforeQ: 380,     //     pause before the "?"
    hold: 1000,       //     how long "...?" stays before it clears
    hop: 560,         // 03: one hop
    hopHeight: 22,    //     how high (px)
    hopStagger: 110,  //     each shape starts this much after the one before
    loopRest: 900,    // pause after each round before starting over
    dealIn: 850,      // intro: cards 01 + 03 sliding out from under 02 (ms)
    afterDeal: 150,   // intro: pause before the pictures start playing
  };

  const bolt = cards.querySelector('.pb-chip--bolt');
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

  async function peek() {
    await bolt.animate([TUCKED, OUT], { duration: T.peekOut, easing: 'cubic-bezier(.2,.9,.3,1.15)', fill: 'forwards' }).finished;
    await wait(T.peekHold);
    const back = bolt.animate([OUT, TUCKED], { duration: T.peekIn, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' });
    await back.finished;
    bolt.getAnimations().forEach((a) => a.cancel());   // (back to the CSS resting spot, which is the same place)
  }

  async function type() {
    for (let i = 0; i < 3; i++) { chars[i].classList.add('is-on'); await wait(T.typeEach); }
    await wait(T.beforeQ - T.typeEach);
    chars[3].classList.add('is-on');
    await wait(T.hold);
    chars.forEach((c) => c.classList.remove('is-on'));
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

  // INTRO (once, the first time the cards come into view): 01 and 03 start hidden right
  // under 02 and slide out sideways into their places (on phones, where the cards stack,
  // they slide up/down out from under it instead)
  const [c1, c2, c3] = cards.querySelectorAll('.pb-card');
  const under = (c) => `${c2.offsetLeft - c.offsetLeft}px ${c2.offsetTop - c.offsetTop}px`;   // (offsets ignore transforms)
  function tuck() { c1.style.translate = under(c1); c3.style.translate = under(c3); }
  c2.style.zIndex = 2;
  tuck();
  window.addEventListener('resize', tuck);
  async function dealIn() {
    window.removeEventListener('resize', tuck);
    const ease = { duration: T.dealIn, easing: 'cubic-bezier(.2,.8,.2,1)' };
    const runs = [c1, c3].map((c) => c.animate([{ translate: c.style.translate }, { translate: '0px 0px' }], ease));
    c1.style.translate = c3.style.translate = '';
    await Promise.all(runs.map((r) => r.finished));
  }

  // all three play at once; the next round starts once the longest one (the typing) is done
  (async function loop() {
    await whenVisible();
    await dealIn();
    await wait(T.afterDeal);
    for (;;) {
      await whenVisible();
      await Promise.all([peek(), type(), hop()]);
      await wait(T.loopRest);
    }
  })();
})();
