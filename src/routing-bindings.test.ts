import { describe, expect, it, vi } from "vitest";
import type { OpenClawConfig } from "./config/types.js";
import {
  listBindings,
  listBoundAccountIds,
  resolveDefaultAgentBoundAccountId,
  buildChannelAccountBindings,
} from "./routing/bindings.js";

// Mock the module using hoisted
const mockResolveDefaultAgentId = vi.fn(() => "default-agent");
vi.mock("./agents/agent-scope.js", () => ({
  resolveDefaultAgentId: mockResolveDefaultAgentId,
}));

describe("routing bindings", () => {
  const createMockConfig = (bindings: unknown[] = []): OpenClawConfig =>
    ({
      bindings,
    }) as OpenClawConfig;

  describe("listBindings", () => {
    it("returns empty array when no bindings", () => {
      const cfg = createMockConfig();
      expect(listBindings(cfg)).toEqual([]);
    });

    it("returns empty array when bindings is not array", () => {
      const cfg = { bindings: null } as unknown;
      expect(listBindings(cfg)).toEqual([]);

      const cfg2 = { bindings: "not-array" } as unknown;
      expect(listBindings(cfg2)).toEqual([]);
    });

    it("returns bindings array when valid", () => {
      const bindings = [{ agentId: "agent1", match: { channel: "telegram" } }];
      const cfg = createMockConfig(bindings);
      expect(listBindings(cfg)).toEqual(bindings);
    });
  });

  describe("listBoundAccountIds", () => {
    it("returns empty array for invalid channel", () => {
      const cfg = createMockConfig();
      expect(listBoundAccountIds(cfg, "")).toEqual([]);
      expect(listBoundAccountIds(cfg, null as unknown)).toEqual([]);
      expect(listBoundAccountIds(cfg, undefined as unknown)).toEqual([]);
    });

    it("returns empty array when no bindings", () => {
      const cfg = createMockConfig();
      expect(listBoundAccountIds(cfg, "telegram")).toEqual([]);
    });

    it("filters by channel and excludes wildcards", () => {
      const bindings = [
        { agentId: "agent1", match: { channel: "telegram", accountId: "account1" } },
        { agentId: "agent2", match: { channel: "telegram", accountId: "*" } },
        { agentId: "agent3", match: { channel: "discord", accountId: "account2" } },
        { agentId: "agent4", match: { channel: "telegram", accountId: "account3" } },
      ];
      const cfg = createMockConfig(bindings);

      const result = listBoundAccountIds(cfg, "telegram");
      expect(result).toEqual(["account1", "account3"]);
    });

    it("handles case insensitive channel matching", () => {
      const bindings = [
        { agentId: "agent1", match: { channel: "Telegram", accountId: "account1" } },
        { agentId: "agent2", match: { channel: "TELEGRAM", accountId: "account2" } },
      ];
      const cfg = createMockConfig(bindings);

      const result = listBoundAccountIds(cfg, "telegram");
      expect(result).toEqual(["account1", "account2"]);
    });

    it("trims whitespace from account IDs", () => {
      const bindings = [
        { agentId: "agent1", match: { channel: "telegram", accountId: "  account1  " } },
        { agentId: "agent2", match: { channel: "telegram", accountId: "\taccount2\n" } },
      ];
      const cfg = createMockConfig(bindings);

      const result = listBoundAccountIds(cfg, "telegram");
      expect(result).toEqual(["account1", "account2"]);
    });

    it("deduplicates account IDs", () => {
      const bindings = [
        { agentId: "agent1", match: { channel: "telegram", accountId: "account1" } },
        { agentId: "agent2", match: { channel: "telegram", accountId: "account1" } },
        { agentId: "agent3", match: { channel: "telegram", accountId: "account2" } },
      ];
      const cfg = createMockConfig(bindings);

      const result = listBoundAccountIds(cfg, "telegram");
      expect(result).toEqual(["account1", "account2"]);
    });

    it("sorts account IDs alphabetically", () => {
      const bindings = [
        { agentId: "agent1", match: { channel: "telegram", accountId: "zeta" } },
        { agentId: "agent2", match: { channel: "telegram", accountId: "alpha" } },
        { agentId: "agent3", match: { channel: "telegram", accountId: "beta" } },
      ];
      const cfg = createMockConfig(bindings);

      const result = listBoundAccountIds(cfg, "telegram");
      expect(result).toEqual(["alpha", "beta", "zeta"]);
    });

    it("handles invalid binding objects", () => {
      const bindings = [
        null,
        undefined,
        "not-an-object",
        { agentId: "agent1" }, // missing match
        { match: { channel: "telegram" } }, // missing agentId
        { agentId: "agent1", match: null }, // null match
        { agentId: "agent1", match: "not-an-object" }, // invalid match
        { agentId: "agent1", match: { channel: "telegram" } }, // missing accountId
      ];
      const cfg = createMockConfig(bindings);

      const result = listBoundAccountIds(cfg, "telegram");
      expect(result).toEqual([]);
    });
  });

  describe("resolveDefaultAgentBoundAccountId", () => {
    it("returns null for invalid channel", () => {
      const cfg = createMockConfig();
      expect(resolveDefaultAgentBoundAccountId(cfg, "")).toBeNull();
      expect(resolveDefaultAgentBoundAccountId(cfg, null as unknown)).toBeNull();
      expect(resolveDefaultAgentBoundAccountId(cfg, undefined as unknown)).toBeNull();
    });

    it("returns null when no bindings", () => {
      const cfg = createMockConfig();
      expect(resolveDefaultAgentBoundAccountId(cfg, "telegram")).toBeNull();
    });

    it("returns null when no default agent binding", () => {
      const bindings = [
        { agentId: "other-agent", match: { channel: "telegram", accountId: "account1" } },
      ];
      const cfg = createMockConfig(bindings);

      // Mock resolveDefaultAgentId to return "default-agent"
      mockResolveDefaultAgentId.mockReturnValue("default-agent");

      expect(resolveDefaultAgentBoundAccountId(cfg, "telegram")).toBeNull();
    });

    it("returns account ID for default agent binding", () => {
      const bindings = [
        { agentId: "default-agent", match: { channel: "telegram", accountId: "account1" } },
        { agentId: "other-agent", match: { channel: "telegram", accountId: "account2" } },
      ];
      // Create config with default agent
      const cfg = {
        bindings,
        agents: {
          list: [{ id: "default-agent", default: true }, { id: "other-agent" }],
        },
      } as OpenClawConfig;

      expect(resolveDefaultAgentBoundAccountId(cfg, "telegram")).toBe("account1");
    });

    it("handles case insensitive agent ID matching", () => {
      const bindings = [
        { agentId: "DEFAULT-AGENT", match: { channel: "telegram", accountId: "account1" } },
      ];
      // Create config with default agent
      const cfg = {
        bindings,
        agents: {
          list: [{ id: "default-agent", default: true }],
        },
      } as OpenClawConfig;

      expect(resolveDefaultAgentBoundAccountId(cfg, "telegram")).toBe("account1");
    });

    it("excludes wildcard account IDs", () => {
      const bindings = [
        { agentId: "default-agent", match: { channel: "telegram", accountId: "*" } },
      ];
      const cfg = createMockConfig(bindings);

      // Mock resolveDefaultAgentId to return "default-agent"
      mockResolveDefaultAgentId.mockReturnValue("default-agent");

      expect(resolveDefaultAgentBoundAccountId(cfg, "telegram")).toBeNull();
    });

    it("trims whitespace from account ID", () => {
      const bindings = [
        { agentId: "default-agent", match: { channel: "telegram", accountId: "  account1  " } },
      ];
      // Create config with default agent
      const cfg = {
        bindings,
        agents: {
          list: [{ id: "default-agent", default: true }],
        },
      } as OpenClawConfig;

      expect(resolveDefaultAgentBoundAccountId(cfg, "telegram")).toBe("account1");
    });
  });

  describe("buildChannelAccountBindings", () => {
    it("returns empty map when no bindings", () => {
      const cfg = createMockConfig();
      const result = buildChannelAccountBindings(cfg);
      expect(result.size).toBe(0);
    });

    it("builds nested map structure", () => {
      const bindings = [
        { agentId: "agent1", match: { channel: "telegram", accountId: "account1" } },
        { agentId: "agent1", match: { channel: "telegram", accountId: "account2" } },
        { agentId: "agent2", match: { channel: "telegram", accountId: "account3" } },
        { agentId: "agent1", match: { channel: "discord", accountId: "account4" } },
      ];
      const cfg = createMockConfig(bindings);

      const result = buildChannelAccountBindings(cfg);

      expect(result.size).toBe(2);

      const telegramMap = result.get("telegram");
      expect(telegramMap).toBeDefined();
      expect(telegramMap!.size).toBe(2);

      const discordMap = result.get("discord");
      expect(discordMap).toBeDefined();
      expect(discordMap!.size).toBe(1);

      // Check telegram agent1 accounts
      const telegramAgent1Accounts = telegramMap!.get("agent1");
      expect(telegramAgent1Accounts).toEqual(["account1", "account2"]);

      // Check telegram agent2 accounts
      const telegramAgent2Accounts = telegramMap!.get("agent2");
      expect(telegramAgent2Accounts).toEqual(["account3"]);

      // Check discord agent1 accounts
      const discordAgent1Accounts = discordMap!.get("agent1");
      expect(discordAgent1Accounts).toEqual(["account4"]);
    });

    it("handles invalid binding objects", () => {
      const bindings = [
        null,
        undefined,
        "not-an-object",
        { agentId: "agent1" }, // missing match
        { match: { channel: "telegram" } }, // missing agentId
        { agentId: "agent1", match: null }, // null match
        { agentId: "agent1", match: "not-an-object" }, // invalid match
        { agentId: "agent1", match: { channel: "telegram" } }, // missing accountId
        { agentId: "agent1", match: { accountId: "account1" } }, // missing channel
        { agentId: "agent1", match: { channel: "telegram", accountId: "*" } }, // wildcard accountId
      ];
      const cfg = createMockConfig(bindings);

      const result = buildChannelAccountBindings(cfg);
      expect(result.size).toBe(0);
    });

    it("normalizes agent IDs", () => {
      const bindings = [
        { agentId: "AGENT-1", match: { channel: "telegram", accountId: "account1" } },
        { agentId: "agent-1", match: { channel: "telegram", accountId: "account2" } },
      ];
      const cfg = createMockConfig(bindings);

      const result = buildChannelAccountBindings(cfg);

      const telegramMap = result.get("telegram");
      expect(telegramMap).toBeDefined();
      expect(telegramMap!.size).toBe(1); // Both should be normalized to the same agent ID

      const agent1Accounts = telegramMap!.get("agent-1");
      expect(agent1Accounts).toEqual(["account1", "account2"]);
    });
  });
});
