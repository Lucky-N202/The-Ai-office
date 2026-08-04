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
