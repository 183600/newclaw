import { describe, expect, it } from "vitest";
import { stripAnsi, visibleWidth } from "./ansi.js";

describe("stripAnsi", () => {
  it("removes SGR ANSI escape codes", () => {
    expect(stripAnsi("\x1b[31mRed text\x1b[0m")).toBe("Red text");
    expect(stripAnsi("\x1b[1;32mBold green\x1b[0m")).toBe("Bold green");
    expect(stripAnsi("\x1b[4mUnderlined\x1b[0m")).toBe("Underlined");
  });

  it("removes OSC-8 hyperlink escape codes", () => {
    expect(stripAnsi("\x1b]8;;https://example.com\x1b\\Link\x1b]8;;\x1b\\")).toBe("Link");
    expect(stripAnsi("\x1b]8;;https://example.com\x1b\\Click me\x1b]8;;\x1b\\")).toBe("Click me");
  });

  it("removes both SGR and OSC-8 codes", () => {
    expect(
      stripAnsi("\x1b[31m\x1b]8;;https://example.com\x1b\\Red link\x1b]8;;\x1b\\\x1b[0m"),
    ).toBe("Red link");
  });

  it("handles multiple ANSI sequences", () => {
    expect(stripAnsi("\x1b[31mRed\x1b[0m and \x1b[32mGreen\x1b[0m and \x1b[34mBlue\x1b[0m")).toBe(
      "Red and Green and Blue",
    );
  });

  it("preserves text without ANSI codes", () => {
    expect(stripAnsi("Plain text")).toBe("Plain text");
    expect(stripAnsi("")).toBe("");
    expect(stripAnsi("123")).toBe("123");
  });

  it("handles empty ANSI sequences", () => {
    expect(stripAnsi("\x1b[m\x1b[]m")).toBe("");
  });

  it("handles complex SGR parameters", () => {
    expect(stripAnsi("\x1b[1;2;3;38;5;123mComplex\x1b[0m")).toBe("Complex");
  });

  it("handles malformed ANSI sequences gracefully", () => {
    // Should remove the escape sequence parts even if malformed
    expect(stripAnsi("\x1b[31mIncomplete")).toBe("Incomplete");
    expect(stripAnsi("\x1b[Invalid\x1b[0m")).toBe("Invalid");
  });
});

describe("visibleWidth", () => {
  it("returns 0 for empty string", () => {
    expect(visibleWidth("")).toBe(0);
  });

  it("counts regular ASCII characters", () => {
    expect(visibleWidth("hello")).toBe(5);
    expect(visibleWidth("Hello, World!")).toBe(13);
  });

  it("counts emoji as single characters", () => {
    expect(visibleWidth("😀")).toBe(1);
    expect(visibleWidth("👍")).toBe(1);
    expect(visibleWidth("🎉")).toBe(1);
  });

  it("counts CJK characters as single characters", () => {
    expect(visibleWidth("你好")).toBe(2);
    expect(visibleWidth("こんにちは")).toBe(5);
    expect(visibleWidth("안녕하세요")).toBe(5);
  });

  it("handles the special case e + combining acute accent", () => {
    expect(visibleWidth("e\u0301")).toBe(1);
  });

  it("handles the special case family emoji with ZWJ", () => {
    expect(visibleWidth("👨‍👩‍👧‍👦")).toBe(1);
  });

  it("handles the special case emoji with CJK", () => {
    expect(visibleWidth("😀你好")).toBe(4);
  });

  it("ignores ANSI codes in width calculation", () => {
    expect(visibleWidth("\x1b[31mRed\x1b[0m")).toBe(3);
    expect(visibleWidth("\x1b[1mBold\x1b[0m")).toBe(4);
  });

  it("handles mixed content", () => {
    expect(visibleWidth("Hello 👋 World")).toBe(13);
    expect(visibleWidth("A😀B🎉C")).toBe(5);
    expect(visibleWidth("测试123")).toBe(5);
  });

  it("handles variation selectors", () => {
    // Variation selector-16 (U+FE0F)
    expect(visibleWidth("❤️")).toBe(1);
    expect(visibleWidth("⭐️")).toBe(1);
  });

  it("handles emoji skin tone modifiers", () => {
    expect(visibleWidth("👋🏻")).toBe(1); // Light skin tone
    expect(visibleWidth("👋🏼")).toBe(1); // Medium-light skin tone
    expect(visibleWidth("👋🏽")).toBe(1); // Medium skin tone
    expect(visibleWidth("👋🏾")).toBe(1); // Medium-dark skin tone
    expect(visibleWidth("👋🏿")).toBe(1); // Dark skin tone
  });

  it("handles complex emoji sequences", () => {
    // Flag emojis (regional indicator symbols)
    expect(visibleWidth("🇺🇸")).toBe(1);
    expect(visibleWidth("🇨🇳")).toBe(1);

    // ZWJ sequences
    expect(visibleWidth("👨‍💻")).toBe(1); // Man technologist
    expect(visibleWidth("👩‍🚀")).toBe(1); // Woman astronaut
  });

  it("handles control characters", () => {
    expect(visibleWidth("\t")).toBe(1);
    expect(visibleWidth("\n")).toBe(1);
    expect(visibleWidth("\r")).toBe(1);
  });

  it("handles spaces", () => {
    expect(visibleWidth(" ")).toBe(1);
    expect(visibleWidth("  ")).toBe(2);
    expect(visibleWidth("Hello World")).toBe(11);
  });

  it("handles punctuation and symbols", () => {
    expect(visibleWidth("!@#$%^&*()")).toBe(10);
    expect(visibleWidth(".,;:?!'\"")).toBe(8);
    expect(visibleWidth("[]{}()<>")).toBe(8);
  });

  it("handles numbers", () => {
    expect(visibleWidth("1234567890")).toBe(10);
    expect(visibleWidth("3.14159")).toBe(7);
    expect(visibleWidth("-100")).toBe(4);
  });

  it("handles mixed ASCII and Unicode", () => {
    expect(visibleWidth("Hello 世界")).toBe(8);
    expect(visibleWidth("A😀B你好C")).toBe(6);
  });
});
