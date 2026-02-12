// Check our condition for finding thinkingđ
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";

console.log("Checking condition at position 53:");
console.log("i + 7 < length:", 53 + 7 < overlappingText.length);
console.log("substring:", overlappingText.substring(53, 61));
console.log("Expected: thinking\u0111");
console.log("Match:", overlappingText.substring(53, 61) === "thinking\u0111");

// Let's check the actual Unicode character
console.log("\nCharacter at position 61:");
console.log("Character:", overlappingText.charAt(61));
console.log("Character code:", overlappingText.charCodeAt(61));
console.log("Expected character code for đ:", "đ".charCodeAt(0));

// Create the expected string
const expected = "thinking" + String.fromCharCode(273);
console.log("\nExpected string:", expected);
console.log("Actual string:", overlappingText.substring(53, 61));
console.log("Match:", overlappingText.substring(53, 61) === expected);
