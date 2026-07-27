import { useState } from "react";
import { useUser } from "../context/UserContext";
import "./EmailVerificationBanner.css";

export default function EmailVerificationBanner() {
  const { user, resendVerificationEmail, refreshEmailVerified } = useUser();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

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
