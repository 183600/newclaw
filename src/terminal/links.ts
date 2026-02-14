import { formatTerminalLink } from "../utils.js";

export const DOCS_ROOT = "https://docs.openclaw.ai";

export function formatDocsLink(
  path: string,
  label?: string,
  opts?: { fallback?: string; force?: boolean },
): string {
  const trimmed = path.trim();

  // Handle different URL types
  let url: string;
  if (trimmed.startsWith("http")) {
    // Absolute URL
    url = trimmed;
  } else if (trimmed.startsWith("//")) {
    // Protocol-relative URL
    url = trimmed;
  } else {
    // Relative path
    url = `${DOCS_ROOT}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  }

  // Determine the label
  let linkLabel: string;
  if (label !== undefined) {
    // Custom label provided
    linkLabel = label;
  } else if (!trimmed) {
    // Empty or whitespace-only path, use the full URL as label
    linkLabel = url;
  } else if (trimmed.startsWith("http") || trimmed.startsWith("//")) {
    // Absolute or protocol-relative URL, use the URL as label
    linkLabel = url;
  } else if (trimmed.startsWith("/")) {
    // Relative path with leading slash, use the path as label
    linkLabel = trimmed;
  } else {
    // Relative path without leading slash, use the full URL as label
    linkLabel = url;
  }

  return formatTerminalLink(linkLabel, url, {
    fallback: opts?.fallback ?? url,
    force: opts?.force,
  });
}

export function formatDocsRootLink(label?: string): string {
  return formatTerminalLink(label ?? DOCS_ROOT, DOCS_ROOT, {
    fallback: DOCS_ROOT,
  });
}
