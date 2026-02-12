// Test the stripThinkingTagsFromText function
import { stripThinkingTagsFromText } from "./src/agents/pi-embedded-utils.js";

const testText = "Pensando sobre el problema...";
console.log("Input text:", JSON.stringify(testText));

const result = stripThinkingTagsFromText(testText);
console.log("Result:", JSON.stringify(result));
console.log("Expected:", JSON.stringify(""));
console.log("Match:", result === "");

// Test the regex directly
const testRegex = /^thinking[\s\S]*/;
console.log("\nTesting regex directly:");
console.log("Regex matches:", testRegex.test(testText));
