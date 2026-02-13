import { describe, expect, it } from "vitest";
import { sliceUtf16Safe, truncateUtf16Safe } from "../utils.js";

describe("UTF-16 utilities - Additional Tests", () => {
  describe("sliceUtf16Safe", () => {
    it("handles null and undefined inputs", () => {
      // The function doesn't handle null/undefined, so we expect it to throw
      expect(() => sliceUtf16Safe(null as any, 0, 5)).toThrow();
      expect(() => sliceUtf16Safe(undefined as any, 0, 5)).toThrow();
    });

    it("handles numbers", () => {
      // The function expects a string, so passing a number should throw
      expect(() => sliceUtf16Safe(12345 as any, 0, 2)).toThrow();
    });

    it("handles empty string", () => {
      expect(sliceUtf16Safe("", 0, 5)).toBe("");
    });

    it("handles strings with only surrogate pairs", () => {
      const text = "🌟🚀🎉";
      expect(sliceUtf16Safe(text, 0, 2)).toBe("🌟");
      expect(sliceUtf16Safe(text, 2, 4)).toBe("🚀");
      expect(sliceUtf16Safe(text, 4, 6)).toBe("🎉");
    });

    it("handles strings with combining characters", () => {
      const text = "e\u0301cole"; //école
      expect(sliceUtf16Safe(text, 0, 1)).toBe("e");
      expect(sliceUtf16Safe(text, 0, 2)).toBe("e\u0301");
      expect(sliceUtf16Safe(text, 2, 4)).toBe("co");
    });

    it("handles strings with zero-width characters", () => {
      const text = "a\u200Bb\u200Cc";
      expect(sliceUtf16Safe(text, 0, 1)).toBe("a");
      expect(sliceUtf16Safe(text, 1, 2)).toBe("\u200B");
      expect(sliceUtf16Safe(text, 2, 3)).toBe("b");
    });

    it("handles extreme indices", () => {
      const text = "hello";
      expect(sliceUtf16Safe(text, -100, 100)).toBe("hello");
      expect(sliceUtf16Safe(text, 100, 200)).toBe("");
      // When both from and to are negative, and to > from, it swaps them
      // So -100, -50 becomes -50, -100, which after adjustment becomes 0, 0
      expect(sliceUtf16Safe(text, -100, -50)).toBe("h");
    });

    it("handles fractional indices", () => {
      const text = "hello";
      // Fractional indices are floored by Math.min/Math.max, not by Math.floor
      expect(sliceUtf16Safe(text, 0.5, 2.5)).toBe("he");
      expect(sliceUtf16Safe(text, 1.9, 3.1)).toBe("el");
    });

    it("handles NaN indices", () => {
      const text = "hello";
      expect(sliceUtf16Safe(text, NaN, 3)).toBe("hel");
      expect(sliceUtf16Safe(text, 1, NaN)).toBe("");
    });

    it("handles Infinity indices", () => {
      const text = "hello";
      expect(sliceUtf16Safe(text, 0, Infinity)).toBe("hello");
      expect(sliceUtf16Safe(text, -Infinity, 2)).toBe("he");
      expect(sliceUtf16Safe(text, Infinity, -Infinity)).toBe("hello");
    });

    it("handles very long strings", () => {
      const text = "a".repeat(10000);
      expect(sliceUtf16Safe(text, 0, 10)).toBe("aaaaaaaaaa");
      expect(sliceUtf16Safe(text, 9990, 10000)).toBe("aaaaaaaaaa");
    });

    it("handles complex emoji sequences", () => {
      const text = "👨\u200d👩\u200d👧\u200d👦"; // family emoji (multiple zero-width joiners)
      expect(text.length).toBeGreaterThan(10); // Complex emoji sequence
      expect(sliceUtf16Safe(text, 0, 2)).not.toBe(""); // Should return something meaningful
    });

    it("handles text with right-to-left marks", () => {
      const text = "ש\u05B8ל\u05B9ו\u05B9ם"; // Hebrew with diacritics
      expect(sliceUtf16Safe(text, 0, 2)).toBe("ש\u05B8");
      expect(sliceUtf16Safe(text, 2, 4)).toBe("ל\u05B9");
    });

    it("handles edge case with low surrogate at start", () => {
      // Create a string that starts with a low surrogate
      const text = "\uDC00hello"; // Low surrogate followed by ASCII
      // The function doesn't have special handling for invalid surrogate pairs
      expect(sliceUtf16Safe(text, 0, 2)).toBe("\uDC00h");
    });

    it("handles edge case with high surrogate at end", () => {
      // Create a string that ends with a high surrogate
      const text = "hello\uD800"; // ASCII followed by high surrogate
      // The function doesn't have special handling for invalid surrogate pairs
      expect(sliceUtf16Safe(text, 0, 7)).toBe("hello\uD800");
    });

    it("handles multiple consecutive surrogate pairs", () => {
      const text = "🌟🚀🎉✨🌈";
      expect(sliceUtf16Safe(text, 0, 4)).toBe("🌟🚀");
      expect(sliceUtf16Safe(text, 4, 8)).toBe("🎉✨");
      expect(sliceUtf16Safe(text, 8, 10)).toBe("");
    });

    it("handles surrogate pairs with indices in the middle", () => {
      const text = "a🌟b🚀c";
      expect(sliceUtf16Safe(text, 1, 5)).toBe("🌟b"); // Should include full emoji and following character
      expect(sliceUtf16Safe(text, 3, 5)).toBe("b"); // Should exclude the emoji to avoid splitting
    });
  });

  describe("truncateUtf16Safe", () => {
    it("handles null and undefined inputs", () => {
      // The function doesn't handle null/undefined, so we expect it to throw
      expect(() => truncateUtf16Safe(null as any, 5)).toThrow();
      expect(() => truncateUtf16Safe(undefined as any, 5)).toThrow();
    });

    it("handles numbers", () => {
      // The function expects a string, so passing a number should throw
      expect(() => truncateUtf16Safe(12345 as any, 3)).toThrow();
    });

    it("handles empty string", () => {
      expect(truncateUtf16Safe("", 5)).toBe("");
    });

    it("handles negative length", () => {
      expect(truncateUtf16Safe("hello", -5)).toBe("");
      expect(truncateUtf16Safe("hello", -1)).toBe("");
    });

    it("handles zero length", () => {
      expect(truncateUtf16Safe("hello", 0)).toBe("");
    });

    it("handles very small length", () => {
      expect(truncateUtf16Safe("hello", 1)).toBe("h");
      expect(truncateUtf16Safe("🌟", 1)).toBe(""); // Can't include half a surrogate pair
    });

    it("handles NaN length", () => {
      expect(truncateUtf16Safe("hello", NaN)).toBe("");
    });

    it("handles Infinity length", () => {
      expect(truncateUtf16Safe("hello", Infinity)).toBe("hello");
      expect(truncateUtf16Safe("🌟", Infinity)).toBe("🌟");
    });

    it("handles fractional length", () => {
      expect(truncateUtf16Safe("hello world", 5.7)).toBe("hello");
      expect(truncateUtf16Safe("hello world", 5.2)).toBe("hello");
    });

    it("handles very long strings", () => {
      const text = "a".repeat(10000);
      expect(truncateUtf16Safe(text, 100)).toBe("a".repeat(100));
    });

    it("handles string with only surrogate pairs", () => {
      const text = "🌟🚀🎉";
      expect(truncateUtf16Safe(text, 2)).toBe("🌟");
      expect(truncateUtf16Safe(text, 4)).toBe("🌟🚀");
      expect(truncateUtf16Safe(text, 6)).toBe("🌟🚀🎉");
    });

    it("handles string that ends with incomplete surrogate pair", () => {
      const text = "hello🌟";
      expect(truncateUtf16Safe(text, 6)).toBe("hello"); // Excludes emoji to avoid splitting
      expect(truncateUtf16Safe(text, 7)).toBe("hello🌟"); // Includes full emoji
    });

    it("handles string with complex emoji sequences", () => {
      const text = "👨\u200d👩\u200d👧\u200d👦world";
      const result = truncateUtf16Safe(text, 10);
      // The function doesn't have special handling for zero-width joiners
      // It only cares about surrogate pairs, so zero-width joiners are preserved
      expect(result).toContain("\u200d");
    });

    it("handles text with right-to-left marks", () => {
      const text = "ש\u05B8ל\u05B9ו\u05B9ם עו\u05B9ל\u05B8ם";
      const result = truncateUtf16Safe(text, 5);
      expect(result).toBe("ש\u05B8ל\u05B9ו");
    });

    it("handles text with zero-width characters", () => {
      const text = "a\u200Bb\u200Cc\u200Dd";
      expect(truncateUtf16Safe(text, 3)).toBe("a\u200Bb");
      expect(truncateUtf16Safe(text, 4)).toBe("a\u200Bb\u200C");
    });

    it("handles text with combining characters at boundary", () => {
      const text = "e\u0301cole"; //école
      expect(truncateUtf16Safe(text, 2)).toBe("e\u0301"); // Includes combining character
      expect(truncateUtf16Safe(text, 1)).toBe("e"); // Excludes combining character
    });

    it("handles mixed ASCII and surrogate pairs", () => {
      const text = "a🌟b🚀c🎉d";
      // Length 5: a(1) + 🌟(2) + b(1) = 4, so we get a🌟b
      expect(truncateUtf16Safe(text, 5)).toBe("a🌟b");
      // Length 6: a(1) + 🌟(2) + b(1) + 🚀(2) = 6, so we get a🌟b🚀
      expect(truncateUtf16Safe(text, 6)).toBe("a🌟b🚀");
      // Length 7: a(1) + 🌟(2) + b(1) + 🚀(2) + c(1) = 7, so we get a🌟b🚀c
      expect(truncateUtf16Safe(text, 7)).toBe("a🌟b🚀c");
    });
  });
});
