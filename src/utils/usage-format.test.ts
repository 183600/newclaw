import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import {
  formatTokenCount,
  formatUsd,
  resolveModelCostConfig,
  estimateUsageCost,
  type ModelCostConfig,
  type UsageTotals,
} from "./usage-format.js";

describe("formatTokenCount", () => {
  it("should return '0' for undefined input", () => {
    expect(formatTokenCount(undefined)).toBe("0");
  });

  it("should return '0' for NaN input", () => {
    expect(formatTokenCount(NaN)).toBe("0");
  });

  it("should return '0' for infinite input", () => {
    expect(formatTokenCount(Infinity)).toBe("0");
    expect(formatTokenCount(-Infinity)).toBe("0");
  });

  it("should return '0' for negative input", () => {
    expect(formatTokenCount(-100)).toBe("0");
  });

  it("should return rounded value for small numbers", () => {
    expect(formatTokenCount(0)).toBe("0");
    expect(formatTokenCount(1)).toBe("1");
    expect(formatTokenCount(123)).toBe("123");
    expect(formatTokenCount(999)).toBe("999");
  });

  it("should format thousands with 'k' suffix", () => {
    expect(formatTokenCount(1000)).toBe("1.0k");
    expect(formatTokenCount(1500)).toBe("1.5k");
    expect(formatTokenCount(9999)).toBe("10.0k");
  });

  it("should format large thousands without decimal", () => {
    expect(formatTokenCount(10000)).toBe("10k");
    expect(formatTokenCount(12345)).toBe("12k");
    expect(formatTokenCount(999999)).toBe("1000k");
  });

  it("should format millions with 'm' suffix", () => {
    expect(formatTokenCount(1_000_000)).toBe("1.0m");
    expect(formatTokenCount(1_500_000)).toBe("1.5m");
    expect(formatTokenCount(10_000_000)).toBe("10.0m");
  });

  it("should handle decimal values", () => {
    expect(formatTokenCount(0.5)).toBe("0");
    expect(formatTokenCount(0.9)).toBe("1");
    expect(formatTokenCount(123.7)).toBe("124");
  });
});

describe("formatUsd", () => {
  it("should return undefined for undefined input", () => {
    expect(formatUsd(undefined)).toBeUndefined();
  });

  it("should return undefined for NaN input", () => {
    expect(formatUsd(NaN)).toBeUndefined();
  });

  it("should return undefined for infinite input", () => {
    expect(formatUsd(Infinity)).toBeUndefined();
    expect(formatUsd(-Infinity)).toBeUndefined();
  });

  it("should return undefined for negative input", () => {
    expect(formatUsd(-1)).toBeUndefined();
    expect(formatUsd(-0.01)).toBeUndefined();
  });

  it("should return '$0.00' for zero", () => {
    expect(formatUsd(0)).toBe("$0.00");
  });

  it("should format values >= $1", () => {
    expect(formatUsd(1)).toBe("$1.00");
    expect(formatUsd(1.5)).toBe("$1.50");
    expect(formatUsd(10)).toBe("$10.00");
    expect(formatUsd(10.5)).toBe("$10.50");
    expect(formatUsd(123.45)).toBe("$123.45");
  });

  it("should format values >= $0.01", () => {
    expect(formatUsd(0.01)).toBe("$0.01");
    expect(formatUsd(0.1)).toBe("$0.10");
    expect(formatUsd(0.5)).toBe("$0.50");
    expect(formatUsd(0.99)).toBe("$0.99");
  });

  it("should format values < $0.01 with 4 decimal places", () => {
    expect(formatUsd(0.001)).toBe("$0.0010");
    expect(formatUsd(0.0001)).toBe("$0.0001");
    expect(formatUsd(0.00001)).toBe("$0.0000");
  });
});

describe("resolveModelCostConfig", () => {
  it("should return undefined for undefined provider", () => {
    const config = {} as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: undefined,
      model: "gpt-4",
      config,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for null provider", () => {
    const config = {} as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: null,
      model: "gpt-4",
      config,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for empty provider", () => {
    const config = {} as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: "",
      model: "gpt-4",
      config,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for undefined model", () => {
    const config = {} as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: "openai",
      model: undefined,
      config,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for null model", () => {
    const config = {} as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: "openai",
      model: null,
      config,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for empty model", () => {
    const config = {} as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: "openai",
      model: "",
      config,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for undefined config", () => {
    const result = resolveModelCostConfig({
      provider: "openai",
      model: "gpt-4",
      config: undefined,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for config without models", () => {
    const config = {} as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: "openai",
      model: "gpt-4",
      config,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for config without providers", () => {
    const config = { models: {} } as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: "openai",
      model: "gpt-4",
      config,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for unknown provider", () => {
    const config = {
      models: {
        providers: {
          openai: {
            models: [
              {
                id: "gpt-4",
                cost: { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 },
              },
            ],
          },
        },
      },
    } as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: "unknown",
      model: "gpt-4",
      config,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for unknown model", () => {
    const config = {
      models: {
        providers: {
          openai: {
            models: [
              {
                id: "gpt-4",
                cost: { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 },
              },
            ],
          },
        },
      },
    } as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: "openai",
      model: "unknown",
      config,
    });
    expect(result).toBeUndefined();
  });

  it("should return cost config for known provider and model", () => {
    const costConfig = { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 };
    const config = {
      models: {
        providers: {
          openai: {
            models: [{ id: "gpt-4", cost: costConfig }],
          },
        },
      },
    } as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: "openai",
      model: "gpt-4",
      config,
    });
    expect(result).toEqual(costConfig);
  });

  it("should trim provider and model", () => {
    const costConfig = { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 };
    const config = {
      models: {
        providers: {
          openai: {
            models: [{ id: "gpt-4", cost: costConfig }],
          },
        },
      },
    } as OpenClawConfig;
    const result = resolveModelCostConfig({
      provider: "  openai  ",
      model: "  gpt-4  ",
      config,
    });
    expect(result).toEqual(costConfig);
  });
});

