import { useState } from "react";
import { useLetters } from "../context/LettersContext";
import { useUser } from "../context/UserContext";
import { useApprovedComments } from "../hooks/useApprovedComments";
import { getCategoryAccent } from "../data/categories";
import { getBackgroundImage } from "../data/letterBackgrounds";
import { getSticker } from "../data/stickers";
import { HeartIcon, CommentIcon, BookmarkIcon, XIcon } from "./icons";
import defaultTexture from "../assets/images/Screenshot 2026-07-24 215407.png";
import "./LetterDetailModal.css";

const TAB_LABELS = { tips: "Tip", support: "Support", other: "Other" };

export default function LetterDetailModal() {
  const { viewingLetter, closeLetter, openComments, toggleLike } = useLetters();
  const { user, toggleArrayField } = useUser();
  const [pulsing, setPulsing] = useState(false);
  const comments = useApprovedComments(viewingLetter?.id);

  if (!viewingLetter) return null;

  const letter = viewingLetter;
  const accent = getCategoryAccent(letter.category);
  const texture = getBackgroundImage(letter.backgroundId) || defaultTexture;
  const favorited = (user?.favouriteLetterIds || []).includes(letter.id);
  const liked = (letter.likedByUids || []).includes(user?.uid);
  const likeCount = (letter.likedByUids || []).length;

  const handleLike = () => {
    toggleLike(letter.id, liked);
    if (!liked) {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 650);
    }
  };

  return (
    <div className="detail-overlay" onClick={closeLetter}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detail-modal__close" onClick={closeLetter} aria-label="Close">
          <XIcon />
        </button>

        <div
          className="detail-modal__hero"
          style={{ backgroundImage: `url(${texture})`, "--accent": accent }}
        >
          <span className="detail-modal__stamp">{letter.category}</span>

          {(letter.stickerIds || []).length > 0 && (
            <div className="detail-modal__stickers" aria-hidden="true">
              {letter.stickerIds.map((id) => {
                const sticker = getSticker(id);
                return sticker ? <img key={id} src={sticker.image} alt="" /> : null;
              })}
            </div>
          )}
        </div>

        <div className="detail-modal__body">
          <p className="detail-modal__author">from {letter.author}</p>
          <h2 className="detail-modal__title">{letter.title}</h2>
          <p className="detail-modal__text">{letter.excerpt}</p>

          <div className="detail-modal__actions">
            <button
              className={`action ${liked ? "active" : ""} ${pulsing ? "pulse" : ""}`}
              onClick={handleLike}
            >
              <HeartIcon filled={liked} />
              <span>{likeCount}</span>
            </button>

            <button className="action" onClick={() => openComments(letter)}>
              <CommentIcon />
              <span>{comments.length}</span>
            </button>

            <button
              className={`action ${favorited ? "active" : ""}`}
              onClick={() => toggleArrayField("favouriteLetterIds", letter.id, !favorited)}
            >
              <BookmarkIcon filled={favorited} />
            </button>
          </div>

          <div className="detail-modal__comments">
            <h3>Comments</h3>
            {comments.length === 0 ? (
              <p className="detail-modal__no-comments">
                No comments yet — be the first to respond.
              </p>
            ) : (
              <ul className="detail-modal__comment-list">
                {comments.map((comment) => (
                  <li key={comment.id} className="detail-modal__comment">
                    <span className={`detail-modal__comment-tag detail-modal__comment-tag--${comment.tab}`}>
                      {TAB_LABELS[comment.tab] || "Other"}
                    </span>
                    <p className="detail-modal__comment-text">{comment.text}</p>
                    <p className="detail-modal__comment-author">
                      &mdash; {comment.authorUsername}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
