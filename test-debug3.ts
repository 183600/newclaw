import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 添加调试日志
const originalFunction = stripReasoningTagsFromText;

// 重新实现函数以添加调试
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)/i;
const FINAL_TAG_RE = /<\s*\/?\s*final\b[^<>]*>/gi;
const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

function findCodeRegions(text: string): Array<{ start: number; end: number }> {
  const regions: Array<{ start: number; end: number }> = [];

  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = (match.index ?? 0) + match[1].length;
    regions.push({ start, end: start + match[0].length - match[1].length });
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

function isInsideCode(pos: number, regions: Array<{ start: number; end: number }>): boolean {
  return regions.some((r) => pos >= r.start && pos < r.end);
}

function applyTrim(value: string, mode: "none" | "start" | "both"): string {
  if (mode === "none") {
    return value;
  }
  if (mode === "start") {
    return value.trimStart();
  }
  return value.trim();
}

function debugStripReasoningTagsFromText(
  text: string,
  options?: {
    mode?: "strict" | "preserve";
    trim?: "none" | "start" | "both";
  },
): string {
  console.log("\n=== DEBUG stripReasoningTagsFromText ===");
  console.log("Input:", JSON.stringify(text));

  if (!text) {
    console.log("Empty input, returning");
    return text;
  }

  if (!QUICK_TAG_RE.test(text)) {
    console.log("QUICK_TAG_RE does not match, returning original");
    return text;
  }

  const mode = options?.mode ?? "strict";
  const trimMode = options?.trim ?? "both";
  console.log("Mode:", mode, "Trim:", trimMode);

  let cleaned = text;

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");

  // First handle final tags
  if (FINAL_TAG_RE.test(cleaned)) {
    console.log("Found final tags");
    // ... (省略 final 标签处理)
  }

  // Now handle thinking tags
  const codeRegions = findCodeRegions(cleaned);
  console.log("Code regions:", codeRegions);

  const thinkingRanges: Array<{ start: number; end: number }> = [];
  let stack: Array<{ start: number; type: "html" | "special" }> = [];

  // Find all HTML thinking tags
  console.log("\n--- Finding HTML thinking tags ---");
  THINKING_TAG_RE.lastIndex = 0;
  for (const match of cleaned.matchAll(THINKING_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[1] === "/";
    console.log(`Found tag: ${JSON.stringify(match[0])} at ${idx}, isClose: ${isClose}`);

    if (isInsideCode(idx, codeRegions)) {
      console.log("  Inside code, skipping");
      continue;
    }

    if (!isClose) {
      stack.push({ start: idx, type: "html" });
      console.log("  Pushed to stack");
    } else if (stack.length > 0 && stack[stack.length - 1].type === "html") {
      const open = stack.pop()!;
      thinkingRanges.push({
        start: open.start,
        end: idx + match[0].length,
      });
      console.log("  Matched with open tag, added range");
    } else {
      // Handle unmatched closing tags - remove them
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
      console.log("  Unmatched closing tag, added range");
    }
  }

  console.log("\nStack after processing:", stack);
  console.log("Thinking ranges after HTML:", thinkingRanges);

  // Handle unclosed thinking tags
  if (stack.length > 0) {
    console.log("\n--- Handling unclosed tags ---");
    if (mode === "preserve") {
      console.log("  Preserve mode");
      // ... (省略 preserve 处理)
    } else if (mode === "strict") {
      console.log("  Strict mode");
      // ... (省略 strict 处理)
    }
  }

  // Also handle special case: word followed by closing tag
  console.log("\n--- Handling unpaired word tags ---");
  const unpairedWordTagRe = /\b(thinking|thought|antthinking)<\/\1>/gi;
  for (const match of cleaned.matchAll(unpairedWordTagRe)) {
    const idx = match.index ?? 0;
    console.log(`Found unpaired: ${JSON.stringify(match[0])} at ${idx}`);
    if (!isInsideCode(idx, codeRegions)) {
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
      console.log("  Added range for unpaired word tag");
    }
  }

  console.log("\nFinal thinking ranges:", thinkingRanges);

  // Sort ranges by start position
  thinkingRanges.sort((a, b) => a.start - b.start);

  // Remove thinking ranges in reverse order to maintain indices
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    console.log(
      `Removing range [${range.start}, ${range.end}): ${JSON.stringify(cleaned.slice(range.start, range.end))}`,
    );
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  }

  console.log("\nBefore trim:", JSON.stringify(cleaned));
  const result = applyTrim(cleaned, trimMode);
  console.log("After trim:", JSON.stringify(result));
  console.log("=== END DEBUG ===\n");

  return result;
}

// 测试
const text = "Before This is thinking</thinking> after.";
const result = debugStripReasoningTagsFromText(text);
console.log("Expected:", JSON.stringify("Before  after."));
console.log("Actual:", JSON.stringify(result));
console.log("Match:", result === "Before  after.");
