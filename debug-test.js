const { stripReasoningTagsFromText } = require("./src/shared/text/reasoning-tags.ts");

console.log("Testing inline code preservation...");
const test1 = "Text with `inline code` and outside thinking.";
const result1 = stripReasoningTagsFromText(test1);
console.log("Input:", test1);
console.log("Output:", result1);
console.log('Expected: contains "inline code", does not contain "thinking"');
console.log("");

console.log("Testing trim options...");
const test2 = "  Before thinking after  ";
const resultNone = stripReasoningTagsFromText(test2, { trim: "none" });
const resultStart = stripReasoningTagsFromText(test2, { trim: "start" });
const resultBoth = stripReasoningTagsFromText(test2, { trim: "both" });

console.log("Input:", test2);
console.log("Result (none):", `"${resultNone}"`);
console.log("Expected (none):", '"  Before  after  "');
console.log("Match:", resultNone === "  Before  after  ");
console.log("");

console.log("Result (start):", `"${resultStart}"`);
console.log("Expected (start):", '"Before  after  "');
console.log("Match:", resultStart === "Before  after  ");
console.log("");

console.log("Result (both):", `"${resultBoth}"`);
console.log("Expected (both):", '"Before  after."');
console.log("Match:", resultBoth === "Before  after.");
