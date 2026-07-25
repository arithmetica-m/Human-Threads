export const EMOTIONS = [
  "Fear",
  "Anxiety",
  "Anger",
  "Grief",
  "Nostalgia",
  "Loneliness",
  "Happiness",
  "Change",
  "Invisible Battles",
];

const ACCENTS = {
  Fear: "var(--color-stormy-sky)",
  Anxiety: "var(--color-stormy-sky-dark)",
  Anger: "var(--color-burnt-sienna)",
  Grief: "var(--color-ink)",
  Nostalgia: "var(--color-sage-green)",
  Loneliness: "var(--color-stormy-sky-dark)",
  Happiness: "var(--color-sage-green-light)",
  Change: "var(--color-burnt-sienna-light)",
  "Invisible Battles": "var(--color-ink)",
};

export function getCategoryAccent(category) {
  return ACCENTS[category] || "var(--color-stormy-sky)";
}

// Low-opacity rgba versions of the accents, used for the watercolour-wash
// card backgrounds so each card's tint loosely matches its emotion.
const TINTS = {
  Fear: "rgba(120, 137, 143, 0.3)",
  Anxiety: "rgba(86, 102, 107, 0.3)",
  Anger: "rgba(152, 66, 22, 0.22)",
  Grief: "rgba(51, 36, 26, 0.16)",
  Nostalgia: "rgba(141, 149, 126, 0.3)",
  Loneliness: "rgba(86, 102, 107, 0.3)",
  Happiness: "rgba(183, 192, 169, 0.35)",
  Change: "rgba(201, 123, 74, 0.26)",
  "Invisible Battles": "rgba(51, 36, 26, 0.16)",
};

// Lighter versions of the same tints, used on cards flagged `lightBg` so the
// feed isn't uniformly dark/peachy — some cards read almost like plain paper.
const TINTS_LIGHT = {
  Fear: "rgba(120, 137, 143, 0.12)",
  Anxiety: "rgba(86, 102, 107, 0.12)",
  Anger: "rgba(152, 66, 22, 0.08)",
  Grief: "rgba(51, 36, 26, 0.06)",
  Nostalgia: "rgba(141, 149, 126, 0.12)",
  Loneliness: "rgba(86, 102, 107, 0.12)",
  Happiness: "rgba(183, 192, 169, 0.14)",
  Change: "rgba(201, 123, 74, 0.1)",
  "Invisible Battles": "rgba(51, 36, 26, 0.06)",
};

export function getCategoryTint(category, light = false) {
  const map = light ? TINTS_LIGHT : TINTS;
  return map[category] || (light ? "rgba(120, 137, 143, 0.12)" : "rgba(120, 137, 143, 0.3)");
}
