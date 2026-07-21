import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Called once after login to migrate localStorage bookmarks into the DB. */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { toolIds } = (await req.json()) as { toolIds: string[] };
  if (!Array.isArray(toolIds) || toolIds.length === 0) return NextResponse.json({ synced: 0 });

  await prisma.bookmark.createMany({
    data: toolIds.map((toolId) => ({ userId: session.user!.id!, toolId })),
    skipDuplicates: true,
  });

  return NextResponse.json({ synced: toolIds.length });
}
