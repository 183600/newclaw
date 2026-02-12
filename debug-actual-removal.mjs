// Debug actual removal in the function
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Monkey patch the function to add debugging
const originalFunction = stripReasoningTagsFromText;

function debugStripReasoningTagsFromText(text, options) {
  console.log("\n=== DEBUG FUNCTION START ===");
  console.log("Input:", repr(text));

  if (!text) {
    return text;
  }

  const mode = options?.mode ?? "strict";
  const trimMode = options?.trim ?? "both";

  console.log("Mode:", mode, "Trim:", trimMode);

  let cleaned = text;

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/antthinking&#x111;/g, "antthinkingđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");
  cleaned = cleaned.replace(/&#x110;antthinking/g, "Đantthinking");

  // Find code regions first
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

  const codeRegions = findCodeRegions(cleaned);
  console.log("Code regions:", codeRegions);

  const rangesToRemove = [];

  // Handle word + HTML close tags
  const WORD_HTML_CLOSE_RE =
    /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
  WORD_HTML_CLOSE_RE.lastIndex = 0;
  for (const match of cleaned.matchAll(WORD_HTML_CLOSE_RE)) {
    const idx = match.index ?? 0;
    if (!isInsideCode(idx, codeRegions)) {
      console.log(`Adding range: ${idx}-${idx + match[0].length} "${match[0]}"`);
      rangesToRemove.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  console.log("Ranges to remove:", rangesToRemove);

  // Sort ranges by start position
  rangesToRemove.sort((a, b) => a.start - b.start);

  // Remove ranges in reverse order to maintain indices
  for (let i = rangesToRemove.length - 1; i >= 0; i--) {
    const range = rangesToRemove[i];
    console.log(
      `Removing range ${range.start}-${range.end}: "${cleaned.slice(range.start, range.end)}"`,
    );
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
    console.log("Text after removal:", repr(cleaned));
  }

  // Apply trim
  function applyTrim(value, mode) {
    if (mode === "none") {
      return value;
    }
    if (mode === "start") {
      return value.trimStart();
    }
    return value.trim();
  }

  const finalResult = applyTrim(cleaned, trimMode);
  console.log("After trim:", repr(finalResult));
  console.log("=== DEBUG FUNCTION END ===\n");

  return finalResult;
}

function repr(s) {
  return JSON.stringify(s);
}

// Test
const text1 = "Before This is thinking</thinking> after.";
console.log("=== TEST ===");
const result = debugStripReasoningTagsFromText(text1);
console.log("Final result:", repr(result));
console.log("Expected:", repr("Before  after."));
console.log("Match:", result === "Before  after.");
