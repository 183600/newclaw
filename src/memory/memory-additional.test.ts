import { describe, expect, it } from "vitest";
import type { MemorySearchResult, MemoryProviderStatus } from "./types.js";
import { computeEmbeddingProviderKey } from "./provider-key.js";

describe("memory module - additional edge cases", () => {
  describe("computeEmbeddingProviderKey edge cases", () => {
    it("should handle special characters in provider IDs and models", () => {
      const params = {
        providerId: "provider-with-special-chars_123",
        providerModel: "model-with-special-chars_456",
      };
      const result = computeEmbeddingProviderKey(params);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle Unicode characters in parameters", () => {
      const params = {
        providerId: "测试提供者",
        providerModel: "测试模型",
      };
      const result = computeEmbeddingProviderKey(params);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle very long provider names and models", () => {
      const longString = "a".repeat(1000);
      const params = {
        providerId: longString,
        providerModel: longString,
      };
      const result = computeEmbeddingProviderKey(params);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle empty strings in provider parameters", () => {
      const params = {
        providerId: "",
        providerModel: "",
      };
      const result = computeEmbeddingProviderKey(params);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle OpenAI with complex headers", () => {
      const params = {
        providerId: "test-provider",
        providerModel: "test-model",
        openAi: {
          baseUrl: "https://api.openai.com",
          model: "text-embedding-ada-002",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token",
            "X-Custom-Header": "custom-value",
            "X-Another-Header": "another-value",
            "User-Agent": "test-agent/1.0",
          },
        },
      };
      const result = computeEmbeddingProviderKey(params);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle Gemini with complex headers", () => {
      const params = {
        providerId: "test-provider",
        providerModel: "test-model",
        gemini: {
          baseUrl: "https://generativelanguage.googleapis.com",
          model: "embedding-001",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": "api-key",
            "X-Goog-User-Project": "project-id",
            "X-Custom-Header": "custom-value",
          },
        },
      };
      const result = computeEmbeddingProviderKey(params);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle malformed URLs gracefully", () => {
      const params = {
        providerId: "test-provider",
        providerModel: "test-model",
        openAi: {
          baseUrl: "not-a-url",
          model: "text-embedding-ada-002",
          headers: { "Content-Type": "application/json" },
        },
      };
      const result = computeEmbeddingProviderKey(params);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle headers with special characters", () => {
      const params = {
        providerId: "test-provider",
        providerModel: "test-model",
        openAi: {
          baseUrl: "https://api.openai.com",
          model: "text-embedding-ada-002",
          headers: {
            "Content-Type": "application/json",
            "X-Special-Chars": "特殊字符!@#$%^&*()",
          },
        },
      };
      const result = computeEmbeddingProviderKey(params);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("MemorySearchResult type validation", () => {
    it("should accept valid MemorySearchResult", () => {
      const result: MemorySearchResult = {
        path: "/path/to/file",
        startLine: 1,
        endLine: 10,
        score: 0.95,
        snippet: "This is a snippet",
        source: "memory",
        citation: "citation-123",
      };

      expect(result.path).toBe("/path/to/file");
      expect(result.startLine).toBe(1);
      expect(result.endLine).toBe(10);
      expect(result.score).toBe(0.95);
      expect(result.snippet).toBe("This is a snippet");
      expect(result.source).toBe("memory");
      expect(result.citation).toBe("citation-123");
    });

    it("should accept MemorySearchResult without optional citation", () => {
      const result: MemorySearchResult = {
        path: "/path/to/file",
        startLine: 1,
        endLine: 10,
        score: 0.95,
        snippet: "This is a snippet",
        source: "sessions",
      };

      expect(result.citation).toBeUndefined();
    });

    it("should accept edge case values in MemorySearchResult", () => {
      const result: MemorySearchResult = {
        path: "",
        startLine: 0,
        endLine: 0,
        score: 0,
        snippet: "",
        source: "memory",
      };

      expect(result.path).toBe("");
      expect(result.startLine).toBe(0);
      expect(result.endLine).toBe(0);
      expect(result.score).toBe(0);
      expect(result.snippet).toBe("");
    });
  });

  describe("MemoryProviderStatus type validation", () => {
    it("should accept minimal MemoryProviderStatus", () => {
      const status: MemoryProviderStatus = {
        backend: "builtin",
        provider: "test-provider",
      };

      expect(status.backend).toBe("builtin");
      expect(status.provider).toBe("test-provider");
      expect(status.model).toBeUndefined();
    });

    it("should accept complete MemoryProviderStatus", () => {
      const status: MemoryProviderStatus = {
        backend: "qmd",
        provider: "test-provider",
        model: "test-model",
        requestedProvider: "requested-provider",
        files: 100,
        chunks: 1000,
        dirty: true,
        workspaceDir: "/workspace",
        dbPath: "/workspace/db.sqlite",
        extraPaths: ["/extra/path1", "/extra/path2"],
        sources: ["memory", "sessions"],
        sourceCounts: [
          { source: "memory", files: 50, chunks: 500 },
          { source: "sessions", files: 50, chunks: 500 },
        ],
        cache: {
          enabled: true,
          entries: 100,
          maxEntries: 1000,
        },
        fts: {
          enabled: true,
          available: true,
        },
        fallback: {
          from: "original-provider",
          reason: "original unavailable",
        },
        vector: {
          enabled: true,
          available: true,
          extensionPath: "/path/to/extension",
          dims: 1536,
        },
        batch: {
          enabled: true,
          failures: 0,
          limit: 100,
          wait: false,
          concurrency: 5,
          pollIntervalMs: 1000,
          timeoutMs: 30000,
        },
        custom: {
          key1: "value1",
          key2: 123,
        },
      };

      expect(status.backend).toBe("qmd");
      expect(status.provider).toBe("test-provider");
      expect(status.model).toBe("test-model");
      expect(status.files).toBe(100);
      expect(status.chunks).toBe(1000);
      expect(status.dirty).toBe(true);
      expect(status.cache?.enabled).toBe(true);
      expect(status.vector?.dims).toBe(1536);
      expect(status.batch?.concurrency).toBe(5);
      expect(status.custom?.key1).toBe("value1");
    });

    it("should accept MemoryProviderStatus with error states", () => {
      const status: MemoryProviderStatus = {
        backend: "builtin",
        provider: "test-provider",
        fts: {
          enabled: true,
          available: false,
          error: "FTS not available",
        },
        vector: {
          enabled: true,
          available: false,
          loadError: "Failed to load vector extension",
        },
        batch: {
          enabled: true,
          failures: 5,
          limit: 100,
          wait: true,
          concurrency: 5,
          pollIntervalMs: 1000,
          timeoutMs: 30000,
          lastError: "Batch processing failed",
          lastProvider: "failed-provider",
        },
      };

      expect(status.fts?.error).toBe("FTS not available");
      expect(status.vector?.loadError).toBe("Failed to load vector extension");
      expect(status.batch?.failures).toBe(5);
      expect(status.batch?.lastError).toBe("Batch processing failed");
    });
  });

  describe("MemorySearchResult edge cases", () => {
    it("should handle extreme score values", () => {
      const results: MemorySearchResult[] = [
        {
          path: "/path/to/file1",
          startLine: 1,
          endLine: 10,
          score: 0, // Minimum score
          snippet: "Low score result",
          source: "memory",
        },
        {
          path: "/path/to/file2",
          startLine: 1,
          endLine: 10,
          score: 1, // Maximum score
          snippet: "High score result",
          source: "sessions",
        },
        {
          path: "/path/to/file3",
          startLine: 1,
          endLine: 10,
          score: -0.5, // Negative score
          snippet: "Negative score result",
          source: "memory",
        },
        {
          path: "/path/to/file4",
          startLine: 1,
          endLine: 10,
          score: 1.5, // Score > 1
          snippet: "High score result",
          source: "sessions",
        },
      ];

      expect(results[0].score).toBe(0);
      expect(results[1].score).toBe(1);
      expect(results[2].score).toBe(-0.5);
      expect(results[3].score).toBe(1.5);
    });

    it("should handle large line numbers", () => {
      const result: MemorySearchResult = {
        path: "/path/to/large/file",
        startLine: 999999,
        endLine: 1000000,
        score: 0.95,
        snippet: "Large line numbers",
        source: "memory",
      };

      expect(result.startLine).toBe(999999);
      expect(result.endLine).toBe(1000000);
    });

    it("should handle special characters in paths and snippets", () => {
      const result: MemorySearchResult = {
        path: "/path/with/特殊字符/and spaces/file name.txt",
        startLine: 1,
        endLine: 10,
        score: 0.95,
        snippet: "Snippet with 特殊字符 and emojis 🚀",
        source: "memory",
      };

      expect(result.path).toContain("特殊字符");
      expect(result.snippet).toContain("特殊字符");
      expect(result.snippet).toContain("🚀");
    });
  });

  describe("integration scenarios", () => {
    it("should handle realistic memory search results", () => {
      const results: MemorySearchResult[] = [
        {
          path: "/workspace/docs/api.md",
          startLine: 15,
          endLine: 25,
          score: 0.92,
          snippet: "The API endpoint accepts POST requests with JSON payload",
          source: "memory",
          citation: "api-docs-15-25",
        },
        {
          path: "/workspace/sessions/session-123.json",
          startLine: 42,
          endLine: 48,
          score: 0.87,
          snippet: "User asked about API authentication methods",
          source: "sessions",
        },
        {
          path: "/workspace/code/example.js",
          startLine: 100,
          endLine: 120,
          score: 0.78,
          snippet: "function authenticateUser(token) { /* validation logic */ }",
          source: "memory",
        },
      ];

      expect(results).toHaveLength(3);
      expect(results[0].source).toBe("memory");
      expect(results[1].source).toBe("sessions");
      expect(results[2].source).toBe("memory");
      expect(results[0].score).toBeGreaterThan(results[1].score);
      expect(results[1].score).toBeGreaterThan(results[2].score);
    });

    it("should handle complex provider configuration scenarios", () => {
      const scenarios = [
        {
          name: "OpenAI with custom headers",
          params: {
            providerId: "openai-custom",
            providerModel: "text-embedding-3-large",
            openAi: {
              baseUrl: "https://api.custom-openai.com",
              model: "text-embedding-3-large",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer custom-token",
                "X-Custom-Header": "custom-value",
                "User-Agent": "OpenClaw/1.0",
              },
            },
          },
        },
        {
          name: "Gemini with project settings",
          params: {
            providerId: "gemini-project",
            providerModel: "embedding-001",
            gemini: {
              baseUrl: "https://generativelanguage.googleapis.com",
              model: "embedding-001",
              headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": "project-api-key",
                "X-Goog-User-Project": "my-project-123",
              },
            },
          },
        },
        {
          name: "Generic provider",
          params: {
            providerId: "generic-provider",
            providerModel: "generic-model",
          },
        },
      ];

      const keys = scenarios.map((scenario) =>
        computeEmbeddingProviderKey(scenario.params as unknown),
      );

      // All keys should be defined and unique
      keys.forEach((key) => {
        expect(key).toBeDefined();
        expect(typeof key).toBe("string");
        expect(key.length).toBeGreaterThan(0);
      });

      // Keys should be different for different configurations
      expect(new Set(keys).size).toBe(scenarios.length);
    });
  });
});
