// Debug Unicode character matching

const text = "This should be removedđ";
console.log("Text:", JSON.stringify(text));
console.log("Text length:", text.length);
console.log("Last character code:", text.charCodeAt(text.length - 1));
console.log("Expected đ character code:", "đ".charCodeAt(0));

// Check if the characters match
const lastChar = text[text.length - 1];
console.log("Last character:", lastChar);
console.log("Are they equal?", lastChar === "đ");

// Test different Unicode representations
console.log("\nTesting different Unicode representations:");
console.log("\\u0111:", JSON.stringify("\u0111"));
console.log("Direct đ:", JSON.stringify("đ"));
console.log("Are they equal?", "\u0111" === "đ");

// Test regex with different approaches
console.log("\nTesting regex with different approaches:");

// Original pattern
const pattern1 = /\bThis should be\s+(thinking|thought|antthinking)\u0111/gi;
console.log("Pattern 1 match:", text.match(pattern1));

// With explicit character
const pattern2 = /\bThis should be\s+(thinking|thought|antthinking)đ/gi;
console.log("Pattern 2 match:", text.match(pattern2));

// With character class
const pattern3 = /\bThis should be\s+(thinking|thought|antthinking)[\u0111đ]/gi;
console.log("Pattern 3 match:", text.match(pattern3));

// Test the actual word from the text
console.log("\nExtracting the actual word:");
const wordMatch = text.match(/\b\w+(?:\s+\w+)*\s+\w+đ$/);
console.log("Word match:", wordMatch);

if (wordMatch) {
  const word = wordMatch[0];
  console.log("Extracted word:", JSON.stringify(word));

  // Test if it matches our patterns
  console.log("Matches pattern 1:", word.match(pattern1));
  console.log("Matches pattern 2:", word.match(pattern2));
  console.log("Matches pattern 3:", word.match(pattern3));
}
