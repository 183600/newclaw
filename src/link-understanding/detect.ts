import { DEFAULT_MAX_LINKS } from "./defaults.js";

// Remove markdown link syntax so only bare URLs are considered.
const MARKDOWN_LINK_RE = /\[[^\]]*]\((https?:\/\/\S+?)\)/gi;
const BARE_LINK_RE = /https?:\/\/\S+/gi;

function stripMarkdownLinks(message: string): string {
  return message.replace(MARKDOWN_LINK_RE, " ");
}

// Strip trailing punctuation from URLs
function stripTrailingPunctuation(url: string): string {
  return url.replace(/[.!?,;:)\]}]+$/g, "");
}

function resolveMaxLinks(value?: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  return DEFAULT_MAX_LINKS;
}

function isAllowedUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    if (parsed.hostname === "127.0.0.1") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function extractLinksFromMessage(message: string, opts?: { maxLinks?: number }): string[] {
  const source = message?.trim();
  if (!source) {
    return [];
  }

  const maxLinks = resolveMaxLinks(opts?.maxLinks);
  const sanitized = stripMarkdownLinks(source);
  const seen = new Set<string>();
  const results: string[] = [];

  for (const match of sanitized.matchAll(BARE_LINK_RE)) {
    const raw = match[0]?.trim();
    if (!raw) {
      continue;
    }
    const cleaned = stripTrailingPunctuation(raw);
    if (!cleaned) {
      continue;
    }
    if (!isAllowedUrl(cleaned)) {
      continue;
    }
    if (seen.has(cleaned)) {
      continue;
    }
    seen.add(cleaned);
    results.push(cleaned);
    if (results.length >= maxLinks) {
      break;
    }
  }

  return results;
}
