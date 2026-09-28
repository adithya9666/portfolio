"use client";

import { useLayoutEffect, useRef } from "react";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { gsap } from "@/lib/motion/gsap";
import { revealOnScroll } from "@/lib/motion/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { duration, reveal } from "@/lib/motion/tokens";

// .footer-text is added here purely for targeting (no equivalent existed
// before) — content and structure are otherwise byte-for-byte unchanged.
// There's no separate closing visual/detail element to sequence after the
// text (just the copyright line and the existing top border), so this is
// intentionally the quietest reveal on the site: a single short, small-
// distance fade — no multi-stage timeline needed.
export function Footer() {
  const reducedMotion = useReducedMotion();
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const text = footer.querySelector(".footer-text");

    const ctx = gsap.context(() => {
      if (!text) return;

      if (reducedMotion) {
        gsap.set(text, { clearProps: "all" });
        return;
      }

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      // Smaller than any distance Contact uses — this is the quietest
      // reveal on the site, on purpose.
      const y = isDesktop ? reveal.distanceSmall * 0.5 : reveal.distanceSmall * 0.35;

      revealOnScroll(text, { y, duration: duration.fast });
    }, footer);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <footer
      ref={footerRef}
      className="contact-footer border-t border-border/60 py-10"
    >
      <Container>
        <p className="footer-text text-center text-sm text-muted">
          © {new Date().getFullYear()} {site.name}. Built with Next.js &
          Tailwind.
        </p>
      </Container>
    </footer>
  );
}
