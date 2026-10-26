import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { verifyClaim } from "@/lib/claims";
import { createToolCheckout } from "@/lib/paddle";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const page = (body: string, status = 200) =>
  new Response(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;max-width:560px;margin:4rem auto;padding:0 1rem">${body}</body>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

/** Admin only: confirms ownership, creates the tool-specific Paddle link, emails it to the vendor. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return page("<h1>Forbidden</h1><p>Sign in as an admin first.</p>", 403);

  const form = await req.formData();
  const claim = verifyClaim(String(form.get("token") ?? ""));
  if (!claim) return page("<h1>Invalid or expired claim</h1><p>Ask the vendor to submit the form again.</p>", 400);

  const tool = await prisma.tool.findUnique({ where: { id: claim.toolId }, select: { id: true, name: true } });
  if (!tool) return page("<h1>Tool not found</h1>", 404);

  let checkoutUrl: string;
  try {
    checkoutUrl = await createToolCheckout(tool.id, claim.plan);
  } catch (err) {
    return page(`<h1>Paddle error</h1><p>${esc(err instanceof Error ? err.message : "Unknown error")}</p>`, 500);
  }

  let emailed = false;
  if (resend) {
    try {
      await resend.emails.send({
        from: "The AI Office <notifications@the-ai-office.com>",
        to: claim.email,
        subject: `Your ${claim.plan} listing for ${tool.name} is approved`,
        text: `Hi ${claim.name},\n\nThanks for your request — we've confirmed your listing for ${tool.name}. Complete your ${claim.plan} plan here:\n\n${checkoutUrl}\n\nOnce payment goes through, it's applied to your listing automatically.\n\nThe AI Office`,
      });
      emailed = true;
    } catch {
      // fall through — admin still gets the link below to send manually
    }
  }

  return page(
    `<h1>${emailed ? "Approved — link emailed" : "Approved — email failed, send this manually"}</h1>
     <p>${esc(tool.name)} · ${esc(claim.plan)} · ${esc(claim.email)}</p>
     <p style="word-break:break-all"><a href="${esc(checkoutUrl)}">${esc(checkoutUrl)}</a></p>`
  );
}
