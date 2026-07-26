import { createHash } from "node:crypto";
import { convert } from "html-to-text";

// Cap how much text we store/send to the LLM per source — keeps snapshot
// storage and per-run AI cost bounded regardless of how large a page is.
const MAX_CONTENT_CHARS = 8000;

export type FetchedContent = {
  content: string;
  contentHash: string;
};

/**
 * Fetches a URL and reduces it to normalized, readable plain text — this is
 * what gets diffed and stored, not raw HTML. Deliberately conservative: any
 * fetch/parse failure returns null rather than throwing, since one broken
 * source shouldn't fail the whole discovery batch.
 */
export async function fetchAndExtract(url: string): Promise<FetchedContent | null> {
  try {
    const res = await fetch(url, {
      headers: {
        // Identify honestly rather than spoofing a browser — most sites are
        // fine with a clearly-labeled bot fetching public marketing pages;
        // spoofing invites exactly the kind of ToS problems worth avoiding.
        "User-Agent": "TheAIOfficeBot/1.0 (+https://www.the-ai-office.com/about)",
      },
      // Serverless function time limits are the real constraint here, not
      // this timeout — but don't let one slow site eat the whole batch's budget.
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;

    const html = await res.text();
    const text = convert(html, {
      wordwrap: false,
      selectors: [
        { selector: "script", format: "skip" },
        { selector: "style", format: "skip" },
        { selector: "nav", format: "skip" },
        { selector: "footer", format: "skip" },
        { selector: "img", format: "skip" },
        { selector: "a", options: { ignoreHref: true } },
      ],
    })
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_CONTENT_CHARS);

    if (text.length < 50) return null; // suspiciously empty — likely JS-rendered or blocked

    return { content: text, contentHash: hashContent(text) };
  } catch {
    return null;
  }
}

export function hashContent(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
