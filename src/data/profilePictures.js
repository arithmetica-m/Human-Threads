import moon from "../assets/images/Screenshot 2026-07-27 142547.png";
import crescentMoon from "../assets/images/Screenshot 2026-07-27 142558.png";
import lily from "../assets/images/Screenshot 2026-07-27 142620.png";
import sageBlossoms from "../assets/images/Screenshot 2026-07-27 142745.png";
import sun from "../assets/images/Screenshot 2026-07-27 142800.png";
import sunburst from "../assets/images/Screenshot 2026-07-27 142812.png";
import star from "../assets/images/Screenshot 2026-07-27 142837.png";
import paleStar from "../assets/images/Screenshot 2026-07-27 142902.png";
import wave from "../assets/images/Screenshot 2026-07-27 142931.png";
import oceanWaves from "../assets/images/Screenshot 2026-07-27 142959.png";
import tree from "../assets/images/Screenshot 2026-07-27 143018.png";
import cherryBlossomTree from "../assets/images/Screenshot 2026-07-27 143044.png";
import redTurtle from "../assets/images/Screenshot 2026-07-27 143109.png";
import blueTurtle from "../assets/images/Screenshot 2026-07-27 143122.png";
import seahorse from "../assets/images/Screenshot 2026-07-27 143202.png";
import greenButterfly from "../assets/images/Screenshot 2026-07-27 143223.png";
import pinkButterfly from "../assets/images/Screenshot 2026-07-27 143230.png";
import apple from "../assets/images/Screenshot 2026-07-27 143251.png";

export const PROFILE_PICTURES = [
  { id: "moon", label: "Moon", image: moon },
  { id: "crescent-moon", label: "Crescent Moon", image: crescentMoon },
  { id: "lily", label: "Lily", image: lily },
  { id: "sage-blossoms", label: "Sage Blossoms", image: sageBlossoms },
  { id: "sun", label: "Sun", image: sun },
  { id: "sunburst", label: "Sunburst", image: sunburst },
  { id: "star", label: "Star", image: star },
  { id: "pale-star", label: "Pale Star", image: paleStar },
  { id: "wave", label: "Wave", image: wave },
  { id: "ocean-waves", label: "Ocean Waves", image: oceanWaves },
  { id: "tree", label: "Tree", image: tree },
  { id: "cherry-blossom-tree", label: "Cherry Blossom Tree", image: cherryBlossomTree },
  { id: "red-turtle", label: "Red Turtle", image: redTurtle },
  { id: "blue-turtle", label: "Blue Turtle", image: blueTurtle },
  { id: "seahorse", label: "Seahorse", image: seahorse },
  { id: "green-butterfly", label: "Green Butterfly", image: greenButterfly },
  { id: "pink-butterfly", label: "Pink Butterfly", image: pinkButterfly },
  { id: "apple", label: "Apple", image: apple },
];

export function getProfilePicture(id) {
  return PROFILE_PICTURES.find((p) => p.id === id)?.image;
}
