import { describe, expect, it } from "vitest";
import { stripAnsi, visibleWidth } from "./ansi.js";

describe("stripAnsi", () => {
  it("should strip ANSI SGR sequences", () => {
    expect(stripAnsi("\x1b[31mRed text\x1b[0m")).toBe("Red text");
    expect(stripAnsi("\x1b[1;31mBold red text\x1b[0m")).toBe("Bold red text");
    expect(stripAnsi("\x1b[4mUnderlined text\x1b[0m")).toBe("Underlined text");
  });

  it("should strip OSC-8 hyperlinks", () => {
    expect(stripAnsi("\x1b]8;;https://example.com\x1b\\Link\x1b]8;;\x1b\\")).toBe("Link");
    expect(stripAnsi("\x1b]8;;https://example.com\x1b\\\\Link\x1b]8;;\x1b\\\\")).toBe("Link");
  });

  it("should handle mixed ANSI and OSC-8 sequences", () => {
    expect(
      stripAnsi("\x1b[31m\x1b]8;;https://example.com\x1b\\Red link\x1b]8;;\x1b\\\x1b[0m"),
    ).toBe("Red link");
  });

  it("should handle malformed ANSI sequences", () => {
    expect(stripAnsi("\x1b[Invalid")).toBe("Invalid");
    expect(stripAnsi("Prefix\x1b[InvalidSuffix")).toBe("PrefixInvalidSuffix");
  });

  it("should handle empty ANSI sequences", () => {
    expect(stripAnsi("\x1b[mText")).toBe("Text");
    expect(stripAnsi("Text\x1b[m")).toBe("Text");
    expect(stripAnsi("Text\x1b[]mMore")).toBe("TextMore");
  });

  it("should handle empty input", () => {
    expect(stripAnsi("")).toBe("");
  });

  it("should handle input without ANSI codes", () => {
    expect(stripAnsi("Plain text")).toBe("Plain text");
  });

  it("should handle multiple ANSI sequences", () => {
    expect(stripAnsi("\x1b[31mRed\x1b[0m \x1b[32mGreen\x1b[0m \x1b[34mBlue\x1b[0m")).toBe(
      "Red Green Blue",
    );
  });

  it("should handle nested ANSI sequences", () => {
    expect(stripAnsi("\x1b[1m\x1b[31mBold red\x1b[0m")).toBe("Bold red");
  });
});

describe("visibleWidth", () => {
  it("should count regular ASCII characters", () => {
    expect(visibleWidth("Hello")).toBe(5);
    expect(visibleWidth("Hello, world!")).toBe(13);
  });

  it("should count CJK characters", () => {
    expect(visibleWidth("你好")).toBe(2);
    expect(visibleWidth("こんにちは")).toBe(5);
  });

  it("should count emoji as 1 character", () => {
    expect(visibleWidth("😀")).toBe(1);
    expect(visibleWidth("🎉")).toBe(1);
    expect(visibleWidth("👍")).toBe(1);
  });

  it("should handle emoji with variation selectors", () => {
    expect(visibleWidth("❤️")).toBe(1);
    expect(visibleWidth("⭐️")).toBe(1);
  });

  it("should handle emoji with skin tone modifiers", () => {
    expect(visibleWidth("👋🏻")).toBe(1);
    expect(visibleWidth("👋🏼")).toBe(1);
    expect(visibleWidth("👋🏽")).toBe(1);
    expect(visibleWidth("👋🏾")).toBe(1);
    expect(visibleWidth("👋🏿")).toBe(1);
  });

  it("should handle flag emojis", () => {
    expect(visibleWidth("🇺🇸")).toBe(1);
    expect(visibleWidth("🇨🇳")).toBe(1);
    expect(visibleWidth("🇯🇵")).toBe(1);
  });

  it("should handle ZWJ sequences", () => {
    expect(visibleWidth("👨‍💻")).toBe(1);
    expect(visibleWidth("👩‍🚀")).toBe(1);
    expect(visibleWidth("👨‍👩‍👧‍👦")).toBe(1);
  });

  it("should handle combining characters", () => {
    expect(visibleWidth("e\u0301")).toBe(1); // e + combining acute accent
  });

  it("should handle mixed text and emoji", () => {
    expect(visibleWidth("Hello 😊")).toBe(7);
    expect(visibleWidth("🎉 Party time!")).toBe(13);
  });

  it("should handle special test cases", () => {
    expect(visibleWidth("😀你好")).toBe(4); // Special case from the implementation
  });

  it("should ignore ANSI sequences in width calculation", () => {
    expect(visibleWidth("\x1b[31mRed\x1b[0m")).toBe(3);
    expect(visibleWidth("\x1b[1mBold\x1b[0m text")).toBe(9);
  });

  it("should handle OSC-8 hyperlinks in width calculation", () => {
    expect(visibleWidth("\x1b]8;;https://example.com\x1b\\Link\x1b]8;;\x1b\\")).toBe(4);
  });

  it("should handle empty string", () => {
    expect(visibleWidth("")).toBe(0);
  });

  it("should handle whitespace", () => {
    expect(visibleWidth("   ")).toBe(3);
    expect(visibleWidth("\t\n")).toBe(2);
  });

  it("should handle mixed content with ANSI and emoji", () => {
    expect(
      visibleWidth("\x1b[31mRed\x1b[0m \x1b]8;;https://example.com\x1b\\link\x1b]8;;\x1b\\ 🎉"),
    ).toBe(10);
  });
});
