// Debug regex matching
const HTML_THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

const text = "Text with `inline code</t>` and outside thinking</t>.";
console.log("Text:", JSON.stringify(text));

// Test specific parts
const test1 = "</t>";
const test2 = "thinking</t>";

console.log("\nTest 1 - </t>:");
console.log("  Matches:", [...test1.matchAll(HTML_THINKING_TAG_RE)]);

console.log("\nTest 2 - thinking</t>:");
console.log("  Matches:", [...test2.matchAll(HTML_THINKING_TAG_RE)]);

console.log("\nFull text:");
console.log("  Matches:", [...text.matchAll(HTML_THINKING_TAG_RE)]);

// Check character by character around thinking</t>
const idx = text.indexOf("thinking</t>");
if (idx !== -1) {
  console.log("\nAround 'thinking</t>':");
  const context = text.slice(Math.max(0, idx - 5), idx + 15);
  console.log("Context:", JSON.stringify(context));
  console.log(
    "Chars:",
    [...context].map((c, i) => `${idx - 5 + i}:${JSON.stringify(c)}`),
  );
}
