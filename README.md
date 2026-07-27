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

- `prisma/schema.prisma` — `User`, `Account`, `Session` (Auth.js), `Category`, `Tool`, `Review`, `Bookmark`, `ToolSubmission`
- `prisma/seed.ts` — 10 categories, 24 real AI tools (Claude, ChatGPT, Gemini, GitHub Copilot, Cursor, Midjourney, ElevenLabs, Runway, Perplexity, etc.) with real taglines, pricing, features, pros/cons
- `prisma.config.ts` — the modern, non-deprecated way to configure the Prisma CLI (schema path, migrations path, seed command, datasource URL). This replaced the old `"prisma": {}` block in `package.json`, which Prisma 7 removes entirely. It reads `DATABASE_URL`/`DIRECT_URL` via `dotenv/config`, so make sure `.env` is populated before running any `prisma` CLI command — unlike the old flow, the CLI no longer auto-loads `.env` for you.

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

## Running with Docker

A full Docker setup is included — useful for local dev without installing Postgres/Node natively, and as a self-hostable alternative to Vercel. The image installs and builds with **Bun** (fast), but the actual production server runs on real **Node.js** — see the comment block above the `runner` stage in the `Dockerfile` for why (short version: Next.js's standalone output assumes real Node, and Bun's own Docker images don't bundle it — only a compatibility shim that's had documented breakage with Next's standalone server).

**One-time setup:** if you don't already have a `bun.lock` committed, generate one locally (requires [Bun](https://bun.sh) installed on your host once, just for this):
```bash
bun install
```
Commit the resulting `bun.lock` — the Docker build uses `bun install --frozen-lockfile`, which requires it to exist and match `package.json` exactly.

**Local development** (hot reload, Postgres included):
```bash
cp .env.example .env   # fill in AUTH_SECRET / AUTH_GITHUB_ID / AUTH_GITHUB_SECRET
npm run docker:up          # builds and starts db + web
npm run docker:migrate     # applies Prisma migrations (one-off)
npm run docker:seed        # loads the 24 seeded tools
```
Visit `http://localhost:3000`. Source is bind-mounted, so edits on your machine hot-reload inside the container. `node_modules` and `.next` live entirely inside the container's own filesystem (anonymous volumes) — not on your host — so this sidesteps Windows/antivirus install issues entirely.

```bash
npm run docker:down   # stop everything
```

**Production image** (standalone, runs anywhere Docker does):
```bash
npm run docker:build:prod
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e DIRECT_URL="postgresql://..." \
  -e AUTH_SECRET="..." \
  -e AUTH_GITHUB_ID="..." \
  -e AUTH_GITHUB_SECRET="..." \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -e NEXT_PUBLIC_SITE_URL="https://yourdomain.com" \
  the-ai-office
```
Run migrations against your real database once, separately, before starting containers from a new schema version — the production image intentionally doesn't run migrations on boot (avoids multiple replicas racing to migrate simultaneously):
```bash
DATABASE_URL="..." DIRECT_URL="..." npx prisma migrate deploy
```

CI builds the production image (`target: runner`) on every push to catch Dockerfile breakage — see `.github/workflows/ci.yml`.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel → framework preset **Next.js** is auto-detected.
3. Add environment variables in Vercel Project Settings (Production + Preview):
   `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `NEXTAUTH_URL`.
   `NEXT_PUBLIC_SITE_URL` is now **optional** — if unset, canonical URLs/OG tags/sitemap automatically use Vercel's own deployment URL instead of a hardcoded placeholder (see `src/lib/site.ts`). Set it explicitly once you attach a real custom domain.
4. Provision Postgres (Vercel Postgres, Neon, or Supabase) and run `npx prisma migrate deploy && npm run db:seed` once against it.
5. For GitHub Actions CD, add repo secrets `VERCEL_TOKEN`, `DATABASE_URL`, `DIRECT_URL`, and link the project with `vercel link` locally to generate `.vercel/project.json` (commit `.vercel/project.json`'s `orgId`/`projectId` or set `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` as secrets).

## Intelligence Engine

An automated pipeline that keeps tool listings current without manual upkeep: discovers changes on each tool's own official source, verifies them by diffing the primary source directly (not third-party claims), uses an LLM to summarize only substantive changes, keeps a full version history, auto-applies narrow low-risk updates, and queues everything else for admin review.

**How it works** (`src/app/api/cron/discover/route.ts`):
1. Each run pulls a batch of tools (default 15), oldest-checked-first (`Tool.lastCheckedAt`) — this is what makes it scale to a large catalog within a serverless function's time limit: every run makes progress, the next run continues where the last left off.
2. For each tool's `websiteUrl` (and `docsUrl` if set), fetches and extracts readable text (`src/lib/intelligence/extract.ts`), hashes it, and compares against the most recent `ToolSnapshot` for that source.
3. Unchanged → skip, no AI call, no cost. Changed → store the new snapshot (this is the append-only version history — nothing is ever overwritten) and send both versions to Claude (`src/lib/intelligence/analyze.ts`) for a structured, confidence-scored summary.
4. A `ToolChange` record is created either way. If confidence is high **and** the change is narrowly pricing-related, it's auto-applied and the affected pages are revalidated immediately (`revalidatePath`). Everything else — including every features/rebrand/shutdown change regardless of confidence — goes to `/admin/changes` for a human decision, with an optional email notification.

**Setup:**
1. Get an Anthropic API key (console.anthropic.com) → `ANTHROPIC_API_KEY`.
2. Generate a cron secret: `openssl rand -base64 32` → set as `CRON_SECRET` in both `.env` and Vercel's env vars.
3. (Optional) Resend account (resend.com, free tier) for email notifications → `RESEND_API_KEY` + `ADMIN_NOTIFICATION_EMAIL`. **Verify your sending domain in Resend's dashboard first** — `src/lib/intelligence/notify.ts` sends from `notifications@the-ai-office.com`; update that address if you use a different domain, and note sends will silently fail (by design — see below) until the domain's verified.
4. `vercel.json` already schedules the cron for 6am UTC daily. Push and deploy — Vercel picks this up automatically, no dashboard config needed.
5. **Run a migration first** — `Tool.docsUrl`, `Tool.lastCheckedAt`, and the new `ToolSnapshot`/`ToolChange` models are new:
   ```bash
   npx prisma db push
   ```

**Honest constraints, not glossed over:**
- **"Continuous" isn't literal on Vercel's free tier** — Hobby plan cron jobs run at most once/day. This is built for daily by default; if you're on Pro, you can tighten `vercel.json`'s schedule to run more frequently (e.g. hourly) and the same batching logic just cycles through your catalog faster.
- **Every AI call costs money.** Cost scales with how often tools' pages actually change, not with catalog size — unchanged tools never reach the LLM call. Still, budget for it if you have hundreds+ of tools.
- **Scraping is best-effort.** Sites that render pricing via JavaScript (a simple `fetch` can't see it), block bots, or heavily restructure their pages can produce false negatives (missed real changes) or noise (flagged non-changes) — the LLM step filters out most boilerplate/cookie-banner noise, but isn't perfect. This is why manual review exists as a real safety net, not a formality — expect to actually use `/admin/changes` early on, especially before you've seen how a given tool's site behaves over a few runs.
- **The auto-apply allowlist is deliberately narrow** (`AUTO_APPLY_CHANGE_TYPES` in `route.ts`, `SuggestedUpdates` type in `analyze.ts`) — currently only `startingPrice` and `tagline`, and only above 85% confidence. Widen this only deliberately; it's the entire safety mechanism between "saves you time" and "silently corrupts your listings."
- **Test it manually before trusting the schedule**: `curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/discover` — returns a JSON summary of what it did. First run on each tool just establishes a baseline snapshot (nothing to diff against yet), so you won't see real change detection until the second run after something's actually changed.

## Monetization

- **Google AdSense** — deliberately scoped to `/about`, `/contact`, `/privacy`, `/terms` only, never the directory, tool pages, comparison tool, or `/advertise` itself. Rationale: those pages are what earns real money (Featured placement, affiliate clicks), and the pitch to paying vendors is exclusivity — showing a competitor's programmatic ad next to a Featured listing directly undermines that. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` to enable; leave it unset and `src/components/ad-slot.tsx` renders nothing, `/ads.txt` returns empty, and the CSP stays at its default strictness (see the `adsenseEnabled` conditional in `next.config.ts` — the CSP only widens to allow Google's ad-serving domains when this env var is actually set at build time). Ad slot IDs in the four pages above are placeholders (`0000000000`–`0000000003`) — replace with real slot IDs once you've created ad units in your AdSense dashboard. `/privacy` already discloses the AdSense cookie usage and opt-out links — required by AdSense's program policies, not just good practice.

- `/advertise` — public pricing page for tool vendors (Verified badge, Featured placement). Pricing is a placeholder in `src/app/advertise/page.tsx` — tune it to whatever the market bears. CTAs currently point at a `mailto:` link; once you set up a [Stripe Payment Link](https://dashboard.stripe.com/payment-links) (no backend/webhook code needed for a v1), swap the `href` in that file for the Payment Link URL.
- `Tool.affiliateUrl` — optional per-tool affiliate/referral link. When set, outbound clicks route through it instead of the plain `websiteUrl`. Leave it unset until you're actually accepted into a given tool's affiliate program — the admin tool form has a field for it.
- `Tool.clickCount` — every outbound click through `/out/[id]` increments this. Visible in `/admin/tools` — useful both as a sales metric when pitching vendors on paid placement, and later for surfacing "trending" tools.
- **After pulling this update, run a migration** — `affiliateUrl` and `clickCount` are new columns:
  ```bash
  npx prisma migrate dev --name add-monetization-fields
  # or: npx prisma db push
  ```
- Affiliate links carry an FTC-required disclosure — shown inline on the tool page when `affiliateUrl` is set, plus a general disclosure on `/about`. Keep both if you add more affiliate relationships; removing them isn't just a design choice, it's a legal requirement in the US.

## Notes

- `/api/submissions` (public tool-submission form) is rate limited to 5 requests/hour/IP via Upstash Redis — set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (free tier at upstash.com) to enable it. Without those set, the endpoint still works but isn't rate limited — fine for initial deploys/testing, worth enabling before real public traffic.

- `next`, `react`, and `react-dom` are pinned to versions patched against CVE-2025-66478 / CVE-2025-55182 (a critical RCE in the React Server Components protocol affecting Next.js 15.x and unpatched 16.0.x). `npm audit` currently reports zero vulnerabilities. Re-run `npm audit` periodically and keep these pinned versions current — this class of vulnerability is actively exploited in the wild once disclosed.

- All mutating routes (`/api/tools`, `/api/categories`, `DELETE /api/reviews/[id]`, approve/reject on `/api/submissions/[id]`) check `requireAdmin()` server-side and return 403 for non-admins. `POST /api/submissions` is intentionally public — anyone can submit a tool for review.
- After pulling this update, run `npx prisma migrate dev` (or `db push`) again — the `ToolSubmission` model is new and needs a migration applied to your database.
- Tool logos in the seed data use Google's unauthenticated favicon service (`google.com/s2/favicons?domain=...&sz=128`) — zero setup required, but icons are small/low-res. For higher-quality logos, sign up for a free [logo.dev](https://logo.dev) publishable key, swap the seed URLs to `https://img.logo.dev/{domain}?token=YOUR_KEY`, and add `img.logo.dev` back to `images.remotePatterns` in `next.config.ts`. (The old Clearbit Logo API this project's first draft assumed was free was permanently shut down in December 2025 — logo.dev, its official successor, now requires an account.)
- `og-image.png` and PWA icons in `/public` are referenced in metadata but not included as binary assets — add your own before going live.
