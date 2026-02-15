import type { OpenClawConfig } from "../config/config.js";
import type { PluginRecord } from "./registry.js";
import type { PluginKind } from "./types.js";
import { defaultSlotIdForKey } from "./slots.js";

export type NormalizedPluginsConfig = {
  enabled: boolean;
  allow: string[];
  deny: string[];
  loadPaths: string[];
  slots: {
    memory?: string | null;
  };
  entries: Record<string, { enabled?: boolean; config?: unknown }>;
};

export const BUNDLED_ENABLED_BY_DEFAULT = new Set<string>();

const normalizeList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((entry) => (typeof entry === "string" ? entry.trim() : "")).filter(Boolean);
};

const normalizeSlotValue = (value: unknown): string | null | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.toLowerCase() === "none") {
    return null;
  }
  return trimmed;
};

const normalizePluginEntries = (entries: unknown): NormalizedPluginsConfig["entries"] => {
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
    return {};
  }
  const normalized: NormalizedPluginsConfig["entries"] = {};
  for (const [key, value] of Object.entries(entries)) {
    if (!key.trim()) {
      continue;
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      normalized[key] = {};
      continue;
    }
    const entry = value as Record<string, unknown>;
    // Handle various boolean conversions
    let enabled: boolean | undefined;
    if (typeof entry.enabled === "boolean") {
      enabled = entry.enabled;
    } else if (entry.enabled === 1) {
      enabled = true;
    } else if (entry.enabled === 0) {
      enabled = false;
    } else {
      enabled = undefined;
    }
    normalized[key] = {
      enabled,
      config: "config" in entry ? entry.config : undefined,
    };
  }
  return normalized;
};

export const normalizePluginsConfig = (
  config?: OpenClawConfig["plugins"] & { loadPaths?: unknown },
): NormalizedPluginsConfig => {
  const memorySlot = normalizeSlotValue(config?.slots?.memory);
  // Support both loadPaths (direct) and load.paths (nested) for backward compatibility
  const loadPaths = config?.loadPaths !== undefined ? config.loadPaths : config?.load?.paths;
  // Check if config is explicitly provided but empty (e.g., {} passed explicitly)
  const isEmpty = config !== undefined && Object.keys(config).length === 0;
  // Check if memory slot is explicitly configured
  const hasExplicitMemorySlot =
    config?.slots && Object.prototype.hasOwnProperty.call(config.slots, "memory");
  return {
    enabled: isEmpty ? false : config?.enabled !== false,
    allow: normalizeList(config?.allow),
    deny: normalizeList(config?.deny),
    loadPaths: normalizeList(loadPaths),
    slots: {
      memory: memorySlot === undefined ? defaultSlotIdForKey("memory") : memorySlot,
    },
    entries: normalizePluginEntries(config?.entries),
  };
};

const hasExplicitMemorySlot = (plugins?: OpenClawConfig["plugins"]) =>
  Boolean(plugins?.slots && Object.prototype.hasOwnProperty.call(plugins.slots, "memory"));

const hasExplicitMemoryEntry = (plugins?: OpenClawConfig["plugins"]) =>
  Boolean(plugins?.entries && Object.prototype.hasOwnProperty.call(plugins.entries, "memory-core"));

const hasExplicitPluginConfig = (plugins?: OpenClawConfig["plugins"]) => {
  if (!plugins) {
    return false;
  }
  if (typeof plugins.enabled === "boolean") {
    return true;
  }
  if (Array.isArray(plugins.allow) && plugins.allow.length > 0) {
    return true;
  }
  if (Array.isArray(plugins.deny) && plugins.deny.length > 0) {
    return true;
  }
  if (plugins.load?.paths && Array.isArray(plugins.load.paths) && plugins.load.paths.length > 0) {
    return true;
  }
  if (plugins.slots && Object.keys(plugins.slots).length > 0) {
    return true;
  }
  if (plugins.entries && Object.keys(plugins.entries).length > 0) {
    return true;
  }
  return false;
};

export function applyTestPluginDefaults(
  cfg: OpenClawConfig,
  env: NodeJS.ProcessEnv = process.env,
): OpenClawConfig {
  if (!env.VITEST) {
    return cfg;
  }
  const plugins = cfg.plugins;
  const explicitConfig = hasExplicitPluginConfig(plugins);
  if (explicitConfig) {
    if (hasExplicitMemorySlot(plugins) || hasExplicitMemoryEntry(plugins)) {
      return cfg;
    }
    return {
      ...cfg,
      plugins: {
        ...plugins,
        slots: {
          ...plugins?.slots,
          memory: "none",
        },
      },
    };
  }

  return {
    ...cfg,
    plugins: {
      ...plugins,
      enabled: false,
      slots: {
        ...plugins?.slots,
        memory: "none",
      },
    },
  };
}

