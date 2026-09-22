import { randomBytes, createHash } from "crypto";

/**
 * Generates a random token for the reset link, plus its SHA-256 hash for
 * storage. Only the hash is ever written to the database (in
 * VerificationToken.token) — so a database read/leak alone can't be used
 * to reset anyone's password, the same way you'd never store a plaintext
 * password. The raw token only ever exists in memory here and in the
 * emailed link itself.
 */
export function generateResetToken() {
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
}

export function hashResetToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}
