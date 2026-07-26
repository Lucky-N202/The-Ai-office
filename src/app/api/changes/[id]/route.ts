import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const decisionSchema = z.object({ action: z.enum(["approve", "reject"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const change = await prisma.toolChange.findUnique({ where: { id }, include: { tool: true } });
  if (!change) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = decisionSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.action === "reject") {
    await prisma.toolChange.update({ where: { id }, data: { status: "REJECTED", reviewedAt: new Date() } });
    return NextResponse.json({ success: true });
  }

  // Approve: apply the suggested updates (if any — a change can be approved
  // purely as "acknowledged, no field update needed" when suggestedUpdates
  // is null, e.g. a rebrand/shutdown notice that just needs a human to know).
  if (change.suggestedUpdates && typeof change.suggestedUpdates === "object") {
    await prisma.tool.update({ where: { id: change.toolId }, data: change.suggestedUpdates as Record<string, unknown> });
    revalidatePath(`/browse/tools/${change.tool.slug}`);
    revalidatePath(`/browse/categories/${change.tool.categoryId}`);
    revalidatePath("/");
  }

  await prisma.toolChange.update({ where: { id }, data: { status: "APPROVED", reviewedAt: new Date() } });
  return NextResponse.json({ success: true });
}
