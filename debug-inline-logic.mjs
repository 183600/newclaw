// Debug inline code logic
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test inline code detection logic
const text = "Text with `inline code</t>` and outside thinking</t>.";

// Manually implement the logic to debug
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

// Check inline code detection
for (const region of codeRegions) {
  const isInline =
    region.start < text.length &&
    text[region.start] === "`" &&
    region.end > 0 &&
    text[region.end - 1] === "`";
  console.log(`Region [${region.start}, ${region.end}): isInline=${isInline}`);
  if (isInline) {
    console.log(`  Content: "${text.slice(region.start, region.end)}"`);
    console.log(`  Char at start: "${text[region.start]}" at ${region.start}`);
    console.log(`  Char at end-1: "${text[region.end - 1]}" at ${region.end - 1}`);
  }
}

// Check tag positions
const HTML_THINKING_TAG_RE =
  /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;
const matches = [...text.matchAll(HTML_THINKING_TAG_RE)];
console.log("\nTags:");
for (const match of matches) {
  const idx = match.index ?? 0;
  console.log(`  "${match[0]}" at ${idx}`);

  // Check inline code detection
  const isInInlineCode = codeRegions.some((r) => {
    const isInline =
      r.start < text.length && text[r.start] === "`" && r.end > 0 && text[r.end - 1] === "`";
    return isInline && idx >= r.start && idx < r.end;
  });
  console.log(`  isInInlineCode: ${isInInlineCode}`);
}
