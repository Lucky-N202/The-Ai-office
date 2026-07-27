import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting for public write endpoints (tool submissions, newsletter
 * signups). Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN —
 * free tier at upstash.com covers this comfortably. If those aren't set
 * (e.g. local dev, or before you've set this up in Vercel), every limiter
 * below no-ops and allows every request through rather than crashing the
 * route — so it's safe to deploy before or after configuring Upstash.
 */
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function createRateLimitChecker(prefix: string, limiter: ReturnType<typeof Ratelimit.slidingWindow>) {
  const instance = redis ? new Ratelimit({ redis, limiter, prefix }) : null;
  return async (identifier: string): Promise<{ success: boolean; remaining?: number }> => {
    if (!instance) return { success: true };
    const result = await instance.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  };
}

// 5 submissions per hour per IP — generous for a real user submitting a
// handful of tools, restrictive enough to blunt scripted abuse.
export const checkSubmissionRateLimit = createRateLimitChecker("ratelimit:submissions", Ratelimit.slidingWindow(5, "1 h"));

// Looser than submissions since a real subscriber only ever needs one
// successful attempt — this mostly exists to blunt scripted list-bombing.
export const checkNewsletterRateLimit = createRateLimitChecker("ratelimit:newsletter", Ratelimit.slidingWindow(3, "1 h"));

/** Best-effort caller IP extraction behind Vercel's proxy. */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
