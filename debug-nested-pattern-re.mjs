const NESTED_PATTERN_RE = /u0110w+s+(thinking|thought|antthinking)u0111/gi;
const text = "Đmore thinkingđ";
const matches = [...text.matchAll(NESTED_PATTERN_RE)];
console.log("Text:", text);
console.log("Matches:", matches);
