import { describe, expect, it } from "vitest";
import {
  clampNumber,
  clampInt,
  isSelfChatMode,
  sliceUtf16Safe,
  truncateUtf16Safe,
  resolveHomeDir,
  shortenHomePath,
  shortenHomeInString,
  displayPath,
  displayString,
  formatTerminalLink,
} from "./utils.js";

describe("clampNumber", () => {
  it("clamps values within range", () => {
    expect(clampNumber(5, 1, 10)).toBe(5);
    expect(clampNumber(0, 1, 10)).toBe(1);
    expect(clampNumber(15, 1, 10)).toBe(10);
  });

  it("handles negative ranges", () => {
    expect(clampNumber(-5, -10, -1)).toBe(-5);
    expect(clampNumber(-15, -10, -1)).toBe(-10);
    expect(clampNumber(0, -10, -1)).toBe(-1);
  });

  it("handles equal min and max", () => {
    expect(clampNumber(5, 5, 5)).toBe(5);
    expect(clampNumber(0, 5, 5)).toBe(5);
    expect(clampNumber(10, 5, 5)).toBe(5);
  });

  it("handles floating point numbers", () => {
    expect(clampNumber(3.14, 1, 5)).toBe(3.14);
    expect(clampNumber(0.99, 1, 5)).toBe(1);
    expect(clampNumber(5.01, 1, 5)).toBe(5);
  });
});

describe("clampInt", () => {
  it("clamps and floors values", () => {
    expect(clampInt(5.7, 1, 10)).toBe(5);
    expect(clampInt(0.9, 1, 10)).toBe(1);
    expect(clampInt(10.1, 1, 10)).toBe(10);
  });

  it("handles negative values", () => {
    expect(clampInt(-5.7, -10, -1)).toBe(-6);
    expect(clampInt(-0.9, -10, -1)).toBe(-1);
    expect(clampInt(-10.1, -10, -1)).toBe(-10);
  });
});

describe("isSelfChatMode", () => {
  it("returns false when selfE164 is null/undefined", () => {
    expect(isSelfChatMode(null, ["+1234567890"])).toBe(false);
    expect(isSelfChatMode(undefined, ["+1234567890"])).toBe(false);
  });

  it("returns false when allowFrom is empty", () => {
    expect(isSelfChatMode("+1234567890", [])).toBe(false);
    expect(isSelfChatMode("+1234567890", null)).toBe(false);
    expect(isSelfChatMode("+1234567890", undefined)).toBe(false);
  });

  it("returns false when allowFrom contains wildcard", () => {
    expect(isSelfChatMode("+1234567890", ["*"])).toBe(false);
    expect(isSelfChatMode("+1234567890", ["+", "*"])).toBe(false);
  });

  it("returns true when selfE164 matches allowFrom", () => {
    expect(isSelfChatMode("+1234567890", ["+1234567890"])).toBe(true);
    expect(isSelfChatMode("+1234567890", ["+1111111111", "+1234567890"])).toBe(true);
    expect(isSelfChatMode("+1234567890", [1234567890])).toBe(true);
  });

  it("handles whatsapp: prefix in allowFrom", () => {
    expect(isSelfChatMode("+1234567890", ["whatsapp:+1234567890"])).toBe(true);
  });

  it("handles formatting differences", () => {
    expect(isSelfChatMode("+1234567890", ["(123) 456-7890"])).toBe(true);
    expect(isSelfChatMode("+1234567890", ["123-456-7890"])).toBe(true);
  });
});

describe("sliceUtf16Safe", () => {
  it("handles basic slicing", () => {
    expect(sliceUtf16Safe("hello", 1, 3)).toBe("el");
    expect(sliceUtf16Safe("world", 0, 5)).toBe("world");
  });

  it("handles negative indices", () => {
    expect(sliceUtf16Safe("hello", -2)).toBe("lo");
    expect(sliceUtf16Safe("hello", -3, -1)).toBe("ll");
  });

  it("handles swapped indices", () => {
    expect(sliceUtf16Safe("hello", 3, 1)).toBe("el");
    expect(sliceUtf16Safe("hello", -1, -3)).toBe("ll");
  });

  it("handles surrogate pairs correctly", () => {
    // Emoji with surrogate pair: 🌟 (U+1F31F)
    const emoji = "🌟";
    expect(sliceUtf16Safe(emoji, 0, 2)).toBe("🌟");
    expect(sliceUtf16Safe("a🌟b", 0, 3)).toBe("a🌟");
    expect(sliceUtf16Safe("a🌟b", 1, 3)).toBe("🌟");
    expect(sliceUtf16Safe("a🌟b", 2, 3)).toBe("");
  });

  it("handles out of bounds", () => {
    expect(sliceUtf16Safe("hello", 10)).toBe("");
    expect(sliceUtf16Safe("hello", -10)).toBe("hello");
    expect(sliceUtf16Safe("hello", 0, 10)).toBe("hello");
  });
});

