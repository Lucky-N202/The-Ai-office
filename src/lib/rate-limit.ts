import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting for public write endpoints (currently: tool submissions).
 *
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN — free tier at
 * upstash.com covers this comfortably. If those aren't set (e.g. local dev,
 * or before you've set this up in Vercel), this no-ops and allows every
 * request through rather than crashing the route — so it's safe to deploy
 * before or after configuring Upstash.
 */
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const submissionRatelimit = redis
  ? new Ratelimit({
      redis,
      // 5 submissions per hour per IP — generous for a real user submitting
      // a handful of tools, restrictive enough to blunt scripted abuse.
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "ratelimit:submissions",
    })
  : null;

export async function checkSubmissionRateLimit(identifier: string): Promise<{ success: boolean; remaining?: number }> {
  if (!submissionRatelimit) {
    // Not configured — allow the request through rather than block legitimate
    // traffic just because rate limiting hasn't been set up yet.
    return { success: true };
  }
  const result = await submissionRatelimit.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}

/** Best-effort caller IP extraction behind Vercel's proxy. */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
