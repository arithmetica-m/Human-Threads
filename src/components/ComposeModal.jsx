import { useMemo, useState } from "react";
import { useLetters } from "../context/LettersContext";
import { useGratitude } from "../context/GratitudeContext";
import { EMOTIONS } from "../data/categories";
import { LETTER_BACKGROUNDS } from "../data/letterBackgrounds";
import { STICKERS, MAX_STICKERS } from "../data/stickers";
import { generateUsername } from "../data/usernames";
import { XIcon, PencilIcon } from "./icons";
import "./ComposeModal.css";

const STEP_LABELS = {
  type: "Type",
  background: "Background",
  stickers: "Stickers",
  category: "Category",
  write: "Write",
};
const MAX_WORDS = 500;

function estimateSize(text) {
  if (text.length < 120) return "sm";
  if (text.length < 320) return "md";
  return "lg";
}

function countWords(text) {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

export default function ComposeModal({ open, onClose }) {
  const { addLetter } = useLetters();
  const { addEntry } = useGratitude();
  const [entryType, setEntryType] = useState(null);
  const [step, setStep] = useState("type");
  const [background, setBackground] = useState(null);
  const [stickerIds, setStickerIds] = useState([]);
  const [category, setCategory] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Gratitude entries share every step with letters except choosing a
  // category — there's nothing to pick, since they're always just gratitude.
  const STEPS = useMemo(
    () => ["type", "background", "stickers", ...(entryType === "gratitude" ? [] : ["category"]), "write"],
    [entryType]
  );

  if (!open) return null;

  const stepIndex = STEPS.indexOf(step);
  const wordCount = countWords(body);
  const overLimit = wordCount > MAX_WORDS;
  const isGratitude = entryType === "gratitude";

  const reset = () => {
    setEntryType(null);
    setStep("type");
    setBackground(null);
    setStickerIds([]);
    setCategory(null);
    setTitle("");
    setBody("");
    setSending(false);
    setSent(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const goToStep = (targetStep) => {
    // only allow jumping to a step already reached, so you can revisit
    // the background/category choice without losing what you've written
    if (STEPS.indexOf(targetStep) <= stepIndex) {
      setStep(targetStep);
    }
  };

  const toggleSticker = (id) => {
    setStickerIds((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_STICKERS) return prev;
      return [...prev, id];
    });
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim() || sending || overLimit) return;
    setSending(true);

    if (isGratitude) {
      await addEntry({
        title: title.trim(),
        excerpt: body.trim(),
        backgroundId: background?.id ?? null,
        stickerIds,
      });
    } else {
      await addLetter({
        author: generateUsername(),
        category,
        title: title.trim(),
        excerpt: body.trim(),
        size: estimateSize(body.trim()),
        backgroundId: background?.id ?? null,
        stickerIds,
      });
    }

    setSending(false);
    setSent(true);
    setTimeout(() => {
      reset();
      onClose();
    }, 1600);
  };

  return (
    <div className="compose-overlay" onClick={handleClose}>
      <div className="compose-modal" onClick={(e) => e.stopPropagation()}>
        <button className="compose-modal__close" onClick={handleClose} aria-label="Close">
          <XIcon />
        </button>

        <div className="compose-modal__steps">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              className={`compose-step ${step === s ? "active" : ""} ${
                i < stepIndex ? "done" : ""
              }`}
              onClick={() => goToStep(s)}
              disabled={i > stepIndex}
            >
              <span className="compose-step__num">{i + 1}</span>
              <span className="compose-step__label">{STEP_LABELS[s]}</span>
            </button>
          ))}
        </div>

        <div className="compose-modal__body">
          {sent ? (
            <div className="compose-sent">
              <p>
                {isGratitude
                  ? "Your gratitude entry has been sent for review. Once it's approved, it'll appear for others to see."
                  : "Your letter has been sent for review. Once it's approved, it'll appear in the feed for others to read."}
              </p>
            </div>
          ) : (
          <>
          {step === "type" && (
            <div className="compose-panel">
              <h3>What would you like to write?</h3>
              <div className="category-grid">
                <button
                  type="button"
                  className={`category-option ${entryType === "letter" ? "selected" : ""}`}
                  onClick={() => setEntryType("letter")}
                >
                  Letter
                </button>
                <button
                  type="button"
                  className={`category-option ${entryType === "gratitude" ? "selected" : ""}`}
                  onClick={() => setEntryType("gratitude")}
                >
                  Gratitude entry
                </button>
              </div>
            </div>
          )}

          {step === "background" && (
            <div className="compose-panel">
              <h3>Choose a background for your {isGratitude ? "gratitude entry" : "letter"}</h3>
              <div className="bg-grid">
                {LETTER_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    className={`bg-option ${background?.id === bg.id ? "selected" : ""}`}
                    style={{ backgroundImage: `url(${bg.image})` }}
                    onClick={() => setBackground(bg)}
                  >
                    <span>{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "stickers" && (
            <div className="compose-panel">
              <h3>Decorate your {isGratitude ? "gratitude entry" : "letter"} with stickers</h3>
              <p className="compose-panel__hint">
                Optional — pick up to {MAX_STICKERS}.
              </p>
              <div className="sticker-grid">
                {STICKERS.map((sticker) => {
                  const selected = stickerIds.includes(sticker.id);
                  const disabled = !selected && stickerIds.length >= MAX_STICKERS;
                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      className={`sticker-option ${selected ? "selected" : ""}`}
                      disabled={disabled}
                      onClick={() => toggleSticker(sticker.id)}
                    >
                      <img src={sticker.image} alt={sticker.label} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "category" && (
            <div className="compose-panel">
              <h3>Choose a category</h3>
              <div className="category-grid">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    className={`category-option ${category === emotion ? "selected" : ""}`}
                    onClick={() => setCategory(emotion)}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "write" && (
            <div
              className="compose-write"
              style={
                background ? { backgroundImage: `url(${background.image})` } : undefined
              }
            >
              {stickerIds.length > 0 && (
                <div className="compose-write__stickers">
                  {stickerIds.map((id) => {
                    const sticker = STICKERS.find((s) => s.id === id);
                    return sticker ? (
                      <img key={id} src={sticker.image} alt={sticker.label} />
                    ) : null;
                  })}
                </div>
              )}
              <div className="compose-write__panel">
                {category && <span className="compose-write__category">{category}</span>}
                {isGratitude && <span className="compose-write__category">Gratitude</span>}
                <input
                  className="compose-write__title"
                  type="text"
                  placeholder={`Give your ${isGratitude ? "gratitude entry" : "letter"} a title...`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="compose-write__body"
                  placeholder="Start writing..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <span className={`compose-write__word-count ${overLimit ? "over" : ""}`}>
                  {wordCount} / {MAX_WORDS} words
                </span>
              </div>
            </div>
          )}
          </>
          )}
        </div>

        {!sent && (
          <div className="compose-modal__footer">
            {step !== "type" && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setStep(STEPS[stepIndex - 1])}
              >
                &larr; Back
              </button>
            )}

            <div className="compose-modal__footer-spacer" />

            {step !== "write" && (
              <button
                type="button"
                className="btn btn-solid"
                disabled={
                  step === "type"
                    ? !entryType
                    : step === "background"
                    ? !background
                    : step === "category"
                    ? !category
                    : false
                }
                onClick={() => setStep(STEPS[stepIndex + 1])}
              >
                Next &rarr;
              </button>
            )}

            {step === "write" && (
              <button
                type="button"
                className="btn btn-solid"
                disabled={!title.trim() || !body.trim() || sending || overLimit}
                onClick={handleSend}
              >
                <PencilIcon size={16} />{" "}
                {sending ? "Sending..." : isGratitude ? "Share entry" : "Send letter"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
