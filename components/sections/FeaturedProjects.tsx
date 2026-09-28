"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { featuredProjects } from "@/content/projects";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { gsap } from "@/lib/motion/gsap";
import { revealOnScroll, imageReveal } from "@/lib/motion/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { duration, ease, opacity, reveal, scrub, desktopBreakpoint } from "@/lib/motion/tokens";

// EXPERIMENT (Featured Projects cinematic scene, pass 1): two completely
// separate render trees, exactly like Nav/MobileMenu already do elsewhere in
// this codebase — a `.featured-projects-stage` (desktop, pinned scroll-driven
// scene, `.project-scene` panels) and a `.featured-projects-fallback` (the
// original plain vertical card list, `.project-item` cards). Both always
// render; which one is visible is resolved entirely by CSS (`lg:` utilities,
// plus the `prefers-reduced-motion` override in globals.css), so there's no
// hydration mismatch and no JS-driven layout swap. GSAP setup mirrors that
// split: `mm.add({isDesktop, isMobile})` branches internally, building the
// pinned scene only for isDesktop and the card-by-card reveal only otherwise
// — the same dual-condition matchMedia pattern About.tsx already uses.
export function FeaturedProjects() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const headingBlock = section.querySelector(".max-w-2xl");
    const stage = stageRef.current;
    const fallbackItems = Array.from(
      section.querySelectorAll<HTMLAnchorElement>(".project-item"),
    );

    // Owned by this effect run only — reverted exactly once, from this
    // effect's own cleanup below (never from inside one of its own
    // condition callbacks — see the note in Hero.tsx for why that recurses).
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const fallbackImages = fallbackItems.map((item) => item.querySelector(".project-image"));
      const fallbackTitles = fallbackItems.map((item) => item.querySelector(".project-title"));
      const fallbackDescriptions = fallbackItems.map((item) =>
        item.querySelector(".project-description"),
      );
      const fallbackTechs = fallbackItems.map((item) => item.querySelector(".project-tech"));

      const scenes = stage ? Array.from(stage.querySelectorAll<HTMLElement>(".project-scene")) : [];
      const sceneImages = scenes.map((s) => s.querySelector(".scene-image"));
      const sceneTextEls = scenes.map((s) =>
        [
          s.querySelector(".scene-eyebrow"),
          s.querySelector(".scene-title"),
          s.querySelector(".scene-description"),
          s.querySelector(".scene-tech"),
          s.querySelector(".scene-cta"),
        ].filter(Boolean),
      );

      const allTargets = [
        headingBlock,
        ...fallbackItems,
        ...fallbackImages,
        ...fallbackTitles,
        ...fallbackDescriptions,
        ...fallbackTechs,
        ...scenes,
        ...sceneImages,
        ...sceneTextEls.flat(),
      ].filter(Boolean);

      if (reducedMotion) {
        // Every project's content and image simply visible in the fallback
        // list (the stage is display:none via globals.css at this point) —
        // no clip-path, no pin, no stagger needed for either tree.
        gsap.set(allTargets, { clearProps: "all" });
        return;
      }

      // --- Heading: plays once, restrained — same language as prior sections. ---
      if (headingBlock) revealOnScroll(headingBlock, { y: reveal.distance });

      mm.add(
        {
          isDesktop: `(min-width: ${desktopBreakpoint}px)`,
          isMobile: `(max-width: ${desktopBreakpoint - 1}px)`,
        },
        (context) => {
          const { isDesktop } = context.conditions as { isDesktop: boolean };

          if (isDesktop && stage && scenes.length > 0) {
            const dots = Array.from(stage.querySelectorAll<HTMLElement>(".scene-dot"));
            const indexLabel = stage.querySelector<HTMLElement>(".scene-index");

            // --- Initial state: scene 0 fully presented, the rest waiting
            // just out of frame (clipped away below, slightly oversized —
            // ready to wipe up and settle in). ---
            scenes.forEach((scene, i) => {
              const image = sceneImages[i];
              const textEls = sceneTextEls[i];
              if (i === 0) {
                gsap.set(scene, { autoAlpha: 1 });
                gsap.set(image, { clipPath: "inset(0% 0% 0% 0%)", scale: 1 });
                gsap.set(textEls, { autoAlpha: 1, y: 0 });
              } else {
                gsap.set(scene, { autoAlpha: 0 });
                gsap.set(image, { clipPath: "inset(0% 0% 100% 0%)", scale: 1.12 });
                gsap.set(textEls, { autoAlpha: 0, y: 28 });
              }
            });

            if (indexLabel) indexLabel.textContent = "01";
            gsap.set(dots[0], { autoAlpha: 1, scale: 1 });
            if (dots.length > 1) gsap.set(dots.slice(1), { autoAlpha: 0.35, scale: 0.8 });

            const HOLD = 1.4;
            const TRANSITION = 0.8;

            // Filled in once the timeline below is fully built (its exact
            // label positions depend on how many `.to()`/`.fromTo()` calls
            // preceded each `addLabel`) — the onUpdate closure reads this by
            // reference, so it sees the real values despite being defined
            // first. Equal quarters (progress * scenes.length) would be
            // wrong here since HOLD and TRANSITION are different lengths.
            let switchProgress: number[] = [];

            const masterTl = gsap.timeline({
              scrollTrigger: {
                trigger: stage,
                start: "top top",
                end: () => `+=${scenes.length * window.innerHeight * 1.3}`,
                scrub: scrub.soft,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  let idx = 0;
                  for (let i = 1; i < switchProgress.length; i++) {
                    if (self.progress >= switchProgress[i]) idx = i;
                  }
                  if (indexLabel) indexLabel.textContent = String(idx + 1).padStart(2, "0");
                  dots.forEach((dot, i) => {
                    gsap.set(dot, {
                      autoAlpha: i === idx ? 1 : 0.35,
                      scale: i === idx ? 1 : 0.8,
                    });
                  });
                },
              },
            });

            // Initial hold on scene 0 — reading room before the first transition.
            masterTl.to({}, { duration: HOLD });

            scenes.forEach((scene, i) => {
              if (i === 0) return;
              const prevScene = scenes[i - 1];
              const prevImage = sceneImages[i - 1];
              const prevText = sceneTextEls[i - 1];

              const image = sceneImages[i];
              const [eyebrow, title, description, tech, cta] = [
                scene.querySelector(".scene-eyebrow"),
                scene.querySelector(".scene-title"),
                scene.querySelector(".scene-description"),
                scene.querySelector(".scene-tech"),
                scene.querySelector(".scene-cta"),
              ];

              const label = `scene${i}`;
              masterTl.addLabel(label);

              // Outgoing: image wipes away to the right and shrinks back;
              // its text slides up and out slightly ahead of the image.
              masterTl
                .to(
                  prevImage,
                  { clipPath: "inset(0% 0% 0% 100%)", scale: 0.92, ease: ease.smooth, duration: TRANSITION },
                  label,
                )
                .to(
                  prevText,
                  { autoAlpha: 0, y: -24, ease: ease.smooth, duration: TRANSITION * 0.6 },
                  label,
                )
                .set(prevScene, { autoAlpha: 0 }, `${label}+=${TRANSITION * 0.9}`)
                // Incoming: image wipes up from below and settles; typography
                // and metadata follow in sequence, a beat behind the image.
                .set(scene, { autoAlpha: 1 }, label)
                .fromTo(
                  image,
                  { clipPath: "inset(0% 0% 100% 0%)", scale: 1.12 },
                  { clipPath: "inset(0% 0% 0% 0%)", scale: 1, ease: ease.smooth, duration: TRANSITION },
                  label,
                )
                .fromTo(
                  eyebrow,
                  { autoAlpha: 0, y: 24 },
                  { autoAlpha: 1, y: 0, duration: TRANSITION * 0.5 },
                  `${label}+=${TRANSITION * 0.35}`,
                )
                .fromTo(
                  title,
                  { autoAlpha: 0, y: 32 },
                  { autoAlpha: 1, y: 0, duration: TRANSITION * 0.6 },
                  `${label}+=${TRANSITION * 0.45}`,
                )
                .fromTo(
                  [description, tech, cta],
                  { autoAlpha: 0, y: 20 },
                  { autoAlpha: 1, y: 0, duration: TRANSITION * 0.5, stagger: 0.08 },
                  `${label}+=${TRANSITION * 0.6}`,
                );

              // Hold on this scene before the next transition (or, on the
              // last scene, before the section releases from the pin).
              masterTl.to({}, { duration: HOLD });
            });

            // Switch the progress indicator to scene `i` right as its own
            // transition begins (its addLabel position), not at a naive
            // equal-quarters split of total progress.
            const totalDuration = masterTl.duration();
            switchProgress = scenes.map((_, i) =>
              i === 0 ? 0 : masterTl.labels[`scene${i}`] / totalDuration,
            );
          } else if (!isDesktop) {
            // --- Mobile: original card-by-card reveal, unchanged. ---
            const textY = reveal.distanceSmall * 0.75;

            fallbackItems.forEach((item, index) => {
              const image = fallbackImages[index];
              const title = fallbackTitles[index];
              const description = fallbackDescriptions[index];
              const tech = fallbackTechs[index];

              gsap.set(title, { opacity: opacity.hidden, y: textY });
              gsap.set(description, { opacity: opacity.hidden, y: textY });
              gsap.set(tech, { opacity: opacity.hidden, y: textY });

              const tl = gsap.timeline({
                defaults: { ease: ease.expoOut },
                scrollTrigger: {
                  trigger: item,
                  start: "top 80%",
                  toggleActions: "play none none none",
                },
              });

              tl.to(title, { opacity: opacity.visible, y: 0, duration: duration.fast })
                .to(
                  description,
                  { opacity: opacity.visible, y: 0, duration: duration.base },
                  "-=0.2",
                )
                .to(tech, { opacity: opacity.visible, y: 0, duration: duration.base }, "-=0.25");

              if (image) {
                tl.add(imageReveal(image, { scrollTrigger: false }), "-=0.3");
              }
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
    <section ref={sectionRef} id="work" className="scroll-mt-16">
      <Container className="pt-24 md:pt-32">
        <SectionHeading
          eyebrow="Selected Work"
          title="Featured projects"
          description="A closer look at full-stack projects, from data model to interface."
        />
      </Container>

      {/* Desktop: pinned cinematic scene. Hidden below lg, and forced hidden
          under prefers-reduced-motion regardless of width (see globals.css). */}
      <div
        ref={stageRef}
        className="featured-projects-stage relative hidden h-screen w-full overflow-hidden lg:mt-16 lg:block"
      >
        <Container className="relative flex h-full flex-col items-center justify-center">
          {featuredProjects.map((project, i) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="project-scene absolute inset-0 flex items-center"
            >
              <div className="grid w-full grid-cols-[1.05fr_0.95fr] items-center gap-16">
                {project.image ? (
                  <div
                    className="scene-image relative w-full overflow-hidden rounded-3xl"
                    style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}
                  >
                    <Image
                      src={project.image.src}
                      alt={project.image.alt}
                      fill
                      sizes="60vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="scene-image aspect-video w-full rounded-3xl"
                    style={{
                      background: `linear-gradient(135deg, ${project.coverColor}33, ${project.coverColor}0d)`,
                      border: `1px solid ${project.coverColor}44`,
                    }}
                    aria-hidden
                  />
                )}
                <div>
                  <p className="scene-eyebrow font-mono text-xs uppercase tracking-[0.2em] text-accent">
                    Project 0{i + 1}
                  </p>
                  <h3 className="scene-title mt-4 font-display text-4xl font-semibold leading-tight text-foreground xl:text-5xl">
                    {project.title}
                  </h3>
                  <p className="scene-description mt-5 max-w-md text-base text-muted xl:text-lg">
                    {project.description}
                  </p>
                  <div className="scene-tech mt-6 flex flex-wrap gap-2">
                    {project.tech.slice(0, 5).map((tech) => (
                      <Badge key={tech}>{tech}</Badge>
                    ))}
                  </div>
                  <span className="scene-cta mt-8 inline-flex items-center font-mono text-sm text-accent">
                    View case study →
                  </span>
                </div>
              </div>
            </Link>
          ))}

          <div className="pointer-events-none absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-4">
            <span className="font-mono text-xs text-muted">
              <span className="scene-index text-foreground">01</span>
              {` / ${String(featuredProjects.length).padStart(2, "0")}`}
            </span>
            <div className="flex gap-2">
              {featuredProjects.map((project) => (
                <span
                  key={project.slug}
                  className="scene-dot h-1.5 w-1.5 rounded-full bg-accent"
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile: original plain vertical cards. Also the reduced-motion
          fallback at every width (see globals.css). */}
      <Container className="featured-projects-fallback mt-12 space-y-6 lg:hidden">
        {featuredProjects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="project-item group flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-accent/50 md:flex-row md:items-center md:p-8"
          >
            {project.image ? (
              <div
                className="project-image relative w-full shrink-0 overflow-hidden rounded-2xl md:w-72"
                style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}
              >
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  fill
                  sizes="(min-width: 768px) 288px, 100vw"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              </div>
            ) : (
              <div
                className="project-image aspect-video w-full shrink-0 rounded-2xl md:w-72"
                style={{
                  background: `linear-gradient(135deg, ${project.coverColor}33, ${project.coverColor}0d)`,
                  border: `1px solid ${project.coverColor}44`,
                }}
                aria-hidden
              />
            )}
            <div className="flex-1">
              <h3 className="project-title font-display text-2xl font-semibold text-foreground transition-colors group-hover:text-accent">
                {project.title}
              </h3>
              <p className="project-description mt-2 text-muted">{project.pitch}</p>
              <div className="project-tech mt-4 flex flex-wrap gap-2">
                {project.tech.slice(0, 4).map((tech) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </div>
            </div>
            <span className="font-mono text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100 md:opacity-100">
              View case study →
            </span>
          </Link>
        ))}
      </Container>
    </section>
  );
}
