// Test trim behavior
const text = "Before  after.";
console.log("Original:", repr(text));
console.log("After trim():", repr(text.trim()));
console.log("After trimStart():", repr(text.trimStart()));
console.log("After trimEnd():", repr(text.trimEnd()));

function repr(s) {
  return JSON.stringify(s);
}
