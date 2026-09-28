# Adithya Racharla — Portfolio

Personal portfolio site for Adithya Racharla, B.Tech Information Technology student
at St. Martin's Engineering College. Built with Next.js (App Router), TypeScript,
Tailwind CSS, and GSAP for scroll-driven motion.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- TypeScript
- Tailwind CSS 4
- GSAP + ScrollTrigger, [Lenis](https://github.com/darkroomengineering/lenis) for smooth scroll

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it locally.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Content

Site copy, project data, experience, skills, achievements, and certifications live in
`content/*.ts`, sourced directly from Adithya's resume. Personal photos and project
visuals live in `public/`.

## Deployment

Deployed on [Vercel](https://vercel.com). If a custom domain is attached, set the
`NEXT_PUBLIC_SITE_URL` environment variable in the Vercel project settings so
OpenGraph/social preview metadata resolves to the right domain (see `app/layout.tsx`).
