import fs from "fs";

// Check what the actual test file contains
const testContent = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Before This is thinking")) {
    console.log("Line", i, ":", JSON.stringify(lines[i]));
    // Print character codes around 'thinking'
    for (let j = 0; j < lines[i].length; j++) {
      if (lines[i][j] === "t" && lines[i].substring(j, j + 8) === "thinking") {
        console.log("Found 'thinking' at position", j);
        console.log("Next 10 chars:", JSON.stringify(lines[i].substring(j, j + 10)));
        console.log("Next 10 char codes:");
        for (let k = 0; k < 10; k++) {
          if (j + k < lines[i].length) {
            console.log(`  ${k}: '${lines[i][j + k]}' (${lines[i].charCodeAt(j + k)})`);
          }
        }
      }
    }
  }
}
