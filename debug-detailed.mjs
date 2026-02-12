#!/usr/bin/env node

// 添加调试版本的函数
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[đĐ]|(?:Đ)(?:thinking|thought|antthinking)|(?:^|\s)(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;

function debugStripReasoningTagsFromText(text, options = {}) {
  console.log(`=== DEBUG: Input text ===`);
  console.log(JSON.stringify(text));

  if (!text) {
    console.log(`=== DEBUG: Empty input, returning as-is ===`);
    return text;
  }

  const mode = options.mode ?? "strict";
  const trimMode = options.trim ?? "both";

  let cleaned = text;

  // Convert HTML entities to special characters for processing
  console.log(`=== DEBUG: Converting HTML entities ===`);
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/antthinking&#x111;/g, "antthinkingđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");
  cleaned = cleaned.replace(/&#x110;antthinking/g, "Đantthinking");
  console.log(`After HTML entity conversion: ${JSON.stringify(cleaned)}`);

  // Check for reasoning tags after conversion
  console.log(`=== DEBUG: Checking for reasoning tags ===`);
  const hasTags = QUICK_TAG_RE.test(cleaned);
  console.log(`Has reasoning tags: ${hasTags}`);
  QUICK_TAG_RE.lastIndex = 0; // Reset regex state

  if (!hasTags) {
    console.log(`=== DEBUG: No reasoning tags found, returning original text ===`);
    return text;
  }

  console.log(`=== DEBUG: Processing tags... ===`);

  // Handle final tags first (simplified)
  const FINAL_TAG_RE = /<\s*\/?\s*final\b[^<>]*>/gi;
  if (FINAL_TAG_RE.test(cleaned)) {
    console.log(`Found final tags, removing them...`);
    cleaned = cleaned.replace(FINAL_TAG_RE, "");
    FINAL_TAG_RE.lastIndex = 0;
  }

  // Now handle thinking tags
  console.log(`Looking for thinkingđ pattern...`);
  const thinkingClosePattern = /thinkingđ/g;
  const matches = [...cleaned.matchAll(thinkingClosePattern)];
  console.log(
    `Found ${matches.length} thinkingđ matches:`,
    matches.map((m) => ({ index: m.index, match: m[0] })),
  );

  // Simple removal for debugging
  cleaned = cleaned.replace(/thinkingđ/g, "");
  console.log(`After removing thinkingđ: ${JSON.stringify(cleaned)}`);

  return cleaned;
}

// 测试简单案例
console.log("=== Testing simple case ===");
const simpleTest = "Before thinking&#x111; after";
console.log("Input:");
console.log(JSON.stringify(simpleTest));
console.log("\nOutput:");
console.log(JSON.stringify(debugStripReasoningTagsFromText(simpleTest)));
console.log('\nExpected: "Before  after"');
