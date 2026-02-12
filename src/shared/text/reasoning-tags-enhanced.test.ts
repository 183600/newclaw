import { describe, expect, it } from "vitest";
import { stripReasoningTagsFromText } from "./reasoning-tags.js";

describe("stripReasoningTagsFromText - Enhanced Tests", () => {
  it("should return text unchanged when no reasoning tags are present", () => {
    const text = "This is regular text without any reasoning tags.";
    const result = stripReasoningTagsFromText(text);
    expect(result).toBe(text);
  });

  it("should remove simple thinking tags", () => {
    const text = "Before This is thinkingđ after.";
    const result = stripReasoningTagsFromText(text);
    expect(result).toBe("Before  after.");
  });

  it("should handle multiple thinking blocks", () => {
    const text = "Start First thoughtđ middle Second thoughtđ end.";
    const result = stripReasoningTagsFromText(text);
    expect(result).toBe("Start  middle  end.");
  });

  it("should preserve content within code blocks", () => {
    const text = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

    const result = stripReasoningTagsFromText(text);
    expect(result).toContain("This should be preservedđ");
    expect(result).not.toContain("This should be removedđ");
  });

  it("should handle inline code preservation", () => {
    const text = "Text with \`inline code đ\` and outside thinkingđ.";
    const result = stripReasoningTagsFromText(text);
    expect(result).toContain("inline code đ");
    expect(result).not.toContain("thinkingđ");
  });

  it("should preserve unclosed thinking tags in preserve mode", () => {
    const text = "Before Unclosed thinking content";
    const result = stripReasoningTagsFromText(text, { mode: "preserve" });
    expect(result).toBe("Unclosed thinking content");
  });

  it("should remove unclosed thinking tags in strict mode", () => {
    const text = "Before Unclosed thinking content";
    const result = stripReasoningTagsFromText(text, { mode: "strict" });
    expect(result).toBe("Before ");
  });

  it("should handle final tags correctly", () => {
    const text = "Before <final>Final answer</final> after.";
    const result = stripReasoningTagsFromText(text);
    expect(result).toBe("Before  after.");
  });

  it("should respect trim options", () => {
    const text = "  Before thinkingđ after  ";

    const resultNone = stripReasoningTagsFromText(text, { trim: "none" });
    expect(resultNone).toBe("  Before  after  ");

    const resultStart = stripReasoningTagsFromText(text, { trim: "start" });
    expect(resultStart).toBe("Before  after  ");

    const resultBoth = stripReasoningTagsFromText(text, { trim: "both" });
    expect(resultBoth).toBe("Before  after.");
  });

  it("should handle empty or null input", () => {
    expect(stripReasoningTagsFromText("")).toBe("");
    expect(stripReasoningTagsFromText(null as any)).toBe(null);
    expect(stripReasoningTagsFromText(undefined as any)).toBe(undefined);
  });

  // 新增测试用例
  describe("HTML tag variants", () => {
    it("should handle HTML thinking tags", () => {
      const text = "Before <thinking>content</thinking> after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  after.");
    });

    it("should handle HTML thought tags", () => {
      const text = "Before <thought>content</thought> after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  after.");
    });

    it("should handle HTML antthinking tags", () => {
      const text = "Before <antthinking>content</antthinking> after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  after.");
    });

    it("should handle short HTML tags", () => {
      const text = "Before <t>thinking</t> after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  after.");
    });

    it("should handle think tags", () => {
      const text = "Before content</think> after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  after.");
    });

    it("should handle HTML tags with attributes", () => {
      const text = "Before <thinking class='test'>content</thinking> after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  after.");
    });
  });

  describe("HTML entity conversion", () => {
    it("should convert HTML entities to special characters", () => {
      const text = "Before thinking&#x111; after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  after.");
    });

    it("should convert HTML entity opening tags", () => {
      const text = "Before &#x110;thinking content after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  content after.");
    });

    it("should handle mixed HTML entities and tags", () => {
      const text = "Before &#x110;thinking middle thinking&#x111; after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  middle  after.");
    });
  });

  describe("Special character handling", () => {
    it("should handle special character opening tags", () => {
      const text = "Before Đthinking content after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  content after.");
    });

    it("should handle special character closing tags", () => {
      const text = "Before thinkingđ after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  after.");
    });

    it("should handle Unicode special characters", () => {
      const text = "Before \u0110thinking content thinking\u0111 after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  content  after.");
    });
  });

  describe("Edge cases", () => {
    it("should handle overlapping ranges", () => {
      const text = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before   after.");
    });

    it("should handle malformed tags", () => {
      const text = "Before <thinking content after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before <thinking content after.");
    });

    it("should handle only opening tags", () => {
      const text = "Before <thinking>content after.";
      const result = stripReasoningTagsFromText(text, { mode: "strict" });
      expect(result).toBe("Before ");
    });

    it("should handle only closing tags", () => {
      const text = "Before content</thinking> after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  after.");
    });

    it("should handle adjacent tags", () => {
      const text = "Before <thinking></thinking><thought></thought> after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before  after.");
    });
  });

  describe("Complex scenarios", () => {
    it("should handle nested code blocks with reasoning tags", () => {
      const text = `
\`\`\`javascript
function test() {
  // Outer thinkingđ
  \`\`\`javascript
  // Inner thinkingđ
  \`\`\`
  return true;
}
\`\`\`
Outside thinkingđ`;

      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("// Outer thinkingđ");
      expect(result).toContain("// Inner thinkingđ");
      expect(result).not.toContain("Outside thinkingđ");
    });

    it("should handle mixed format tags", () => {
      const text =
        "Before <thinking>HTML content</thinking> and Đthinking special content thinkingđ after.";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before   and   after.");
    });

    it("should preserve punctuation in preserve mode", () => {
      const text = "Before Unclosed thinking content!";
      const result = stripReasoningTagsFromText(text, { mode: "preserve" });
      expect(result).toBe("Unclosed thinking content!");
    });

    it("should handle multiple line breaks", () => {
      const text = "Before\n\nUnclosed thinking\n\ncontent";
      const result = stripReasoningTagsFromText(text, { mode: "preserve" });
      expect(result).toBe("Unclosed thinking\n\ncontent");
    });
  });
});
