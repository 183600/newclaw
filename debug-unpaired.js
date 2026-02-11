// Test the unpaired word regex
import * as funcs from "./dist/image-DOhePNiG.js";

const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("=== Testing Unpaired Word Regex ===");

// Test simple thinking
const test1 = "thinking";
console.log("Test 1:", test1);
console.log("Matches:", [...test1.matchAll(unpairedWordTagRe)]);

// Test "This is thinking"
const test2 = "This is thinking";
console.log("\nTest 2:", test2);
console.log("Matches:", [...test2.matchAll(unpairedWordTagRe)]);

// Test "word thinking"
const test3 = "word thinking";
console.log("\nTest 3:", test3);
console.log("Matches:", [...test3.matchAll(unpairedWordTagRe)]);

// Test "thinking</t>"
const test4 = "thinking</t>";
console.log("\nTest 4:", test4);
console.log("Matches:", [...test4.matchAll(unpairedTagRe)]);

// Test the actual test case
const test5 = "Before This is thinking after";
console.log("\nTest 5:", test5);
console.log("Matches:", [...test5.matchAll(unpairedWordRe)]);

// Test the actual test case with special characters
const test6 = "Before This is thinkingđ after.";
console.log("\nTest 6 (with special char):", test6);
console.log("Matches:", [...test6.matchAll(unpairedWordTagRe)]);

// Test the function
const result6 = funcs.g(test6); // stripThinkingTagsFromText
console.log("\n=== Function Result ===");
console.log("Output:", JSON.stringify(result6));
console.log("Expected:", JSON.stringify("Before  after."));
