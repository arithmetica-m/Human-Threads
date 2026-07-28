import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
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
    case "auth/too-many-requests":
      return "Too many attempts right now — please wait a while and try again.";
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

  const user =
    firebaseUser && profile
      ? { uid: firebaseUser.uid, emailVerified: firebaseUser.emailVerified, ...profile }
      : null;

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
        profilePictureId: null,
        todaysMoods: [],
        dailyAccomplishments: ["", "", ""],
        dailyChallenge: "",
        dailyTasksDone: [],
        weeklyTasksDone: [],
        favouriteLetterIds: [],
        readLetterIds: [],
        lastDailySupportDate: null,
        lastDailyTaskReminderDate: null,
        lastWeeklyTaskReminderDate: null,
        createdAt: serverTimestamp(),
      });
      // Signup itself still succeeds even if this fails (the account is real
      // either way) — but surface it instead of silently pretending it sent.
      // Stashed in sessionStorage since the app navigates straight to the
      // feed after signup; the verification banner picks this up on mount.
      try {
        await sendEmailVerification(credential.user);
      } catch (error) {
        sessionStorage.setItem("initialVerificationError", friendlyAuthError(error));
      }
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

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) return { success: false, message: "You're not signed in." };
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (error) {
      return { success: false, message: friendlyAuthError(error) };
    }
  };

  // Firebase caches emailVerified on the client and only refreshes it after
  // an explicit reload — call this after the user says they've clicked the
  // link in their inbox.
  const refreshEmailVerified = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setFirebaseUser({ ...auth.currentUser });
  };

  const sendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, message: friendlyAuthError(error) };
    }
  };

  // Plain field overwrite — for scalar-ish fields (dailyChallenge, the
  // dailyAccomplishments array-of-3-strings by index, profilePictureId).
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
      value={{
        user,
        authLoading,
        signUp,
        logIn,
        logOut,
        updateUser,
        toggleArrayField,
        resendVerificationEmail,
        refreshEmailVerified,
        sendPasswordReset,
      }}
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
