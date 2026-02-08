import type { MarkdownTableMode } from "../config/types.base.js";
import {
  chunkMarkdownIR,
  markdownToIR,
  type MarkdownLinkSpan,
  type MarkdownIR,
} from "../markdown/ir.js";
import { renderMarkdownWithMarkers } from "../markdown/render.js";

export type TelegramFormattedChunk = {
  html: string;
  text: string;
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeHtmlAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, "&quot;");
}

function buildTelegramLink(link: MarkdownLinkSpan, _text: string) {
  const href = link.href.trim();
  if (!href) {
    return null;
  }
  if (link.start === link.end) {
    return null;
  }
  const safeHref = escapeHtmlAttr(href);
  return {
    start: link.start,
    end: link.end,
    open: `<a href="${safeHref}">`,
    close: "</a>",
  };
}

function renderTelegramHtml(ir: MarkdownIR): string {
  const text = ir.text ?? "";
  if (!text) {
    return "";
  }

  const styleMarkers = {
    bold: { open: "<b>", close: "</b>" },
    italic: { open: "<i>", close: "</i>" },
    strikethrough: { open: "<s>", close: "</s>" },
    code: { open: "<code>", close: "</code>" },
    code_block: { open: "<pre><code>", close: "</code></pre>" },
  };

  // Create a list of all positions where something changes
  const positions = new Set<number>();
  positions.add(0);
  positions.add(text.length);

  for (const span of ir.styles) {
    if (span.start === span.end) {
      continue;
    }
    positions.add(span.start);
    positions.add(span.end);
  }

  // Handle links
  const links: ReturnType<typeof buildTelegramLink>[] = [];
  for (const link of ir.links) {
    if (link.start === link.end) {
      continue;
    }
    const rendered = buildTelegramLink(link, text);
    if (!rendered) {
      continue;
    }
    positions.add(rendered.start);
    positions.add(rendered.end);
    links.push(rendered);
  }

  const sortedPositions = [...positions].toSorted((a, b) => a - b);

  // Process each segment
  let result = "";
  const openStyles: typeof ir.styles = [];
  const openLinks: typeof links = [];

  for (let i = 0; i < sortedPositions.length - 1; i++) {
    const pos = sortedPositions[i];
    const nextPos = sortedPositions[i + 1];

    // Determine what closes at this position
    const closingStyles = openStyles.filter((style) => style.end === pos);
    const closingLinks = openLinks.filter((link) => link.end === pos);

    if (closingStyles.length > 0 && closingLinks.length > 0) {
      // Check nesting relationships for closing
      let styleContainsLinks = false;
      let linkContainsStyles = false;
      let exactOverlap = false;

      for (const style of closingStyles) {
        for (const link of closingLinks) {
          if (style.start === link.start && style.end === link.end) {
            exactOverlap = true;
          } else if (style.start <= link.start && style.end >= link.end) {
            styleContainsLinks = true;
          } else if (link.start <= style.start && link.end >= style.end) {
            linkContainsStyles = true;
          }
        }
      }

      if (exactOverlap) {
        // Exact overlap: links should be outer, so close styles first then links
        for (let j = openStyles.length - 1; j >= 0; j--) {
          if (openStyles[j].end === pos) {
            const marker = styleMarkers[openStyles[j].style];
            if (marker) {
              result += marker.close;
            }
            openStyles.splice(j, 1);
          }
        }
        for (let j = openLinks.length - 1; j >= 0; j--) {
          if (openLinks[j].end === pos) {
            result += openLinks[j].close;
            openLinks.splice(j, 1);
          }
        }
      } else if (linkContainsStyles) {
        // Links contain styles, close styles first then links
        for (let j = openStyles.length - 1; j >= 0; j--) {
          if (openStyles[j].end === pos) {
            const marker = styleMarkers[openStyles[j].style];
            if (marker) {
              result += marker.close;
            }
            openStyles.splice(j, 1);
          }
        }
        for (let j = openLinks.length - 1; j >= 0; j--) {
          if (openLinks[j].end === pos) {
            result += openLinks[j].close;
            openLinks.splice(j, 1);
          }
        }
      } else {
        // Style contains links, close links first then styles
        for (let j = openLinks.length - 1; j >= 0; j--) {
          if (openLinks[j].end === pos) {
            result += openLinks[j].close;
            openLinks.splice(j, 1);
          }
        }
        for (let j = openStyles.length - 1; j >= 0; j--) {
          if (openStyles[j].end === pos) {
            const marker = styleMarkers[openStyles[j].style];
            if (marker) {
              result += marker.close;
            }
            openStyles.splice(j, 1);
          }
        }
      }
    } else {
      // Close styles that end at this position
      for (let j = openStyles.length - 1; j >= 0; j--) {
        if (openStyles[j].end === pos) {
          const marker = styleMarkers[openStyles[j].style];
          if (marker) {
            result += marker.close;
          }
          openStyles.splice(j, 1);
        }
      }

      // Close links that end at this position
      for (let j = openLinks.length - 1; j >= 0; j--) {
        if (openLinks[j].end === pos) {
          result += openLinks[j].close;
          openLinks.splice(j, 1);
        }
      }
    }

    // Determine what to open at this position
    const openingStyles = ir.styles.filter((span) => span.start === pos);
    const openingLinks = links.filter((link) => link.start === pos);

    // Special handling for overlapping styles and links
    if (openingStyles.length > 0 && openingLinks.length > 0) {
      // Check if styles completely contain links or links completely contain styles
      let styleContainsLinks = false;
      let linkContainsStyles = false;
      let exactOverlap = false;

      for (const style of openingStyles) {
        for (const link of openingLinks) {
          if (style.start === link.start && style.end === link.end) {
            exactOverlap = true;
          } else if (style.start <= link.start && style.end >= link.end) {
            styleContainsLinks = true;
          } else if (link.start <= style.start && link.end >= style.end) {
            linkContainsStyles = true;
          }
        }
      }

      if (exactOverlap) {
        // When styles and links exactly overlap, links should be outer
        for (const link of openingLinks) {
          result += link.open;
          openLinks.push(link);
        }
        for (const style of openingStyles) {
          const marker = styleMarkers[style.style];
          if (marker) {
            result += marker.open;
            openStyles.push(style);
          }
        }
      } else if (styleContainsLinks && !linkContainsStyles) {
        // Style contains links, style should be outer
        for (const style of openingStyles) {
          const marker = styleMarkers[style.style];
          if (marker) {
            result += marker.open;
            openStyles.push(style);
          }
        }
        for (const link of openingLinks) {
          result += link.open;
          openLinks.push(link);
        }
      } else {
        // Links contain styles or complex overlap, links should be outer
        for (const link of openingLinks) {
          result += link.open;
          openLinks.push(link);
        }
        for (const style of openingStyles) {
          const marker = styleMarkers[style.style];
          if (marker) {
            result += marker.open;
            openStyles.push(style);
          }
        }
      }
    } else {
      // Open links that start at this position
      for (const link of openingLinks) {
        result += link.open;
        openLinks.push(link);
      }

      // Open styles that start at this position
      for (const span of openingStyles) {
        const marker = styleMarkers[span.style];
        if (marker) {
          result += marker.open;
          openStyles.push(span);
        }
      }
    }

    // Add text content between this position and the next
    if (nextPos > pos) {
      const segment = text.slice(pos, nextPos);
      result += escapeHtml(segment);
    }
  }

  // Close any remaining styles and links
  for (let j = openLinks.length - 1; j >= 0; j--) {
    result += openLinks[j].close;
  }

  for (let j = openStyles.length - 1; j >= 0; j--) {
    const marker = styleMarkers[openStyles[j].style];
    if (marker) {
      result += marker.close;
    }
  }

  return result;
}

