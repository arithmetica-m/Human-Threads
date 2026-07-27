import "./EncouragingCard.css";

// Purely decorative — the artwork itself carries the message, so no
// overlay text is needed on top of it.
export default function EncouragingCard() {
  return <div className="encouraging-card" role="img" aria-label="You've got this" />;
}
