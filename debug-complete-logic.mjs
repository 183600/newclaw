// Test the actual stripReasoningTagsFromText function with all logic

// Copy all the constants and functions from the source
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:\w+)[\u0111\u0110]|(?:\u0110)(?:\w+)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;
const FINAL_TAG_RE = /<\s*\/?\s*final\b[^<>]*>/gi;
const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
const SPECIAL_CLOSE_RE = /(?:thinking|thought|antthinking)\u0111/g;
const SPECIAL_OPEN_RE = /\u0110(?:thinking|thought|antthinking)/g;

function findCodeRegions(text) {
  const regions = [];

  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
  }

  const inlineRe = /`[^`]+`/g;
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

function applyTrim(value, mode) {
  if (mode === "none") {
    return value;
  }
  if (mode === "start") {
    return value.trimStart();
  }
  return value.trim();
}

// Full implementation of stripReasoningTagsFromText
function stripReasoningTagsFromText(text, options = {}) {
  console.log("\n=== Processing text ===");
  console.log("Input:", JSON.stringify(text));

  if (!text) {
    return text;
  }
  if (!QUICK_TAG_RE.test(text)) {
    console.log("No quick tags found, returning original");
    return text;
  }

  const mode = options.mode ?? "strict";
  const trimMode = options.trim ?? "both";

  console.log("Mode:", mode, "Trim:", trimMode);

  let cleaned = text;

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");

  console.log("After HTML entity conversion:", JSON.stringify(cleaned));

  // First handle final tags
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
  console.log("Code regions:", codeRegions);

  const thinkingRanges = [];
  let stack = [];

  // Find all HTML thinking tags
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
      // In preserve mode, extract content from unclosed tags and preserve everything else
      let result = cleaned;
      let lastPos = cleaned.length;

      // Process stack in reverse order (last unclosed tag first)
      for (let i = stack.length - 1; i >= 0; i--) {
        const open = stack[i];
        let contentStart = open.start;

        if (open.type === "special") {
          // For special char tags, content starts after the tag word
          let wordEnd = open.start + 1;
          while (wordEnd < cleaned.length && /[a-zA-Z]/.test(cleaned[wordEnd])) {
            wordEnd++;
          }
          contentStart = wordEnd;
        } else {
          // For HTML tags, find the end of the opening tag
          const tagMatch = cleaned.slice(open.start).match(/^<[^>]*>/);
          if (tagMatch) {
            contentStart = open.start + tagMatch[0].length;
          }
        }

        // Replace everything before the unclosed tag with just the content
        result = cleaned.slice(contentStart, lastPos);
        lastPos = open.start;
      }

      // Add everything before the first unclosed tag
      if (stack.length > 0 && lastPos > 0) {
        const firstOpen = stack[0];
        result = cleaned.slice(0, firstOpen.start) + result;
      }

      return applyTrim(result, trimMode);
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
  // Match specific patterns like "This is thinking</t>" or "First thought</t>"
  // Use a single regex that handles both cases
  const unpairedWordTagRe =
    /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;

  // Removed textWithClosingTagRe logic as it was causing over-matching
  // The unpairedWordTagRe should handle the necessary cases
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

  console.log("Final thinking ranges:", thinkingRanges);

  // Remove thinking ranges in reverse order to maintain indices
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    console.log(
      `Removing range ${range.start}-${range.end}: "${cleaned.slice(range.start, range.end)}"`,
    );
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  }

  console.log("Output:", JSON.stringify(cleaned));
  return applyTrim(cleaned, trimMode);
}

// Test case 1: Code blocks
const text1 = `\n\`\`\`javascript\nfunction test() {\n  // This should be preserved\u0111\n  return true;\n}\n\`\`\`\nOutside This should be removed\u0111 code block.`;

console.log("=== Test 1: Code blocks ===");
const result1 = stripReasoningTagsFromText(text1);
console.log('Expected: Contains "This should be preservedđ"');
console.log('Expected: Does not contain "This should be removedđ"');

// Test case 2: Inline code
const text2 = `Text with \`inline code\u0111\` and outside thinking\u0111.`;

console.log("\n=== Test 2: Inline code ===");
const result2 = stripReasoningTagsFromText(text2);
console.log('Expected: Contains "inline codeđ"');
console.log('Expected: Does not contain "thinkingđ"');
