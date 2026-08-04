import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkNewsletterRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/newsletter/send";

const subscribeSchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await checkNewsletterRateLimit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const parsed = subscribeSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: parsed.data.email } });

  // Already an active subscriber — don't silently re-upsert and claim
  // success as if nothing was wrong; tell them directly.
  if (existing && !existing.unsubscribedAt) {
    return NextResponse.json({ error: "This email is already subscribed.", alreadySubscribed: true }, { status: 409 });
  }

  // Either a brand new subscriber, or resubscribing after a previous
  // unsubscribe — both cases clear/create with unsubscribedAt: null.
  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { unsubscribedAt: null },
    create: { email: parsed.data.email },
  });

  const welcome = await sendWelcomeEmail(subscriber.email, subscriber.unsubscribeToken);

  return NextResponse.json({ success: true, welcomeEmailSent: welcome.sent }, { status: 201 });
}
