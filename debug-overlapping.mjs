// Test overlapping ranges in detail
console.log("=== Overlapping Ranges Test ===");
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";
console.log("Input:", overlappingText);

// Let's break it down:
console.log("\nAnalysis:");
console.log(
  '1. "Đthinking nested " - This is an unclosed special char tag, should only remove "Đthinking"',
);
console.log(
  '2. "<thinking>content</thinking>" - This is a complete HTML tag pair, should remove everything',
);
console.log(
  '3. " thinkingđ after." - This is a closing special char tag, should remove "thinkingđ"',
);

console.log('\nExpected result: "Before   after." (three spaces)');
console.log("This means:");
console.log('- Keep the space after "Before"');
console.log('- Remove "Đthinking" but keep " nested "');
console.log('- Remove "<thinking>content</thinking>" completely');
console.log('- Remove "thinkingđ" but keep " after."');
console.log(
  '- Result: "Before" + space + " nested " + space + " after." = "Before  nested  after."',
);
console.log(
  'But test expects "Before   after." (three spaces), which means " nested " should also be removed.',
);

console.log(
  "\nIt seems the test expects to remove the content between the special char tags as well.",
);
