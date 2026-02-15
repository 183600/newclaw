import { describe, expect, it } from "vitest";
import { computeEmbeddingProviderKey } from "./provider-key.js";

describe("computeEmbeddingProviderKey", () => {
  it("should compute key for generic provider", () => {
    const params = {
      providerId: "test-provider",
      providerModel: "test-model",
    };
    const result = computeEmbeddingProviderKey(params);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should compute different keys for different providers", () => {
    const params1 = {
      providerId: "provider-1",
      providerModel: "model-1",
    };
    const params2 = {
      providerId: "provider-2",
      providerModel: "model-1",
    };
    const result1 = computeEmbeddingProviderKey(params1);
    const result2 = computeEmbeddingProviderKey(params2);
    expect(result1).not.toBe(result2);
  });

  it("should compute different keys for different models", () => {
    const params1 = {
      providerId: "test-provider",
      providerModel: "model-1",
    };
    const params2 = {
      providerId: "test-provider",
      providerModel: "model-2",
    };
    const result1 = computeEmbeddingProviderKey(params1);
    const result2 = computeEmbeddingProviderKey(params2);
    expect(result1).not.toBe(result2);
  });

  it("should compute key for OpenAI provider with baseUrl and model", () => {
    const params = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
      },
    };
    const result = computeEmbeddingProviderKey(params);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should compute key for Gemini provider with baseUrl and model", () => {
    const params = {
      providerId: "test-provider",
      providerModel: "test-model",
      gemini: {
        baseUrl: "https://generativelanguage.googleapis.com",
        model: "embedding-001",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": "api-key",
        },
      },
    };
    const result = computeEmbeddingProviderKey(params);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should compute different keys for OpenAI vs Gemini", () => {
    const openAiParams = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: { "Content-Type": "application/json" },
      },
    };
    const geminiParams = {
      providerId: "test-provider",
      providerModel: "test-model",
      gemini: {
        baseUrl: "https://generativelanguage.googleapis.com",
        model: "embedding-001",
        headers: { "Content-Type": "application/json" },
      },
    };
    const openAiResult = computeEmbeddingProviderKey(openAiParams);
    const geminiResult = computeEmbeddingProviderKey(geminiParams);
    expect(openAiResult).not.toBe(geminiResult);
  });

  it("should compute different keys for different OpenAI baseUrls", () => {
    const params1 = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: { "Content-Type": "application/json" },
      },
    };
    const params2 = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://custom.openai.com",
        model: "text-embedding-ada-002",
        headers: { "Content-Type": "application/json" },
      },
    };
    const result1 = computeEmbeddingProviderKey(params1);
    const result2 = computeEmbeddingProviderKey(params2);
    expect(result1).not.toBe(result2);
  });

  it("should compute different keys for different OpenAI models", () => {
    const params1 = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: { "Content-Type": "application/json" },
      },
    };
    const params2 = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-3-small",
        headers: { "Content-Type": "application/json" },
      },
    };
    const result1 = computeEmbeddingProviderKey(params1);
    const result2 = computeEmbeddingProviderKey(params2);
    expect(result1).not.toBe(result2);
  });

  it("should compute different keys for different OpenAI headers", () => {
    const params1 = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
      },
    };
    const params2 = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: {
          "Content-Type": "application/json",
          "X-Custom-Header": "custom-value",
        },
      },
    };
    const result1 = computeEmbeddingProviderKey(params1);
    const result2 = computeEmbeddingProviderKey(params2);
    expect(result1).not.toBe(result2);
  });

  it("should compute same keys for OpenAI with same headers but different values", () => {
    const params1 = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token1",
        },
      },
    };
    const params2 = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token2",
        },
      },
    };
    const result1 = computeEmbeddingProviderKey(params1);
    const result2 = computeEmbeddingProviderKey(params2);
    expect(result1).toBe(result2);
  });

  it("should compute different keys for Gemini with different headers", () => {
    const params1 = {
      providerId: "test-provider",
      providerModel: "test-model",
      gemini: {
        baseUrl: "https://generativelanguage.googleapis.com",
        model: "embedding-001",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": "api-key1",
        },
      },
    };
    const params2 = {
      providerId: "test-provider",
      providerModel: "test-model",
      gemini: {
        baseUrl: "https://generativelanguage.googleapis.com",
        model: "embedding-001",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": "api-key2",
        },
      },
    };
    const result1 = computeEmbeddingProviderKey(params1);
    const result2 = computeEmbeddingProviderKey(params2);
    expect(result1).toBe(result2);
  });

  it("should handle empty headers", () => {
    const params = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: {},
      },
    };
    const result = computeEmbeddingProviderKey(params);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should handle headers with whitespace and case variations", () => {
    const params1 = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
      },
    };
    const params2 = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: {
          "  content-type  ": "application/json",
          AUTHORIZATION: "Bearer token",
        },
      },
    };
    const result1 = computeEmbeddingProviderKey(params1);
    const result2 = computeEmbeddingProviderKey(params2);
    expect(result1).toBe(result2);
  });

  it("should compute consistent keys for same input", () => {
    const params = {
      providerId: "test-provider",
      providerModel: "test-model",
      openAi: {
        baseUrl: "https://api.openai.com",
        model: "text-embedding-ada-002",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
      },
    };
    const result1 = computeEmbeddingProviderKey(params);
    const result2 = computeEmbeddingProviderKey(params);
    expect(result1).toBe(result2);
  });
});
