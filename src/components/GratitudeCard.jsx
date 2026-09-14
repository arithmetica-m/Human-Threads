import { getCategoryAccent, getCategoryTint } from "../data/categories";
import { getBackgroundImage } from "../data/letterBackgrounds";
import { getSticker } from "../data/stickers";
import defaultTexture from "../assets/images/Screenshot 2026-07-24 215407.png";
import "./GratitudeCard.css";

// Same deterministic per-card tilt as LetterCard.jsx, so a gratitude entry
// reads as the same kind of postcard, just living in its own section —
// same background/stickers/title/excerpt, minus a category and any
// like/comment/favourite actions.
function hashId(id) {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000;
  }
  return Math.abs(hash);
}

export default function GratitudeCard({ entry }) {
  const accent = getCategoryAccent("Gratitude");
  const tint = getCategoryTint("Gratitude", true);
  const texture = getBackgroundImage(entry.backgroundId) || defaultTexture;
  const hash = hashId(entry.id);
  const rotation = (hash % 2 === 0 ? -1 : 1) * (1 + (hash % 3) * 0.4);

  return (
    <article
      className="gratitude-card"
      style={{
        "--accent": accent,
        "--rotation": `${rotation}deg`,
        backgroundImage: `linear-gradient(${tint}, ${tint}), url(${texture})`,
      }}
    >
      {(entry.stickerIds || []).length > 0 && (
        <div className="gratitude-card__stickers" aria-hidden="true">
          {entry.stickerIds.map((id) => {
            const sticker = getSticker(id);
            return sticker ? <img key={id} src={sticker.image} alt="" /> : null;
          })}
        </div>
      )}

      <span className="gratitude-card__stamp">Gratitude</span>

      <p className="gratitude-card__author">from {entry.authorUsername}</p>
      {entry.title && <h3 className="gratitude-card__title">{entry.title}</h3>}
      <p className="gratitude-card__excerpt">{entry.excerpt || entry.text}</p>

      {entry.status === "pending" && (
        <span className="gratitude-card__pending">pending review</span>
      )}
    </article>
  );
}
