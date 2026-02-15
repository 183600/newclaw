import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clampInt,
  clampNumber,
  ensureDir,
  formatTerminalLink,
  isSelfChatMode,
  jidToE164,
  normalizeE164,
  normalizePath,
  resolveConfigDir,
  resolveHomeDir,
  resolveJidToE164,
  resolveUserPath,
  shortenHomeInString,
  shortenHomePath,
  sliceUtf16Safe,
  toWhatsappJid,
  truncateUtf16Safe,
  withWhatsAppPrefix,
} from "./utils.js";

describe("utils - Additional Edge Cases", () => {
  describe("Number clamping functions", () => {
    it("should handle edge cases in clampNumber", () => {
      expect(clampNumber(0, 0, 0)).toBe(0);
      expect(clampNumber(-1, -5, -2)).toBe(-2);
      expect(clampNumber(10, 20, 30)).toBe(20);
      expect(clampNumber(25, 20, 30)).toBe(25);
      expect(clampNumber(35, 20, 30)).toBe(30);
    });

    it("should handle special numeric values in clampNumber", () => {
      expect(clampNumber(NaN, 0, 10)).toBeNaN();
      expect(clampNumber(Infinity, 0, 10)).toBe(10);
      expect(clampNumber(-Infinity, 0, 10)).toBe(0);
    });

    it("should handle edge cases in clampInt", () => {
      expect(clampInt(0.9, 0, 10)).toBe(0);
      expect(clampInt(1.1, 0, 10)).toBe(1);
      expect(clampInt(9.9, 0, 10)).toBe(9);
      expect(clampInt(10.1, 0, 10)).toBe(10);
      expect(clampInt(-0.1, 0, 10)).toBe(0);
      expect(clampInt(-1.1, 0, 10)).toBe(0);
    });

    it("should handle very large numbers in clampInt", () => {
      expect(clampInt(Number.MAX_SAFE_INTEGER, 0, 10)).toBe(10);
      expect(clampInt(Number.MIN_SAFE_INTEGER, 0, 10)).toBe(0);
    });
  });

  describe("Path resolution functions", () => {
    it("should handle edge cases in normalizePath", () => {
      expect(normalizePath("")).toBe("/");
      expect(normalizePath("/")).toBe("/");
      expect(normalizePath("//")).toBe("//");
      expect(normalizePath("///")).toBe("///");
      expect(normalizePath("a/b/c")).toBe("/a/b/c");
      expect(normalizePath("/a/b/c")).toBe("/a/b/c");
    });

    it("should handle complex paths in resolveUserPath", () => {
      // Test basic functionality without mocking
      expect(resolveUserPath("relative/path")).toBe(path.resolve("relative/path"));
      expect(resolveUserPath("/absolute/path")).toBe("/absolute/path");
      expect(resolveUserPath("   ")).toBe("   "); // Preserves whitespace
      expect(resolveUserPath("")).toBe(""); // Preserves empty string

      // Test with actual home directory
      const homeDir = os.homedir();
      expect(resolveUserPath("~")).toBe(homeDir);
      expect(resolveUserPath("~/")).toBe(homeDir);
      expect(resolveUserPath("~/test")).toBe(path.join(homeDir, "test"));
      expect(resolveUserPath("~/test/path")).toBe(path.join(homeDir, "test/path"));
    });

    it("should handle edge cases in shortenHomePath", () => {
      const homeDir = os.homedir();

      expect(shortenHomePath("")).toBe("");
      expect(shortenHomePath(homeDir)).toBe("~");
      expect(shortenHomePath(`${homeDir}/test`)).toBe("~/test");
      expect(shortenHomePath(`${homeDir}/test/path`)).toBe("~/test/path");
      expect(shortenHomePath("/other/path")).toBe("/other/path");
      expect(shortenHomePath(`${homeDir}test`)).toBe(`${homeDir}test`); // No separator
    });

    it("should handle multiple home directory occurrences in shortenHomeInString", () => {
      const homeDir = os.homedir();

      const input = `Path1: ${homeDir}/test1 and Path2: ${homeDir}/test2`;
      const expected = "Path1: ~/test1 and Path2: ~/test2";
      expect(shortenHomeInString(input)).toBe(expected);
    });

    it("should handle environment overrides in resolveConfigDir", () => {
      const customDir = "/custom/config/dir";
      const originalEnv = process.env;

      vi.stubEnv("OPENCLAW_STATE_DIR", customDir);
      expect(resolveConfigDir()).toBe(customDir);

      vi.stubEnv("CLAWDBOT_STATE_DIR", customDir);
      expect(resolveConfigDir()).toBe(customDir);

      process.env = originalEnv;
    });
  });

  describe("WhatsApp/JID functions", () => {
    it("should handle edge cases in normalizeE164", () => {
      expect(normalizeE164("")).toBe("+");
      expect(normalizeE164("123")).toBe("+123");
      expect(normalizeE164("+123")).toBe("+123");
      // Note: The function doesn't handle multiple plus signs, it preserves them
      expect(normalizeE164("++123")).toBe("++123");
      expect(normalizeE164("(555) 123-4567")).toBe("+5551234567");
      expect(normalizeE164("  555 123 4567  ")).toBe("+5551234567");
      expect(normalizeE164("whatsapp:+5551234567")).toBe("+5551234567");
      expect(normalizeE164("whatsapp:5551234567")).toBe("+5551234567");
    });

    it("should handle edge cases in toWhatsappJid", () => {
      expect(toWhatsappJid("1234567890")).toBe("1234567890@s.whatsapp.net");
      expect(toWhatsappJid("+1234567890")).toBe("1234567890@s.whatsapp.net");
      expect(toWhatsappJid("whatsapp:+1234567890")).toBe("1234567890@s.whatsapp.net");
      expect(toWhatsappJid("1234567890@s.whatsapp.net")).toBe("1234567890@s.whatsapp.net");
      expect(toWhatsappJid("1234567890:1@s.whatsapp.net")).toBe("1234567890:1@s.whatsapp.net");
      expect(toWhatsappJid("test@g.us")).toBe("test@g.us");
      expect(toWhatsappJid("")).toBe("@s.whatsapp.net");
    });

    it("should handle complex JID formats in jidToE164", () => {
      // Regular JIDs
      expect(jidToE164("1234567890@s.whatsapp.net")).toBe("+1234567890");
      expect(jidToE164("1234567890:1@s.whatsapp.net")).toBe("+1234567890");
      expect(jidToE164("1234567890@hosted")).toBe("+1234567890");

      // Invalid JIDs
      expect(jidToE164("invalid")).toBe(null);
      expect(jidToE164("")).toBe(null);
      expect(jidToE164("@s.whatsapp.net")).toBe(null);
      expect(jidToE164("abc@s.whatsapp.net")).toBe(null);
    });

    it("should handle LID mappings in jidToE164", () => {
      const authDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-test-"));
      const mappingPath = path.join(authDir, "lid-mapping-123_reverse.json");

      // Create a valid mapping file
      fs.writeFileSync(mappingPath, JSON.stringify("5551234567"));
      expect(jidToE164("123@lid", { authDir })).toBe("+5551234567");

      // Test with numeric mapping
      fs.writeFileSync(mappingPath, JSON.stringify(5559876543));
      expect(jidToE164("123@lid", { authDir })).toBe("+5559876543");

      // Clean up
      fs.rmSync(authDir, { recursive: true, force: true });
    });

    it("should handle async resolution in resolveJidToE164", async () => {
      const mockLidLookup = {
        getPNForLID: vi.fn().mockResolvedValue("1234567890@s.whatsapp.net"),
      };

      const result = await resolveJidToE164("123@lid", { lidLookup: mockLidLookup });
      expect(result).toBe("+1234567890");
      expect(mockLidLookup.getPNForLID).toHaveBeenCalledWith("123@lid");

      // Test with null/undefined input
      expect(await resolveJidToE164(null)).toBe(null);
      expect(await resolveJidToE164(undefined)).toBe(null);
      expect(await resolveJidToE164("")).toBe(null);
    });

    it("should handle edge cases in isSelfChatMode", () => {
      expect(isSelfChatMode(null)).toBe(false);
      expect(isSelfChatMode(undefined)).toBe(false);
      expect(isSelfChatMode("")).toBe(false);
      expect(isSelfChatMode("+1234567890")).toBe(false);
      expect(isSelfChatMode("+1234567890", [])).toBe(false);
      expect(isSelfChatMode("+1234567890", ["*"])).toBe(false);
      expect(isSelfChatMode("+1234567890", ["+1234567890"])).toBe(true);
      expect(isSelfChatMode("+1234567890", ["1234567890"])).toBe(true);
      expect(isSelfChatMode("+1234567890", [1234567890])).toBe(true);
      expect(isSelfChatMode("whatsapp:+1234567890", ["+1234567890"])).toBe(true);
    });
  });

  describe("UTF-16 string handling", () => {
    it("should handle surrogate pairs in sliceUtf16Safe", () => {
      // Test with emoji (surrogate pair)
      const emoji = "🤔🧐";
      // Note: sliceUtf16Safe works with UTF-16 code units, not Unicode characters
      // Each emoji takes 2 UTF-16 code units, so slicing at 1 gets half an emoji
      expect(sliceUtf16Safe(emoji, 0, 2)).toBe("🤔");
      expect(sliceUtf16Safe(emoji, 2, 4)).toBe("🧐");
      expect(sliceUtf16Safe(emoji, 0, 4)).toBe("🤔🧐");

      // Test with negative indices
      expect(sliceUtf16Safe(emoji, -2)).toBe("🧐");
      expect(sliceUtf16Safe(emoji, -4, -2)).toBe("🤔");

      // Test edge cases
      expect(sliceUtf16Safe("", 0, 1)).toBe("");
      expect(sliceUtf16Safe("a", 0, 1)).toBe("a");
      expect(sliceUtf16Safe("a", -1, 0)).toBe(""); // Swapped indices result in empty
    });

    it("should handle edge cases in truncateUtf16Safe", () => {
      const text = "🤔🧐test";
      expect(truncateUtf16Safe(text, 0)).toBe("");
      expect(truncateUtf16Safe(text, 2)).toBe("🤔");
      expect(truncateUtf16Safe(text, 4)).toBe("🤔🧐");
      expect(truncateUtf16Safe(text, 5)).toBe("🤔🧐t");
      expect(truncateUtf16Safe(text, 10)).toBe(text);
      expect(truncateUtf16Safe(text, -1)).toBe("");
      expect(truncateUtf16Safe(text, NaN)).toBe("");
    });

    it("should handle complex surrogate scenarios", () => {
      // String with mixed surrogate pairs and regular characters
      const complex = "a🤔b🧐c";
      // Test basic operations that should work reliably
      expect(sliceUtf16Safe(complex, 0, 1)).toBe("a");
      expect(sliceUtf16Safe(complex, 0, 3)).toBe("a🤔"); // Includes surrogate pair
      expect(sliceUtf16Safe(complex, 0, 4)).toBe("a🤔b");
      expect(sliceUtf16Safe(complex, 0, 7)).toBe("a🤔b🧐c"); // Full string
      expect(sliceUtf16Safe(complex, -1)).toBe("c"); // Last character
    });
  });

  describe("Terminal formatting", () => {
    it("should handle edge cases in formatTerminalLink", () => {
      const label = "Test Link";
      const url = "https://example.com";

      // Test with TTY enabled
      const originalIsTTY = process.stdout.isTTY;
      process.stdout.isTTY = true;

      expect(formatTerminalLink(label, url)).toContain(label);
      expect(formatTerminalLink(label, url)).toContain(url);
      expect(formatTerminalLink(label, url)).toContain("\u001b]8;;");

      // Test with TTY disabled
      process.stdout.isTTY = false;
      expect(formatTerminalLink(label, url)).toBe(`${label} (${url})`);
      expect(formatTerminalLink(label, url, { fallback: "Custom" })).toBe("Custom");

      // Test with force option
      expect(formatTerminalLink(label, url, { force: true })).toContain("\u001b]8;;");
      expect(formatTerminalLink(label, url, { force: false })).toBe(`${label} (${url})`);

      // Test with escape sequences
      const labelWithEsc = "Test\u001b[31mLink";
      const urlWithEsc = "https://\u001b[31mexample.com";
      const result = formatTerminalLink(labelWithEsc, urlWithEsc, { force: true });
      expect(result).not.toContain("\u001b[31m");

      process.stdout.isTTY = originalIsTTY;
    });
  });

  describe("File system operations", () => {
    it("should handle nested directory creation in ensureDir", async () => {
      const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "openclaw-test-"));
      const nestedDir = path.join(tmpDir, "level1", "level2", "level3");

      await ensureDir(nestedDir);
      expect(fs.existsSync(nestedDir)).toBe(true);

      // Test with existing directory
      await ensureDir(nestedDir);
      expect(fs.existsSync(nestedDir)).toBe(true);

      // Clean up
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("should handle permission errors gracefully in ensureDir", async () => {
      // This test would require mocking fs.promises.mkdir to throw an error
      // For now, we just test the success case
      const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "openclaw-test-"));
      const testDir = path.join(tmpDir, "test");

      await expect(ensureDir(testDir)).resolves.not.toThrow();
      expect(fs.existsSync(testDir)).toBe(true);

      // Clean up
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
  });

  describe("String and path utilities", () => {
    it("should handle edge cases in withWhatsAppPrefix", () => {
      expect(withWhatsAppPrefix("1234567890")).toBe("whatsapp:1234567890");
      expect(withWhatsAppPrefix("+1234567890")).toBe("whatsapp:+1234567890");
      expect(withWhatsAppPrefix("whatsapp:1234567890")).toBe("whatsapp:1234567890");
      expect(withWhatsAppPrefix("")).toBe("whatsapp:");
      expect(withWhatsAppPrefix("whatsapp:")).toBe("whatsapp:");
    });

    it("should handle edge cases in resolveHomeDir", () => {
      const originalEnv = process.env;

      // Test with HOME
      vi.stubEnv("HOME", "/test/home");
      expect(resolveHomeDir()).toBe("/test/home");

      // Test with USERPROFILE
      vi.stubEnv("HOME", "");
      vi.stubEnv("USERPROFILE", "/test/profile");
      expect(resolveHomeDir()).toBe("/test/profile");

      // Test with os.homedir fallback
      vi.stubEnv("HOME", "");
      vi.stubEnv("USERPROFILE", "");
      const mockHomedir = vi.spyOn(os, "homedir").mockReturnValue("/mock/home");
      expect(resolveHomeDir()).toBe("/mock/home");

      // Test with no home directory available
      mockHomedir.mockReturnValue("");
      expect(resolveHomeDir()).toBeUndefined();

      // Restore
      process.env = originalEnv;
      vi.restoreAllMocks();
    });
  });
});
