import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import {
  estimateUsageCost,
  formatTokenCount,
  formatUsd,
  resolveModelCostConfig,
} from "./usage-format.js";

describe("formatTokenCount", () => {
  it("returns '0' for undefined values", () => {
    expect(formatTokenCount(undefined)).toBe("0");
  });

  it("returns '0' for NaN values", () => {
    expect(formatTokenCount(NaN)).toBe("0");
  });

  it("returns '0' for infinite values", () => {
    expect(formatTokenCount(Infinity)).toBe("0");
    expect(formatTokenCount(-Infinity)).toBe("0");
  });

  it("returns '0' for negative values", () => {
    expect(formatTokenCount(-100)).toBe("0");
    expect(formatTokenCount(-1000)).toBe("0");
  });

  it("returns exact number for small values", () => {
    expect(formatTokenCount(0)).toBe("0");
    expect(formatTokenCount(1)).toBe("1");
    expect(formatTokenCount(42)).toBe("42");
    expect(formatTokenCount(999)).toBe("999");
  });

  it("formats thousands with 'k' suffix", () => {
    expect(formatTokenCount(1000)).toBe("1.0k");
    expect(formatTokenCount(1500)).toBe("1.5k");
    expect(formatTokenCount(1234)).toBe("1.2k");
    expect(formatTokenCount(9999)).toBe("10.0k"); // Rounds to 0 decimal for >= 10k
  });

  it("formats large thousands with integer 'k' suffix", () => {
    expect(formatTokenCount(10000)).toBe("10k");
    expect(formatTokenCount(15000)).toBe("15k");
    expect(formatTokenCount(12345)).toBe("12k");
    expect(formatTokenCount(999999)).toBe("1000k");
  });

  it("formats millions with 'm' suffix", () => {
    expect(formatTokenCount(1_000_000)).toBe("1.0m");
    expect(formatTokenCount(1_500_000)).toBe("1.5m");
    expect(formatTokenCount(2_345_678)).toBe("2.3m");
    expect(formatTokenCount(10_000_000)).toBe("10.0m");
  });

  it("handles decimal values", () => {
    expect(formatTokenCount(123.7)).toBe("124"); // Rounds
    expect(formatTokenCount(999.6)).toBe("1000");
  });
});

describe("formatUsd", () => {
  it("returns undefined for undefined values", () => {
    expect(formatUsd(undefined)).toBeUndefined();
  });

  it("returns undefined for NaN values", () => {
    expect(formatUsd(NaN)).toBeUndefined();
  });

  it("returns undefined for infinite values", () => {
    expect(formatUsd(Infinity)).toBeUndefined();
    expect(formatUsd(-Infinity)).toBeUndefined();
  });

  it("formats values >= 1 with 2 decimal places", () => {
    expect(formatUsd(1)).toBe("$1.00");
    expect(formatUsd(1.5)).toBe("$1.50");
    expect(formatUsd(10)).toBe("$10.00");
    expect(formatUsd(123.456)).toBe("$123.46");
  });

  it("formats values >= 0.01 with 2 decimal places", () => {
    expect(formatUsd(0.01)).toBe("$0.01");
    expect(formatUsd(0.05)).toBe("$0.05");
    expect(formatUsd(0.99)).toBe("$0.99");
  });

  it("formats values < 0.01 with 4 decimal places", () => {
    expect(formatUsd(0.001)).toBe("$0.0010");
    expect(formatUsd(0.0001)).toBe("$0.0001");
    expect(formatUsd(0.00001)).toBe("$0.0000");
  });

  it("handles zero", () => {
    expect(formatUsd(0)).toBe("$0.00");
  });

  it("handles very small values", () => {
    expect(formatUsd(0.000001)).toBe("$0.0000");
    expect(formatUsd(0.0000001)).toBe("$0.0000");
  });
});

