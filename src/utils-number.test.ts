import { describe, expect, it } from "vitest";
import { clampNumber, clampInt } from "./utils.js";

describe("Number utility functions", () => {
  describe("clampNumber", () => {
    it("should return value within range", () => {
      expect(clampNumber(5, 0, 10)).toBe(5);
      expect(clampNumber(7, 5, 10)).toBe(7);
      expect(clampNumber(0, -5, 5)).toBe(0);
    });

    it("should clamp to minimum when value is below min", () => {
      expect(clampNumber(-5, 0, 10)).toBe(0);
      expect(clampNumber(4, 5, 10)).toBe(5);
      expect(clampNumber(-10, -5, 5)).toBe(-5);
    });

    it("should clamp to maximum when value is above max", () => {
      expect(clampNumber(15, 0, 10)).toBe(10);
      expect(clampNumber(12, 5, 10)).toBe(10);
      expect(clampNumber(10, -5, 5)).toBe(5);
    });

    it("should handle edge cases", () => {
      expect(clampNumber(0, 0, 0)).toBe(0);
      expect(clampNumber(5, 5, 5)).toBe(5);
      expect(clampNumber(10, 10, 10)).toBe(10);
    });

    it("should handle negative ranges", () => {
      expect(clampNumber(-5, -10, -1)).toBe(-5);
      expect(clampNumber(-15, -10, -1)).toBe(-10);
      expect(clampNumber(0, -10, -1)).toBe(-1);
    });

    it("should handle decimal numbers", () => {
      expect(clampNumber(3.14, 0, 5)).toBe(3.14);
      expect(clampNumber(6.28, 0, 5)).toBe(5);
      expect(clampNumber(-1.5, 0, 5)).toBe(0);
    });

    it("should handle mixed positive and negative ranges", () => {
      expect(clampNumber(0, -5, 5)).toBe(0);
      expect(clampNumber(-10, -5, 5)).toBe(-5);
      expect(clampNumber(10, -5, 5)).toBe(5);
    });

    it("should handle Infinity", () => {
      expect(clampNumber(Infinity, 0, 10)).toBe(10);
      expect(clampNumber(-Infinity, 0, 10)).toBe(0);
    });

    it("should handle NaN", () => {
      expect(clampNumber(NaN, 0, 10)).toBeNaN();
    });
  });

  describe("clampInt", () => {
    it("should return integer value within range", () => {
      expect(clampInt(5, 0, 10)).toBe(5);
      expect(clampInt(7, 5, 10)).toBe(7);
      expect(clampInt(0, -5, 5)).toBe(0);
    });

    it("should floor decimal values before clamping", () => {
      expect(clampInt(3.14, 0, 10)).toBe(3);
      expect(clampInt(6.99, 0, 5)).toBe(5);
      expect(clampInt(-1.5, 0, 5)).toBe(0);
    });

    it("should clamp to minimum after flooring", () => {
      expect(clampInt(-5.9, 0, 10)).toBe(0);
      expect(clampInt(4.99, 5, 10)).toBe(5);
      expect(clampInt(-10.1, -5, 5)).toBe(-5);
    });

    it("should clamp to maximum after flooring", () => {
      expect(clampInt(15.9, 0, 10)).toBe(10);
      expect(clampInt(12.1, 5, 10)).toBe(10);
      expect(clampInt(10.9, -5, 5)).toBe(5);
    });

    it("should handle edge cases", () => {
      expect(clampInt(0, 0, 0)).toBe(0);
      expect(clampInt(5, 5, 5)).toBe(5);
      expect(clampInt(10, 10, 10)).toBe(10);
    });

    it("should handle negative ranges", () => {
      expect(clampInt(-5, -10, -1)).toBe(-5);
      expect(clampInt(-15, -10, -1)).toBe(-10);
      expect(clampInt(0, -10, -1)).toBe(-1);
    });

    it("should handle mixed positive and negative ranges", () => {
      expect(clampInt(0, -5, 5)).toBe(0);
      expect(clampInt(-10, -5, 5)).toBe(-5);
      expect(clampInt(10, -5, 5)).toBe(5);
    });

    it("should handle very small decimals", () => {
      expect(clampInt(0.1, 0, 10)).toBe(0);
      expect(clampInt(0.9, 0, 10)).toBe(0);
      expect(clampInt(-0.1, 0, 10)).toBe(0);
      expect(clampInt(-0.9, 0, 10)).toBe(0);
    });

    it("should handle very large numbers", () => {
      expect(clampInt(999999.999, 0, 10)).toBe(10);
      expect(clampInt(-999999.999, 0, 10)).toBe(0);
    });

    it("should handle Infinity", () => {
      expect(clampInt(Infinity, 0, 10)).toBe(10);
      expect(clampInt(-Infinity, 0, 10)).toBe(0);
    });

    it("should handle NaN", () => {
      expect(clampInt(NaN, 0, 10)).toBeNaN();
    });
  });
});