export function markdownToTelegramHtml(
  markdown: string,
  options: { tableMode?: MarkdownTableMode } = {},
): string {
  const ir = markdownToIR(markdown ?? "", {
    linkify: true,
    headingStyle: "none",
    blockquotePrefix: "",
    tableMode: options.tableMode,
  });
  return renderTelegramHtml(ir);
}

export function renderTelegramHtmlText(
  text: string,
  options: { textMode?: "markdown" | "html"; tableMode?: MarkdownTableMode } = {},
): string {
  const textMode = options.textMode ?? "markdown";
  if (textMode === "html") {
    return text;
  }
  return markdownToTelegramHtml(text, { tableMode: options.tableMode });
}

export function markdownToTelegramChunks(
  markdown: string,
  limit: number,
  options: { tableMode?: MarkdownTableMode } = {},
): TelegramFormattedChunk[] {
  const ir = markdownToIR(markdown ?? "", {
    linkify: true,
    headingStyle: "none",
    blockquotePrefix: "",
    tableMode: options.tableMode,
  });
  const chunks = chunkMarkdownIR(ir, limit);
  return chunks.map((chunk) => ({
    html: renderTelegramHtml(chunk),
    text: chunk.text,
  }));
}

export function markdownToTelegramHtmlChunks(markdown: string, limit: number): string[] {
  return markdownToTelegramChunks(markdown, limit).map((chunk) => chunk.html);
}
