#!/usr/bin/env node

import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

function debugStripReasoningTagsFromText(text, options) {
  console.log(`Input: ${JSON.stringify(text)}`);
  const result = stripReasoningTagsFromText(text, options);
  console.log(`Output: ${JSON.stringify(result)}`);
  return result;
}

// 测试
console.log("=== Test 1: Simple case ===");
const test1 = "Before This is thinkingđ after.";
debugStripReasoningTagsFromText(test1);

console.log("\n=== Test 2: Multiple matches ===");
const test2 = "Start First thoughtđ middle Second thoughtđ end.";
debugStripReasoningTagsFromText(test2);

console.log("\n=== Test 3: Inline code ===");
const test3 = "Text with `inline codeĐthinking` and outside thinkingđ.";
debugStripReasoningTagsFromText(test3);

console.log("\n=== Test 4: Unclosed opening tag (preserve mode) ===");
const test4 = "Before ĐthinkingUnclosed thinking content";
debugStripReasoningTagsFromText(test4, { mode: "preserve" });

console.log("\n=== Test 5: Unclosed opening tag (strict mode) ===");
const test5 = "Before ĐthinkingUnclosed thinking content";
debugStripReasoningTagsFromText(test5, { mode: "strict" });
