import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { ProblemSolving } from "@/components/sections/ProblemSolving";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Journey } from "@/components/sections/Journey";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { Recognition } from "@/components/sections/Recognition";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <About />
        <Journey />
        <Skills />
        <ProblemSolving />
        <FeaturedProjects />
        <ProjectsGrid />
        <Recognition />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
