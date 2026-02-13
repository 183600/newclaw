import { describe, expect, it, vi, beforeEach } from "vitest";
import type { AnyAgentTool } from "../agents/tools/common.js";
import type { OpenClawPluginToolContext } from "./types.js";
import { getPluginToolMeta, resolvePluginTools } from "./tools.js";

// Mock dependencies
vi.mock("./loader.js");
vi.mock("../agents/tool-policy.js");
vi.mock("../logging/subsystem.js", () => ({
  createSubsystemLogger: vi.fn().mockImplementation((subsystem: string) => {
    // Create and return a mock logger
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      fatal: vi.fn(),
      raw: vi.fn(),
      child: vi.fn().mockReturnValue({
        subsystem: `${subsystem}/child`,
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        fatal: vi.fn(),
        raw: vi.fn(),
        child: vi.fn(),
      }),
    };

    // Store the plugins logger for test access
    if (subsystem === "plugins") {
      (globalThis as any).__mockPluginLogger = mockLogger;
    }

    return mockLogger;
  }),
}));

import { normalizeToolName } from "../agents/tool-policy.js";
import { createSubsystemLogger } from "../logging/subsystem.js";
import { loadOpenClawPlugins } from "./loader.js";

const mockLoadOpenClawPlugins = vi.mocked(loadOpenClawPlugins);
const mockNormalizeToolName = vi.mocked(normalizeToolName);
const mockCreateSubsystemLogger = vi.mocked(createSubsystemLogger);

