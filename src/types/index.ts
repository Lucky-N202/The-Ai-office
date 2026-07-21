import type { Category, PricingModel, Tool } from "@prisma/client";

export type ToolSummary = Tool & { category: Pick<Category, "id" | "name" | "slug" | "color" | "icon"> };

export type ToolWithCategory = Tool & { category: Category };

export type { Category, Tool, PricingModel };
