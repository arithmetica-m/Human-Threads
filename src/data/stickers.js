import evilEye from "../assets/images/Screenshot 2026-07-28 175828.png";
import bow from "../assets/images/Screenshot 2026-07-28 175840.png";
import pinkLily from "../assets/images/Screenshot 2026-07-28 175859.png";
import rosewoodBloom from "../assets/images/Screenshot 2026-07-28 175919.png";
import kiss from "../assets/images/Screenshot 2026-07-28 175948.png";
import redButterfly from "../assets/images/Screenshot 2026-07-28 180018.png";
import monsteraLeaf from "../assets/images/Screenshot 2026-07-28 180055.png";
import tree from "../assets/images/Screenshot 2026-07-28 180103.png";
import bunny from "../assets/images/Screenshot 2026-07-28 180121.png";
import penguin from "../assets/images/Screenshot 2026-07-28 180131.png";
import seal from "../assets/images/Screenshot 2026-07-28 180142.png";
import dolphin from "../assets/images/Screenshot 2026-07-28 180154.png";
import greenHeart from "../assets/images/Screenshot 2026-07-28 180222.png";
import blueHeart from "../assets/images/Screenshot 2026-07-28 180227.png";
import moon from "../assets/icons/sticker-moon.svg";
import sprig from "../assets/icons/sticker-sprig.svg";
import sun from "../assets/icons/sticker-sun.svg";
import sparkle from "../assets/icons/sticker-sparkle.svg";

export const MAX_STICKERS = 3;

export const STICKERS = [
  { id: "evil-eye", label: "Evil Eye", image: evilEye },
  { id: "bow", label: "Bow", image: bow },
  { id: "pink-lily", label: "Pink Lily", image: pinkLily },
  { id: "rosewood-bloom", label: "Rosewood Bloom", image: rosewoodBloom },
  { id: "kiss", label: "Kiss", image: kiss },
  { id: "red-butterfly", label: "Red Butterfly", image: redButterfly },
  { id: "monstera-leaf", label: "Monstera Leaf", image: monsteraLeaf },
  { id: "tree", label: "Tree", image: tree },
  { id: "bunny", label: "Bunny", image: bunny },
  { id: "penguin", label: "Penguin", image: penguin },
  { id: "seal", label: "Seal", image: seal },
  { id: "dolphin", label: "Dolphin", image: dolphin },
  { id: "green-heart", label: "Green Heart", image: greenHeart },
  { id: "blue-heart", label: "Blue Heart", image: blueHeart },
  { id: "moon", label: "Crescent Moon", image: moon },
  { id: "sprig", label: "Sprig", image: sprig },
  { id: "sun", label: "Sun", image: sun },
  { id: "sparkle", label: "Sparkle", image: sparkle },
];

export function getSticker(id) {
  return STICKERS.find((s) => s.id === id);
}
