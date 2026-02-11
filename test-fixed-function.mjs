// Let's create a fixed version of the function
const FIXED_QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:\w+)[đĐ]|(?:Đ)(?:\w+)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/i;

function findCodeRegions(text) {
  const regions = [];
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

function isInsideCode(pos, regions) {
  return regions.some((r) => pos >= r.start && pos < r.end);
}

function fixedStripReasoningTagsFromText(text, options) {
  if (!text) {
    return text;
  }
  if (!FIXED_QUICK_TAG_RE.test(text)) {
    return text;
  }

  const mode = options?.mode ?? "strict";
  const trimMode = options?.trim ?? "both";

  let cleaned = text;

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");

  // First handle final tags
  const FINAL_TAG_RE = /<\s*\/?\s*final\b[^<>]*>/gi;
  if (FINAL_TAG_RE.test(cleaned)) {
    FINAL_TAG_RE.lastIndex = 0;
    const preCodeRegions = findCodeRegions(cleaned);
    const finalRanges = [];
    let stack = [];

    for (const match of cleaned.matchAll(FINAL_TAG_RE)) {
      const idx = match.index ?? 0;
      const isClose = match[0].includes("</final");

      if (isInsideCode(idx, preCodeRegions)) {
        continue;
      }

      if (!isClose) {
        stack.push({ start: idx });
      } else if (stack.length > 0) {
        const open = stack.pop();
        finalRanges.push({
          start: open.start,
          end: idx + match[0].length,
        });
      }
    }

    // Remove final ranges in reverse order to maintain indices
    for (let i = finalRanges.length - 1; i >= 0; i--) {
      const range = finalRanges[i];
      cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
    }
  } else {
    FINAL_TAG_RE.lastIndex = 0;
  }

  // Now handle thinking tags
  const codeRegions = findCodeRegions(cleaned);
  const thinkingRanges = [];
  let stack = [];

  // Find all HTML thinking tags
  const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
  THINKING_TAG_RE.lastIndex = 0;
  for (const match of cleaned.matchAll(THINKING_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[1] === "/";

    if (isInsideCode(idx, codeRegions)) {
      continue;
    }

    if (!isClose) {
      stack.push({ start: idx, type: "html" });
    } else if (stack.length > 0 && stack[stack.length - 1].type === "html") {
      const open = stack.pop();
      thinkingRanges.push({
        start: open.start,
        end: idx + match[0].length,
      });
    }
  }

  // Find all special character thinking tags (including arbitrary words)
  let i = 0;
  while (i < cleaned.length) {
    // Check for special character opening tags (Đword)
    if (cleaned[i] === "\u0110" && i + 1 < cleaned.length) {
      // Find the word after Đ
      let wordEnd = i + 1;
      while (wordEnd < cleaned.length && /[a-zA-Z]/.test(cleaned[wordEnd])) {
        wordEnd++;
      }
      if (wordEnd > i + 1) {
        if (!isInsideCode(i, codeRegions)) {
          stack.push({ start: i, type: "special" });
        }
        i = wordEnd;
        continue;
      }
    }

    // Check for special character closing tags (wordđ)
    if (i > 0 && cleaned[i] === "\u0111") {
      // Find the word before đ
      let wordStart = i - 1;
      while (wordStart >= 0 && /[a-zA-Z]/.test(cleaned[wordStart])) {
        wordStart--;
      }
      wordStart++;

      if (wordStart < i) {
        if (!isInsideCode(wordStart, codeRegions)) {
          // Find the matching opening tag
          let found = false;
          for (let j = stack.length - 1; j >= 0; j--) {
            if (stack[j].type === "special") {
              const open = stack.splice(j, 1)[0];
              thinkingRanges.push({
                start: open.start,
                end: i + 1,
              });
              found = true;
              break;
            }
          }
          // Handle unmatched closing special tags
          if (!found) {
            thinkingRanges.push({
              start: wordStart,
              end: i + 1,
            });
          }
        }
        i++;
        continue;
      }
    }

    i++;
  }

  // Handle unclosed thinking tags
  if (stack.length > 0) {
    if (mode === "preserve") {
      // In preserve mode, only return the content of unclosed tags
      let result = "";
      for (const open of stack) {
        if (open.type === "special") {
          // For special char tags, content starts after the tag word
          let wordEnd = open.start + 1;
          while (wordEnd < cleaned.length && /[a-zA-Z]/.test(cleaned[wordEnd])) {
            wordEnd++;
          }
          const contentStart = wordEnd;
          result += cleaned.slice(contentStart);
        } else {
          // For HTML tags, find the end of the opening tag
          const tagMatch = cleaned.slice(open.start).match(/^<[^>]*>/);
          if (tagMatch) {
            const contentStart = open.start + tagMatch[0].length;
            result += cleaned.slice(contentStart);
          }
        }
      }
      return cleaned.trim(); // Apply trim at the end
    } else if (mode === "strict") {
      // In strict mode, remove unclosed tags and their content
      for (const open of stack) {
        if (open.type === "special") {
          // For special char tags, remove from start to end of line or document
          const remainingContent = cleaned.slice(open.start);
          const newlineIndex = remainingContent.indexOf("\n");

          if (newlineIndex !== -1) {
            thinkingRanges.push({
              start: open.start,
              end: open.start + newlineIndex,
            });
          } else {
            thinkingRanges.push({
              start: open.start,
              end: cleaned.length,
            });
          }
        } else {
          // For HTML tags, find the end of the opening tag
          const tagMatch = cleaned.slice(open.start).match(/^<[^>]*>/);
          if (tagMatch) {
            const tagEnd = open.start + tagMatch[0].length;
            // Look for a newline after the tag content
            const remainingContent = cleaned.slice(tagEnd);
            const newlineIndex = remainingContent.indexOf("\n");

            if (newlineIndex !== -1) {
              // If there's a newline, remove only up to the newline
              thinkingRanges.push({
                start: open.start,
                end: tagEnd + newlineIndex,
              });
            } else {
              // If no newline, remove everything from the tag start
              thinkingRanges.push({
                start: open.start,
                end: cleaned.length,
              });
            }
          } else {
            // If we can't find the tag end, remove everything from start
            thinkingRanges.push({
              start: open.start,
              end: cleaned.length,
            });
          }
        }
      }
    }
  }

  // Also handle special case: word followed by closing tag (e.g., "thinking</thinking>" or "thinking</t>")
  const unpairedWordTagRe =
    /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;
  for (const match of cleaned.matchAll(unpairedWordTagRe)) {
    const idx = match.index ?? 0;
    if (!isInsideCode(idx, codeRegions)) {
      // Remove the entire match
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  // Sort ranges by start position
  thinkingRanges.sort((a, b) => a.start - b.start);

  // Remove thinking ranges in reverse order to maintain indices
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  }

  // Apply trim
  if (trimMode === "none") {
    return cleaned;
  }
  if (trimMode === "start") {
    return cleaned.trimStart();
  }
  return cleaned.trim();
}

// Test the fixed function
console.log("=== Testing fixed function ===");

const test1 = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

console.log("\nTest 1 - Code blocks preservation:");
console.log("Input:", JSON.stringify(test1));
console.log("Output:", JSON.stringify(fixedStripReasoningTagsFromText(test1)));

const test2 = "Text with \`inline codeđ\` and outside thinkingđ.";
console.log("\nTest 2 - Inline code preservation:");
console.log("Input:", JSON.stringify(test2));
console.log("Output:", JSON.stringify(fixedStripReasoningTagsFromText(test2)));

const test3 = "Before Đthinking Unclosed thinking content";
console.log("\nTest 3 - Unclosed thinking tags (preserve mode):");
console.log("Input:", JSON.stringify(test3));
console.log(
  "Output:",
  JSON.stringify(fixedStripReasoningTagsFromText(test3, { mode: "preserve" })),
);

const test4 = "Before Đthinking Unclosed thinking content";
console.log("\nTest 4 - Unclosed thinking tags (strict mode):");
console.log("Input:", JSON.stringify(test4));
console.log("Output:", JSON.stringify(fixedStripReasoningTagsFromText(test4, { mode: "strict" })));

const test5 = "  Before Đthinkingđ after  ";
console.log("\nTest 5 - Trim options:");
console.log("Input:", JSON.stringify(test5));
console.log("Trim both:", JSON.stringify(fixedStripReasoningTagsFromText(test5, { trim: "both" })));

const test6 = "Start First thoughtđ middle Second thoughtđ end.";
console.log("\nTest 6 - Multiple thinking blocks:");
console.log("Input:", JSON.stringify(test6));
console.log("Output:", JSON.stringify(fixedStripReasoningTagsFromText(test6)));

const test7 = "StartĐfirst thoughtđMiddleĐsecond thoughtđEnd";
console.log("\nTest 7 - Nested or multiple thinking blocks:");
console.log("Input:", JSON.stringify(test7));
console.log("Output:", JSON.stringify(fixedStripReasoningTagsFromText(test7)));
