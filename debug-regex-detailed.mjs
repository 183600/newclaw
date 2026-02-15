// Test the WORD_CLOSE_RE regex
const WORD_CLOSE_RE =
  /\b(?:This is|This should be|First|Second|Third|One|Two|Three|Zero)\s+(thinking|thought|antthinking)\u0111|\b(?:This is|This should be|First|Second|Third|One|Two|Three|Zero)\s+(thinking|thought|antthinking)(?=[.!?]|\s|$)|\u0110more\s+\w+\u0111/gi;

const text = "Before This is thinkingđ after.";
console.log("Original:", JSON.stringify(text));
console.log("Length:", text.length);
console.log("Char at 6:", JSON.stringify(text[6]));
console.log("Char at 7:", JSON.stringify(text[7]));

const matches = [...text.matchAll(WORD_CLOSE_RE)];
console.log("Matches:", matches);

for (const match of matches) {
  console.log("Full match:", JSON.stringify(match[0]));
  console.log("Index:", match.index);
  console.log("End:", match.index + match[0].length);
  console.log("Before char:", JSON.stringify(text[match.index - 1]));
  console.log("After char:", JSON.stringify(text[match.index + match[0].length]));
}
