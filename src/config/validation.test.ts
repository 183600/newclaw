import { describe, expect, it, vi, beforeEach } from "vitest";
import type { OpenClawConfig } from "./types.js";
import { validateConfigObject, validateConfigObjectWithPlugins } from "./validation.js";

// Mock dependencies
vi.mock("../agents/agent-scope.js", () => ({
  resolveAgentWorkspaceDir: vi.fn(() => "/test/workspace"),
  resolveDefaultAgentId: vi.fn(() => "default-agent"),
}));

vi.mock("../plugins/manifest-registry.js", () => ({
  loadPluginManifestRegistry: vi.fn(() => ({
    plugins: [],
    diagnostics: [],
  })),
}));

vi.mock("../plugins/config-state.js", () => ({
  normalizePluginsConfig: vi.fn((config) => config),
  resolveEnableState: vi.fn((pluginId) => ({ enabled: true, reason: "enabled" })),
  resolveMemorySlotDecision: vi.fn(() => ({ enabled: true })),
}));

vi.mock("../plugins/schema-validator.js", () => ({
  validateJsonSchemaValue: vi.fn(() => ({ ok: true, errors: [] })),
}));

vi.mock("./legacy.js", () => ({
  findLegacyConfigIssues: vi.fn(() => []),
}));

vi.mock("./agent-dirs.js", () => ({
  findDuplicateAgentDirs: vi.fn(() => []),
  formatDuplicateAgentDirError: vi.fn(() => "Duplicate directories found"),
}));

vi.mock("./zod-schema.js", () => ({
  OpenClawSchema: {
    safeParse: vi.fn((data) => ({ 
      success: true, 
      data: data 
    })),
  },
}));

describe("validateConfigObject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate a valid config object", () => {
    const config = {
      agents: {
        defaults: {
          model: { primary: "test-model" },
        },
      },
    } as OpenClawConfig;

    const result = validateConfigObject(config);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config).toBeDefined();
    }
  });

  it("should reject invalid config with schema errors", () => const { OpenClawSchema } = await import("./zod-schema.js");
    vi.mocked(OpenClawSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        issues: [
          { path: ["test", "path"], message: "Test validation error" }
        ]
      }
    });

    const config = { invalid: "config" };
    const result = validateConfigObject(config);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toEqual({
        path: "test.path",
        message: "Test validation error",
      });
    }
  });

  it("should reject config with legacy issues", async () => {
    const { findLegacyConfigIssues } = await import("./legacy.js");
    vi.mocked(findLegacyConfigIssues).mockReturnValue([
      { path: "legacy.path", message: "Legacy configuration detected" }
    ]);

    const config = { legacy: "config" };
    const result = validateConfigObject(config);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toEqual({
        path: "legacy.path",
        message: "Legacy configuration detected",
      });
    }
  });

  it("should reject config with duplicate agent directories", async () => {
    const { findDuplicateAgentDirs, formatDuplicateAgentDirError } = await import("./agent-dirs.js");
    vi.mocked(findDuplicateAgentDirs).mockReturnValue([{
      agentId: "test-agent",
      dir: "/test/dir",
    }]);
    vi.mocked(formatDuplicateAgentDirError).mockReturnValue("Duplicate directories found");

    const config = {
      agents: {
        list: [
          { id: "test-agent", dir: "/test/dir" },
        ],
      },
    } as OpenClawConfig;
    const result = validateConfigObject(config);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toEqual({
        path: "agents.list",
        message: "Duplicate directories found",
      });
    }
  });

  it("should validate identity avatar paths", () => {
    const config = {
      agents: {
        list: [
          {
            id: "test-agent",
            identity: {
              avatar: "invalid-path",
            },
          },
        ],
      },
    } as OpenClawConfig;
    const result = validateConfigObject(config);

    // Should fail because avatar path is invalid
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some(issue => 
        issue.path.includes("identity.avatar")
      )).toBe(true);
    }
  });

  it("should accept valid identity avatar URLs", () => {
    const config = {
      agents: {
        list: [
          {
            id: "test-agent",
            identity: {
              avatar: "https://example.com/avatar.png",
            },
          },
        ],
      },
    } as OpenClawConfig;
    const result = validateConfigObject(config);

    expect(result.ok).toBe(true);
  });

  it("should accept data URI avatars", () => {
    const config = {
      agents: {
        list: [
          {
            id: "test-agent",
            identity: {
              avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
            },
          },
        ],
      },
    } as OpenClawConfig;
    const result = validateConfigObject(config);

    expect(result.ok).toBe(true);
  });
});

