import { prisma } from "@/lib/prisma";

export const DEFAULT_MODEL = "claude-sonnet-5-5";

/** Models sometimes wrap JSON in ``` fences despite instructions — strip them before parsing. */
export function parseModelJson<T>(text: string): T {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned) as T;
}

/**
 * Last line of defense before a post goes live without a human: reject output
 * that is too short, looks like leftover template/placeholder text, or doesn't
 * actually mention the real tools it was supposed to be about.
 */
export function passesPublishChecks(content: string, mustMention: string[], minWords = 180): boolean {
  const words = content.trim().split(/\s+/).length;
  if (words < minWords) return false;
  if (/\[(insert|todo|tbd|placeholder)[^\]]*\]|lorem ipsum/i.test(content)) return false;
  const lower = content.toLowerCase();
  const mentioned = mustMention.filter((n) => lower.includes(n.toLowerCase())).length;
  return mentioned >= Math.min(2, mustMention.length);
}

export async function slugExists(slug: string): Promise<boolean> {
  return (await prisma.article.count({ where: { slug } })) > 0;
}
