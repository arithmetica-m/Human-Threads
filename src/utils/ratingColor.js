// Maps a 1-10 day rating onto the site's palette: rough day reads as cool
// stormy blue-grey, an okay day as sage green, a great day as warm
// burnt-sienna gold — same warm/cool language already used for category
// accent colours elsewhere in the app.
const STOPS = [
  { at: 1, rgb: [86, 102, 107] }, // --color-stormy-sky-dark
  { at: 5.5, rgb: [141, 149, 126] }, // --color-sage-green
  { at: 10, rgb: [201, 123, 74] }, // --color-burnt-sienna-light
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function getRatingColor(rating) {
  const value = Math.min(10, Math.max(1, rating));
  let lower = STOPS[0];
  let upper = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (value >= STOPS[i].at && value <= STOPS[i + 1].at) {
      lower = STOPS[i];
      upper = STOPS[i + 1];
      break;
    }
  }
  const span = upper.at - lower.at;
  const t = span === 0 ? 0 : (value - lower.at) / span;
  const rgb = lower.rgb.map((channel, i) => Math.round(lerp(channel, upper.rgb[i], t)));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}
