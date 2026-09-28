import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { skillCategories } from "@/content/skills";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { PrintButton } from "@/components/resume/PrintButton";

export const metadata: Metadata = {
  title: `${site.name} — Resume`,
  description: `Resume for ${site.name}, ${site.role}.`,
};

// Deliberately animation-free and high-contrast: this route is the
// escape hatch from the cinematic homepage for recruiters/ATS/print.
export default function ResumePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 print:bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6 print:hidden">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          ← Back to portfolio
        </Link>
        <div className="flex gap-3">
          <PrintButton />
          <a
            href={site.resumeHref}
            className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
          >
            Download PDF
          </a>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-6 pb-24">
        <header className="border-b border-zinc-200 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            {site.name}
          </h1>
          <p className="mt-1 text-lg text-zinc-600">{site.role}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
            <span>{site.phone}</span>
            <span>{site.email}</span>
            <span>{site.location}</span>
            {site.socials
              .filter((s) => s.label !== "Email")
              .map((s) => (
                <span key={s.label}>{s.href}</span>
              ))}
          </div>
        </header>

        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
            Summary
          </h2>
          <p className="mt-2 text-zinc-800">{site.bio[0]}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
            Skills
          </h2>
          <dl className="mt-3 space-y-2">
            {skillCategories.map((category) => (
              <div key={category.id} className="flex gap-2 text-sm">
                <dt className="w-28 shrink-0 font-medium text-zinc-700">
                  {category.label}
                </dt>
                <dd className="text-zinc-600">{category.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
            Projects
          </h2>
          <div className="mt-3 space-y-5">
            {projects.map((project) => (
              <div key={project.slug} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-medium text-zinc-900">
                    {project.title}
                  </h3>
                  {project.timeframe ? (
                    <span className="text-xs text-zinc-500">
                      {project.timeframe}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-zinc-600">{project.pitch}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {project.tech.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
            Education & Experience
          </h2>
          <div className="mt-3 space-y-4">
            {experience.map((entry) => (
              <div key={entry.id} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-medium text-zinc-900">{entry.title}</h3>
                  {entry.range ? (
                    <span className="text-xs text-zinc-500">{entry.range}</span>
                  ) : null}
                </div>
                <p className="text-sm text-zinc-600">{entry.org}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  {entry.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