describe("resolveModelCostConfig", () => {
  it("returns undefined when provider is missing", () => {
    const config = {} as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "", model: "gpt-4", config })).toBeUndefined();
    expect(resolveModelCostConfig({ provider: undefined, model: "gpt-4", config })).toBeUndefined();
  });

  it("returns undefined when model is missing", () => {
    const config = {} as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "openai", model: "", config })).toBeUndefined();
    expect(
      resolveModelCostConfig({ provider: "openai", model: undefined, config }),
    ).toBeUndefined();
  });

  it("returns undefined when config is missing", () => {
    expect(resolveModelCostConfig({ provider: "openai", model: "gpt-4" })).toBeUndefined();
  });

  it("returns undefined when provider is not in config", () => {
    const config = { models: { providers: {} } } as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "unknown", model: "gpt-4", config })).toBeUndefined();
  });

  it("returns undefined when model is not found", () => {
    const config = {
      models: {
        providers: {
          openai: {
            models: [
              {
                id: "gpt-3.5-turbo",
                cost: { input: 0.001, output: 0.002, cacheRead: 0, cacheWrite: 0 },
              },
            ],
          },
        },
      },
    } as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "openai", model: "gpt-4", config })).toBeUndefined();
  });

  it("returns cost config when provider and model are found", () => {
    const costConfig = { input: 0.001, output: 0.002, cacheRead: 0.0001, cacheWrite: 0.0002 };
    const config = {
      models: {
        providers: {
          openai: {
            models: [{ id: "gpt-4", cost: costConfig }],
          },
        },
      },
    } as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "openai", model: "gpt-4", config })).toEqual(
      costConfig,
    );
  });

  it("trims provider and model names", () => {
    const costConfig = { input: 0.001, output: 0.002, cacheRead: 0, cacheWrite: 0 };
    const config = {
      models: {
        providers: {
          openai: {
            models: [{ id: "gpt-4", cost: costConfig }],
          },
        },
      },
    } as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "  openai  ", model: "  gpt-4  ", config })).toEqual(
      costConfig,
    );
  });

  it("finds model in provider's models array", () => {
    const costConfig1 = { input: 0.001, output: 0.002, cacheRead: 0, cacheWrite: 0 };
    const costConfig2 = { input: 0.003, output: 0.004, cacheRead: 0, cacheWrite: 0 };
    const config = {
      models: {
        providers: {
          openai: {
            models: [
              { id: "gpt-3.5-turbo", cost: costConfig1 },
              { id: "gpt-4", cost: costConfig2 },
            ],
          },
        },
      },
    } as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "openai", model: "gpt-4", config })).toEqual(
      costConfig2,
    );
  });
});

describe("estimateUsageCost", () => {
  const costConfig = { input: 0.001, output: 0.002, cacheRead: 0.0001, cacheWrite: 0.0002 };

  it("returns undefined when usage is missing", () => {
    expect(estimateUsageCost({ cost: costConfig })).toBeUndefined();
    expect(estimateUsageCost({ usage: null, cost: costConfig })).toBeUndefined();
  });

  it("returns undefined when cost is missing", () => {
    expect(estimateUsageCost({ usage: { input: 1000, output: 500 } })).toBeUndefined();
  });

  it("calculates cost for input and output tokens", () => {
    const usage = { input: 1000, output: 500 };
    const expected = (1000 * 0.001 + 500 * 0.002) / 1_000_000;
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(expected);
  });

  it("calculates cost for all token types", () => {
    const usage = { input: 1000, output: 500, cacheRead: 200, cacheWrite: 100 };
    const expected = (1000 * 0.001 + 500 * 0.002 + 200 * 0.0001 + 100 * 0.0002) / 1_000_000;
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(expected);
  });

  it("handles undefined usage properties", () => {
    const usage = { input: 1000 };
    const expected = (1000 * 0.001) / 1_000_000;
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(expected);
  });

  it("handles NaN usage values", () => {
    const usage = { input: NaN, output: 500 };
    const expected = (500 * 0.002) / 1_000_000;
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(expected);
  });

  it("handles infinite usage values", () => {
    const usage = { input: Infinity, output: 500 };
    const expected = (500 * 0.002) / 1_000_000;
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(expected);
  });

  it("returns undefined for infinite total cost", () => {
    const infiniteCostConfig = { input: Infinity, output: 0.002, cacheRead: 0, cacheWrite: 0 };
    const usage = { input: 1000, output: 500 };
    expect(estimateUsageCost({ usage, cost: infiniteCostConfig })).toBeUndefined();
  });

  it("handles zero usage", () => {
    const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(0);
  });

  it("handles empty usage object", () => {
    const usage = {};
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(0);
  });

  it("works with UsageTotals type", () => {
    const usage = { input: 1000, output: 500, total: 1500 };
    const expected = (1000 * 0.001 + 500 * 0.002) / 1_000_000;
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(expected);
  });

  it("handles very large token counts", () => {
    const usage = { input: 1_000_000, output: 500_000 };
    const expected = (1_000_000 * 0.001 + 500_000 * 0.002) / 1_000_000;
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(expected);
  });
});
