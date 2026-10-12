# Operations

Day-to-day reference. See the root [README.md](../README.md) for setup and architecture.

## Promote a user to admin

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```

There's no in-app way to do this — it's deliberately a direct database action, not exposed as a self-service admin feature.

## Test a cron job manually

All three require `CRON_SECRET`:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/discover
curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/weekly-digest
curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/monthly-comparison
```

- `discover`'s first run on any given tool only establishes a baseline snapshot — you won't see a real detected change until the *second* run after something's actually changed on that tool's site.
- `weekly-digest` and `monthly-comparison` both return `{ created: false, reason: ... }` rather than an error when there's nothing to draft (no changes in the past week; no uncovered tool pairing left) — that's expected behavior, not a failure.

## Run a one-off Prisma script

Every script in `prisma/*.ts` (besides `seed.ts`) is an idempotent, safe-to-re-run enrichment or backfill:

```bash
npx tsx prisma/enrich-tools.ts
npx tsx prisma/add-open-source-tools.ts
npx tsx prisma/upgrade-tool-logos.ts
npx tsx prisma/fix-missing-logos.ts
npx tsx prisma/seed-articles.ts
npx tsx prisma/seed-articles-2.ts
npx tsx prisma/set-blog-covers.ts
npx tsx prisma/backfill-missing-covers.ts
npx tsx prisma/set-digest-covers.ts
```

Make sure `DATABASE_URL` in your active shell points at the database you actually mean to change — these run against whatever `.env`/shell environment is currently loaded, local or production.

## Review submissions and read the log

`/admin/submissions` is both the review queue and the permanent log of everything ever submitted.

- It opens on **Pending** when anything is waiting, otherwise on **All**. The sidebar badge shows the pending count.
- Each entry records the submitter's email (and whether that email belongs to a registered user, plus how many submissions that address has made — a quick spam signal), the category they chose, when it was submitted, when and **by which admin** it was decided, and for approvals a link to the published listing.
- Times are shown in UTC.
- Approving a name that already exists as a tool is refused as a probable duplicate — reject it instead. Re-deciding an already-decided submission is refused too (protects against double-clicks and stale tabs).
- Submissions approved *before* this log existed have no linked listing and no reviewer. Run `npx tsx prisma/backfill-submission-links.ts` once after `prisma db push` to recover the listing links (the reviewer can't be recovered — it wasn't recorded).

## Rate limits reference

All via `src/lib/rate-limit.ts`, Upstash-backed, silently permissive if Upstash env vars are unset:

| Limiter | Limit | Keyed by |
|---|---|---|
| Submissions (`/api/submissions`) | 5 / hour | IP |
| Newsletter (`/api/newsletter`) | 3 / hour | IP |
| Password reset (`/api/auth/forgot-password`) | 3 / hour | IP |
| Reviews (`/api/reviews` POST) | 10 / hour | User ID (not IP — reviews require auth, so the actor is already known) |

## Admin-gated routes

Every one of these calls `requireAdmin()` server-side and returns 403 for non-admins:

```
api/articles/route.ts               api/articles/[id]/route.ts
api/categories/route.ts             api/changes/[id]/route.ts
api/checkout/route.ts               api/submissions/route.ts (GET only — POST is public)
api/submissions/[id]/route.ts       api/tools/route.ts
api/tools/[id]/route.ts             api/reviews/[id]/route.ts (unless you're the review's own author)
```

## ISR revalidate values

| Page | Seconds |
|---|---|
| Home | 3600 |
| `/blog`, `/blog/[slug]` | 3600 |
| `/browse/categories/[id]` | 3600 |
| `/browse/tools/[slug]` | 3600 |
| `/advertise` | 3600 |
| `/browse/tools/all` | 1800 |
| `/browse/compare` | 1800 |
| `/rss.xml`, `/llms.txt` | 3600 |

Reviews and article publishing both call `revalidatePath` on the specific affected page — without that, a change could otherwise take up to an hour to appear, since these pages are cached rather than rendered fresh on every request.

## Known inconsistencies to resolve deliberately

These are documented, not silently fixed, because each one is a real decision for you to make rather than an obvious bug:

1. **`deploy.yml` runs `prisma migrate deploy` against a project with no `prisma/migrations` directory.** This project has been evolved entirely with `db push`. Pick one: start a real migration history (`prisma migrate dev --name <description>` from now on, then commit the generated `prisma/migrations/`), or simplify `deploy.yml` to run `prisma db push` instead and drop the migration step's false promise of tracked schema history.
2. **`stripe` is an installed dependency with no code using it.** The real payment integration is Paddle. Confirm nothing depends on it (`grep -rn "from \"stripe\"" src`) and remove it from `package.json`.
3. **Sentry has a setup guide but isn't installed.** No `@sentry/*` in `package.json`. Run `npx @sentry/wizard@latest -i nextjs` when ready — don't hand-write the config files (see the README's note on why: real, version-specific breakage has been documented against manual Next.js + Turbopack setups).
4. **The command palette's client-side fetch of up to 200 tools** will degrade once the catalog is in the hundreds. Not urgent at current size; a server-side search endpoint is the eventual fix.

## Things that look like bugs but aren't

- **A newly-created auto-drafted article uses a generic cover image**, not a custom one matching its specific topic. This is intentional — generating a bespoke graphic automatically per topic would need an image-rendering library added to the build. Swap the cover in `/admin/articles` before publishing if you want a matching one.
- **Digest/comparison cron runs that find nothing to draft return `created: false`, not an error.** Check the `reason` field in the response before assuming something's broken.
- **A review submitted twice by the same user updates the first one** rather than erroring or creating a duplicate — this is the upsert behavior, not a bug.
