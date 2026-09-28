"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { projects } from "@/content/projects";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { gsap } from "@/lib/motion/gsap";
import { revealOnScroll, staggerReveal, imageReveal } from "@/lib/motion/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { duration, reveal, stagger, desktopBreakpoint } from "@/lib/motion/tokens";

const ALL = "All";

// .project-card / .project-card-image are this section's own stable hooks
// (none existed before). Intentionally lighter/faster than Featured
// Projects: one shared trigger for the whole grid rather than per-card
// triggers, no parallax, no scale-settle on the images.
//
// This effect depends only on `reducedMotion`, not on the filter state
// (`active`/`filtered`) — clicking a filter button re-renders the grid but
// does NOT re-run this effect, so cards that persist across a filter
// change simply keep whatever GSAP state they already had. No "run once"
// guard is needed for that, and one previously caused a real bug: it broke
// React's dev-mode Strict Mode double-invoke (effect → cleanup → effect
// again), leaving the grid's ScrollTrigger killed on the second invocation
// with nothing left to ever reveal the cards. Every other animated section
// relies on `gsap.context().revert()` being safely re-runnable with no
// extra guard — this section now matches that same proven pattern.
// Per-card tilt/parallax ranges — deliberately small. Card rotation stays
// within ~1.5deg, card translate within ~6px, image pan within ~4px,
// content pan (opposing the image, for a hint of depth) within ~2px. A
// plain 2D `rotation` (Z-axis) is used rather than 3D rotationX/rotationY —
// at this small an angle the two read almost identically, and it avoids
// mixing 2D and 3D quickTo-driven transforms on the same element (which,
// while investigating, reliably left the card un-animated with no error —
// only a "not eligible for reset" warning on the 3D properties). The brief
// itself asks for no "exaggerated 3D tilt," so this is the better fit
// anyway, not just the safer one.
const TILT_ROTATE_DEG = 3; // normalized position (-0.5..0.5) * this = max ~1.5deg
const TILT_TRANSLATE_PX = 12; // -0.5..0.5 * this = max ~6px
const TILT_IMAGE_PAN_PX = 8; // max ~4px
const TILT_CONTENT_PAN_PX = 4; // max ~2px, opposing the image
const TILT_EASE = "power3.out";
const TILT_DURATION = 0.45;

type CardSetters = {
  rotation: (v: number) => void;
  x: (v: number) => void;
  y: (v: number) => void;
  imageX: ((v: number) => void) | null;
  imageY: ((v: number) => void) | null;
  contentX: ((v: number) => void) | null;
  contentY: ((v: number) => void) | null;
};

