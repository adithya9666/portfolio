// Single authoritative place GSAP/ScrollTrigger get registered. Every motion
// file (provider, sections, utilities) imports gsap/ScrollTrigger from here
// instead of the raw packages, so the plugin is registered exactly once
// regardless of how many components end up using it.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
