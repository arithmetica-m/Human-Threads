import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CheckIcon, XIcon } from "./icons";
import "./AdminPanel.css";

export default function AdminPanel({
  open,
  onClose,
  pendingLetters,
  pendingComments,
  pendingCheckins,
  pendingGratitude,
  pendingCategoryMessages,
}) {
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

  const setGratitudeStatus = (entryId, status) => {
    updateDoc(doc(db, "gratitude", entryId), { status }).catch(() => {});
  };

  const setCategoryMessageStatus = (messageId, status) => {
    updateDoc(doc(db, "categoryMessages", messageId), { status }).catch(() => {});
  };

  const total =
    pendingLetters.length +
    pendingComments.length +
    pendingCheckins.length +
    pendingGratitude.length +
    pendingCategoryMessages.length;

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

              {pendingGratitude.map((entry) => (
                <div key={entry.id} className="admin-row">
                  <span className="admin-row__tag admin-row__tag--comment">Gratitude</span>
                  <div className="admin-row__body">
                    {entry.title && <p className="admin-row__title">{entry.title}</p>}
                    <p className="admin-row__excerpt">{entry.excerpt || entry.text}</p>
                    <p className="admin-row__meta">from {entry.authorUsername}</p>
                  </div>
                  <div className="admin-row__actions">
                    <button
                      type="button"
                      className="admin-action admin-action--approve"
                      onClick={() => setGratitudeStatus(entry.id, "approved")}
                      aria-label="Approve gratitude entry"
                    >
                      <CheckIcon size={15} />
                    </button>
                    <button
                      type="button"
                      className="admin-action admin-action--reject"
                      onClick={() => setGratitudeStatus(entry.id, "rejected")}
                      aria-label="Reject gratitude entry"
                    >
                      <XIcon size={15} />
                    </button>
                  </div>
                </div>
              ))}

              {pendingCategoryMessages.map((message) => (
                <div key={message.id} className="admin-row">
                  <span className="admin-row__tag admin-row__tag--comment">Category</span>
                  <div className="admin-row__body">
                    <p className="admin-row__title">
                      {message.category} &middot; {message.tab}
                    </p>
                    <p className="admin-row__excerpt">{message.text}</p>
                    <p className="admin-row__meta">from {message.authorUsername}</p>
                  </div>
                  <div className="admin-row__actions">
                    <button
                      type="button"
                      className="admin-action admin-action--approve"
                      onClick={() => setCategoryMessageStatus(message.id, "approved")}
                      aria-label="Approve category message"
                    >
                      <CheckIcon size={15} />
                    </button>
                    <button
                      type="button"
                      className="admin-action admin-action--reject"
                      onClick={() => setCategoryMessageStatus(message.id, "rejected")}
                      aria-label="Reject category message"
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
