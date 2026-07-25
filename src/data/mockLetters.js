// SAMPLE DATA — placeholder letters so the feed has something to show.
// Replace with real letters from the backend once accounts/posts exist.
// `size` just drives card sizing on the feed grid (sm | md | lg).

const mockLetters = [
  {
    id: 1,
    author: "Quiet Sparrow",
    category: "Grief",
    title: "To the friend I lost",
    excerpt:
      "I used to think you'd come back one day. I don't think that anymore, but I still leave the porch light on.",
    likes: 34,
    comments: 6,
    size: "lg",
  },
  {
    id: 2,
    author: "Wandering Fox",
    category: "Anxiety",
    title: "To the version of me that couldn't breathe",
    excerpt:
      "You survived that morning. I need you to know that, because some days I forget and have to start over.",
    likes: 51,
    comments: 12,
    size: "md",
    lightBg: true,
  },
  {
    id: 3,
    author: "Hollow Moon",
    category: "Anger",
    title: "To the person who never apologized",
    excerpt:
      "I rehearsed this letter for years. Turns out I didn't need you to read it. I just needed to write it.",
    likes: 28,
    comments: 4,
    size: "sm",
  },
  {
    id: 4,
    author: "Faded Lantern",
    category: "Nostalgia",
    title: "To the summer we thought would never end",
    excerpt:
      "Sometimes a song comes on and I'm sixteen again, sitting on that rooftop, certain nothing bad could ever find us.",
    likes: 62,
    comments: 9,
    size: "lg",
    lightBg: true,
  },
  {
    id: 5,
    author: "Restless Tide",
    category: "Loneliness",
    title: "To whoever else is awake right now",
    excerpt:
      "It's 3am and the apartment is too quiet. If you're reading this, you're not the only one still up.",
    likes: 45,
    comments: 15,
    size: "md",
  },
  {
    id: 6,
    author: "Gentle Storm",
    category: "Fear",
    title: "To the diagnosis I haven't told anyone about",
    excerpt:
      "I keep waiting to feel ready to say it out loud. Writing it here first feels safer.",
    likes: 39,
    comments: 7,
    size: "sm",
    lightBg: true,
  },
  {
    id: 7,
    author: "Soft Thunder",
    category: "Happiness",
    title: "To the stranger who paid for my coffee",
    excerpt:
      "You'll never know what that Tuesday was like for me before you smiled and said 'don't worry about it.'",
    likes: 71,
    comments: 5,
    size: "md",
  },
  {
    id: 8,
    author: "Quiet Ash",
    category: "Change",
    title: "To the job I finally quit",
    excerpt:
      "Five years of shrinking myself to fit somewhere I was never going to grow. I'm still learning how to take up space again.",
    likes: 56,
    comments: 11,
    size: "lg",
    lightBg: true,
  },
  {
    id: 9,
    author: "Silent Ember",
    category: "Invisible Battles",
    title: "To the people who say I don't look sick",
    excerpt:
      "I know. That's kind of the point. Some days getting out of bed is the whole fight, and nobody sees it.",
    likes: 88,
    comments: 20,
    size: "md",
  },
  {
    id: 10,
    author: "Paper Wren",
    category: "Grief",
    title: "A story: the last voicemail",
    excerpt:
      "I never listened to it in real time. I've replayed it forty-two times since, just to hear you say my name once more.",
    likes: 47,
    comments: 8,
    size: "sm",
    lightBg: true,
  },
];

export default mockLetters;
