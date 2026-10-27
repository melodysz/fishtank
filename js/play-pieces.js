// PLAY: the artwork on the play page, in the order "Everything!" shows it.
// Edit freely: title, date ('Spring 2025'…) and desc show in the lightbox (an empty date or
// desc is simply left out). imgs = files in play/art/: the board shows the first (thumb/),
// the lightbox shows them all, scrolling (full/); w / h = each one's size, which keeps its
// shape while it loads. cat = which tab it's under (see the buttons in index.html).
window.PLAY_PIECES = [
  { cat: "magazine", title: "UnEarthed issue nº13: Play", date: 'Spring 2024', desc: "",
    imgs: [
      { src: "mag-unearthed-play-1", w: 2520, h: 3240 },
      { src: "mag-unearthed-play-2", w: 2520, h: 3240 },
    ] },
  { cat: "magazine", title: "UnEarthed issue nº14: Connect", date: 'Fall 2024', desc: "",
    imgs: [
      { src: "mag-unearthed-connect-1", w: 2520, h: 3240 },
      { src: "mag-unearthed-connect-2", w: 2520, h: 3240 },
    ] },
  { cat: "magazine", title: "UnEarthed issue nº15: Splash", date: 'Spring 2025', desc: "",
    imgs: [
      { src: "mag-unearthed-splash-1", w: 2520, h: 3240 },
      { src: "mag-unearthed-splash-2", w: 2520, h: 3240 },
    ] },
  { cat: "magazine", title: "UnEarthed issue nº16: Chance", date: 'Fall 2025', desc: "",
    imgs: [
      { src: "mag-ue-chance-00", w: 1994, h: 2600 },
      { src: "mag-ue-chance-01", w: 2600, h: 1696 },
      { src: "mag-ue-chance-02", w: 2600, h: 1696 },
      { src: "mag-ue-chance-03", w: 2600, h: 1696 },
      { src: "mag-ue-chance-04", w: 2600, h: 1696 },
      { src: "mag-ue-chance-05", w: 2600, h: 1696 },
      { src: "mag-ue-chance-06", w: 2600, h: 1696 },
      { src: "mag-ue-chance-07", w: 2600, h: 1696 },
      { src: "mag-ue-chance-08", w: 2600, h: 1696 },
      { src: "mag-ue-chance-09", w: 2600, h: 1696 },
      { src: "mag-ue-chance-10", w: 2600, h: 1696 },
      { src: "mag-ue-chance-11", w: 2600, h: 1696 },
      { src: "mag-ue-chance-12", w: 2600, h: 1696 },
      { src: "mag-ue-chance-13", w: 2600, h: 1696 },
      { src: "mag-ue-chance-14", w: 1994, h: 2600 },
    ] },
  { cat: "fine-art", title: "Elysium", date: '', desc: "",
    imgs: [
      { src: "fa-elysium", w: 3830, h: 2788 },
    ] },
  { cat: "graphic", title: "All the things I probably shouldn’t put on my resume", date: '', desc: "",
    imgs: [
      { src: "gd-resume-things", w: 2671, h: 4096 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-04", w: 1920, h: 1080 },
    ] },
  { cat: "graphic", title: "T-Art artist call", date: '', desc: "",
    imgs: [
      { src: "gd-tart-artist-call", w: 2550, h: 3300 },
    ] },
  { cat: "fine-art", title: "With Heavy Heart", date: '', desc: "",
    imgs: [
      { src: "fa-with-heavy-heart", w: 3002, h: 4032 },
    ] },
  { cat: "magazine", title: "Delusion (zine): cover", date: '', desc: "",
    imgs: [
      { src: "mag-zine-00", w: 1656, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): contents", date: '', desc: "",
    imgs: [
      { src: "mag-zine-01", w: 1656, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): page 1", date: '', desc: "",
    imgs: [
      { src: "mag-zine-02", w: 1656, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): pages 2–3", date: '', desc: "",
    imgs: [
      { src: "mag-zine-spread-02-03", w: 3312, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): page 4", date: '', desc: "",
    imgs: [
      { src: "mag-zine-05", w: 1656, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): page 5", date: '', desc: "",
    imgs: [
      { src: "mag-zine-06", w: 1656, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): page 6", date: '', desc: "",
    imgs: [
      { src: "mag-zine-07", w: 1656, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): page 7", date: '', desc: "",
    imgs: [
      { src: "mag-zine-08", w: 1656, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): page 8", date: '', desc: "",
    imgs: [
      { src: "mag-zine-09", w: 1656, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): page 9", date: '', desc: "",
    imgs: [
      { src: "mag-zine-10", w: 1656, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): page 10", date: '', desc: "",
    imgs: [
      { src: "mag-zine-11", w: 1656, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): page 11", date: '', desc: "",
    imgs: [
      { src: "mag-zine-12", w: 1656, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): pages 12–13", date: '', desc: "",
    imgs: [
      { src: "mag-zine-spread-12-13", w: 3312, h: 2520 },
    ] },
  { cat: "magazine", title: "Delusion (zine): back cover", date: '', desc: "",
    imgs: [
      { src: "mag-zine-15", w: 1656, h: 2520 },
    ] },
  { cat: "merch", title: "Fruit stickerz", date: '', desc: "",
    imgs: [
      { src: "merch-fruit-stickerz", w: 1961, h: 1901 },
    ] },
  { cat: "sculpture", title: "Catch 22", date: '', desc: "Mixed media: the artist’s cast hands, shaped wire mesh, copper sculpture, white stool. 36 × 15 × 15.",
    imgs: [
      { src: "sc-catch-22", w: 3144, h: 1988 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-02", w: 1920, h: 1080 },
    ] },
  { cat: "magazine", title: "Filtering", date: '', desc: "",
    imgs: [
      { src: "mag-filtering", w: 2520, h: 3240 },
    ] },
  { cat: "merch", title: "James Baker is UNC", date: '', desc: "",
    imgs: [
      { src: "merch-james-baker", w: 2448, h: 3168 },
    ] },
  { cat: "sculpture", title: "Bloom Series: Arpeggio", date: '', desc: "Wooden skewers and popsicle sticks. 20 × 21 × 18.",
    imgs: [
      { src: "sc-arpeggio-1", w: 2217, h: 1265 },
      { src: "sc-arpeggio-2", w: 2217, h: 1265 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-03", w: 1920, h: 1080 },
    ] },
  { cat: "magazine", title: "Untitled spread", date: '', desc: "",
    imgs: [
      { src: "mag-img-2038", w: 3426, h: 2252 },
    ] },
  { cat: "graphic", title: "Elmira typography billboard", date: '', desc: "",
    imgs: [
      { src: "gd-elmira-billboard", w: 5100, h: 3300 },
    ] },
  { cat: "fine-art", title: "Abstract fishies", date: '', desc: "Charcoal.",
    imgs: [
      { src: "fa-abstract-fishies", w: 3024, h: 4032 },
    ] },
  { cat: "merch", title: "Penn Spark", date: '', desc: "",
    imgs: [
      { src: "merch-penn-spark", w: 2449, h: 3168 },
    ] },
  { cat: "sculpture", title: "Bloom Series: Plummage", date: '', desc: "Mixed media: ribbon, styrofoam, wood skewers, plastic pearls. 18 × 18 × 12.",
    imgs: [
      { src: "sc-plummage", w: 3338, h: 2236 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-01", w: 1920, h: 1080 },
    ] },
  { cat: "magazine", title: "Untitled spread", date: '', desc: "",
    imgs: [
      { src: "mag-artboard-14", w: 4096, h: 2671 },
    ] },
  { cat: "graphic", title: "Elmira typography poster", date: '', desc: "",
    imgs: [
      { src: "gd-elmira-poster", w: 3300, h: 5100 },
    ] },
  { cat: "fine-art", title: "Chalk pastel study", date: '', desc: "Chalk pastel.",
    imgs: [
      { src: "fa-chalk-pastel-study", w: 2802, h: 3784 },
    ] },
  { cat: "merch", title: "Monakisu", date: '', desc: "",
    imgs: [
      { src: "merch-monakisu", w: 4048, h: 3184 },
    ] },
  { cat: "sculpture", title: "Fragile Connection", date: '', desc: "Mixed media: fencing mesh, cast hands, yarn. 37 × 8 × 8.",
    imgs: [
      { src: "sc-fragile-connection", w: 1742, h: 1386 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-savingpng-4", w: 1920, h: 1080 },
    ] },
  { cat: "graphic", title: "Elmira visual identity poster", date: '', desc: "",
    imgs: [
      { src: "gd-elmira-poster-pdf", w: 1734, h: 2600 },
    ] },
  { cat: "fine-art", title: "Be Nice to Your Brother!!", date: '', desc: "",
    imgs: [
      { src: "fa-be-nice-to-your-brother", w: 3871, h: 2089 },
    ] },
  { cat: "merch", title: "UnEarthed hoodie", date: '', desc: "",
    imgs: [
      { src: "merch-hoodie-1", w: 1080, h: 1350 },
      { src: "merch-hoodie-2", w: 1080, h: 1350 },
    ] },
  { cat: "sculpture", title: "Popsicle Prow", date: '', desc: "Mixed media: popsicle sticks, LEDs, wood skewers. 6 × 9 × 5.",
    imgs: [
      { src: "sc-popsicle-prow", w: 3698, h: 2234 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-savingpng-5", w: 1920, h: 1080 },
    ] },
  { cat: "graphic", title: "Elmira visual identity brochure", date: '', desc: "",
    imgs: [
      { src: "gd-elmira-brochure-00", w: 1625, h: 2600 },
      { src: "gd-elmira-brochure-01", w: 2600, h: 2080 },
      { src: "gd-elmira-brochure-02", w: 2600, h: 2080 },
      { src: "gd-elmira-brochure-03", w: 2600, h: 2080 },
      { src: "gd-elmira-brochure-04", w: 1625, h: 2600 },
    ] },
  { cat: "merch", title: "UnEarthed tote bag", date: '', desc: "",
    imgs: [
      { src: "merch-tote", w: 844, h: 1198 },
    ] },
  { cat: "sculpture", title: "Untitled sculpture", date: '', desc: "",
    imgs: [
      { src: "sc-30", w: 3714, h: 2196 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-img-9767", w: 1920, h: 1080 },
    ] },
  { cat: "graphic", title: "Pent Up: a collection of unsent messages", date: '', desc: "",
    imgs: [
      { src: "gd-unsent-messages-flyer", w: 1579, h: 2043 },
    ] },
  { cat: "fine-art", title: "Filial Love", date: '', desc: "",
    imgs: [
      { src: "fa-filial-love", w: 3736, h: 2168 },
    ] },
  { cat: "sculpture", title: "Hubris", date: '', desc: "Mixed media: ivy, cast hand, wire mesh, acrylic. 44 × 38 × 18.",
    imgs: [
      { src: "sc-hubris", w: 1956, h: 1265 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-img-0741", w: 1920, h: 1080 },
    ] },
  { cat: "fine-art", title: "Flying Free on the Sea", date: '', desc: "",
    imgs: [
      { src: "fa-flying-free-on-the-sea", w: 2837, h: 3823 },
    ] },
  { cat: "sculpture", title: "Unnatural Movements", date: '', desc: "Mixed media: suspended twisted copper wire, silk flower. 10 × 7 × 4.",
    imgs: [
      { src: "sc-unnatural-movements-1", w: 3108, h: 2000 },
      { src: "sc-unnatural-movements-2", w: 2874, h: 1996 },
    ] },
  { cat: "magazine", title: "Steam", date: '', desc: "",
    imgs: [
      { src: "mag-steam", w: 2520, h: 3240 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-img-1627", w: 2101, h: 1060 },
    ] },
  { cat: "magazine", title: "UnEarthed: Theatre", date: '', desc: "",
    imgs: [
      { src: "mag-ue-theatre", w: 2600, h: 1696 },
    ] },
  { cat: "fine-art", title: "Flying toward Potala Palace", date: '', desc: "",
    imgs: [
      { src: "fa-flying-toward-potala", w: 611, h: 799 },
    ] },
  { cat: "sculpture", title: "GDPC boxes", date: '', desc: "",
    imgs: [
      { src: "sc-gdpc-boxes-0", w: 4032, h: 3024 },
      { src: "sc-gdpc-boxes-1", w: 4032, h: 3024 },
      { src: "sc-gdpc-boxes-2", w: 3024, h: 4032 },
      { src: "sc-gdpc-boxes-3", w: 4032, h: 3024 },
      { src: "sc-gdpc-boxes-4", w: 3024, h: 4032 },
      { src: "sc-gdpc-boxes-5", w: 4032, h: 3024 },
      { src: "sc-gdpc-boxes-6", w: 4032, h: 3024 },
      { src: "sc-gdpc-boxes-7", w: 3024, h: 4032 },
      { src: "sc-gdpc-boxes-sketch-0", w: 3024, h: 4032 },
      { src: "sc-gdpc-boxes-sketch-1", w: 3024, h: 4032 },
    ] },
  { cat: "fine-art", title: "Abstract insects", date: '', desc: "Charcoal.",
    imgs: [
      { src: "fa-abstract-insects", w: 2806, h: 3840 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-img-2043", w: 1920, h: 1080 },
    ] },
  { cat: "magazine", title: "UnEarthed: A Sea Turtle’s Journey", date: '', desc: "",
    imgs: [
      { src: "mag-ue-turtle", w: 2600, h: 1683 },
    ] },
  { cat: "fine-art", title: "Wings of Peace", date: '', desc: "",
    imgs: [
      { src: "fa-wings-of-peace", w: 2903, h: 3909 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-204c1a3f", w: 4096, h: 2650 },
    ] },
  { cat: "magazine", title: "UnEarthed: Word Play", date: '', desc: "",
    imgs: [
      { src: "mag-ue-word-play", w: 2023, h: 2600 },
    ] },
  { cat: "fine-art", title: "Bicycle of Bygone Steps", date: '', desc: "Charcoal.",
    imgs: [
      { src: "fa-bicycle-bygone-steps", w: 3024, h: 4032 },
    ] },
  { cat: "illustration", title: "Untitled illustration", date: '', desc: "",
    imgs: [
      { src: "ill-savingpng-2", w: 4096, h: 2847 },
    ] },
  { cat: "magazine", title: "Word4Word: health literacy", date: '', desc: "",
    imgs: [
      { src: "mag-w4w-health-literacy-00", w: 2600, h: 1696 },
      { src: "mag-w4w-health-literacy-01", w: 2600, h: 1696 },
      { src: "mag-w4w-health-literacy-02", w: 2600, h: 1696 },
      { src: "mag-w4w-health-literacy-03", w: 2600, h: 1696 },
      { src: "mag-w4w-health-literacy-04", w: 2600, h: 1696 },
      { src: "mag-w4w-health-literacy-05", w: 2600, h: 1696 },
    ] },
  { cat: "fine-art", title: "My Ocean Blue", date: '', desc: "",
    imgs: [
      { src: "fa-my-ocean-blue", w: 3133, h: 2046 },
    ] },
  { cat: "illustration", title: "GDPC sci-fi landscape", date: '', desc: "",
    imgs: [
      { src: "ill-gdpc-scifi-landscape", w: 1536, h: 2048 },
    ] },
  { cat: "magazine", title: "Word4Word: universal design for disability", date: '', desc: "",
    imgs: [
      { src: "mag-w4w-universal-design-00", w: 2600, h: 1696 },
      { src: "mag-w4w-universal-design-01", w: 2600, h: 1696 },
    ] },
  { cat: "fine-art", title: "True Colors", date: '', desc: "",
    imgs: [
      { src: "fa-true-colors", w: 2929, h: 3905 },
    ] },
  { cat: "illustration", title: "The Daily Pennsylvanian: the Alien franchise", date: '', desc: "",
    imgs: [
      { src: "ill-dp-alien-franchise", w: 1920, h: 1080 },
    ] },
  { cat: "fine-art", title: "Spring Again", date: '', desc: "",
    imgs: [
      { src: "fa-spring-again", w: 2864, h: 3821 },
    ] },
  { cat: "illustration", title: "The Daily Pennsylvanian: horror movies", date: '', desc: "",
    imgs: [
      { src: "ill-dp-horror-movies", w: 1920, h: 1080 },
    ] },
];
