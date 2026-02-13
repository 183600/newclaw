import { describe, expect, it } from "vitest";
import {
  sliceUtf16Safe,
  truncateUtf16Safe,
  normalizePath,
  withWhatsAppPrefix,
  shortenHomeInString,
  displayString,
} from "./utils.js";

describe("String utility functions", () => {
  describe("sliceUtf16Safe", () => {
    it("should handle basic slicing", () => {
      expect(sliceUtf16Safe("hello world", 0, 5)).toBe("hello");
      expect(sliceUtf16Safe("hello world", 6)).toBe("world");
      expect(sliceUtf16Safe("hello world", -5)).toBe("world");
    });

    it("should handle surrogate pairs correctly", () => {
      // Emoji is a surrogate pair
      const emojiString = "Hello 🌍 World";
      expect(sliceUtf16Safe(emojiString, 0, 6)).toBe("Hello 🌍");
      expect(sliceUtf16Safe(emojiString, 7)).toBe("World");
      expect(sliceUtf16Safe(emojiString, 6, 7)).toBe("🌍");
    });

    it("should handle multiple emojis", () => {
      const emojiString = "👍🏽👍🏿";
      expect(sliceUtf16Safe(emojiString, 0, 2)).toBe("👍🏽");
      expect(sliceUtf16Safe(emojiString, 2)).toBe("👍🏿");
      expect(sliceUtf16Safe(emojiString, 1, 3)).toBe("👍🏿");
    });

    it("should handle edge cases", () => {
      expect(sliceUtf16Safe("", 0, 5)).toBe("");
      expect(sliceUtf16Safe("test", 0, 10)).toBe("test");
      expect(sliceUtf16Safe("test", 5)).toBe("");
      expect(sliceUtf16Safe("test", -10)).toBe("test");
    });

    it("should not split surrogate pairs", () => {
      const emojiString = "A🌍B";
      // 🌍 takes 2 code units in UTF-16
      expect(sliceUtf16Safe(emojiString, 0, 2)).toBe("A");
      expect(sliceUtf16Safe(emojiString, 0, 3)).toBe("A🌍");
      expect(sliceUtf16Safe(emojiString, 1, 3)).toBe("🌍");
      expect(sliceUtf16Safe(emojiString, 2, 4)).toBe("🌍");
    });
  });

  describe("truncateUtf16Safe", () => {
    it("should truncate basic strings", () => {
      expect(truncateUtf16Safe("hello world", 5)).toBe("hello");
      expect(truncateUtf16Safe("hello", 10)).toBe("hello");
      expect(truncateUtf16Safe("", 5)).toBe("");
    });

    it("should handle surrogate pairs correctly", () => {
      const emojiString = "Hello 🌍 World";
      expect(truncateUtf16Safe(emojiString, 6)).toBe("Hello 🌍");
      expect(truncateUtf16Safe(emojiString, 7)).toBe("Hello 🌍");
      expect(truncateUtf16Safe(emojiString, 8)).toBe("Hello 🌍 ");
    });

    it("should handle edge cases with emojis", () => {
      const emojiString = "👍🏽👍🏿";
      expect(truncateUtf16Safe(emojiString, 1)).toBe("");
      expect(truncateUtf16Safe(emojiString, 2)).toBe("👍🏽");
      expect(truncateUtf16Safe(emojiString, 3)).toBe("👍🏽");
      expect(truncateUtf16Safe(emojiString, 4)).toBe("👍🏽");
    });

    it("should handle zero and negative limits", () => {
      expect(truncateUtf16Safe("hello", 0)).toBe("");
      expect(truncateUtf16Safe("hello", -5)).toBe("");
    });
  });

  describe("normalizePath", () => {
    it("should add leading slash if missing", () => {
      expect(normalizePath("path/to/file")).toBe("/path/to/file");
      expect(normalizePath("file")).toBe("/file");
    });

    it("should keep leading slash if present", () => {
      expect(normalizePath("/path/to/file")).toBe("/path/to/file");
      expect(normalizePath("/")).toBe("/");
    });

    it("should handle empty string", () => {
      expect(normalizePath("")).toBe("/");
    });

    it("should handle root path", () => {
      expect(normalizePath("/")).toBe("/");
    });
  });

  describe("withWhatsAppPrefix", () => {
    it("should add whatsapp prefix if missing", () => {
      expect(withWhatsAppPrefix("+1234567890")).toBe("whatsapp:+1234567890");
      expect(withWhatsAppPrefix("1234567890")).toBe("whatsapp:1234567890");
    });

    it("should keep whatsapp prefix if present", () => {
      expect(withWhatsAppPrefix("whatsapp:+1234567890")).toBe("whatsapp:+1234567890");
      expect(withWhatsAppPrefix("whatsapp:1234567890")).toBe("whatsapp:1234567890");
    });

    it("should handle empty string", () => {
      expect(withWhatsAppPrefix("")).toBe("whatsapp:");
    });
  });

  describe("shortenHomeInString", () => {
    it("should replace home directory in strings", () => {
      const homeDir = require("os").homedir();
      const testString = `Path: ${homeDir}/documents/file.txt and ${homeDir}/pictures`;
      const expected = `Path: ~/documents/file.txt and ~/pictures`;

      expect(shortenHomeInString(testString)).toBe(expected);
    });

    it("should handle multiple home directory occurrences", () => {
      const homeDir = require("os").homedir();
      const testString = `${homeDir}/${homeDir}/${homeDir}`;
      const expected = "~/~/~";

      expect(shortenHomeInString(testString)).toBe(expected);
    });

    it("should handle empty string", () => {
      expect(shortenHomeInString("")).toBe("");
    });

    it("should handle string without home directory", () => {
      const testString = "/usr/local/bin";
      expect(shortenHomeInString(testString)).toBe(testString);
    });
  });

  describe("displayString", () => {
    it("should be an alias for shortenHomeInString", () => {
      const homeDir = require("os").homedir();
      const testString = `Path: ${homeDir}/documents/file.txt`;
      const expected = `Path: ~/documents/file.txt`;

      expect(displayString(testString)).toBe(expected);
      expect(displayString(testString)).toBe(shortenHomeInString(testString));
    });

    it("should handle empty string", () => {
      expect(displayString("")).toBe("");
    });
  });
});
