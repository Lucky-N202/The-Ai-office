import { createHmac, timingSafeEqual } from "crypto";

export type ClaimPlan = "featured" | "verified";

export type ClaimPayload = {
  toolId: string;
  plan: ClaimPlan;
  name: string;
  email: string;
  /** Expiry, ms since epoch. */
  exp: number;
};

const TTL_MS = 14 * 24 * 60 * 60 * 1000;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is required to sign claim links");
  return s;
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString("base64url");

/**
 * Stateless, tamper-proof claim token (payload + HMAC). Lets a vendor's claim
 * request travel inside an admin email without needing a new database table:
 * the token can't be forged or edited, and it expires after 14 days.
 */
export function signClaim(p: Omit<ClaimPayload, "exp">): string {
  const body = b64(JSON.stringify({ ...p, exp: Date.now() + TTL_MS }));
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyClaim(token: string | undefined | null): ClaimPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const expected = createHmac("sha256", secret()).update(body).digest();
    const given = Buffer.from(sig, "base64url");
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ClaimPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (payload.plan !== "featured" && payload.plan !== "verified") return null;
    return payload;
  } catch {
    return null;
  }
}

/** "https://www.foo.com/x" -> "foo.com"; "me@foo.com" -> "foo.com". */
export function registrableHost(input: string): string {
  const raw = input.includes("@") ? input.split("@").pop()! : input;
  try {
    const host = raw.includes("://") ? new URL(raw).hostname : raw;
    return host.toLowerCase().replace(/^www\./, "");
  } catch {
    return raw.toLowerCase();
  }
}
