import { useMemo, useState } from "react";
import { useGratitude, GRATITUDE_MAX_LENGTH } from "../context/GratitudeContext";
import GratitudeCard from "./GratitudeCard";
import "./GratitudeSection.css";

export default function GratitudeSection() {
  const { entries, myEntries, addEntry } = useGratitude();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Your own entry (even while pending) should show up right away, merged
  // in with everyone else's approved ones — same dedupe-by-id pattern
  // ProfilePanel.jsx uses for favourites across letters/myLetters.
  const visibleEntries = useMemo(() => {
    return Array.from(
      new Map([...entries, ...myEntries].map((e) => [e.id, e])).values()
    ).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [entries, myEntries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addEntry(text);
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gratitude-section">
      <form className="gratitude-compose" onSubmit={handleSubmit}>
        <textarea
          placeholder="Something small (or big) you're grateful for today..."
          value={text}
          maxLength={GRATITUDE_MAX_LENGTH}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="gratitude-compose__footer">
          <span className="gratitude-compose__count">
            {text.length}/{GRATITUDE_MAX_LENGTH}
          </span>
          <button type="submit" disabled={!text.trim() || submitting}>
            {submitting ? "Sharing..." : "Share"}
          </button>
        </div>
      </form>

      {visibleEntries.length === 0 ? (
        <p className="gratitude-section__empty">
          Nothing shared yet — be the first to name something good.
        </p>
      ) : (
        <div className="gratitude-list">
          {visibleEntries.map((entry) => (
            <GratitudeCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
