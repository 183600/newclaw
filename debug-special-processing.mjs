// Debug the special character tag processing in detail
function debugSpecialCharProcessing(text) {
  console.log("Processing:", text);

  const thinkingRanges = [];
  const stack = [];

  let i = 0;
  while (i < text.length) {
    // Check for special character opening tags (Đthinking or Đthought)
    if (text.charCodeAt(i) === 272 && i + 7 < text.length) {
      let tagWord = text.substring(i + 1, i + 9); // 8 chars for thinking

      if (tagWord.startsWith("thinking")) {
        stack.push({ start: i, type: "special", tag: "Đthinking" });
        console.log(`Found Đthinking at position ${i}, pushed to stack`);
        i += 9;
        continue;
      }

      tagWord = text.substring(i + 1, i + 8); // 7 chars for thought
      if (tagWord.startsWith("thought")) {
        stack.push({ start: i, type: "special", tag: "Đthought" });
        console.log(`Found Đthought at position ${i}, pushed to stack`);
        i += 8;
        continue;
      }
    }

    // Check for special character closing tags
    if (
      i + 7 < text.length &&
      (text.substring(i, i + 8) === "thinking\u0111" ||
        text.substring(i, i + 7) === "thought\u0111" ||
        text.substring(i, i + 11) === "antthinking\u0111")
    ) {
      let endPos;
      let tagType;
      if (text.substring(i, i + 8) === "thinking\u0111") {
        endPos = i + 8;
        tagType = "thinkingđ";
      } else if (text.substring(i, i + 7) === "thought\u0111") {
        endPos = i + 7;
        tagType = "thoughtđ";
      } else if (text.substring(i, i + 11) === "antthinking\u0111") {
        endPos = i + 11;
        tagType = "antthinkingđ";
      }

      console.log(`Found ${tagType} at position ${i}`);

      // Find the matching opening tag
      let found = false;
      for (let j = stack.length - 1; j >= 0; j--) {
        if (stack[j].type === "special") {
          const open = stack.splice(j, 1)[0];
          thinkingRanges.push({
            start: open.start,
            end: endPos,
          });
          console.log(
            `  Matched with ${open.tag} at position ${open.start}, added range: ${open.start}-${endPos}`,
          );
          found = true;
          break;
        }
      }

      if (!found) {
        thinkingRanges.push({
          start: i,
          end: endPos,
        });
        console.log(`  No matching open tag, added range: ${i}-${endPos}`);
      }

      i = endPos;
      continue;
    }

    i++;
  }

  console.log("Final thinkingRanges:", thinkingRanges);
  console.log("Final stack:", stack);

  // Apply the ranges
  let result = text;
  for (let j = thinkingRanges.length - 1; j >= 0; j--) {
    const range = thinkingRanges[j];
    console.log(`Removing range ${j}:`, range);
    result = result.slice(0, range.start) + result.slice(range.end);
    console.log("Result after removal:", result);
  }

  return result;
}

// Test with our problematic case
console.log("=== Special Character Processing Debug ===");
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";
const result = debugSpecialCharProcessing(overlappingText);
console.log("Final result:", result);
console.log("Expected: Before   after.");
