import Anthropic from "@anthropic-ai/sdk";

// Deliberately narrow — only fields safe enough to ever auto-apply without a
// human looking at it first. Adding a field here means it becomes eligible
// for the auto-apply path in the cron route, not just admin-approved review,
// so keep this list short and each field genuinely low-risk.
export type SuggestedUpdates = {
  startingPrice?: number;
  tagline?: string;
};

export type ChangeAnalysis = {
  hasSubstantiveChange: boolean;
  summary: string;
  changeType: "pricing" | "features" | "rebrand" | "shutdown" | "other";
  confidence: number; // 0–1
  suggestedUpdates: SuggestedUpdates | null;
};

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const SYSTEM_PROMPT = `You compare two versions of text extracted from an AI tool's official website, fetched directly from that tool's own domain. Both versions are already verified as coming from the primary source — your job is only to determine whether the change is substantive (not just boilerplate/date/cookie-banner noise) and to summarize it factually.

Respond with ONLY a JSON object, no markdown fences, no prose:
{
  "hasSubstantiveChange": boolean,
  "summary": "one or two factual sentences describing what changed",
  "changeType": "pricing" | "features" | "rebrand" | "shutdown" | "other",
  "confidence": number between 0 and 1,
  "suggestedUpdates": { "startingPrice": number } | { "tagline": "..." } | null
}

Rules:
- confidence reflects how certain you are the change is real and correctly interpreted, not how important it is.
- Only include "suggestedUpdates" for narrow, unambiguous, low-risk fields: startingPrice (a plain number, no currency symbol) or tagline. Never suggest updates to description, features, pros, or cons — those need human judgment even when confidence is high.
- If the difference is just navigation, footer, cookie notices, or a changed date/timestamp with no real content change, set hasSubstantiveChange to false.
- If pricing appears to have changed, set changeType to "pricing" and include startingPrice in suggestedUpdates if you can confidently extract a single new number.
- If the page suggests the product has shut down or been acquired/renamed, use "shutdown" or "rebrand" and set confidence lower unless very explicit — this category always gets human review regardless of confidence.`;

/**
 * Analyzes the diff between two already-fetched, already-verified snapshots
 * from the tool's own official source. Returns null (rather than throwing)
 * if the API isn't configured or the call fails — callers should treat that
 * as "needs human review" rather than silently dropping the detected change.
 */
export async function analyzeChange(params: {
  toolName: string;
  sourceUrl: string;
  previousContent: string;
  newContent: string;
}): Promise<ChangeAnalysis | null> {
  if (!client) return null;

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Tool: ${params.toolName}\nSource: ${params.sourceUrl}\n\n--- PREVIOUS VERSION ---\n${params.previousContent}\n\n--- CURRENT VERSION ---\n${params.newContent}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const parsed = JSON.parse(textBlock.text.trim()) as ChangeAnalysis;

    // Defensive clamping — never trust a model's numeric output blindly.
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));

    // The prompt asks the model to only suggest startingPrice/tagline, but
    // that's an instruction, not a guarantee — enforce it here too, since
    // this is what ultimately gets passed to a Prisma update. Anything else
    // (unexpected keys, wrong types) is dropped rather than trusted.
    parsed.suggestedUpdates = sanitizeSuggestedUpdates(parsed.suggestedUpdates);

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Strips the LLM's suggestedUpdates down to only the known-safe keys, with
 * the correct runtime type for each — this is the actual enforcement of "only
 * narrow, low-risk fields," not the prompt text. Unexpected keys, wrong
 * types, or empty results in null (nothing to apply).
 */
function sanitizeSuggestedUpdates(raw: unknown): SuggestedUpdates | null {
  if (!raw || typeof raw !== "object") return null;

  const result: SuggestedUpdates = {};
  const input = raw as Record<string, unknown>;

  if (typeof input.startingPrice === "number" && Number.isFinite(input.startingPrice) && input.startingPrice >= 0) {
    result.startingPrice = input.startingPrice;
  }
  if (typeof input.tagline === "string" && input.tagline.trim().length > 0 && input.tagline.length <= 140) {
    result.tagline = input.tagline.trim();
  }

  return Object.keys(result).length > 0 ? result : null;
}
