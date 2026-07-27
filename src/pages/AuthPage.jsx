import { useState } from "react";
import { useUser } from "../context/UserContext";
import { calculateAge } from "../utils/age";
import { COUNTRIES } from "../data/countries";
import "./AuthPage.css";

const MIN_AGE = 16;

export default function AuthPage({ initialMode = "login", onAuthenticated, onBack }) {
  const { signUp, logIn, sendPasswordReset } = useUser();
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setResetSent(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await sendPasswordReset(resetEmail);
    setSubmitting(false);
    if (result.success) {
      setResetSent(true);
    } else {
      setError(result.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await logIn({ email: loginEmail, password: loginPassword });
    setSubmitting(false);
    if (result.success) {
      onAuthenticated();
    } else {
      setError(result.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !dob || !country || !signupEmail || !signupPassword) {
      setError("Please fill in every field.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    const age = calculateAge(dob);
    if (age === null || age < MIN_AGE) {
      setError(`You need to be at least ${MIN_AGE} to join Human Threads.`);
      return;
    }
    if (!agreed) {
      setError("Please confirm your age and agree to the Terms & Privacy Policy.");
      return;
    }

    setSubmitting(true);
    const result = await signUp({
      firstName,
      lastName,
      dob,
      country,
      email: signupEmail,
      password: signupPassword,
    });
    setSubmitting(false);

    if (result.success) {
      onAuthenticated();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button type="button" className="auth-back" onClick={onBack}>
          &larr; Back
        </button>

        <div className="auth-logo">Human Threads</div>

        {mode !== "reset" && (
          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              Log In
            </button>
            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => switchMode("signup")}
            >
              Sign Up
            </button>
          </div>
        )}

        {mode === "reset" ? (
          resetSent ? (
            <div className="auth-reset-sent">
              <p>
                If an account exists for <strong>{resetEmail}</strong>, a password reset
                link is on its way — check your inbox (and spam folder).
              </p>
              <button type="button" className="auth-link" onClick={() => switchMode("login")}>
                &larr; Back to log in
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleReset}>
              <label>
                Email
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </label>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn btn-solid auth-submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send reset link"}
              </button>

              <button type="button" className="auth-link" onClick={() => switchMode("login")}>
                &larr; Back to log in
              </button>
            </form>
          )
        ) : mode === "login" ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </label>

            <button
              type="button"
              className="auth-link auth-forgot"
              onClick={() => switchMode("reset")}
            >
              Forgot password?
            </button>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-solid auth-submit" disabled={submitting}>
              {submitting ? "Logging in..." : "Log In"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="auth-row">
              <label>
                First name
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>
              <label>
                Surname
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="auth-row">
              <label>
                Date of birth
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </label>
              <label>
                Country
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Email
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </label>

            <div className="auth-row">
              <label>
                Password
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>
            </div>

            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              {/* FILL IN: link these to your actual Terms of Service / Privacy Policy pages */}
              <span className="auth-checkbox__text">
                I confirm I'm {MIN_AGE} or older and agree to the Terms &amp; Privacy
                Policy.
              </span>
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-solid auth-submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </button>

            <p className="auth-privacy-note">
              Your name, date of birth and country are private — only you can see
              them. A random public username is generated for your profile instead.
            </p>
          </form>
        )}

        <p className="auth-safety-note">
          If you're in crisis or immediate danger, please contact your local
          emergency services or a crisis helpline. Human Threads is peer support,
          not professional care.
        </p>
      </div>
    </div>
  );
}
