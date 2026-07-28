import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import "./EmailVerificationBanner.css";

export default function EmailVerificationBanner() {
  const { user, resendVerificationEmail, refreshEmailVerified } = useUser();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  // If the verification email failed to send during signup itself (the app
  // navigates straight to the feed, so there was no page to show it on at
  // the time), pick that error up here instead of pretending it went out.
  useEffect(() => {
    const stashed = sessionStorage.getItem("initialVerificationError");
    if (stashed) {
      setError(stashed);
      sessionStorage.removeItem("initialVerificationError");
    }
  }, []);

  if (!user || user.emailVerified) return null;

  const handleResend = async () => {
    setStatus("sending");
    setError("");
    const result = await resendVerificationEmail();
    if (result.success) {
      setStatus("sent");
    } else {
      setStatus("idle");
      setError(result.message);
    }
  };

  const handleRefresh = async () => {
    setStatus("checking");
    setError("");
    await refreshEmailVerified();
    setStatus("idle");
  };

  return (
    <div className="verify-banner">
      <p>
        Please verify your email ({user.email}) — check your inbox for a link.
        {status === "sent" && " Sent! Check your inbox (and spam folder)."}
        {error && ` ${error}`}
      </p>
      <div className="verify-banner__actions">
        <button type="button" onClick={handleResend} disabled={status === "sending"}>
          {status === "sending" ? "Sending..." : "Resend email"}
        </button>
        <button type="button" onClick={handleRefresh} disabled={status === "checking"}>
          {status === "checking" ? "Checking..." : "I've verified — refresh"}
        </button>
      </div>
    </div>
  );
}
