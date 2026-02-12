import { normalizePollDurationHours } from "./src/polls.js";

// 详细分析第一个失败测试
const value = 0.1 + 0.2; // 0.30000000000000004
const options = { defaultHours: 24, maxHours: 72 };

console.log(`输入值: ${value}`);
console.log(`typeof value: ${typeof value}`);
console.log(`Number.isFinite(value): ${Number.isFinite(value)}`);
console.log(`value === undefined: ${value === undefined}`);
console.log(`value === Number.POSITIVE_INFINITY: ${value === Number.POSITIVE_INFINITY}`);

// 手动模拟函数逻辑
let base;
if (typeof value === "number") {
  if (Number.isFinite(value)) {
    base = Math.floor(value);
    console.log(`base = Math.floor(${value}) = ${base}`);
  } else if (value === Number.POSITIVE_INFINITY) {
    base = options.maxHours;
  } else if (value === Number.NEGATIVE_INFINITY) {
    base = 1;
  } else {
    base = options.defaultHours;
  }
} else {
  base = options.defaultHours;
}

console.log(`第一个 if 块后的 base: ${base}`);

// 检查是否进入第二个 if 块（使用新的逻辑）
if (
  value === undefined ||
  !Number.isFinite(value) ||
  value === Number.POSITIVE_INFINITY ||
  base >= 1
) {
  console.log(`进入第二个 if 块`);
  base = Math.max(base, 1);
  console.log(`base = Math.max(${base}, 1) = ${base}`);
} else {
  console.log(`不进入第二个 if 块 (base=${base} < 1)`);
}

console.log(`第二个 if 块后的 base: ${base}`);

// 最终的 clamp（使用新的逻辑）
const finalResult = Math.min(Math.max(base, 0), options.maxHours);
console.log(`最终结果: Math.min(Math.max(${base}, 0), ${options.maxHours}) = ${finalResult}`);

// 实际函数结果
const actualResult = normalizePollDurationHours(value, options);
console.log(`实际函数结果: ${actualResult}`);

// 分析测试期望
console.log(`\n测试分析:`);
console.log(`测试期望: 0`);
console.log(`但函数强制最小值为 1`);
console.log(`这可能是测试或函数逻辑的问题`);
