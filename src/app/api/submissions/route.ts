import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { checkSubmissionRateLimit, getClientIp } from "@/lib/rate-limit";
import { track } from "@vercel/analytics/server";

const submissionSchema = z.object({
  name: z.string().min(1).max(80),
  tagline: z.string().min(1).max(140),
  description: z.string().min(1).max(2000),
  websiteUrl: z.string().url(),
  logoUrl: z.string().url(),
  categoryId: z.string().min(1),
  submitterEmail: z.string().email(),
  // Honeypot field: real users never fill this in. Bots that blindly fill every
  // input usually will, letting us silently drop the submission without a CAPTCHA.
  company: z.string().max(0).optional(),
});

/** Public — anyone can submit a tool for review. No auth required, rate limited by IP. */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await checkSubmissionRateLimit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a bit." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Honeypot tripped — pretend success so the bot doesn't learn anything, but don't persist.
  if (parsed.data.company) return NextResponse.json({ success: true }, { status: 201 });

  const { company: _company, ...data } = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Invalid category selected" }, { status: 400 });
  }

  const submission = await prisma.toolSubmission.create({ data });

  try {
    await track("tool_submitted", { name: submission.name });
  } catch {
    // Never let analytics block the actual submission.
  }

  return NextResponse.json(submission, { status: 201 });
}

/** Admin — list submissions, optionally filtered by status (default: PENDING). */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = new URL(req.url).searchParams.get("status") ?? "PENDING";
  const submissions = await prisma.toolSubmission.findMany({
    where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(submissions);
}
