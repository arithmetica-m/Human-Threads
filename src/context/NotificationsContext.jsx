import { createContext, useContext, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "./UserContext";
import { getRandomSupportiveMessage } from "../data/supportiveMessages";
import { areDailyTasksComplete, areWeeklyTasksComplete } from "../utils/taskStatus";

const NotificationsContext = createContext(null);

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysSince(dateKey) {
  if (!dateKey) return Infinity;
  const then = new Date(dateKey);
  const now = new Date();
  return (now - then) / (1000 * 60 * 60 * 24);
}

export function NotificationsProvider({ children }) {
  const { user, updateUser } = useUser();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return undefined;
    }
    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [user?.uid]);

  // Once per day/week, top up reminder notifications — a daily supportive
  // message, and nudges for incomplete daily/weekly tasks. Guarded by date
  // markers on the user doc so reloading the app doesn't spam duplicates.
  useEffect(() => {
    if (!user) return;

    const today = todayKey();
    const notifsRef = collection(db, "users", user.uid, "notifications");

    // Marker fields are only updated *after* the write succeeds — otherwise
    // a failed/rejected create (e.g. a rules issue) would still mark today
    // as "done" and permanently skip that notification until tomorrow.
    if (user.lastDailySupportDate !== today) {
      addDoc(notifsRef, {
        type: "support",
        message: getRandomSupportiveMessage(),
        read: false,
        createdAt: serverTimestamp(),
      })
        .then(() => updateUser({ lastDailySupportDate: today }))
        .catch(() => {});
    }

    if (user.lastDailyTaskReminderDate !== today && !areDailyTasksComplete(user)) {
      addDoc(notifsRef, {
        type: "daily-task",
        message: "You've still got daily activities to complete today.",
        read: false,
        createdAt: serverTimestamp(),
      })
        .then(() => updateUser({ lastDailyTaskReminderDate: today }))
        .catch(() => {});
    }

    if (daysSince(user.lastWeeklyTaskReminderDate) >= 7 && !areWeeklyTasksComplete(user)) {
      addDoc(notifsRef, {
        type: "weekly-task",
        message: "This week's activities are still waiting for you.",
        read: false,
        createdAt: serverTimestamp(),
      })
        .then(() => updateUser({ lastWeeklyTaskReminderDate: today }))
        .catch(() => {});
    }
    // Only re-run when the day changes or the user identity changes — not on
    // every task-completion edit, otherwise this would re-fire constantly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user && todayKey()]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "notifications", id), { read: true });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, "users", user.uid, "notifications", n.id), { read: true });
    });
    await batch.commit();
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationsProvider");
  return ctx;
}
