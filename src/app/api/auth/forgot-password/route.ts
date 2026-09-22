import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/tokens";
import { checkPasswordResetRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const schema = z.object({ email: z.string().email() });

// Always the same wording whether or not the account exists — this is what
// actually prevents email enumeration, not just the token logic below.
const GENERIC_RESPONSE = { message: "If an account exists for that email, a reset link is on its way." };

export async function POST(req: NextRequest) {
  const rate = await checkPasswordResetRateLimit(getClientIp(req));
  if (!rate.success) {
    // Same generic message even when rate-limited — a different response
    // here would itself leak information to someone probing addresses.
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Silently no-op for: no account, or an OAuth-only account with no
  // password to reset. Same external response either way.
  if (user?.password) {
    const { rawToken, hashedToken } = generateResetToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Clear any previous outstanding tokens for this email first, so only
    // the most recently requested link works.
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: hashedToken, expires },
    });

    const resetUrl = `${getSiteUrl()}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    if (resend) {
      try {
        await resend.emails.send({
          from: "The AI Office <noreply@the-ai-office.com>",
          to: email,
          subject: "Reset your password",
          text: `Someone requested a password reset for your The AI Office account.\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
        });
      } catch {
        // Swallow — don't reveal delivery failures to the caller, and don't
        // fail the request over an email provider hiccup.
      }
    }
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
