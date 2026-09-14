import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "../context/UserContext";
import { useLetters } from "../context/LettersContext";
import { EMOTIONS, getCategoryAccent } from "../data/categories";
import { XIcon } from "./icons";
import "./CategoriesModal.css";

const TABS = ["support", "tip", "other"];
const TAB_LABELS = { support: "Support", tip: "Tips", other: "Other" };

// Deliberately self-contained rather than a Context/Provider — the category
// discussion data is only ever needed while this modal is open for one
// specific category, so the listeners mount/unmount with the selection
// instead of running for the whole app's lifetime.
export default function CategoriesModal({ open, onClose }) {
  const { user } = useUser();
  const { letters } = useLetters();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tab, setTab] = useState("support");
  const [messages, setMessages] = useState([]);
  const [myMessages, setMyMessages] = useState([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts = {};
    EMOTIONS.forEach((c) => {
      counts[c] = 0;
    });
    letters.forEach((l) => {
      if (counts[l.category] !== undefined) counts[l.category] += 1;
    });
    return counts;
  }, [letters]);

  useEffect(() => {
    if (!selectedCategory) {
      setMessages([]);
      return undefined;
    }
    // Equality filters only (category + status), no orderBy — sorted
    // client-side instead, so this doesn't need a composite index.
    const q = query(
      collection(db, "categoryMessages"),
      where("category", "==", selectedCategory),
      where("status", "==", "approved")
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedCategory || !user) {
      setMyMessages([]);
      return undefined;
    }
    const q = query(
      collection(db, "categoryMessages"),
      where("category", "==", selectedCategory),
      where("authorUid", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setMyMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [selectedCategory, user?.uid]);

  if (!open) return null;

  const closeAll = () => {
    setSelectedCategory(null);
    setTab("support");
    setText("");
    onClose();
  };

  const visibleMessages = Array.from(
    new Map([...messages, ...myMessages].map((m) => [m.id, m])).values()
  )
    .filter((m) => m.tab === tab)
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const handleSend = async () => {
    if (!text.trim() || submitting || !selectedCategory) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "categoryMessages"), {
        category: selectedCategory,
        authorUid: user.uid,
        authorUsername: user.username,
        tab,
        text: text.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="categories-overlay" onClick={closeAll}>
      <div className="categories-modal" onClick={(e) => e.stopPropagation()}>
        <button className="categories-modal__close" onClick={closeAll} aria-label="Close">
          <XIcon />
        </button>

        {!selectedCategory ? (
          <div className="categories-modal__scroll">
            <h2 className="categories-modal__title">Categories</h2>
            <div className="category-list">
              {EMOTIONS.map((category) => (
                <button
                  key={category}
                  className="category-row"
                  onClick={() => setSelectedCategory(category)}
                >
                  <span
                    className="category-row__dot"
                    style={{ background: getCategoryAccent(category) }}
                  />
                  <span className="category-row__name">{category}</span>
                  <span className="category-row__count">
                    {categoryCounts[category]}{" "}
                    {categoryCounts[category] === 1 ? "letter" : "letters"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="categories-modal__scroll">
            <button className="categories-modal__back" onClick={() => setSelectedCategory(null)}>
              &larr; Back to categories
            </button>
            <h2 className="categories-modal__title">{selectedCategory}</h2>
            <p className="categories-modal__count">
              {categoryCounts[selectedCategory]}{" "}
              {categoryCounts[selectedCategory] === 1 ? "letter" : "letters"} written in this
              category
            </p>

            <div className="category-tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={tab === t ? "active" : ""}
                  onClick={() => setTab(t)}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            <div className="category-message-list">
              {visibleMessages.length === 0 ? (
                <p className="category-message-list__empty">
                  Nothing here yet — be the first to share {TAB_LABELS[tab].toLowerCase()} for{" "}
                  {selectedCategory}.
                </p>
              ) : (
                visibleMessages.map((m) => (
                  <div key={m.id} className="category-message">
                    <p className="category-message__text">{m.text}</p>
                    <div className="category-message__meta">
                      <span>&mdash; {m.authorUsername}</span>
                      {m.status === "pending" && (
                        <span className="category-message__pending">pending review</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="category-compose">
              <textarea
                placeholder={`Share ${TAB_LABELS[tab].toLowerCase()} for ${selectedCategory}...`}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                type="button"
                disabled={!text.trim() || submitting}
                onClick={handleSend}
              >
                {submitting ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
