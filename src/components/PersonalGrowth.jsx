import { useUser } from "../context/UserContext";
import { getStage, getNextStage } from "../data/growthStages";
import "./PersonalGrowth.css";

function Ground() {
  return <path d="M20 160 Q80 168 140 160" fill="none" stroke="var(--color-ink)" opacity="0.15" strokeWidth="2" />;
}

function Stem({ x = 80, topY = 90, baseY = 158, curve = 0 }) {
  return (
    <path
      d={`M${x} ${baseY} Q${x + curve} ${(baseY + topY) / 2} ${x} ${topY}`}
      fill="none"
      stroke="var(--color-sage-green)"
      strokeWidth="3"
      strokeLinecap="round"
    />
  );
}

function Leaf({ cx, cy, rotate, size = 16 }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={size}
      ry={size / 2.4}
      transform={`rotate(${rotate} ${cx} ${cy})`}
      fill="var(--color-sage-green-light)"
      stroke="var(--color-sage-green)"
      strokeWidth="1"
    />
  );
}

function FlowerHead({ cx, cy, size = 9 }) {
  const petals = 5;
  return (
    <g>
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i;
        const rad = (angle * Math.PI) / 180;
        const px = cx + Math.cos(rad) * size * 0.7;
        const py = cy + Math.sin(rad) * size * 0.7;
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={size * 0.55}
            ry={size * 0.32}
            transform={`rotate(${angle} ${px} ${py})`}
            fill="var(--color-burnt-sienna-light)"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={size * 0.45} fill="var(--color-burnt-sienna)" />
    </g>
  );
}

function SproutArt() {
  return (
    <>
      <Stem x={80} topY={100} baseY={158} />
      <Leaf cx={68} cy={122} rotate={-35} size={14} />
      <Leaf cx={94} cy={116} rotate={30} size={14} />
    </>
  );
}

function FlowerArt() {
  return (
    <>
      <Stem x={80} topY={78} baseY={158} />
      <Leaf cx={64} cy={120} rotate={-35} size={16} />
      <Leaf cx={98} cy={114} rotate={30} size={16} />
      <FlowerHead cx={80} cy={70} size={12} />
    </>
  );
}

function PlantArt() {
  return (
    <>
      <Stem x={80} topY={70} baseY={158} />
      <Stem x={62} topY={95} baseY={155} curve={-10} />
      <Stem x={100} topY={90} baseY={155} curve={10} />
      <Leaf cx={48} cy={108} rotate={-40} size={15} />
      <Leaf cx={114} cy={102} rotate={35} size={15} />
      <Leaf cx={68} cy={130} rotate={-30} size={14} />
      <Leaf cx={94} cy={126} rotate={30} size={14} />
      <FlowerHead cx={80} cy={62} size={11} />
      <FlowerHead cx={60} cy={92} size={8} />
    </>
  );
}

function TreeArt() {
  return (
    <>
      <path d="M76 158 L80 92 L84 158 Z" fill="var(--color-burnt-sienna)" />
      <circle cx={80} cy={70} r={30} fill="var(--color-sage-green)" />
      <circle cx={58} cy={84} r={20} fill="var(--color-sage-green-light)" />
      <circle cx={104} cy={82} r={20} fill="var(--color-sage-green-light)" />
    </>
  );
}

function BloomArt() {
  const blossoms = [
    [64, 58], [92, 54], [80, 40], [50, 78], [110, 76], [72, 88], [96, 90],
  ];
  return (
    <>
      <path d="M76 158 L80 92 L84 158 Z" fill="var(--color-burnt-sienna)" />
      <circle cx={80} cy={70} r={30} fill="var(--color-sage-green)" />
      <circle cx={58} cy={84} r={20} fill="var(--color-sage-green-light)" />
      <circle cx={104} cy={82} r={20} fill="var(--color-sage-green-light)" />
      {blossoms.map(([bx, by], i) => (
        <circle key={i} cx={bx} cy={by} r={4} fill="var(--color-burnt-sienna-light)" />
      ))}
    </>
  );
}

const STAGE_ART = {
  sprout: SproutArt,
  flower: FlowerArt,
  plant: PlantArt,
  tree: TreeArt,
  bloom: BloomArt,
};

export default function PersonalGrowth() {
  const { user } = useUser();
  const progress = user?.personalGrowthProgress || 0;
  const stage = getStage(progress);
  const next = getNextStage(progress);
  const Art = STAGE_ART[stage.id];

  return (
    <div className="personal-growth">
      <svg viewBox="0 0 160 180" className="personal-growth__svg">
        <Ground />
        <Art />
      </svg>

      <p className="personal-growth__stage">{stage.label}</p>

      {next ? (
        <>
          <div className="personal-growth__bar">
            <div
              className="personal-growth__bar-fill"
              style={{
                width: `${Math.round(
                  ((progress - stage.threshold) / (next.threshold - stage.threshold)) * 100
                )}%`,
              }}
            />
          </div>
          <p className="personal-growth__caption">
            {progress - stage.threshold} of {next.threshold - stage.threshold} toward {next.label}
          </p>
        </>
      ) : (
        <p className="personal-growth__caption">
          Fully grown — every letter and completed activity keeps it blooming.
        </p>
      )}
    </div>
  );
}
