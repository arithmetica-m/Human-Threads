import { createContext, useContext, useEffect, useState } from "react";
import { doc, increment, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "./UserContext";
import { weekKey } from "../utils/dateKeys";

const CommunityContext = createContext(null);
const STATS_REF = doc(db, "community", "stats");

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

  // Mirrors the same 3 actions that grow the shared community tapestry, but
  // onto the signed-in user's own doc — that field powers the personal
  // growth visual in the profile panel.
  const bumpMyGrowth = () => {
    if (!user) return;
    updateDoc(doc(db, "users", user.uid), { personalGrowthProgress: increment(1) }).catch(
      () => {}
    );
  };

  const recordLetterWritten = () => {
    bump(["totalLettersWritten", "weekLettersWritten", "tapestryProgress"]);
    bumpMyGrowth();
  };

  const recordComment = (tab) => {
    if (tab === "tips") bump(["totalTipsGiven", "weekTipsGiven"]);
    else if (tab === "support") bump(["totalSupportGiven", "weekSupportGiven"]);
    else bump(["totalOtherComments", "weekOtherComments"]);
  };

  const recordLike = () => bump(["totalLikesGiven"]);
  const recordRead = () => bump(["totalLettersRead", "weekLettersRead"]);
  const recordDailyComplete = () => {
    bump(["totalDailyCompletions", "tapestryProgress"]);
    bumpMyGrowth();
  };
  const recordWeeklyComplete = () => {
    bump(["totalWeeklyCompletions", "tapestryProgress"]);
    bumpMyGrowth();
  };

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
