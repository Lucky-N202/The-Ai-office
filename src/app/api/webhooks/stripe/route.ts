import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

async function applyToTool(toolId: string, data: { featured?: boolean; verified?: boolean }) {
  const tool = await prisma.tool.update({ where: { id: toolId }, data }).catch(() => null);
  if (!tool) return; // tool may have been deleted since purchase — nothing to apply
  revalidatePath(`/browse/tools/${tool.slug}`);
  revalidatePath(`/browse/categories/${tool.categoryId}`);
  revalidatePath("/");
}

export async function POST(req: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  // Signature verification requires the raw, unparsed request body — do not
  // call req.json() before this, it would consume the body and break verification.
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const toolId = session.client_reference_id ?? session.metadata?.toolId;
      const plan = session.metadata?.plan;
      if (!toolId || !plan) break;

      if (plan === "featured") await applyToTool(toolId, { featured: true });
      if (plan === "verified") await applyToTool(toolId, { verified: true });
      break;
    }

    // Subscription fully ended (canceled, or payment retries exhausted —
    // configure retry/dunning behavior in Stripe's own dashboard settings).
    // This only affects Featured (a subscription); Verified is a one-time
    // purchase with nothing to expire.
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const toolId = subscription.metadata?.toolId;
      if (toolId && subscription.metadata?.plan === "featured") {
        await applyToTool(toolId, { featured: false });
      }
      break;
    }

    default:
      break; // ignore every other event type we don't act on
  }

  return NextResponse.json({ received: true });
}
