import { createContext, useContext, useEffect, useState } from "react";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
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
import { todayKey } from "../utils/dateKeys";

const LettersContext = createContext(null);

const DAILY_LETTER_COUNT = 3;

// Public feed = approved letters only (moderation gate). "My Letters" needs
// a separate listener since it must show the author's own pending/rejected
// letters too, which the public query excludes.
export function LettersProvider({ children }) {
  const { user, toggleArrayField, updateUser } = useUser();
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

  // Once a day, lazily assign up to DAILY_LETTER_COUNT random unread
  // letters (never your own) — same "no backend cron, roll over whenever a
  // signed-in client notices the date changed" approach used everywhere
  // else in this app (see UserContext.jsx's daily/weekly reset).
  useEffect(() => {
    if (!user || letters.length === 0) return;
    const today = todayKey();
    if (user.todaysLetterQueueDate === today) return;

    const readIds = user.readLetterIds || [];
    const pool = letters.filter(
      (l) => l.authorUid !== user.uid && !readIds.includes(l.id)
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, DAILY_LETTER_COUNT).map((l) => l.id);

    updateUser({ todaysLetterQueue: picked, todaysLetterQueueDate: today }).catch(() => {});
    // Only re-run when the day changes, the letter pool changes, or the
    // user identity changes — not on every read/like, which would just
    // re-check todaysLetterQueueDate and no-op anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.todaysLetterQueueDate, letters.length]);

  // A queued letter drops out the moment it's read (openLetter below adds
  // it to readLetterIds) — no separate "consumed" flag needed.
  const readIds = user?.readLetterIds || [];
  const todaysLetters = (user?.todaysLetterQueue || [])
    .map((id) => letters.find((l) => l.id === id))
    .filter((l) => l && !readIds.includes(l.id));

  const addLetter = async (letter) => {
    await addDoc(collection(db, "letters"), {
      ...letter,
      stickerIds: letter.stickerIds || [],
      authorUid: user.uid,
      status: "pending",
      likedByUids: [],
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
        todaysLetters,
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
