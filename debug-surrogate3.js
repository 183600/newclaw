// Test script for surrogate pairs
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

  console.log(`  Initial from=${from}, to=${to}`);

  // Adjust from position if it's in the middle of a surrogate pair
  // If from points to a low surrogate, move it to after the pair
  if (from > 0 && from < len) {
    const codeUnit = input.charCodeAt(from);
    console.log(`  from codeUnit=${codeUnit} (0x${codeUnit.toString(16)})`);
    if (isLowSurrogate(codeUnit)) {
      console.log(`  from is low surrogate, moving from from ${from} to ${from + 1}`);
      from += 1;
    }
  }

  // Adjust to position if it would split a surrogate pair
  // If to points to a low surrogate, move it forward to avoid splitting
  if (to >= 0 && to < len) {
    const codeUnit = input.charCodeAt(to);
    console.log(`  to codeUnit=${codeUnit} (0x${codeUnit.toString(16)})`);
    if (isLowSurrogate(codeUnit)) {
      console.log(`  to is low surrogate, moving to from ${to} to ${to + 1}`);
      to += 1;
    }
  }

  console.log(`  Final from=${from}, to=${to}`);
  return input.slice(from, to);
}

// Test cases
console.log("Testing surrogate pairs...");
const emoji = "🌟";
console.log("Emoji:", emoji);
console.log("Length:", emoji.length);
for (let i = 0; i < emoji.length; i++) {
  const code = emoji.charCodeAt(i);
  console.log(
    `  [${i}] codeUnit=${code} (0x${code.toString(16)}) high=${isHighSurrogate(code)} low=${isLowSurrogate(code)}`,
  );
}

console.log("\nTest 1: sliceUtf16Safe(emoji, 0, 2)");
const result1 = sliceUtf16Safe(emoji, 0, 2);
console.log("Result:", result1);
console.log("Expected: 🌟");
console.log("Pass:", result1 === "🌟");

console.log('\nTest 2: sliceUtf16Safe("a🌟b", 0, 3)');
const testStr = "a🌟b";
console.log("String:", testStr);
console.log("Length:", testStr.length);
for (let i = 0; i < testStr.length; i++) {
  const code = testStr.charCodeAt(i);
  console.log(
    `  [${i}] codeUnit=${code} (0x${code.toString(16)}) high=${isHighSurrogate(code)} low=${isLowSurrogate(code)}`,
  );
}
const result2 = sliceUtf16Safe(testStr, 0, 3);
console.log("Result:", result2);
console.log("Expected: a🌟");
console.log("Pass:", result2 === "a🌟");

console.log('\nTest 3: sliceUtf16Safe("a🌟b", 1, 3)');
const result3 = sliceUtf16Safe(testStr, 1, 3);
console.log("Result:", result3);
console.log("Expected: 🌟");
console.log("Pass:", result3 === "🌟");

console.log('\nTest 4: sliceUtf16Safe("a🌟b", 2, 3)');
const result4 = sliceUtf16Safe(testStr, 2, 3);
console.log("Result:", result4);
console.log("Expected: b");
console.log("Pass:", result4 === "b");
