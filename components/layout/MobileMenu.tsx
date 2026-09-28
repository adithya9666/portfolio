"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NavLink = { label: string; href: string };

// Functional interaction only (open/close/escape/outside-click) — no
// cinematic motion here. Any transition used is plain CSS, which the global
// prefers-reduced-motion rule in globals.css already neutralizes.
export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Lock body scroll while the panel is open so the page behind it doesn't
  // scroll underneath the fixed overlay. Mobile-only (this component itself
  // is md:hidden), so there's no desktop scrollbar-width layout shift to
  // account for.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-sm md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="relative block h-3.5 w-5">
          <span
            className={`absolute left-0 block h-px w-5 bg-foreground transition-transform duration-200 ${
              open ? "top-1/2 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 block h-px w-5 bg-foreground transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 block h-px w-5 bg-foreground transition-transform duration-200 ${
              open ? "top-1/2 -rotate-45" : "top-full"
            }`}
          />
        </span>
      </button>

      {open ? (
        <>
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 top-16 bottom-0 z-40 bg-background/80 md:hidden"
          />
          <div
            id="mobile-menu-panel"
            className="fixed inset-x-0 top-16 z-40 border-b border-border bg-background md:hidden"
          >
            <nav className="flex flex-col divide-y divide-border px-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-sm py-4 font-display text-lg text-foreground transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      ) : null}
    </>
  );
}
