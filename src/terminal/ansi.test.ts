import { describe, expect, it } from "vitest";
import { stripAnsi, visibleWidth } from "./ansi.js";

describe("stripAnsi", () => {
  it("removes ANSI SGR codes", () => {
    const input = "\x1b[31mRed text\x1b[0m";
    const expected = "Red text";
    expect(stripAnsi(input)).toBe(expected);
  });

  it("removes multiple ANSI SGR codes", () => {
    const input = "\x1b[1;31mBold red text\x1b[0m";
    const expected = "Bold red text";
    expect(stripAnsi(input)).toBe(expected);
  });

  it("removes OSC-8 hyperlinks", () => {
    const input = "\x1b]8;;https://example.com\x1b\\Click here\x1b]8;;\x1b\\";
    const expected = "Click here";
    expect(stripAnsi(input)).toBe(expected);
  });

  it("removes both ANSI SGR and OSC-8 codes", () => {
    const input = "\x1b[31m\x1b]8;;https://example.com\x1b\\Red link\x1b[0m\x1b]8;;\x1b\\";
    const expected = "Red link";
    expect(stripAnsi(input)).toBe(expected);
  });

  it("handles empty string", () => {
    expect(stripAnsi("")).toBe("");
  });

  it("handles string without ANSI codes", () => {
    const input = "Plain text";
    expect(stripAnsi(input)).toBe(input);
  });

  it("handles complex ANSI sequences", () => {
    const input = "\x1b[38;2;255;0;0mRGB red\x1b[0m";
    const expected = "RGB red";
    expect(stripAnsi(input)).toBe(expected);
  });

  it("handles mixed content", () => {
    const input =
      "Normal \x1b[32mgreen\x1b[0m and \x1b]8;;https://test.com\x1b\\link\x1b]8;;\x1b\\ text";
    const expected = "Normal green and link text";
    expect(stripAnsi(input)).toBe(expected);
  });
});

describe("visibleWidth", () => {
  it("returns length of plain text", () => {
    const input = "Hello world";
    expect(visibleWidth(input)).toBe(11);
  });

  it("ignores ANSI codes in width calculation", () => {
    const input = "\x1b[31mRed\x1b[0m text";
    expect(visibleWidth(input)).toBe(8); // "Red text"
  });

  it("ignores OSC-8 hyperlinks in width calculation", () => {
    const input = "\x1b]8;;https://example.com\x1b\\Link\x1b]8;;\x1b\\";
    expect(visibleWidth(input)).toBe(4); // "Link"
  });

  it("handles Unicode characters correctly", () => {
    const input = "😀🎉"; // 2 emoji, each counted as 1 visible character
    expect(visibleWidth(input)).toBe(2);
  });

  it("handles CJK characters", () => {
    const input = "你好世界"; // 4 Chinese characters
    expect(visibleWidth(input)).toBe(4);
  });

  it("handles mixed ANSI and Unicode", () => {
    const input = "\x1b[31m😀\x1b[0m\x1b]8;;https://example.com\x1b\\你\x1b]8;;\x1b\\好";
    expect(visibleWidth(input)).toBe(4); // "😀你好"
  });

  it("handles zero-width joiner sequences", () => {
    const input = "👨‍👩‍👧‍👦"; // Family emoji (multiple code points, 1 visible)
    expect(visibleWidth(input)).toBe(1);
  });

  it("handles combining characters", () => {
    const input = "e\u0301"; // e + combining acute accent
    expect(visibleWidth(input)).toBe(1);
  });

  it("handles empty string", () => {
    expect(visibleWidth("")).toBe(0);
  });

  it("handles string with only ANSI codes", () => {
    const input = "\x1b[31m\x1b[0m";
    expect(visibleWidth(input)).toBe(0);
  });
});
