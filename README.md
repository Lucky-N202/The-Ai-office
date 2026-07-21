# The AI Office

A production-ready AI tools discovery platform built with Next.js 16, React 19, TypeScript, Prisma, and PostgreSQL.

## Features

- **App Router** pages: home, `/browse/tools/all`, `/browse/tools/[slug]`, `/browse/categories/[id]`, `/browse/compare`, `/bookmarks`, `/submit`, `/about`, `/contact`, `/privacy`, `/terms`
- **⌘K command palette** with client-side fuzzy search (Fuse.js + cmdk)
- **Bookmarking** — instant localStorage persistence, synced to Postgres on login, viewable at `/bookmarks`
- **Tool submissions** — public form at `/submit` (honeypot spam filter) feeding an admin review queue that approves (publishes as a real `Tool`) or rejects
- **Admin CRUD** for Tools, Categories, and Reviews at `/admin` (GitHub OAuth + role-gated, and all mutating API routes now actually enforce `requireAdmin()` server-side)
- **SEO**: per-page metadata, canonical tags, Open Graph/Twitter cards, JSON-LD (`WebSite`, `SoftwareApplication`, `CollectionPage`), `sitemap.ts`, `robots.ts`
- **ISR** on tool/category/home/compare pages (`revalidate`)
- **Dark mode** via `next-themes`, **Tailwind CSS v4** design tokens, **Framer Motion** micro-interactions
- Fully responsive: mobile, tablet, desktop, ultra-wide (`grid` breakpoints up to `lg`)
- **CI** (lint, typecheck, seeded Postgres build) and **CD** (Vercel deploy) via GitHub Actions

## Design system

| Token | Value |
|---|---|
| Background | `#09090B` |
| Card | `#111113` |
| Primary | `#7C3AED` |
| Radius (cards) | `24px` |
| Radius (controls) | `14px` |

Defined as CSS variables/`@theme` tokens in `src/app/globals.css` (Tailwind v4's CSS-first config). Glass morphism via `.glass` (backdrop-blur + translucent border), Apple-style easing (`cubic-bezier(0.16, 1, 0.3, 1)`) on all Framer Motion transitions.

## Getting started

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_GITHUB_ID/SECRET
npx prisma db push        # or: npm run db:migrate
npm run db:seed           # loads 10 categories + 24 tools
npm run dev
```

Visit `http://localhost:3000`. Press **⌘K** / **Ctrl+K** anywhere to open the command palette.

### Environment variables

See `.env.example`. In production, use a pooled `DATABASE_URL` (Neon/Supabase/Vercel Postgres) plus a non-pooled `DIRECT_URL` for Prisma migrations.

## Database

- `prisma/schema.prisma` — `User`, `Account`, `Session` (Auth.js), `Category`, `Tool`, `Review`, `Bookmark`
- `prisma/seed.ts` — 10 categories, 24 real AI tools (Claude, ChatGPT, Gemini, GitHub Copilot, Cursor, Midjourney, ElevenLabs, Runway, Perplexity, etc.) with real taglines, pricing, features, pros/cons

To promote a user to admin after they sign in once:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## Project structure

```
src/
  app/
    page.tsx                        # Home (ISR)
    sitemap.ts / robots.ts
    browse/tools/all/page.tsx       # Filterable directory
    browse/tools/[slug]/page.tsx    # Tool detail (SSG + ISR, JSON-LD)
    browse/categories/[id]/page.tsx
    browse/compare/page.tsx
    admin/**                        # Role-gated CRUD
    api/**                          # tools, categories, bookmarks, reviews, auth
  components/                       # ToolCard, CommandPalette, CompareTable, CategoryGrid, ...
  lib/                              # prisma client, fuse config, bookmarks (localStorage), auth
  types/
prisma/
  schema.prisma
  seed.ts
.github/workflows/
  ci.yml                            # lint, typecheck, build against ephemeral Postgres
  deploy.yml                        # prisma migrate deploy + vercel deploy --prod
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel → framework preset **Next.js** is auto-detected.
3. Add environment variables in Vercel Project Settings (Production + Preview):
   `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`
4. Provision Postgres (Vercel Postgres, Neon, or Supabase) and run `npx prisma migrate deploy && npm run db:seed` once against it.
5. For GitHub Actions CD, add repo secrets `VERCEL_TOKEN`, `DATABASE_URL`, `DIRECT_URL`, and link the project with `vercel link` locally to generate `.vercel/project.json` (commit `.vercel/project.json`'s `orgId`/`projectId` or set `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` as secrets).

## Notes

- All mutating routes (`/api/tools`, `/api/categories`, `DELETE /api/reviews/[id]`, approve/reject on `/api/submissions/[id]`) check `requireAdmin()` server-side and return 403 for non-admins. `POST /api/submissions` is intentionally public — anyone can submit a tool for review.
- After pulling this update, run `npx prisma migrate dev` (or `db push`) again — the `ToolSubmission` model is new and needs a migration applied to your database.
- Tool logos in the seed data use Google's unauthenticated favicon service (`google.com/s2/favicons?domain=...&sz=128`) — zero setup required, but icons are small/low-res. For higher-quality logos, sign up for a free [logo.dev](https://logo.dev) publishable key, swap the seed URLs to `https://img.logo.dev/{domain}?token=YOUR_KEY`, and add `img.logo.dev` back to `images.remotePatterns` in `next.config.ts`. (The old Clearbit Logo API this project's first draft assumed was free was permanently shut down in December 2025 — logo.dev, its official successor, now requires an account.)
- `og-image.png` and PWA icons in `/public` are referenced in metadata but not included as binary assets — add your own before going live.
