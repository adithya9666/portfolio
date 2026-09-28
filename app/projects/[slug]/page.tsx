import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { projects, getProjectBySlug } from "@/content/projects";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Case Study`,
    description: project.pitch,
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <>
      <Nav />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <Link
            href="/#work"
            className="font-mono text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-accent"
          >
            ← Back to work
          </Link>

          {project.image ? (
            <div
              className="relative mt-8 w-full overflow-hidden rounded-3xl"
              style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}
            >
              <Image
                src={project.image.src}
                alt={project.image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="mt-8 aspect-[21/9] w-full rounded-3xl"
              style={{
                background: `linear-gradient(135deg, ${project.coverColor}33, ${project.coverColor}0d)`,
                border: `1px solid ${project.coverColor}44`,
              }}
              aria-hidden
            />
          )}

          <div className="mt-10 grid gap-10 md:grid-cols-[2fr_1fr]">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                {project.title}
              </h1>
              <p className="mt-4 text-lg text-muted">{project.pitch}</p>
              <p className="mt-6 text-base leading-relaxed text-muted">
                {project.description}
              </p>

              {project.architecture ? (
                <div className="mt-10">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Architecture
                  </h2>
                  <p className="mt-3 text-muted">{project.architecture}</p>
                </div>
              ) : null}

              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Highlights
                </h2>
                <ul className="mt-3 space-y-2 text-muted">
                  {project.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="space-y-8 border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              {project.role ? (
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                    Role
                  </p>
                  <p className="mt-1 text-foreground">{project.role}</p>
                </div>
              ) : null}
              {project.timeframe ? (
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                    Timeframe
                  </p>
                  <p className="mt-1 text-foreground">{project.timeframe}</p>
                </div>
              ) : null}
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                  Tech
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
              </div>
              {project.links.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {project.links.map((link) => (
                    <Button key={link.label} href={link.href} variant="secondary">
                      {link.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </aside>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
