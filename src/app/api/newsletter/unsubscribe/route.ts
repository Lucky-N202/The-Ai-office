import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

/**
 * One-click unsubscribe via the token in every newsletter email's footer —
 * deliberately no login/confirmation step required, per standard email
 * best-practice (and CAN-SPAM/GDPR expectations of a low-friction opt-out).
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(`${getSiteUrl()}/`);

  await prisma.newsletterSubscriber
    .update({ where: { unsubscribeToken: token }, data: { unsubscribedAt: new Date() } })
    .catch(() => null); // invalid/already-used token — fail quietly, still redirect

  return NextResponse.redirect(`${getSiteUrl()}/?unsubscribed=1`);
}
