// Let's test what the function should do with closing tags
console.log("=== Testing Closing Tag Behavior ===");

// Test case 1: Complete tag pair
const completeTag = "Before <thinking>content</thinking> after.";
console.log("Complete tag input:", completeTag);
console.log("Expected: Before  after. (remove entire tag and content)");

// Test case 2: Only closing tag
const onlyClosingTag = "Before content</thinking> after.";
console.log("Only closing tag input:", onlyClosingTag);
console.log("Expected: Before  after. (remove closing tag and preceding content?)");

// Test case 3: Only opening tag
const onlyOpeningTag = "Before <thinking>content after.";
console.log("Only opening tag input:", onlyOpeningTag);
console.log("Expected: Before  (in strict mode, remove opening tag and content)");

// Let's check what the actual tests expect
console.log("\n=== Checking Test Expectations ===");
console.log("From reasoning-tags-enhanced.test.ts:");
console.log('Only closing tag test expects: "Before  after."');
console.log('Only opening tag test (strict mode) expects: "Before "');
