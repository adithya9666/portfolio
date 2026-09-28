"use client";

import { useLayoutEffect, useRef } from "react";
import { skillCategories } from "@/content/skills";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { gsap } from "@/lib/motion/gsap";
import { revealOnScroll } from "@/lib/motion/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { duration, ease, opacity, reveal, stagger, scrub, desktopBreakpoint } from "@/lib/motion/tokens";

// EXPERIMENT (Skills orbit, pass 1): same dual-tree pattern as Nav/MobileMenu
// and FeaturedProjects — `.skills-stage` (desktop, pinned orbital scene) and
// `.skills-fallback` (the original editorial grid, unchanged). Both always
// render; visibility is resolved by CSS only (`lg:` utilities, plus the
// prefers-reduced-motion override in globals.css), so there's no hydration
// mismatch. `content/skills.ts` (categories/items) is read once and rendered
// into both trees — never duplicated or altered.

// Each orbit node's starting angle (degrees, screen convention: 0=right,
// 90=down, -90=up) on a shared ellipse around the stage center — this
// reproduces the same opening composition as before (Languages top,
// Frontend/Backend upper sides, Database/Core CS lower sides) but as true
// polar positions instead of hand-picked x/y, so the middle phase can
// revolve them as one rigid system. Paired 1:1 with skillCategories by
// index — five categories, five angles, order unchanged.
const ORBIT_NODES: { angle: number; depth: "fore" | "mid" | "back" }[] = [
  { angle: -90, depth: "fore" }, // Languages
  { angle: -160, depth: "mid" }, // Frontend
  { angle: -20, depth: "mid" }, // Backend
  { angle: 146, depth: "back" }, // Database
  { angle: 34, depth: "back" }, // Core CS
];

// Ellipse radii for every node's orbit path. rX is wider than the old fixed
// x-offsets specifically so a node passing near the 0deg/180deg points
// (where the ellipse is closest to the vertical axis) still clears the
// central focal element — see the overlap check in ORBIT_RX's comment.
const ORBIT_RX = 340;
const ORBIT_RY = 260;

// Total orbital travel for the middle phase, in degrees. Within the
// requested 120-180deg range — enough to clearly read as revolving without
// losing track of which card is which.
const ORBIT_DEGREES = 150;

// Subtle scale/opacity wobble layered on top of each node's base depth
// tier, driven by the node's OWN orbital angle (sin of it) — nodes swinging
// toward the bottom of their arc read as very slightly closer/clearer,
// toward the top very slightly further/quieter. Kept small deliberately:
// every card must stay readable throughout the orbit.
const DEPTH_WOBBLE_SCALE = 0.05;
const DEPTH_WOBBLE_OPACITY = 0.06;

const DEPTH_STYLE = {
  fore: { scale: 1.05, opacity: 1, zIndex: 30 },
  mid: { scale: 0.92, opacity: 0.9, zIndex: 20 },
  back: { scale: 0.82, opacity: 0.76, zIndex: 10 },
} as const;

// The one place x/y are ever derived from an angle — every position in the
// approach, orbit, and collapse phases below is computed by calling this,
// never hand-authored. The node's own box is never rotated, only this
// translated position, so text always stays upright.
function posAtAngle(degrees: number) {
  const rad = (degrees * Math.PI) / 180;
  return { x: ORBIT_RX * Math.cos(rad), y: ORBIT_RY * Math.sin(rad) };
}

function depthAtAngle(degrees: number, style: { scale: number; opacity: number }) {
  const wobble = Math.sin((degrees * Math.PI) / 180);
  return {
    scale: style.scale + wobble * DEPTH_WOBBLE_SCALE,
    opacity: style.opacity + wobble * DEPTH_WOBBLE_OPACITY,
  };
}

