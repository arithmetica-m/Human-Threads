import sageMist from "../assets/images/Screenshot 2026-07-25 173928.png";
import skyWash from "../assets/images/Screenshot 2026-07-25 174416.png";
import rosewood from "../assets/images/Screenshot 2026-07-25 174455.png";
import dawnHorizon from "../assets/images/Screenshot 2026-07-25 174720.png";
import meadowDrift from "../assets/images/Screenshot 2026-07-25 174811.png";

export const LETTER_BACKGROUNDS = [
  { id: "sage-mist", label: "Sage Mist", image: sageMist },
  { id: "sky-wash", label: "Sky Wash", image: skyWash },
  { id: "rosewood", label: "Rosewood", image: rosewood },
  { id: "dawn-horizon", label: "Dawn Horizon", image: dawnHorizon },
  { id: "meadow-drift", label: "Meadow Drift", image: meadowDrift },
];

// Letters store a stable `backgroundId` (not the built asset URL, which is
// hashed per-build and would break across deployments) — resolve it back to
// the actual image at render time.
export function getBackgroundImage(backgroundId) {
  return LETTER_BACKGROUNDS.find((bg) => bg.id === backgroundId)?.image;
}
