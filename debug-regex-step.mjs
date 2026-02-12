// Test the actual regex with the correct text
const testText = "Before This is thinking after.";
console.log("Test text:", JSON.stringify(testText));

// Test the exact pattern from reasoning-tags.ts
const THINKING_TAG_RE = /<\s*(\/? )\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

console.log("\nTesting THINKING_TAG_RE:");
const matches = [...testText.matchAll(THINKING_TAG_RE)];
console.log("Matches:", matches);

if (matches.length === 0) {
  console.log("No matches found. Let's debug why...");

  // Test if the issue is with the word boundary \b
  const withoutWordBoundary = /<\s*(\/? )\s*(?:think|thinking|thought|antthinking)[^<>]*>/gi;
  console.log("Without word boundary:", [...testText.matchAll(withoutWordBoundary)]);

  // Test if the issue is with the character class [^<>]*
  const withoutCharClass = /<\s*(\/? )\s*(?:think|thinking|thought|antthinking)\b>/gi;
  console.log("Without character class:", [...testText.matchAll(withoutCharClass)]);

  // Test just the basic pattern
  const basic = /<\/t>/gi;
  console.log("Basic closing tag:", [...testText.matchAll(basic)]);

  // Test step by step building the pattern
  console.log("\nBuilding pattern step by step:");
  console.log("Match '</t>':", /<\/t>/gi.test(testText));
  console.log("Match '<\/t>':", /<\/t>/gi.test(testText));
  console.log("Match '<\/th':", /<\/th/gi.test(testText));
  console.log("Match '<\/thi':", /<\/thi/gi.test(testText));
  console.log("Match '<\/thin':", /<\/thin/gi.test(testText));
  console.log("Match '<\/think':", /<\/think/gi.test(testText));
  console.log("Match '<\/thinking>':", /<\/thinking>/gi.test(testText));
}
