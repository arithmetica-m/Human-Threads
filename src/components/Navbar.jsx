import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        Human Threads
      </div>

      <div className="nav-links">
        <a href="#">Explore</a>
        <a href="#">Stories</a>
        <a href="#">About</a>

        <button className="join-button">
          Join
        </button>
      </div>

    </nav>
  );
}