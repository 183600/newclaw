// Test the special character tag processing
console.log("=== Special Character Tag Processing Test ===");
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";
console.log("Input:", overlappingText);

// Let's manually check the special character processing
const Đthinking = /\u0110thinking/g;
const thinkingđ = /thinking\u0111/g;

console.log("\nMatches for Đthinking:");
for (const match of overlappingText.matchAll(Đthinking)) {
  console.log(`  "${match[0]}" at position ${match.index}`);
}

console.log("\nMatches for thinkingđ:");
for (const match of overlappingText.matchAll(thinkingđ)) {
  console.log(`  "${match[0]}" at position ${match.index}`);
}

// Check for the complete pattern
const Đthinkingđ = /\u0110thinking.*?thinking\u0111/g;
console.log("\nMatches for Đthinking...thinkingđ:");
for (const match of overlappingText.matchAll(Đthinkingđ)) {
  console.log(`  "${match[0]}" from position ${match.index} to ${match.index + match[0].length}`);
}
