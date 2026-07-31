import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { useUser } from "../context/UserContext";
import { useCheckins } from "../context/CheckinsContext";
import { getRatingColor } from "../utils/ratingColor";
import { getCheckinCoordinates } from "../data/countryCoordinates";
import { XIcon, GlobeIcon } from "./icons";
import CheckinPopup from "./CheckinPopup";
import earthTexture from "../assets/globe/earth-day.jpg";
import "./GlobeModal.css";

const COMMENT_MAX = 140;

const STATUS_LABEL = {
  pending: "Pending review — it'll appear on the globe once approved.",
  approved: "Live on the globe.",
  rejected: "Not shown — this one wasn't approved.",
};

export default function GlobeModal({ open, onClose }) {
  const { user } = useUser();
  const { myCheckin, todaysCheckins, submitCheckin } = useCheckins();
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Measured synchronously (getBoundingClientRect, not just the
  // ResizeObserver callback) so the globe mounts on the very first paint
  // instead of waiting a frame for the observer's first report.
  useLayoutEffect(() => {
    if (!open || !containerRef.current) return undefined;
    const el = containerRef.current;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  const points = useMemo(() => {
    return todaysCheckins
      .map((checkin) => {
        const coords = getCheckinCoordinates(checkin.country, checkin.id);
        if (!coords) return null;
        return { ...checkin, ...coords, color: getRatingColor(checkin.rating) };
      })
      .filter(Boolean);
  }, [todaysCheckins]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || submitting) return;
    setSubmitting(true);
    try {
      await submitCheckin({ rating, comment: comment.trim() });
      setRating(null);
      setComment("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="globe-overlay" onClick={onClose}>
      <div className="globe-modal" onClick={(e) => e.stopPropagation()}>
        <button className="globe-modal__close" onClick={onClose} aria-label="Close">
          <XIcon />
        </button>

        <h2 className="globe-modal__title">
          <GlobeIcon size={22} /> Rate your day
        </h2>

        {myCheckin ? (
          <div className="globe-status-card">
            <span
              className="globe-status-card__swatch"
              style={{ background: getRatingColor(myCheckin.rating) }}
            />
            <p className="globe-status-card__rating">You rated today {myCheckin.rating}/10</p>
            <p className="globe-status-card__note">{STATUS_LABEL[myCheckin.status]}</p>
          </div>
        ) : (
          <form className="globe-rate-form" onSubmit={handleSubmit}>
            <div className="rating-row">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`rating-chip ${rating === n ? "active" : ""}`}
                  style={rating === n ? { background: getRatingColor(n), borderColor: getRatingColor(n) } : undefined}
                  onClick={() => setRating(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <textarea
              className="globe-comment-input"
              placeholder="A short line about your day..."
              value={comment}
              maxLength={COMMENT_MAX}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="globe-rate-form__footer">
              <span className="globe-rate-form__count">
                {comment.length}/{COMMENT_MAX}
              </span>
              <button type="submit" className="globe-submit-btn" disabled={!rating || submitting}>
                {submitting ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
        )}

        <p className="globe-modal__hint">
          Everyone&apos;s approved check-ins from today, as a colored pin near their country —
          drag to rotate, scroll or pinch to zoom, and click a pin to read it.
        </p>

        <div className="globe-container" ref={containerRef}>
          {size.width > 0 && (
            <Globe
              width={size.width}
              height={size.height}
              backgroundColor="rgba(0,0,0,0)"
              globeImageUrl={earthTexture}
              showAtmosphere
              atmosphereColor="#8d957e"
              htmlElementsData={points}
              htmlLat="lat"
              htmlLng="lng"
              htmlElement={(d) => {
                const wrapper = document.createElement("div");
                const pin = document.createElement("div");
                pin.className = "globe-pin";
                pin.style.setProperty("--pin-color", d.color);
                pin.onclick = (e) => {
                  e.stopPropagation();
                  setSelectedCheckin(d);
                };
                wrapper.appendChild(pin);
                return wrapper;
              }}
              htmlElementVisibilityModifier={(el, isVisible) => {
                el.style.opacity = isVisible ? "1" : "0";
                el.style.pointerEvents = isVisible ? "auto" : "none";
              }}
            />
          )}
          {selectedCheckin && (
            <CheckinPopup checkin={selectedCheckin} onClose={() => setSelectedCheckin(null)} />
          )}
        </div>

        {!user?.country || user.country === "Prefer not to say" ? (
          <p className="globe-modal__note">
            Your profile doesn&apos;t have a country set, so your own check-in won&apos;t be
            placeable on the globe (it still counts everywhere else).
          </p>
        ) : null}
      </div>
    </div>
  );
}
