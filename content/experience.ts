import type { ExperienceEntry } from "./types";

// Sourced directly from the resume's Education and Experience sections.
export const experience: ExperienceEntry[] = [
  {
    id: "ssc",
    kind: "education",
    range: "2020 — 2021",
    title: "SSC — CGPA 10.0",
    org: "Mary Mediatrix High School, Telangana",
    description: "Secondary School Certificate.",
  },
  {
    id: "intermediate",
    kind: "education",
    range: "2021 — 2023",
    title: "Intermediate (MPC) — 93.9%",
    org: "NRI Junior College, Telangana",
    description: "Mathematics, Physics, Chemistry.",
  },
  {
    id: "btech",
    kind: "education",
    range: "2023 — 2027",
    title: "B.Tech in Information Technology — CGPA 7.8",
    org: "St. Martin's Engineering College, Hyderabad, Telangana",
    description: "Currently pursuing.",
  },
  {
    id: "uls-technologies",
    kind: "experience",
    range: "2024",
    title: "Java & IT Industry Application Intern",
    org: "ULS Technologies",
    description:
      "Gained practical experience with Java programming and software development workflows through an industry-focused internship. Applied Java programming concepts and developed an understanding of application development practices.",
  },
  {
    id: "freelance-telangana-reels",
    kind: "experience",
    title: "Freelance Web Developer — Telangana Reels",
    org: "Client project",
    description:
      "Developed and deployed a client website for booking content creators and reel shooters for events and occasions. Built a responsive web interface using Next.js, TypeScript, and Tailwind CSS, deployed on Vercel.",
  },
];
