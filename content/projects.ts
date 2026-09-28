import type { Project } from "./types";
import { projectImages } from "./assets";

// Sourced directly from the resume's Projects and Experience sections.
// No invented metrics, links, dates, or features — fields the resume doesn't
// state (role, timeframe, links) are left empty/undefined rather than guessed.
export const projects: Project[] = [
  {
    slug: "careeros",
    title: "CareerOS",
    pitch:
      "A full-stack platform integrating learning, assessments, and career-growth workflows into a single application.",
    description:
      "CareerOS is a full-stack platform built with React and TypeScript on the frontend and Java with Spring Boot and PostgreSQL on the backend, integrating learning, assessments, and career-growth workflows into one application, connected end-to-end through RESTful APIs.",
    tech: ["React", "TypeScript", "Java", "Spring Boot", "PostgreSQL"],
    highlights: [
      "Developed a full-stack platform integrating learning, assessments, and career-growth workflows into a single application.",
      "Built frontend features using React and TypeScript and backend services using Java and Spring Boot with PostgreSQL.",
      "Developed RESTful APIs to connect frontend workflows with backend services and application data.",
    ],
    architecture:
      "React/TypeScript frontend communicating with a Java Spring Boot backend over RESTful APIs, backed by PostgreSQL.",
    links: [],
    featured: true,
    coverColor: "#7c5cff",
    image: projectImages.careeros,
  },
  {
    slug: "telangana-reels",
    title: "Telangana Reels",
    pitch:
      "A freelance client website for booking content creators and reel shooters for events and occasions.",
    description:
      "Delivered as a freelance client project, Telangana Reels is a responsive booking website connecting clients with content creators and reel shooters for events and occasions. Built with Next.js, TypeScript, and Tailwind CSS, and deployed on Vercel.",
    role: "Freelance Web Developer",
    tech: ["Next.js", "TypeScript", "Tailwind CSS"],
    highlights: [
      "Developed and deployed a client website for booking content creators and reel shooters for events and occasions.",
      "Built a responsive web interface using Next.js, TypeScript, and Tailwind CSS.",
      "Deployed the production site on Vercel.",
    ],
    links: [],
    featured: true,
    coverColor: "#22d3ee",
    image: projectImages["telangana-reels"],
  },
  {
    slug: "hexapod-walking-robot",
    title: "Hexapod Walking Robot",
    pitch:
      "An obstacle-avoiding hexapod robot that detects objects in its path and changes direction accordingly.",
    description:
      "An IoT hexapod walking robot that detects obstacles in its path using onboard sensors and autonomously changes direction to avoid them. Presented at the Rashtrapati Bhavan Youth Skill Expo 2025.",
    timeframe: "2025",
    tech: ["IoT Sensors"],
    highlights: [
      "Developed an obstacle-avoiding hexapod robot that detects objects in its path and changes direction accordingly.",
      "Presented the project at the Rashtrapati Bhavan Youth Skill Expo 2025.",
    ],
    links: [],
    featured: true,
    coverColor: "#f59e0b",
    image: projectImages["hexapod-walking-robot"],
  },
  {
    slug: "student-check-in-system",
    title: "Student Check-In System",
    pitch:
      "A student attendance and check-in management system with authentication and real-time data storage.",
    description:
      "A student attendance and check-in management system built with React and Supabase, featuring authentication, real-time data storage, and responsive dashboards for managing student records and attendance information.",
    tech: ["React", "Supabase", "JavaScript"],
    highlights: [
      "Developed a student attendance and check-in management system with authentication and real-time data storage using Supabase.",
      "Designed responsive dashboards for managing student records and attendance information.",
    ],
    architecture:
      "React frontend backed by Supabase for authentication and real-time data storage.",
    links: [],
    featured: true,
    coverColor: "#34d399",
    image: projectImages["student-check-in-system"],
  },
  {
    slug: "weather-forecasting-application",
    title: "Weather Forecasting Application",
    pitch:
      "Real-time, location-based weather forecasts with a dynamic UI.",
    description:
      "A weather forecasting web app that integrates weather APIs to provide real-time forecasts and location-based weather information, with dynamic UI updates.",
    tech: ["JavaScript", "REST APIs"],
    highlights: [
      "Integrated weather APIs to provide real-time forecasts and location-based weather information.",
      "Implemented dynamic UI updates based on live API data.",
    ],
    links: [],
    featured: false,
    coverColor: "#60a5fa",
    image: projectImages["weather-forecasting-application"],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}
