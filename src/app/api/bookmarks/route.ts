import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([]);
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: { tool: { include: { category: true } } },
  });
  return NextResponse.json(bookmarks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthenticated — stored locally only" }, { status: 401 });
  const { toolId } = await req.json();
  const bookmark = await prisma.bookmark.upsert({
    where: { userId_toolId: { userId: session.user.id, toolId } },
    update: {},
    create: { userId: session.user.id, toolId },
  });
  return NextResponse.json(bookmark, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { toolId } = await req.json();
  await prisma.bookmark.delete({ where: { userId_toolId: { userId: session.user.id, toolId } } }).catch(() => null);
  return NextResponse.json({ success: true });
}
