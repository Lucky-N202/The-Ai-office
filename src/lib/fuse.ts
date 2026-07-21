import Fuse, { type IFuseOptions } from "fuse.js";
import type { ToolSummary } from "@/types";

export const toolSearchOptions: IFuseOptions<ToolSummary> = {
  keys: [
    { name: "name", weight: 0.5 },
    { name: "tagline", weight: 0.3 },
    { name: "tags", weight: 0.15 },
    { name: "category.name", weight: 0.05 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export function createToolFuse(tools: ToolSummary[]) {
  return new Fuse(tools, toolSearchOptions);
}
