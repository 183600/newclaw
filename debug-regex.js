// Test the regex patterns directly
const SPECIAL_CLOSE_RE = /(?:thinking|thought|antthinking)\u0111/g;
const SPECIAL_OPEN_RE = /\u0110(?:thinking|thought|antthinking)/g;

console.log("=== Testing Regex Patterns ===");

// Test special close
const test1 = "Before thinkingđ after";
console.log("Test 1:", test1);
console.log("Matches SPECIAL_CLOSE_RE:", [...test1.matchAll(SPECIAL_CLOSE_RE)]);

// Test special open
const test2 = "Before Đthinking after";
console.log("Test 2:", test2);
console.log("Matches SPECIAL_OPEN_RE:", [...test2.matchAll(SPECIAL_OPEN_RE)]);

// Test character codes
console.log("Character codes:");
console.log("đ:", "đ".charCodeAt(0).toString(16));
console.log("Đ:", "Đ".charCodeAt(0).toString(16));
console.log("\\u0111:", "\u0111".charCodeAt(0).toString(16));
console.log("\\u0110:", "\u0110".charCodeAt(0).toString(16));
