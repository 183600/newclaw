import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test case 1: inline code preservation
console.log("=== Test 1: Inline code preservation ===");
const text1 = "Text with `inline code</think>` and outside thinking</think>.";
const result1 = stripReasoningTagsFromText(text1);
console.log("Input:", JSON.stringify(text1));
console.log("Output:", JSON.stringify(result1));
console.log('Expected: contains "inline code</think>"');
console.log("");

// Test case 2: mixed HTML entities and tags
console.log("=== Test 2: Mixed HTML entities and tags ===");
const text2 = "Before &#x110;thinking middle thinking&#x111; after.";
const result2 = stripReasoningTagsFromText(text2);
console.log("Input:", JSON.stringify(text2));
console.log("Output:", JSON.stringify(result2));
console.log('Expected: "Before  middle  after."');
console.log("");

// Test case 3: Unicode special characters
console.log("=== Test 3: Unicode special characters ===");
const text3 = "Before \u0110thinking content thinking\u0111 after.";
const result3 = stripReasoningTagsFromText(text3);
console.log("Input:", JSON.stringify(text3));
console.log("Output:", JSON.stringify(result3));
console.log('Expected: "Before  content  after."');
console.log("");

// Test case 4: adjacent tags
console.log("=== Test 4: Adjacent tags ===");
const text4 = "Before <thinking></thinking><thought></thought> after.";
const result4 = stripReasoningTagsFromText(text4);
console.log("Input:", JSON.stringify(text4));
console.log("Output:", JSON.stringify(result4));
console.log('Expected: "Before  after."');
console.log("");

// Test case 5: mixed format tags
console.log("=== Test 5: Mixed format tags ===");
const text5 =
  "Before <thinking>HTML content</thinking> and Đthinking special content thinkingđ after.";
const result5 = stripReasoningTagsFromText(text5);
console.log("Input:", JSON.stringify(text5));
console.log("Output:", JSON.stringify(result5));
console.log('Expected: "Before   and   after."');
