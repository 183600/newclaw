import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test the exact case from the failing test
const text = "Start\nfirst thought\nEnd";

console.log("Input:", JSON.stringify(text));
console.log("Output:", JSON.stringify(stripReasoningTagsFromText(text)));
console.log("Expected:", JSON.stringify("StartMiddleEnd"));

// Test step by step
console.log("\n--- Testing with strict mode ---");
console.log(
  "Output (strict):",
  JSON.stringify(stripReasoningTagsFromText(text, { mode: "strict" })),
);

console.log("\n--- Testing with preserve mode ---");
console.log(
  "Output (preserve):",
  JSON.stringify(stripReasoningTagsFromText(text, { mode: "preserve" })),
);