export function ProjectsGrid() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filters = useMemo(() => {
    const tech = new Set<string>();
    projects.forEach((p) => p.tech.forEach((t) => tech.add(t)));
    return [ALL, ...Array.from(tech).sort()];
  }, []);

  const [active, setActive] = useState<string>(ALL);

  const filtered = useMemo(
    () =>
      active === ALL
        ? projects
        : projects.filter((p) => p.tech.includes(active)),
    [active],
  );

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    const headingBlock = section.querySelector(".max-w-2xl");
    const cards = Array.from(grid.querySelectorAll(".project-card"));
    const images = Array.from(grid.querySelectorAll(".project-card-image"));

    const ctx = gsap.context(() => {
      const allTargets = [headingBlock, ...cards, ...images].filter(Boolean);

      if (reducedMotion) {
        gsap.set(allTargets, { clearProps: "all" });
        return;
      }

      const isDesktop = window.matchMedia(`(min-width: ${desktopBreakpoint}px)`).matches;
      const y = isDesktop ? reveal.distanceSmall : reveal.distanceSmall * 0.75;

      // --- Heading: plays once, restrained. ---
      if (headingBlock) revealOnScroll(headingBlock, { y: reveal.distance });

      // --- Grid: one shared trigger, row-by-row stagger (DOM order already
      // matches reading order for a standard grid). Small movement only. ---
      staggerReveal(cards, {
        y,
        stagger: stagger.children,
        scrollTrigger: { trigger: grid, start: "top 85%" },
      });

      // --- Images: simpler than Featured Projects — clip-path only, no
      // scale-settle, shorter duration. Each shares the same trigger
      // element/point (not per-card triggers) and staggers via its own
      // tween delay rather than fighting card positions. ---
      images.forEach((image, index) => {
        imageReveal(image, {
          scaleFrom: false,
          duration: duration.base,
          delay: index * stagger.children,
          scrollTrigger: { trigger: grid, start: "top 85%" },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  // --- Card micro-interaction: a small, physical-feeling pointer response
  // (tilt + translate on the card, a few px of parallax on its image, a
  // tinier opposing drift on its text/badges). Deliberately a SEPARATE
  // effect from the scroll-reveal above — this is a live, ongoing pointer
  // relationship, not a one-time animation, and its cleanup (removing DOM
  // listeners) is a different concern from reverting GSAP timelines.
  //
  // Listens on the GRID itself (event delegation) rather than attaching a
  // listener per `.project-card` — the grid element is stable across filter
  // changes (only its children swap), so this works correctly no matter
  // which project cards are currently rendered, without needing to
  // re-attach anything when the filter changes. `gsap.quickTo` (not `.to`)
  // is used for every property so repeated pointermove calls just retarget
  // the same eased interpolation instead of spawning a new tween per event
  // — the standard, cheap pattern for continuous pointer-driven motion.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || reducedMotion) return;

    const mm = gsap.matchMedia();

    mm.add("(hover: hover) and (pointer: fine)", () => {
      const setters = new WeakMap<HTMLElement, CardSetters>();
      let activeCard: HTMLElement | null = null;

      function getSetters(card: HTMLElement): CardSetters {
        const cached = setters.get(card);
        if (cached) return cached;

        const image = card.querySelector<HTMLElement>(".project-card-image img");
        const content = card.querySelector<HTMLElement>(".project-card-content");
        const created: CardSetters = {
          rotation: gsap.quickTo(card, "rotation", { duration: TILT_DURATION, ease: TILT_EASE }),
          x: gsap.quickTo(card, "x", { duration: TILT_DURATION, ease: TILT_EASE }),
          y: gsap.quickTo(card, "y", { duration: TILT_DURATION, ease: TILT_EASE }),
          imageX: image ? gsap.quickTo(image, "x", { duration: TILT_DURATION, ease: TILT_EASE }) : null,
          imageY: image ? gsap.quickTo(image, "y", { duration: TILT_DURATION, ease: TILT_EASE }) : null,
          contentX: content
            ? gsap.quickTo(content, "x", { duration: TILT_DURATION, ease: TILT_EASE })
            : null,
          contentY: content
            ? gsap.quickTo(content, "y", { duration: TILT_DURATION, ease: TILT_EASE })
            : null,
        };
        // Warm-up: a freshly-created quickTo's first-ever call establishes
        // its internal PropTween cache rather than actually applying the
        // requested value (a documented GSAP quirk — the very first
        // resetTo() on a property forces a re-init and silently no-ops
        // instead of rendering, rather than tweening). Calling it once with
        // the resting value (0) doesn't fix this by itself, either — GSAP
        // skips creating the PropTween at all when the target equals the
        // element's current value, so a plain warm-up-with-0 is itself the
        // skipped no-op. Warming up with a genuinely different value first
        // forces the real PropTween into existence; settling back to 0
        // immediately after is then a normal, working second call.
        [
          created.rotation,
          created.x,
          created.y,
          created.imageX,
          created.imageY,
          created.contentX,
          created.contentY,
        ].forEach((setter) => {
          setter?.(0.01);
          setter?.(0);
        });
        setters.set(card, created);
        return created;
      }

      function applyTilt(card: HTMLElement, clientX: number, clientY: number) {
        const rect = card.getBoundingClientRect();
        const px = (clientX - rect.left) / rect.width - 0.5;
        const py = (clientY - rect.top) / rect.height - 0.5;
        const s = getSetters(card);

        s.rotation(px * TILT_ROTATE_DEG);
        s.x(px * TILT_TRANSLATE_PX);
        s.y(py * TILT_TRANSLATE_PX);
        s.imageX?.(px * TILT_IMAGE_PAN_PX);
        s.imageY?.(py * TILT_IMAGE_PAN_PX);
        s.contentX?.(-px * TILT_CONTENT_PAN_PX);
        s.contentY?.(-py * TILT_CONTENT_PAN_PX);
      }

      function resetCard(card: HTMLElement) {
        const s = getSetters(card);
        s.rotation(0);
        s.x(0);
        s.y(0);
        s.imageX?.(0);
        s.imageY?.(0);
        s.contentX?.(0);
        s.contentY?.(0);
      }

      function onPointerMove(e: PointerEvent) {
        if (e.pointerType !== "mouse") return;
        const card = (e.target as HTMLElement).closest<HTMLElement>(".project-card");
        if (card !== activeCard) {
          if (activeCard) resetCard(activeCard);
          activeCard = card;
        }
        if (activeCard) applyTilt(activeCard, e.clientX, e.clientY);
      }

      function onPointerLeave() {
        if (activeCard) {
          resetCard(activeCard);
          activeCard = null;
        }
      }

      grid.addEventListener("pointermove", onPointerMove);
      grid.addEventListener("pointerleave", onPointerLeave);

      return () => {
        grid.removeEventListener("pointermove", onPointerMove);
        grid.removeEventListener("pointerleave", onPointerLeave);
        if (activeCard) {
          // Instant, not animated — the component is going away, not the
          // pointer leaving naturally.
          gsap.set(activeCard, { clearProps: "x,y,rotation" });
          const image = activeCard.querySelector<HTMLElement>(".project-card-image img");
          const content = activeCard.querySelector<HTMLElement>(".project-card-content");
          if (image) gsap.set(image, { clearProps: "x,y" });
          if (content) gsap.set(content, { clearProps: "x,y" });
          activeCard = null;
        }
      };
    });

    return () => mm.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="projects" className="scroll-mt-16 py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Archive"
          title="All projects"
          description="Everything, filterable by technology."
        />

        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActive(filter)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                active === filter
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div
          ref={gridRef}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="project-card group block rounded-2xl border border-border bg-surface p-5 transition-colors will-change-transform hover:border-accent/50"
            >
              {project.image ? (
                <div
                  className="project-card-image relative w-full overflow-hidden rounded-xl"
                  style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}
                >
                  <Image
                    src={project.image.src}
                    alt={project.image.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover will-change-transform"
                  />
                </div>
              ) : (
                <div
                  className="h-28 w-full rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${project.coverColor}33, ${project.coverColor}0d)`,
                    border: `1px solid ${project.coverColor}44`,
                  }}
                  aria-hidden
                />
              )}
              <div className="project-card-content">
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                  {project.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{project.pitch}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.tech.slice(0, 3).map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-8 text-muted">No projects match that filter.</p>
        ) : null}
      </Container>
    </section>
  );
}
