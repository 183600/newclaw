// Debug script to check actual characters in test file
import fs from 'fs';

const testContent = fs.readFileSync('./src/shared/text/reasoning-tags.test.ts', 'utf8');

// Find specific lines
const lines = testContent.split('
');
let inCodeBlockTest = false;
let textLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('should preserve content within code blocks')) {
    inCodeBlockTest = true;
  }
  
  if (inCodeBlockTest) {
    if (line.includes('const text = `')) {
      // Start collecting text lines
      textLines.push(line.slice('const text = `'.length));
    } else if (textLines.length > 0) {
      if (line.includes('`;')) {
        // End of text
        textLines.push(line.slice(0, line.indexOf('`;')));
        break;
      } else {
        textLines.push(line);
      }
    }
  }
}

const fullText = textLines.join('\n');
console.log("=== Full text ===");
console.log(fullText);

// Check for special characters
console.log("\n=== Looking for special characters ===");
const preservedMatch = fullText.match(/This should be preserved(.+?)\n/);
if (preservedMatch) {
  console.log("Preserved line:", preservedMatch[0]);
  console.log("Special char:", preservedMatch[1]);
  console.log("Special char code:", preservedMatch[1].charCodeAt(0));
}

const removedMatch = fullText.match(/This should be removed(.+?)\s/);
if (removedMatch) {
  console.log("\nRemoved line:", removedMatch[0]);
  console.log("Special char:", removedMatch[1]);
  console.log("Special char code:", removedMatch[1].charCodeAt(0));
}