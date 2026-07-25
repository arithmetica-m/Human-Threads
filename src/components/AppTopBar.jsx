import { useUser } from "../context/UserContext";
import { BellIcon, UserIcon } from "./icons";
import "./AppTopBar.css";

export default function AppTopBar({ onOpenProfile }) {
  const { user } = useUser();

  return (
    <header className="app-topbar">
      <span className="app-logo">Human Threads</span>

      <div className="app-topbar-actions">
        <button className="icon-button" aria-label="Notifications">
          <BellIcon />
        </button>

        <button className="profile-trigger" onClick={onOpenProfile}>
          {user && <span className="profile-trigger__name">{user.username}</span>}
          {/* TODO: real profile pictures (picked from a preset set) come later */}
          <span className="profile-avatar" aria-label="Your profile">
            <UserIcon size={26} />
          </span>
        </button>
      </div>
    </header>
  );
}
