import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useLetters } from "../context/LettersContext";
import { useCommunity } from "../context/CommunityContext";
import { calculateAge } from "../utils/age";
import { areDailyTasksComplete, areWeeklyTasksComplete } from "../utils/taskStatus";
import { getCategoryAccent } from "../data/categories";
import { MOODS, MAX_MOODS } from "../data/moods";
import { PROFILE_PICTURES, getProfilePicture } from "../data/profilePictures";
import {
  XIcon,
  UserIcon,
  SmileIcon,
  ClipboardIcon,
  CompassIcon,
  CalendarIcon,
  HeartIcon,
  LightbulbIcon,
  ThumbsUpIcon,
  CheckIcon,
  PencilIcon,
} from "./icons";
import "./ProfilePanel.css";

const DAILY_TASKS = [
  {
    id: "accomplishments",
    label: "Write 3 small tasks you accomplished today",
    Icon: ClipboardIcon,
  },
  {
    id: "support",
    label: "Comment on someone else's story, showing support",
    Icon: HeartIcon,
  },
  {
    id: "tip",
    label: "Comment on someone else's story, sharing a tip",
    Icon: LightbulbIcon,
  },
  {
    id: "encourage",
    label: "Comment and like someone's daily tasks",
    Icon: ThumbsUpIcon,
  },
];

const WEEKLY_TASKS = [
  { id: "weekly-question", label: "Answer the weekly question", Icon: SmileIcon },
  { id: "new-category", label: "Write a letter in a new category", Icon: CompassIcon },
];

function LetterListItem({ letter, onOpen }) {
  const accent = getCategoryAccent(letter.category);
  return (
    <button className="profile-letter-row" onClick={() => onOpen(letter)}>
      <span className="profile-letter-row__dot" style={{ background: accent }} />
      <span className="profile-letter-row__text">
        <span className="profile-letter-row__title">{letter.title}</span>
        <span className="profile-letter-row__meta">{letter.category}</span>
      </span>
      {letter.status && letter.status !== "approved" && (
        <span className={`profile-letter-row__status profile-letter-row__status--${letter.status}`}>
          {letter.status}
        </span>
      )}
    </button>
  );
}

