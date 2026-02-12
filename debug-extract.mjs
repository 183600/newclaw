// Debug the full extractAssistantText flow
import { extractAssistantText } from "./src/agents/pi-embedded-utils.js";

const msg = {
  role: "assistant",
  content: [
    {
      type: "text",
      text: "&#x111;Pensando sobre el problema...",
    },
  ],
  timestamp: Date.now(),
};

console.log("Debug extractAssistantText:");
const result = extractAssistantText(msg);
console.log(`Result: "${result}"`);
console.log(`Expected: ""`);
