// Shared motion vocabulary — every animated section should pull from this
// file rather than inventing its own durations/easings/distances, so the
// site reads as one cinematic signature instead of per-component tuning.
// Values are deliberately restrained: editorial easing, subtle distances,
// no bounce/elastic/overshoot-heavy motion.

export const ease = {
  // Primary signature curve for entrances and reveals.
  expoOut: "expo.out",
  // Softer curve for scroll-scrubbed transforms (parallax, fades).
  smooth: "power2.out",
  // Gentle curve for small, quick UI transitions.
  soft: "power1.out",
} as const;

export const duration = {
  fast: 0.4,
  base: 0.6,
  slow: 1.1,
} as const;

export const stagger = {
  word: 0.07,
  // Generic stagger for groups of sibling elements (cards, list rows, badges).
  children: 0.08,
} as const;

// Vertical rise distance for reveal-on-scroll treatments, in pixels.
export const reveal = {
  distance: 32,
  distanceSmall: 16,
} as const;

// Shared opacity levels — "dim" matches the receding/parallax-fade look
// already used in Hero, so later sections stay visually consistent.
export const opacity = {
  hidden: 0,
  dim: 0.3,
  visible: 1,
} as const;

// Shared scale levels for reveal/settle treatments.
export const scale = {
  from: 0.96,
  // Matches Hero's existing photo-reveal overshoot.
  photoFrom: 1.05,
  to: 1,
} as const;

// ScrollTrigger `scrub` values. `true` is rigid 1:1 tracking (used by Hero's
// existing parallax); a number is seconds of smoothing lag for a gentler,
// more cinematic catch-up feel — preferred for new scroll-scrubbed work.
export const scrub = {
  tight: true,
  soft: 0.6,
} as const;

// Below this breakpoint, scroll-jacking/pinning/parallax are disabled in
// favor of plain stacked layouts (see the responsive/mobile strategy).
export const desktopBreakpoint = 1024;

// Sticky header height in px — used to offset smooth-scroll targets so
// section content doesn't land underneath the fixed header.
export const headerHeightPx = 64;