export default function ProfilePanel({ open, onClose }) {
  const { user, updateUser, toggleArrayField, logOut } = useUser();
  const { letters, myLetters, openLetter } = useLetters();
  const { recordDailyComplete, recordWeeklyComplete } = useCommunity();
  const [view, setView] = useState("main");
  const [pictureOpen, setPictureOpen] = useState(false);

  if (!open || !user) return null;

  // A user's own approved letters show up in both `letters` (public feed)
  // and `myLetters` (authored-by-me, any status) — dedupe before filtering
  // down to favourites.
  const knownLetters = Array.from(
    new Map([...letters, ...myLetters].map((l) => [l.id, l])).values()
  );
  const favouriteLetters = knownLetters.filter((l) =>
    (user.favouriteLetterIds || []).includes(l.id)
  );

  const toggleMood = (moodId) => {
    const current = user.todaysMoods || [];
    if (current.includes(moodId) || current.length < MAX_MOODS) {
      toggleArrayField("todaysMoods", moodId, !current.includes(moodId));
    }
  };

  const setAccomplishment = (index, value) => {
    const next = [...(user.dailyAccomplishments || ["", "", ""])];
    next[index] = value;
    const wasComplete = areDailyTasksComplete(user);
    const willBeComplete = areDailyTasksComplete({ ...user, dailyAccomplishments: next });
    updateUser({ dailyAccomplishments: next });
    if (!wasComplete && willBeComplete) recordDailyComplete();
  };

  // "accomplishments" completes itself once all 3 fields are filled in;
  // the rest are manual until real commenting elsewhere in the app can set them.
  const accomplishmentsDone = (user.dailyAccomplishments || []).every((a) => a.trim() !== "");

  const isDailyDone = (id) =>
    id === "accomplishments" ? accomplishmentsDone : (user.dailyTasksDone || []).includes(id);

  const toggleDailyTask = (id) => {
    if (id === "accomplishments") return;
    const current = user.dailyTasksDone || [];
    const adding = !current.includes(id);
    const nextDone = adding ? [...current, id] : current.filter((t) => t !== id);
    const wasComplete = areDailyTasksComplete(user);
    const willBeComplete = areDailyTasksComplete({ ...user, dailyTasksDone: nextDone });
    toggleArrayField("dailyTasksDone", id, adding);
    if (!wasComplete && willBeComplete) recordDailyComplete();
  };

  const toggleWeeklyTask = (id) => {
    const current = user.weeklyTasksDone || [];
    const adding = !current.includes(id);
    const nextDone = adding ? [...current, id] : current.filter((t) => t !== id);
    const wasComplete = areWeeklyTasksComplete(user);
    const willBeComplete = areWeeklyTasksComplete({ ...user, weeklyTasksDone: nextDone });
    toggleArrayField("weeklyTasksDone", id, adding);
    if (!wasComplete && willBeComplete) recordWeeklyComplete();
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <aside className="profile-panel" onClick={(e) => e.stopPropagation()}>
        <button className="profile-panel__close" onClick={onClose} aria-label="Close profile">
          <XIcon />
        </button>

        <div className="profile-panel__scroll">
          {view !== "main" ? (
            <div className="profile-subview">
              <button className="profile-subview__back" onClick={() => setView("main")}>
                &larr; Back to profile
              </button>
              <h2 className="profile-subview__title">
                {view === "my-letters" ? "My Letters" : "Favourites"}
              </h2>

              {(view === "my-letters" ? myLetters : favouriteLetters).length === 0 ? (
                <p className="profile-subview__empty">
                  {view === "my-letters"
                    ? "You haven't written any letters yet."
                    : "You haven't saved any letters yet."}
                </p>
              ) : (
                <div className="profile-letter-list">
                  {(view === "my-letters" ? myLetters : favouriteLetters).map((letter) => (
                    <LetterListItem key={letter.id} letter={letter} onOpen={openLetter} />
                  ))}
                </div>
              )}
            </div>
          ) : (
          <>
          <header className="profile-panel__header">
            <button
              type="button"
              className="profile-panel__avatar"
              onClick={() => setPictureOpen((prev) => !prev)}
              aria-label="Change profile picture"
            >
              {user.profilePictureId ? (
                <img
                  src={getProfilePicture(user.profilePictureId)}
                  alt=""
                  className="profile-panel__avatar-image"
                />
              ) : (
                <UserIcon size={32} />
              )}
              <span className="profile-panel__avatar-edit">
                <PencilIcon size={13} />
              </span>
            </button>
            <h2>{user.username}</h2>
            <p className="profile-panel__private">
              {user.firstName} {user.lastName} &middot; {calculateAge(user.dob)} &middot;{" "}
              {user.country}
            </p>
            <span className="profile-panel__private-tag">only visible to you</span>

            {pictureOpen && (
              <div className="picture-picker">
                {PROFILE_PICTURES.map((pic) => (
                  <button
                    key={pic.id}
                    type="button"
                    className={`picture-option ${
                      user.profilePictureId === pic.id ? "selected" : ""
                    }`}
                    onClick={() => {
                      updateUser({ profilePictureId: pic.id });
                      setPictureOpen(false);
                    }}
                  >
                    <img src={pic.image} alt={pic.label} />
                  </button>
                ))}
              </div>
            )}
          </header>

          <section className="profile-section">
            <h3>
              <SmileIcon size={18} /> Today&apos;s mood
            </h3>
            <p className="profile-section__hint">Pick up to {MAX_MOODS}</p>
            <div className="mood-picker">
              {MOODS.map((mood) => {
                const selected = (user.todaysMoods || []).includes(mood.id);
                return (
                  <button
                    key={mood.id}
                    className={`mood-chip ${selected ? "active" : ""}`}
                    onClick={() => toggleMood(mood.id)}
                  >
                    <span className="mood-chip__emoji">{mood.emoji}</span>
                    {mood.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="profile-section">
            <h3>
              <ClipboardIcon size={18} /> Today I accomplished
            </h3>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                type="text"
                className="profile-input"
                placeholder={`Small win #${i + 1}`}
                value={(user.dailyAccomplishments || ["", "", ""])[i]}
                onChange={(e) => setAccomplishment(i, e.target.value)}
              />
            ))}
          </section>

          <section className="profile-section">
            <h3>
              <CompassIcon size={18} /> A challenge I faced today
            </h3>
            <textarea
              className="profile-textarea"
              placeholder="What it was, and how I faced it..."
              value={user.dailyChallenge || ""}
              onChange={(e) => updateUser({ dailyChallenge: e.target.value })}
            />
          </section>

          <section className="profile-section">
            <h3>
              <CheckIcon size={18} /> Daily activities
            </h3>
            <ul className="task-list">
              {DAILY_TASKS.map(({ id, label, Icon }) => {
                const done = isDailyDone(id);
                return (
                  <li key={id}>
                    <button
                      className={`task-row ${done ? "active" : ""}`}
                      onClick={() => toggleDailyTask(id)}
                      disabled={id === "accomplishments"}
                    >
                      <span className="task-row__icon">
                        <Icon size={18} />
                      </span>
                      <span className="task-row__label">{label}</span>
                      <span className="task-row__check">
                        <CheckIcon size={16} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="profile-section">
            <h3>
              <CalendarIcon size={18} /> Weekly activities
            </h3>
            <ul className="task-list">
              {WEEKLY_TASKS.map(({ id, label, Icon }) => {
                const done = (user.weeklyTasksDone || []).includes(id);
                return (
                  <li key={id}>
                    <button
                      className={`task-row ${done ? "active" : ""}`}
                      onClick={() => toggleWeeklyTask(id)}
                    >
                      <span className="task-row__icon">
                        <Icon size={18} />
                      </span>
                      <span className="task-row__label">{label}</span>
                      <span className="task-row__check">
                        <CheckIcon size={16} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="profile-section profile-links">
            <button className="profile-link" onClick={() => setView("my-letters")}>
              My Letters
            </button>
            <button className="profile-link" onClick={() => setView("favourites")}>
              Favourites
            </button>
            <button className="profile-link profile-link--danger" onClick={logOut}>
              Log Out
            </button>
          </section>
          </>
          )}
        </div>
      </aside>
    </div>
  );
}
