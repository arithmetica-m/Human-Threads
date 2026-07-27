import { UsersIcon } from "./icons";
import "./CommunityButton.css";

export default function CommunityButton({ onClick }) {
  return (
    <button className="community-button" aria-label="View community" onClick={onClick}>
      <UsersIcon />
      <span>Community</span>
    </button>
  );
}
