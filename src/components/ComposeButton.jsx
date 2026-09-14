import { PencilIcon } from "./icons";
import "./ComposeButton.css";

export default function ComposeButton({ onClick }) {
  return (
    <button className="compose-button" aria-label="Write a letter or gratitude entry" onClick={onClick}>
      <PencilIcon />
      <span>Write</span>
    </button>
  );
}
