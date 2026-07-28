import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNotifications } from "../context/NotificationsContext";
import { usePendingApprovals } from "../hooks/usePendingApprovals";
import { getProfilePicture } from "../data/profilePictures";
import { ADMIN_EMAIL } from "../data/admin";
import { BellIcon, EyeIcon, UserIcon } from "./icons";
import NotificationsPanel from "./NotificationsPanel";
import AdminPanel from "./AdminPanel";
import "./AppTopBar.css";

export default function AppTopBar({ onOpenProfile }) {
  const { user } = useUser();
  const { unreadCount } = useNotifications();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const { pendingLetters, pendingComments } = usePendingApprovals(isAdmin);
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const pictureUrl = user?.profilePictureId ? getProfilePicture(user.profilePictureId) : null;
  const pendingCount = pendingLetters.length + pendingComments.length;

  return (
    <header className="app-topbar">
      <span className="app-logo">Human Threads</span>

      <div className="app-topbar-actions">
        {isAdmin && (
          <button
            className="icon-button"
            aria-label="Pending approval"
            onClick={() => setAdminOpen((prev) => !prev)}
          >
            <EyeIcon />
            {pendingCount > 0 && <span className="icon-button__badge">{pendingCount}</span>}
          </button>
        )}

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
      {isAdmin && (
        <AdminPanel
          open={adminOpen}
          onClose={() => setAdminOpen(false)}
          pendingLetters={pendingLetters}
          pendingComments={pendingComments}
        />
      )}
    </header>
  );
}
