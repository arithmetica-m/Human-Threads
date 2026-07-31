import { GlobeIcon } from "./icons";
import "./GlobeButton.css";

export default function GlobeButton({ onClick }) {
  return (
    <button className="globe-button" aria-label="Rate your day" onClick={onClick}>
      <GlobeIcon />
      <span>Rate your day</span>
    </button>
  );
}
