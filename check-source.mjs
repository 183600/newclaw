// Test by directly checking the function source
import fs from "fs";

const functionSource = fs.readFileSync("./src/shared/text/reasoning-tags.ts", "utf8");

// Check if preserveSpaceBefore is in the source
console.log("preserveSpaceBefore in source:", functionSource.includes("preserveSpaceBefore"));
console.log("preserveLeadingSpace in source:", functionSource.includes("preserveLeadingSpace"));

// Find the relevant sections
const lines = functionSource.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("preserveSpaceBefore")) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
  }
  if (lines[i].includes("preserveLeadingSpace")) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
  }
}
