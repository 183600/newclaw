// Debug inline code chars
const text = "Text with `inline code</t>` and outside thinking</t>.";

console.log("Text:", JSON.stringify(text));
console.log("Char positions:");
[...text].forEach((c, i) => {
  if (i >= 8 && i <= 30) {
    console.log(`  ${i}: ${JSON.stringify(c)}`);
  }
});

// Check the inline code region
const inlineStart = text.indexOf("`");
const inlineEnd = text.indexOf("`", inlineStart + 1);
console.log(`\nInline code: ${inlineStart}-${inlineEnd}`);
console.log(`Char at ${inlineEnd}: ${JSON.stringify(text[inlineEnd])}`);
console.log(`Expected: ${JSON.stringify("`")}`);
