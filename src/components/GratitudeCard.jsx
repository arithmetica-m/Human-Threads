import "./GratitudeCard.css";

export default function GratitudeCard({ entry }) {
  return (
    <div className="gratitude-card">
      <p className="gratitude-card__text">{entry.text}</p>
      <div className="gratitude-card__meta">
        <span className="gratitude-card__author">— {entry.authorUsername}</span>
        {entry.status === "pending" && (
          <span className="gratitude-card__pending">pending review</span>
        )}
      </div>
    </div>
  );
}
