import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import {
  estimateUsageCost,
  formatTokenCount,
  formatUsd,
  resolveModelCostConfig,
} from "./usage-format.js";

describe("formatTokenCount - Additional Tests", () => {
  it("handles very large numbers", () => {
    expect(formatTokenCount(Number.MAX_SAFE_INTEGER)).toBe("9007199254.7m");
    // Number.MAX_VALUE is finite, so it gets formatted
    expect(formatTokenCount(Number.MAX_VALUE)).toBe("1.797693134862316e+302m");
  });

  it("handles numbers at boundaries", () => {
    expect(formatTokenCount(999)).toBe("999");
    expect(formatTokenCount(1000)).toBe("1.0k");
    expect(formatTokenCount(9999)).toBe("10.0k");
    expect(formatTokenCount(10000)).toBe("10k");
    expect(formatTokenCount(999999)).toBe("1000k");
    expect(formatTokenCount(1000000)).toBe("1.0m");
  });

  it("handles decimal inputs", () => {
    expect(formatTokenCount(123.456)).toBe("123"); // Rounds
    expect(formatTokenCount(999.6)).toBe("1000");
  });
});

describe("formatUsd - Additional Tests", () => {
  it("handles very large amounts", () => {
    expect(formatUsd(1e10)).toBe("$10000000000.00");
    expect(formatUsd(Number.MAX_SAFE_INTEGER)).toBe("$9007199254740991.00");
  });

  it("handles very small amounts", () => {
    expect(formatUsd(1e-10)).toBe("$0.0000");
    expect(formatUsd(0.000000001)).toBe("$0.0000");
  });

  it("handles scientific notation", () => {
    expect(formatUsd(1.5e3)).toBe("$1500.00");
    expect(formatUsd(2.5e-3)).toBe("$0.0025");
  });
});

describe("estimateUsageCost - Additional Tests", () => {
  it("handles negative costs", () => {
    const costConfig = { input: -0.001, output: 0.002, cacheRead: 0, cacheWrite: 0 };
    const usage = { input: 1000, output: 0 };
    // Only negative costs are returned: (1000 * -0.001) / 1_000_000 = -0.000001
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(-0.000001);
  });

  it("handles mixed positive and negative costs", () => {
    const costConfig = { input: 0.001, output: -0.002, cacheRead: 0, cacheWrite: 0 };
    const usage = { input: 1000, output: 1000 };
    // Only negative costs are returned: (1000 * -0.002) / 1_000_000 = -0.000002
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(-0.000002);
  });

  it("handles zero costs", () => {
    const costConfig = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    const usage = { input: 1000, output: 1000 };
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(0);
  });

  it("handles very large token counts", () => {
    const costConfig = { input: 0.001, output: 0.002, cacheRead: 0, cacheWrite: 0 };
    const usage = { input: Number.MAX_SAFE_INTEGER, output: 0 };
    expect(estimateUsageCost({ usage, cost: costConfig })).toBe(9007199.254740991);
  });
});

describe("resolveModelCostConfig - Additional Tests", () => {
  it("handles provider names with different casing", () => {
    const costConfig = { input: 0.001, output: 0.002, cacheRead: 0, cacheWrite: 0 };
    const config = {
      models: {
        providers: {
          OpenAI: {
            models: [{ id: "gpt-4", cost: costConfig }],
          },
        },
      },
    } as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "openai", model: "gpt-4", config })).toBeUndefined();
    expect(resolveModelCostConfig({ provider: "OpenAI", model: "gpt-4", config })).toEqual(
      costConfig,
    );
  });

  it("handles model names with special characters", () => {
    const costConfig = { input: 0.001, output: 0.002, cacheRead: 0, cacheWrite: 0 };
    const config = {
      models: {
        providers: {
          openai: {
            models: [{ id: "gpt-4-turbo", cost: costConfig }],
          },
        },
      },
    } as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "openai", model: "gpt-4-turbo", config })).toEqual(
      costConfig,
    );
  });

  it("handles empty provider and model lists", () => {
    const config = {
      models: {
        providers: {
          openai: {
            models: [],
          },
        },
      },
    } as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "openai", model: "gpt-4", config })).toBeUndefined();
  });

  it("handles missing models section", () => {
    const config = {
      models: {
        providers: {
          openai: {},
        },
      },
    } as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "openai", model: "gpt-4", config })).toBeUndefined();
  });

  it("handles missing providers section", () => {
    const config = {
      models: {},
    } as OpenClawConfig;
    expect(resolveModelCostConfig({ provider: "openai", model: "gpt-4", config })).toBeUndefined();
  });
});
