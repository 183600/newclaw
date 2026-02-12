// Debug exact characters in test
import fs from "fs";

const testFile = fs.readFileSync("src/agents/pi-embedded-utils.test.ts", "utf8");
const lines = testFile.split("\n");

// Find the test with "strips thinking tags without closing tag"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("strips thinking tags without closing tag")) {
    // Look for the text definition in the next few lines
    for (let j = i; j < Math.min(i + 10, lines.length); j++) {
      if (lines[j].includes("text:")) {
        console.log(`Line ${j + 1}:`, JSON.stringify(lines[j]));
        // Extract the text value
        const match = lines[j].match(/text:\s*"([^"]+)"/);
        if (match) {
          console.log("Extracted text:", JSON.stringify(match[1]));
          console.log(
            "Character codes:",
            [...match[1]].map((c) => c.charCodeAt(0)),
          );
        }
      }
    }
    break;
  }
}
