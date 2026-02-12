// Debug regex in detail
const regex = /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;

const test = "</t>";
console.log("Testing:", JSON.stringify(test));
console.log("Regex:", regex);

// Test step by step
console.log("\nStep by step:");
console.log("  Matches '<':", /</.test(test));
console.log("  Matches '</':", /<\//.test(test));
console.log("  Matches '</t':", /<\/t/.test(test));
console.log("  Matches '</t>':", /<\/t>/.test(test));

// Test with optional spaces
console.log("\nWith optional spaces:");
console.log("  Matches '<\\s*/\\s*t>':", /<\s*\/\s*t>/.test(test));

// Test the full pattern
console.log("\nFull pattern:");
console.log("  Matches:", regex.test(test));
regex.lastIndex = 0; // Reset
const match = test.match(regex);
console.log("  Match result:", match);
