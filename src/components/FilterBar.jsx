import { EMOTIONS } from "../data/categories";
import "./FilterBar.css";

export default function FilterBar({
  search,
  onSearchChange,
  activeCategories,
  onToggleCategory,
  onClearCategories,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-search">
        <input
          type="text"
          placeholder="Search letters..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-chips">
        <button
          className={`chip ${activeCategories.length === 0 ? "active" : ""}`}
          onClick={onClearCategories}
        >
          All
        </button>

        {EMOTIONS.map((emotion) => (
          <button
            key={emotion}
            className={`chip ${activeCategories.includes(emotion) ? "active" : ""}`}
            onClick={() => onToggleCategory(emotion)}
          >
            {emotion}
          </button>
        ))}
      </div>
    </div>
  );
}
