"use client";

import { useLayoutEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { gsap } from "@/lib/motion/gsap";
import { parallaxY } from "@/lib/motion/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { duration, ease, opacity, reveal, scale, desktopBreakpoint } from "@/lib/motion/tokens";

// Static content unchanged — "230+" is never touched, only revealed.
export function ProblemSolving() {
  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const numeralRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const supportRef = useRef<HTMLParagraphElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Owned by this effect run only — reverted exactly once, from this
    // effect's own cleanup below (never from inside one of its own
    // condition callbacks — see the note in Hero.tsx for why that recurses).
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const allTargets = [
        eyebrowRef.current,
        numeralRef.current,
        labelRef.current,
        supportRef.current,
        svgRef.current,
      ].filter(Boolean);

      if (reducedMotion) {
        // "230+" and everything around it simply visible — no scale, no
        // parallax, no decorative transforms.
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
          const numeralY = isDesktop ? reveal.distance : reveal.distanceSmall;
          const textY = isDesktop ? reveal.distanceSmall : reveal.distanceSmall * 0.75;

          gsap.set(eyebrowRef.current, { opacity: opacity.hidden, y: reveal.distanceSmall });
          gsap.set(numeralRef.current, { opacity: opacity.hidden, y: numeralY, scale: scale.from });
          gsap.set(labelRef.current, { opacity: opacity.hidden, y: textY });
          gsap.set(supportRef.current, { opacity: opacity.hidden, y: textY * 0.75 });

          // --- One powerful number, emerging into focus. Plays once. ---
          const tl = gsap.timeline({
            defaults: { ease: ease.expoOut },
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          });

          tl.to(eyebrowRef.current, { opacity: opacity.visible, y: 0, duration: duration.fast })
            .to(
              numeralRef.current,
              { opacity: opacity.visible, y: 0, scale: scale.to, duration: duration.slow },
              "-=0.1",
            )
            .to(
              labelRef.current,
              { opacity: opacity.visible, y: 0, duration: duration.base },
              "-=0.5",
            )
            .to(
              supportRef.current,
              { opacity: opacity.visible, y: 0, duration: duration.base },
              "-=0.25",
            );

          if (isDesktop) {
            // Extremely small, anchored drift — not floating, just a hint
            // of depth. Both gated to desktop only.
            parallaxY(numeralRef.current, 3, section);
            if (svgRef.current) parallaxY(svgRef.current, 4, section);
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
    <section
      ref={sectionRef}
      id="problem-solving"
      className="scroll-mt-16 relative overflow-hidden border-y border-border bg-surface py-28 md:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,var(--accent-soft),transparent_50%)]"
      />

      <svg
        ref={svgRef}
        aria-hidden
        viewBox="0 0 400 320"
        className="pointer-events-none absolute -right-16 top-1/2 hidden w-[34rem] -translate-y-1/2 opacity-[0.14] lg:block"
      >
        <g stroke="var(--accent)" strokeWidth="1.25" fill="none">
          <line x1="200" y1="40" x2="100" y2="140" />
          <line x1="200" y1="40" x2="300" y2="140" />
          <line x1="100" y1="140" x2="50" y2="240" />
          <line x1="100" y1="140" x2="150" y2="240" />
          <line x1="300" y1="140" x2="250" y2="240" />
          <line x1="300" y1="140" x2="350" y2="240" />
        </g>
        <g stroke="var(--accent)" strokeWidth="1.25" fill="var(--surface)">
          <circle cx="200" cy="40" r="7" />
          <circle cx="100" cy="140" r="7" />
          <circle cx="300" cy="140" r="7" />
          <circle cx="50" cy="240" r="6" />
          <circle cx="150" cy="240" r="6" />
          <circle cx="250" cy="240" r="6" />
          <circle cx="350" cy="240" r="6" />
        </g>
      </svg>

      <Container className="relative">
        <p
          ref={eyebrowRef}
          className="font-mono text-xs uppercase tracking-[0.2em] text-accent"
        >
          Problem Solving
        </p>

        <div className="mt-8 flex flex-col items-start gap-6 md:flex-row md:items-end md:gap-12">
          <span
            ref={numeralRef}
            className="font-display text-[5.5rem] font-semibold leading-none tracking-tight text-foreground tabular-nums sm:text-[7.5rem] md:text-[10rem] lg:text-[12.5rem]"
          >
            230+
          </span>

          <div className="max-w-md pb-2 md:pb-6">
            <p
              ref={labelRef}
              className="font-display text-2xl font-medium text-foreground md:text-3xl"
            >
              Problems solved on LeetCode
            </p>
            <p ref={supportRef} className="mt-4 text-muted">
              Strengthening algorithmic problem-solving across data
              structures and algorithms.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
