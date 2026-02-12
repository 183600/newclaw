// Step-by-step debugging
const text = "Before <thinking>content after.";
console.log("Original text:", text);
console.log("Original length:", text.length);

// Step 1: Find the thinking tag
const thinkingIndex = text.indexOf("<thinking>");
console.log("<thinking> at position:", thinkingIndex);

// Step 2: Extract the part before the tag
const beforeTag = text.slice(0, thinkingIndex);
console.log("Before tag:", beforeTag);
console.log("Before tag length:", beforeTag.length);
console.log("Last character:", beforeTag.charAt(beforeTag.length - 1));
console.log("Last character code:", beforeTag.charCodeAt(beforeTag.length - 1));

// Step 3: This should be the expected result
const expected = beforeTag;
console.log("Expected:", expected);
console.log("Expected length:", expected.length);

// Step 4: Check if it matches the test expectation
console.log('Matches "Before ":', expected === "Before ");
