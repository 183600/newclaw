// Test the actual stripReasoningTagsFromText function with our test cases

// Copy the relevant functions from the source
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

// Simplified version of stripReasoningTagsFromText to debug the issue
function debugStripReasoningTagsFromText(text, options = {}) {
  console.log("\n=== Processing text ===");
  console.log("Input:", JSON.stringify(text));

  if (!text) {
    return text;
  }

  const mode = options.mode ?? "strict";
  const trimMode = options.trim ?? "both";

  console.log("Mode:", mode, "Trim:", trimMode);

  let cleaned = text;

  // Find code regions
  const codeRegions = findCodeRegions(cleaned);
  console.log("Code regions:", codeRegions);

  const thinkingRanges = [];
  let stack = [];

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
        const word = cleaned.slice(i, wordEnd);
        console.log(`Found opening special tag: ${word} at position ${i}`);
        if (!isInsideCode(i, codeRegions)) {
          stack.push({ start: i, type: "special" });
          console.log("  Added to stack (not in code)");
        } else {
          console.log("  Skipped (inside code)");
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
        const word = cleaned.slice(wordStart, i + 1);
        console.log(`Found closing special tag: ${word} at position ${wordStart}-${i + 1}`);
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
              console.log(
                `  Matched with opening tag at ${open.start}, added range ${open.start}-${i + 1}`,
              );
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
            console.log(`  No matching opening tag, added range ${wordStart}-${i + 1}`);
          }
        } else {
          console.log("  Skipped (inside code)");
        }
        i++;
        continue;
      }
    }

    i++;
  }

  console.log("Final thinking ranges:", thinkingRanges);
  console.log("Final stack:", stack);

  // Remove thinking ranges in reverse order to maintain indices
  for (let k = thinkingRanges.length - 1; k >= 0; k--) {
    const range = thinkingRanges[k];
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
const result1 = debugStripReasoningTagsFromText(text1);
console.log('Expected: Contains "This should be preservedđ"');
console.log('Expected: Does not contain "This should be removedđ"');

// Test case 2: Inline code
const text2 = `Text with \`inline code\u0111\` and outside thinking\u0111.`;

console.log("\n=== Test 2: Inline code ===");
const result2 = debugStripReasoningTagsFromText(text2);
console.log('Expected: Contains "inline codeđ"');
console.log('Expected: Does not contain "thinkingđ"');
