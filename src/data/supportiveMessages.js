export const SUPPORTIVE_MESSAGES = [
  "Whatever today looks like, you showed up. That counts.",
  "You don't have to have it figured out yet.",
  "It's okay to move slowly today.",
  "You've gotten through every hard day so far. That's a real track record.",
  "Small steps still count as moving forward.",
  "You're allowed to rest without earning it first.",
  "Someone out there is glad you exist, even if you can't feel it right now.",
  "This feeling is real, but it isn't permanent.",
  "You don't owe anyone a version of yourself you don't have today.",
  "Be as patient with yourself as you would be with someone you love.",
  "You're doing better than you think you are.",
  "It's okay to ask for help. That's not weakness, that's wisdom.",
  "Today doesn't have to be productive to be worthwhile.",
  "You are not your worst day.",
  "Breathing through this moment is enough for right now.",
];

export function getRandomSupportiveMessage() {
  return SUPPORTIVE_MESSAGES[Math.floor(Math.random() * SUPPORTIVE_MESSAGES.length)];
}
