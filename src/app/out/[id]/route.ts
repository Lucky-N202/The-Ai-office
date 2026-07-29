import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Tracked outbound link. Every "Visit Website" click routes through here
 * instead of linking directly to the tool's site — increments a click
 * counter (useful both as a sales metric for pitching paid placement to
 * vendors, and eventually for surfacing "trending" tools) and redirects to
 * the affiliate URL when one's set, falling back to the plain website URL.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tool = await prisma.tool.findUnique({
    where: { id },
    select: { websiteUrl: true, affiliateUrl: true },
  });

  if (!tool) {
    return NextResponse.redirect(new URL("/browse/tools/all", _req.url));
  }

  // Awaited deliberately, not fire-and-forget: serverless functions can be
  // frozen right after the response is sent, which would silently drop an
  // un-awaited update here. The added latency is negligible for a redirect.
  try {
    await prisma.tool.update({ where: { id }, data: { clickCount: { increment: 1 } } });
  } catch {
    // Don't let a tracking failure block the actual redirect.
  }

  return NextResponse.redirect(tool.affiliateUrl || tool.websiteUrl);
}
