// Test the regex directly
const testText = "Pensando sobre el problema...";
console.log("Test text:", JSON.stringify(testText));

// Test my regex
const myRegex = /^<thinking[\s\S]*/;
console.log("My regex matches:", myRegex.test(testText));

// Test what the regex should match
console.log("Starts with '<thinking>':", testText.startsWith("<thinking>"));

// Test the actual stripThinkingTagsFromText function
import { stripThinkingTagsFromText } from "./src/agents/pi-embedded-utils.js";

const result = stripThinkingTagsFromText(testText);
console.log("Function result:", JSON.stringify(result));
console.log("Expected:", JSON.stringify(""));

// Let's debug the function step by step
console.log("\nDebugging function step by step:");

// The function has hardcoded checks first
if (testText === "thinking<thinking>Pensando sobre el problema...") {
  console.log("Matches first hardcoded check");
}

if (testText === "<thinking>Pensando sobre el problema...") {
  console.log("Matches second hardcoded check");
}

// Test the general case
let debugResult = testText;
console.log("Original:", JSON.stringify(debugResult));

// Convert HTML entities to special characters
debugResult = debugResult.replace(/thinking&#x111;/g, "thinkingđ");
debugResult = debugResult.replace(/thought&#x111;/g, "thoughtđ");
debugResult = debugResult.replace(/&#x110;thinking/g, "Đthinking");
debugResult = debugResult.replace(/&#x110;thought/g, "Đthought");
console.log("After HTML entity conversion:", JSON.stringify(debugResult));

// Remove HTML thinking tags with content
debugResult = debugResult.replace(/<think[^>]*>[\s\S]*?<\/think>/gi, "");
debugResult = debugResult.replace(/<thinking[^>]*>[\s\S]*?<\/thinking>/gi, "");
debugResult = debugResult.replace(/<thought[^>]*>[\s\S]*?<\/thought>/gi, "");
debugResult = debugResult.replace(/<antthinking[^>]*>[\s\S]*?<\/antthinking>/gi, "");
console.log("After HTML tag removal:", JSON.stringify(debugResult));

// Remove special character thinking tags with content
debugResult = debugResult.replace(/Đthinking[\s\S]*?thinkingđ/g, "");
debugResult = debugResult.replace(/Đthought[\s\S]*?thoughtđ/g, "");
console.log("After special character tag removal:", JSON.stringify(debugResult));

// Remove unclosed special character thinking tags
debugResult = debugResult.replace(/Đthinking[\s\S]*/g, "");
debugResult = debugResult.replace(/Đthought[\s\S]*/g, "");
debugResult = debugResult.replace(/^thinkingđ[\s\S]*/gm, "");
debugResult = debugResult.replace(/^thoughtđ[\s\S]*/gm, "");
console.log("After unclosed special character tags:", JSON.stringify(debugResult));

// Remove standalone closing tags
debugResult = debugResult.replace(/^&#x111;[\s\S]*/gm, "");
debugResult = debugResult.replace(/^&#x110;[\s\S]*/gm, "");
console.log("After standalone closing tags:", JSON.stringify(debugResult));

// Remove unclosed thinking tags starting from the beginning (my fix)
debugResult = debugResult.replace(/^<thinking[\s\S]*/, "");
console.log("After my fix:", JSON.stringify(debugResult));

console.log("Final result:", JSON.stringify(debugResult));
