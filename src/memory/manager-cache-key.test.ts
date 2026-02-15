import { describe, expect, it } from "vitest";
import type { ResolvedMemorySearchConfig } from "../agents/memory-search.js";
import { computeMemoryManagerCacheKey } from "./manager-cache-key.js";

describe("computeMemoryManagerCacheKey", () => {
  const createMockSettings = (
    overrides: Partial<ResolvedMemorySearchConfig> = {},
  ): ResolvedMemorySearchConfig => ({
    enabled: true,
    sources: new Set(["source1", "source2"]),
    extraPaths: new Set(["path1", "path2"]),
    provider: "test-provider",
    model: "test-model",
    fallback: false,
    local: {
      modelPath: "/path/to/model",
      modelCacheDir: "/path/to/cache",
    },
    remote: {
      baseUrl: "https://example.com",
      headers: {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      },
      batch: {
        enabled: true,
        wait: 1000,
        concurrency: 5,
        pollIntervalMs: 2000,
        timeoutMinutes: 10,
      },
    },
    experimental: false,
    store: {
      driver: "sqlite",
      path: "/path/to/store",
      vector: {
        enabled: true,
        extensionPath: "/path/to/extension",
      },
    },
    chunking: {
      maxSize: 1000,
      overlap: 100,
    },
    sync: {
      enabled: true,
      intervalMs: 5000,
    },
    query: {
      maxResults: 10,
      threshold: 0.8,
    },
    cache: {
      enabled: true,
      maxSize: 100,
      ttlMs: 300000,
    },
    ...overrides,
  });

  it("should compute cache key with all settings", () => {
    const params = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
      settings: createMockSettings(),
    };
    const result = computeMemoryManagerCacheKey(params);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain("test-agent:/test/workspace:");
  });

  it("should compute different keys for different agent IDs", () => {
    const settings = createMockSettings();
    const params1 = {
      agentId: "agent-1",
      workspaceDir: "/test/workspace",
      settings,
    };
    const params2 = {
      agentId: "agent-2",
      workspaceDir: "/test/workspace",
      settings,
    };
    const result1 = computeMemoryManagerCacheKey(params1);
    const result2 = computeMemoryManagerCacheKey(params2);
    expect(result1).not.toBe(result2);
    expect(result1).toContain("agent-1:/test/workspace:");
    expect(result2).toContain("agent-2:/test/workspace:");
  });

  it("should compute different keys for different workspace directories", () => {
    const settings = createMockSettings();
    const params1 = {
      agentId: "test-agent",
      workspaceDir: "/workspace1",
      settings,
    };
    const params2 = {
      agentId: "test-agent",
      workspaceDir: "/workspace2",
      settings,
    };
    const result1 = computeMemoryManagerCacheKey(params1);
    const result2 = computeMemoryManagerCacheKey(params2);
    expect(result1).not.toBe(result2);
    expect(result1).toContain("test-agent:/workspace1:");
    expect(result2).toContain("test-agent:/workspace2:");
  });

  it("should compute different keys for different enabled settings", () => {
    const baseParams = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
    };
    const params1 = {
      ...baseParams,
      settings: createMockSettings({ enabled: true }),
    };
    const params2 = {
      ...baseParams,
      settings: createMockSettings({ enabled: false }),
    };
    const result1 = computeMemoryManagerCacheKey(params1);
    const result2 = computeMemoryManagerCacheKey(params2);
    expect(result1).not.toBe(result2);
  });

  it("should compute different keys for different sources", () => {
    const baseParams = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
    };
    const params1 = {
      ...baseParams,
      settings: createMockSettings({ sources: new Set(["source1", "source2"]) }),
    };
    const params2 = {
      ...baseParams,
      settings: createMockSettings({ sources: new Set(["source1", "source3"]) }),
    };
    const result1 = computeMemoryManagerCacheKey(params1);
    const result2 = computeMemoryManagerCacheKey(params2);
    expect(result1).not.toBe(result2);
  });

  it("should compute same keys for sources with different order", () => {
    const baseParams = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
    };
    const params1 = {
      ...baseParams,
      settings: createMockSettings({ sources: new Set(["source1", "source2", "source3"]) }),
    };
    const params2 = {
      ...baseParams,
      settings: createMockSettings({ sources: new Set(["source3", "source1", "source2"]) }),
    };
    const result1 = computeMemoryManagerCacheKey(params1);
    const result2 = computeMemoryManagerCacheKey(params2);
    expect(result1).toBe(result2);
  });

  it("should compute different keys for different providers", () => {
    const baseParams = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
    };
    const params1 = {
      ...baseParams,
      settings: createMockSettings({ provider: "provider-1" }),
    };
    const params2 = {
      ...baseParams,
      settings: createMockSettings({ provider: "provider-2" }),
    };
    const result1 = computeMemoryManagerCacheKey(params1);
    const result2 = computeMemoryManagerCacheKey(params2);
    expect(result1).not.toBe(result2);
  });

  it("should compute different keys for different remote headers", () => {
    const baseParams = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
    };
    const params1 = {
      ...baseParams,
      settings: createMockSettings({
        remote: {
          baseUrl: "https://example.com",
          headers: {
            Authorization: "Bearer token1",
            "Content-Type": "application/json",
          },
          batch: {
            enabled: true,
            wait: 1000,
            concurrency: 5,
            pollIntervalMs: 2000,
            timeoutMinutes: 10,
          },
        },
      }),
    };
    const params2 = {
      ...baseParams,
      settings: createMockSettings({
        remote: {
          baseUrl: "https://example.com",
          headers: {
            Authorization: "Bearer token2",
            "Content-Type": "application/json",
          },
          batch: {
            enabled: true,
            wait: 1000,
            concurrency: 5,
            pollIntervalMs: 2000,
            timeoutMinutes: 10,
          },
        },
      }),
    };
    const result1 = computeMemoryManagerCacheKey(params1);
    const result2 = computeMemoryManagerCacheKey(params2);
    expect(result1).toBe(result2);
  });

  it("should compute different keys for different remote header names", () => {
    const baseParams = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
    };
    const params1 = {
      ...baseParams,
      settings: createMockSettings({
        remote: {
          baseUrl: "https://example.com",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          },
          batch: {
            enabled: true,
            wait: 1000,
            concurrency: 5,
            pollIntervalMs: 2000,
            timeoutMinutes: 10,
          },
        },
      }),
    };
    const params2 = {
      ...baseParams,
      settings: createMockSettings({
        remote: {
          baseUrl: "https://example.com",
          headers: {
            Authorization: "Bearer token",
            "X-Custom-Header": "custom-value",
          },
          batch: {
            enabled: true,
            wait: 1000,
            concurrency: 5,
            pollIntervalMs: 2000,
            timeoutMinutes: 10,
          },
        },
      }),
    };
    const result1 = computeMemoryManagerCacheKey(params1);
    const result2 = computeMemoryManagerCacheKey(params2);
    expect(result1).not.toBe(result2);
  });

  it("should compute same keys for remote headers with different cases", () => {
    const baseParams = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
    };
    const params1 = {
      ...baseParams,
      settings: createMockSettings({
        remote: {
          baseUrl: "https://example.com",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          },
          batch: {
            enabled: true,
            wait: 1000,
            concurrency: 5,
            pollIntervalMs: 2000,
            timeoutMinutes: 10,
          },
        },
      }),
    };
    const params2 = {
      ...baseParams,
      settings: createMockSettings({
        remote: {
          baseUrl: "https://example.com",
          headers: {
            authorization: "Bearer token",
            "content-type": "application/json",
          },
          batch: {
            enabled: true,
            wait: 1000,
            concurrency: 5,
            pollIntervalMs: 2000,
            timeoutMinutes: 10,
          },
        },
      }),
    };
    const result1 = computeMemoryManagerCacheKey(params1);
    const result2 = computeMemoryManagerCacheKey(params2);
    expect(result1).toBe(result2);
  });

  it("should compute different keys for different store drivers", () => {
    const baseParams = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
    };
    const params1 = {
      ...baseParams,
      settings: createMockSettings({
        store: {
          driver: "sqlite",
          path: "/path/to/store",
          vector: {
            enabled: true,
            extensionPath: "/path/to/extension",
          },
        },
      }),
    };
    const params2 = {
      ...baseParams,
      settings: createMockSettings({
        store: {
          driver: "postgres",
          path: "/path/to/store",
          vector: {
            enabled: true,
            extensionPath: "/path/to/extension",
          },
        },
      }),
    };
    const result1 = computeMemoryManagerCacheKey(params1);
    const result2 = computeMemoryManagerCacheKey(params2);
    expect(result1).not.toBe(result2);
  });

  it("should compute different keys for different vector settings", () => {
    const baseParams = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
    };
    const params1 = {
      ...baseParams,
      settings: createMockSettings({
        store: {
          driver: "sqlite",
          path: "/path/to/store",
          vector: {
            enabled: true,
            extensionPath: "/path/to/extension",
          },
        },
      }),
    };
    const params2 = {
      ...baseParams,
      settings: createMockSettings({
        store: {
          driver: "sqlite",
          path: "/path/to/store",
          vector: {
            enabled: false,
            extensionPath: "/path/to/extension",
          },
        },
      }),
    };
    const result1 = computeMemoryManagerCacheKey(params1);
    const result2 = computeMemoryManagerCacheKey(params2);
    expect(result1).not.toBe(result2);
  });

  it("should handle settings without remote configuration", () => {
    const params = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
      settings: createMockSettings({
        remote: undefined,
      }),
    };
    const result = computeMemoryManagerCacheKey(params);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain("test-agent:/test/workspace:");
  });

  it("should handle settings without batch configuration", () => {
    const params = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
      settings: createMockSettings({
        remote: {
          baseUrl: "https://example.com",
          headers: {
            Authorization: "Bearer token",
          },
          batch: undefined,
        },
      }),
    };
    const result = computeMemoryManagerCacheKey(params);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain("test-agent:/test/workspace:");
  });

  it("should compute consistent keys for the same input", () => {
    const params = {
      agentId: "test-agent",
      workspaceDir: "/test/workspace",
      settings: createMockSettings(),
    };
    const result1 = computeMemoryManagerCacheKey(params);
    const result2 = computeMemoryManagerCacheKey(params);
    expect(result1).toBe(result2);
  });
});
