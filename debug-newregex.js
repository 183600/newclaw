// Test the new regex
const test1 = "Before This is thinking</t> after.";
const test2 = "Start First thought</t> middle Second thought</t> end.";

const plainClosingTagRe = /(?<!^)\b\w+(?:\s+\w+)*\s*<\/(t|think|thinking|thought|antthinking)>/gi;

console.log("Test 1:", test1);
console.log("Matches:", test1.match(plainClosingTagRe));
console.log("After replacement:", test1.replace(plainClosingTagRe, ""));

console.log("\nTest 2:", test2);
console.log("Matches:", test2.match(plainClosingTagRe));
console.log("After replacement:", test2.replace(plainClosingTagRe, ""));
