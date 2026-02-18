import { describe, expect, it } from "vitest";
import { parseDurationMs } from "./parse-duration.js";

describe("parseDurationMs", () => {
  describe("basic parsing", () => {
    it("should parse milliseconds", () => {
      expect(parseDurationMs("100ms")).toBe(100);
      expect(parseDurationMs("0ms")).toBe(0);
      expect(parseDurationMs("1000ms")).toBe(1000);
    });

    it("should parse seconds", () => {
      expect(parseDurationMs("1s")).toBe(1000);
      expect(parseDurationMs("5s")).toBe(5000);
      expect(parseDurationMs("0s")).toBe(0);
    });

    it("should parse minutes", () => {
      expect(parseDurationMs("1m")).toBe(60_000);
      expect(parseDurationMs("5m")).toBe(300_000);
      expect(parseDurationMs("0m")).toBe(0);
    });

    it("should parse hours", () => {
      expect(parseDurationMs("1h")).toBe(3_600_000);
      expect(parseDurationMs("2h")).toBe(7_200_000);
      expect(parseDurationMs("0h")).toBe(0);
    });

    it("should parse days", () => {
      expect(parseDurationMs("1d")).toBe(86_400_000);
      expect(parseDurationMs("2d")).toBe(172_800_000);
      expect(parseDurationMs("0d")).toBe(0);
    });
  });

  describe("decimal values", () => {
    it("should parse decimal milliseconds", () => {
      expect(parseDurationMs("1.5ms")).toBe(2);
      expect(parseDurationMs("1.4ms")).toBe(1);
      expect(parseDurationMs("0.5ms")).toBe(1);
    });

    it("should parse decimal seconds", () => {
      expect(parseDurationMs("1.5s")).toBe(1500);
      expect(parseDurationMs("0.5s")).toBe(500);
      expect(parseDurationMs("2.25s")).toBe(2250);
    });

    it("should parse decimal minutes", () => {
      expect(parseDurationMs("1.5m")).toBe(90_000);
      expect(parseDurationMs("0.5m")).toBe(30_000);
      expect(parseDurationMs("2.25m")).toBe(135_000);
    });

    it("should parse decimal hours", () => {
      expect(parseDurationMs("1.5h")).toBe(5_400_000);
      expect(parseDurationMs("0.5h")).toBe(1_800_000);
      expect(parseDurationMs("2.25h")).toBe(8_100_000);
    });

    it("should parse decimal days", () => {
      expect(parseDurationMs("1.5d")).toBe(129_600_000);
      expect(parseDurationMs("0.5d")).toBe(43_200_000);
      expect(parseDurationMs("2.25d")).toBe(194_400_000);
    });
  });

  describe("default unit", () => {
    it("should use milliseconds as default unit", () => {
      expect(parseDurationMs("100")).toBe(100);
      expect(parseDurationMs("0")).toBe(0);
    });

    it("should use custom default unit", () => {
      expect(parseDurationMs("1", { defaultUnit: "s" })).toBe(1000);
      expect(parseDurationMs("1", { defaultUnit: "m" })).toBe(60_000);
      expect(parseDurationMs("1", { defaultUnit: "h" })).toBe(3_600_000);
      expect(parseDurationMs("1", { defaultUnit: "d" })).toBe(86_400_000);
    });
  });

  describe("case sensitivity", () => {
    it("should handle uppercase units", () => {
      expect(parseDurationMs("1MS")).toBe(1);
      expect(parseDurationMs("1S")).toBe(1000);
      expect(parseDurationMs("1M")).toBe(60_000);
      expect(parseDurationMs("1H")).toBe(3_600_000);
      expect(parseDurationMs("1D")).toBe(86_400_000);
    });

    it("should handle mixed case units", () => {
      expect(parseDurationMs("1Ms")).toBe(1);
      expect(parseDurationMs("1S")).toBe(1000);
      expect(parseDurationMs("1m")).toBe(60_000);
      expect(parseDurationMs("1H")).toBe(3_600_000);
      expect(parseDurationMs("1d")).toBe(86_400_000);
    });
  });

  describe("whitespace handling", () => {
    it("should trim whitespace", () => {
      expect(parseDurationMs("  100ms  ")).toBe(100);
      expect(parseDurationMs("\t1s\n")).toBe(1000);
      expect(parseDurationMs("  1m  ")).toBe(60_000);
    });
  });

  describe("error cases", () => {
    it("should throw error for empty string", () => {
      expect(() => parseDurationMs("")).toThrow("invalid duration (empty)");
      expect(() => parseDurationMs("   ")).toThrow("invalid duration (empty)");
      expect(() => parseDurationMs("\t\n")).toThrow("invalid duration (empty)");
    });

    it("should throw error for null/undefined", () => {
      expect(() => parseDurationMs(null as unknown)).toThrow("invalid duration (empty)");
      expect(() => parseDurationMs(undefined as unknown)).toThrow("invalid duration (empty)");
    });

    it("should throw error for invalid format", () => {
      expect(() => parseDurationMs("abc")).toThrow("invalid duration: abc");
      expect(() => parseDurationMs("1x")).toThrow("invalid duration: 1x");
      expect(() => parseDurationMs("1.2.3s")).toThrow("invalid duration: 1.2.3s");
      expect(() => parseDurationMs("ms")).toThrow("invalid duration: ms");
      expect(() => parseDurationMs("s1")).toThrow("invalid duration: s1");
    });

    it("should throw error for negative values", () => {
      expect(() => parseDurationMs("-1s")).toThrow("invalid duration: -1s");
      expect(() => parseDurationMs("-1")).toThrow("invalid duration: -1");
      expect(() => parseDurationMs("-1.5m")).toThrow("invalid duration: -1.5m");
    });

    it("should throw error for infinite values", () => {
      expect(() => parseDurationMs("Infinity")).toThrow("invalid duration: Infinity");
      expect(() => parseDurationMs("NaN")).toThrow("invalid duration: NaN");
    });

    it("should throw error for values that would overflow", () => {
      // Very large number that would cause overflow when multiplied
      expect(() => parseDurationMs("1e308s")).toThrow("invalid duration: 1e308s");
    });
  });

  describe("edge cases", () => {
    it("should handle zero values", () => {
      expect(parseDurationMs("0ms")).toBe(0);
      expect(parseDurationMs("0s")).toBe(0);
      expect(parseDurationMs("0m")).toBe(0);
      expect(parseDurationMs("0h")).toBe(0);
      expect(parseDurationMs("0d")).toBe(0);
      expect(parseDurationMs("0")).toBe(0);
    });

    it("should handle very small decimal values", () => {
      expect(parseDurationMs("0.1ms")).toBe(0);
      expect(parseDurationMs("0.01s")).toBe(10);
      expect(parseDurationMs("0.001m")).toBe(60);
    });

    it("should round to nearest integer", () => {
      expect(parseDurationMs("1.6ms")).toBe(2);
      expect(parseDurationMs("1.4ms")).toBe(1);
      expect(parseDurationMs("1.5s")).toBe(1500);
      expect(parseDurationMs("1.5m")).toBe(90_000);
    });

    it("should handle string conversion", () => {
      expect(parseDurationMs(100 as unknown)).toBe(100);
      expect(parseDurationMs(1.5 as unknown)).toBe(2);
    });
  });
});
