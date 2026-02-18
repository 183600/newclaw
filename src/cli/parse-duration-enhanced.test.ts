import { describe, expect, it } from "vitest";
import { parseDurationMs, type DurationMsParseOptions } from "./parse-duration.js";

describe("CLI Parse Duration", () => {
  describe("parseDurationMs", () => {
    it("parses milliseconds", () => {
      expect(parseDurationMs("100ms")).toBe(100);
      expect(parseDurationMs("500ms")).toBe(500);
      expect(parseDurationMs("1000ms")).toBe(1000);
    });

    it("parses seconds", () => {
      expect(parseDurationMs("1s")).toBe(1000);
      expect(parseDurationMs("30s")).toBe(30000);
      expect(parseDurationMs("60s")).toBe(60000);
    });

    it("parses minutes", () => {
      expect(parseDurationMs("1m")).toBe(60000);
      expect(parseDurationMs("30m")).toBe(1800000);
      expect(parseDurationMs("60m")).toBe(3600000);
    });

    it("parses hours", () => {
      expect(parseDurationMs("1h")).toBe(3600000);
      expect(parseDurationMs("12h")).toBe(43200000);
      expect(parseDurationMs("24h")).toBe(86400000);
    });

    it("parses days", () => {
      expect(parseDurationMs("1d")).toBe(86400000);
      expect(parseDurationMs("7d")).toBe(604800000);
      expect(parseDurationMs("30d")).toBe(2592000000);
    });

    it("handles decimal values", () => {
      expect(parseDurationMs("1.5s")).toBe(1500);
      expect(parseDurationMs("2.5m")).toBe(150000);
      expect(parseDurationMs("1.5h")).toBe(5400000);
    });

    it("uses default unit when none specified", () => {
      expect(parseDurationMs("100")).toBe(100);
      expect(parseDurationMs("1000")).toBe(1000);
    });

    it("respects custom default unit", () => {
      const opts: DurationMsParseOptions = { defaultUnit: "s" };
      expect(parseDurationMs("30", opts)).toBe(30000);
      expect(parseDurationMs("60", opts)).toBe(60000);
    });

    it("handles different default units", () => {
      expect(parseDurationMs("1", { defaultUnit: "s" })).toBe(1000);
      expect(parseDurationMs("1", { defaultUnit: "m" })).toBe(60000);
      expect(parseDurationMs("1", { defaultUnit: "h" })).toBe(3600000);
      expect(parseDurationMs("1", { defaultUnit: "d" })).toBe(86400000);
    });

    it("handles case insensitive units", () => {
      expect(parseDurationMs("1S")).toBe(1000);
      expect(parseDurationMs("1M")).toBe(60000);
      expect(parseDurationMs("1H")).toBe(3600000);
      expect(parseDurationMs("1D")).toBe(86400000);
    });

    it("handles whitespace", () => {
      expect(parseDurationMs("  100ms  ")).toBe(100);
      expect(parseDurationMs("\t30s\n")).toBe(30000);
    });

    it("handles number input", () => {
      expect(parseDurationMs(100 as unknown)).toBe(100);
      expect(parseDurationMs(1000 as unknown)).toBe(1000);
    });

    it("handles null/undefined input", () => {
      expect(() => parseDurationMs(null as unknown)).toThrow("invalid duration (empty)");
      expect(() => parseDurationMs(undefined as unknown)).toThrow("invalid duration (empty)");
    });

    it("throws for empty string", () => {
      expect(() => parseDurationMs("")).toThrow("invalid duration (empty)");
      expect(() => parseDurationMs("   ")).toThrow("invalid duration (empty)");
    });

    it("throws for invalid format", () => {
      expect(() => parseDurationMs("invalid")).toThrow("invalid duration: invalid");
      expect(() => parseDurationMs("10x")).toThrow("invalid duration: 10x");
      expect(() => parseDurationMs("abc123")).toThrow("invalid duration: abc123");
    });

    it("throws for negative values", () => {
      expect(() => parseDurationMs("-100ms")).toThrow("invalid duration: -100ms");
      expect(() => parseDurationMs("-1s")).toThrow("invalid duration: -1s");
      expect(() => parseDurationMs("-1m")).toThrow("invalid duration: -1m");
    });

    it("throws for infinite values", () => {
      expect(() => parseDurationMs("Infinity")).toThrow("invalid duration: Infinity");
      expect(() => parseDurationMs("NaN")).toThrow("invalid duration: NaN");
    });

    it("throws for values that would overflow", () => {
      // Very large number that would cause overflow when multiplied
      // Number.MAX_VALUE is approximately 1.7976931348623157e+308
      // Using a number that will overflow when multiplied by the day multiplier (86400000)
      expect(() => parseDurationMs("1e300d")).toThrow();
    });

    it("rounds results", () => {
      expect(parseDurationMs("1.5s")).toBe(1500);
      expect(parseDurationMs("1.25m")).toBe(75000);
      expect(parseDurationMs("1.333h")).toBe(4798800); // 1.333 * 3600000 = 4798800
    });

    it("handles edge cases", () => {
      expect(parseDurationMs("0")).toBe(0);
      expect(parseDurationMs("0ms")).toBe(0);
      expect(parseDurationMs("0s")).toBe(0);
      expect(parseDurationMs("0m")).toBe(0);
      expect(parseDurationMs("0h")).toBe(0);
      expect(parseDurationMs("0d")).toBe(0);
    });
  });
});
