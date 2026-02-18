import { describe, expect, it } from "vitest";
import { normalizePollInput, normalizePollDurationHours } from "../polls.js";
import { stripReasoningTagsFromText } from "../shared/text/reasoning-tags.js";
import { parseBooleanValue } from "./boolean.js";
import { formatRelativeTime } from "./time-format.js";
import { formatTokenCount, formatUsd, estimateUsageCost } from "./usage-format.js";

describe("Comprehensive Edge Cases Tests", () => {
  describe("formatTokenCount edge cases", () => {
    it("handles very large numbers", () => {
      expect(formatTokenCount(Number.MAX_SAFE_INTEGER)).toMatch(/^\d+\.\d+m$/);
      expect(formatTokenCount(1_000_000_000)).toBe("1000.0m");
      expect(formatTokenCount(9_999_999_999)).toBe("10000.0m");
    });

    it("handles floating point precision", () => {
      expect(formatTokenCount(0.1 + 0.2)).toBe("0"); // 0.30000000000000004 rounded
      expect(formatTokenCount(999.4999999999999)).toBe("999");
      expect(formatTokenCount(999.5)).toBe("1000");
    });

    it("handles scientific notation", () => {
      expect(formatTokenCount(1e3)).toBe("1.0k");
      expect(formatTokenCount(1e6)).toBe("1.0m");
      expect(formatTokenCount(1.23e6)).toBe("1.2m");
    });
  });

  describe("formatUsd edge cases", () => {
    it("handles very small values", () => {
      expect(formatUsd(0.000000001)).toBe("$0.0000");
      expect(formatUsd(Number.MIN_VALUE)).toBe("$0.0000");
    });

    it("handles very large values", () => {
      expect(formatUsd(Number.MAX_SAFE_INTEGER)).toMatch(/^\$\d+\.\d{2}$/);
      expect(formatUsd(1_000_000)).toBe("$1000000.00");
      expect(formatUsd(1_000_000.123456)).toBe("$1000000.12");
    });

    it("handles negative values", () => {
      expect(formatUsd(-0.01)).toBeUndefined();
      expect(formatUsd(-1)).toBeUndefined();
      expect(formatUsd(-100)).toBeUndefined();
    });
  });

  describe("estimateUsageCost edge cases", () => {
    it("handles extreme cost values", () => {
      const extremeCostConfig = {
        input: Number.MAX_SAFE_INTEGER,
        output: Number.MAX_SAFE_INTEGER,
        cacheRead: Number.MAX_SAFE_INTEGER,
        cacheWrite: Number.MAX_SAFE_INTEGER,
      };
      const usage = { input: 1, output: 1, cacheRead: 1, cacheWrite: 1 };
      const result = estimateUsageCost({ usage, cost: extremeCostConfig });
      expect(result).toBeGreaterThan(0);
      expect(Number.isFinite(result!)).toBe(true);
    });

    it("handles zero cost config", () => {
      const zeroCostConfig = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
      const usage = { input: 1_000_000, output: 1_000_000 };
      expect(estimateUsageCost({ usage, cost: zeroCostConfig })).toBe(0);
    });

    it("handles negative cost values", () => {
      const negativeCostConfig = { input: -0.001, output: 0.002, cacheRead: 0, cacheWrite: 0 };
      const usage = { input: 1000, output: 500 };
      const result = estimateUsageCost({ usage, cost: negativeCostConfig });
      expect(result).toBeLessThan(0);
    });
  });

  describe("formatRelativeTime edge cases", () => {
    it("handles system clock edge cases", () => {
      // Test with very large timestamps
      expect(formatRelativeTime(Number.MAX_SAFE_INTEGER)).toMatch(/^[A-Za-z]{3} \d+$/);

      // Test with very small timestamps
      expect(formatRelativeTime(0)).toMatch(/^[A-Za-z]{3} \d+$/);
      expect(formatRelativeTime(Number.MIN_SAFE_INTEGER)).toMatch(/^[A-Za-z]{3} \d+$/);
    });

    it("handles leap year boundaries", () => {
      // Test around February 29 in a leap year
      const leapYearDate = new Date("2024-02-29T12:00:00Z").getTime();
      const beforeLeap = new Date("2024-02-28T12:00:00Z").getTime();
      const afterLeap = new Date("2024-03-01T12:00:00Z").getTime();

      expect(formatRelativeTime(leapYearDate)).toMatch(/^[A-Za-z]{3} \d+$/);
      expect(formatRelativeTime(beforeLeap)).toMatch(/^[A-Za-z]{3} \d+$/);
      expect(formatRelativeTime(afterLeap)).toMatch(/^[A-Za-z]{3} \d+$/);
    });

    it("handles daylight saving time transitions", () => {
      // These tests depend on the timezone, but should still work
      const dstDate = new Date("2023-03-12T12:00:00Z").getTime(); // DST start in US
      const result = formatRelativeTime(dstDate);
      expect(result).toMatch(/^(just now|\d+m ago|\d+h ago|Yesterday|\d+d ago|[A-Za-z]{3} \d+)$/);
    });
  });

  describe("parseBooleanValue edge cases", () => {
    it("handles string objects", () => {
      const strObj = new String("true");
      expect(parseBooleanValue(strObj)).toBeUndefined();

      const boolStrObj = new String("false");
      expect(parseBooleanValue(boolStrObj)).toBeUndefined();
    });

    it("handles whitespace edge cases", () => {
      expect(parseBooleanValue("\t\n true \r\n")).toBe(true);
      expect(parseBooleanValue("  \u00A0  false  \u00A0")).toBe(false); // Non-breaking space
      expect(parseBooleanValue("\u200Btrue\u200B")).toBe(true); // Zero-width space
    });

    it("handles Unicode characters", () => {
      expect(parseBooleanValue("true\u0301")).toBeUndefined(); // Combining acute accent
      expect(parseBooleanValue("t\u0301rue")).toBeUndefined(); // Accented character
      expect(parseBooleanValue("café")).toBeUndefined(); // Non-ASCII word
    });

    it("handles custom options edge cases", () => {
      // Empty custom options
      expect(parseBooleanValue("true", { truthy: [], falsy: [] })).toBeUndefined();

      // Overlapping custom options
      expect(parseBooleanValue("yes", { truthy: ["yes"], falsy: ["yes"] })).toBe(true);

      // Case sensitivity in custom options
      expect(parseBooleanValue("YES", { truthy: ["yes"] })).toBeUndefined();
      expect(parseBooleanValue("yes", { truthy: ["YES"] })).toBeUndefined();
    });
  });

  describe("normalizePollInput edge cases", () => {
    it("handles extreme option counts", () => {
      const manyOptions = Array.from({ length: 1000 }, (_, i) => `Option ${i}`);
      const input = {
        question: "Test question",
        options: manyOptions,
      };

      const result = normalizePollInput(input, { maxOptions: 1000 });
      expect(result.options).toHaveLength(1000);

      expect(() => normalizePollInput(input, { maxOptions: 999 })).toThrow();
    });

    it("handles very long text", () => {
      const longText = "a".repeat(10000);
      const input = {
        question: longText,
        options: [longText, longText],
      };

      const result = normalizePollInput(input);
      expect(result.question).toBe(longText);
      expect(result.options).toEqual([longText, longText]);
    });

    it("handles Unicode normalization", () => {
      const input = {
        question: "café\u0301", // Decomposed form
        options: ["café", "cafe\u0301"], // Mixed forms
      };

      const result = normalizePollInput(input);
      expect(result.question).toBe("café\u0301");
      expect(result.options).toEqual(["café", "cafe\u0301"]);
    });
  });

  describe("normalizePollDurationHours edge cases", () => {
    it("handles floating point precision", () => {
      expect(normalizePollDurationHours(0.1 + 0.2, { defaultHours: 24, maxHours: 72 })).toBe(0); // 0.30000000000000004 floored
      expect(
        normalizePollDurationHours(23.99999999999999, { defaultHours: 24, maxHours: 72 }),
      ).toBe(23);
    });

    it("handles scientific notation", () => {
      expect(normalizePollDurationHours(1e1, { defaultHours: 24, maxHours: 72 })).toBe(10);
      expect(normalizePollDurationHours(1.23e1, { defaultHours: 24, maxHours: 72 })).toBe(12);
    });

    it("handles extreme values", () => {
      expect(
        normalizePollDurationHours(Number.MAX_SAFE_INTEGER, { defaultHours: 24, maxHours: 72 }),
      ).toBe(72);
      expect(
        normalizePollDurationHours(Number.MIN_SAFE_INTEGER, { defaultHours: 24, maxHours: 72 }),
      ).toBe(1);
    });
  });

  describe("stripReasoningTagsFromText edge cases", () => {
    it("handles malformed nested tags", () => {
      const text = "Before <thinking>unclosed <thought>nested</thinking> after";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before ");
    });

    it("handles mixed encoding scenarios", () => {
      const text = "Before Đthinking&#x111; content after";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  content after.");
    });

    it("handles very large text", () => {
      const largeText = "thinkingđ".repeat(10000);
      const result = stripReasoningTagsFromText(largeText);
      expect(result).toBe("");
    });

    it("handles zero-width characters", () => {
      const text = "Before\u200Bthinking\u200Bafter\u200B";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before\u200B\u200Bafter\u200B");
    });

    it("handles bidirectional text", () => {
      const text = "Before thinking\u05D0after"; // Hebrew character
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before \u05D0after");
    });
  });

  describe("Integration edge cases", () => {
    it("handles combined complex scenarios", () => {
      // Test a complex scenario with multiple edge cases
      const complexPollInput = {
        question: "  \u200BQuestion with\u0301 accents\u200B  ",
        options: ["  Option 1 with \u0301accents  ", "", "  ", "Option 2", "Option 3"],
        maxSelections: 1.5, // Should be floored to 1
        durationHours: 23.99999999999999, // Floating point precision
      };

      const result = normalizePollInput(complexPollInput, { maxOptions: 4 });
      expect(result.question).toBe("\u200BQuestion with\u0301 accents\u200B");
      expect(result.options).toEqual(["Option 1 with \u0301accents", "Option 2", "Option 3"]);
      expect(result.maxSelections).toBe(1);
      expect(result.durationHours).toBe(23);
    });

    it("handles error propagation in complex scenarios", () => {
      // Test how errors propagate through complex operations
      const invalidCostConfig = {
        input: NaN,
        output: Infinity,
        cacheRead: -Infinity,
        cacheWrite: undefined,
      };

      const usage = {
        input: NaN,
        output: Infinity,
        cacheRead: -Infinity,
        cacheWrite: undefined,
      };

      const result = estimateUsageCost({ usage, cost: invalidCostConfig });
      expect(result).toBeUndefined();
    });
  });
});
