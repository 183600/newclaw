// Test with correct special characters
const preservedText = "This should be preserved";
const removedText = "This should be removed";

// Add the correct special characters from hex output
const actualPreserved = preservedText + "";
const actualRemoved = removedText + "";

console.log("Preserved text:", JSON.stringify(actualPreserved));
console.log("Removed text:", JSON.stringify(actualRemoved));

const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTesting unpairedWordTagRe:");
console.log("Preserved matches pattern:", actualPreserved.match(unpairedWordTagRe));
console.log("Removed matches pattern:", actualRemoved.match(unpairedWordTagRe));

// The issue is that our regex expects "thinking", "thought", or "antthinking"
// But the actual text doesn't contain these words - it just has the closing tags

// Let's check what the regex should actually match
console.log("\nAnalyzing the actual text:");
console.log("Preserved text contains 'thinking':", actualPreserved.includes("thinking"));
console.log("Removed text contains 'thinking':", actualRemoved.includes("thinking"));
console.log("Preserved text contains '</t>':", actualPreserved.includes("</t>"));
console.log("Removed text contains '</t>':", actualRemoved.includes("</t>"));
