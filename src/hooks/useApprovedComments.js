import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";

// Live list of a letter's approved comments. Used both to render the
// thread and to derive an always-accurate comment count — a separately
// maintained counter field can drift out of sync (as happened when some
// writes partially failed), so the actual subcollection is the only
// trustworthy source of truth.
export function useApprovedComments(letterId) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!letterId) {
      setComments([]);
      return undefined;
    }
    const q = query(
      collection(db, "letters", letterId, "comments"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [letterId]);

  return comments;
}
