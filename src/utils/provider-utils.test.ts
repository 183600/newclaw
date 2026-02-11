import { describe, it, expect } from "vitest";
import { isReasoningTagProvider } from "./provider-utils";

describe("isReasoningTagProvider", () => {
  it("should return false for undefined/null providers", () => {
    expect(isReasoningTagProvider(undefined)).toBe(false);
    expect(isReasoningTagProvider(null)).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isReasoningTagProvider("")).toBe(false);
    expect(isReasoningTagProvider("   ")).toBe(false);
  });

  it("should return true for ollama provider", () => {
    expect(isReasoningTagProvider("ollama")).toBe(true);
    expect(isReasoningTagProvider("OLLAMA")).toBe(true);
    expect(isReasoningTagProvider("  ollama  ")).toBe(true);
  });

  it("should return true for google-gemini-cli provider", () => {
    expect(isReasoningTagProvider("google-gemini-cli")).toBe(true);
    expect(isReasoningTagProvider("GOOGLE-GEMINI-CLI")).toBe(true);
    expect(isReasoningTagProvider("  google-gemini-cli  ")).toBe(true);
  });

  it("should return true for google-generative-ai provider", () => {
    expect(isReasoningTagProvider("google-generative-ai")).toBe(true);
    expect(isReasoningTagProvider("GOOGLE-GENERATIVE-AI")).toBe(true);
    expect(isReasoningTagProvider("  google-generative-ai  ")).toBe(true);
  });

  it("should return true for google-antigravity provider and variations", () => {
    expect(isReasoningTagProvider("google-antigravity")).toBe(true);
    expect(isReasoningTagProvider("google-antigravity/gemini-3")).toBe(true);
    expect(isReasoningTagProvider("google-antigravity/gemini-3-flash")).toBe(true);
    expect(isReasoningTagProvider("GOOGLE-ANTIGRAVITY")).toBe(true);
    expect(isReasoningTagProvider("  google-antigravity  ")).toBe(true);
  });

  it("should return true for minimax provider variations", () => {
    expect(isReasoningTagProvider("minimax")).toBe(true);
    expect(isReasoningTagProvider("minimax-2.1")).toBe(true);
    expect(isReasoningTagProvider("minimax-pro")).toBe(true);
    expect(isReasoningTagProvider("MINIMAX")).toBe(true);
    expect(isReasoningTagProvider("  minimax  ")).toBe(true);
  });

  it("should return false for other providers", () => {
    expect(isReasoningTagProvider("openai")).toBe(false);
    expect(isReasoningTagProvider("anthropic")).toBe(false);
    expect(isReasoningTagProvider("claude")).toBe(false);
    expect(isReasoningTagProvider("azure")).toBe(false);
    expect(isReasoningTagProvider("bedrock")).toBe(false);
  });

  it("should handle provider names containing reasoning keywords but not matching", () => {
    expect(isReasoningTagProvider("my-ollama-custom")).toBe(false);
    expect(isReasoningTagProvider("google-gemini")).toBe(false);
    expect(isReasoningTagProvider("anti-gravity")).toBe(false);
    expect(isReasoningTagProvider("super-minimax")).toBe(true); // contains "minimax"
  });

  it("should be case insensitive", () => {
    expect(isReasoningTagProvider("Ollama")).toBe(true);
    expect(isReasoningTagProvider("OLLAMA")).toBe(true);
    expect(isReasoningTagProvider("Google-Gemini-CLI")).toBe(true);
    expect(isReasoningTagProvider("GOOGLE-GENERATIVE-AI")).toBe(true);
    expect(isReasoningTagProvider("Google-Antigravity")).toBe(true);
    expect(isReasoningTagProvider("Minimax")).toBe(true);
  });

  it("should handle whitespace around provider names", () => {
    expect(isReasoningTagProvider("  ollama  ")).toBe(true);
    expect(isReasoningTagProvider("\tgoogle-gemini-cli\n")).toBe(true);
    expect(isReasoningTagProvider("  google-antigravity/gemini-3  ")).toBe(true);
  });
});
