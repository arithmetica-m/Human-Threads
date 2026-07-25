import { createContext, useContext, useEffect, useState } from "react";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "./UserContext";

const LettersContext = createContext(null);

// Public feed = approved letters only (moderation gate). "My Letters" needs
// a separate listener since it must show the author's own pending/rejected
// letters too, which the public query excludes.
export function LettersProvider({ children }) {
  const { user } = useUser();
  const [letters, setLetters] = useState([]);
  const [myLetters, setMyLetters] = useState([]);
  const [viewingLetterId, setViewingLetterId] = useState(null);
  const [commentingOnId, setCommentingOnId] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "letters"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setLetters(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setMyLetters([]);
      return undefined;
    }
    const q = query(collection(db, "letters"), where("authorUid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMyLetters(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [user]);

  const addLetter = async (letter) => {
    await addDoc(collection(db, "letters"), {
      ...letter,
      authorUid: user.uid,
      status: "pending",
      likedByUids: [],
      commentCount: 0,
      createdAt: serverTimestamp(),
    });
  };

  const toggleLike = async (letterId, liked) => {
    await updateDoc(doc(db, "letters", letterId), {
      likedByUids: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  const addComment = async (letterId, { tab, text }) => {
    await addDoc(collection(db, "letters", letterId, "comments"), {
      authorUid: user.uid,
      authorUsername: user.username,
      tab,
      text,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "letters", letterId), { commentCount: increment(1) });
  };

  // viewingLetter/commentingOn are looked up across both the public feed and
  // "my letters" so opening your own pending letter's detail view still works.
  const findLetter = (id) =>
    letters.find((l) => l.id === id) || myLetters.find((l) => l.id === id) || null;

  const viewingLetter = findLetter(viewingLetterId);
  const commentingOn = findLetter(commentingOnId);

  return (
    <LettersContext.Provider
      value={{
        letters,
        myLetters,
        addLetter,
        toggleLike,
        addComment,
        viewingLetter,
        openLetter: (letter) => setViewingLetterId(letter.id),
        closeLetter: () => setViewingLetterId(null),
        commentingOn,
        openComments: (letter) => setCommentingOnId(letter.id),
        closeComments: () => setCommentingOnId(null),
      }}
    >
      {children}
    </LettersContext.Provider>
  );
}

export function useLetters() {
  const ctx = useContext(LettersContext);
  if (!ctx) throw new Error("useLetters must be used within a LettersProvider");
  return ctx;
}
