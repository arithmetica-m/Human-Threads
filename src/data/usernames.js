// Generates the ONE persistent public username assigned at sign-up (shown on
// the profile). This is separate from the fresh random name generated each
// time a letter is submitted (see mockLetters "author" field) — every letter
// gets its own throwaway name so letters can't be linked to each other, but
// the profile keeps a single stable identity for comments/notifications/etc.

const ADJECTIVES = [
  "Quiet", "Wandering", "Gentle", "Hollow", "Faded", "Restless", "Soft", "Silent",
  "Weathered", "Tender", "Distant", "Hidden", "Fleeting", "Careful", "Drifting", "Paper",
];

const NOUNS = [
  "Sparrow", "Fox", "Moon", "Lantern", "Tide", "Storm", "Thunder", "Ash",
  "Ember", "Wren", "River", "Willow", "Harbor", "Meadow", "Compass", "Feather",
];

export function generateUsername() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}
