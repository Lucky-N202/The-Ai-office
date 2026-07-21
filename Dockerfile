# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Bun base: used for installing deps and building. oven/bun ships Bun
# preinstalled — the original error (exit 127, "command not found") happened
# because the base image was still node:22-alpine with only the RUN line
# edited to say "bun ci": bun wasn't on PATH at all yet. Separately, "bun ci"
# also isn't a real command — the frozen-lockfile equivalent of `npm ci` is
# `bun install --frozen-lockfile`.
# ---------------------------------------------------------------------------
FROM oven/bun:1-alpine AS bun-base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ---------------------------------------------------------------------------
# Deps: install once, cached as its own layer.
# ---------------------------------------------------------------------------
FROM bun-base AS deps
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts

# ---------------------------------------------------------------------------
# Dev: used by `docker compose up` for local development. Source is bind-mounted
# in at runtime (see docker-compose.yml).
# ---------------------------------------------------------------------------
FROM bun-base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Same placeholder-URL pattern as the builder stage below: prisma generate only
# needs *a* syntactically valid DATABASE_URL to run, not a reachable one — the
# real value comes from docker-compose.yml's environment: block at container
# start, overriding whatever's baked in here.
ARG DATABASE_URL="postgresql://user:password@localhost:5432/placeholder"
ARG DIRECT_URL="postgresql://user:password@localhost:5432/placeholder"
ENV DATABASE_URL=${DATABASE_URL}
ENV DIRECT_URL=${DIRECT_URL}
RUN bunx prisma generate
EXPOSE 3000
CMD ["bun", "run", "dev"]

# ---------------------------------------------------------------------------
# Builder: compiles the production build using Bun (fast installs/build).
# ---------------------------------------------------------------------------
FROM bun-base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG DATABASE_URL="postgresql://user:password@localhost:5432/placeholder"
ARG DIRECT_URL="postgresql://user:password@localhost:5432/placeholder"
ENV DATABASE_URL=${DATABASE_URL}
ENV DIRECT_URL=${DIRECT_URL}
RUN bunx prisma generate
RUN bun run build

# ---------------------------------------------------------------------------
# Runner: deliberately switches to a real node:22-alpine base for the actual
# production process, rather than oven/bun.
#
# Why: Next.js's standalone output (server.js) is generated assuming a real
# Node.js runtime. Bun's official images don't bundle actual Node.js — they
# symlink a "node" shim back to the bun binary itself (Bun's own Node
# compatibility layer, not real Node). Running server.js through that shim
# has documented, intermittent breakage in both the Next.js and Prisma
# communities. Bun genuinely speeds up install/build (the "deps" and
# "builder" stages above), but the production server itself is more reliable
# on real Node — hence the hybrid: Bun where it helps, Node where it matters
# for stability. This mirrors what most real-world "Bun + Next.js in Docker"
# writeups converge on after hitting the same breakage.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
