// Debug the negative cost values test

// Simulate the estimateUsageCost function
function estimateUsageCost(params) {
  const usage = params.usage;
  const cost = params.cost;
  if (!usage || !cost) {
    return undefined;
  }

  // Return undefined if any cost values are infinite
  if (
    !Number.isFinite(cost.input) ||
    !Number.isFinite(cost.output) ||
    !Number.isFinite(cost.cacheRead) ||
    !Number.isFinite(cost.cacheWrite)
  ) {
    return undefined;
  }

  // Use direct values instead of toNumber to preserve negative costs
  const input = typeof usage.input === "number" && Number.isFinite(usage.input) ? usage.input : 0;
  const output =
    typeof usage.output === "number" && Number.isFinite(usage.output) ? usage.output : 0;
  const cacheRead =
    typeof usage.cacheRead === "number" && Number.isFinite(usage.cacheRead) ? usage.cacheRead : 0;
  const cacheWrite =
    typeof usage.cacheWrite === "number" && Number.isFinite(usage.cacheWrite)
      ? usage.cacheWrite
      : 0;

  const total =
    input * cost.input +
    output * cost.output +
    cacheRead * cost.cacheRead +
    cacheWrite * cost.cacheWrite;
  if (!Number.isFinite(total)) {
    return undefined;
  }
  return total / 1_000_000;
}

// Test case from the failing test
const negativeCostConfig = { input: -0.001, output: 0.002, cacheRead: 0, cacheWrite: 0 };
const usage = { input: 1000, output: 500 };

console.log("Cost config:", negativeCostConfig);
console.log("Usage:", usage);

// Step by step calculation
const inputCost = usage.input * negativeCostConfig.input;
console.log("Input cost:", usage.input, "*", negativeCostConfig.input, "=", inputCost);

const outputCost = usage.output * negativeCostConfig.output;
console.log("Output cost:", usage.output, "*", negativeCostConfig.output, "=", outputCost);

const cacheReadCost = (usage.cacheRead || 0) * negativeCostConfig.cacheRead;
console.log(
  "Cache read cost:",
  usage.cacheRead || 0,
  "*",
  negativeCostConfig.cacheRead,
  "=",
  cacheReadCost,
);

const cacheWriteCost = (usage.cacheWrite || 0) * negativeCostConfig.cacheWrite;
console.log(
  "Cache write cost:",
  usage.cacheWrite || 0,
  "*",
  negativeCostConfig.cacheWrite,
  "=",
  cacheWriteCost,
);

const total = inputCost + outputCost + cacheReadCost + cacheWriteCost;
console.log(
  "Total cost:",
  inputCost,
  "+",
  outputCost,
  "+",
  cacheReadCost,
  "+",
  cacheWriteCost,
  "=",
  total,
);

const result = total / 1_000_000;
console.log("Result:", total, "/ 1_000_000 =", result);
console.log("Is result less than 0?", result < 0);

// Call the actual function
const functionResult = estimateUsageCost({ usage, cost: negativeCostConfig });
console.log("Function result:", functionResult);
console.log("Is function result less than 0?", functionResult < 0);
