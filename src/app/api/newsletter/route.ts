import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkNewsletterRateLimit, getClientIp } from "@/lib/rate-limit";

const subscribeSchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await checkNewsletterRateLimit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const parsed = subscribeSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  // Upsert: resubscribing after a previous unsubscribe just clears the
  // unsubscribedAt flag rather than erroring on the unique email constraint.
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { unsubscribedAt: null },
    create: { email: parsed.data.email },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
