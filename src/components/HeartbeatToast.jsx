import { useEffect, useState } from "react";
import { useLetters } from "../context/LettersContext";
import "./HeartbeatToast.css";

export default function HeartbeatToast() {
  const { heartbeatTrigger } = useLetters();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (heartbeatTrigger === 0) return undefined; // skip on initial mount
    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timeout);
  }, [heartbeatTrigger]);

  if (!visible) return null;

  return (
    <div className="heartbeat-toast" aria-live="polite">
      <p className="heartbeat-toast__title">Heartbeat sent.</p>
      <p className="heartbeat-toast__subtitle">A quiet reminder that someone cares.</p>
    </div>
  );
}
