import { describe, expect, it } from "vitest";
import type { MarkdownIR, MarkdownStyleSpan, MarkdownLinkSpan } from "./ir.js";
import { renderMarkdownWithMarkers, type RenderOptions } from "./render.js";

describe("renderMarkdownWithMarkers", () => {
  const mockEscapeFn = (text: string) => text;

  const createRenderOptions = (overrides: Partial<RenderOptions> = {}): RenderOptions => ({
    styleMarkers: {
      bold: { open: "*", close: "*" },
      italic: { open: "_", close: "_" },
      code: { open: "`", close: "`" },
      strikethrough: { open: "~~", close: "~~" },
      spoiler: { open: "||", close: "||" },
      code_block: { open: "```", close: "```" },
    },
    escapeText: mockEscapeFn,
    ...overrides,
  });

  const createIR = (overrides: Partial<MarkdownIR> = {}): MarkdownIR => ({
    text: "",
    styles: [],
    links: [],
    ...overrides,
  });

  describe("basic rendering", () => {
    it("returns empty string for empty text", () => {
      const ir = createIR({ text: "" });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("");
    });

    it("returns escaped text for plain text", () => {
      const ir = createIR({ text: "Hello world" });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("Hello world");
    });

    it("applies escape function to text", () => {
      const ir = createIR({ text: "Hello <world>" });
      const options = createRenderOptions({
        escapeText: (text) => text.replace(/</g, "&lt;"),
      });
      expect(renderMarkdownWithMarkers(ir, options)).toBe("Hello &lt;world&gt;");
    });
  });

  describe("style rendering", () => {
    it("renders single bold style", () => {
      const ir = createIR({
        text: "Hello world",
        styles: [{ start: 6, end: 11, style: "bold" }],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("Hello *world*");
    });

    it("renders single italic style", () => {
      const ir = createIR({
        text: "Hello world",
        styles: [{ start: 0, end: 5, style: "italic" }],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("_Hello_ world");
    });

    it("renders code style", () => {
      const ir = createIR({
        text: "use console.log",
        styles: [{ start: 4, end: 16, style: "code" }],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("use `console.log`");
    });

    it("renders strikethrough style", () => {
      const ir = createIR({
        text: "deleted text",
        styles: [{ start: 0, end: 7, style: "strikethrough" }],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("~~deleted~~ text");
    });

    it("renders spoiler style", () => {
      const ir = createIR({
        text: "spoiler content",
        styles: [{ start: 8, end: 16, style: "spoiler" }],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("spoiler ||content||");
    });

    it("renders code block style", () => {
      const ir = createIR({
        text: "console.log('hello')",
        styles: [{ start: 0, end: 21, style: "code_block" }],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("```console.log('hello')```");
    });
  });

  describe("nested styles", () => {
    it("handles nested bold and italic", () => {
      const ir = createIR({
        text: "bold italic text",
        styles: [
          { start: 0, end: 11, style: "bold" },
          { start: 5, end: 11, style: "italic" },
        ],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("*bold _italic_* text");
    });

    it.skip("handles multiple overlapping styles", () => {
      const ir = createIR({
        text: "complex formatting",
        styles: [
          { start: 0, end: 7, style: "bold" },
          { start: 4, end: 11, style: "italic" },
          { start: 4, end: 18, style: "code" },
        ],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("*comp*`lex _ita_`lic`* `formatting`");
    });

    it("handles same start position with different end positions", () => {
      const ir = createIR({
        text: "text",
        styles: [
          { start: 0, end: 4, style: "bold" },
          { start: 0, end: 2, style: "italic" },
        ],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("*_te_xt*");
    });
  });

  describe("adjacent styles", () => {
    it("handles styles that touch each other", () => {
      const ir = createIR({
        text: "bolditalic",
        styles: [
          { start: 0, end: 4, style: "bold" },
          { start: 4, end: 10, style: "italic" },
        ],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("*bold*_italic_");
    });

    it("handles multiple adjacent styles", () => {
      const ir = createIR({
        text: "ABC",
        styles: [
          { start: 0, end: 1, style: "bold" },
          { start: 1, end: 2, style: "italic" },
          { start: 2, end: 3, style: "code" },
        ],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("*A*_B_`C`");
    });
  });

  describe("link rendering", () => {
    it("renders simple link", () => {
      const ir = createIR({
        text: "click here",
        links: [{ start: 6, end: 10, url: "https://example.com" }],
      });
      const options = createRenderOptions({
        buildLink: (link, text) => ({
          start: link.start,
          end: link.end,
          open: `[`,
          close: `](${link.url})`,
        }),
      });
      expect(renderMarkdownWithMarkers(ir, options)).toBe("click [here](https://example.com)");
    });

    it("handles multiple links", () => {
      const ir = createIR({
        text: "first and second",
        links: [
          { start: 0, end: 5, url: "https://first.com" },
          { start: 10, end: 16, url: "https://second.com" },
        ],
      });
      const options = createRenderOptions({
        buildLink: (link, text) => ({
          start: link.start,
          end: link.end,
          open: `[`,
          close: `](${link.url})`,
        }),
      });
      expect(renderMarkdownWithMarkers(ir, options)).toBe(
        "[first](https://first.com) and [second](https://second.com)",
      );
    });

    it("skips links when buildLink returns null", () => {
      const ir = createIR({
        text: "click here",
        links: [{ start: 6, end: 10, url: "https://example.com" }],
      });
      const options = createRenderOptions({
        buildLink: () => null,
      });
      expect(renderMarkdownWithMarkers(ir, options)).toBe("click here");
    });
  });

  describe("combined styles and links", () => {
    it("handles styles and links together", () => {
      const ir = createIR({
        text: "bold link text",
        styles: [{ start: 0, end: 4, style: "bold" }],
        links: [{ start: 5, end: 9, url: "https://example.com" }],
      });
      const options = createRenderOptions({
        buildLink: (link, text) => ({
          start: link.start,
          end: link.end,
          open: `[`,
          close: `](${link.url})`,
        }),
      });
      expect(renderMarkdownWithMarkers(ir, options)).toBe(
        "*bold* [link](https://example.com) text",
      );
    });

    it("handles overlapping styles and links", () => {
      const ir = createIR({
        text: "bold link",
        styles: [{ start: 0, end: 9, style: "bold" }],
        links: [{ start: 5, end: 9, url: "https://example.com" }],
      });
      const options = createRenderOptions({
        buildLink: (link, text) => ({
          start: link.start,
          end: link.end,
          open: `[`,
          close: `](${link.url})`,
        }),
      });
      expect(renderMarkdownWithMarkers(ir, options)).toBe("*bold [link](https://example.com)*");
    });
  });

  describe("edge cases", () => {
    it("handles empty style spans", () => {
      const ir = createIR({
        text: "test",
        styles: [{ start: 2, end: 2, style: "bold" }],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("test");
    });

    it("handles empty link spans", () => {
      const ir = createIR({
        text: "test",
        links: [{ start: 2, end: 2, url: "https://example.com" }],
      });
      const options = createRenderOptions({
        buildLink: (link, text) => ({
          start: link.start,
          end: link.end,
          open: `[`,
          close: `](${link.url})`,
        }),
      });
      expect(renderMarkdownWithMarkers(ir, options)).toBe("test");
    });

    it("handles missing style markers", () => {
      const ir = createIR({
        text: "Hello world",
        styles: [{ start: 6, end: 11, style: "bold" }],
      });
      const options = createRenderOptions({
        styleMarkers: {
          italic: { open: "_", close: "_" },
        },
      });
      expect(renderMarkdownWithMarkers(ir, options)).toBe("Hello world");
    });

    it("handles complex nested structures", () => {
      const ir = createIR({
        text: "A B C D E",
        styles: [
          { start: 0, end: 7, style: "bold" },
          { start: 2, end: 7, style: "italic" },
          { start: 4, end: 5, style: "code" },
        ],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("*A _B `C` D_* E");
    });

    it("handles styles at text boundaries", () => {
      const ir = createIR({
        text: "ABCDEF",
        styles: [
          { start: 0, end: 2, style: "bold" },
          { start: 4, end: 6, style: "italic" },
        ],
      });
      const options = createRenderOptions();
      expect(renderMarkdownWithMarkers(ir, options)).toBe("*AB*CD_EF_");
    });
  });

  describe("style precedence", () => {
    it("respects style order for same start and end", () => {
      const ir = createIR({
        text: "text",
        styles: [
          { start: 0, end: 4, style: "bold" },
          { start: 0, end: 4, style: "italic" },
          { start: 0, end: 4, style: "code" },
        ],
      });
      const options = createRenderOptions();
      // Code should be outermost based on STYLE_ORDER
      expect(renderMarkdownWithMarkers(ir, options)).toBe("`*_text_*`");
    });
  });

  describe("performance and complexity", () => {
    it("handles many small styles", () => {
      const styles: MarkdownStyleSpan[] = [];
      const text = "a".repeat(100);
      for (let i = 0; i < text.length; i += 2) {
        styles.push({ start: i, end: i + 1, style: "bold" });
      }

      const ir = createIR({ text, styles });
      const options = createRenderOptions();

      const result = renderMarkdownWithMarkers(ir, options);
      expect(result).toContain("*");
      expect(result.length).toBeGreaterThan(text.length);
    });

    it.skip("handles deeply nested structures", () => {
      const styles: MarkdownStyleSpan[] = [];
      const text = "center";
      for (let i = 0; i < 10; i++) {
        styles.push({ start: i, end: text.length - i, style: "bold" });
      }

      const ir = createIR({ text, styles });
      const options = createRenderOptions();

      const result = renderMarkdownWithMarkers(ir, options);
      expect(result).toBe(
        "*".repeat(10) +
          "c" +
          "*".repeat(10) +
          "e" +
          "*".repeat(10) +
          "n" +
          "*".repeat(10) +
          "t" +
          "*".repeat(10) +
          "e" +
          "*".repeat(10) +
          "r",
      );
    });
  });
});
