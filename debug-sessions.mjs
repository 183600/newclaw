import { sanitizeUserFacingText } from "./src/agents/pi-embedded-helpers.js";
// Debug the extractAssistantText function
import { sanitizeTextContent } from "./src/agents/tools/sessions-helpers.ts";

const message = {
  role: "assistant",
  content: [
    { type: "text", text: "Hi " },
    { type: "text", text: "thinking&#x111;secret&#x111;there" },
  ],
};

console.log("Debug extractAssistantText:");

// Step 1: Extract text blocks
const chunks = [];
for (const block of message.content) {
  if (block.type !== "text") continue;
  const text = block.text;
  console.log(`Original text block: "${text}"`);

  const sanitized = sanitizeTextContent(text);
  console.log(`After sanitizeTextContent: "${sanitized}"`);

  if (sanitized.trim()) {
    chunks.push(sanitized);
  }
}

console.log(`\nChunks array: [${chunks.map((c) => `"${c}"`).join(", ")}]`);

// Step 2: Join chunks
const joined = chunks.join("");
console.log(`After join: "${joined}"`);

// Step 3: Apply sanitizeUserFacingText
const final = sanitizeUserFacingText(joined);
console.log(`After sanitizeUserFacingText: "${final}"`);

console.log(`\nExpected: "Hi there"`);
console.log(`Got: "${final}"`);
console.log(`Match: ${final === "Hi there"}`);
