// Test the unpairedWordTagRe regex
const testText = "Before This is thinking after.";
console.log("Test text:", JSON.stringify(testText));

// The regex from reasoning-tags.ts
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)/gi;

console.log("Testing unpairedWordTagRe:");
const matches = [...testText.matchAll(unpairedWordTagRe)];
console.log("Matches:", matches);

if (matches.length > 0) {
  matches.forEach((match, index) => {
    console.log(`Match ${index}:`);
    console.log(`  Full match: "${match[0]}"`);
    console.log(`  Group 1: "${match[1] || "undefined"}"`);
    console.log(`  Group 2: "${match[2] || "undefined"}"`);
    console.log(`  Index: ${match.index}`);
  });
} else {
  console.log("No matches found. Let's debug...");

  // Test parts of the pattern
  console.log("\nTesting parts:");
  console.log("Match 'This is':", /\bThis is /.test(testText));
  console.log("Match 'thinking':", /thinking/.test(testText));
  console.log("Match 'thinking</t>':", /thinking<\/t>/gi.test(testText));

  // Test the full pattern step by step
  const step1 = /(?:\bThis is |\b(\w+) )?/gi;
  const step2 = /(thinking|thought|antthinking)/gi;
  const step3 = /(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)/gi;

  console.log("\nStep by step:");
  console.log("Step 1 matches:", [...testText.matchAll(step1)]);
  console.log("Step 2 matches:", [...testText.matchAll(step2)]);
  console.log("Step 3 matches:", [...testText.matchAll(step3)]);
}
