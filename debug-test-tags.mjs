// Debug script to understand the test patterns
const text1 = "Before This is thinking&#x111; after.";
console.log("Text 1:", text1);
console.log(
  "Char codes:",
  [...text1].map((c) => `${c} (${c.charCodeAt(0)})`),
);

const text2 = "Start First thought&#x111; middle Second thought&#x111; end.";
console.log("\nText 2:", text2);
console.log(
  "Char codes:",
  [...text2].map((c) => `${c} (${c.charCodeAt(0)})`),
);

const text3 = "Before &#x110;thinking Unclosed thinking content";
console.log("\nText 3:", text3);
console.log(
  "Char codes:",
  [...text3].map((c) => `${c} (${c.charCodeAt(0)})`),
);

// Test the HTML entity conversion
console.log("\nHTML entity conversion:");
console.log("thinking&#x111; ->", "thinking&#x111;".replace(/&#x111;/g, "đ"));
console.log("&#x110;thinking ->", "&#x110;thinking".replace(/&#x110;/g, "Đ"));
