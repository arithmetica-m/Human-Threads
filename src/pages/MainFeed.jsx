import { lazy, Suspense, useMemo, useState } from "react";
import { useLetters } from "../context/LettersContext";
import AppTopBar from "../components/AppTopBar";
import DailyLetterCard from "../components/DailyLetterCard";
import GratitudeSection from "../components/GratitudeSection";
import EncouragingCard from "../components/EncouragingCard";
import ComposeButton from "../components/ComposeButton";
import CommunityButton from "../components/CommunityButton";
import GlobeButton from "../components/GlobeButton";
import ProfilePanel from "../components/ProfilePanel";
import ComposeModal from "../components/ComposeModal";
import CommunityModal from "../components/CommunityModal";
import LetterDetailModal from "../components/LetterDetailModal";
import CommentModal from "../components/CommentModal";
import EmailVerificationBanner from "../components/EmailVerificationBanner";
import HeartbeatToast from "../components/HeartbeatToast";
import { EMOTIONS } from "../data/categories";
import "./MainFeed.css";

// The globe view pulls in react-globe.gl/three (a large 3D dependency), so
// it's only fetched when someone actually opens it, not on initial load.
const GlobeModal = lazy(() => import("../components/GlobeModal"));

export default function MainFeed() {
  const { todaysLetters, viewingLetter } = useLetters();
  const [activeCategories, setActiveCategories] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [globeOpen, setGlobeOpen] = useState(false);

  const toggleCategory = (category) => {
    setActiveCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Only ever up to 3 items, so this is just hiding ones you don't have
  // capacity for today, not searching/sorting a real feed.
  const visibleTodaysLetters = useMemo(() => {
    if (activeCategories.length === 0) return todaysLetters;
    return todaysLetters.filter((l) => activeCategories.includes(l.category));
  }, [todaysLetters, activeCategories]);

  return (
    <div className="main-feed">
      <AppTopBar onOpenProfile={() => setProfileOpen(true)} />
      <EmailVerificationBanner />

      <header className="feed-header">
        <h1>Letters I&apos;ll Never Send</h1>
        <p className="feed-subheading">Write. Connect. Heal.</p>
        <p className="feed-subquestion">
          This week&apos;s question: Who made me laugh the most this week?
        </p>
      </header>

      <section className="daily-letters-section">
        <h2 className="feed-section__title">Today&apos;s letters</h2>
        <p className="feed-section__hint">
          Up to 3 letters a day, picked for you — opening one uses it up, so take your
          time with it. New ones tomorrow.
        </p>

        {todaysLetters.length > 0 && (
          <div className="filter-chips">
            <button
              className={`chip ${activeCategories.length === 0 ? "active" : ""}`}
              onClick={() => setActiveCategories([])}
            >
              All
            </button>
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion}
                className={`chip ${activeCategories.includes(emotion) ? "active" : ""}`}
                onClick={() => toggleCategory(emotion)}
              >
                {emotion}
              </button>
            ))}
          </div>
        )}

        {todaysLetters.length === 0 ? (
          <p className="daily-letters-section__empty">
            You&apos;ve read all of today&apos;s letters — thank you for showing up.
            More tomorrow.
          </p>
        ) : (
          <div className="daily-letters-grid">
            {visibleTodaysLetters.map((letter) => (
              <DailyLetterCard key={letter.id} letter={letter} />
            ))}
          </div>
        )}
      </section>

      <EncouragingCard />

      <section className="gratitude-page-section">
        <h2 className="feed-section__title">Gratitude</h2>
        <p className="feed-section__hint">
          Share as many as you&apos;d like — there&apos;s no limit here.
        </p>
        <GratitudeSection />
      </section>

      <ComposeButton onClick={() => setComposeOpen(true)} />
      <CommunityButton onClick={() => setCommunityOpen(true)} />
      <GlobeButton onClick={() => setGlobeOpen(true)} />

      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />

      <CommunityModal open={communityOpen} onClose={() => setCommunityOpen(false)} />

      {globeOpen && (
        <Suspense fallback={null}>
          <GlobeModal open={globeOpen} onClose={() => setGlobeOpen(false)} />
        </Suspense>
      )}

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />

      {/* keyed by letter id so switching letters resets the modal's local like state */}
      <LetterDetailModal key={viewingLetter?.id ?? "none"} />

      <CommentModal />

      <HeartbeatToast />
    </div>
  );
}
