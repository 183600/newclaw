import { describe, expect, it } from "vitest";
import { clampNumber, clampInt } from "../utils.ts";

describe("number utilities", () => {
  describe("clampNumber", () => {
    it("returns the number when within range", () => {
      expect(clampNumber(5, 0, 10)).toBe(5);
    });

    it("returns min when below range", () => {
      expect(clampNumber(-5, 0, 10)).toBe(0);
    });

    it("returns max when above range", () => {
      expect(clampNumber(15, 0, 10)).toBe(10);
    });

    it("handles edge cases", () => {
      expect(clampNumber(0, 0, 0)).toBe(0);
      expect(clampNumber(5, 5, 5)).toBe(5);
      expect(clampNumber(-10, -5, 5)).toBe(-5);
      expect(clampNumber(10, -5, 5)).toBe(5);
    });

    it("handles negative ranges", () => {
      expect(clampNumber(-3, -10, -1)).toBe(-3);
      expect(clampNumber(-15, -10, -1)).toBe(-10);
      expect(clampNumber(0, -10, -1)).toBe(-1);
    });
  });

  describe("clampInt", () => {
    it("returns floored integer when within range", () => {
      expect(clampInt(5.7, 0, 10)).toBe(5);
    });

    it("returns min when below range", () => {
      expect(clampInt(-5.9, 0, 10)).toBe(0);
    });

    it("returns max when above range", () => {
      expect(clampInt(15.3, 0, 10)).toBe(10);
    });

    it("handles decimal values", () => {
      expect(clampInt(3.14, 2, 4)).toBe(3);
      expect(clampInt(2.99, 2, 4)).toBe(2);
      expect(clampInt(4.01, 2, 4)).toBe(4);
    });
  });
});
