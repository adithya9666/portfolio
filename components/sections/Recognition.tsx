"use client";

import { useLayoutEffect, useRef } from "react";
import { certifications } from "@/content/certifications";
import { achievements } from "@/content/achievements";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gsap } from "@/lib/motion/gsap";
import { revealOnScroll, staggerReveal } from "@/lib/motion/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { duration, reveal } from "@/lib/motion/tokens";

// The 230+ LeetCode achievement already has its own dedicated section —
// excluded here so it isn't presented twice.
const shownAchievements = achievements.filter((a) => a.id !== "leetcode-230");

// .recognition-cert-item / .recognition-achievement-item are existing stable
// hooks; .recognition-cert-number / .recognition-cert-text are added here
// (no equivalent existed before) so the numeral and its text can reveal at
// different speeds. The hairline dividers are left static — a clean
// progressive reveal would mean converting a CSS border into a separate
// scaled element, which is a structural change this pass avoids; the
// optional desktop-only scroll-linked depth layer is skipped too, matching
// the brief's "this section should remain calm."
export function Recognition() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const headingBlock = section.querySelector(".max-w-2xl");
    const certsList = section.querySelector(".recognition-certs");
    const achievementsList = section.querySelector(".recognition-achievements");
    const certNumbers = Array.from(section.querySelectorAll(".recognition-cert-number"));
    const certTexts = Array.from(section.querySelectorAll(".recognition-cert-text"));
    const achievementItems = Array.from(
      section.querySelectorAll(".recognition-achievement-item"),
    );

    const ctx = gsap.context(() => {
      const allTargets = [
        headingBlock,
        ...certNumbers,
        ...certTexts,
        ...achievementItems,
      ].filter(Boolean);

      if (reducedMotion) {
        gsap.set(allTargets, { clearProps: "all" });
        return;
      }

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const certY = isDesktop ? reveal.distanceSmall : reveal.distanceSmall * 0.75;
      const achievementX = isDesktop
        ? -reveal.distanceSmall * 0.85
        : -reveal.distanceSmall * 0.6;

      // --- Heading: plays once, restrained. ---
      if (headingBlock) revealOnScroll(headingBlock, { y: reveal.distance });

      // --- Certifications: text reveals first; the index numerals get a
      // subtler, slower, slightly delayed treatment — never dramatic. ---
      if (certTexts.length) {
        staggerReveal(certTexts, {
          y: certY,
          scrollTrigger: { trigger: certsList ?? undefined, start: "top 85%" },
        });
      }
      if (certNumbers.length) {
        staggerReveal(certNumbers, {
          y: certY * 0.5,
          duration: duration.slow,
          delay: 0.15,
          scrollTrigger: { trigger: certsList ?? undefined, start: "top 85%" },
        });
      }

      // --- Achievements: a distinct visual language from Certifications —
      // subtle horizontal movement instead of vertical, one consistent
      // direction (no alternating), no separate numeral treatment. ---
      if (achievementItems.length) {
        staggerReveal(achievementItems, {
          x: achievementX,
          y: 0,
          scrollTrigger: { trigger: achievementsList ?? undefined, start: "top 85%" },
        });
      }
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="recognition" className="scroll-mt-16 py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Recognition"
          title="Beyond the build"
          description="Credentials and moments outside day-to-day project work."
        />

        <div className="mt-16 grid gap-16 md:mt-24 md:grid-cols-2 md:gap-16">
          <div className="recognition-certs">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Certifications
            </p>
            <ol className="mt-6 border-t border-border">
              {certifications.map((cert, index) => (
                <li
                  key={cert.id}
                  className="recognition-cert-item flex gap-6 border-b border-border py-7 first:pt-0"
                >
                  <span className="recognition-cert-number font-display text-3xl font-semibold leading-none text-muted/30 md:text-4xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="recognition-cert-text">
                    <h3 className="font-display text-lg font-medium text-foreground md:text-xl">
                      {cert.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-accent">{cert.issuer}</p>
                    {cert.year ? (
                      <p className="mt-1.5 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                        {cert.year}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="recognition-achievements">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Achievements
            </p>
            <ul className="mt-6 space-y-10">
              {shownAchievements.map((achievement) => (
                <li
                  key={achievement.id}
                  className="recognition-achievement-item border-l-2 border-accent/40 pl-6"
                >
                  <p className="text-lg leading-relaxed text-foreground md:text-xl">
                    {achievement.description}
                  </p>
                  {achievement.year ? (
                    <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                      {achievement.year}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
