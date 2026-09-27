import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, reviews, bookmarks, accounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      // Deliberately not using a blanket select-all: excludes `password`
      // (a hash, but still not something that belongs in an export a user
      // downloads and might store/share) and internal ids not meaningful
      // outside this database.
      select: { name: true, email: true, image: true, role: true, createdAt: true },
    }),
    prisma.review.findMany({
      where: { userId: session.user.id },
      select: { rating: true, title: true, body: true, createdAt: true, tool: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bookmark.findMany({
      where: { userId: session.user.id },
      select: { createdAt: true, tool: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.account.findMany({ where: { userId: session.user.id }, select: { provider: true } }),
  ]);

  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: user,
    signInMethods: accounts.map((a) => a.provider),
    reviews: reviews.map((r) => ({
      tool: r.tool.name,
      toolUrl: `/browse/tools/${r.tool.slug}`,
      rating: r.rating,
      title: r.title,
      body: r.body,
      postedAt: r.createdAt,
    })),
    bookmarks: bookmarks.map((b) => ({
      tool: b.tool.name,
      toolUrl: `/browse/tools/${b.tool.slug}`,
      savedAt: b.createdAt,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="the-ai-office-data-export.json"`,
    },
  });
}
