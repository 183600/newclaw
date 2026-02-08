import { describe, expect, it } from "vitest";
import { sliceUtf16Safe, truncateUtf16Safe } from "../utils.ts";

describe("UTF-16 utilities", () => {
  describe("sliceUtf16Safe", () => {
    it("handles basic slicing", () => {
      expect(sliceUtf16Safe("hello world", 0, 5)).toBe("hello");
      expect(sliceUtf16Safe("hello world", 6)).toBe("world");
    });

    it("handles negative indices", () => {
      expect(sliceUtf16Safe("hello", -2)).toBe("lo");
      expect(sliceUtf16Safe("hello", 0, -2)).toBe("hel");
    });

    it("handles swapped indices", () => {
      expect(sliceUtf16Safe("hello", 3, 1)).toBe("el");
    });

    it("handles surrogate pairs correctly", () => {
      // Emoji is a surrogate pair (2 code units)
      const emoji = "🌟"; // U+1F31F
      expect(emoji.length).toBe(2); // Takes 2 code units in UTF-16

      const text = `hello${emoji}world`;
      expect(sliceUtf16Safe(text, 0, 5)).toBe("hello"); // Before emoji
      expect(sliceUtf16Safe(text, 5, 7)).toBe(emoji); // The emoji
      expect(sliceUtf16Safe(text, 7)).toBe("world"); // After emoji

      // Don't split surrogate pairs - if we try to split at 6, it adjusts to avoid splitting
      expect(sliceUtf16Safe(text, 0, 6)).toBe("hello"); // Excludes emoji to avoid splitting
      expect(sliceUtf16Safe(text, 6)).toBe("world"); // Excludes emoji and starts after it
    });

    it("handles multiple surrogate pairs", () => {
      const text = "🌟🚀🎉";
      expect(sliceUtf16Safe(text, 0, 2)).toBe("🌟");
      expect(sliceUtf16Safe(text, 2, 4)).toBe("🚀");
      expect(sliceUtf16Safe(text, 4)).toBe("🎉");
    });

    it("handles mixed surrogate pairs and regular characters", () => {
      const text = "a🌟b🚀c";
      expect(sliceUtf16Safe(text, 0, 1)).toBe("a");
      expect(sliceUtf16Safe(text, 1, 3)).toBe("🌟");
      expect(sliceUtf16Safe(text, 3, 4)).toBe("b");
      expect(sliceUtf16Safe(text, 4, 6)).toBe("🚀");
      expect(sliceUtf16Safe(text, 6)).toBe("c");
    });

    it("handles edge cases", () => {
      expect(sliceUtf16Safe("", 0, 5)).toBe("");
      expect(sliceUtf16Safe("hello", 0, 100)).toBe("hello");
      expect(sliceUtf16Safe("hello", -10, 10)).toBe("hello");
    });
  });

  describe("truncateUtf16Safe", () => {
    it("truncates basic text", () => {
      expect(truncateUtf16Safe("hello world", 5)).toBe("hello");
      expect(truncateUtf16Safe("hello", 10)).toBe("hello");
    });

    it("handles zero length", () => {
      expect(truncateUtf16Safe("hello", 0)).toBe("");
    });

    it("preserves surrogate pairs", () => {
      const emoji = "🌟";
      const text = `hello${emoji}world`;

      // Truncate before emoji
      expect(truncateUtf16Safe(text, 5)).toBe("hello");

      // Truncate at emoji boundary - avoids splitting the surrogate pair
      expect(truncateUtf16Safe(text, 6)).toBe("hello"); // Excludes emoji to avoid splitting
      expect(truncateUtf16Safe(text, 7)).toBe(`hello${emoji}`); // Includes full emoji

      // Truncate after emoji
      expect(truncateUtf16Safe(text, 8)).toBe(`hello${emoji}w`);
    });

    it("handles multiple emojis", () => {
      const text = "🌟🚀🎉";
      expect(truncateUtf16Safe(text, 2)).toBe("🌟");
      expect(truncateUtf16Safe(text, 4)).toBe("🌟🚀");
      expect(truncateUtf16Safe(text, 6)).toBe("🌟🚀🎉");
    });

    it("handles negative length", () => {
      expect(truncateUtf16Safe("hello", -5)).toBe("");
    });

    it("handles decimal length", () => {
      expect(truncateUtf16Safe("hello world", 5.7)).toBe("hello");
    });
  });
});
