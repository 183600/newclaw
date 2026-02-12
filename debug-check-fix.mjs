// Check if the fix is actually in the loaded module
import fs from "fs";

// Read the source file directly
const sourceContent = fs.readFileSync("./src/shared/text/reasoning-tags.ts", "utf8");

// Check if our fix is in the source
console.log("=== Checking Source File ===");
const hasArbitraryWordPattern = sourceContent.includes(
  "// Also handle arbitrary words with &#x111; and &#x110; patterns",
);
console.log("Has arbitrary word pattern:", hasArbitraryWordPattern);

if (hasArbitraryWordPattern) {
  // Find the relevant lines
  const lines = sourceContent.split("\n");
  const entityConversionLines = lines.filter(
    (line) => line.includes("&#x111;") || line.includes("&#x110;"),
  );
  console.log("Entity conversion lines:");
  entityConversionLines.forEach((line) => console.log("  ", line));
}

// Also check if there might be a compiled version being used instead
console.log("\n=== Checking for Compiled Version ===");
try {
  const distContent = fs.readFileSync("./dist/shared-DEdNAXw7.js", "utf8");
  const hasPatternInDist = distContent.includes("&#x111;");
  console.log("Has &#x111; in dist file:", hasPatternInDist);
} catch (e) {
  console.log("No dist file found");
}
