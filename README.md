# The AI Office

An AI tools discovery platform: browse, compare, bookmark, and review AI tools, with a blog, a newsletter, and an automated pipeline that keeps listings current. Built with Next.js 16, React 19, TypeScript, Prisma, and PostgreSQL.

This README is the entry point. Day-to-day operational tasks (promoting an admin, testing a cron by hand, rate-limit values, known inconsistencies) live in [`docs/OPERATIONS.md`](docs/OPERATIONS.md) — read that before you go looking for those answers elsewhere.

## Contents

- [Features](#features)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Project structure](#project-structure)
- [Authentication](#authentication)
- [Reviews, bookmarks, and account settings](#reviews-bookmarks-and-account-settings)
- [Automation: Intelligence Engine, weekly digest, monthly comparisons](#automation-intelligence-engine-weekly-digest-monthly-comparisons)
- [Blog](#blog)
- [SEO](#seo)
- [Monetization](#monetization)
- [Security](#security)
- [Deploying](#deploying)
- [Known gaps](#known-gaps)

## Features

- **Directory**: `/browse/tools/all` (filterable), `/browse/tools/[slug]` (detail, with curated "alternatives" and "use cases"), `/browse/categories/[id]`, `/browse/compare`
- **⌘K command palette** — client-side fuzzy search (Fuse.js) over up to 200 tools; see [Known gaps](#known-gaps) for why this doesn't scale indefinitely
- **Accounts**: sign up/log in via GitHub, Google, or email+password; `/account` for profile editing, password change, linked sign-in methods, saved tools, your own reviews, data export, and account deletion; `/forgot-password` → `/reset-password` for password recovery
- **Reviews**: star rating + title + body per tool, one per user per tool (editable, not duplicated), rate-limited, with the tool's aggregate rating recalculated and the page's ISR cache busted immediately on post/edit/delete
- **Bookmarks**: instant localStorage persistence, synced to Postgres on login, viewable at `/bookmarks`
- **Tool submissions**: public form at `/submit` (honeypot + rate limit) with logo URL and category, feeding an admin review queue (`/admin/submissions`) that approves (publishes as a real `Tool`, using the submitter's own logo) or rejects
- **Admin** (`/admin`, role-gated): CRUD for Tools, Categories, Articles, and Reviews; the tool-change review queue (`/admin/changes`); submission approvals
- **Blog**: AI-assisted and hand-written articles, cover images, RSS feed at `/rss.xml`, feed autodiscovery site-wide
- **Cookie consent**: banner wired into Google Consent Mode (not just cosmetic — ad/analytics cookies default to denied until accepted), reopenable from the footer
- **Analytics events**: `tool_click`, `tool_submitted`, `newsletter_signup`, `account_created` (tagged by method), via `@vercel/analytics`, viewable in the Vercel dashboard
- **SEO**: per-page metadata, canonical tags, a default site-wide OG image plus per-page ones (tools, blog posts), JSON-LD (`SoftwareApplication`, `BreadcrumbList`, `Article`, and more), `sitemap.ts`, `robots.ts`, `llms.txt`, IndexNow ping on publish/update
- **ISR** on nearly every public page — see the revalidate table in [Known gaps](#known-gaps) for exact values, and note that `generateStaticParams`/`generateMetadata` on the three dynamic routes (tools, categories, blog posts) are wrapped so a transient DB hiccup during build falls back gracefully instead of failing the whole build
- **Dark mode** via `next-themes`, Tailwind CSS v4 design tokens, Framer Motion micro-interactions
- **Automation**: a daily job that detects and summarizes real changes on tools' own sites (Intelligence Engine), a weekly digest drafted from that data, and a monthly job that drafts a comparison post for a tool pairing that doesn't have one yet — all three only ever produce **drafts** for human review, never auto-publish

## Design system

| Token | Value |
|---|---|
| Background | `#09090B` |
| Card | `#111113` |
| Primary | `#7C3AED` |
| Radius (cards) | `24px` |
| Radius (controls) | `14px` |

Defined as CSS variables in `src/app/globals.css` (Tailwind v4's CSS-first config). Glass morphism via `.glass`. Apple-style easing (`cubic-bezier(0.16, 1, 0.3, 1)`) on Framer Motion transitions.

## Getting started

```bash
npm install
cp .env.example .env      # fill in real values — see below
npx prisma db push
npm run db:seed           # loads 10 categories + the seeded tool catalog
npm run dev
```

Visit `http://localhost:3000`. Press **⌘K** / **Ctrl+K** anywhere to open the command palette.

This project uses `prisma db push`, not `prisma migrate` — see [Known gaps](#known-gaps) for why that matters for `deploy.yml`.

## Environment variables

Full reference with real values is in `.env.example` — copy it, don't retype it. Grouped by what breaks without each one:

| Required for the app to run at all | |
|---|---|
| `DATABASE_URL` | Pooled connection string (Neon/Supabase/Vercel Postgres) |
| `DIRECT_URL` | Non-pooled, used for migrations/`db push` |
| `AUTH_SECRET` | `npx auth secret` or `openssl rand -base64 32` |

| Required for auth (all three sign-in methods) | |
|---|---|
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth app |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth client — note the different naming convention from the GitHub pair; this is intentional, see `src/lib/auth.ts`'s comment on why Google's provider is configured explicitly rather than via Auth.js's auto-env convention |

Email+password needs no extra env vars — it's handled directly against `User.password` (bcryptjs).

| Optional — features degrade gracefully without these | Used for |
|---|---|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting on submissions, newsletter, password reset, reviews. Without these, every limiter's check silently passes (see `src/lib/rate-limit.ts`) — fine for local dev, set before real public traffic |
| `RESEND_API_KEY` | Password reset emails, admin change-review notifications, newsletter sends. Without it, these silently no-op rather than crash |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | The Intelligence Engine, weekly digest, and monthly comparison generator. Model defaults to `claude-sonnet-5` if unset |
| `ADMIN_NOTIFICATION_EMAIL` | Where change-review and comparison-draft notifications go |
| `CRON_SECRET` | Bearer token the three cron routes require — `openssl rand -base64 32` |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Enables AdSense; unset means ad slots render nothing and CSP stays strict |
| `PADDLE_API_KEY` / `PADDLE_WEBHOOK_SECRET` / `PADDLE_FEATURED_PRICE_ID` / `PADDLE_VERIFIED_PRICE_ID` / `PADDLE_ENVIRONMENT` | Admin-generated Featured/Verified checkout links — see [Monetization](#monetization) |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` / `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | Client-side Paddle.js, used by `paddle-checkout-handler.tsx` |
| `INDEXNOW_KEY` | Pings Bing/Yandex/etc. on publish — see `src/lib/indexnow.ts`. The key file itself lives in `public/<key>.txt`, not generated from this env var |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs/OG/sitemap. If unset, falls back to Vercel's own deployment URL (`src/lib/site.ts`) — set explicitly once you're on a real custom domain |

Sentry (error monitoring) is documented but **not yet installed** in this codebase — see [Known gaps](#known-gaps).

## Database

- `prisma/schema.prisma` — 13 models: `User`, `Account`, `Session`, `VerificationToken` (password reset), `Category`, `Tool`, `ToolSnapshot`, `ToolChange`, `Review`, `Article`, `NewsletterSubscriber`, `ToolSubmission`, `Bookmark`
- `prisma/seed.ts` — categories + the original commercial-tool catalog
- `prisma/add-open-source-tools.ts`, `prisma/upgrade-tool-logos.ts`, `prisma/fix-missing-logos.ts`, `prisma/enrich-tools.ts` — one-off, idempotent scripts layered on top of the seed; run with `npx tsx prisma/<file>.ts`. Each is safe to re-run.
- `prisma/seed-articles.ts`, `prisma/seed-articles-2.ts`, `prisma/set-blog-covers.ts`, `prisma/backfill-missing-covers.ts`, `prisma/set-digest-covers.ts` — same pattern, for blog content and cover images
- `prisma.config.ts` — the non-deprecated way to configure the Prisma CLI; reads `.env` via `dotenv/config`, so populate `.env` before running any `prisma` command

To promote a user to admin after they've signed in once:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## Project structure

```
src/
  app/
    page.tsx                         # Home (ISR, 3600s)
    sitemap.ts / robots.ts / llms.txt/route.ts
    rss.xml/route.ts                 # Blog RSS feed
    account/page.tsx                 # Profile, password, sign-in methods, reviews, export, delete
    forgot-password/ , reset-password/
    login/ , signup/
    browse/tools/all/ , browse/tools/[slug]/ , browse/categories/[id]/ , browse/compare/
    blog/ , blog/[slug]/
    admin/**                         # Role-gated CRUD + review queues
    api/**                           # See the route list in docs/OPERATIONS.md
  components/
    account/                         # profile-form, password-form, danger-zone, review-row
    admin/                           # tool-form, article-form, submission-actions, ...
    cookie-consent-banner.tsx , cookie-preferences-link.tsx
    review-form.tsx
    header.tsx , footer.tsx
  lib/
    auth.ts                          # NextAuth config: GitHub + Google + Credentials, JWT sessions
    prisma.ts , rate-limit.ts , tokens.ts , consent.ts , site.ts , indexnow.ts
    intelligence/                    # extract.ts, analyze.ts, notify.ts
    newsletter/                      # generate-digest.ts, generate-comparison.ts, send.ts
  types/
prisma/
  schema.prisma , seed.ts , *.ts     # one-off enrichment scripts, see Database above
.github/workflows/
  ci.yml                             # lint, typecheck, seeded-Postgres build
  deploy.yml                         # migrate + vercel deploy — see Known gaps
docs/
  OPERATIONS.md                      # runbook: admin promotion, manual cron tests, rate-limit table, gaps
```

## Authentication

Three sign-in methods, one session model (JWT — required because the Credentials provider can't use database sessions):

- **GitHub / Google OAuth** — via the Prisma adapter, which handles account linking/storage
- **Email + password** — `src/app/api/auth/signup/route.ts` creates the user directly (bcryptjs, 12 rounds), bypassing the adapter
- **Password reset** — `/forgot-password` → emails a link with a SHA-256-hashed, one-time, 1-hour token (`VerificationToken`) → `/reset-password`. The request endpoint always returns the same generic response regardless of whether the email exists, whether it's rate-limited, or whether it's an OAuth-only account with no password — that's what actually prevents email enumeration, not the token logic alone.
- **Account settings** (`/account`) — a user can add a password to an OAuth-only account, or change an existing one (current password required); see linked sign-in methods, saved tools, and their own reviews (editable/deletable, which recalculates the tool's rating and busts its ISR cache); download a JSON export of their profile/reviews/bookmarks; delete their account (cascades to Account/Session/Review/Bookmark via `onDelete: Cascade`)

Sentry user-tagging (`Sentry.setUser(...)` in the `session` callback) is written but depends on Sentry actually being installed first — see [Known gaps](#known-gaps).

## Reviews, bookmarks, and account settings

- One review per user per tool, enforced by a unique constraint; re-submitting **updates** the existing review (upsert), so there's no separate edit code path
- `POST`/`PATCH`/`DELETE` on reviews all call `revalidatePath` on the affected tool page — without this, a review change could take up to an hour to visibly appear, since tool pages are ISR-cached
- Review creation is rate-limited to 10/hour **per user** (not per IP — the user is already known, since reviews require auth)
- Deleting a review is allowed for the review's own author or an admin, not admin-only

## Automation: Intelligence Engine, weekly digest, monthly comparisons

Three separate scheduled jobs (`vercel.json`), all producing **drafts only**:

| Cron | Schedule | What it does |
|---|---|---|
| `/api/cron/discover` | Daily, 6am UTC | Detects and summarizes real changes on each tool's own site |
| `/api/cron/weekly-digest` | Mondays, 8am UTC | Drafts a roundup `Article` from the past week's detected changes |
| `/api/cron/monthly-comparison` | 1st of the month, 9am UTC | Finds a tool-alternatives pairing without an existing comparison post and drafts one, grounded only in the real feature/pros/cons/use-case data already in your database |

**Vercel Hobby plan allows at most 2 crons total.** This project schedules 3 — you're over the Hobby limit as configured. Either upgrade to Pro, or remove/merge one before deploying to a Hobby account.

**Intelligence Engine mechanics** (`src/app/api/cron/discover/route.ts`): batches 15 tools per run, oldest-checked-first; fetches and hashes each tool's page text; unchanged → skip (no AI call, no cost); changed → stores an append-only `ToolSnapshot` and asks Claude for a confidence-scored summary (`ToolChange`). Only `startingPrice`/`tagline` changes above 85% confidence auto-apply; everything else queues at `/admin/changes`.

**Weekly digest** (`src/lib/newsletter/generate-digest.ts`): pulls the past 7 days of `ToolChange` + new tools, asks Claude to draft a factual roundup, saves as `DRAFT` with a generic cover image (`/blog-covers/weekly-roundup-default.png`), notifies the admin. Never auto-publishes, never auto-emails — publishing from `/admin/articles/[id]` is the only action that sends to the newsletter list.

**Monthly comparison** (`src/lib/newsletter/generate-comparison.ts`): looks at `Tool.alternatives` relationships, finds a pairing where no existing article slug mentions both tools, drafts a comparison grounded only in real DB data for those two tools. Same generic fallback cover, same draft-only behavior.

Test any of the three manually:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/discover
curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/weekly-digest
curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/monthly-comparison
```

## Blog

- `/blog` and `/blog/[slug]` — ISR-cached, full SEO metadata + `Article` JSON-LD, included in the sitemap and `/rss.xml`
- Cover images: self-hosted PNGs in `public/blog-covers/`, rendered as list thumbnails (cropped `object-left`, matching where each cover's text/mark sits) and full-width hero banners, and wired into `openGraph`/`twitter` metadata so shared links show a real preview image
- Write articles by hand from `/admin/articles/new`, or let the automated drafts above feed the same queue
- Newsletter signup on `/blog` and every article; one-click, no-login unsubscribe in every email footer

## SEO

- Per-page metadata, canonical URLs, JSON-LD across tool/category/blog/home pages
- `generateStaticParams` and `generateMetadata` on all three dynamic routes (tools, categories, blog posts) are wrapped in try/catch — a transient DB failure during build falls back to an empty param list or generic metadata instead of failing the entire build
- Default site-wide OG image (`public/og-default.png`) for any page without its own; tool pages and blog posts override it with their own
- `robots.ts`, `sitemap.ts`, `llms.txt` (a plain-text catalog + recent articles, for LLM crawlers)
- IndexNow: pings Bing/Yandex on tool/article publish or update (`src/lib/indexnow.ts`); requires `INDEXNOW_KEY` plus the matching `public/<key>.txt` file
- RSS feed at `/rss.xml`, plus `<link rel="alternate" type="application/rss+xml">` autodiscovery in the root layout

## Monetization

- **AdSense** — scoped to `/about`, `/contact`, `/privacy`, `/terms` only, never the directory/tool pages/`/advertise`. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` to enable. The ad script itself loads unconditionally site-wide (for AdSense's verification crawler), but real ad/analytics cookies respect **Google Consent Mode**: denied by default, only granted after the cookie banner is accepted. See `src/components/adsense-script.tsx` and `src/lib/consent.ts`.
- **`/advertise`** — public pricing page (Verified badge, Featured placement). The `mailto:` CTA (with a pre-filled subject and body, plus a copyable fallback email for anyone whose mail client doesn't open) is the *intended* first step, not a placeholder: a vendor reaches out, you confirm they actually own the tool, then generate a payment link for that specific tool.
- **Payment processor is Paddle**, not Stripe, despite `stripe` still being listed in `package.json` — see [Known gaps](#known-gaps). The real flow: in `/admin/tools`, generate a Paddle Transaction-as-payment-link for one specific tool (`/api/checkout`) → send it to the vendor → `/api/webhooks/paddle` sets `featured`/`verified` on `TransactionCompleted`, unsets `featured` on `SubscriptionCanceled`. The public site never exposes a generic "pay to feature any tool" link.
- Category and all-tools listing pages sort `featured` tools first, then by rating — this is what the paid Featured plan's "boosted position" promise actually depends on
- Admin submission review can mark a paid Verified submission `priorityReview: true`, sorting it to the top of the review queue — a submitter can't set this themselves
- `Tool.affiliateUrl` — optional; outbound clicks route through it via `/out/[id]`, which also increments `Tool.clickCount` and fires a `tool_click` analytics event

## Security

- Every public-write endpoint is rate-limited (submissions, newsletter, password reset, reviews) — see the values table in `docs/OPERATIONS.md`
- All admin-mutating routes check `requireAdmin()` server-side (listed in `docs/OPERATIONS.md`)
- Password reset tokens are SHA-256-hashed before storage, one-time use, 1-hour expiry
- CSP set in `next.config.ts`; widens only for Google's ad-serving domains when `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is actually set at build time
- `next`/`react`/`react-dom` pinned against CVE-2025-66478 / CVE-2025-55182 (RCE in the React Server Components protocol) — keep these current, re-run `npm audit` periodically

## Deploying

**Vercel** (primary target):
1. Import the repo, framework preset Next.js auto-detected
2. Set every env var from `.env.example` in Project Settings for **Production** specifically (not just Preview — a var set only for one environment is a recurring source of confusing bugs in this project's history)
3. Provision Postgres, run `npx prisma db push && npm run db:seed` once
4. Cron jobs in `vercel.json` are picked up automatically on deploy — remember the Hobby-plan 2-cron limit noted above

**Docker** — a full self-hostable setup exists (`Dockerfile`, `docker-compose.yml`); see the inline comments in those files for the Bun-builds/Node-runs rationale. `npm run docker:up` for local dev, `npm run docker:build:prod` for a standalone production image.

**CI** (`.github/workflows/ci.yml`) — lint, typecheck, build against an ephemeral seeded Postgres, on every push.

**CD** (`.github/workflows/deploy.yml`) — see [Known gaps](#known-gaps) before relying on this as-is.

## Known gaps

Documented honestly rather than silently worked around:

- **`deploy.yml` runs `prisma migrate deploy`, but this project has no `prisma/migrations` directory** — it's been evolved entirely with `db push`. That CI step likely does nothing useful (no migrations to apply) or fails depending on your Prisma version's behavior against a `db push`-only schema history. Either commit a real migration history (`prisma migrate dev` going forward) or remove that step and keep using `db push` in deploy — pick one deliberately rather than leaving the mismatch.
- **`stripe` is still an installed dependency** (`package.json`) though no code imports it — the actual payment integration is Paddle throughout (`@paddle/paddle-js`, `@paddle/paddle-node-sdk`). Safe to remove once confirmed unused.
- **Sentry is documented as a setup guide but not yet installed** — no `@sentry/*` packages in `package.json`, no `instrumentation.ts`. Run `npx @sentry/wizard@latest -i nextjs` to actually add it; the `Sentry.setUser(...)` call referenced in `auth.ts`'s history depends on this being done first.
- **The ⌘K command palette fetches up to 200 tools client-side** on every open and filters in the browser. Fine at the current catalog size; revisit with a real server-side search endpoint once the catalog grows into the hundreds.
- **`.env.example` didn't exist until this documentation pass** — it's now present; keep it in sync when you add new env vars, since multiple docs (this README included) tell people to copy it.
