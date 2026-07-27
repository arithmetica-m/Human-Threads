import { useNotifications } from "../context/NotificationsContext";
import { useLetters } from "../context/LettersContext";
import {
  HeartIcon,
  CommentIcon,
  ClipboardIcon,
  CalendarIcon,
  SmileIcon,
} from "./icons";
import "./NotificationsPanel.css";

const TYPE_ICON = {
  like: HeartIcon,
  comment: CommentIcon,
  "daily-task": ClipboardIcon,
  "weekly-task": CalendarIcon,
  support: SmileIcon,
};

function timeAgo(timestamp) {
  if (!timestamp?.toDate) return "";
  const date = timestamp.toDate();
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPanel({ open, onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { myLetters, openLetter } = useLetters();

  if (!open) return null;

  const handleClick = (notif) => {
    markAsRead(notif.id);
    if (notif.letterId) {
      const letter = myLetters.find((l) => l.id === notif.letterId);
      if (letter) {
        openLetter(letter);
        onClose();
      }
    }
  };

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notif-panel__header">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <button type="button" className="notif-panel__mark-all" onClick={markAllAsRead}>
              Mark all read
            </button>
          )}
        </div>

        <div className="notif-panel__list">
          {notifications.length === 0 ? (
            <p className="notif-panel__empty">Nothing here yet.</p>
          ) : (
            notifications.map((notif) => {
              const Icon = TYPE_ICON[notif.type] || SmileIcon;
              return (
                <button
                  key={notif.id}
                  type="button"
                  className={`notif-row ${notif.read ? "" : "unread"}`}
                  onClick={() => handleClick(notif)}
                >
                  <span className="notif-row__icon">
                    <Icon size={16} />
                  </span>
                  <span className="notif-row__text">
                    <span className="notif-row__message">{notif.message}</span>
                    <span className="notif-row__time">{timeAgo(notif.createdAt)}</span>
                  </span>
                  {!notif.read && <span className="notif-row__dot" aria-hidden="true" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