describe("estimateUsageCost", () => {
  it("should return undefined for undefined usage", () => {
    const cost: ModelCostConfig = { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 };
    const result = estimateUsageCost({ usage: undefined, cost });
    expect(result).toBeUndefined();
  });

  it("should return undefined for null usage", () => {
    const cost: ModelCostConfig = { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 };
    const result = estimateUsageCost({ usage: null, cost });
    expect(result).toBeUndefined();
  });

  it("should return undefined for undefined cost", () => {
    const usage: UsageTotals = { input: 1000, output: 500 };
    const result = estimateUsageCost({ usage, cost: undefined });
    expect(result).toBeUndefined();
  });

  it("should return undefined for infinite cost values", () => {
    const usage: UsageTotals = { input: 1000, output: 500 };
    const cost: ModelCostConfig = {
      input: Infinity,
      output: 0.02,
      cacheRead: 0.005,
      cacheWrite: 0.01,
    };
    const result = estimateUsageCost({ usage, cost });
    expect(result).toBeUndefined();
  });

  it("should return 0 for zero usage", () => {
    const usage: UsageTotals = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    const cost: ModelCostConfig = { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 };
    const result = estimateUsageCost({ usage, cost });
    expect(result).toBe(0);
  });

  it("should calculate cost for input and output tokens", () => {
    const usage: UsageTotals = { input: 1000, output: 500 };
    const cost: ModelCostConfig = { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 };
    const result = estimateUsageCost({ usage, cost });
    // (1000 * 0.01 + 500 * 0.02) / 1_000_000 = (10 + 10) / 1_000_000 = 0.00002
    expect(result).toBe(0.00002);
  });

  it("should calculate cost for all token types", () => {
    const usage: UsageTotals = { input: 1000, output: 500, cacheRead: 200, cacheWrite: 100 };
    const cost: ModelCostConfig = { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 };
    const result = estimateUsageCost({ usage, cost });
    // (1000 * 0.01 + 500 * 0.02 + 200 * 0.005 + 100 * 0.01) / 1_000_000 = (10 + 10 + 1 + 1) / 1_000_000 = 0.000022
    expect(result).toBe(0.000022);
  });

  it("should handle missing usage fields", () => {
    const usage: UsageTotals = { input: 1000 };
    const cost: ModelCostConfig = { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 };
    const result = estimateUsageCost({ usage, cost });
    // (1000 * 0.01) / 1_000_000 = 10 / 1_000_000 = 0.00001
    expect(result).toBe(0.00001);
  });

  it("should handle infinite usage values", () => {
    const usage: UsageTotals = { input: Infinity, output: 500 };
    const cost: ModelCostConfig = { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 };
    const result = estimateUsageCost({ usage, cost });
    expect(result).toBeUndefined();
  });

  it("should handle NaN usage values", () => {
    const usage: UsageTotals = { input: NaN, output: 500 };
    const cost: ModelCostConfig = { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 };
    const result = estimateUsageCost({ usage, cost });
    expect(result).toBeUndefined();
  });

  it("should handle negative cost values", () => {
    const usage: UsageTotals = { input: 1000, output: 500 };
    const cost: ModelCostConfig = {
      input: -0.01,
      output: 0.02,
      cacheRead: 0.005,
      cacheWrite: 0.01,
    };
    const result = estimateUsageCost({ usage, cost });
    // Negative cost: (1000 * -0.01) / 1_000_000 = -0.00001
    expect(result).toBe(-0.00001);
  });

  it("should handle all negative cost values", () => {
    const usage: UsageTotals = { input: 1000, output: 500, cacheRead: 200, cacheWrite: 100 };
    const cost: ModelCostConfig = {
      input: -0.01,
      output: -0.02,
      cacheRead: -0.005,
      cacheWrite: -0.01,
    };
    const result = estimateUsageCost({ usage, cost });
    // All negative: (1000 * -0.01 + 500 * -0.02 + 200 * -0.005 + 100 * -0.01) / 1_000_000 = (-10 - 10 - 1 - 1) / 1_000_000 = -0.000022
    expect(result).toBe(-0.000022);
  });
});
