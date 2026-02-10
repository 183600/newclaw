import { describe, expect, it } from "vitest";
import { stripReasoningTagsFromText } from "./reasoning-tags.js";

describe("stripReasoningTagsFromText", () => {
  it("returns empty string for empty input", () => {
    expect(stripReasoningTagsFromText("")).toBe("");
  });

  it("returns original text when no reasoning tags are present", () => {
    const text = "This is a normal message without any reasoning tags.";
    expect(stripReasoningTagsFromText(text)).toBe(text);
  });

  it("strips thinking tags in strict mode", () => {
    const text = "<thinking>This is thinking content</thinking>This is the actual response.";
    const expected = "This is the actual response.";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("strips think tags in strict mode", () => {
    const text = "This is think content</think>This is the actual response.";
    const expected = "This is the actual response.";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("strips thought tags in strict mode", () => {
    const text = "<thought>This is thought content</thought>This is the actual response.";
    const expected = "This is the actual response.";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("strips antthinking tags in strict mode", () => {
    const text =
      "<antthinking>This is antthinking content</antthinking>This is the actual response.";
    const expected = "This is the actual response.";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("strips final tags", () => {
    const text =
      "<thinking>Thinking content</thinking>Response content<final>Final content</final>";
    const expected = "Response content";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("preserves thinking tags in preserve mode", () => {
    const text = "<thinking>This is thinking content</thinking>This is the actual response.";
    const expected = "This is the actual response.";
    expect(stripReasoningTagsFromText(text, { mode: "preserve" })).toBe(expected);
  });

  it("preserves unclosed thinking tags in preserve mode", () => {
    const text = "<thinking>This is unclosed thinking content";
    const expected = "<thinking>This is unclosed thinking content";
    expect(stripReasoningTagsFromText(text, { mode: "preserve" })).toBe(expected);
  });

  it("strips unclosed thinking tags in strict mode", () => {
    const text = "<thinking>This is unclosed thinking content";
    const expected = "";
    expect(stripReasoningTagsFromText(text, { mode: "strict" })).toBe(expected);
  });

  it("handles case insensitive tags", () => {
    const text = "<THINKING>This is uppercase thinking</THINKING>Response content";
    const expected = "Response content";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("handles mixed case tags", () => {
    const text = "<Thinking>This is mixed case thinking</Thinking>Response content";
    const expected = "Response content";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("preserves content within fenced code blocks", () => {
    const text = "```python\n<thinking>This should not be removed</thinking>\n```Actual response";
    const expected =
      "```python\n<thinking>This should not be removed</thinking>\n```Actual response";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("preserves content within tilda fenced code blocks", () => {
    const text =
      "~~~javascript\n<thinking>This should not be removed</thinking>\n~~~Actual response";
    const expected =
      "~~~javascript\n<thinking>This should not be removed</thinking>\n~~~Actual response";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("preserves content within inline code", () => {
    const text = "`<thinking>This should not be removed</thinking>` Actual response";
    const expected = "`<thinking>This should not be removed</thinking>` Actual response";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("preserves code blocks but strips tags outside them", () => {
    const text =
      "<thinking>Thinking</thinking>```python\n<thinking>Code thinking</thinking>\n```Response";
    const expected = "```python\n<thinking>Code thinking</thinking>\n```Response";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("handles nested code blocks correctly", () => {
    const text =
      "```python\n```nested\n<thinking>This should be preserved</thinking>\n```\n```Response";
    const expected =
      "```python\n```nested\n<thinking>This should be preserved</thinking>\n```\n```Response";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("trims whitespace by default", () => {
    const text = "  <thinking>Thinking</thinking>  Response content  ";
    const expected = "Response content";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("trims start only when specified", () => {
    const text = "  <thinking>Thinking</thinking>  Response content  ";
    const expected = "Response content  ";
    expect(stripReasoningTagsFromText(text, { trim: "start" })).toBe(expected);
  });

  it("does not trim when specified", () => {
    const text = "  <thinking>Thinking</thinking>  Response content  ";
    const expected = "  Response content  ";
    expect(stripReasoningTagsFromText(text, { trim: "none" })).toBe(expected);
  });

  it("handles multiple thinking blocks", () => {
    const text =
      "<thinking>First thinking</thinking>Response 1<thinking>Second thinking</thinking>Response 2";
    const expected = "Response 1Response 2";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("handles tags with attributes", () => {
    const text = '<thinking class="test">Thinking with attributes</thinking>Response';
    const expected = "Response";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("handles malformed tags gracefully", () => {
    const text = "<thinking>Unclosed tag<thinking>Another tag</thinking>Response";
    const expected = "Response";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("handles text with only final tags", () => {
    const text = "Response content<final>Final content</final>";
    const expected = "Response content";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("handles final tags with attributes", () => {
    const text = 'Response content<final class="end">Final content</final>';
    const expected = "Response content";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("preserves final tags within code blocks", () => {
    const text = "```python\n<final>This should be preserved</final>\n```Response";
    const expected = "```python\n<final>This should be preserved</final>\n```Response";
    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });

  it("handles complex scenario with multiple tag types and code blocks", () => {
    const text = `<thinking>Initial thinking</thinking>
Intro text
\`\`\`python
<thinking>Code thinking</thinking>
code()
<final>Code final</final>
\`\`\`
<thinking>More thinking</thinking>
Middle text
\`<thinking>Inline code thinking</thinking>\`
End text
<final>Final section</final>`;

    const expected = `Intro text
\`\`\`python
<thinking>Code thinking</thinking>
code()
<final>Code final</final>
\`\`\`
Middle text
\`<thinking>Inline code thinking</thinking>\`
End text`;

    expect(stripReasoningTagsFromText(text)).toBe(expected);
  });
});
