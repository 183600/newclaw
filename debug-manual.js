import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test with debug
const test1 = "Before This is thinking</t> after.";
console.log("Test 1:", test1);

// Let's manually check the logic
const QUICK_TAG_RE =
  /<\s*\/\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[đĐ]|(?:Đ)(?:thinking|thought|antthinking)/i;

if (!QUICK_TAG_RE.test(test1)) {
  console.log("QUICK_TAG_RE does not match, returning original");
} else {
  console.log("QUICK_TAG_RE matches, processing...");

  const codeRegions = [];
  const thinkingRanges = [];

  const unpairedWordTagRe =
    /\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;
  const matches = [...test1.matchAll(unpairedWordTagRe)];
  console.log("Matches found:", matches);

  for (const match of matches) {
    const idx = match.index ?? 0;
    console.log("Processing match at index", idx, ":", match[0]);

    // Check if inside code
    const isInsideCode = codeRegions.some((r) => idx >= r.start && idx < r.end);
    console.log("Is inside code:", isInsideCode);

    if (!isInsideCode) {
      // Find the start of the word
      let startIdx = idx;
      // Skip space before the word
      while (startIdx > 0 && test1[startIdx - 1] === " ") {
        startIdx--;
      }
      // Find the start of the word
      while (startIdx > 0 && test1[startIdx - 1] !== " " && test1[startIdx - 1] !== "\n") {
        startIdx--;
      }
      // If we stopped at a space, move forward to get the actual word start
      if (startIdx > 0 && test1[startIdx] === " ") {
        startIdx++;
      }

      console.log("Will remove from", startIdx, "to", idx + match[0].length);
      console.log("Text to remove:", test1.substring(startIdx, idx + match[0].length));

      thinkingRanges.push({
        start: startIdx,
        end: idx + match[0].length,
      });
    }
  }

  console.log("Thinking ranges:", thinkingRanges);

  // Apply removals
  let cleaned = test1;
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  }

  console.log("Result:", cleaned);
}
