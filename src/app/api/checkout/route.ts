import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/site";

const checkoutSchema = z.object({
  toolId: z.string().min(1),
  plan: z.enum(["featured", "verified"]),
});

/**
 * Generates a Checkout link for a SPECIFIC tool — never a generic "pay to be
 * featured" link anyone could use, since that would let someone pay to
 * feature a tool they don't own. The intended flow: a vendor emails about
 * advertising (via /advertise), you agree on a plan, then generate a link
 * here for their specific tool and send it to them.
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json(
      { error: "Stripe isn't configured yet — set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET." },
      { status: 400 }
    );
  }

  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const tool = await prisma.tool.findUnique({ where: { id: parsed.data.toolId } });
  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

  const siteUrl = getSiteUrl();
  const isFeatured = parsed.data.plan === "featured";
  const priceId = isFeatured ? process.env.STRIPE_FEATURED_PRICE_ID : process.env.STRIPE_VERIFIED_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      { error: `Missing ${isFeatured ? "STRIPE_FEATURED_PRICE_ID" : "STRIPE_VERIFIED_PRICE_ID"} — create the price in your Stripe dashboard first.` },
      { status: 400 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: isFeatured ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    // client_reference_id round-trips through checkout.session.completed —
    // this is how the webhook knows which tool to update.
    client_reference_id: tool.id,
    metadata: { toolId: tool.id, plan: parsed.data.plan },
    // For subscriptions specifically, metadata also needs to be set here so
    // it carries onto the Subscription object itself, not just this session —
    // that's what lets the cancellation webhook (which only sees the
    // Subscription, not the original Checkout Session) know which tool to
    // un-feature.
    ...(isFeatured ? { subscription_data: { metadata: { toolId: tool.id, plan: parsed.data.plan } } } : {}),
    success_url: `${siteUrl}/browse/tools/${tool.slug}?upgraded=1`,
    cancel_url: `${siteUrl}/admin/tools`,
  });

  return NextResponse.json({ url: session.url, toolName: tool.name });
}
