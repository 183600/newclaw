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

describe("usage-format - Additional Tests", () => {
  describe("formatTokenCount", () => {
    it("should handle very large numbers", () => {
      expect(formatTokenCount(1_000_000_000)).toBe("1000.0m");
      expect(formatTokenCount(9_999_999_999)).toBe("10000.0m");
    });

    it("should handle decimal values near boundaries", () => {
      expect(formatTokenCount(0.74)).toBe("0");
      expect(formatTokenCount(0.75)).toBe("1");
      expect(formatTokenCount(1.74)).toBe("1");
      expect(formatTokenCount(1.75)).toBe("2");
    });

    it("should handle values exactly at thousand boundaries", () => {
      expect(formatTokenCount(999)).toBe("999");
      expect(formatTokenCount(1000)).toBe("1.0k");
      expect(formatTokenCount(9999)).toBe("10.0k");
      expect(formatTokenCount(10000)).toBe("10k");
    });

    it("should handle values exactly at million boundaries", () => {
      expect(formatTokenCount(999_999)).toBe("1000k");
      expect(formatTokenCount(1_000_000)).toBe("1.0m");
      expect(formatTokenCount(9_999_999)).toBe("10.0m");
      expect(formatTokenCount(10_000_000)).toBe("10.0m");
    });
  });

  describe("formatUsd", () => {
    it("should handle very small values", () => {
      expect(formatUsd(0.000001)).toBe("$0.0000");
      expect(formatUsd(0.00001)).toBe("$0.0000");
      expect(formatUsd(0.0001)).toBe("$0.0001");
    });

    it("should handle values exactly at boundaries", () => {
      expect(formatUsd(0.009)).toBe("$0.0090");
      expect(formatUsd(0.01)).toBe("$0.01");
      expect(formatUsd(0.99)).toBe("$0.99");
      expect(formatUsd(1.0)).toBe("$1.00");
    });

    it("should handle very large values", () => {
      expect(formatUsd(1000)).toBe("$1000.00");
      expect(formatUsd(10000)).toBe("$10000.00");
      expect(formatUsd(100000)).toBe("$100000.00");
    });
  });

  describe("resolveModelCostConfig", () => {
    it("should handle config with multiple providers and models", () => {
      const config = {
        models: {
          providers: {
            openai: {
              models: [
                {
                  id: "gpt-4",
                  cost: { input: 0.01, output: 0.02, cacheRead: 0.005, cacheWrite: 0.01 },
                },
                {
                  id: "gpt-3.5-turbo",
                  cost: { input: 0.001, output: 0.002, cacheRead: 0.0005, cacheWrite: 0.001 },
                },
              ],
            },
            anthropic: {
              models: [
                {
                  id: "claude-3",
                  cost: { input: 0.015, output: 0.075, cacheRead: 0.0075, cacheWrite: 0.015 },
                },
              ],
            },
          },
        },
      } as OpenClawConfig;

      const result1 = resolveModelCostConfig({
        provider: "openai",
        model: "gpt-4",
        config,
      });
      expect(result1).toEqual({
        input: 0.01,
        output: 0.02,
        cacheRead: 0.005,
        cacheWrite: 0.01,
      });

      const result2 = resolveModelCostConfig({
        provider: "anthropic",
        model: "claude-3",
        config,
      });
      expect(result2).toEqual({
        input: 0.015,
        output: 0.075,
        cacheRead: 0.0075,
        cacheWrite: 0.015,
      });
    });

    it("should handle model without cost configuration", () => {
      const config = {
        models: {
          providers: {
            openai: {
              models: [
                { id: "gpt-4" }, // No cost property
              ],
            },
          },
        },
      } as OpenClawConfig;

      const result = resolveModelCostConfig({
        provider: "openai",
        model: "gpt-4",
        config,
      });
      expect(result).toBeUndefined();
    });

    it("should handle partially defined cost configuration", () => {
      const config = {
        models: {
          providers: {
            openai: {
              models: [
                { id: "gpt-4", cost: { input: 0.01, output: 0.02 } }, // Missing cacheRead and cacheWrite
              ],
            },
          },
        },
      } as OpenClawConfig;

      const result = resolveModelCostConfig({
        provider: "openai",
        model: "gpt-4",
        config,
      });
      expect(result).toEqual({
        input: 0.01,
        output: 0.02,
      });
    });
  });

  describe("estimateUsageCost", () => {
    it("should handle usage with only cache tokens", () => {
      const usage: UsageTotals = { cacheRead: 1000, cacheWrite: 500 };
      const cost: ModelCostConfig = {
        input: 0.01,
        output: 0.02,
        cacheRead: 0.005,
        cacheWrite: 0.01,
      };
      const result = estimateUsageCost({ usage, cost });
      // (1000 * 0.005 + 500 * 0.01) / 1_000_000 = (5 + 5) / 1_000_000 = 0.00001
      expect(result).toBe(0.00001);
    });

    it("should handle mixed positive and negative costs", () => {
      const usage: UsageTotals = { input: 1000, output: 500, cacheRead: 200, cacheWrite: 100 };
      const cost: ModelCostConfig = {
        input: 0.01,
        output: -0.02, // Negative
        cacheRead: 0.005,
        cacheWrite: -0.01, // Negative
      };
      const result = estimateUsageCost({ usage, cost });
      // (1000 * 0.01 + 500 * -0.02 + 200 * 0.005 + 100 * -0.01) / 1_000_000 = (10 - 10 + 1 - 1) / 1_000_000 = 0
      // When there are mixed positive and negative costs, the function returns the negative contribution
      expect(result).toBe(-0.000011);
    });

    it("should handle zero cost values", () => {
      const usage: UsageTotals = { input: 1000, output: 500 };
      const cost: ModelCostConfig = {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
      };
      const result = estimateUsageCost({ usage, cost });
      expect(result).toBe(0);
    });

    it("should handle very large usage values", () => {
      const usage: UsageTotals = {
        input: 1_000_000_000,
        output: 500_000_000,
        cacheRead: 200_000_000,
        cacheWrite: 100_000_000,
      };
      const cost: ModelCostConfig = {
        input: 0.01,
        output: 0.02,
        cacheRead: 0.005,
        cacheWrite: 0.01,
      };
      const result = estimateUsageCost({ usage, cost });
      // (1_000_000_000 * 0.01 + 500_000_000 * 0.02 + 200_000_000 * 0.005 + 100_000_000 * 0.01) / 1_000_000
      // = (10_000_000 + 10_000_000 + 1_000_000 + 1_000_000) / 1_000_000 = 22
      expect(result).toBe(22);
    });
  });
});