describe("validateConfigObjectWithPlugins", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate config with plugins successfully", async () => {
    const { loadPluginManifestRegistry } = await import("../plugins/manifest-registry.js");
    vi.mocked(loadPluginManifestRegistry).mockReturnValue({
      plugins: [
        { id: "test-plugin", kind: "test", channels: [], origin: "test" }
      ],
      diagnostics: [],
    });

    const config = {
      agents: {
        defaults: {
          model: { primary: "test-model" },
        },
      },
      plugins: {
        entries: {
          "test-plugin": { config: {} }
        }
      },
    } as OpenClawConfig;

    const result = validateConfigObjectWithPlugins(config);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config).toBeDefined();
      expect(result.warnings).toBeDefined();
    }
  });

  it("should return plugin validation errors", async () => {
    const { loadPluginManifestRegistry } = await import("../plugins/manifest-registry.js");
    vi.mocked(loadPluginManifestRegistry).mockReturnValue({
      plugins: [],
      diagnostics: [
        {
          pluginId: "test-plugin",
          level: "error",
          message: "Plugin not found"
        }
      ],
    });

    const config = {
      plugins: {
        entries: {
          "test-plugin": { config: {} }
        }
      },
    } as OpenClawConfig;

    const result = validateConfigObjectWithPlugins(config);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].message).toContain("Plugin not found");
      expect(result.warnings).toBeDefined();
    }
  });

  it("should return plugin validation warnings", async () => {
    const { loadPluginManifestRegistry } = await import("../plugins/manifest-registry.js");
    vi.mocked(loadPluginManifestRegistry).mockReturnValue({
      plugins: [],
      diagnostics: [
        {
          pluginId: "test-plugin",
          level: "warning",
          message: "Plugin deprecated"
        }
      ],
    });

    const config = {
      plugins: {
        entries: {
          "test-plugin": { config: {} }
        }
      },
    } as OpenClawConfig;

    const result = validateConfigObjectWithPlugins(config);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain("Plugin deprecated");
    }
  });

  it("should validate unknown plugins in entries", async () => {
    const { loadPluginManifestRegistry } = await import("../plugins/manifest-registry.js");
    vi.mocked(loadPluginManifestRegistry).mockReturnValue({
      plugins: [
        { id: "known-plugin", kind: "test", channels: [], origin: "test" }
      ],
      diagnostics: [],
    });

    const config = {
      plugins: {
        entries: {
          "unknown-plugin": { config: {} }
        }
      },
    } as OpenClawConfig;

    const result = validateConfigObjectWithPlugins(config);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].message).toContain("plugin not found: unknown-plugin");
    }
  });

  it("should validate unknown plugins in allow list", async () => {
    const { loadPluginManifestRegistry } = await import("../plugins/manifest-registry.js");
    vi.mocked(loadPluginManifestRegistry).mockReturnValue({
      plugins: [
        { id: "known-plugin", kind: "test", channels: [], origin: "test" }
      ],
      diagnostics: [],
    });

    const config = {
      plugins: {
        allow: ["unknown-plugin"]
      }
    } as OpenClawConfig;

    const result = validateConfigObjectWithPlugins(config);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].message).toContain("plugin not found: unknown-plugin");
    }
  });

  it("should validate unknown plugins in deny list", async () => {
    const { loadPluginManifestRegistry } = await import("../plugins/manifest-registry.js");
    vi.mocked(loadPluginManifestRegistry).mockReturnValue({
      plugins: [
        { id: "known-plugin", kind: "test", channels: [], origin: "test" }
      ],
      diagnostics: [],
    });

    const config = {
      plugins: {
        deny: ["unknown-plugin"]
      }
    } as OpenClawConfig;

    const result = validateConfigObjectWithPlugins(config);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].message).toContain("plugin not found: unknown-plugin");
    }
  });

  it("should validate unknown memory slot plugin", async () => {
    const { loadPluginManifestRegistry } = await import("../plugins/manifest-registry.js");
    vi.mocked(loadPluginManifestRegistry).mockReturnValue({
      plugins: [
        { id: "known-plugin", kind: "test", channels: [], origin: "test" }
      ],
      diagnostics: [],
    });

    const config = {
      plugins: {
        slots: {
          memory: "unknown-memory-plugin"
        }
      }
    } as OpenClawConfig;

    const result = validateConfigObjectWithPlugins(config);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].message).toContain("plugin not found: unknown-memory-plugin");
    }
  });

  it("should validate unknown channel IDs", async () => {
    const { loadPluginManifestRegistry } = await import("../plugins/manifest-registry.js");
    vi.mocked(loadPluginManifestRegistry).mockReturnValue({
      plugins: [
        { id: "test-plugin", kind: "test", channels: ["test-channel"], origin: "test" }
      ],
      diagnostics: [],
    });

    const config = {
      channels: {
        "unknown-channel": {}
      }
    } as OpenClawConfig;

    const result = validateConfigObjectWithPlugins(config);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].message).toContain("unknown channel id: unknown-channel");
    }
  });

  it("should validate heartbeat targets", async () => {
    const { loadPluginManifestRegistry } = await import("../plugins/manifest-registry.js");
    vi.mocked(loadPluginManifestRegistry).mockReturnValue({
      plugins: [],
      diagnostics: [],
    });

    const config = {
      agents: {
        defaults: {
          heartbeat: {
            target: "unknown-target"
          }
        }
      }
    } as OpenClawConfig;

    const result = validateConfigObjectWithPlugins(config);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].message).toContain("unknown heartbeat target: unknown-target");
    }
  });
});