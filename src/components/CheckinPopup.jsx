import { getRatingColor } from "../utils/ratingColor";
import { XIcon } from "./icons";
import "./CheckinPopup.css";

export default function CheckinPopup({ checkin, onClose }) {
  if (!checkin) return null;

  return (
    <div className="checkin-popup">
      <button className="checkin-popup__close" onClick={onClose} aria-label="Close">
        <XIcon size={14} />
      </button>
      <span
        className="checkin-popup__swatch"
        style={{ background: getRatingColor(checkin.rating) }}
      />
      <p className="checkin-popup__rating">{checkin.rating}/10</p>
      <p className="checkin-popup__country">{checkin.country}</p>
      {checkin.comment && <p className="checkin-popup__comment">&ldquo;{checkin.comment}&rdquo;</p>}
    </div>
  );
}
