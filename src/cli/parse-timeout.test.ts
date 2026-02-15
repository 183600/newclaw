import { describe, expect, it } from "vitest";
import { parseTimeoutMs } from "./parse-timeout.js";

describe("parseTimeoutMs", () => {
  describe("undefined and null inputs", () => {
    it("should return undefined for undefined", () => {
      expect(parseTimeoutMs(undefined)).toBeUndefined();
    });

    it("should return undefined for null", () => {
      expect(parseTimeoutMs(null)).toBeUndefined();
    });
  });

  describe("number inputs", () => {
    it("should return valid finite numbers", () => {
      expect(parseTimeoutMs(0)).toBe(0);
      expect(parseTimeoutMs(100)).toBe(100);
      expect(parseTimeoutMs(9999)).toBe(9999);
    });

    it("should return undefined for NaN", () => {
      expect(parseTimeoutMs(Number.NaN)).toBeUndefined();
    });

    it("should return undefined for positive infinity", () => {
      expect(parseTimeoutMs(Number.POSITIVE_INFINITY)).toBeUndefined();
    });

    it("should return undefined for negative infinity", () => {
      expect(parseTimeoutMs(Number.NEGATIVE_INFINITY)).toBeUndefined();
    });

    it("should handle negative numbers", () => {
      expect(parseTimeoutMs(-100)).toBe(-100);
      expect(parseTimeoutMs(-0.5)).toBe(-0.5);
    });

    it("should handle floating point numbers", () => {
      expect(parseTimeoutMs(100.5)).toBe(100.5);
      expect(parseTimeoutMs(0.1)).toBe(0.1);
      expect(parseTimeoutMs(-0.1)).toBe(-0.1);
    });
  });

  describe("bigint inputs", () => {
    it("should convert valid bigint to number", () => {
      expect(parseTimeoutMs(BigInt(100))).toBe(100);
      expect(parseTimeoutMs(BigInt(0))).toBe(0);
      expect(parseTimeoutMs(BigInt(-50))).toBe(-50);
    });

    it("should convert bigint that exceeds Number.MAX_SAFE_INTEGER to number", () => {
      const tooBig = BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1);
      expect(parseTimeoutMs(tooBig)).toBe(9007199254740992);
    });

    it("should convert bigint that is less than Number.MIN_SAFE_INTEGER to number", () => {
      const tooSmall = BigInt(Number.MIN_SAFE_INTEGER) - BigInt(1);
      expect(parseTimeoutMs(tooSmall)).toBe(-9007199254740992);
    });
  });

  describe("string inputs", () => {
    it("should parse valid integer strings", () => {
      expect(parseTimeoutMs("100")).toBe(100);
      expect(parseTimeoutMs("0")).toBe(0);
      expect(parseTimeoutMs("-50")).toBe(-50);
      expect(parseTimeoutMs("9999")).toBe(9999);
    });

    it("should handle strings with whitespace", () => {
      expect(parseTimeoutMs("  100  ")).toBe(100);
      expect(parseTimeoutMs("\t50\n")).toBe(50);
      expect(parseTimeoutMs("  25  ")).toBe(25);
    });

    it("should return undefined for empty string", () => {
      expect(parseTimeoutMs("")).toBeUndefined();
    });

    it("should return undefined for whitespace-only strings", () => {
      expect(parseTimeoutMs("   ")).toBeUndefined();
      expect(parseTimeoutMs("\t\n")).toBeUndefined();
      expect(parseTimeoutMs(" \t \n ")).toBeUndefined();
    });

    it("should return undefined for non-numeric strings", () => {
      expect(parseTimeoutMs("abc")).toBeUndefined();
    });

    it("should parse numeric strings with trailing non-numeric characters", () => {
      expect(parseTimeoutMs("100abc")).toBe(100);
      expect(parseTimeoutMs("10a0")).toBe(10);
    });

    it("should return undefined for strings starting with non-numeric characters", () => {
      expect(parseTimeoutMs("abc100")).toBeUndefined();
    });

    it("should parse floating point strings as integers (parseInt behavior)", () => {
      expect(parseTimeoutMs("100.5")).toBe(100);
      expect(parseTimeoutMs("0.1")).toBe(0);
      expect(parseTimeoutMs("-50.25")).toBe(-50);
    });

    it("should parse scientific notation strings as 0 (parseInt behavior)", () => {
      expect(parseTimeoutMs("1e5")).toBe(1);
      expect(parseTimeoutMs("1E-5")).toBe(1);
    });

    it("should parse hexadecimal strings as 0 (parseInt behavior)", () => {
      expect(parseTimeoutMs("0x10")).toBe(0);
      expect(parseTimeoutMs("0XFF")).toBe(0);
    });

    it("should parse numeric strings with special characters", () => {
      expect(parseTimeoutMs("100$")).toBe(100);
      expect(parseTimeoutMs("%100")).toBeUndefined();
      expect(parseTimeoutMs("100%")).toBe(100);
    });
  });

  describe("edge cases", () => {
    it("should handle very large numbers", () => {
      expect(parseTimeoutMs(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
      expect(parseTimeoutMs(Number.MAX_VALUE)).toBe(Number.MAX_VALUE); // Still finite
    });

    it("should handle very small numbers", () => {
      expect(parseTimeoutMs(Number.MIN_SAFE_INTEGER)).toBe(Number.MIN_SAFE_INTEGER);
      expect(parseTimeoutMs(Number.MIN_VALUE)).toBe(Number.MIN_VALUE);
    });

    it("should handle zero in different formats", () => {
      expect(parseTimeoutMs(0)).toBe(0);
      expect(parseTimeoutMs("0")).toBe(0);
      expect(parseTimeoutMs(BigInt(0))).toBe(0);
      expect(parseTimeoutMs("   0   ")).toBe(0);
    });

    it("should handle negative zero", () => {
      expect(parseTimeoutMs(-0)).toBe(-0);
      expect(parseTimeoutMs("-0")).toBe(-0);
    });
  });

  describe("type safety", () => {
    it("should handle boolean inputs", () => {
      expect(parseTimeoutMs(true as any)).toBeUndefined();
      expect(parseTimeoutMs(false as any)).toBeUndefined();
    });

    it("should handle object inputs", () => {
      expect(parseTimeoutMs({} as any)).toBeUndefined();
      expect(parseTimeoutMs({ value: 100 } as any)).toBeUndefined();
    });

    it("should handle array inputs", () => {
      expect(parseTimeoutMs([] as any)).toBeUndefined();
      expect(parseTimeoutMs([100] as any)).toBeUndefined();
    });

    it("should handle function inputs", () => {
      expect(parseTimeoutMs(() => 100 as any)).toBeUndefined();
    });

    it("should handle symbol inputs", () => {
      expect(parseTimeoutMs(Symbol("test") as any)).toBeUndefined();
    });
  });
});
