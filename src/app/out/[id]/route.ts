import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { track } from "@vercel/analytics/server";

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
    select: { name: true, slug: true, websiteUrl: true, affiliateUrl: true },
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

  // Same reasoning as above re: awaiting — plus this gives you a real
  // time-series/breakdown view in Vercel Analytics (which tools, which day)
  // instead of only the single running total clickCount gives you.
  try {
    await track("tool_click", { tool: tool.name, slug: tool.slug });
  } catch {
    // Never let analytics block the actual redirect.
  }

  return NextResponse.redirect(tool.affiliateUrl || tool.websiteUrl);
}
