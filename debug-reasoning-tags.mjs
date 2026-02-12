import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

const text = "Before This is thinking&#x111; after.";
console.log("Input:", JSON.stringify(text));

const result = stripReasoningTagsFromText(text);
console.log("Output:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));

// Let's check what's happening in the function now
console.log("\nChecking what the function is doing:");

// Convert HTML entities
let cleaned = text;
cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
console.log("After conversion:", JSON.stringify(cleaned));

// Check unpairedWordTagRe
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)/gi;
const matches = [...cleaned.matchAll(unpairedWordTagRe)];
console.log(
  "unpairedWordTagRe matches:",
  matches.map((m) => `[${m.index}:${m.index + m[0].length}] "${m[0]}"`),
);

// Apply the removal
let result2 = cleaned;
for (let i = matches.length - 1; i >= 0; i--) {
  const match = matches[i];
  result2 = result2.substring(0, match.index) + result2.substring(match.index + match[0].length);
}
console.log("After removal:", JSON.stringify(result2));

// Apply trim
const trimmed = result2.trim();
console.log("After trim:", JSON.stringify(trimmed));
