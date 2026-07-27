import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNotifications } from "../context/NotificationsContext";
import { getProfilePicture } from "../data/profilePictures";
import { BellIcon, UserIcon } from "./icons";
import NotificationsPanel from "./NotificationsPanel";
import "./AppTopBar.css";

export default function AppTopBar({ onOpenProfile }) {
  const { user } = useUser();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const pictureUrl = user?.profilePictureId ? getProfilePicture(user.profilePictureId) : null;

  return (
    <header className="app-topbar">
      <span className="app-logo">Human Threads</span>

      <div className="app-topbar-actions">
        <button
          className="icon-button"
          aria-label="Notifications"
          onClick={() => setNotifOpen((prev) => !prev)}
        >
          <BellIcon />
          {unreadCount > 0 && <span className="icon-button__badge">{unreadCount}</span>}
        </button>

        <button className="profile-trigger" onClick={onOpenProfile}>
          {user && <span className="profile-trigger__name">{user.username}</span>}
          <span className="profile-avatar" aria-label="Your profile">
            {pictureUrl ? (
              <img src={pictureUrl} alt="" className="profile-avatar__image" />
            ) : (
              <UserIcon size={26} />
            )}
          </span>
        </button>
      </div>

      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </header>
  );
}
