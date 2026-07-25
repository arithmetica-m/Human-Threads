import { useState } from "react";
import { useLetters } from "../context/LettersContext";
import { COMMENT_TABS, COMMENT_EXAMPLES } from "../data/commentExamples";
import { XIcon } from "./icons";
import "./CommentModal.css";

const TAB_LABELS = { tips: "Tips", support: "Support", other: "Other" };

export default function CommentModal() {
  const { commentingOn, closeComments, addComment } = useLetters();
  const [tab, setTab] = useState("support");
  const [customText, setCustomText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!commentingOn) return null;

  const handleClose = () => {
    setTab("support");
    setCustomText("");
    setSending(false);
    setSent(false);
    closeComments();
  };

  const send = async (text) => {
    if (!text.trim() || sending) return;
    setSending(true);
    await addComment(commentingOn.id, { tab, text: text.trim() });
    setSending(false);
    setSent(true);
    setTimeout(handleClose, 1200);
  };

  return (
    <div className="comment-overlay" onClick={handleClose}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="comment-modal__close" onClick={handleClose} aria-label="Close">
          <XIcon />
        </button>

        {sent ? (
          <div className="comment-sent">
            <p>Sent for review — thank you for showing up for someone today.</p>
          </div>
        ) : (
          <>
            <h3>
              Respond to <span>&ldquo;{commentingOn.title}&rdquo;</span>
            </h3>

            <div className="comment-tabs">
              {COMMENT_TABS.map((t) => (
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

            <div className="comment-examples">
              {COMMENT_EXAMPLES[tab].map((example) => (
                <button
                  key={example}
                  type="button"
                  className="comment-example"
                  disabled={sending}
                  onClick={() => send(example)}
                >
                  {example}
                </button>
              ))}
            </div>

            <div className="comment-custom">
              <textarea
                placeholder="Or write your own..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-solid"
                disabled={!customText.trim() || sending}
                onClick={() => send(customText)}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
