import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { paddle, isPaddleConfigured } from "@/lib/paddle";

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
 *
 * Uses Paddle's "Transaction as a payment link" pattern: creating a
 * Transaction with just line items and customData (no pre-created Customer)
 * automatically produces a shareable checkout.url — this is Paddle's own
 * documented approach for exactly this use case, rather than needing
 * Paddle.js on the frontend for an overlay checkout.
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!isPaddleConfigured() || !paddle) {
    return NextResponse.json(
      { error: "Paddle isn't configured yet — set PADDLE_API_KEY and PADDLE_WEBHOOK_SECRET." },
      { status: 400 }
    );
  }

  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const tool = await prisma.tool.findUnique({ where: { id: parsed.data.toolId } });
  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

  const isFeatured = parsed.data.plan === "featured";
  const priceId = isFeatured ? process.env.PADDLE_FEATURED_PRICE_ID : process.env.PADDLE_VERIFIED_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      { error: `Missing ${isFeatured ? "PADDLE_FEATURED_PRICE_ID" : "PADDLE_VERIFIED_PRICE_ID"} — create the price in your Paddle dashboard first.` },
      { status: 400 }
    );
  }

  try {
    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      // customData round-trips onto transaction.completed. For the Featured
      // plan specifically (a recurring price), Paddle also copies customData
      // onto the Subscription it creates once the transaction completes —
      // that's what lets the cancellation webhook, which only ever sees the
      // Subscription object, know which tool to un-feature.
      customData: { toolId: tool.id, plan: parsed.data.plan },
    });

    const checkoutUrl = transaction.checkout?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: "Paddle didn't return a checkout URL — check your price IDs are correct and active." }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl, toolName: tool.name });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Paddle error";
    return NextResponse.json({ error: `Paddle error: ${message}` }, { status: 500 });
  }
}
