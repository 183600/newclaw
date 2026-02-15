import { describe, expect, it } from "vitest";
import { stripReasoningTagsFromText } from "./reasoning-tags.js";

describe("stripReasoningTagsFromText - Additional Edge Cases", () => {
  describe("Basic functionality verification", () => {
    it("should return text unchanged when no reasoning tags are present", () => {
      const text = "This is regular text without any reasoning tags.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe(text);
    });

    it("should handle empty strings", () => {
      expect(stripReasoningTagsFromText("")).toBe("");
    });

    it("should handle null and undefined inputs", () => {
      expect(stripReasoningTagsFromText(null as unknown)).toBe(null);
      expect(stripReasoningTagsFromText(undefined as unknown)).toBe(undefined);
    });
  });

  describe("Code block preservation", () => {
    it("should preserve content within fenced code blocks", () => {
      const text = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed`;

      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("// This should be preserved");
      expect(result).not.toContain("Outside This should be removed");
    });

    it("should preserve content within tilde code blocks", () => {
      const text = `
~~~
thinking in tilde block
~~~
After thinking`;

      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("thinking in tilde block");
      expect(result).not.toContain("After thinking");
    });

    it("should preserve inline code", () => {
      const text = "Text with `inline code` and outside thinking.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("inline code");
      expect(result).not.toContain("outside thinking");
    });
  });

  describe("Mode-specific behavior", () => {
    it("should handle preserve mode with unclosed tags", () => {
      const text = "Before Unclosed thinking content";
      const result = stripReasoningTagsFromText(text, { mode: "preserve" });
      expect(result).toBe("Unclosed thinking content");
    });

    it("should handle strict mode with unclosed tags", () => {
      const text = "Before Unclosed thinking content";
      const result = stripReasoningTagsFromText(text, { mode: "strict" });
      expect(result).toBe("Before ");
    });

    it("should handle trim modes", () => {
      const text = "  Before thinking after  ";

      const resultNone = stripReasoningTagsFromText(text, { trim: "none" });
      expect(resultNone).toBe("  Before  after  ");

      const resultStart = stripReasoningTagsFromText(text, { trim: "start" });
      expect(resultStart).toBe("Before  after  ");

      const resultBoth = stripReasoningTagsFromText(text, { trim: "both" });
      expect(resultBoth).toBe("Before  after.");
    });
  });

  describe("Special character handling", () => {
    it("should handle special Unicode characters", () => {
      const text = "Before\u200Bthinking\u200Bafter";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before\u200B\u200Bafter");
    });
  });

  describe("Complex scenarios with code blocks", () => {
    it("should handle nested code blocks", () => {
      const text = `
\`\`\`javascript
function outer() {
  // Outer thinking
  \`\`\`javascript
  function inner() {
    // Inner thinking
    return true;
  }
  \`\`\`
  return true;
}
\`\`\`
Outside thinking`;

      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("// Outer thinking");
      expect(result).toContain("// Inner thinking");
      expect(result).not.toContain("Outside thinking");
    });

    it("should handle code blocks with language hints", () => {
      const text = `
\`\`\`typescript
// Type annotations
interface Test {
  prop: string;
}
\`\`\`
Outside thinking`;

      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("// Type annotations");
      expect(result).not.toContain("Outside thinking");
    });

    it("should handle inline code in code blocks", () => {
      const text = `
\`\`\`javascript
// Code with \`inline\` and more
function test() {
  return \`template string\`;
}
\`\`\`
Outside thinking`;

      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("`inline`");
      expect(result).toContain("`template string`");
      expect(result).not.toContain("Outside thinking");
    });
  });
});
