import { useCommunity } from "../context/CommunityContext";
import "./TapestryButterfly.css";

// How many "threads" (one per letter sent / daily-or-weekly activity
// completed, community-wide) it takes to finish weaving the butterfly.
// Deliberately high so it forms slowly over weeks, not in a single day.
const TARGET = 140;

const COLORS = [
  "var(--color-burnt-sienna)",
  "var(--color-sage-green)",
  "var(--color-stormy-sky)",
  "var(--color-burnt-sienna-light)",
  "var(--color-sage-green-light)",
  "var(--color-stormy-sky-dark)",
];

// Deterministic pseudo-random generator (seeded) — every visitor sees the
// exact same thread layout without us having to store 140 coordinates in
// Firestore; only the single progress number is shared.
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const THREADS = (() => {
  const rand = seededRandom(42);
  const threads = [];
  for (let i = 0; i < TARGET; i++) {
    threads.push({
      x1: rand() * 300,
      y1: rand() * 260,
      x2: rand() * 300,
      y2: rand() * 260,
      color: COLORS[Math.floor(rand() * COLORS.length)],
      width: 1 + rand() * 1.5,
    });
  }
  return threads;
})();

const WING_SHAPES = [
  { cx: 150, cy: 130, rx: 6, ry: 70, rotate: 0 }, // body
  { cx: 95, cy: 90, rx: 65, ry: 50, rotate: -15 }, // left upper wing
  { cx: 105, cy: 170, rx: 45, ry: 40, rotate: 10 }, // left lower wing
  { cx: 205, cy: 90, rx: 65, ry: 50, rotate: 15 }, // right upper wing
  { cx: 195, cy: 170, rx: 45, ry: 40, rotate: -10 }, // right lower wing
];

export default function TapestryButterfly() {
  const { stats } = useCommunity();
  const progress = Math.min(stats?.tapestryProgress || 0, TARGET);
  const complete = progress >= TARGET;

  return (
    <div className="tapestry">
      <svg viewBox="0 0 300 260" className="tapestry__svg">
        <defs>
          <clipPath id="butterfly-clip">
            {WING_SHAPES.map((w, i) => (
              <ellipse
                key={i}
                cx={w.cx}
                cy={w.cy}
                rx={w.rx}
                ry={w.ry}
                transform={`rotate(${w.rotate} ${w.cx} ${w.cy})`}
              />
            ))}
          </clipPath>
        </defs>

        <g clipPath="url(#butterfly-clip)">
          <rect x="0" y="0" width="300" height="260" fill="rgba(51, 36, 26, 0.04)" />
          {THREADS.slice(0, progress).map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.color}
              strokeWidth={t.width}
              strokeLinecap="round"
              opacity="0.85"
            />
          ))}
        </g>

        <g fill="none" stroke="rgba(51, 36, 26, 0.15)" strokeWidth="1">
          {WING_SHAPES.map((w, i) => (
            <ellipse
              key={i}
              cx={w.cx}
              cy={w.cy}
              rx={w.rx}
              ry={w.ry}
              transform={`rotate(${w.rotate} ${w.cx} ${w.cy})`}
            />
          ))}
        </g>
      </svg>

      <p className="tapestry__caption">
        {complete
          ? "The tapestry is complete — a new one will begin soon."
          : `${progress} of ${TARGET} threads woven by the community so far.`}
      </p>
    </div>
  );
}
