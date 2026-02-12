import { normalizePollDurationHours } from "./src/polls.js";

// 测试 normalizePollDurationHours 的浮点精度
const testCases = [
  {
    name: "floating point precision 1",
    value: 0.1 + 0.2, // 0.30000000000000004
    options: { defaultHours: 24, maxHours: 72 },
    expected: 0,
  },
  {
    name: "floating point precision 2",
    value: 23.99999999999999,
    options: { defaultHours: 24, maxHours: 72 },
    expected: 23,
  },
];

testCases.forEach((test) => {
  console.log(`\n=== 测试: ${test.name} ===`);
  console.log(`输入值: ${test.value}`);
  console.log(`实际值: ${JSON.stringify(test.value)}`);
  console.log(`Math.floor 结果: ${Math.floor(test.value)}`);
  console.log(`期望: ${test.expected}`);

  const result = normalizePollDurationHours(test.value, test.options);
  console.log(`结果: ${result}`);
  console.log(`通过: ${result === test.expected}`);
});

// 测试边界情况
console.log(`\n=== 测试边界情况 ===`);
const edgeCases = [
  { value: Number.POSITIVE_INFINITY, expected: 72 },
  { value: Number.NEGATIVE_INFINITY, expected: 1 },
  { value: NaN, expected: 24 },
  { value: undefined, expected: 24 },
];

edgeCases.forEach((test) => {
  console.log(`\n值: ${test.value}`);
  const result = normalizePollDurationHours(test.value, { defaultHours: 24, maxHours: 72 });
  console.log(`结果: ${result}, 期望: ${test.expected}, 通过: ${result === test.expected}`);
});
