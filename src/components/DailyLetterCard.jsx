import { useLetters } from "../context/LettersContext";
import { getCategoryAccent } from "../data/categories";
import "./DailyLetterCard.css";

// Deliberately shows nothing but the category and author — no title, no
// excerpt, no Like/Comment actions. Those only appear once you choose to
// open it (openLetter), which is also what removes it from the queue.
export default function DailyLetterCard({ letter }) {
  const { openLetter } = useLetters();
  const accent = getCategoryAccent(letter.category);

  return (
    <button className="daily-letter-card" onClick={() => openLetter(letter)}>
      <span className="daily-letter-card__stamp" style={{ background: accent }}>
        {letter.category}
      </span>
      <p className="daily-letter-card__author">from {letter.author}</p>
      <span className="daily-letter-card__cta">Open to read</span>
    </button>
  );
}
