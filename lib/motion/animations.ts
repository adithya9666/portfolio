// Small, composable motion helpers for the upcoming section-by-section pass.
// These are plain functions, not React components/hooks — call them from
// within a section's own `gsap.context()` (same pattern Hero already uses),
// so the calling component keeps ownership of setup/cleanup and can freely
// combine helpers instead of being forced into one prescribed pattern.
//
// Not wired into any section yet. A horizontal-scroll/pin helper is
// deliberately not included here — that pattern is tightly coupled to each
// section's specific DOM structure (pinned wrapper + track), so it'll be
// built directly against ScrollTrigger when Skills/Featured Projects are
// actually animated, rather than guessed at now.

import { gsap, ScrollTrigger } from "./gsap";
import { duration, ease, opacity, reveal, scale, scrub, stagger } from "./tokens";

type Target = gsap.TweenTarget;
type ScrollTriggerVars = ScrollTrigger.Vars;

interface RevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  /** Pass `false` to play immediately instead of on scroll-into-view. */
  scrollTrigger?: Partial<ScrollTriggerVars> | false;
}

/** Fade + subtle rise, played once when the element scrolls into view. */
export function revealOnScroll(target: Target, options: RevealOptions = {}) {
  const { y = reveal.distance, duration: d = duration.base, delay = 0, scrollTrigger } = options;

  gsap.set(target, { opacity: opacity.hidden, y });

  return gsap.to(target, {
    opacity: opacity.visible,
    y: 0,
    duration: d,
    delay,
    ease: ease.expoOut,
    scrollTrigger:
      scrollTrigger === false
        ? undefined
        : {
            trigger: target as Element,
            start: "top 85%",
            toggleActions: "play none none none",
            ...scrollTrigger,
          },
  });
}

interface StaggerRevealOptions extends RevealOptions {
  /** Horizontal offset — for a group that should differentiate itself from a purely-vertical reveal elsewhere on the same page. Defaults to 0. */
  x?: number;
  stagger?: number;
  /** Element ScrollTrigger should watch; defaults to the first target. */
  triggerEl?: Element;
}

/** Same reveal as `revealOnScroll`, applied to a group of children with a controlled stagger. */
export function staggerReveal(targets: Target, options: StaggerRevealOptions = {}) {
  const {
    x = 0,
    y = reveal.distance,
    duration: d = duration.base,
    delay = 0,
    stagger: s = stagger.children,
    scrollTrigger,
    triggerEl,
  } = options;

  gsap.set(targets, { opacity: opacity.hidden, x, y });

  return gsap.to(targets, {
    opacity: opacity.visible,
    x: 0,
    y: 0,
    duration: d,
    delay,
    stagger: s,
    ease: ease.expoOut,
    scrollTrigger:
      scrollTrigger === false
        ? undefined
        : {
            trigger: triggerEl ?? (Array.isArray(targets) ? (targets[0] as Element) : (targets as Element)),
            start: "top 85%",
            toggleActions: "play none none none",
            ...scrollTrigger,
          },
  });
}

/** Masked word/line reveal — the same technique as Hero's name, generalized for reuse. */
export function maskTextReveal(innerSpans: Target, options: { stagger?: number; delay?: number } = {}) {
  gsap.set(innerSpans, { yPercent: 110 });

  return gsap.to(innerSpans, {
    yPercent: 0,
    duration: duration.slow,
    delay: options.delay ?? 0,
    ease: ease.expoOut,
    stagger: options.stagger ?? stagger.word,
  });
}

interface ImageRevealOptions {
  /** Wipe axis — "left" matches Hero's existing photo treatment. */
  direction?: "left" | "top";
  /** Pass `false` to skip the scale-settle and reveal via clip-path only. */
  scaleFrom?: number | false;
  /** Defaults to `duration.slow` (Hero/About/Featured Projects' pace). */
  duration?: number;
  /** Offsets when the tween starts after its trigger fires — for staggering several independent image reveals sharing one trigger. */
  delay?: number;
  scrollTrigger?: Partial<ScrollTriggerVars> | false;
}

/** Clip-path (+ optional scale-settle) reveal for images, mirroring Hero's photo treatment. */
export function imageReveal(target: Target, options: ImageRevealOptions = {}) {
  const {
    direction = "left",
    scaleFrom = scale.photoFrom,
    duration: d = duration.slow,
    delay = 0,
    scrollTrigger,
  } = options;
  const clipHidden = direction === "left" ? "inset(0 0 0 100%)" : "inset(0 0 100% 0)";
  const clipVisible = direction === "left" ? "inset(0 0 0 0%)" : "inset(0 0 0% 0)";

  gsap.set(target, {
    clipPath: clipHidden,
    ...(scaleFrom === false ? {} : { scale: scaleFrom }),
  });

  return gsap.to(target, {
    clipPath: clipVisible,
    ...(scaleFrom === false ? {} : { scale: scale.to }),
    duration: d,
    delay,
    ease: ease.expoOut,
    scrollTrigger:
      scrollTrigger === false
        ? undefined
        : {
            trigger: target as Element,
            start: "top 80%",
            toggleActions: "play none none none",
            ...scrollTrigger,
          },
  });
}

/**
 * Gentle scroll-scrubbed vertical drift. Desktop/tablet only by convention —
 * gate the call site with `gsap.matchMedia()` against `desktopBreakpoint`,
 * the same pattern Hero already uses for its own parallax.
 */
export function parallaxY(target: Target, distancePercent = 10, triggerEl?: Element) {
  return gsap.to(target, {
    yPercent: -distancePercent,
    ease: "none",
    scrollTrigger: {
      trigger: triggerEl ?? (target as Element),
      start: "top bottom",
      end: "bottom top",
      scrub: scrub.soft,
    },
  });
}

/**
 * Gentle scroll-scrubbed horizontal drift, in pixels (not percent — this is
 * for "a few px" nudges on fixed-size elements like cards, not a proportional
 * offset). Desktop/tablet only by convention — gate with `gsap.matchMedia()`.
 */
export function parallaxX(target: Target, distancePx = 10, triggerEl?: Element) {
  return gsap.to(target, {
    x: distancePx,
    ease: "none",
    scrollTrigger: {
      trigger: triggerEl ?? (target as Element),
      start: "top bottom",
      end: "bottom top",
      scrub: scrub.soft,
    },
  });
}
