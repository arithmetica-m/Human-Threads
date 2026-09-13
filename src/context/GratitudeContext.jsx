import { createContext, useContext, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "./UserContext";

const GratitudeContext = createContext(null);

export const GRATITUDE_MAX_LENGTH = 200;

// Unlimited, low-friction counterpart to letters — no daily cap, since
// gratitude entries aren't the kind of content that builds up distress.
// Same public/mine split as LettersContext: approved entries are public,
// your own show immediately (tagged "pending") regardless of status.
export function GratitudeProvider({ children }) {
  const { user } = useUser();
  const [entries, setEntries] = useState([]);
  const [myEntries, setMyEntries] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "gratitude"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setMyEntries([]);
      return undefined;
    }
    const q = query(collection(db, "gratitude"), where("authorUid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMyEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [user?.uid]);

  const addEntry = async (text) => {
    await addDoc(collection(db, "gratitude"), {
      authorUid: user.uid,
      authorUsername: user.username,
      text: text.trim().slice(0, GRATITUDE_MAX_LENGTH),
      status: "pending",
      createdAt: serverTimestamp(),
    });
  };

  return (
    <GratitudeContext.Provider value={{ entries, myEntries, addEntry }}>
      {children}
    </GratitudeContext.Provider>
  );
}

export function useGratitude() {
  const ctx = useContext(GratitudeContext);
  if (!ctx) throw new Error("useGratitude must be used within a GratitudeProvider");
  return ctx;
}
