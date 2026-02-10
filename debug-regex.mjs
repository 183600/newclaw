#!/usr/bin/env node

// Debug script for regex patterns
const QUICK_TAG_RE = /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b/i;
const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

console.log("=== Testing regex patterns ===");

// Test 1: think tags
const test1 = "This is think content
This is the actual response.";
console.log("Test 1 input:", JSON.stringify(test1));
console.log("QUICK_TAG_RE test1:", QUICK_TAG_RE.test(test1));

// Reset regex state
QUICK_TAG_RE.lastIndex = 0;

console.log("Matches in test1:");
for (const match of test1.matchAll(THINKING_TAG_RE)) {
  console.log("  Match:", JSON.stringify(match[0]), "at index", match.index, "isClose:", match[1] === "/");
}
console.log("");
