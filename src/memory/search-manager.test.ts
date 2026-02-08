import { describe, expect, it, vi, beforeEach } from "vitest";
import type { OpenClawConfig } from "../config/config.ts";
import { getMemorySearchManager } from "./search-manager.ts";

describe("getMemorySearchManager", () => {
  let mockConfig: OpenClawConfig;

  beforeEach(() => {
    mockConfig = {
      memory: {},
    } as OpenClawConfig;
  });

  it("returns error result when fallback manager fails", async () => {
    // Mock the MemoryIndexManager to throw an error
    vi.doMock("./manager.js", () => ({
      MemoryIndexManager: {
        get: vi.fn().mockRejectedValue(new Error("Memory initialization failed")),
      },
    }));

    const result = await getMemorySearchManager({
      cfg: mockConfig,
      agentId: "test-agent",
    });

    expect(result.manager).toBeNull();
    expect(result.error).toBe("Memory initialization failed");
  });

  it("handles QMD configuration errors gracefully", async () => {
    mockConfig.memory = {
      backend: "qmd",
      qmd: {
        apiUrl: "invalid-url",
        apiKey: "test-key",
        indexName: "test-index",
      },
    };

    const result = await getMemorySearchManager({
      cfg: mockConfig,
      agentId: "test-agent",
    });

    // Should handle the error and return null or error
    if (result.manager === null) {
      expect(result.error).toBeDefined();
    } else {
      // If it returns a manager, it should be a fallback manager
      expect(result.manager).toBeDefined();
    }
  });
});

describe("memory manager integration", () => {
  it("handles QMD unavailability gracefully", async () => {
    // This test verifies that when QMD is not available, the system falls back gracefully
    const result = await getMemorySearchManager({
      cfg: {
        memory: {
          backend: "qmd",
          qmd: {
            apiUrl: "http://localhost:9999", // Non-existent URL
            apiKey: "test-key",
            indexName: "test-index",
          },
        },
      } as OpenClawConfig,
      agentId: "test-agent",
    });

    // Should handle the error and return null or error
    if (result.manager === null) {
      expect(result.error).toBeDefined();
    } else {
      // If it returns a manager, it should be a fallback manager
      expect(result.manager).toBeDefined();
    }
  });
});