export function isTestDefaultMemorySlotDisabled(
  cfg: OpenClawConfig,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (!env.VITEST) {
    return false;
  }
  const plugins = cfg.plugins;
  if (hasExplicitMemorySlot(plugins) || hasExplicitMemoryEntry(plugins)) {
    return false;
  }
  return true;
}

export function resolveEnableState(pluginId: string, config: NormalizedPluginsConfig): boolean {
  if (!config.enabled) {
    return false;
  }
  if (config.deny.includes(pluginId)) {
    return false;
  }
  if (config.allow.length > 0 && !config.allow.includes(pluginId) && !config.allow.includes("*")) {
    return false;
  }
  const entry = config.entries[pluginId];
  if (entry?.enabled === true) {
    return true;
  }
  if (entry?.enabled === false) {
    return false;
  }
  // If allow list contains "*", allow by default unless explicitly disabled
  if (config.allow.includes("*")) {
    return entry?.enabled !== false;
  }
  return true;
}

// Legacy interface for backward compatibility
interface LegacyMemoryDecisionParams {
  id: string;
  kind?: PluginKind;
  slot?: string;
  selectedId?: string;
}

export function resolveMemorySlotDecisionLegacy(params: LegacyMemoryDecisionParams): {
  enabled: boolean;
  selected: boolean;
  reason: string;
};

export function resolveMemorySlotDecisionLegacy(
  plugin: Partial<PluginRecord>,
  config: NormalizedPluginsConfig,
  originalConfig?: OpenClawConfig["plugins"] & { loadPaths?: unknown },
): { slotId: string | null; reason: string };

export function resolveMemorySlotDecisionLegacy(
  arg1: Partial<PluginRecord> | LegacyMemoryDecisionParams,
  config?: NormalizedPluginsConfig,
  originalConfig?: OpenClawConfig["plugins"] & { loadPaths?: unknown },
):
  | { slotId: string | null; reason: string }
  | { enabled: boolean; selected: boolean; reason: string } {
  // Legacy interface detection
  if (!config && "id" in arg1 && !("manifest" in arg1)) {
    // Legacy interface
    const params = arg1 as LegacyMemoryDecisionParams;
    const enabled = params.slot === params.selectedId;
    const selected = params.slot === params.selectedId && params.kind === "memory";

    if (!enabled) {
      return { enabled: false, selected: false, reason: "not-selected" };
    }

    return { enabled: true, selected, reason: selected ? "selected" : "enabled" };
  }

  // New interface
  const plugin = arg1 as Partial<PluginRecord>;
  if (!config) {
    throw new Error("config is required for new interface");
  }

  // Check if plugin has memory slots
  if (!(plugin as any).manifest?.memorySlots || (plugin as any).manifest.memorySlots.length === 0) {
    return { slotId: null, reason: "no-slots" };
  }

  // Check if memory is disabled
  if (config.slots.memory === null) {
    return { slotId: null, reason: "disabled" };
  }

  // Check if memory slot was explicitly configured
  const hasExplicitMemorySlot =
    originalConfig?.slots && Object.prototype.hasOwnProperty.call(originalConfig.slots, "memory");

  // Use configured slot or default
  const slotId = config.slots.memory || "memory-core";
  const reason = hasExplicitMemorySlot ? "configured" : "default";

  return { slotId, reason };
}

export function resolveMemorySlotDecision(
  pluginOrParams:
    | Partial<PluginRecord>
    | { id: string; kind?: PluginKind; slot?: string; selectedId?: string },
  config?: NormalizedPluginsConfig,
  originalConfig?: OpenClawConfig["plugins"] & { loadPaths?: unknown },
): { enabled: boolean; selected?: boolean; slotId?: string | null; reason?: string } {
  // Check if the first parameter is the old format
  if ("id" in pluginOrParams && !("manifest" in pluginOrParams)) {
    // Old format: { id, kind, slot, selectedId }
    const params = pluginOrParams as {
      id: string;
      kind?: PluginKind;
      slot?: string;
      selectedId?: string;
    };

    // For non-memory plugins, always return enabled: true
    if (params.kind !== "memory") {
      return { enabled: true, selected: false, reason: "non-memory" };
    }

    // For memory plugins, use the original logic
    let enabled = false;
    let selected = false;

    if (params.selectedId === null || params.selectedId === undefined) {
      // No plugin selected yet, only enable if this plugin matches the slot
      enabled = params.slot === params.id;
      selected = enabled;
    } else {
      // Plugin already selected, only enable if this is the selected one
      enabled = params.id === params.selectedId;
      selected = enabled;
    }

    if (!enabled) {
      return { enabled: false, selected: false, reason: "not-selected" };
    }

    return { enabled: true, selected, reason: selected ? "selected" : "enabled" };
  }
  // New format: plugin record
  const plugin = pluginOrParams as Partial<PluginRecord>;
  const decision = resolveMemorySlotDecisionLegacy(plugin, config!, originalConfig);
  return {
    enabled: decision.slotId !== null,
    selected: decision.reason === "configured",
    slotId: decision.slotId,
    reason: decision.reason,
  };
}
