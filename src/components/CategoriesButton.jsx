import { CompassIcon } from "./icons";
import "./CategoriesButton.css";

export default function CategoriesButton({ onClick }) {
  return (
    <button className="categories-button" aria-label="Browse categories" onClick={onClick}>
      <CompassIcon />
      <span>Categories</span>
    </button>
  );
}
