"use client";

import { useLayoutEffect, useRef } from "react";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { gsap } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { duration, ease, opacity, reveal, stagger } from "@/lib/motion/tokens";

const links = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  {
    label: "Phone",
    value: site.phone,
    href: `tel:${site.phone.replace(/[^+\d]/g, "")}`,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/racharla-adithya",
    href: "https://linkedin.com/in/racharla-adithya",
  },
];

// .contact-heading, .contact-copy, .contact-link, and .contact-meta are
// existing stable hooks; .contact-eyebrow is added here (no equivalent
// existed before) purely for targeting, matching this file's own naming
// convention — no visual change. One shared ScrollTrigger sequences the
// whole close: eyebrow/heading (primary) → copy → links (staggered) →
// meta (slower, quieter, visually subordinate) — this is a single cohesive
// block, not a list of independently-scrolling items, so it doesn't need
// per-element triggers the way Journey/ProjectsGrid do.
export function Contact() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const eyebrow = section.querySelector(".contact-eyebrow");
    const heading = section.querySelector(".contact-heading");
    const copy = section.querySelector(".contact-copy");
    const linkEls = Array.from(section.querySelectorAll(".contact-link"));
    const meta = section.querySelector(".contact-meta");

    const ctx = gsap.context(() => {
      const allTargets = [eyebrow, heading, copy, ...linkEls, meta].filter(Boolean);

      if (reducedMotion) {
        gsap.set(allTargets, { clearProps: "all" });
        return;
      }

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const headingY = isDesktop ? reveal.distance : reveal.distanceSmall;
      const smallY = isDesktop ? reveal.distanceSmall : reveal.distanceSmall * 0.75;

      gsap.set(eyebrow, { opacity: opacity.hidden, y: reveal.distanceSmall });
      gsap.set(heading, { opacity: opacity.hidden, y: headingY });
      gsap.set(copy, { opacity: opacity.hidden, y: smallY });
      gsap.set(linkEls, { opacity: opacity.hidden, y: smallY });
      gsap.set(meta, { opacity: opacity.hidden, y: smallY });

      const tl = gsap.timeline({
        defaults: { ease: ease.expoOut },
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      tl.to(eyebrow, { opacity: opacity.visible, y: 0, duration: duration.fast })
        .to(heading, { opacity: opacity.visible, y: 0, duration: duration.slow }, "-=0.15")
        .to(copy, { opacity: opacity.visible, y: 0, duration: duration.base }, "-=0.5")
        .to(
          linkEls,
          { opacity: opacity.visible, y: 0, duration: duration.base, stagger: stagger.children },
          "-=0.25",
        )
        .to(
          meta,
          { opacity: opacity.visible, y: 0, duration: duration.slow, ease: ease.soft },
          "-=0.1",
        );
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="contact-section scroll-mt-16 py-32 md:py-48"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="contact-eyebrow font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Contact
          </p>
          <h2 className="contact-heading mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Let&apos;s build something meaningful.
          </h2>
          <p className="contact-copy mx-auto mt-6 max-w-xl text-lg text-muted md:text-xl">
            Whether it&apos;s a full-time role, a collaboration, or a project
            worth building — I&apos;d like to hear about it.
          </p>

          <div className="mx-auto mt-14 max-w-md border-t border-border text-left">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="contact-link group flex items-center justify-between border-b border-border py-5 transition-colors hover:border-accent/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                  {link.label}
                </span>
                <span className="font-display text-lg text-foreground transition-colors group-hover:text-accent md:text-xl">
                  {link.value}
                </span>
              </a>
            ))}
          </div>

          <div className="contact-meta mt-20">
            <div
              aria-hidden
              className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
            />
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {site.name} — {site.role}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
