import { describe, expect, it } from "vitest";
import { stripReasoningTagsFromText } from "./reasoning-tags.js";

describe("stripReasoningTagsFromText", () => {
  it("should return text unchanged when no reasoning tags are present", () => {
    const text = "This is regular text without any reasoning tags.";
    const result = stripReasoningTagsFromText(text);
    expect(result).toBe(text);
  });

  it("should remove simple thinking tags", () => {
    const text = "Before This is thinking</think> after.";
    const result = stripReasoningTagsFromText(text);
    expect(result).toBe("Before  after.");
  });

  it("should handle multiple thinking blocks", () => {
    const text = "Start First thought</think> middle Second thought</think> end.";
    const result = stripReasoningTagsFromText(text);
    expect(result).toBe("Start  middle  end.");
  });

  it("should preserve content within code blocks", () => {
    const text = `
\`\`\`javascript
function test() {
  // This should be preserved</think>
  return true;
}
\`\`\`
Outside This should be removed</think> code block.`;

    const result = stripReasoningTagsFromText(text);
    expect(result).toContain("This should be preserved</think>");
    expect(result).not.toContain("This should be removed</think>");
  });

  it("should handle inline code preservation", () => {
    const text = "Text with \`inline code\` and outside thinking.";
    const result = stripReasoningTagsFromText(text);
    expect(result).toContain("inline code");
    expect(result).not.toContain("thinking");
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
    const text = "  Before thinking after  ";

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
});
