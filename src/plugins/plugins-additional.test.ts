import { describe, expect, it } from "vitest";
import type { PluginRecord } from "./registry.js";
import {
  normalizePluginsConfig,
  resolveEnableState,
  resolveMemorySlotDecision,
} from "./config-state.js";

describe("plugins config-state - additional edge cases", () => {
  describe("normalizePluginsConfig", () => {
    it("handles malformed allow/deny lists", () => {
      const testCases = [
        { allow: null, expected: [] },
        { allow: undefined, expected: [] },
        { allow: "not-an-array", expected: [] },
        { allow: [123, null, undefined, "", "  ", "valid"], expected: ["valid"] },
        { deny: [true, false, {}, [], "valid"], expected: ["valid"] },
      ];

      testCases.forEach(({ allow, deny, expected }) => {
        const config: Record<string, unknown> = {};
        if (allow !== undefined) {
          config.allow = allow;
        }
        if (deny !== undefined) {
          config.deny = deny;
        }

        const result = normalizePluginsConfig(config);

        if (allow !== undefined) {
          expect(result.allow).toEqual(expected);
        }
        if (deny !== undefined) {
          expect(result.deny).toEqual(expected);
        }
      });
    });

    it("handles malformed load paths", () => {
      const testCases = [
        { loadPaths: null, expected: [] },
        { loadPaths: undefined, expected: [] },
        { loadPaths: "not-an-array", expected: [] },
        { loadPaths: ["path1", "", "  ", null, undefined, "path2"], expected: ["path1", "path2"] },
      ];

      testCases.forEach(({ loadPaths, expected }) => {
        const result = normalizePluginsConfig({ loadPaths });
        expect(result.loadPaths).toEqual(expected);
      });
    });

    it("handles complex plugin entries", () => {
      const config = {
        entries: {
          plugin1: { enabled: true, config: { key: "value" } },
          plugin2: { enabled: false },
          plugin3: { config: { nested: { value: 123 } } },
          "": { enabled: true }, // Should be ignored
          "  ": { enabled: true }, // Should be ignored
          plugin5: "invalid-value", // Should be normalized to empty object
          plugin6: null, // Should be normalized to empty object
          plugin7: undefined, // Should be normalized to empty object
        },
      };

      const result = normalizePluginsConfig(config);

      expect(result.entries["plugin1"]).toEqual({ enabled: true, config: { key: "value" } });
      expect(result.entries["plugin2"]).toEqual({ enabled: false });
      expect(result.entries["plugin3"]).toEqual({ config: { nested: { value: 123 } } });
      expect(result.entries["plugin5"]).toEqual({});
      expect(result.entries["plugin6"]).toEqual({});
      expect(result.entries["plugin7"]).toEqual({});
      expect(result.entries[""]).toBeUndefined();
      expect(result.entries["  "]).toBeUndefined();
    });

    it("handles all boolean values for enabled flag", () => {
      const config = {
        entries: {
          plugin1: { enabled: true },
          plugin2: { enabled: false },
          plugin3: { enabled: "true" }, // Should be treated as falsy
          plugin4: { enabled: 1 }, // Should be treated as truthy
          plugin5: { enabled: 0 }, // Should be treated as falsy
        },
      };

      const result = normalizePluginsConfig(config);

      expect(result.entries["plugin1"].enabled).toBe(true);
      expect(result.entries["plugin2"].enabled).toBe(false);
      expect(result.entries["plugin3"].enabled).toBeUndefined();
      expect(result.entries["plugin4"].enabled).toBe(true);
      expect(result.entries["plugin5"].enabled).toBe(false);
    });

    it("handles complex slot configurations", () => {
      const config = {
        slots: {
          memory: "custom-memory",
          // Future slots could be added here
        },
      };

      const result = normalizePluginsConfig(config);

      expect(result.slots.memory).toBe("custom-memory");
    });

    it("handles completely empty config", () => {
      const result = normalizePluginsConfig({});
      expect(result.enabled).toBe(false);
      expect(result.allow).toEqual([]);
      expect(result.deny).toEqual([]);
      expect(result.loadPaths).toEqual([]);
      expect(result.slots.memory).toBe("memory-core");
      expect(result.entries).toEqual({});
    });
  });

  describe("resolveEnableState", () => {
    it("handles various plugin configurations", () => {
      const pluginsConfig = normalizePluginsConfig({
        enabled: true,
        allow: ["plugin1", "plugin2"],
        deny: ["plugin3"],
        entries: {
          plugin1: { enabled: true },
          plugin2: { enabled: false },
          plugin4: { enabled: true },
        },
      });

      const testCases = [
        { pluginId: "plugin1", expected: true }, // In allow list, explicitly enabled
        { pluginId: "plugin2", expected: false }, // In allow list, explicitly disabled
        { pluginId: "plugin3", expected: false }, // In deny list
        { pluginId: "plugin4", expected: false }, // Not in allow list
        { pluginId: "plugin5", expected: false }, // Not configured
      ];

      testCases.forEach(({ pluginId, expected }) => {
        expect(resolveEnableState(pluginId, pluginsConfig)).toBe(expected);
      });
    });

    it("handles disabled plugins config", () => {
      const pluginsConfig = normalizePluginsConfig({
        enabled: false,
        entries: {
          plugin1: { enabled: true },
        },
      });

      expect(resolveEnableState("plugin1", pluginsConfig)).toBe(false);
      expect(resolveEnableState("plugin2", pluginsConfig)).toBe(false);
    });

    it("handles allow all configuration", () => {
      const pluginsConfig = normalizePluginsConfig({
        enabled: true,
        allow: ["*"],
        entries: {
          plugin1: { enabled: false },
          plugin2: { enabled: true },
        },
      });

      expect(resolveEnableState("plugin1", pluginsConfig)).toBe(false);
      expect(resolveEnableState("plugin2", pluginsConfig)).toBe(true);
      expect(resolveEnableState("plugin3", pluginsConfig)).toBe(true);
    });

    it("handles empty allow list", () => {
      const pluginsConfig = normalizePluginsConfig({
        enabled: true,
        allow: [],
        entries: {
          plugin1: { enabled: true },
        },
      });

      expect(resolveEnableState("plugin1", pluginsConfig)).toBe(true);
      expect(resolveEnableState("plugin2", pluginsConfig)).toBe(true);
    });
  });

  describe("resolveMemorySlotDecision", () => {
    it("resolves memory slot for plugin", () => {
      const originalConfig = {
        slots: { memory: "custom-memory" },
      };
      const pluginsConfig = normalizePluginsConfig(originalConfig);

      const plugin: Partial<PluginRecord> = {
        id: "test-plugin",
        manifest: {
          memorySlots: ["slot1", "slot2"],
        },
      };

      const decision = resolveMemorySlotDecision(plugin, pluginsConfig, originalConfig);
      expect(decision.slotId).toBe("custom-memory");
      expect(decision.reason).toBe("configured");
    });

    it("uses default slot when none configured", () => {
      const originalConfig = {};
      const pluginsConfig = normalizePluginsConfig(originalConfig);

      const plugin: Partial<PluginRecord> = {
        id: "test-plugin",
        manifest: {
          memorySlots: ["slot1", "slot2"],
        },
      };

      const decision = resolveMemorySlotDecision(plugin, pluginsConfig, originalConfig);
      expect(decision.slotId).toBe("memory-core");
      expect(decision.reason).toBe("default");
    });

    it("returns none when memory is disabled", () => {
      const originalConfig = {
        slots: { memory: "none" },
      };
      const pluginsConfig = normalizePluginsConfig(originalConfig);

      const plugin: Partial<PluginRecord> = {
        id: "test-plugin",
        manifest: {
          memorySlots: ["slot1", "slot2"],
        },
      };

      const decision = resolveMemorySlotDecision(plugin, pluginsConfig, originalConfig);
      expect(decision.slotId).toBeNull();
      expect(decision.reason).toBe("disabled");
    });

    it("handles plugin without memory slots", () => {
      const originalConfig = {
        slots: { memory: "custom-memory" },
      };
      const pluginsConfig = normalizePluginsConfig(originalConfig);

      const plugin: Partial<PluginRecord> = {
        id: "test-plugin",
        manifest: {
          // No memorySlots defined
        },
      };

      const decision = resolveMemorySlotDecision(plugin, pluginsConfig, originalConfig);
      expect(decision.slotId).toBeNull();
      expect(decision.reason).toBe("no-slots");
    });

    it("handles plugin without manifest", () => {
      const originalConfig = {
        slots: { memory: "custom-memory" },
      };
      const pluginsConfig = normalizePluginsConfig(originalConfig);

      const plugin: Partial<PluginRecord> = {
        id: "test-plugin",
        manifest: undefined,
      };

      const decision = resolveMemorySlotDecision(plugin, pluginsConfig, originalConfig);
      expect(decision.slotId).toBeNull();
      expect(decision.reason).toBe("no-slots");
    });
  });

  describe("integration tests", () => {
    it("handles complex plugin configuration scenario", () => {
      const config = {
        enabled: true,
        allow: ["plugin1", "plugin2", "plugin3"],
        deny: ["plugin4"],
        loadPaths: ["/path/to/plugins", "/another/path"],
        slots: {
          memory: "custom-memory",
        },
        entries: {
          plugin1: { enabled: true, config: { setting: "value1" } },
          plugin2: { enabled: false },
          plugin3: { config: { setting: "value3" } },
        },
      };

      const pluginsConfig = normalizePluginsConfig(config);

      // Test overall structure
      expect(pluginsConfig.enabled).toBe(true);
      expect(pluginsConfig.allow).toEqual(["plugin1", "plugin2", "plugin3"]);
      expect(pluginsConfig.deny).toEqual(["plugin4"]);
      expect(pluginsConfig.loadPaths).toEqual(["/path/to/plugins", "/another/path"]);
      expect(pluginsConfig.slots.memory).toBe("custom-memory");

      // Test individual plugin states
      expect(resolveEnableState("plugin1", pluginsConfig)).toBe(true);
      expect(resolveEnableState("plugin2", pluginsConfig)).toBe(false);
      expect(resolveEnableState("plugin3", pluginsConfig)).toBe(true);
      expect(resolveEnableState("plugin4", pluginsConfig)).toBe(false);
      expect(resolveEnableState("plugin5", pluginsConfig)).toBe(false);

      // Test memory slot resolution
      const pluginWithMemory: Partial<PluginRecord> = {
        id: "plugin1",
        manifest: { memorySlots: ["slot1"] },
      };
      const memoryDecision = resolveMemorySlotDecision(pluginWithMemory, pluginsConfig, config);
      expect(memoryDecision.slotId).toBe("custom-memory");
    });

    it("handles edge case with conflicting configurations", () => {
      const config = {
        enabled: true,
        allow: ["plugin1"],
        deny: ["plugin1"], // Conflict: plugin1 is both allowed and denied
        entries: {
          plugin1: { enabled: true },
        },
      };

      const pluginsConfig = normalizePluginsConfig(config);

      // Deny should take precedence
      expect(resolveEnableState("plugin1", pluginsConfig)).toBe(false);
    });

    it("handles wildcard allow with specific denies", () => {
      const config = {
        enabled: true,
        allow: ["*"],
        deny: ["plugin2", "plugin3"],
        entries: {
          plugin1: { enabled: true },
          plugin2: { enabled: true },
          plugin4: { enabled: false },
        },
      };

      const pluginsConfig = normalizePluginsConfig(config);

      expect(resolveEnableState("plugin1", pluginsConfig)).toBe(true);
      expect(resolveEnableState("plugin2", pluginsConfig)).toBe(false); // Deny takes precedence
      expect(resolveEnableState("plugin3", pluginsConfig)).toBe(false); // Deny takes precedence
      expect(resolveEnableState("plugin4", pluginsConfig)).toBe(false);
      expect(resolveEnableState("plugin5", pluginsConfig)).toBe(true); // Not explicitly denied
    });
  });
});
