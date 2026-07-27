import { useMemo, useState } from "react";
import { useLetters } from "../context/LettersContext";
import { useUser } from "../context/UserContext";
import AppTopBar from "../components/AppTopBar";
import FilterBar from "../components/FilterBar";
import LetterCard from "../components/LetterCard";
import EncouragingCard from "../components/EncouragingCard";
import AccentTile from "../components/AccentTile";
import ComposeButton from "../components/ComposeButton";
import CommunityButton from "../components/CommunityButton";
import ProfilePanel from "../components/ProfilePanel";
import ComposeModal from "../components/ComposeModal";
import CommunityModal from "../components/CommunityModal";
import LetterDetailModal from "../components/LetterDetailModal";
import CommentModal from "../components/CommentModal";
import EmailVerificationBanner from "../components/EmailVerificationBanner";
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

  // Insert the encouraging card into the middle of the feed, plus a small
  // decorative accent tile earlier on — both help keep the masonry grid
  // (grid-auto-flow: dense) visually full rather than leaving bare gaps.
  const feedItems = useMemo(() => {
    const items = sortedLetters.map((letter) => ({ type: "letter", letter }));
    const midIndex = Math.floor(items.length / 2);
    items.splice(midIndex, 0, { type: "encouraging" });
    const quarterIndex = Math.floor(items.length / 4);
    items.splice(quarterIndex, 0, { type: "accent" });
    return items;
  }, [sortedLetters]);

  return (
    <div className="main-feed">
      <AppTopBar onOpenProfile={() => setProfileOpen(true)} />
      <EmailVerificationBanner />

      <header className="feed-header">
        <h1>Letters I&apos;ll Never Send</h1>
        {/* FILL IN: optional short encouraging message under the heading */}
        <p className="feed-subheading">[ Optional short message goes here ]</p>
      </header>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        onClearCategories={() => setActiveCategories([])}
      />

      <div className="letters-grid">
        {feedItems.map((item, index) => {
          if (item.type === "encouraging") return <EncouragingCard key="encouraging" />;
          if (item.type === "accent") return <AccentTile key={`accent-${index}`} />;
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
    </div>
  );
}
