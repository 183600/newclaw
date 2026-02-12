// Debug the only opening tags case
console.log("=== Only Opening Tags Debug ===");
const onlyOpeningText = "Before <thinking>content after.";
console.log("Input:", onlyOpeningText);

// Find the position of <thinking>
const thinkingIndex = onlyOpeningText.indexOf("<thinking>");
console.log("<thinking> found at position:", thinkingIndex);

// Check if there's a space before it
console.log("Character before <thinking>:", onlyOpeningText.charAt(thinkingIndex - 1));
console.log("Is it a space?:", onlyOpeningText.charAt(thinkingIndex - 1) === " ");

// Expected result
console.log('\nExpected result: "Before "');
console.log("This means we should:");
console.log("1. Keep the space before <thinking>");
console.log("2. Remove everything from <thinking> to the end");

// Let's manually do this
const result = onlyOpeningText.slice(0, thinkingIndex - 1) + " ";
console.log("Manual result:", result);
console.log("Matches expected:", result === "Before ");
