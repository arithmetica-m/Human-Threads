import { createContext, useContext, useEffect, useState } from "react";
import { doc, increment, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "./UserContext";

const CommunityContext = createContext(null);
const STATS_REF = doc(db, "community", "stats");

// Monday of the current week, as a date-string key — used to lazily roll
// the "this week" counters over. There's no backend cron on the free tier,
// so the rollover only happens when a signed-in client notices the week
// has changed (i.e. whenever someone opens the app after Monday).
function weekKey() {
  const d = new Date();
  const day = d.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  return monday.toISOString().slice(0, 10);
}

export function CommunityProvider({ children }) {
  const { user } = useUser();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) {
      setStats(null);
      return undefined;
    }
    const unsubscribe = onSnapshot(STATS_REF, (snap) => {
      setStats(snap.exists() ? snap.data() : null);
    });
    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    if (!stats) return;
    const currentWeek = weekKey();
    if (stats.weekStartDate !== currentWeek) {
      updateDoc(STATS_REF, {
        weekStartDate: currentWeek,
        weekLettersWritten: 0,
        weekSupportGiven: 0,
        weekTipsGiven: 0,
        weekOtherComments: 0,
        weekLettersRead: 0,
      }).catch(() => {});
    }
  }, [stats]);

  const bump = (fields) => {
    const patch = {};
    fields.forEach((field) => {
      patch[field] = increment(1);
    });
    updateDoc(STATS_REF, patch).catch(() => {});
  };

  const recordLetterWritten = () =>
    bump(["totalLettersWritten", "weekLettersWritten", "tapestryProgress"]);

  const recordComment = (tab) => {
    if (tab === "tips") bump(["totalTipsGiven", "weekTipsGiven"]);
    else if (tab === "support") bump(["totalSupportGiven", "weekSupportGiven"]);
    else bump(["totalOtherComments", "weekOtherComments"]);
  };

  const recordLike = () => bump(["totalLikesGiven"]);
  const recordRead = () => bump(["totalLettersRead", "weekLettersRead"]);
  const recordDailyComplete = () => bump(["totalDailyCompletions", "tapestryProgress"]);
  const recordWeeklyComplete = () => bump(["totalWeeklyCompletions", "tapestryProgress"]);

  return (
    <CommunityContext.Provider
      value={{
        stats,
        recordLetterWritten,
        recordComment,
        recordLike,
        recordRead,
        recordDailyComplete,
        recordWeeklyComplete,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within a CommunityProvider");
  return ctx;
}
