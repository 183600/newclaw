import { describe, expect, it } from "vitest";
import { isReasoningTagProvider } from "./provider-utils.js";

describe("isReasoningTagProvider", () => {
  it("should return false for undefined provider", () => {
    expect(isReasoningTagProvider(undefined)).toBe(false);
  });

  it("should return false for null provider", () => {
    expect(isReasoningTagProvider(null)).toBe(false);
  });

  it("should return false for empty string provider", () => {
    expect(isReasoningTagProvider("")).toBe(false);
  });

  it("should return false for whitespace-only provider", () => {
    expect(isReasoningTagProvider("   ")).toBe(false);
    expect(isReasoningTagProvider("\t\n")).toBe(false);
  });

  it("should return true for ollama", () => {
    expect(isReasoningTagProvider("ollama")).toBe(true);
    expect(isReasoningTagProvider("OLLAMA")).toBe(true);
    expect(isReasoningTagProvider("Ollama")).toBe(true);
    expect(isReasoningTagProvider("  ollama  ")).toBe(true);
  });

  it("should return true for google-gemini-cli", () => {
    expect(isReasoningTagProvider("google-gemini-cli")).toBe(true);
    expect(isReasoningTagProvider("GOOGLE-GEMINI-CLI")).toBe(true);
    expect(isReasoningTagProvider("Google-Gemini-CLI")).toBe(true);
    expect(isReasoningTagProvider("  google-gemini-cli  ")).toBe(true);
  });

  it("should return true for google-generative-ai", () => {
    expect(isReasoningTagProvider("google-generative-ai")).toBe(true);
    expect(isReasoningTagProvider("GOOGLE-GENERATIVE-AI")).toBe(true);
    expect(isReasoningTagProvider("Google-Generative-AI")).toBe(true);
    expect(isReasoningTagProvider("  google-generative-ai  ")).toBe(true);
  });

  it("should return true for google-antigravity", () => {
    expect(isReasoningTagProvider("google-antigravity")).toBe(true);
    expect(isReasoningTagProvider("GOOGLE-ANTIGRAVITY")).toBe(true);
    expect(isReasoningTagProvider("Google-Antigravity")).toBe(true);
    expect(isReasoningTagProvider("  google-antigravity  ")).toBe(true);
  });

  it("should return true for google-antigravity with model variations", () => {
    expect(isReasoningTagProvider("google-antigravity/gemini-3")).toBe(true);
    expect(isReasoningTagProvider("google-antigravity/gemini-3-flash")).toBe(true);
    expect(isReasoningTagProvider("google-antigravity/gemini-3-pro")).toBe(true);
    expect(isReasoningTagProvider("google-antigravity/gemini-3-turbo")).toBe(true);
    expect(isReasoningTagProvider("GOOGLE-ANTIGRAVITY/GEMINI-3")).toBe(true);
    expect(isReasoningTagProvider("  google-antigravity/gemini-3  ")).toBe(true);
  });

  it("should return true for minimax", () => {
    expect(isReasoningTagProvider("minimax")).toBe(true);
    expect(isReasoningTagProvider("MINIMAX")).toBe(true);
    expect(isReasoningTagProvider("Minimax")).toBe(true);
    expect(isReasoningTagProvider("  minimax  ")).toBe(true);
  });

  it("should return true for minimax with model variations", () => {
    expect(isReasoningTagProvider("minimax/m2.1")).toBe(true);
    expect(isReasoningTagProvider("minimax/m2.1-20b")).toBe(true);
    expect(isReasoningTagProvider("minimax/m2.1-turbo")).toBe(true);
    expect(isReasoningTagProvider("MINIMAX/M2.1")).toBe(true);
    expect(isReasoningTagProvider("  minimax/m2.1  ")).toBe(true);
  });

  it("should return false for openai", () => {
    expect(isReasoningTagProvider("openai")).toBe(false);
    expect(isReasoningTagProvider("OPENAI")).toBe(false);
    expect(isReasoningTagProvider("OpenAI")).toBe(false);
    expect(isReasoningTagProvider("  openai  ")).toBe(false);
  });

  it("should return false for anthropic", () => {
    expect(isReasoningTagProvider("anthropic")).toBe(false);
    expect(isReasoningTagProvider("ANTHROPIC")).toBe(false);
    expect(isReasoningTagProvider("Anthropic")).toBe(false);
    expect(isReasoningTagProvider("  anthropic  ")).toBe(false);
  });

  it("should return false for unknown providers", () => {
    expect(isReasoningTagProvider("unknown")).toBe(false);
    expect(isReasoningTagProvider("random")).toBe(false);
    expect(isReasoningTagProvider("test")).toBe(false);
  });

  it("should return false for providers with similar but not matching names", () => {
    expect(isReasoningTagProvider("google")).toBe(false);
    expect(isReasoningTagProvider("gemini")).toBe(false);
    expect(isReasoningTagProvider("antigravity")).toBe(false);
    expect(isReasoningTagProvider("mini")).toBe(false);
    expect(isReasoningTagProvider("max")).toBe(false);
  });
});