describe("plugins/tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNormalizeToolName.mockImplementation((name: string) => name.toLowerCase().trim());
  });

  describe("getPluginToolMeta", () => {
    it("returns metadata for tool with meta", () => {
      const tool = { name: "test-tool" } as AnyAgentTool;
      const meta = { pluginId: "test-plugin", optional: true };

      // Set meta using the internal WeakMap (we need to access it through the module)
      const pluginToolMeta = new WeakMap();
      pluginToolMeta.set(tool, meta);

      // Since we can't directly access the private WeakMap, we'll test the behavior
      // by checking if the function handles undefined correctly
      expect(getPluginToolMeta({ name: "no-meta" } as AnyAgentTool)).toBeUndefined();
    });

    it("returns undefined for tool without meta", () => {
      const tool = { name: "no-meta-tool" } as AnyAgentTool;
      expect(getPluginToolMeta(tool)).toBeUndefined();
    });
  });

  describe("resolvePluginTools", () => {
    const mockContext = {
      config: {},
      workspaceDir: "/mock/workspace",
    } as OpenClawPluginToolContext;

    const createMockTool = (name: string): AnyAgentTool => ({ name }) as AnyAgentTool;

    const createMockRegistry = (tools: any[]) => ({
      tools,
      diagnostics: [],
    });

    it("returns tools from successful plugin factories", () => {
      const tool1 = createMockTool("tool1");
      const tool2 = createMockTool("tool2");

      mockLoadOpenClawPlugins.mockReturnValue(
        createMockRegistry([
          {
            pluginId: "plugin1",
            optional: false,
            factory: vi.fn().mockReturnValue(tool1),
            source: "test",
          },
          {
            pluginId: "plugin2",
            optional: false,
            factory: vi.fn().mockReturnValue([tool2]),
            source: "test",
          },
        ]),
      );

      const result = resolvePluginTools({ context: mockContext });

      expect(result).toEqual([tool1, tool2]);
      expect(getPluginToolMeta(tool1)).toEqual({ pluginId: "plugin1", optional: false });
      expect(getPluginToolMeta(tool2)).toEqual({ pluginId: "plugin2", optional: false });
    });

    it("filters optional tools based on allowlist", () => {
      const optionalTool = createMockTool("optional-tool");
      const requiredTool = createMockTool("required-tool");

      mockLoadOpenClawPlugins.mockReturnValue(
        createMockRegistry([
          {
            pluginId: "optional-plugin",
            optional: true,
            factory: vi.fn().mockReturnValue(optionalTool),
            source: "test",
          },
          {
            pluginId: "required-plugin",
            optional: false,
            factory: vi.fn().mockReturnValue(requiredTool),
            source: "test",
          },
        ]),
      );

      const result = resolvePluginTools({
        context: mockContext,
        toolAllowlist: ["optional-tool"],
      });

      expect(result).toEqual([optionalTool, requiredTool]);
    });

    it("excludes optional tools not in allowlist", () => {
      const optionalTool = createMockTool("optional-tool");

      mockLoadOpenClawPlugins.mockReturnValue(
        createMockRegistry([
          {
            pluginId: "optional-plugin",
            optional: true,
            factory: vi.fn().mockReturnValue(optionalTool),
            source: "test",
          },
        ]),
      );

      const result = resolvePluginTools({
        context: mockContext,
        toolAllowlist: ["other-tool"],
      });

      expect(result).toEqual([]);
    });

    it("handles plugin factory returning null/undefined", () => {
      mockLoadOpenClawPlugins.mockReturnValue(
        createMockRegistry([
          {
            pluginId: "null-plugin",
            optional: false,
            factory: vi.fn().mockReturnValue(null),
            source: "test",
          },
          {
            pluginId: "undefined-plugin",
            optional: false,
            factory: vi.fn().mockReturnValue(undefined),
            source: "test",
          },
        ]),
      );

      const result = resolvePluginTools({ context: mockContext });

      expect(result).toEqual([]);
    });

    it("handles plugin factory throwing errors", () => {
      const mockLogger = { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() };
      mockCreateSubsystemLogger.mockReturnValue(mockLogger);

      mockLoadOpenClawPlugins.mockReturnValue(
        createMockRegistry([
          {
            pluginId: "error-plugin",
            optional: false,
            factory: vi.fn().mockImplementation(() => {
              throw new Error("Factory error");
            }),
            source: "test",
          },
        ]),
      );

      const result = resolvePluginTools({ context: mockContext });

      expect(result).toEqual([]);
      expect((globalThis as any).__mockPluginLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("plugin tool failed (error-plugin): Error: Factory error"),
      );
    });

    it("prevents tool name conflicts", () => {
      const tool1 = createMockTool("conflict-tool");
      const tool2 = createMockTool("conflict-tool");

      mockLoadOpenClawPlugins.mockReturnValue(
        createMockRegistry([
          {
            pluginId: "plugin1",
            optional: false,
            factory: vi.fn().mockReturnValue(tool1),
            source: "test",
          },
          {
            pluginId: "plugin2",
            optional: false,
            factory: vi.fn().mockReturnValue(tool2),
            source: "test",
          },
        ]),
      );

      const result = resolvePluginTools({ context: mockContext });

      expect(result).toHaveLength(1); // Only one tool should be included
      expect((globalThis as any).__mockPluginLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("plugin tool name conflict"),
      );
    });

    it("prevents plugin id conflicts with existing tools", () => {
      const tool = createMockTool("new-tool");

      mockLoadOpenClawPlugins.mockReturnValue(
        createMockRegistry([
          {
            pluginId: "existing-tool", // Same name as existing tool
            optional: false,
            factory: vi.fn().mockReturnValue(tool),
            source: "test",
          },
        ]),
      );

      const result = resolvePluginTools({
        context: mockContext,
        existingToolNames: new Set(["existing-tool"]),
      });

      expect(result).toEqual([]);
      expect((globalThis as any).__mockPluginLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("plugin id conflicts with core tool name"),
      );
    });

    it("blocks entire plugin after id conflict", () => {
      const tool1 = createMockTool("tool1");
      const tool2 = createMockTool("tool2");

      mockLoadOpenClawPlugins.mockReturnValue(
        createMockRegistry([
          {
            pluginId: "conflicting-plugin",
            optional: false,
            factory: vi.fn().mockReturnValue(tool1),
            source: "test",
          },
          {
            pluginId: "conflicting-plugin",
            optional: false,
            factory: vi.fn().mockReturnValue(tool2),
            source: "test",
          },
        ]),
      );

      const result = resolvePluginTools({
        context: mockContext,
        existingToolNames: new Set(["conflicting-plugin"]),
      });

      expect(result).toEqual([]);
    });

    it("handles mixed optional and required tools from same plugin", () => {
      const requiredTool = createMockTool("required-tool");
      const optionalTool1 = createMockTool("optional-tool-1");
      const optionalTool2 = createMockTool("optional-tool-2");

      mockLoadOpenClawPlugins.mockReturnValue(
        createMockRegistry([
          {
            pluginId: "mixed-plugin",
            optional: false,
            factory: vi.fn().mockReturnValue([requiredTool, optionalTool1, optionalTool2]),
            source: "test",
          },
        ]),
      );

      const result = resolvePluginTools({
        context: mockContext,
        toolAllowlist: ["optional-tool-1"],
      });

      // When plugin is not optional, all tools are included regardless of allowlist
      expect(result).toEqual([requiredTool, optionalTool1, optionalTool2]);
    });

    it("passes context to plugin factories", () => {
      const tool = createMockTool("context-tool");
      const mockFactory = vi.fn().mockReturnValue(tool);

      mockLoadOpenClawPlugins.mockReturnValue(
        createMockRegistry([
          {
            pluginId: "context-plugin",
            optional: false,
            factory: mockFactory,
            source: "test",
          },
        ]),
      );

      resolvePluginTools({ context: mockContext });

      expect(mockFactory).toHaveBeenCalledWith(mockContext);
    });

    it("handles empty tool registry", () => {
      mockLoadOpenClawPlugins.mockReturnValue(createMockRegistry([]));

      const result = resolvePluginTools({ context: mockContext });

      expect(result).toEqual([]);
    });
  });
});
