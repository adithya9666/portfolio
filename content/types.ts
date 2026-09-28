export type SkillCategory = {
  id: string;
  label: string;
  items: string[];
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Project = {
  slug: string;
  title: string;
  pitch: string;
  description: string;
  // Left undefined where the resume doesn't state it — do not backfill with guesses.
  role?: string;
  timeframe?: string;
  tech: string[];
  highlights: string[];
  architecture?: string;
  links: ProjectLink[];
  featured: boolean;
  coverColor: string;
  // Real visual asset for the project; falls back to the coverColor gradient
  // when a project doesn't have one yet.
  image?: ProjectImage;
};

export type ExperienceEntry = {
  id: string;
  kind: "education" | "experience";
  // Left undefined where the resume doesn't state a date range.
  range?: string;
  title: string;
  org: string;
  description: string;
};

export type Certification = {
  id: string;
  title: string;
  issuer: string;
  year?: string;
};

export type Achievement = {
  id: string;
  description: string;
  year?: string;
};
