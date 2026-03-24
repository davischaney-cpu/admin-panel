import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }

  return stripeClient;
}

export function getStripePriceId(plan?: string | null) {
  switch (plan) {
    case "STARTER":
      return process.env.STRIPE_PRICE_STARTER ?? null;
    case "PRO":
      return process.env.STRIPE_PRICE_PRO ?? null;
    case "TEAM":
      return process.env.STRIPE_PRICE_TEAM ?? null;
    default:
      return null;
  }
}
