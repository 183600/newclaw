import { describe, expect, it, vi } from "vitest";
import { createReplyPrefixContext } from "./reply-prefix.js";

// Mock the dependencies
vi.mock("../agents/identity.js", () => ({
  resolveIdentityName: vi.fn((cfg, agentId) => `Agent-${agentId}`),
  resolveEffectiveMessagesConfig: vi.fn((cfg, agentId) => ({
    responsePrefix: "[Prefix]",
  })),
}));

vi.mock("../auto-reply/reply/response-prefix-template.js", () => ({
  extractShortModelName: vi.fn((model) => model.split("/")[1] || model),
}));

describe("createReplyPrefixContext", () => {
  it("should create a reply prefix context with default values", () => {
    const mockCfg = {};
    const agentId = "test-agent";

    const result = createReplyPrefixContext({
      cfg: mockCfg,
      agentId,
    });

    expect(result).toHaveProperty("prefixContext");
    expect(result).toHaveProperty("responsePrefix");
    expect(result).toHaveProperty("responsePrefixContextProvider");
    expect(result).toHaveProperty("onModelSelected");

    expect(result.prefixContext).toEqual({
      identityName: "Agent-test-agent",
    });

    expect(result.responsePrefix).toBe("[Prefix]");
    expect(typeof result.responsePrefixContextProvider).toBe("function");
    expect(typeof result.onModelSelected).toBe("function");
  });

  it("should provide initial prefix context through responsePrefixContextProvider", () => {
    const mockCfg = {};
    const agentId = "test-agent";

    const result = createReplyPrefixContext({
      cfg: mockCfg,
      agentId,
    });

    const context = result.responsePrefixContextProvider();
    expect(context).toEqual({
      identityName: "Agent-test-agent",
    });
  });

  it("should update prefix context when onModelSelected is called", () => {
    const mockCfg = {};
    const agentId = "test-agent";

    const result = createReplyPrefixContext({
      cfg: mockCfg,
      agentId,
    });

    // Initial context
    let context = result.responsePrefixContextProvider();
    expect(context).toEqual({
      identityName: "Agent-test-agent",
    });

    // Call onModelSelected
    result.onModelSelected({
      provider: "openai",
      model: "gpt-4",
      thinkLevel: "high",
    });

    // Updated context
    context = result.responsePrefixContextProvider();
    expect(context).toEqual({
      identityName: "Agent-test-agent",
      provider: "openai",
      model: "gpt-4",
      modelFull: "openai/gpt-4",
      thinkingLevel: "high",
    });
  });

  it("should handle model selection with default think level", () => {
    const mockCfg = {};
    const agentId = "test-agent";

    const result = createReplyPrefixContext({
      cfg: mockCfg,
      agentId,
    });

    // Call onModelSelected without thinkLevel
    result.onModelSelected({
      provider: "anthropic",
      model: "claude-3-opus",
    });

    const context = result.responsePrefixContextProvider();
    expect(context).toEqual({
      identityName: "Agent-test-agent",
      provider: "anthropic",
      model: "claude-3-opus",
      modelFull: "anthropic/claude-3-opus",
      thinkingLevel: "off",
    });
  });

  it("should handle multiple model selections", () => {
    const mockCfg = {};
    const agentId = "test-agent";

    const result = createReplyPrefixContext({
      cfg: mockCfg,
      agentId,
    });

    // First selection
    result.onModelSelected({
      provider: "openai",
      model: "gpt-3.5-turbo",
      thinkLevel: "medium",
    });

    let context = result.responsePrefixContextProvider();
    expect(context.model).toBe("gpt-3.5-turbo");
    expect(context.thinkingLevel).toBe("medium");

    // Second selection
    result.onModelSelected({
      provider: "google",
      model: "gemini-pro",
      thinkLevel: "low",
    });

    context = result.responsePrefixContextProvider();
    expect(context.model).toBe("gemini-pro");
    expect(context.thinkingLevel).toBe("low");
    expect(context.provider).toBe("google");
    expect(context.modelFull).toBe("google/gemini-pro");
  });

  it("should maintain identity name across model selections", () => {
    const mockCfg = {};
    const agentId = "persistent-agent";

    const result = createReplyPrefixContext({
      cfg: mockCfg,
      agentId,
    });

    // Initial context
    let context = result.responsePrefixContextProvider();
    expect(context.identityName).toBe("Agent-persistent-agent");

    // After model selection
    result.onModelSelected({
      provider: "openai",
      model: "gpt-4",
    });

    context = result.responsePrefixContextProvider();
    expect(context.identityName).toBe("Agent-persistent-agent");

    // After another model selection
    result.onModelSelected({
      provider: "anthropic",
      model: "claude-3-sonnet",
    });

    context = result.responsePrefixContextProvider();
    expect(context.identityName).toBe("Agent-persistent-agent");
  });

  it("should handle complex model names", () => {
    const mockCfg = {};
    const agentId = "test-agent";

    const result = createReplyPrefixContext({
      cfg: mockCfg,
      agentId,
    });

    result.onModelSelected({
      provider: "openai",
      model: "gpt-4-1106-preview",
    });

    const context = result.responsePrefixContextProvider();
    expect(context.model).toBe("gpt-4-1106-preview");
    expect(context.modelFull).toBe("openai/gpt-4-1106-preview");
  });

  it("should mutate the same object instead of replacing it", () => {
    const mockCfg = {};
    const agentId = "test-agent";

    const result = createReplyPrefixContext({
      cfg: mockCfg,
      agentId,
    });

    const initialContext = result.responsePrefixContextProvider();

    result.onModelSelected({
      provider: "openai",
      model: "gpt-4",
    });

    const updatedContext = result.responsePrefixContextProvider();

    // Should be the same object reference
    expect(initialContext).toBe(updatedContext);

    // But with updated properties
    expect(updatedContext.provider).toBe("openai");
    expect(updatedContext.model).toBe("gpt-4");
  });
});
