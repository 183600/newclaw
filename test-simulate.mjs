// Test the specific logic for handling unmatched closing tags
function simulateFunction(text) {
  const QUICK_TAG_RE =
    /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[đĐ]|(?:Đ)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/i;

  if (!text) {
    return text;
  }
  if (!QUICK_TAG_RE.test(text)) {
    console.log("No tags found by QUICK_TAG_RE");
    return text;
  }

  console.log("Processing text:", JSON.stringify(text));

  // Find code regions
  const codeRegions = [];
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = (match.index ?? 0) + match[1].length;
    codeRegions.push({ start, end: start + match[0].length - match[1].length });
  }
  const inlineRe = /`+[^`]+`+/g;
  for (const match of text.matchAll(inlineRe)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const insideFenced = codeRegions.some((r) => start >= r.start && end <= r.end);
    if (!insideFenced) {
      codeRegions.push({ start, end });
    }
  }
  codeRegions.sort((a, b) => a.start - b.start);

  console.log("Code regions:", codeRegions);

  function isInsideCode(pos, regions) {
    return regions.some((r) => pos >= r.start && pos < r.end);
  }

  const thinkingRanges = [];
  const stack = [];

  // Process special character closing tags
  let i = 0;
  while (i < text.length) {
    // Check for special character closing tags (thinkingđ or thoughtđ)
    if (i + 7 < text.length) {
      const substr = text.substring(i, i + 8);
      if (substr === "thinkingđ" || substr === "thoughtđ") {
        console.log(
          `Found "${substr}" at position ${i}, inside code: ${isInsideCode(i, codeRegions)}`,
        );

        if (!isInsideCode(i, codeRegions)) {
          // Find matching opening tag
          let found = false;
          for (let j = stack.length - 1; j >= 0; j--) {
            if (stack[j].type === "special") {
              const open = stack.splice(j, 1)[0];
              thinkingRanges.push({
                start: open.start,
                end: i + (substr === "thinkingđ" ? 8 : 7),
              });
              found = true;
              console.log("Found matching opening tag, adding range:", {
                start: open.start,
                end: i + (substr === "thinkingđ" ? 8 : 7),
              });
              break;
            }
          }

          // Handle unmatched closing special tags
          if (!found) {
            thinkingRanges.push({
              start: i,
              end: i + (substr === "thinkingđ" ? 8 : 7),
            });
            console.log("No matching opening tag, adding range for unmatched closing:", {
              start: i,
              end: i + (substr === "thinkingđ" ? 8 : 7),
            });
          }
        }
        i += substr === "thinkingđ" ? 8 : 7;
        continue;
      }
    }

    // Check for special character opening tags (Đthinking or Đthought)
    if (text[i] === "Đ" && i + 7 < text.length) {
      const tagWord = text.substring(i + 1, i + 8);
      if (tagWord === "thinking" || tagWord === "thought") {
        if (!isInsideCode(i, codeRegions)) {
          stack.push({ start: i, type: "special" });
          console.log(
            `Found opening tag "${text.substring(i, i + 8)}" at position ${i}, added to stack`,
          );
        }
        i += 8;
        continue;
      }
    }

    i++;
  }

  console.log("Thinking ranges before processing unmatched words:", thinkingRanges);

  // Process unmatched word tags
  const unpairedWordTagRe =
    /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;
  for (const match of text.matchAll(unpairedWordTagRe)) {
    const idx = match.index ?? 0;
    console.log(
      `Unpaired word match: "${match[0]}" at position ${idx}, inside code: ${isInsideCode(idx, codeRegions)}`,
    );
    if (!isInsideCode(idx, codeRegions)) {
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  console.log("All thinking ranges:", thinkingRanges);

  // Remove ranges
  let cleaned = text;
  thinkingRanges.sort((a, b) => a.start - b.start);
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    console.log(
      `Removing range [${range.start}, ${range.end}): "${cleaned.substring(range.start, range.end)}"`,
    );
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  }

  console.log("Final result:", JSON.stringify(cleaned));
  return cleaned;
}

// Test cases
console.log("=== Test 1: Simple case ===");
simulateFunction("First thoughtđ middle");

console.log('\n=== Test 2: With "This" prefix ===');
simulateFunction("This should be removedđ");

console.log("\n=== Test 3: In code block ===");
simulateFunction(`
\`\`\`javascript
// This should be preservedđ
\`\`\`
Outside This should be removedđ`);
