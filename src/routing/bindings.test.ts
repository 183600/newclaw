import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import type { AgentBinding } from "../config/types.agents.js";
import {
  buildChannelAccountBindings,
  listBindings,
  listBoundAccountIds,
  resolveDefaultAgentBoundAccountId,
  resolvePreferredAccountId,
} from "./bindings.js";

describe("routing/bindings", () => {
  const mockConfig = (bindings: AgentBinding[] = []): OpenClawConfig =>
    ({
      bindings,
    }) as OpenClawConfig;

  describe("listBindings", () => {
    it("returns empty array when no bindings", () => {
      const cfg = mockConfig();
      expect(listBindings(cfg)).toEqual([]);
    });

    it("returns bindings array when present", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "agent1",
          match: {
            channel: "discord",
            accountId: "account1",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      expect(listBindings(cfg)).toEqual(bindings);
    });

    it("handles null/undefined bindings", () => {
      const cfg1 = mockConfig(null as unknown);
      const cfg2 = mockConfig(undefined as unknown);
      expect(listBindings(cfg1)).toEqual([]);
      expect(listBindings(cfg2)).toEqual([]);
    });
  });

  describe("listBoundAccountIds", () => {
    it("returns empty array for no bindings", () => {
      const cfg = mockConfig();
      expect(listBoundAccountIds(cfg, "discord")).toEqual([]);
    });

    it("filters by channel and returns account IDs", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "agent1",
          match: {
            channel: "discord",
            accountId: "account1",
          },
        },
        {
          agentId: "agent2",
          match: {
            channel: "slack",
            accountId: "account2",
          },
        },
        {
          agentId: "agent3",
          match: {
            channel: "discord",
            accountId: "account3",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      const result = listBoundAccountIds(cfg, "discord");
      expect(result).toEqual(["account1", "account3"]);
    });

    it("skips wildcard account IDs", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "agent1",
          match: {
            channel: "discord",
            accountId: "*",
          },
        },
        {
          agentId: "agent2",
          match: {
            channel: "discord",
            accountId: "account2",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      expect(listBoundAccountIds(cfg, "discord")).toEqual(["account2"]);
    });

    it("handles case insensitive channel matching", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "agent1",
          match: {
            channel: "Discord",
            accountId: "account1",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      expect(listBoundAccountIds(cfg, "discord")).toEqual(["account1"]);
    });

    it("trims whitespace from account IDs", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "agent1",
          match: {
            channel: "discord",
            accountId: "  account1  ",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      expect(listBoundAccountIds(cfg, "discord")).toEqual(["account1"]);
    });

    it("returns sorted account IDs", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "agent1",
          match: {
            channel: "discord",
            accountId: "z-account",
          },
        },
        {
          agentId: "agent2",
          match: {
            channel: "discord",
            accountId: "a-account",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      expect(listBoundAccountIds(cfg, "discord")).toEqual(["a-account", "z-account"]);
    });
  });

  describe("resolveDefaultAgentBoundAccountId", () => {
    it("returns null when no matching bindings", () => {
      const cfg = mockConfig();
      expect(resolveDefaultAgentBoundAccountId(cfg, "discord")).toBeNull();
    });

    it("returns null for non-default agent bindings", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "non-default",
          match: {
            channel: "discord",
            accountId: "account1",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      expect(resolveDefaultAgentBoundAccountId(cfg, "discord")).toBeNull();
    });

    it("returns account ID for default agent binding", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "main",
          match: {
            channel: "discord",
            accountId: "account1",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      expect(resolveDefaultAgentBoundAccountId(cfg, "discord")).toBe("account1");
    });

    it("trims whitespace from account ID", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "main",
          match: {
            channel: "discord",
            accountId: "  account1  ",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      expect(resolveDefaultAgentBoundAccountId(cfg, "discord")).toBe("account1");
    });
  });

  describe("buildChannelAccountBindings", () => {
    it("returns empty map for no bindings", () => {
      const cfg = mockConfig();
      const result = buildChannelAccountBindings(cfg);
      expect(result.size).toBe(0);
    });

    it("builds nested map structure", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "agent1",
          match: {
            channel: "discord",
            accountId: "account1",
          },
        },
        {
          agentId: "agent1",
          match: {
            channel: "discord",
            accountId: "account2",
          },
        },
        {
          agentId: "agent2",
          match: {
            channel: "discord",
            accountId: "account3",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      const result = buildChannelAccountBindings(cfg);

      expect(result.size).toBe(1);
      const discordMap = result.get("discord");
      expect(discordMap).toBeDefined();
      expect(discordMap!.size).toBe(2);

      const agent1Accounts = discordMap!.get("agent1");
      expect(agent1Accounts).toEqual(["account1", "account2"]);

      const agent2Accounts = discordMap!.get("agent2");
      expect(agent2Accounts).toEqual(["account3"]);
    });

    it("deduplicates account IDs within agent", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "agent1",
          match: {
            channel: "discord",
            accountId: "account1",
          },
        },
        {
          agentId: "agent1",
          match: {
            channel: "discord",
            accountId: "account1",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      const result = buildChannelAccountBindings(cfg);

      const discordMap = result.get("discord");
      const agent1Accounts = discordMap!.get("agent1");
      expect(agent1Accounts).toEqual(["account1"]);
    });

    it("handles multiple channels", () => {
      const bindings: AgentBinding[] = [
        {
          agentId: "agent1",
          match: {
            channel: "discord",
            accountId: "account1",
          },
        },
        {
          agentId: "agent1",
          match: {
            channel: "slack",
            accountId: "account2",
          },
        },
      ];
      const cfg = mockConfig(bindings);
      const result = buildChannelAccountBindings(cfg);

      expect(result.size).toBe(2);
      expect(result.has("discord")).toBe(true);
      expect(result.has("slack")).toBe(true);
    });
  });

  describe("resolvePreferredAccountId", () => {
    it("returns first bound account when available", () => {
      const result = resolvePreferredAccountId({
        accountIds: ["default1", "default2"],
        defaultAccountId: "default1",
        boundAccounts: ["bound1", "bound2"],
      });
      expect(result).toBe("bound1");
    });

    it("returns default account when no bound accounts", () => {
      const result = resolvePreferredAccountId({
        accountIds: ["default1", "default2"],
        defaultAccountId: "default1",
        boundAccounts: [],
      });
      expect(result).toBe("default1");
    });

    it("handles empty account IDs", () => {
      const result = resolvePreferredAccountId({
        accountIds: [],
        defaultAccountId: "default1",
        boundAccounts: [],
      });
      expect(result).toBe("default1");
    });
  });
});
