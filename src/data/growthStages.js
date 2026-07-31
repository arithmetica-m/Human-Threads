// Thresholds are tuned for one person's pace (writing a letter, or
// completing a daily/weekly checklist bumps this by 1 — see
// CommunityContext.jsx's bumpMyGrowth) rather than the much larger,
// community-wide TARGET in TapestryButterfly.jsx.
export const GROWTH_STAGES = [
  { id: "sprout", label: "Sprout", threshold: 0 },
  { id: "flower", label: "Flower", threshold: 6 },
  { id: "plant", label: "Plant", threshold: 14 },
  { id: "tree", label: "Small Tree", threshold: 26 },
  { id: "bloom", label: "Blooming Tree", threshold: 42 },
];

export function getStage(progress) {
  let current = GROWTH_STAGES[0];
  for (const stage of GROWTH_STAGES) {
    if (progress >= stage.threshold) current = stage;
  }
  return current;
}

export function getNextStage(progress) {
  return GROWTH_STAGES.find((stage) => stage.threshold > progress) || null;
}
