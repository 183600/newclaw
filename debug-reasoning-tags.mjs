#!/usr/bin/env node

// Debug script for reasoning tags
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

console.log("=== Testing stripReasoningTagsFromText ===");

// Test 1: think tags
const test1 = "This is think content</think>\nThis is the actual response.";
console.log("Test 1 input:", JSON.stringify(test1));
console.log("Test 1 output:", JSON.stringify(stripReasoningTagsFromText(test1)));
console.log("Expected:", JSON.stringify("This is the actual response."));
console.log("");

// Test 2: trim none
const test2 = "  <thinking>Thinking</thinking>  Response content  ";
console.log("Test 2 input:", JSON.stringify(test2));
console.log("Test 2 output:", JSON.stringify(stripReasoningTagsFromText(test2, { trim: "none" })));
console.log("Expected:", JSON.stringify("  Response content  "));
console.log("");

// Test 3: complex scenario
const test3 = `<thinking>Initial thinking</thinking>
Intro text
\`\`\`python
<thinking>Code thinking</thinking>
code()
<final>Code final</final>
\`\`\`
<thinking>More thinking</thinking>
Middle text
\`<thinking>Inline code thinking</thinking>\`
End text
<final>Final section</final>`;

const expected3 = `Intro text
\`\`\`python
<thinking>Code thinking</thinking>
code()
<final>Code final</final>
\`\`\`
Middle text
\`<thinking>Inline code thinking</thinking>\`
End text`;

console.log("Test 3 input:", JSON.stringify(test3));
console.log("Test 3 output:", JSON.stringify(stripReasoningTagsFromText(test3)));
console.log("Expected:", JSON.stringify(expected3));
console.log("");
