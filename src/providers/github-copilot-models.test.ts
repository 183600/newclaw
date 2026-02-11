import { describe, expect, it } from "vitest";
import { getDefaultCopilotModelIds, buildCopilotModelDefinition } from "./github-copilot-models.js";

describe("getDefaultCopilotModelIds", () => {
  it("should return an array of default model IDs", () => {
    const modelIds = getDefaultCopilotModelIds();
    expect(Array.isArray(modelIds)).toBe(true);
    expect(modelIds.length).toBeGreaterThan(0);
    expect(modelIds).toContain("gpt-4o");
    expect(modelIds).toContain("o1");
  });

  it("should return a copy of the array to prevent mutation", () => {
    const modelIds1 = getDefaultCopilotModelIds();
    const modelIds2 = getDefaultCopilotModelIds();
    expect(modelIds1).not.toBe(modelIds2); // Different references
    expect(modelIds1).toEqual(modelIds2); // Same content
  });
});

describe("buildCopilotModelDefinition", () => {
  it("should build a model definition with valid model ID", () => {
    const definition = buildCopilotModelDefinition("gpt-4o");

    expect(definition.id).toBe("gpt-4o");
    expect(definition.name).toBe("gpt-4o");
    expect(definition.api).toBe("openai-responses");
    expect(definition.reasoning).toBe(false);
    expect(definition.input).toEqual(["text", "image"]);
    expect(definition.cost).toEqual({
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
    });
    expect(definition.contextWindow).toBe(128_000);
    expect(definition.maxTokens).toBe(8192);
  });

  it("should trim whitespace from model ID", () => {
    const definition = buildCopilotModelDefinition("  gpt-4o  ");
    expect(definition.id).toBe("gpt-4o");
    expect(definition.name).toBe("gpt-4o");
  });

  it("should throw error for empty model ID", () => {
    expect(() => buildCopilotModelDefinition("")).toThrow("Model id required");
    expect(() => buildCopilotModelDefinition("   ")).toThrow("Model id required");
  });

  it("should handle different model IDs", () => {
    const models = ["o1", "o1-mini", "gpt-4.1", "gpt-4.1-mini"];

    models.forEach((modelId) => {
      const definition = buildCopilotModelDefinition(modelId);
      expect(definition.id).toBe(modelId);
      expect(definition.name).toBe(modelId);
    });
  });
});
