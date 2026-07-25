import { PencilIcon } from "./icons";
import "./ComposeButton.css";

export default function ComposeButton({ onClick }) {
  return (
    <button className="compose-button" aria-label="Write a new letter" onClick={onClick}>
      <PencilIcon />
      <span>Write</span>
    </button>
  );
}
