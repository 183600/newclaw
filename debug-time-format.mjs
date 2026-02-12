import { formatRelativeTime } from "./src/utils/time-format.js";

// 测试系统时钟边界情况
const testCases = [
  {
    name: "MAX_SAFE_INTEGER",
    timestamp: Number.MAX_SAFE_INTEGER,
    description: "非常大的时间戳",
  },
  {
    name: "0",
    timestamp: 0,
    description: "最小时间戳",
  },
  {
    name: "MIN_SAFE_INTEGER",
    timestamp: Number.MIN_SAFE_INTEGER,
    description: "最小安全整数时间戳",
  },
];

testCases.forEach((test) => {
  console.log(`\n=== 测试: ${test.name} ===`);
  console.log(`描述: ${test.description}`);
  console.log(`时间戳: ${test.timestamp}`);

  try {
    const result = formatRelativeTime(test.timestamp);
    console.log(`结果: ${result}`);
    console.log(`匹配模式: ${/^[A-Za-z]{3} \d+$/.test(result)}`);
  } catch (error) {
    console.log(`错误: ${error.message}`);
  }
});

// 测试当前时间
console.log(`\n=== 测试: 当前时间 ===`);
const now = Date.now();
console.log(`当前时间戳: ${now}`);
const nowResult = formatRelativeTime(now);
console.log(`结果: ${nowResult}`);
