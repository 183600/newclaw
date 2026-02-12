// Check what's actually in the test file
import fs from "fs";

const testFile = fs.readFileSync("src/agents/pi-embedded-utils.test.ts", "utf8");
const lines = testFile.split("\n");

// Find the test with "strips thinking tags without closing tag"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("strips thinking tags without closing tag")) {
    console.log("Found test at line", i + 1);
    // Look for the text definition in the next few lines
    for (let j = i; j < Math.min(i + 10, lines.length); j++) {
      console.log(`Line ${j + 1}:`, lines[j]);
    }
    break;
  }
}