describe("truncateUtf16Safe", () => {
  it("truncates basic strings", () => {
    expect(truncateUtf16Safe("hello", 3)).toBe("hel");
    expect(truncateUtf16Safe("world", 10)).toBe("world");
  });

  it("handles zero length", () => {
    expect(truncateUtf16Safe("hello", 0)).toBe("");
  });

  it("handles negative length", () => {
    expect(truncateUtf16Safe("hello", -1)).toBe("");
  });

  it("preserves surrogate pairs", () => {
    const emoji = "🌟";
    expect(truncateUtf16Safe(emoji, 1)).toBe("");
    expect(truncateUtf16Safe(emoji, 2)).toBe("🌟");
    expect(truncateUtf16Safe("a🌟b", 3)).toBe("a🌟");
  });
});

describe("resolveHomeDir", () => {
  it("returns HOME environment variable", () => {
    const originalHome = process.env.HOME;
    process.env.HOME = "/test/home";
    expect(resolveHomeDir()).toBe("/test/home");
    process.env.HOME = originalHome;
  });

  it("falls back to USERPROFILE", () => {
    const originalHome = process.env.HOME;
    const originalProfile = process.env.USERPROFILE;
    delete process.env.HOME;
    process.env.USERPROFILE = "/test/profile";
    expect(resolveHomeDir()).toBe("/test/profile");
    process.env.HOME = originalHome;
    process.env.USERPROFILE = originalProfile;
  });

  it("falls back to os.homedir()", () => {
    const originalHome = process.env.HOME;
    const originalProfile = process.env.USERPROFILE;
    delete process.env.HOME;
    delete process.env.USERPROFILE;
    expect(resolveHomeDir()).toBe(require("os").homedir());
    process.env.HOME = originalHome;
    process.env.USERPROFILE = originalProfile;
  });
});

describe("shortenHomePath", () => {
  it("replaces home directory with ~", () => {
    const homeDir = require("os").homedir();
    expect(shortenHomePath(homeDir)).toBe("~");
    expect(shortenHomePath(`${homeDir}/test`)).toBe("~/test");
    expect(shortenHomePath(`${homeDir}/nested/path`)).toBe("~/nested/path");
  });

  it("handles non-home paths", () => {
    expect(shortenHomePath("/usr/local/bin")).toBe("/usr/local/bin");
    expect(shortenHomePath("C:\\Windows")).toBe("C:\\Windows");
  });

  it("handles empty and null inputs", () => {
    expect(shortenHomePath("")).toBe("");
    expect(shortenHomePath("   ")).toBe("   ");
  });
});

describe("shortenHomeInString", () => {
  it("replaces home directory in strings", () => {
    const homeDir = require("os").homedir();
    expect(shortenHomeInString(`Path: ${homeDir}/test`)).toBe("Path: ~/test");
    expect(shortenHomeInString(`${homeDir} and ${homeDir}/test`)).toBe("~ and ~/test");
  });

  it("handles multiple occurrences", () => {
    const homeDir = require("os").homedir();
    expect(shortenHomeInString(`${homeDir}/a, ${homeDir}/b, ${homeDir}/c`)).toBe("~/a, ~/b, ~/c");
  });

  it("handles empty strings", () => {
    expect(shortenHomeInString("")).toBe("");
  });
});

describe("displayPath", () => {
  it("is an alias for shortenHomePath", () => {
    const homeDir = require("os").homedir();
    expect(displayPath(`${homeDir}/test`)).toBe("~/test");
    expect(displayPath("/usr/local/bin")).toBe("/usr/local/bin");
  });
});

describe("displayString", () => {
  it("is an alias for shortenHomeInString", () => {
    const homeDir = require("os").homedir();
    expect(displayString(`Path: ${homeDir}/test`)).toBe("Path: ~/test");
    expect(displayString("No home path here")).toBe("No home path here");
  });
});

describe("formatTerminalLink", () => {
  it("creates terminal hyperlink when TTY is available", () => {
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = true;

    const result = formatTerminalLink("Test Link", "https://example.com");
    expect(result).toBe("\u001b]8;;https://example.com\u0007Test Link\u001b]8;;\u0007");

    process.stdout.isTTY = originalIsTTY;
  });

  it("uses fallback when not TTY", () => {
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = false;

    const result = formatTerminalLink("Test Link", "https://example.com");
    expect(result).toBe("Test Link (https://example.com)");

    process.stdout.isTTY = originalIsTTY;
  });

  it("uses custom fallback", () => {
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = false;

    const result = formatTerminalLink("Test Link", "https://example.com", { fallback: "Custom" });
    expect(result).toBe("Custom");

    process.stdout.isTTY = originalIsTTY;
  });

  it("forces link creation", () => {
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = false;

    const result = formatTerminalLink("Test Link", "https://example.com", { force: true });
    expect(result).toBe("\u001b]8;;https://example.com\u0007Test Link\u001b]8;;\u0007");

    process.stdout.isTTY = originalIsTTY;
  });

  it("prevents link creation when forced false", () => {
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = true;

    const result = formatTerminalLink("Test Link", "https://example.com", { force: false });
    expect(result).toBe("Test Link (https://example.com)");

    process.stdout.isTTY = originalIsTTY;
  });

  it("escapes escape sequences in label and URL", () => {
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = true;

    const result = formatTerminalLink("Test\u001bLink", "https://example\u001b.com");
    expect(result).toBe("\u001b]8;;https://example.com\u0007TestLink\u001b]8;;\u0007");

    process.stdout.isTTY = originalIsTTY;
  });
});
