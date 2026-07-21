import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return "Custom";
  if (price === 0) return "Free";
  return `$${price}/mo`;
}

export function pricingLabel(model: string) {
  return {
    FREE: "Free",
    FREEMIUM: "Freemium",
    PAID: "Paid",
    ENTERPRISE: "Enterprise",
    OPEN_SOURCE: "Open Source",
  }[model] ?? model;
}

// Always pin a locale for number formatting. Without this, Number.toLocaleString()
// resolves the runtime's ambient locale, which can differ between the Node server
// process and the browser (e.g. "3,120" vs "3 120"), causing a hydration mismatch.
export function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
