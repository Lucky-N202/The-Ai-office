import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 500);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const idsParam = searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : undefined;

  const tools = await prisma.tool.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(ids ? { id: { in: ids } } : {}),
    },
    include: { category: { select: { id: true, name: true, slug: true, color: true, icon: true } } },
    orderBy: { rating: "desc" },
    take: limit,
  });

  return NextResponse.json(tools);
}

const createToolSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  websiteUrl: z.string().url(),
  affiliateUrl: z.string().url().nullable().optional(),
  logoUrl: z.string().url(),
  categoryId: z.string().min(1),
  pricingModel: z.enum(["FREE", "FREEMIUM", "PAID", "ENTERPRISE", "OPEN_SOURCE"]).default("FREEMIUM"),
  startingPrice: z.number().nullable().optional(),
  features: z.array(z.string()).default([]),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createToolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);
  const tool = await prisma.tool.create({
    data: { ...parsed.data, slug },
  });

  return NextResponse.json(tool, { status: 201 });
}
