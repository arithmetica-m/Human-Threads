import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { generateUsername } from "../data/usernames";

const UserContext = createContext(null);

function friendlyAuthError(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "There's already an account with that email — try logging in instead.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password doesn't match an account.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    default:
      return "Something went wrong — please try again.";
  }
}

export function UserProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Tracks whether we're still waiting on Firebase to report the signed-in
  // state on first load, and whether the user's Firestore profile doc has
  // loaded — the app shouldn't decide "landing" vs "feed" until both settle.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setProfile(null);
        setAuthLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!firebaseUser) return undefined;

    const unsubscribe = onSnapshot(doc(db, "users", firebaseUser.uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : null);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, [firebaseUser]);

  const user = firebaseUser && profile ? { uid: firebaseUser.uid, ...profile } : null;

  const signUp = async ({ firstName, lastName, dob, country, email, password }) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", credential.user.uid), {
        firstName,
        lastName,
        dob,
        country,
        email,
        username: generateUsername(),
        todaysMoods: [],
        dailyAccomplishments: ["", "", ""],
        dailyChallenge: "",
        dailyTasksDone: [],
        weeklyTasksDone: [],
        favouriteLetterIds: [],
        createdAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: friendlyAuthError(error) };
    }
  };

  const logIn = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, message: friendlyAuthError(error) };
    }
  };

  const logOut = () => signOut(auth);

  // Plain field overwrite — for scalar-ish fields (dailyChallenge, the
  // dailyAccomplishments array-of-3-strings by index).
  const updateUser = async (patch) => {
    if (!firebaseUser) return;
    const resolved = typeof patch === "function" ? patch(user) : patch;
    await updateDoc(doc(db, "users", firebaseUser.uid), resolved);
  };

  // Atomic add/remove on an array field (favourites, moods, task checklists)
  // — avoids the stale-snapshot bugs a read-then-write toggle is prone to.
  const toggleArrayField = async (field, value, adding) => {
    if (!firebaseUser) return;
    await updateDoc(doc(db, "users", firebaseUser.uid), {
      [field]: adding ? arrayUnion(value) : arrayRemove(value),
    });
  };

  return (
    <UserContext.Provider
      value={{ user, authLoading, signUp, logIn, logOut, updateUser, toggleArrayField }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
