import { useEffect, useState } from "react";
import heroImage from "../assets/images/gemini-2.5-flash-image_create_a_subtle_calming_watercolour_background_using_this_colour_palette_give_it-0.jpg";
import "./Landing.css";

export default function Landing({ onNavigate }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrolled = scrollY > 60;

  return (
    <div className="landing">
      <section className="landing-hero">
        {/* TODO: swap this for your own background image — replace the
            `heroImage` import above with your file (e.g. "../assets/images/your-file.jpg") */}
        <div
          className="landing-hero-bg"
          style={{
            backgroundImage: `url(${heroImage})`,
            transform: `translateY(${scrollY * 0.35}px)`,
          }}
        />
        <div className="landing-hero-scrim" />

        <div className={`landing-topbar ${scrolled ? "scrolled" : ""}`}>
          <span className="landing-logo">Human Threads</span>
          <div className="landing-auth">
            <button className="btn btn-ghost" onClick={() => onNavigate("login")}>Log In</button>
            <button className="btn btn-solid" onClick={() => onNavigate("signup")}>Sign Up</button>
          </div>
        </div>

        <div
          className="landing-hero-content"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: Math.max(1 - scrollY / 350, 0),
          }}
        >
          <h1 className="landing-title">Human Threads</h1>

          {/* FILL IN: your one-line comment/tagline under the title goes here */}
          <p className="landing-tagline">Write. Connect. Heal.</p>
        </div>

        <div className="landing-scroll-cue" aria-hidden="true">
          <span className="landing-scroll-line" />
          <p>Scroll</p>
        </div>
      </section>

      <section className="landing-info">
        <div className="landing-info-inner">
          <h2>About Human Threads</h2>

          {/* FILL IN: your longer "about the website" message goes here */}
          <p>
            [ Human Threads is a website designed and built by two students who want to help everyone find some peace, feel supported, and improve their mood. 
            it is designed to address the growing issue of mental health problems through the process of writing a letter and sharing your emotions, a story, or anything else you want to express anonymously.
            Users can also read the letters others have sent and are encouraged to provide advice and support. The site also celebrates the small wins of each person and has a mini to-do list of daily and weekly activities 
            users can complete. It is in no way claiming to cure mental health problems or claiming to be a profesional tool for the issue, but simply applying techniques which have been proven 
            to help those struggling feel better. The whole site is anonymous for protection and privacy. Write. Connect. Heal. That's what human threads is about. ]
          </p>
        </div>
      </section>
    </div>
  );
}
