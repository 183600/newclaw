// Debug the pattern processing step by step
let text1 = "Before &#x110;thinking middle thinking&#x111; after.";
console.log("Original:", text1);

// Step 1: Convert HTML entities
let cleaned1 = text1.replace(/thinking&#x111;/g, "thinkingđ");
cleaned1 = cleaned1.replace(/&#x110;thinking/g, "Đthinking");
console.log("After entity conversion:", cleaned1);

// Step 2: Handle mixed patterns
cleaned1 = cleaned1.replace(/&#x110;thinking(.*?)thinking&#x111;/g, function (match, content) {
  return "Đthinking" + content + "thinkingđ";
});
console.log("After mixed pattern:", cleaned1);

// Step 3: Handle the Đthinking...thinkingđ pattern
cleaned1 = cleaned1.replace(/Đthinking(.*?)thinkingđ/g, function (match, content) {
  return "Đthinking" + content + "thinkingđ";
});
console.log("After Đthinking pattern:", cleaned1);

console.log("\n---\n");

let text2 = "Before Đthinking content thinkingđ after.";
console.log("Original:", text2);

// Step 1: Handle mixed patterns
let cleaned2 = text2.replace(/\u0110thinking(.*?)thinking\u0111/g, function (match, content) {
  return "Đthinking" + content + "thinkingđ";
});
console.log("After mixed pattern:", cleaned2);

// Step 2: Handle the Đthinking...thinkingđ pattern
cleaned2 = cleaned2.replace(/Đthinking(.*?)thinkingđ/g, function (match, content) {
  return "Đthinking" + content + "thinkingđ";
});
console.log("After Đthinking pattern:", cleaned2);
