import { useCommunity } from "../context/CommunityContext";
import { XIcon, PencilIcon, LightbulbIcon, HeartIcon, CommentIcon, EyeIcon } from "./icons";
import TapestryButterfly from "./TapestryButterfly";
import "./CommunityModal.css";

const STAT_ITEMS = [
  { key: "weekSupportGiven", label: "Supportive comments this week", Icon: HeartIcon },
  { key: "weekTipsGiven", label: "Tips shared this week", Icon: LightbulbIcon },
  { key: "weekLettersRead", label: "Letters read this week", Icon: EyeIcon },
  { key: "weekLettersWritten", label: "Letters written this week", Icon: PencilIcon },
  { key: "totalLettersWritten", label: "Letters written in total", Icon: PencilIcon },
  { key: "totalOtherComments", label: "Comments shared in total", Icon: CommentIcon },
];

export default function CommunityModal({ open, onClose }) {
  const { stats } = useCommunity();

  if (!open) return null;

  return (
    <div className="community-overlay" onClick={onClose}>
      <div className="community-modal" onClick={(e) => e.stopPropagation()}>
        <button className="community-modal__close" onClick={onClose} aria-label="Close">
          <XIcon />
        </button>

        <div className="community-modal__scroll">
          <h2 className="community-modal__title">Community</h2>

          {/* FILL IN: set this from the Firebase console — community/stats.specialAchievement */}
          {stats?.specialAchievement && (
            <div className="community-achievement">
              <span className="community-achievement__label">This week's achievement</span>
              <p>{stats.specialAchievement}</p>
            </div>
          )}

          <div className="community-stats">
            {STAT_ITEMS.map(({ key, label, Icon }) => (
              <div className="community-stat" key={key}>
                <Icon size={20} />
                <span className="community-stat__value">{stats?.[key] ?? 0}</span>
                <span className="community-stat__label">{label}</span>
              </div>
            ))}
          </div>

          <div className="community-tapestry-section">
            <h3>The Community Tapestry</h3>
            <p className="community-tapestry-intro">
              Every letter sent, and every daily or weekly activity completed, adds
              one more thread — woven by everyone, together.
            </p>
            <TapestryButterfly />
          </div>
        </div>
      </div>
    </div>
  );
}
