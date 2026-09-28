import type { SkillCategory } from "./types";

// Categories and items taken verbatim from the resume's Technical Skills section.
export const skillCategories: SkillCategory[] = [
  {
    id: "languages",
    label: "Languages",
    items: ["Java", "JavaScript", "TypeScript", "Python", "C"],
  },
  {
    id: "frontend",
    label: "Frontend",
    items: ["React", "Next.js", "HTML", "CSS", "Tailwind CSS"],
  },
  {
    id: "backend",
    label: "Backend",
    items: ["Spring Boot", "REST APIs"],
  },
  {
    id: "database",
    label: "Database",
    items: ["MySQL", "PostgreSQL", "Supabase"],
  },
  {
    id: "core-cs",
    label: "Core CS",
    items: ["Data Structures & Algorithms", "Object-Oriented Programming", "DBMS"],
  },
];
