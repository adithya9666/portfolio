"use client";

import { useLayoutEffect, useRef } from "react";
import { experience } from "@/content/experience";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gsap } from "@/lib/motion/gsap";
import { revealOnScroll } from "@/lib/motion/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ease, duration, reveal, opacity, scrub, desktopBreakpoint } from "@/lib/motion/tokens";

const kindLabel: Record<string, string> = {
  education: "Education",
  experience: "Experience",
};

// A second, established accent (already used for project covers elsewhere)
// distinguishes Experience from Education without introducing a new color.
const kindDot: Record<string, string> = {
  education: "var(--accent)",
  experience: "#22d3ee",
};

// .journey-spine / .journey-node / .journey-year / .journey-card are the
// stable hooks this animation targets — same markup, same layout, same
// responsive behavior as before.
export function Journey() {
  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const listWrapRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const listWrap = listWrapRef.current;
    const spine = spineRef.current;
    if (!section || !listWrap || !spine) return;

    const headingBlock = section.querySelector(".max-w-2xl");
    const items = Array.from(section.querySelectorAll<HTMLLIElement>(".journey-item"));

    // Owned by this effect run only — reverted exactly once, from this
    // effect's own cleanup below (never from inside one of its own
    // condition callbacks — see the note in Hero.tsx for why that recurses).
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const nodes = items.map((item) => item.querySelector(".journey-node"));
      const cards = items.map((item) => item.querySelector(".journey-card"));
      const years = items.map((item) => item.querySelector(".journey-year"));

      const allTargets = [
        headingBlock,
        spine,
        ...nodes,
        ...cards,
        ...years.filter(Boolean),
      ].filter(Boolean);

      if (reducedMotion) {
        // Final state only — no spine construction, no node activation,
        // no card movement, no decorative transforms.
        gsap.set(allTargets, { clearProps: "all" });
        return;
      }

      // --- Heading: plays once, restrained — matches About's language. ---
      if (headingBlock) revealOnScroll(headingBlock, { y: reveal.distance });

      // --- Spine: a continuous line "constructed" via scroll-linked scaleY,
      // not by repeatedly animating height/pixels. Final appearance (full
      // height, same gradient) is unchanged — only the reveal is animated. ---
      gsap.set(spine, { scaleY: 0, transformOrigin: "top" });
      gsap.to(spine, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: listWrap,
          start: "top 70%",
          end: "bottom 60%",
          scrub: scrub.tight,
        },
      });

      mm.add(
        {
          isDesktop: `(min-width: ${desktopBreakpoint}px)`,
          isMobile: `(max-width: ${desktopBreakpoint - 1}px)`,
        },
        (context) => {
          const { isDesktop } = context.conditions as { isDesktop: boolean };

          items.forEach((item, index) => {
            const isRight = index % 2 === 1;
            const node = nodes[index];
            const card = cards[index];
            const year = years[index];
            const x = isDesktop ? (isRight ? reveal.distanceSmall : -reveal.distanceSmall) : 0;

            gsap.set(node, { opacity: 0.4, scale: 0.6 });
            gsap.set(card, { opacity: opacity.hidden, x, y: reveal.distanceSmall });
            if (year) gsap.set(year, { opacity: opacity.hidden, scale: 0.92 });

            const tl = gsap.timeline({
              defaults: { ease: ease.expoOut },
              scrollTrigger: {
                trigger: item,
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
            });

            // Node "activates" as its milestone is reached; card settles
            // into place from its own side, at the same moment.
            tl.to(node, { opacity: 1, scale: 1, duration: duration.base }, 0).to(
              card,
              { opacity: opacity.visible, x: 0, y: 0, duration: duration.base },
              0,
            );

            // Year gets a subtler, slightly independent treatment so it
            // never outweighs the card content around it.
            if (year) {
              tl.to(year, { opacity: opacity.visible, scale: 1, duration: duration.slow, ease: ease.soft }, 0.08);
            }
          });
        },
      );
    }, section);

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="journey" className="scroll-mt-16 py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Journey"
          title="Education & experience"
          description="One timeline, from secondary school through my current full-stack work."
        />

        <div ref={listWrapRef} className="relative mt-16 md:mt-24">
          <div
            ref={spineRef}
            aria-hidden
            className="journey-spine absolute left-4 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-accent/0 via-accent/40 to-accent/0 md:left-1/2"
          />

          <ol className="space-y-14 md:space-y-20">
            {experience.map((entry, index) => {
              const isRight = index % 2 === 1;

              return (
                <li
                  key={entry.id}
                  className="journey-item relative pl-12 md:flex md:items-center md:gap-10 md:pl-0"
                >
                  <span
                    aria-hidden
                    className="journey-node absolute left-4 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-background md:left-1/2 md:top-1/2 md:-translate-y-1/2"
                    style={{ background: kindDot[entry.kind] }}
                  />

                  <div
                    className={`journey-card md:flex md:w-1/2 ${
                      isRight
                        ? "md:order-2 md:justify-start md:pl-12 md:text-left"
                        : "md:order-1 md:justify-end md:pr-12 md:text-right"
                    }`}
                  >
                    <div className="max-w-md">
                      {entry.range ? (
                        <p className="journey-year font-display text-3xl font-semibold leading-none text-muted/40 md:text-4xl">
                          {entry.range}
                        </p>
                      ) : null}
                      <div
                        className={`mt-3 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 ${
                          isRight ? "" : "md:flex-row-reverse"
                        }`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: kindDot[entry.kind] }}
                        />
                        <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted">
                          {kindLabel[entry.kind]}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-semibold text-foreground md:text-2xl">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-accent">{entry.org}</p>
                      <p className="mt-2 text-muted">{entry.description}</p>
                    </div>
                  </div>

                  <div
                    aria-hidden
                    className={`hidden md:block md:w-1/2 ${isRight ? "md:order-1" : "md:order-2"}`}
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
