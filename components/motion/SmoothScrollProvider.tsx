"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { desktopBreakpoint, headerHeightPx } from "@/lib/motion/tokens";

// The single global smooth-scroll system for the site. Lenis only runs on
// desktop/tablet with motion allowed — mobile and reduced-motion users get
// native scrolling (avoids fighting touch momentum, and never forces motion
// on people who've asked for less of it). Reacts live to both the viewport
// crossing the desktop breakpoint and the OS reduced-motion setting
// changing mid-session, instead of only checking once on mount.
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const desktopQuery = window.matchMedia(`(min-width: ${desktopBreakpoint}px)`);
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;

    // Same-page hash links (Nav, mobile menu, Hero CTAs, footer, etc.) get a
    // smooth Lenis scroll instead of the browser's instant jump, so scrolling
    // feels like one continuous system rather than smooth-except-for-anchors.
    // Cross-page links (e.g. a "/#about" click from /resume) are left alone
    // for Next.js's normal navigation to handle.
    function handleAnchorClick(event: MouseEvent) {
      if (!lenis) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a[href]");
      const href = anchor?.getAttribute("href");
      if (!href) return;

      const isSamePageHash = href.startsWith("#") || href.startsWith("/#");
      if (!isSamePageHash) return;
      if (href.startsWith("/#") && window.location.pathname !== "/") return;

      const id = href.slice(href.indexOf("#") + 1);
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: -headerHeightPx });
      window.history.pushState(null, "", `#${id}`);
    }

    function syncToPreferences() {
      const shouldRun = desktopQuery.matches && !reducedMotionQuery.matches;
      if (shouldRun === Boolean(lenis)) return;

      if (shouldRun) {
        lenis = new Lenis();
        lenis.on("scroll", ScrollTrigger.update);
        tickerFn = (time: number) => lenis?.raf(time * 1000);
        gsap.ticker.add(tickerFn);
        gsap.ticker.lagSmoothing(0);
        document.addEventListener("click", handleAnchorClick);
      } else if (lenis) {
        document.removeEventListener("click", handleAnchorClick);
        if (tickerFn) gsap.ticker.remove(tickerFn);
        lenis.destroy();
        lenis = null;
        tickerFn = null;
        ScrollTrigger.refresh();
      }
    }

    syncToPreferences();
    desktopQuery.addEventListener("change", syncToPreferences);
    reducedMotionQuery.addEventListener("change", syncToPreferences);

    return () => {
      desktopQuery.removeEventListener("change", syncToPreferences);
      reducedMotionQuery.removeEventListener("change", syncToPreferences);
      if (lenis) {
        document.removeEventListener("click", handleAnchorClick);
        if (tickerFn) gsap.ticker.remove(tickerFn);
        lenis.destroy();
      }
    };
  }, []);

  return <>{children}</>;
}
