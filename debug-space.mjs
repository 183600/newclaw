// Test the space handling logic
const cleaned = "Before This is thinkingđ after.";
const range = { start: 7, end: 24 };

console.log("Original:", JSON.stringify(cleaned));
console.log("Range:", range.start, "-", range.end);
console.log("Removing:", JSON.stringify(cleaned.slice(range.start, range.end)));

const beforeChar = cleaned[range.start - 1];
const afterChar = cleaned[range.end];

console.log("Before char:", JSON.stringify(beforeChar));
console.log("After char:", JSON.stringify(afterChar));

let replacement = "";

if (range.start > 0 && range.end < cleaned.length) {
  // Check for zero-width characters
  const beforeIsZeroWidth = beforeChar === "\u200B";
  const afterIsZeroWidth = afterChar === "\u200B";

  // If both sides are spaces, keep only one space
  if (beforeChar === " " && afterChar === " ") {
    replacement = " ";
    console.log("Both sides are spaces, replacing with one space");
  }
  // If both sides are non-space, non-zero-width characters, add a space
  else if (beforeChar !== " " && afterChar !== " " && !beforeIsZeroWidth && !afterIsZeroWidth) {
    replacement = " ";
    console.log("Both sides are non-space, adding space");
  }
  // If before is space and after is not space/non-zero-width, keep the space
  else if (beforeChar === " " && afterChar !== " " && !afterIsZeroWidth) {
    replacement = "";
    console.log("Before is space, after is not, keeping space");
  }
  // If after is space and before is not space/non-zero-width, keep the space
  else if (afterChar === " " && beforeChar !== " " && !beforeIsZeroWidth) {
    replacement = "";
    console.log("After is space, before is not, keeping space");
  }
  // If both sides are zero-width characters, don't add anything
  else if (beforeIsZeroWidth && afterIsZeroWidth) {
    replacement = "";
    console.log("Both sides are zero-width, not adding anything");
  }
  // If one side is zero-width, don't add anything
  else if (beforeIsZeroWidth || afterIsZeroWidth) {
    replacement = "";
    console.log("One side is zero-width, not adding anything");
  }
  // Otherwise, keep whatever spacing exists
  else {
    replacement = "";
    console.log("Otherwise, not adding anything");
  }
}

const result = cleaned.slice(0, range.start) + replacement + cleaned.slice(range.end);
console.log("Result:", JSON.stringify(result));
