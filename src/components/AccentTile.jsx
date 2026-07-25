import { FeatherIcon } from "./icons";
import "./AccentTile.css";

// Purely decorative filler tile — just a soft wash + icon, no text or
// interaction — used to keep the masonry grid feeling full rather than
// leaving bare patches of background between cards.
export default function AccentTile() {
  return (
    <div className="accent-tile">
      <FeatherIcon size={30} />
    </div>
  );
}
