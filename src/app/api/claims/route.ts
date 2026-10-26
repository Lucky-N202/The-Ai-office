import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
import { signClaim, registrableHost } from "@/lib/claims";
import { checkSubmissionRateLimit, getClientIp } from "@/lib/rate-limit";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const schema = z.object({
  toolId: z.string().min(1),
  plan: z.enum(["featured", "verified"]),
  name: z.string().min(1).max(80),
  email: z.string().email().max(120),
  // Honeypot — real users never fill this in.
  company: z.string().max(0).optional(),
});

/**
 * Public: a vendor asks to claim a listing and buy a plan. NOTHING is charged
 * or changed here. The admin gets an email with a signed approval link; only
 * after the admin confirms ownership does the vendor receive a checkout link.
 * (Paying for a listing you don't own is the abuse this ordering prevents.)
 */
export async function POST(req: NextRequest) {
  const { success } = await checkSubmissionRateLimit(getClientIp(req));
  if (!success) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  if (parsed.data.company) return NextResponse.json({ success: true }); // bot: pretend success

  const tool = await prisma.tool.findUnique({
    where: { id: parsed.data.toolId },
    select: { id: true, name: true, websiteUrl: true },
  });
  if (!tool) return NextResponse.json({ error: "Tool not found." }, { status: 404 });

  if (!resend || !process.env.ADMIN_NOTIFICATION_EMAIL) {
    return NextResponse.json(
      { error: "Online requests are temporarily unavailable — please email hello@the-ai-office.com." },
      { status: 503 }
    );
  }

  const { plan, name, email } = parsed.data;
  const token = signClaim({ toolId: tool.id, plan, name, email });
  const approveUrl = `${getSiteUrl()}/admin/claims/approve?token=${encodeURIComponent(token)}`;
  const match = registrableHost(email) === registrableHost(tool.websiteUrl);

  try {
    await resend.emails.send({
      from: "The AI Office <notifications@the-ai-office.com>",
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      replyTo: email,
      subject: `Listing claim: ${tool.name} (${plan})`,
      text: [
        `${name} <${email}> wants the ${plan.toUpperCase()} plan for ${tool.name}.`,
        ``,
        `Email domain matches the tool's website: ${match ? "YES" : "NO — verify ownership before approving"}`,
        `Tool website: ${tool.websiteUrl}`,
        ``,
        `Review and approve (you must be signed in as admin; link expires in 14 days):`,
        approveUrl,
      ].join("\n"),
    });
  } catch {
    return NextResponse.json({ error: "Couldn't send your request. Please email hello@the-ai-office.com." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
