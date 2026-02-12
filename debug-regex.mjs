// Debug specific regex matching

const HTML_THINKING_TAG_RE =
  /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;

const tag = "<" + "think" + ">";
console.log("Tag to test:", JSON.stringify(tag));

// Test the regex step by step
console.log("\nTesting regex components:");

// Test the basic structure
const basicRe = /<\s*(\/?)\s*(t|think|thinking|thought|antthinking)\s*>/gi;
console.log("Basic regex match:", tag.match(basicRe));

// Test with attributes
const attrRe = /<\s*(\/?)\s*(t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;
console.log("With attributes match:", tag.match(attrRe));

// Test the original regex
console.log("Original regex match:", tag.match(HTML_THINKING_TAG_RE));

// Test character by character
console.log("\nCharacter analysis:");
for (let i = 0; i < tag.length; i++) {
  const char = tag[i];
  const code = tag.charCodeAt(i);
  console.log(`  ${i}: "${char}" (${code})`);
}

// Test simpler patterns
console.log("\nSimpler patterns:");
console.log('Contains "<":', tag.includes("<"));
console.log('Contains ">":', tag.includes(">"));
console.log('Contains "think":', tag.includes("think"));

// Test complete
