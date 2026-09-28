import type { ProjectImage } from "./types";

// Registry of Adithya's real personal photos. Untouched originals — no
// cropping, compositing, or generated variants. `formal` is used in Hero,
// `casual` in About.
export const personalPhotos = {
  formal: {
    src: "/profile-formal.jpeg",
    width: 853,
    height: 886,
    description: "Formal portrait — navy suit and tie, white background.",
  },
  casual: {
    src: "/profile-casual.jpeg",
    width: 1057,
    height: 1280,
    description: "Casual portrait — dark button-down shirt, white background.",
  },
} as const;

// Approved AI-generated project visuals, provided as-is by Adithya — files
// are untouched originals (do not regenerate, edit, crop, or replace).
// Keyed by project slug for an explicit, type-checked association with
// content/projects.ts. Dimensions were inspected directly from the files
// (all currently 1672x941) rather than assumed.
export const projectImages: Record<string, ProjectImage> = {
  careeros: {
    src: "/COS.png",
    width: 1672,
    height: 941,
    alt: "CareerOS project visual",
  },
  "telangana-reels": {
    src: "/TR.jpeg",
    width: 1672,
    height: 941,
    alt: "Telangana Reels project visual",
  },
  "hexapod-walking-robot": {
    src: "/HP.jpeg",
    width: 1672,
    height: 941,
    alt: "Hexapod Walking Robot project visual",
  },
  "student-check-in-system": {
    src: "/SC.jpeg",
    width: 1672,
    height: 941,
    alt: "Student Check-In System project visual",
  },
  "weather-forecasting-application": {
    src: "/WA.jpeg",
    width: 1672,
    height: 941,
    alt: "Weather Forecasting Application project visual",
  },
};
