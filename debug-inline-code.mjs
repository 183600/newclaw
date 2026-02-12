// Debug inline code preservation
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test inline code preservation
const text = "Text with `inline code</t>` and outside thinking</t>.";
console.log("Input:", JSON.stringify(text));

// Check code regions
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

function isInsideCode(pos, regions) {
  return regions.some((r) => pos >= r.start && pos < r.end);
}

const codeRegions = findCodeRegions(text);
console.log("\nCode regions:", codeRegions);

// Check what tags are found
const HTML_THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
const matches = [...text.matchAll(HTML_THINKING_TAG_RE)];
console.log("\nHTML tags found:");
for (const match of matches) {
  const idx = match.index ?? 0;
  console.log(`  "${match[0]}" at index ${idx}, isInsideCode: ${isInsideCode(idx, codeRegions)}`);
}

const result = stripReasoningTagsFromText(text);
console.log("\nOutput:", JSON.stringify(result));
console.log("Contains 'inline code</t>':", result.includes("inline code</t>"));
console.log("Contains 'thinking</t>':", result.includes("thinking</t>"));
