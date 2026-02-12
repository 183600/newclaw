// Debug inline code detection
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test inline code detection
const text = "Text with `inline code</t>` and outside thinking</t>.";

// Copy the detection logic from the function
function findCodeRegions(text) {
  const regions = [];
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
  }
  const inlineRe = /`+[^`]+`+/g;
  for (const match of text.matchAll(inlineRe)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const insideFenced = regions.some((r) => start >= r.start && end <= r.end);
    if (!insideFenced) {
      regions.push({ start, end });
    }
  }
  regions.sort((a, b) => a.start - b.start);
  return regions;
}

const codeRegions = findCodeRegions(text);
console.log("Code regions:", codeRegions);

// Check the tag position
const HTML_THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)(?:\b[^<>]*>|>)/gi;
const matches = [...text.matchAll(HTML_THINKING_TAG_RE)];
console.log("\nTags found:");
for (const match of matches) {
  const idx = match.index ?? 0;
  console.log(`  "${match[0]}" at ${idx}`);

  // Check if it's in any code region
  const inCodeRegion = codeRegions.some((r) => idx >= r.start && idx < r.end);
  console.log(`  In code region: ${inCodeRegion}`);

  // Check if it's in inline code specifically
  const isInInlineCode = codeRegions.some((r) => {
    const isInline =
      r.start > 0 && text[r.start - 1] === "`" && r.end < text.length && text[r.end] === "`";
    return isInline && idx >= r.start && idx < r.end;
  });
  console.log(`  In inline code: ${isInInlineCode}`);
}
