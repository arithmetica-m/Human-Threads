import { useMemo } from "react";
import { useGratitude } from "../context/GratitudeContext";
import GratitudeCard from "./GratitudeCard";
import "./GratitudeSection.css";

// Posting happens through the shared compose flow (ComposeButton ->
// ComposeModal, choosing "Gratitude entry") — this section just displays
// the unlimited feed of entries.
export default function GratitudeSection() {
  const { entries, myEntries } = useGratitude();

  // Your own entry (even while pending) should show up right away, merged
  // in with everyone else's approved ones — same dedupe-by-id pattern
  // ProfilePanel.jsx uses for favourites across letters/myLetters.
  const visibleEntries = useMemo(() => {
    return Array.from(
      new Map([...entries, ...myEntries].map((e) => [e.id, e])).values()
    ).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [entries, myEntries]);

  return (
    <div className="gratitude-section">
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
