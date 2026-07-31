import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "./UserContext";
import { todayKey } from "../utils/dateKeys";

const CheckinsContext = createContext(null);

// One doc per user per day ("{uid}_{date}") — see firestore.rules. The
// globe only ever shows today's approved check-ins; older ones stay in
// Firestore but are simply never queried once the date rolls over (same
// lazy, no-backend-cron approach as the rest of the app).
export function CheckinsProvider({ children }) {
  const { user } = useUser();
  const [myCheckin, setMyCheckin] = useState(null);
  const [todaysCheckins, setTodaysCheckins] = useState([]);

  useEffect(() => {
    if (!user) {
      setMyCheckin(null);
      return undefined;
    }
    const ref = doc(db, "checkins", `${user.uid}_${todayKey()}`);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setMyCheckin(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    if (!user) {
      setTodaysCheckins([]);
      return undefined;
    }
    const q = query(
      collection(db, "checkins"),
      where("date", "==", todayKey()),
      where("status", "==", "approved")
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setTodaysCheckins(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [user?.uid]);

  const submitCheckin = async ({ rating, comment }) => {
    const today = todayKey();
    await setDoc(doc(db, "checkins", `${user.uid}_${today}`), {
      uid: user.uid,
      country: user.country,
      rating,
      comment,
      status: "pending",
      date: today,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <CheckinsContext.Provider value={{ myCheckin, todaysCheckins, submitCheckin }}>
      {children}
    </CheckinsContext.Provider>
  );
}

export function useCheckins() {
  const ctx = useContext(CheckinsContext);
  if (!ctx) throw new Error("useCheckins must be used within a CheckinsProvider");
  return ctx;
}
