// Test extractAssistantText with the exact input from the test
import { extractAssistantText } from "./src/agents/pi-embedded-utils.js";

const msg = {
  role: "assistant",
  content: [
    {
      type: "text",
      text: "<thinking>Pensando sobre el problema...",
    },
  ],
  timestamp: Date.now(),
};

console.log("Input text:", JSON.stringify(msg.content[0].text));
console.log(
  "Character codes:",
  [...msg.content[0].text].map((c) => c.charCodeAt(0)),
);

const result = extractAssistantText(msg);
console.log("Result:", JSON.stringify(result));
console.log("Expected:", JSON.stringify(""));
