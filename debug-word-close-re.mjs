const WORD_CLOSE_RE = /\b(?:This is|This should be|First|Second|Third|One|Two|Three)\s+\w+\u0111/gi;
const text = "Đnested thinkingđ";
const matches = [...text.matchAll(WORD_CLOSE_RE)];
console.log("Text:", text);
console.log("Matches:", matches);
