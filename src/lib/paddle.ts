import { Paddle, Environment } from "@paddle/paddle-node-sdk";

export const paddle = process.env.PADDLE_API_KEY
  ? new Paddle(process.env.PADDLE_API_KEY, {
      // Set PADDLE_ENVIRONMENT="sandbox" while testing, unset (or "production")
      // once you've verified everything against real Paddle sandbox transactions.
      environment: process.env.PADDLE_ENVIRONMENT === "sandbox" ? Environment.sandbox : Environment.production,
    })
  : null;

export function isPaddleConfigured(): boolean {
  return Boolean(process.env.PADDLE_API_KEY && process.env.PADDLE_WEBHOOK_SECRET);
}

/**
 * Creates a Paddle "Transaction as a payment link" for ONE specific tool.
 * Shared by the admin checkout route and the vendor-claim approval flow.
 * Same customData contract as /api/checkout, so /api/webhooks/paddle works
 * unchanged.
 */
export async function createToolCheckout(toolId: string, plan: "featured" | "verified"): Promise<string> {
  if (!isPaddleConfigured() || !paddle) {
    throw new Error("Paddle isn't configured — set PADDLE_API_KEY and PADDLE_WEBHOOK_SECRET.");
  }
  const priceId = plan === "featured" ? process.env.PADDLE_FEATURED_PRICE_ID : process.env.PADDLE_VERIFIED_PRICE_ID;
  if (!priceId) throw new Error(`Missing PADDLE_${plan.toUpperCase()}_PRICE_ID.`);

  const transaction = await paddle.transactions.create({
    items: [{ priceId, quantity: 1 }],
    customData: { toolId, plan },
  });
  const url = transaction.checkout?.url;
  if (!url) throw new Error("Paddle didn't return a checkout URL — check the price IDs are correct and active.");
  return url;
}
