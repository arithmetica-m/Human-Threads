import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CheckIcon, XIcon } from "./icons";
import "./AdminPanel.css";

export default function AdminPanel({ open, onClose, pendingLetters, pendingComments, pendingCheckins }) {
  if (!open) return null;

  const setLetterStatus = (letterId, status) => {
    updateDoc(doc(db, "letters", letterId), { status }).catch(() => {});
  };

  const setCommentStatus = (letterId, commentId, status) => {
    updateDoc(doc(db, "letters", letterId, "comments", commentId), { status }).catch(() => {});
  };

  const setCheckinStatus = (checkinId, status) => {
    updateDoc(doc(db, "checkins", checkinId), { status }).catch(() => {});
  };

  const total = pendingLetters.length + pendingComments.length + pendingCheckins.length;

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-panel__header">
          <h3>Pending Approval</h3>
          <button type="button" className="admin-panel__close" onClick={onClose} aria-label="Close">
            <XIcon size={16} />
          </button>
        </div>

        <div className="admin-panel__list">
          {total === 0 ? (
            <p className="admin-panel__empty">Nothing waiting on you right now.</p>
          ) : (
            <>
              {pendingLetters.map((letter) => (
                <div key={letter.id} className="admin-row">
                  <span className="admin-row__tag admin-row__tag--letter">Letter</span>
                  <div className="admin-row__body">
                    <p className="admin-row__title">{letter.title}</p>
                    <p className="admin-row__excerpt">{letter.excerpt}</p>
                    <p className="admin-row__meta">
                      {letter.category} &middot; from {letter.author}
                    </p>
                  </div>
                  <div className="admin-row__actions">
                    <button
                      type="button"
                      className="admin-action admin-action--approve"
                      onClick={() => setLetterStatus(letter.id, "approved")}
                      aria-label="Approve letter"
                    >
                      <CheckIcon size={15} />
                    </button>
                    <button
                      type="button"
                      className="admin-action admin-action--reject"
                      onClick={() => setLetterStatus(letter.id, "rejected")}
                      aria-label="Reject letter"
                    >
                      <XIcon size={15} />
                    </button>
                  </div>
                </div>
              ))}

              {pendingComments.map((comment) => (
                <div key={comment.id} className="admin-row">
                  <span className="admin-row__tag admin-row__tag--comment">Comment</span>
                  <div className="admin-row__body">
                    <p className="admin-row__title">on &ldquo;{comment.letterTitle}&rdquo;</p>
                    <p className="admin-row__excerpt">{comment.text}</p>
                    <p className="admin-row__meta">from {comment.authorUsername}</p>
                  </div>
                  <div className="admin-row__actions">
                    <button
                      type="button"
                      className="admin-action admin-action--approve"
                      onClick={() => setCommentStatus(comment.letterId, comment.id, "approved")}
                      aria-label="Approve comment"
                    >
                      <CheckIcon size={15} />
                    </button>
                    <button
                      type="button"
                      className="admin-action admin-action--reject"
                      onClick={() => setCommentStatus(comment.letterId, comment.id, "rejected")}
                      aria-label="Reject comment"
                    >
                      <XIcon size={15} />
                    </button>
                  </div>
                </div>
              ))}

              {pendingCheckins.map((checkin) => (
                <div key={checkin.id} className="admin-row">
                  <span className="admin-row__tag admin-row__tag--comment">Check-in</span>
                  <div className="admin-row__body">
                    <p className="admin-row__title">
                      {checkin.rating}/10 &middot; {checkin.country}
                    </p>
                    <p className="admin-row__excerpt">{checkin.comment || "(no comment)"}</p>
                  </div>
                  <div className="admin-row__actions">
                    <button
                      type="button"
                      className="admin-action admin-action--approve"
                      onClick={() => setCheckinStatus(checkin.id, "approved")}
                      aria-label="Approve check-in"
                    >
                      <CheckIcon size={15} />
                    </button>
                    <button
                      type="button"
                      className="admin-action admin-action--reject"
                      onClick={() => setCheckinStatus(checkin.id, "rejected")}
                      aria-label="Reject check-in"
                    >
                      <XIcon size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