export function Skills() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const headingBlock = section.querySelector(".max-w-2xl");
    const stage = stageRef.current;
    const fallbackGroups = Array.from(
      section.querySelectorAll<HTMLDivElement>(".skill-group"),
    );

    // Owned by this effect run only — reverted exactly once, from this
    // effect's own cleanup below (never from inside one of its own
    // condition callbacks — see the note in Hero.tsx for why that recurses).
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const fallbackLabels = fallbackGroups.map((g) => g.querySelector(".skill-label"));
      const fallbackBadgeSets = fallbackGroups.map((g) =>
        Array.from(g.querySelectorAll(".skill-items > span")),
      );

      const orbitNodes = stage ? Array.from(stage.querySelectorAll<HTMLElement>(".skill-orbit-node")) : [];
      const focal = stage ? stage.querySelector<HTMLElement>(".skills-focal") : null;

      const allTargets = [
        headingBlock,
        ...fallbackGroups,
        ...fallbackLabels,
        ...fallbackBadgeSets.flat(),
        ...orbitNodes,
        focal,
      ].filter(Boolean);

      if (reducedMotion) {
        // Every group's content simply visible in the fallback grid (the
        // stage is display:none via globals.css at this point) — no orbit,
        // no pin, no stagger needed for either tree.
        gsap.set(allTargets, { clearProps: "all" });
        return;
      }

      // --- Heading: plays once, restrained — only ever matches the
      // fallback tree's SectionHeading (the desktop stage has its own
      // compact centered heading, not this element). ---
      if (headingBlock) revealOnScroll(headingBlock, { y: reveal.distance });

      mm.add(
        {
          isDesktop: `(min-width: ${desktopBreakpoint}px)`,
          isMobile: `(max-width: ${desktopBreakpoint - 1}px)`,
        },
        (context) => {
          const { isDesktop } = context.conditions as { isDesktop: boolean };

          if (isDesktop && stage && orbitNodes.length > 0) {
            // --- Initial state: nodes gathered small and faint near the
            // center, ready to swing out along a curved path. ---
            gsap.set(focal, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.9 });
            orbitNodes.forEach((node, i) => {
              const { angle, depth } = ORBIT_NODES[i];
              const home = posAtAngle(angle);
              gsap.set(node, {
                xPercent: -50,
                yPercent: -50,
                x: home.x * 0.12,
                y: home.y * 0.12,
                scale: 0.5,
                opacity: 0,
                zIndex: DEPTH_STYLE[depth].zIndex,
              });
            });

            const APPROACH = 1.2;
            const ORBIT = 1.2;
            const COLLAPSE = 0.8;

            const masterTl = gsap.timeline({
              scrollTrigger: {
                trigger: stage,
                start: "top top",
                end: () => `+=${window.innerHeight * 2.4}`,
                scrub: scrub.soft,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });

            // Focal point confirms into view alongside the approach, stays
            // steady through the orbit, and settles back during collapse —
            // it never moves position, only presence.
            masterTl
              .to(focal, { opacity: 1, scale: 1, duration: APPROACH * 0.6, ease: "power2.out" }, 0)
              .to(focal, { opacity: 0.6, scale: 0.94, duration: COLLAPSE, ease: "power1.in" }, APPROACH + ORBIT);

            orbitNodes.forEach((node, i) => {
              const { angle: homeAngle, depth } = ORBIT_NODES[i];
              const style = DEPTH_STYLE[depth];
              const swingDir = i % 2 === 0 ? 1 : -1;

              // Approach: curve in from near-center to an angle just past
              // home, then settle into the home angle/position — unchanged
              // shape from before, now expressed as angles on the same
              // ellipse the orbit phase uses, so the handoff is seamless.
              const peakAngle = homeAngle + 25 * swingDir;
              const peak = posAtAngle(peakAngle);
              const home = posAtAngle(homeAngle);
              const homeDepth = depthAtAngle(homeAngle, style);

              // Orbit: a TRUE revolution around the focal point. A plain
              // numeric angle is tweened (not x/y directly) and an onUpdate
              // derives position/depth from it each tick via posAtAngle /
              // depthAtAngle — this is what makes the path a genuine arc
              // instead of a straight-line interpolation between two
              // points. Every node advances by the same ORBIT_DEGREES, so
              // the whole arrangement revolves together as one system.
              const orbitEndAngle = homeAngle + ORBIT_DEGREES;
              const orbitEndPos = posAtAngle(orbitEndAngle);

              // Collapse: converge inward and down from wherever the orbit
              // ended, shrinking and dimming, ahead of the release into
              // Problem Solving.
              const settleX = orbitEndPos.x * 0.5;
              const settleY = orbitEndPos.y * 0.3 + 80;

              const angleProxy = { value: homeAngle };

              masterTl
                .to(
                  node,
                  {
                    x: peak.x,
                    y: peak.y,
                    scale: style.scale * 0.85,
                    opacity: style.opacity * 0.7,
                    duration: APPROACH * 0.6,
                    ease: "power2.out",
                  },
                  0,
                )
                .to(
                  node,
                  {
                    x: home.x,
                    y: home.y,
                    scale: homeDepth.scale,
                    opacity: homeDepth.opacity,
                    duration: APPROACH * 0.4,
                    ease: "power2.inOut",
                  },
                  APPROACH * 0.6,
                )
                .to(
                  angleProxy,
                  {
                    value: orbitEndAngle,
                    duration: ORBIT,
                    ease: "none",
                    onUpdate: () => {
                      const pos = posAtAngle(angleProxy.value);
                      const d = depthAtAngle(angleProxy.value, style);
                      gsap.set(node, { x: pos.x, y: pos.y, scale: d.scale, opacity: d.opacity });
                    },
                  },
                  APPROACH,
                )
                .to(
                  node,
                  {
                    x: settleX,
                    y: settleY,
                    scale: style.scale * 0.8,
                    opacity: style.opacity * 0.5,
                    duration: COLLAPSE,
                    ease: "power1.in",
                  },
                  APPROACH + ORBIT,
                );
            });
          } else if (!isDesktop) {
            // --- Mobile: original per-group reveal, unchanged. ---
            const labelY = reveal.distanceSmall * 0.75;
            const badgeY = reveal.distanceSmall;

            fallbackGroups.forEach((group, index) => {
              const label = fallbackLabels[index];
              const badges = fallbackBadgeSets[index];

              gsap.set(label, { opacity: opacity.hidden, y: labelY });
              gsap.set(badges, { opacity: opacity.hidden, y: badgeY });

              const tl = gsap.timeline({
                defaults: { ease: ease.expoOut },
                scrollTrigger: {
                  trigger: group,
                  start: "top 85%",
                  toggleActions: "play none none none",
                },
              });

              tl.to(label, { opacity: opacity.visible, y: 0, duration: duration.fast }).to(
                badges,
                { opacity: opacity.visible, y: 0, duration: duration.base, stagger: stagger.children },
                "-=0.15",
              );
            });
          }
        },
      );
    }, section);

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="skills" className="scroll-mt-16">
      {/* Desktop: pinned orbital scene. Hidden below lg, and forced hidden
          under prefers-reduced-motion regardless of width (see globals.css). */}
      <div
        ref={stageRef}
        className="skills-stage relative hidden h-screen w-full overflow-hidden lg:block"
      >
        <Container className="relative flex h-full items-center justify-center">
          <div className="skills-focal absolute left-1/2 top-1/2 z-20 max-w-xs text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Skills</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground xl:text-4xl">
              Tech I build with
            </h2>
            <p className="mt-3 text-sm text-muted">
              A working stack spanning backend services, relational data, and modern frontend
              tooling.
            </p>
          </div>

          {skillCategories.map((category) => (
            <div
              key={category.id}
              className="skill-orbit-node absolute left-1/2 top-1/2 w-60 rounded-2xl border border-border bg-surface p-5"
            >
              <h3 className="skill-label font-display text-base font-medium text-foreground">
                {category.label}
              </h3>
              <div className="skill-items mt-3 flex flex-wrap gap-1.5">
                {category.items.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </div>

      {/* Mobile: original editorial grid. Also the reduced-motion fallback
          at every width (see globals.css). */}
      <Container className="skills-fallback py-24 md:py-32 lg:hidden">
        <SectionHeading
          eyebrow="Skills"
          title="Tech I build with"
          description="A working stack spanning backend services, relational data, and modern frontend tooling."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {skillCategories.map((category) => (
            <div
              key={category.id}
              className="skill-group rounded-2xl border border-border bg-surface p-6"
            >
              <h3 className="skill-label font-display text-lg font-medium text-foreground">
                {category.label}
              </h3>
              <div className="skill-items mt-4 flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
