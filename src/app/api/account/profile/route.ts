import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().min(1).max(80) });

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid name" }, { status: 400 });

  const user = await prisma.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name } });
  return NextResponse.json({ id: user.id, name: user.name });
}
