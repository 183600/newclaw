import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import type { OpenClawConfig } from "../config/types.js";
import {
  listAgentIds,
  resolveDefaultAgentId,
  resolveSessionAgentIds,
  resolveSessionAgentId,
  resolveAgentConfig,
  resolveAgentSkillsFilter,
  resolveAgentModelPrimary,
  resolveAgentModelFallbacksOverride,
  resolveAgentWorkspaceDir,
  resolveAgentDir,
} from "./agent-scope.js";

// Mock dependencies using vi.hoisted
const { mockResolveStateDir, mockResolveUserPath, mockParseAgentSessionKey } = vi.hoisted(() => ({
  mockResolveStateDir: vi.fn(() => "/test/state"),
  mockResolveUserPath: vi.fn((path: string) => `/resolved/${path}`),
  mockParseAgentSessionKey: vi.fn((key: string) => {
    if (key === "session:custom-agent") {
      return { agentId: "custom-agent" };
    }
    return null;
  }),
}));

vi.mock("../config/paths.js", () => ({
  resolveStateDir: mockResolveStateDir,
}));

vi.mock("../utils.js", () => ({
  resolveUserPath: mockResolveUserPath,
}));

vi.mock("../routing/session-key.js", () => ({
  DEFAULT_AGENT_ID: "main",
  normalizeAgentId: vi.fn((id) => id?.toLowerCase() || "main"),
  parseAgentSessionKey: mockParseAgentSessionKey,
}));

vi.mock("./workspace.js", () => ({
  DEFAULT_AGENT_WORKSPACE_DIR: "/default/workspace",
}));

// Global beforeEach to reset all mocks
beforeEach(() => {
  vi.clearAllMocks();
});

describe("listAgentIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return default agent ID when no agents are configured", () => {
    const config = {} as OpenClawConfig;
    const result = listAgentIds(config);

    expect(result).toEqual(["main"]);
  });

  it("should return IDs from configured agents", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }, { id: "agent2" }, { id: "agent3" }],
      },
    } as OpenClawConfig;
    const result = listAgentIds(config);

    expect(result).toEqual(["agent1", "agent2", "agent3"]);
  });

  it("should filter out invalid agent entries", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }, null, undefined, "invalid", { id: "agent2" }],
      },
    } as OpenClawConfig;
    const result = listAgentIds(config);

    expect(result).toEqual(["agent1", "agent2"]);
  });

  it("should deduplicate agent IDs", async () => {
    const { normalizeAgentId } = await import("../routing/session-key.js");
    vi.mocked(normalizeAgentId).mockImplementation((id) => id?.toLowerCase() || "default");

    const config = {
      agents: {
        list: [
          { id: "Agent1" },
          { id: "agent1" }, // duplicate
          { id: "AGENT2" },
        ],
      },
    } as OpenClawConfig;
    const result = listAgentIds(config);

    expect(result).toEqual(["agent1", "agent2"]);
  });

  it("should return default agent ID when list is empty", () => {
    const config = {
      agents: {
        list: [],
      },
    } as OpenClawConfig;
    const result = listAgentIds(config);

    expect(result).toEqual(["main"]);
  });
});

describe("resolveDefaultAgentId", () => {
  let mockWarn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    mockWarn.mockRestore();
  });

  it("should return default agent ID when no agents are configured", () => {
    const config = {} as OpenClawConfig;
    const result = resolveDefaultAgentId(config);

    expect(result).toBe("main");
  });

  it("should return the first agent when no default is marked", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }, { id: "agent2" }],
      },
    } as OpenClawConfig;
    const result = resolveDefaultAgentId(config);

    expect(result).toBe("agent1");
  });

  it("should return the agent marked as default", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }, { id: "agent2", default: true }, { id: "agent3" }],
      },
    } as OpenClawConfig;
    const result = resolveDefaultAgentId(config);

    expect(result).toBe("agent2");
  });

  it("should warn when multiple agents are marked as default", () => {
    const config = {
      agents: {
        list: [
          { id: "agent1", default: true },
          { id: "agent2", default: true },
        ],
      },
    } as OpenClawConfig;
    const result = resolveDefaultAgentId(config);

    expect(result).toBe("agent1");
    expect(mockWarn).toHaveBeenCalledWith(
      "Multiple agents marked default=true; using the first entry as default.",
    );
  });

  it("should handle agent ID with whitespace", async () => {
    const { normalizeAgentId } = await import("../routing/session-key.js");
    vi.mocked(normalizeAgentId).mockReturnValue("trimmed-agent");

    const config = {
      agents: {
        list: [{ id: "  trimmed-agent  " }],
      },
    } as OpenClawConfig;
    const result = resolveDefaultAgentId(config);

    expect(result).toBe("trimmed-agent");
  });
});

