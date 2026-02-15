import { describe, expect, it } from "vitest";
import { isReasoningTagProvider } from "./provider-utils.js";

describe("isReasoningTagProvider - Additional Tests", () => {
  it("should handle provider names with version suffixes", () => {
    expect(isReasoningTagProvider("ollama-v1.0")).toBe(false);
    expect(isReasoningTagProvider("google-gemini-cli-v2.1")).toBe(false);
    expect(isReasoningTagProvider("google-generative-ai-v3")).toBe(false);
    expect(isReasoningTagProvider("google-antigravity-v1.0")).toBe(true);
    expect(isReasoningTagProvider("minimax-v2.1")).toBe(true);
  });

  it("should handle provider names with prefixes", () => {
    expect(isReasoningTagProvider("custom-ollama")).toBe(false);
    expect(isReasoningTagProvider("my-google-gemini-cli")).toBe(false);
    expect(isReasoningTagProvider("test-google-antigravity")).toBe(true);
    expect(isReasoningTagProvider("local-minimax")).toBe(true);
  });

  it("should handle provider names with special characters", () => {
    expect(isReasoningTagProvider("ollama_test")).toBe(false);
    expect(isReasoningTagProvider("google-gemini-cli.test")).toBe(false);
    expect(isReasoningTagProvider("google-antigravity@prod")).toBe(true);
    expect(isReasoningTagProvider("minimax#dev")).toBe(true);
  });

  it("should handle provider names with mixed case in substrings", () => {
    expect(isReasoningTagProvider("Google-Antigravity")).toBe(true);
    expect(isReasoningTagProvider("GOOGLE-ANTIGRAVITY")).toBe(true);
    expect(isReasoningTagProvider("MiniMax")).toBe(true);
    expect(isReasoningTagProvider("MINIMAX")).toBe(true);
  });

  it("should handle provider names with additional context", () => {
    expect(isReasoningTagProvider("google-antigravity/gemini-3-flash")).toBe(true);
    expect(isReasoningTagProvider("google-antigravity/gemini-3-pro")).toBe(true);
    expect(isReasoningTagProvider("minimax/m2.1-20b")).toBe(true);
    expect(isReasoningTagProvider("minimax/m2.1-turbo")).toBe(true);
  });

  it("should handle provider names with numbers", () => {
    expect(isReasoningTagProvider("ollama2")).toBe(false);
    expect(isReasoningTagProvider("google-gemini-cli3")).toBe(false);
    expect(isReasoningTagProvider("minimax2")).toBe(true);
  });

  it("should handle provider names with underscores", () => {
    expect(isReasoningTagProvider("google_gemini_cli")).toBe(false);
    expect(isReasoningTagProvider("google_antigravity")).toBe(false);
    expect(isReasoningTagProvider("mini_max")).toBe(false);
  });

  it("should handle provider names with hyphens", () => {
    expect(isReasoningTagProvider("google-gemini-cli")).toBe(true);
    expect(isReasoningTagProvider("google-antigravity")).toBe(true);
    expect(isReasoningTagProvider("minimax-model")).toBe(true);
  });

  it("should handle provider names with trailing slashes", () => {
    expect(isReasoningTagProvider("google-antigravity/")).toBe(true);
    expect(isReasoningTagProvider("minimax/")).toBe(true);
  });

  it("should handle provider names with multiple slashes", () => {
    expect(isReasoningTagProvider("google-antigravity/models/gemini-3")).toBe(true);
    expect(isReasoningTagProvider("minimax/models/m2.1")).toBe(true);
  });
});
