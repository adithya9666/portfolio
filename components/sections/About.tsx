"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { experience } from "@/content/experience";
import { personalPhotos } from "@/content/assets";
import { Container } from "@/components/ui/Container";
import { gsap } from "@/lib/motion/gsap";
import { imageReveal, parallaxY } from "@/lib/motion/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { duration, ease, opacity, reveal, desktopBreakpoint } from "@/lib/motion/tokens";

const btech = experience.find((entry) => entry.id === "btech");

// Rewritten portfolio copy (not the resume summary verbatim) covering only
// verified facts: B.Tech IT at St. Martin's, the Java/Spring/React/TS/Next
// stack, hands-on project work (full-stack, freelance, robotics/IoT), and
// 230+ LeetCode problems.
const copy = [
  "I'm a B.Tech Information Technology student at St. Martin's Engineering College, working across Java, Spring Boot, React, TypeScript, and Next.js.",
  "I like building practical software and learning through hands-on projects — full-stack applications, a freelance web project for a real client, and some robotics and IoT work on the side.",
  "That same hands-on habit carries into how I practice fundamentals: 230+ problems solved on LeetCode.",
];

export function About() {
  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const imageBlockRef = useRef<HTMLDivElement>(null);
  const imageCardRef = useRef<HTMLDivElement>(null);
  const cornerTLRef = useRef<HTMLDivElement>(null);
  const cornerBRRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const copyParagraphs = section.querySelectorAll(".about-copy > div > p");
    const detailGroups = section.querySelectorAll(".about-detail > div");
    const corners = [cornerTLRef.current, cornerBRRef.current].filter(Boolean);

    // Owned by this effect run only — reverted exactly once, from this
    // effect's own cleanup below (never from inside one of its own
    // condition callbacks — see the note in Hero.tsx for why that recurses).
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const allTargets = [
        eyebrowRef.current,
        headingRef.current,
        ...copyParagraphs,
        ...detailGroups,
        imageCardRef.current,
        ...corners,
      ].filter(Boolean);

      if (reducedMotion) {
        // Everything renders in its final, static state — no clip-path
        // uncovering, no stagger, no parallax, image fully visible.
        gsap.set(allTargets, { clearProps: "all" });
        return;
      }

      mm.add(
        {
          isDesktop: `(min-width: ${desktopBreakpoint}px)`,
          isMobile: `(max-width: ${desktopBreakpoint - 1}px)`,
        },
        (context) => {
          const { isDesktop } = context.conditions as { isDesktop: boolean };
          const y = isDesktop ? reveal.distance : reveal.distanceSmall;

          // --- Text entrance: heading, then copy (staggered), then facts last ---
          gsap.set(eyebrowRef.current, { opacity: opacity.hidden, y: reveal.distanceSmall });
          gsap.set(headingRef.current, { opacity: opacity.hidden, y });
          gsap.set(copyParagraphs, { opacity: opacity.hidden, y });
          gsap.set(detailGroups, { opacity: opacity.hidden, y: reveal.distanceSmall });

          const tl = gsap.timeline({
            defaults: { ease: ease.expoOut },
            scrollTrigger: {
              trigger: section.querySelector(".about-copy"),
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });

          tl.to(eyebrowRef.current, { opacity: opacity.visible, y: 0, duration: duration.fast })
            .to(
              headingRef.current,
              { opacity: opacity.visible, y: 0, duration: duration.base },
              "-=0.2",
            )
            .to(
              copyParagraphs,
              { opacity: opacity.visible, y: 0, duration: duration.base, stagger: 0.12 },
              "-=0.25",
            )
            .to(
              detailGroups,
              { opacity: opacity.visible, y: 0, duration: duration.base, stagger: 0.1 },
              "-=0.15",
            );

          // --- Image: uncovered independently, top-to-bottom, no scale ---
          // (a simple single-axis clip-path — cheap, so it stays on mobile too).
          gsap.set(corners, { opacity: opacity.hidden });
          imageReveal(imageCardRef.current, {
            direction: "top",
            scaleFrom: false,
            scrollTrigger: { trigger: imageBlockRef.current },
          });
          gsap.to(corners, {
            opacity: opacity.visible,
            duration: duration.base,
            delay: duration.slow * 0.5,
            scrollTrigger: {
              trigger: imageBlockRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          });

          // --- Desktop-only subtle parallax: image drifts slightly independent
          // of the surrounding text as the section scrolls past. ---
          if (isDesktop) {
            parallaxY(imageBlockRef.current, 6);

            // EXPERIMENT (Hero -> About cinematic transition, pass 1): the
            // whole section rises/settles into place as it enters, scrubbed
            // to the same scroll region where Hero (previous sibling) is
            // compressing out. This targets the outer `section` element
            // only — never the children the entrance timeline above
            // already owns (eyebrow/heading/copy/details/image) — so the
            // two animations never fight over the same property.
            gsap.set(section, { opacity: opacity.dim, y: 40, scale: 0.96 });
            gsap.to(section, {
              opacity: opacity.visible,
              y: 0,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top 20%",
                scrub: true,
              },
            });
          }
          // No cleanup returned here: gsap.matchMedia() already auto-kills
          // every tween/ScrollTrigger created synchronously in this callback
          // when the query stops matching, or when mm.revert() below runs.
        },
      );
    }, section);

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="about-section scroll-mt-16 py-24 md:py-32"
    >
      <Container>
        <div className="grid gap-14 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-start md:gap-16">
          <div
            ref={imageBlockRef}
            className="about-image relative mx-auto w-full max-w-sm md:mx-0 md:mt-10"
          >
            <div
              ref={cornerTLRef}
              aria-hidden
              className="pointer-events-none absolute -left-3 -top-3 h-8 w-8 border-l border-t border-accent/50"
            />
            <div
              ref={imageCardRef}
              className="relative w-full overflow-hidden border border-border"
              style={{
                aspectRatio: `${personalPhotos.casual.width} / ${personalPhotos.casual.height}`,
              }}
            >
              <Image
                src={personalPhotos.casual.src}
                alt={personalPhotos.casual.description}
                fill
                sizes="(min-width: 768px) 420px, 90vw"
                className="object-cover"
              />
            </div>
            <div
              ref={cornerBRRef}
              aria-hidden
              className="pointer-events-none absolute -bottom-3 -right-3 h-8 w-8 border-b border-r border-accent/50"
            />
          </div>

          <div className="about-copy">
            <p
              ref={eyebrowRef}
              className="font-mono text-xs uppercase tracking-[0.2em] text-accent"
            >
              About
            </p>
            <h2
              ref={headingRef}
              className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl"
            >
              Building with curiosity. Growing through practice.
            </h2>
            <div className="mt-8 max-w-xl space-y-5 text-base text-muted md:text-lg">
              {copy.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {btech ? (
              <dl className="about-detail mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6">
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                    Program
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {btech.title.split(" — ")[0]}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                    Timeline
                  </dt>
                  <dd className="mt-1 text-foreground">{btech.range}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                    Institution
                  </dt>
                  <dd className="mt-1 text-foreground">{btech.org}</dd>
                </div>
              </dl>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
