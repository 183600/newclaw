// Test regex pattern
const WORD_CLOSE_RE =
  /\b(?:This is|This should be|First|Second|Third|One|Two|Three|Zero)\s+(thinking|thought|antthinking)\u0111|\b(?:This is|This should be|First|Second|Third|One|Two|Three|Zero)\s+(thinking|thought|antthinking)(?=[.!?]|\s|$)|\u0110more\s+\w+\u0111/gi;

const text = "Before This is thinkingđ after.";
const matches = [...text.matchAll(WORD_CLOSE_RE)];
console.log("Matches:", matches);
console.log("Match count:", matches.length);

for (const match of matches) {
  console.log("Full match:", match[0]);
  console.log("Index:", match.index);
  console.log("Groups:", match.slice(1));
}
