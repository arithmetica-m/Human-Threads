import { useEffect, useState } from "react";
import { collection, collectionGroup, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

// Admin-only: a live view of everything still awaiting manual approval, so
// pending letters/comments don't have to be found by scanning the whole
// Firebase console. `enabled` should be false for non-admins — the security
// rules enforce this too, but there's no reason to even issue the queries.
export function usePendingApprovals(enabled) {
  const [pendingLetters, setPendingLetters] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);

  useEffect(() => {
    if (!enabled) {
      setPendingLetters([]);
      return undefined;
    }
    const q = query(collection(db, "letters"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPendingLetters(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setPendingComments([]);
      return undefined;
    }
    // Comments only store their author/text/status — the parent letter's id
    // comes from the subcollection path itself, and its title is looked up
    // separately so the panel can show "comment on <title>".
    const q = query(collectionGroup(db, "comments"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, async (snap) => {
      const withLetters = await Promise.all(
        snap.docs.map(async (d) => {
          const letterRef = d.ref.parent.parent;
          let letterTitle = "(unknown letter)";
          if (letterRef) {
            const letterSnap = await getDoc(letterRef);
            if (letterSnap.exists()) letterTitle = letterSnap.data().title;
          }
          return { id: d.id, letterId: letterRef?.id, letterTitle, ...d.data() };
        })
      );
      setPendingComments(withLetters);
    });
    return unsubscribe;
  }, [enabled]);

  return { pendingLetters, pendingComments };
}
