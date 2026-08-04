import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { EventName } from "@paddle/paddle-node-sdk";
import { prisma } from "@/lib/prisma";
import { paddle } from "@/lib/paddle";

async function applyToTool(toolId: string, data: { featured?: boolean; verified?: boolean }) {
  const tool = await prisma.tool.update({ where: { id: toolId }, data }).catch(() => null);
  if (!tool) return; // tool may have been deleted since purchase — nothing to apply
  revalidatePath(`/browse/tools/${tool.slug}`);
  revalidatePath(`/browse/categories/${tool.categoryId}`);
  revalidatePath("/");
}

export async function POST(req: NextRequest) {
  if (!paddle || !process.env.PADDLE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Paddle not configured" }, { status: 400 });
  }

  // Signature verification requires the raw, unparsed request body — do not
  // call req.json() before this, it would consume the body and break verification.
  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let eventData;
  try {
    eventData = await paddle.webhooks.unmarshal(rawBody, process.env.PADDLE_WEBHOOK_SECRET, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!eventData) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (eventData.eventType) {
    case EventName.TransactionCompleted: {
      const transaction = eventData.data;
      const customData = transaction.customData as { toolId?: string; plan?: string } | null;
      if (!customData?.toolId || !customData?.plan) break;

      if (customData.plan === "featured") await applyToTool(customData.toolId, { featured: true });
      if (customData.plan === "verified") await applyToTool(customData.toolId, { verified: true });
      break;
    }

    // Subscription fully ended (canceled, or payment retries exhausted —
    // configure retry/dunning behavior in Paddle's own dashboard settings).
    // This only affects Featured (a subscription); Verified is a one-time
    // purchase with nothing to expire.
    case EventName.SubscriptionCanceled: {
      const subscription = eventData.data;
      const customData = subscription.customData as { toolId?: string; plan?: string } | null;
      if (customData?.toolId && customData?.plan === "featured") {
        await applyToTool(customData.toolId, { featured: false });
      }
      break;
    }

    default:
      break; // ignore every other event type we don't act on
  }

  return NextResponse.json({ received: true });
}
