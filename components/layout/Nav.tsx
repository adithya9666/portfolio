"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { MobileMenu } from "@/components/layout/MobileMenu";

const links = [
  { label: "About", href: "/#about" },
  { label: "Journey", href: "/#journey" },
  { label: "Skills", href: "/#skills" },
  { label: "Problem Solving", href: "/#problem-solving" },
  { label: "Work", href: "/#work" },
  { label: "Projects", href: "/#projects" },
  { label: "Recognition", href: "/#recognition" },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent rounded-sm";

// Two lightweight, IntersectionObserver-driven states — no per-frame scroll
// work. `scrolled` gives the header a subtle background/border shift past a
// small threshold (no hide/reveal — this stays continuously visible on
// purpose, so section-jumping is always reachable). `activeId` highlights
// whichever tracked section is currently in view; on routes without those
// sections (e.g. /projects/[slug]) it simply never fires, which is fine —
// the header still works, just without the highlight.
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    function onScroll() {
      const next = window.scrollY > 8;
      setScrolled((prev) => (prev === next ? prev : next));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.href.replace("/#", "")))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur transition-colors duration-300 ${
        scrolled ? "border-border/60 bg-background/90" : "border-transparent bg-background/60"
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className={`font-display text-sm font-semibold tracking-tight text-foreground ${focusRing}`}
        >
          {site.name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => {
            const isActive = activeId === link.href.replace("/#", "");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={`relative py-1 text-sm transition-colors ${focusRing} ${
                  isActive ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
                <span
                  aria-hidden
                  className={`absolute -bottom-0.5 left-0 h-px w-full bg-accent transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/resume"
            className={`text-sm text-muted transition-colors hover:text-foreground ${focusRing}`}
          >
            Resume
          </Link>
          <Link
            href="/#contact"
            className={`inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 ${focusRing}`}
          >
            Contact
          </Link>
          <MobileMenu links={links} />
        </div>
      </Container>
    </header>
  );
}