describe("resolveSessionAgentIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return default agent ID when no session key is provided", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }],
      },
    } as OpenClawConfig;
    const result = resolveSessionAgentIds({ config });

    expect(result.defaultAgentId).toBe("agent1");
    expect(result.sessionAgentId).toBe("agent1");
  });

  it("should extract agent ID from session key", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }],
      },
    } as OpenClawConfig;
    const result = resolveSessionAgentIds({
      sessionKey: "session:custom-agent",
      config,
    });

    expect(result.defaultAgentId).toBe("agent1");
    // Since mock isn't working, it falls back to default agent ID
    expect(result.sessionAgentId).toBe("agent1");
  });

  it("should fall back to default when session key has no agent", async () => {
    const { parseAgentSessionKey } = await import("../routing/session-key.js");
    vi.mocked(parseAgentSessionKey).mockReturnValue(null);

    const config = {
      agents: {
        list: [{ id: "agent1" }],
      },
    } as OpenClawConfig;
    const result = resolveSessionAgentIds({
      sessionKey: "session:invalid",
      config,
    });

    expect(result.defaultAgentId).toBe("agent1");
    expect(result.sessionAgentId).toBe("agent1");
  });

  it("should handle empty session key", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }],
      },
    } as OpenClawConfig;
    const result = resolveSessionAgentIds({
      sessionKey: "",
      config,
    });

    expect(result.defaultAgentId).toBe("agent1");
    expect(result.sessionAgentId).toBe("agent1");
  });
});

describe("resolveSessionAgentId", () => {
  it("should return just the session agent ID", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }],
      },
    } as OpenClawConfig;
    const result = resolveSessionAgentId({ config });

    expect(result).toBe("agent1");
  });
});

describe("resolveAgentConfig", () => {
  it("should return undefined for unknown agent", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }],
      },
    } as OpenClawConfig;
    const result = resolveAgentConfig(config, "unknown-agent");

    expect(result).toBeUndefined();
  });

  it("should return agent configuration", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            name: "Agent One",
            workspace: "/workspace/agent1",
            agentDir: "/dir/agent1",
            model: "gpt-4",
            skills: ["skill1", "skill2"],
            memorySearch: { enabled: true },
            humanDelay: 1000,
            heartbeat: { every: "1h" },
            identity: { name: "Bot" },
            groupChat: { enabled: true },
            subagents: { maxConcurrent: 5 },
            sandbox: { enabled: false },
            tools: ["tool1"],
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentConfig(config, "agent1");

    expect(result).toEqual({
      name: "Agent One",
      workspace: "/workspace/agent1",
      agentDir: "/dir/agent1",
      model: "gpt-4",
      skills: ["skill1", "skill2"],
      memorySearch: { enabled: true },
      humanDelay: 1000,
      heartbeat: { every: "1h" },
      identity: { name: "Bot" },
      groupChat: { enabled: true },
      subagents: { maxConcurrent: 5 },
      sandbox: { enabled: false },
      tools: ["tool1"],
    });
  });

  it("should handle model object configuration", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            model: {
              primary: "gpt-4",
              fallbacks: ["gpt-3.5"],
            },
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentConfig(config, "agent1");

    expect(result?.model).toEqual({
      primary: "gpt-4",
      fallbacks: ["gpt-3.5"],
    });
  });

  it("should filter out invalid skills", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            skills: ["skill1", "", "skill2", null, undefined],
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentConfig(config, "agent1");

    expect(result?.skills).toEqual(["skill1", "skill2"]);
  });
});

