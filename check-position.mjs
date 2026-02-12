// Let's check the exact test case again
import fs from "fs";
const testFile = fs.readFileSync(
  "/home/runner/work/newclaw/newclaw/src/shared/text/reasoning-tags.test.ts",
  "utf8",
);

// Find the inline code test
const lines = testFile.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("should handle inline code preservation")) {
    const textLine = lines[i + 1];
    console.log("Raw line:", textLine);

    // Extract the text between quotes
    const match = textLine.match(/const text = "([^"]+)";/);
    if (match) {
      const text = match[1];
      console.log("Extracted text:", JSON.stringify(text));

      // Check if the đ is inside or outside the backticks
      const backtick1Pos = text.indexOf("`");
      const backtick2Pos = text.indexOf("`", backtick1Pos + 1);
      const đPos = text.indexOf("\u0111");

      console.log("First backtick position:", backtick1Pos);
      console.log("Second backtick position:", backtick2Pos);
      console.log("đ position:", đPos);
      console.log("đ is inside backticks:", đPos > backtick1Pos && đPos < backtick2Pos);
    }
    break;
  }
}
