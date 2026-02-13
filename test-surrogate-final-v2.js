function isHighSurrogate(codeUnit) {
  return codeUnit >= 0xd800 && codeUnit <= 0xdbff;
}

function isLowSurrogate(codeUnit) {
  return codeUnit >= 0xdc00 && codeUnit <= 0xdfff;
}

function sliceUtf16Safe(input, start, end) {
  const len = input.length;

  let from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
  let to = end === undefined ? len : end < 0 ? Math.max(len + end, 0) : Math.min(end, len);

  if (to < from) {
    const tmp = from;
    from = to;
    to = tmp;
  }

  // Adjust from position if it's in the middle of a surrogate pair
  // If from points to a low surrogate, move it to after the pair
  if (from > 0 && from < len) {
    const codeUnit = input.charCodeAt(from);
    if (isLowSurrogate(codeUnit)) {
      from += 1;
    }
  }

  // Adjust to position if it would split a surrogate pair
  // If to-1 points to a high surrogate, move back to avoid splitting
  if (to > 0 && to < len) {
    const codeUnit = input.charCodeAt(to - 1);
    if (isHighSurrogate(codeUnit)) {
      to -= 1;
    }
  }

  // If to points to a low surrogate, move it forward to avoid splitting
  if (to >= 0 && to < len) {
    const codeUnit = input.charCodeAt(to);
    if (isLowSurrogate(codeUnit)) {
      to += 1;
    }
  }

  return input.slice(from, to);
}

console.log("Testing surrogate pairs...");
const emoji = "🌟";
console.log("Emoji:", emoji);
console.log("Length:", emoji.length);
for (let i = 0; i < emoji.length; i++) {
  const codeUnit = emoji.charCodeAt(i);
  console.log(
    `  [${i}] codeUnit=${codeUnit} (0x${codeUnit.toString(16)}) high=${isHighSurrogate(codeUnit)} low=${isLowSurrogate(codeUnit)}`,
  );
}

console.log("\nTest 1: sliceUtf16Safe(emoji, 0, 2)");
const result1 = sliceUtf16Safe(emoji, 0, 2);
console.log("Result:", result1, "Length:", result1.length);
console.log("Expected: 🌟");
console.log("Pass:", result1 === "🌟");

console.log("\nTest 2: sliceUtf16Safe('a🌟b', 0, 3)");
const testStr = "a🌟b";
console.log("String:", testStr);
console.log("Length:", testStr.length);
for (let i = 0; i < testStr.length; i++) {
  const codeUnit = testStr.charCodeAt(i);
  console.log(
    `  [${i}] codeUnit=${codeUnit} (0x${codeUnit.toString(16)}) high=${isHighSurrogate(codeUnit)} low=${isLowSurrogate(codeUnit)}`,
  );
}
const result2 = sliceUtf16Safe(testStr, 0, 3);
console.log("Result:", result2, "Length:", result2.length);
console.log("Expected: a🌟");
console.log("Pass:", result2 === "a🌟");

console.log("\nTest 3: sliceUtf16Safe('a🌟b', 1, 3)");
const result3 = sliceUtf16Safe(testStr, 1, 3);
console.log("Result:", result3, "Length:", result3.length);
console.log("Expected: 🌟");
console.log("Pass:", result3 === "🌟");

console.log("\nTest 4: sliceUtf16Safe('a🌟b', 2, 3)");
// Debug this specific case
console.log("from=2, to=3");
console.log("input[2] (from):", testStr[2], "code:", testStr.charCodeAt(2));
console.log("input[3] (to):", testStr[3], "code:", testStr.charCodeAt(3));

let from = 2;
let to = 3;
console.log("\nInitial from=", from, "to=", to);

// Adjust from
if (from > 0 && from < testStr.length) {
  const codeUnit = testStr.charCodeAt(from);
  if (isLowSurrogate(codeUnit)) {
    from += 1;
    console.log("from is low surrogate, moving to", from);
  }
}

// Adjust to-1
if (to > 0 && to < testStr.length) {
  const codeUnit = testStr.charCodeAt(to - 1);
  if (isHighSurrogate(codeUnit)) {
    to -= 1;
    console.log("to-1 is high surrogate, moving to back to", to);
  }
}

// Adjust to if it's a low surrogate
if (to >= 0 && to < testStr.length) {
  const codeUnit = testStr.charCodeAt(to);
  if (isLowSurrogate(codeUnit)) {
    to += 1;
    console.log("to is low surrogate, moving forward to", to);
  }
}

console.log("Final from=", from, "to=", to);
console.log("slice(", from, ",", to, "):", testStr.slice(from, to));

const result4 = sliceUtf16Safe(testStr, 2, 3);
console.log("\nResult:", result4, "Length:", result4.length);
console.log("Expected: b");
console.log("Pass:", result4 === "b");

console.log("\nBuilt-in slice behavior:");
console.log("'a🌟b'.slice(2, 3):", testStr.slice(2, 3));
console.log("'a🌟b'.slice(3, 4):", testStr.slice(3, 4));
