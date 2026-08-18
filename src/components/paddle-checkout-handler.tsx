"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { initializePaddle } from "@paddle/paddle-js";

/**
 * This page is configured as Paddle's "default payment link" (Paddle
 * dashboard → Checkout → Checkout settings). Every checkout.url Paddle
 * generates for a transaction points back here with a `_ptxn=<transactionId>`
 * query parameter appended — Paddle.js, once loaded, automatically detects
 * that parameter and opens an overlay checkout for it. Without this
 * component (i.e. without Paddle.js present at all), that parameter is
 * silently ignored and the page just loads normally — which was exactly the
 * bug: payment links redirected here and appeared to do nothing.
 */
export function PaddleCheckoutHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const transactionId = searchParams.get("_ptxn");
    if (!transactionId) return;

    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!clientToken) {
      console.error("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN isn't set — can't open Paddle checkout.");
      return;
    }

    initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox" ? "sandbox" : "production",
      token: clientToken,
    }).then((paddle) => {
      paddle?.Checkout.open({ transactionId });
    });
  }, [searchParams]);

  return null;
}