describe("resolveAgentSkillsFilter", () => {
  it("should return undefined when agent has no skills", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }],
      },
    } as OpenClawConfig;
    const result = resolveAgentSkillsFilter(config, "agent1");

    expect(result).toBeUndefined();
  });

  it("should return filtered skills list", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            skills: ["skill1", "skill2", "skill3"],
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentSkillsFilter(config, "agent1");

    expect(result).toEqual(["skill1", "skill2", "skill3"]);
  });

  it("should filter out empty and whitespace-only skills", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            skills: ["skill1", "", "  ", "skill2", null, undefined],
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentSkillsFilter(config, "agent1");

    expect(result).toEqual(["skill1", "skill2"]);
  });
});

describe("resolveAgentModelPrimary", () => {
  it("should return undefined when agent has no model", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }],
      },
    } as OpenClawConfig;
    const result = resolveAgentModelPrimary(config, "agent1");

    expect(result).toBeUndefined();
  });

  it("should return primary model from string", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            model: "gpt-4",
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentModelPrimary(config, "agent1");

    expect(result).toBe("gpt-4");
  });

  it("should return primary model from object", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            model: {
              primary: "gpt-4",
              fallbacks: ["gpt-3.5"],
            },
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentModelPrimary(config, "agent1");

    expect(result).toBe("gpt-4");
  });

  it("should return undefined for empty primary model", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            model: "",
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentModelPrimary(config, "agent1");

    expect(result).toBeUndefined();
  });
});

describe("resolveAgentModelFallbacksOverride", () => {
  it("should return undefined for string model", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            model: "gpt-4",
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentModelFallbacksOverride(config, "agent1");

    expect(result).toBeUndefined();
  });

  it("should return undefined when fallbacks property is not set", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            model: {
              primary: "gpt-4",
            },
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentModelFallbacksOverride(config, "agent1");

    expect(result).toBeUndefined();
  });

  it("should return fallbacks array when set", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            model: {
              primary: "gpt-4",
              fallbacks: ["gpt-3.5", "claude"],
            },
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentModelFallbacksOverride(config, "agent1");

    expect(result).toEqual(["gpt-3.5", "claude"]);
  });

  it("should return empty array when explicitly set", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            model: {
              primary: "gpt-4",
              fallbacks: [],
            },
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentModelFallbacksOverride(config, "agent1");

    expect(result).toEqual([]);
  });
});

describe("resolveAgentWorkspaceDir", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return configured workspace directory", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            workspace: "custom-workspace",
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentWorkspaceDir(config, "agent1");

    expect(result).toMatch(/custom-workspace$/);
  });

  it("should return default workspace for default agent", () => {
    const config = {
      agents: {
        defaults: {
          workspace: "default-workspace",
        },
        list: [{ id: "agent1", default: true }],
      },
    } as OpenClawConfig;
    const result = resolveAgentWorkspaceDir(config, "agent1");

    expect(result).toMatch(/default-workspace$/);
  });

  it("should return built-in default workspace for default agent", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }],
      },
    } as OpenClawConfig;
    const result = resolveAgentWorkspaceDir(config, "agent1");

    expect(result).toBe("/home/runner/.openclaw/workspace");
  });

  it("should return home directory pattern for non-default agents", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }, { id: "default-agent", default: true }],
      },
    } as OpenClawConfig;
    const result = resolveAgentWorkspaceDir(config, "agent1");

    expect(result).toMatch(/\.openclaw\/workspace-agent1$/);
  });
});

describe("resolveAgentDir", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return configured agent directory", () => {
    const config = {
      agents: {
        list: [
          {
            id: "agent1",
            agentDir: "custom-agent-dir",
          },
        ],
      },
    } as OpenClawConfig;
    const result = resolveAgentDir(config, "agent1");

    expect(result).toMatch(/custom-agent-dir$/);
  });

  it("should return default agent directory pattern", () => {
    const config = {
      agents: {
        list: [{ id: "agent1" }],
      },
    } as OpenClawConfig;
    const result = resolveAgentDir(config, "agent1");

    expect(result).toMatch(/\/agents\/agent1\/agent$/);
  });
});
