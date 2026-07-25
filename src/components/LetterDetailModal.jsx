import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useLetters } from "../context/LettersContext";
import { useUser } from "../context/UserContext";
import { getCategoryAccent } from "../data/categories";
import { getBackgroundImage } from "../data/letterBackgrounds";
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon, XIcon } from "./icons";
import defaultTexture from "../assets/images/Screenshot 2026-07-24 215407.png";
import "./LetterDetailModal.css";

const TAB_LABELS = { tips: "Tip", support: "Support", other: "Other" };

export default function LetterDetailModal() {
  const { viewingLetter, closeLetter, openComments, toggleLike } = useLetters();
  const { user, toggleArrayField } = useUser();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!viewingLetter) return undefined;

    const q = query(
      collection(db, "letters", viewingLetter.id, "comments"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [viewingLetter]);

  if (!viewingLetter) return null;

  const letter = viewingLetter;
  const accent = getCategoryAccent(letter.category);
  const texture = getBackgroundImage(letter.backgroundId) || defaultTexture;
  const favorited = (user?.favouriteLetterIds || []).includes(letter.id);
  const liked = (letter.likedByUids || []).includes(user?.uid);
  const likeCount = (letter.likedByUids || []).length;

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
        </div>

        <div className="detail-modal__body">
          <p className="detail-modal__author">from {letter.author}</p>
          <h2 className="detail-modal__title">{letter.title}</h2>
          <p className="detail-modal__text">{letter.excerpt}</p>

          <div className="detail-modal__actions">
            <button
              className={`action ${liked ? "active" : ""}`}
              onClick={() => toggleLike(letter.id, liked)}
            >
              <HeartIcon filled={liked} />
              <span>{likeCount}</span>
            </button>

            <button className="action" onClick={() => openComments(letter)}>
              <CommentIcon />
              <span>{letter.commentCount || 0}</span>
            </button>

            <button className="action" aria-label="Share">
              <ShareIcon />
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
