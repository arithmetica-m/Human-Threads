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
import { useCommunity } from "./CommunityContext";

const LettersContext = createContext(null);

// Public feed = approved letters only (moderation gate). "My Letters" needs
// a separate listener since it must show the author's own pending/rejected
// letters too, which the public query excludes.
export function LettersProvider({ children }) {
  const { user, toggleArrayField } = useUser();
  const { recordLetterWritten, recordLike, recordComment, recordRead } = useCommunity();
  const [letters, setLetters] = useState([]);
  const [myLetters, setMyLetters] = useState([]);
  const [viewingLetterId, setViewingLetterId] = useState(null);
  const [commentingOnId, setCommentingOnId] = useState(null);
  const [heartbeatTrigger, setHeartbeatTrigger] = useState(0);

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
    recordLetterWritten();
  };

  // viewingLetter/commentingOn are looked up across both the public feed and
  // "my letters" so opening your own pending letter's detail view still works.
  const findLetter = (id) =>
    letters.find((l) => l.id === id) || myLetters.find((l) => l.id === id) || null;

  const notifyAuthor = async (authorUid, notification) => {
    if (authorUid === user.uid) return; // don't notify yourself
    await addDoc(collection(db, "users", authorUid, "notifications"), {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  const toggleLike = async (letterId, liked) => {
    await updateDoc(doc(db, "letters", letterId), {
      likedByUids: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
    if (!liked) {
      recordLike();
      setHeartbeatTrigger((prev) => prev + 1);
      const letter = findLetter(letterId);
      if (letter) {
        await notifyAuthor(letter.authorUid, {
          type: "like",
          letterId,
          message: `${user.username} liked your letter "${letter.title}".`,
        });
      }
    }
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
    recordComment(tab);

    const letter = findLetter(letterId);
    if (letter) {
      await notifyAuthor(letter.authorUid, {
        type: "comment",
        letterId,
        message: `${user.username} left a comment on your letter "${letter.title}".`,
      });
    }
  };

  const viewingLetter = findLetter(viewingLetterId);
  const commentingOn = findLetter(commentingOnId);

  // Marks a letter as read (so it sinks in the feed instead of staying at
  // the top) and counts it toward the community's "letters read" stat —
  // but only the first time, and not for your own letters.
  const openLetter = (letter) => {
    setViewingLetterId(letter.id);
    const alreadyRead = (user?.readLetterIds || []).includes(letter.id);
    if (!alreadyRead && letter.authorUid !== user?.uid) {
      toggleArrayField("readLetterIds", letter.id, true);
      recordRead();
    }
  };

  return (
    <LettersContext.Provider
      value={{
        letters,
        myLetters,
        addLetter,
        toggleLike,
        addComment,
        viewingLetter,
        openLetter,
        heartbeatTrigger,
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
