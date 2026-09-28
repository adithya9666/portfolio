"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/motion/gsap";
import { site } from "@/content/site";
import { personalPhotos } from "@/content/assets";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ease, duration, stagger, desktopBreakpoint } from "@/lib/motion/tokens";

const nameWords = site.name.split(" ");

export function Hero() {
  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const wordInnerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const photoWrapRef = useRef<HTMLDivElement>(null);
  const photoParallaxRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // ScrollTrigger is registered once, centrally, in lib/motion/gsap.ts.

    // Owned by this effect run only — reverted exactly once, from this
    // effect's own cleanup below. Never revert `mm` from inside one of its
    // own condition callbacks (that reenters the revert it's already
    // running and recurses until the call stack overflows).
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const targets = [
        glowRef.current,
        eyebrowRef.current,
        taglineRef.current,
        ctaRef.current,
        photoWrapRef.current,
        scrollCueRef.current,
        ...wordInnerRefs.current,
      ].filter(Boolean);

      if (reducedMotion) {
        // No hidden→visible animation at all: everything renders in its
        // final, static state (no clip-path wipe, no stagger, no transform).
        gsap.set(targets, { clearProps: "all" });
        return;
      }

      gsap.set(glowRef.current, { opacity: 0 });
      gsap.set(eyebrowRef.current, { opacity: 0, y: 12 });
      gsap.set(wordInnerRefs.current, { yPercent: 110 });
      gsap.set(taglineRef.current, { opacity: 0, y: 16 });
      gsap.set(ctaRef.current, { opacity: 0, y: 12, scale: 0.97 });
      gsap.set(photoWrapRef.current, {
        clipPath: "inset(0 100% 0 0)",
        scale: 1.05,
      });
      gsap.set(scrollCueRef.current, { opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: ease.expoOut } });
      tl.to(glowRef.current, { opacity: 1, duration: duration.base })
        .to(
          eyebrowRef.current,
          { opacity: 1, y: 0, duration: duration.fast },
          "-=0.3",
        )
        .to(
          wordInnerRefs.current,
          { yPercent: 0, duration: duration.slow, stagger: stagger.word },
          "-=0.1",
        )
        .to(
          photoWrapRef.current,
          { clipPath: "inset(0 0% 0 0)", scale: 1, duration: duration.slow },
          "<",
        )
        .to(
          taglineRef.current,
          { opacity: 1, y: 0, duration: duration.base },
          "-=0.6",
        )
        .to(
          ctaRef.current,
          { opacity: 1, y: 0, scale: 1, duration: duration.fast },
          "-=0.2",
        )
        .to(
          scrollCueRef.current,
          { opacity: 1, duration: duration.fast },
          "-=0.1",
        );

      // Scroll-scrubbed parallax + fade — desktop/tablet only, matching the
      // responsive strategy (no scroll-jacking or parallax on touch).
      //
      // EXPERIMENT (Hero -> About cinematic transition, pass 1): the text
      // and photo layers now travel at different rates AND compress in
      // scale as Hero scrolls out, instead of just drifting/fading — the
      // two layers are meant to read as different depths receding together.
      // `photoParallaxRef` (a plain wrapper with no other tween on it) owns
      // this depth transform so it never fights the entrance timeline's own
      // clipPath/scale tween on `photoWrapRef` — same reason `textColRef`
      // (not any of its animated children) is what gets scaled/faded here.
      mm.add(`(min-width: ${desktopBreakpoint}px)`, () => {
        const exitTrigger = { trigger: section, start: "top top", end: "bottom top", scrub: true };

        gsap.to(textColRef.current, {
          yPercent: -14,
          scale: 0.95,
          opacity: 0.15,
          ease: "none",
          scrollTrigger: exitTrigger,
        });
        gsap.to(photoParallaxRef.current, {
          yPercent: -10,
          scale: 0.88,
          ease: "none",
          scrollTrigger: exitTrigger,
        });
        gsap.to(scrollCueRef.current, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=200",
            scrub: true,
          },
        });
        // No cleanup returned here: gsap.matchMedia() already auto-kills
        // every tween/ScrollTrigger created synchronously in this callback
        // when the query stops matching, or when mm.revert() below runs.
      });
    }, section);

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden"
    >
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_25%,var(--accent-soft),transparent_45%),radial-gradient(circle_at_85%_60%,var(--accent-soft),transparent_40%)]"
      />
      <Container className="py-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1.4fr_1fr]">
          <div
            ref={textColRef}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <p
              ref={eyebrowRef}
              className="font-mono text-xs uppercase tracking-[0.2em] text-accent"
            >
              {site.role}
            </p>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
              {nameWords.map((word, i) => (
                <span key={word} className="inline-block overflow-hidden">
                  <span
                    ref={(el) => {
                      wordInnerRefs.current[i] = el;
                    }}
                    className="inline-block"
                  >
                    {word}
                    {i < nameWords.length - 1 ? " " : ""}
                  </span>
                </span>
              ))}
            </h1>
            <p ref={taglineRef} className="mt-6 max-w-xl text-lg text-muted md:text-xl">
              {site.tagline}
            </p>
            <div ref={ctaRef} className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Button href="/#work">View Work</Button>
              <Button href="/#contact" variant="secondary">
                Get in touch
              </Button>
            </div>
          </div>

          <div
            ref={photoParallaxRef}
            className="relative mx-auto aspect-[853/886] w-full max-w-xs lg:ml-auto lg:mr-[-2rem] lg:mt-[-3rem] lg:max-w-lg"
          >
            <div
              ref={photoWrapRef}
              className="relative h-full w-full"
              style={{
                maskImage: "linear-gradient(200deg, black 55%, transparent 92%)",
                WebkitMaskImage:
                  "linear-gradient(200deg, black 55%, transparent 92%)",
              }}
            >
              <Image
                src={personalPhotos.formal.src}
                alt={site.name}
                fill
                priority
                sizes="(min-width: 1024px) 512px, 320px"
                className="object-cover object-top grayscale-[85%] contrast-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 mix-blend-multiply"
                style={{
                  background:
                    "linear-gradient(160deg, var(--accent) 0%, transparent 60%)",
                  opacity: 0.22,
                }}
              />
            </div>
          </div>
        </div>

        <div
          ref={scrollCueRef}
          aria-hidden
          className="pointer-events-none absolute bottom-10 left-1/2 hidden -translate-x-1/2 lg:block"
        >
          <div className="h-9 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
        </div>
      </Container>
    </section>
  );
}
