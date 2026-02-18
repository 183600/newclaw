import { describe, expect, it } from "vitest";
import { stripReasoningTagsFromText } from "./reasoning-tags.js";

describe("stripReasoningTagsFromText - additional edge cases", () => {
  describe("complex HTML entity handling", () => {
    it("should handle mixed HTML entities and special characters", () => {
      const text = "&#x110;thinking content thinking&#x111; and Đmore thinkingđ";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe(" and ");
    });

    it("should handle nested HTML entities", () => {
      const text = "&#x110;thinking &#x110;nested thinking&#x111; thinking&#x111;";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("");
    });

    it("should handle malformed HTML entities", () => {
      const text = "&#x110;thinking content&#x111; and &#x110;thinking";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe(" and ");
    });
  });

  describe("code block preservation", () => {
    it("should preserve reasoning tags within fenced code blocks", () => {
      const text = `
Before
\`\`\`
This should be preserved thinking
Even Đthisđ should be preserved
\`\`\`
After thinking`;
      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("This should be preserved thinking");
      expect(result).toContain("Even Đthisđ should be preserved");
      expect(result).not.toContain("After thinking");
    });

    it("should preserve reasoning tags within inline code", () => {
      const text = "Before `code with thinking` after thinking";
      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("code with thinking");
      expect(result).not.toContain("after thinking");
    });

    it("should handle multiple code blocks with reasoning tags", () => {
      const text = `
\`\`\`javascript
// thinking in code
function test() { return Đthinkingđ; }
\`\`\`
Middle thinking
\`\`\`python
# more thinking in code
def func(): pass
\`\`\`
End thinking`;
      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("// thinking in code");
      expect(result).toContain("function test() { return Đthinkingđ; }");
      expect(result).toContain("# more thinking in code");
      expect(result).not.toContain("Middle thinking");
      expect(result).not.toContain("End thinking");
    });

    it("should handle tilde-fenced code blocks", () => {
      const text = `
~~~
thinking in tilde block
~~~
After thinking`;
      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("thinking in tilde block");
      expect(result).not.toContain("After thinking");
    });
  });

  describe("overlapping and nested patterns", () => {
    it("should handle overlapping special character patterns", () => {
      const text = "Đthinkingthinkingđ content";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe(" content");
    });

    it("should handle deeply nested patterns", () => {
      const text = "&#x110;thinking Đthinking nested thinking&#x111; thinking&#x111;";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("");
    });

    it("should handle mixed HTML and special character tags", () => {
      const text = "<thinking>Đnested thinkingđ</thinking> outside";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe(" outside");
    });
  });

  describe("word pattern edge cases", () => {
    it("should handle various word prefixes", () => {
      const text = "Zero thinking One thinking Two thinking Three thinking Four thinking";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Zero   One   Two   Three   Four ");
    });

    it("should handle word patterns with punctuation", () => {
      const text = "First thinking. Second thought! Third antthinking?";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("First . Second ! Third ?");
    });

    it("should handle word patterns at different positions", () => {
      const text = "Start This is thinking middle First thought end Second antthinking";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Start  middle  end ");
    });
  });

  describe("trim mode behavior", () => {
    it("should handle 'none' trim mode correctly", () => {
      const text = "  Before thinking  after  ";
      const result = stripReasoningTagsFromText(text, { trim: "none" });
      expect(result).toBe("  Before   after  ");
    });

    it("should handle 'start' trim mode correctly", () => {
      const text = "  Before thinking  after  ";
      const result = stripReasoningTagsFromText(text, { trim: "start" });
      expect(result).toBe("Before   after  ");
    });

    it("should handle 'both' trim mode with punctuation", () => {
      const text = "Before thinking after";
      const result = stripReasoningTagsFromText(text, { trim: "both" });
      expect(result).toBe("Before  after.");
    });

    it("should preserve existing punctuation in 'both' mode", () => {
      const text = "Before thinking after!";
      const result = stripReasoningTagsFromText(text, { trim: "both" });
      expect(result).toBe("Before  after!");
    });
  });

  describe("mode-specific behavior", () => {
    it("should handle 'strict' mode with unclosed HTML tags", () => {
      const text = "Before <thinking content after";
      const result = stripReasoningTagsFromText(text, { mode: "strict" });
      expect(result).toBe("Before ");
    });

    it("should handle 'preserve' mode with unclosed special tags", () => {
      const text = "Before Đthinking content after";
      const result = stripReasoningTagsFromText(text, { mode: "preserve" });
      expect(result).toBe(" content after");
    });

    it("should handle multiple unclosed patterns in 'preserve' mode", () => {
      const text = "First Đthinking content <thinking more content";
      const result = stripReasoningTagsFromText(text, { mode: "preserve" });
      expect(result).toBe(" content  more content");
    });
  });

  describe("special character handling", () => {
    it("should handle zero-width characters", () => {
      const text = "Before\u200Bthinking\u200Bafter";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before\u200B\u200Bafter");
    });

    it("should handle Hebrew characters", () => {
      const text = "Before thinkingאחרי";
      const result = stripReasoningTagsFromText(text, { trim: "both" });
      expect(result).toBe("Before אחרי");
    });

    it("should handle HTML entities", () => {
      const text = "Before thinking&#x123;after";
      const result = stripReasoningTagsFromText(text, { trim: "both" });
      expect(result).toBe("Before &#x123;after");
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle empty input", () => {
      const result = stripReasoningTagsFromText("");
      expect(result).toBe("");
    });

    it("should handle null input", () => {
      const result = stripReasoningTagsFromText(null as unknown);
      expect(result).toBe(null);
    });

    it("should handle undefined input", () => {
      const result = stripReasoningTagsFromText(undefined as unknown);
      expect(result).toBe(undefined);
    });

    it("should handle only reasoning tags", () => {
      const text = "thinking";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("");
    });

    it("should handle only special character tags", () => {
      const text = "Đthinkingđ";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("");
    });

    it("should handle malformed tags", () => {
      const text = "Before <thinking after</thinking>";
      const result = stripReasoningTagsFromText(text);
      expect(result).toBe("Before ");
    });
  });

  describe("complex real-world scenarios", () => {
    it("should handle mixed content with multiple patterns", () => {
      const text = `
Start of message
This is thinking that should be removed.

\`\`\`code block
This thinking should be preserved
function test() { return Đthinkingđ; }
\`\`\`

Middle content with <thinking>HTML tags</thinking> to remove.

End with First thought and Second antthinking.
`;
      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("Start of message");
      expect(result).toContain("This thinking should be preserved");
      expect(result).toContain("function test() { return Đthinkingđ; }");
      expect(result).toContain("Middle content with  to remove.");
      expect(result).toContain("End with  and .");
    });

    it("should handle complex nested patterns with code blocks", () => {
      const text = `
Before
\`\`\`
<thinking>HTML in code</thinking>
Đthinking special in codeđ
\`\`\`
After <thinking>HTML outside</thinking> end.
`;
      const result = stripReasoningTagsFromText(text);
      expect(result).toContain("<thinking>HTML in code</thinking>");
      expect(result).toContain("Đthinking special in codeđ");
      expect(result).toContain("Before");
      expect(result).toContain("After  end.");
    });
  });
});
