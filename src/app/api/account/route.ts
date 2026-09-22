import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Account, Session, Review, and Bookmark all cascade-delete via the
  // relation's onDelete: Cascade in schema.prisma — deleting the User row
  // is enough to clean up everything owned by them.
  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ success: true });
}
