import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useLetters } from "../context/LettersContext";
import { useApprovedComments } from "../hooks/useApprovedComments";
import { getCategoryAccent, getCategoryTint } from "../data/categories";
import { getBackgroundImage } from "../data/letterBackgrounds";
import { HeartIcon, CommentIcon, BookmarkIcon } from "./icons";
import defaultTexture from "../assets/images/Screenshot 2026-07-24 215407.png";
import "./LetterCard.css";

// Simple deterministic hash so Firestore's string doc IDs still produce a
// stable per-card tilt (can't just do id % 2 on a string like before).
function hashId(id) {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000;
  }
  return Math.abs(hash);
}

export default function LetterCard({ letter }) {
  const { user, toggleArrayField } = useUser();
  const { openLetter, openComments, toggleLike } = useLetters();
  const [pulsing, setPulsing] = useState(false);
  const comments = useApprovedComments(letter.id);

  const accent = getCategoryAccent(letter.category);
  const tint = getCategoryTint(letter.category, letter.lightBg);
  const size = letter.size || "md";
  const texture = getBackgroundImage(letter.backgroundId) || defaultTexture;
  const favorited = (user?.favouriteLetterIds || []).includes(letter.id);
  const liked = (letter.likedByUids || []).includes(user?.uid);
  const likeCount = (letter.likedByUids || []).length;

  const hash = hashId(letter.id);
  const rotation = (hash % 2 === 0 ? -1 : 1) * (1 + (hash % 3) * 0.4);

  const handleLike = () => {
    toggleLike(letter.id, liked);
    if (!liked) {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 650);
    }
  };

  return (
    <article
      className={`letter-card letter-card--${size}`}
      style={{
        "--accent": accent,
        "--rotation": `${rotation}deg`,
        backgroundImage: `linear-gradient(${tint}, ${tint}), url(${texture})`,
      }}
      onClick={() => openLetter(letter)}
    >
      {size === "lg" && <span className="letter-card__tape" aria-hidden="true" />}

      <span className="letter-card__stamp">{letter.category}</span>

      <p className="letter-card__author">from {letter.author}</p>
      <h3 className="letter-card__title">{letter.title}</h3>
      <p className="letter-card__excerpt">{letter.excerpt}</p>

      <div className="letter-card__actions" onClick={(e) => e.stopPropagation()}>
        <button
          className={`action ${liked ? "active" : ""} ${pulsing ? "pulse" : ""}`}
          onClick={handleLike}
          aria-label="Like"
        >
          <HeartIcon filled={liked} />
          <span>{likeCount}</span>
        </button>

        <button className="action" aria-label="Comments" onClick={() => openComments(letter)}>
          <CommentIcon />
          <span>{comments.length}</span>
        </button>

        <button
          className={`action ${favorited ? "active" : ""}`}
          onClick={() => toggleArrayField("favouriteLetterIds", letter.id, !favorited)}
          aria-label="Favourite"
        >
          <BookmarkIcon filled={favorited} />
        </button>
      </div>
    </article>
  );
}
