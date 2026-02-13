import { describe, expect, it } from "vitest";
import { isReasoningTagProvider } from "./provider-utils.js";

describe("isReasoningTagProvider - Additional Tests", () => {
  it("handles provider with whitespace", () => {
    expect(isReasoningTagProvider("  ollama  ")).toBe(true);
    expect(isReasoningTagProvider("\tgoogle-gemini-cli\n")).toBe(true);
    expect(isReasoningTagProvider("  minimax  ")).toBe(true);
  });

  it("handles provider with mixed case", () => {
    expect(isReasoningTagProvider("OLLAMA")).toBe(true);
    expect(isReasoningTagProvider("Ollama")).toBe(true);
    expect(isReasoningTagProvider("OLLAMA")).toBe(true);
    expect(isReasoningTagProvider("ollama")).toBe(true);
  });

  it("handles provider with special characters", () => {
    expect(isReasoningTagProvider("google-antigravity/v1")).toBe(true);
    expect(isReasoningTagProvider("minimax-pro")).toBe(true);
    expect(isReasoningTagProvider("custom-provider_test")).toBe(false);
  });

  it("handles empty string", () => {
    expect(isReasoningTagProvider("")).toBe(false);
  });

  it("handles provider that contains reasoning keywords but is not a reasoning provider", () => {
    expect(isReasoningTagProvider("reasoning-provider")).toBe(false);
    expect(isReasoningTagProvider("my-reasoning-engine")).toBe(false);
    expect(isReasoningTagProvider("reasoningAI")).toBe(false);
  });

  it("handles provider with partial matches", () => {
    expect(isReasoningTagProvider("mini")).toBe(false);
    expect(isReasoningTagProvider("maxi")).toBe(false);
    expect(isReasoningTagProvider("google")).toBe(false);
    expect(isReasoningTagProvider("antigravity")).toBe(false);
  });
});
