const text = "Before This is thinking</thinking> after.";
console.log("Text with indices:");
for (let i = 0; i < text.length; i++) {
  if (text.substring(i, i + 5) === "This" || text.substring(i, i + 8) === "thinking") {
    console.log(`  ${i}: ${text[i]} (${text.substring(i, i + 10)}...)`);
  }
}

// 需要找到 "This" 的开始位置
const thinkingIdx = text.indexOf("thinking");
console.log('\n"thinking" at index:', thinkingIdx);

// 向前查找 "This" 的开始
let thisIdx = thinkingIdx;
// 先找到 "is" 前面的空格
while (thisIdx > 0 && text[thisIdx - 1] !== " ") {
  thisIdx--;
}
console.log('Space before "thinking" at:', thisIdx);

// 跳过空格
while (thisIdx > 0 && text[thisIdx - 1] === " ") {
  thisIdx--;
}
console.log('End of "is" at:', thisIdx);

// 找到 "is" 的开始
while (thisIdx > 0 && text[thisIdx - 1] !== " ") {
  thisIdx--;
}
console.log('Space before "is" at:', thisIdx);

// 跳过空格
while (thisIdx > 0 && text[thisIdx - 1] === " ") {
  thisIdx--;
}
console.log('End of "This" at:', thisIdx);

// 找到 "This" 的开始
while (thisIdx > 0 && text[thisIdx - 1] !== " ") {
  thisIdx--;
}
console.log('Start of "This" at:', thisIdx);

// 如果在空格处，前进一位
if (thisIdx > 0 && text[thisIdx] === " ") {
  thisIdx++;
}
console.log("Final start index:", thisIdx);
