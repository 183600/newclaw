// Test the fixed logic directly
function testOnlyOpeningTags() {
  console.log("=== Testing Only Opening Tags Logic ===");

  const text = "Before <thinking>content after.";
  console.log("Input:", text);

  // Find the thinking tag
  const HTML_THINKING_TAG_RE =
    /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;
  const match = text.match(HTML_THINKING_TAG_RE);
  console.log("Match:", match);

  if (match && !match[0].includes("</")) {
    // This is an opening tag
    const openIndex = text.indexOf(match[0]);
    console.log("Opening tag at position:", openIndex);
    console.log("Character before:", text.charAt(openIndex - 1));
    console.log("Is space before:", text.charAt(openIndex - 1) === " ");

    // Expected result
    const expected =
      openIndex > 0 && text.charAt(openIndex - 1) === " "
        ? text.slice(0, openIndex) + " "
        : text.slice(0, openIndex);

    console.log("Expected result:", expected);
    console.log("Expected result length:", expected.length);
    console.log("Last character:", expected.charAt(expected.length - 1));
    console.log("Last character code:", expected.charCodeAt(expected.length - 1));
  }
}

testOnlyOpeningTags();
