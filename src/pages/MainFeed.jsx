import { useMemo, useState } from "react";
import { useLetters } from "../context/LettersContext";
import { useUser } from "../context/UserContext";
import AppTopBar from "../components/AppTopBar";
import FilterBar from "../components/FilterBar";
import LetterCard from "../components/LetterCard";
import EncouragingCard from "../components/EncouragingCard";
import ComposeButton from "../components/ComposeButton";
import CommunityButton from "../components/CommunityButton";
import ProfilePanel from "../components/ProfilePanel";
import ComposeModal from "../components/ComposeModal";
import CommunityModal from "../components/CommunityModal";
import LetterDetailModal from "../components/LetterDetailModal";
import CommentModal from "../components/CommentModal";
import EmailVerificationBanner from "../components/EmailVerificationBanner";
import HeartbeatToast from "../components/HeartbeatToast";
import "./MainFeed.css";

export default function MainFeed() {
  const { letters, viewingLetter } = useLetters();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);

  const toggleCategory = (category) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredLetters = useMemo(() => {
    const query = search.trim().toLowerCase();

    return letters.filter((letter) => {
      const matchesCategory =
        activeCategories.length === 0 || activeCategories.includes(letter.category);

      const matchesSearch =
        query === "" ||
        letter.title.toLowerCase().includes(query) ||
        letter.excerpt.toLowerCase().includes(query) ||
        letter.author.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [letters, search, activeCategories]);

  // Letters you've already opened sink below unread ones (stable sort keeps
  // each group's recency order intact) so new letters surface at the top
  // instead of the same ones you've already read.
  const sortedLetters = useMemo(() => {
    const readIds = user?.readLetterIds || [];
    return [...filteredLetters].sort((a, b) => {
      const aRead = readIds.includes(a.id);
      const bRead = readIds.includes(b.id);
      if (aRead === bRead) return 0;
      return aRead ? 1 : -1;
    });
  }, [filteredLetters, user]);

  // Insert the encouraging card into the middle of the feed — the grid's
  // grid-auto-flow: dense already keeps the masonry layout visually full,
  // so no extra filler tile is needed alongside it.
  const feedItems = useMemo(() => {
    const items = sortedLetters.map((letter) => ({ type: "letter", letter }));
    const midIndex = Math.floor(items.length / 2);
    items.splice(midIndex, 0, { type: "encouraging" });
    return items;
  }, [sortedLetters]);

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

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        onClearCategories={() => setActiveCategories([])}
      />

      <div className="letters-grid">
        {feedItems.map((item) => {
          if (item.type === "encouraging") return <EncouragingCard key="encouraging" />;
          return <LetterCard key={item.letter.id} letter={item.letter} />;
        })}
      </div>

      {filteredLetters.length === 0 && (
        <p className="no-results">No letters match your filters yet.</p>
      )}

      <ComposeButton onClick={() => setComposeOpen(true)} />
      <CommunityButton onClick={() => setCommunityOpen(true)} />

      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />

      <CommunityModal open={communityOpen} onClose={() => setCommunityOpen(false)} />

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />

      {/* keyed by letter id so switching letters resets the modal's local like state */}
      <LetterDetailModal key={viewingLetter?.id ?? "none"} />

      <CommentModal />

      <HeartbeatToast />
    </div>
  );
}
