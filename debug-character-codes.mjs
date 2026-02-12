// Check the actual character at position 60
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";
console.log("Text:", overlappingText);

// Check the character at position 60 (should be đ)
const charAt60 = overlappingText.charAt(60);
console.log("Character at position 60:", charAt60);
console.log("Character code at position 60:", overlappingText.charCodeAt(60));

// Check what đ should be
console.log("Character code for đ:", "đ".charCodeAt(0));

// Check if they match
console.log("Match:", overlappingText.charCodeAt(60) === "đ".charCodeAt(0));

// Let's check the substring more carefully
console.log("\nSubstring from 53 to 61:");
for (let i = 53; i < 61; i++) {
  console.log(`  Position ${i}: "${overlappingText.charAt(i)}" (${overlappingText.charCodeAt(i)})`);
}

// Check if the substring matches thinkingđ
const substring = overlappingText.substring(53, 61);
console.log("\nSubstring:", substring);
console.log("Expected: thinkingđ");
console.log("Match:", substring === "thinkingđ");
