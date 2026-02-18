import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import { resolveAgentRoute, buildAgentSessionKey, DEFAULT_ACCOUNT_ID } from "./resolve-route.js";

describe("Routing Resolve Route", () => {
  const createMockConfig = (overrides: Partial<OpenClawConfig> = {}): OpenClawConfig => ({
    agents: {
      list: [
        { id: "agent1", model: "gpt-4" },
        { id: "agent2", model: "gpt-3.5-turbo" },
      ],
    },
    bindings: [],
    session: {
      dmScope: "main",
    },
    ...overrides,
  });

  const createRouteInput = (overrides: Partial<unknown> = {}): unknown => ({
    cfg: createMockConfig(),
    channel: "whatsapp",
    accountId: "account1",
    peer: { kind: "dm", id: "peer1" },
    ...overrides,
  });

  describe("DEFAULT_ACCOUNT_ID", () => {
    it("has correct default value", () => {
      expect(DEFAULT_ACCOUNT_ID).toBe("default");
    });
  });

  describe("buildAgentSessionKey", () => {
    it("builds session key with all parameters", () => {
      const key = buildAgentSessionKey({
        agentId: "agent1",
        channel: "whatsapp",
        accountId: "account1",
        peer: { kind: "dm", id: "peer1" },
        dmScope: "main",
      });
      expect(key).toBe("agent:agent1:main"); // dmScope "main" returns main session key
    });

    it("handles missing peer", () => {
      const key = buildAgentSessionKey({
        agentId: "agent1",
        channel: "whatsapp",
        accountId: "account1",
      });
      expect(key).toBe("agent:agent1:main"); // No peer returns main session key
    });

    it("normalizes channel name", () => {
      const key1 = buildAgentSessionKey({
        agentId: "agent1",
        channel: "WhatsApp",
        accountId: "account1",
      });
      const key2 = buildAgentSessionKey({
        agentId: "agent1",
        channel: "whatsapp",
        accountId: "account1",
      });
      expect(key1).toBe(key2);
    });

    it("handles different DM scopes", () => {
      const mainKey = buildAgentSessionKey({
        agentId: "agent1",
        channel: "whatsapp",
        accountId: "account1",
        peer: { kind: "dm", id: "peer1" },
        dmScope: "main",
      });

      const perPeerKey = buildAgentSessionKey({
        agentId: "agent1",
        channel: "whatsapp",
        accountId: "account1",
        peer: { kind: "dm", id: "peer1" },
        dmScope: "per-peer",
      });

      expect(mainKey).not.toBe(perPeerKey);
    });
  });

  describe("resolveAgentRoute", () => {
    it("resolves default route when no bindings match", () => {
      const input = createRouteInput();
      const result = resolveAgentRoute(input);

      expect(result.agentId).toBe("agent1"); // Default agent
      expect(result.channel).toBe("whatsapp");
      expect(result.accountId).toBe("account1");
      expect(result.matchedBy).toBe("default");
    });

    it("resolves peer-specific binding", () => {
      const config = createMockConfig({
        bindings: [
          {
            agentId: "agent2",
            match: {
              channel: "whatsapp",
              accountId: "account1",
              peer: { kind: "dm", id: "peer1" },
            },
          },
        ],
      });

      const result = resolveAgentRoute({
        cfg: config,
        channel: "whatsapp",
        accountId: "account1",
        peer: { kind: "dm", id: "peer1" },
      });

      expect(result.agentId).toBe("agent2");
      expect(result.matchedBy).toBe("binding.peer");
    });

    it("resolves parent peer binding when peer doesn't match", () => {
      const config = createMockConfig({
        bindings: [
          {
            agentId: "agent2",
            match: {
              channel: "whatsapp",
              accountId: "account1",
              peer: { kind: "channel", id: "parent1" },
            },
          },
        ],
      });

      const result = resolveAgentRoute({
        cfg: config,
        channel: "whatsapp",
        accountId: "account1",
        peer: { kind: "dm", id: "thread1" }, // Thread that doesn't match
        parentPeer: { kind: "channel", id: "parent1" }, // Parent that matches
      });

      expect(result.agentId).toBe("agent2");
      expect(result.matchedBy).toBe("binding.peer.parent");
    });

    it("resolves guild-specific binding", () => {
      const config = createMockConfig({
        bindings: [
          {
            agentId: "agent2",
            match: {
              channel: "discord",
              accountId: "account1",
              guildId: "guild1",
            },
          },
        ],
      });

      const result = resolveAgentRoute({
        cfg: config,
        channel: "discord",
        accountId: "account1",
        guildId: "guild1",
      });

      expect(result.agentId).toBe("agent2");
      expect(result.matchedBy).toBe("binding.guild");
    });

    it("resolves team-specific binding", () => {
      const config = createMockConfig({
        bindings: [
          {
            agentId: "agent2",
            match: {
              channel: "slack",
              accountId: "account1",
              teamId: "team1",
            },
          },
        ],
      });

      const result = resolveAgentRoute({
        cfg: config,
        channel: "slack",
        accountId: "account1",
        teamId: "team1",
      });

      expect(result.agentId).toBe("agent2");
      expect(result.matchedBy).toBe("binding.team");
    });

    it("resolves account-specific binding", () => {
      const config = createMockConfig({
        bindings: [
          {
            agentId: "agent2",
            match: {
              channel: "whatsapp",
              accountId: "account1",
            },
          },
        ],
      });

      const result = resolveAgentRoute({
        cfg: config,
        channel: "whatsapp",
        accountId: "account1",
      });

      expect(result.agentId).toBe("agent2");
      expect(result.matchedBy).toBe("binding.account");
    });

    it("resolves channel-specific binding with wildcard account", () => {
      const config = createMockConfig({
        bindings: [
          {
            agentId: "agent2",
            match: {
              channel: "whatsapp",
              accountId: "*",
            },
          },
        ],
      });

      const result = resolveAgentRoute({
        cfg: config,
        channel: "whatsapp",
        accountId: "any-account",
      });

      expect(result.agentId).toBe("agent2");
      expect(result.matchedBy).toBe("binding.channel");
    });

    it("normalizes channel names", () => {
      const config = createMockConfig({
        bindings: [
          {
            agentId: "agent2",
            match: {
              channel: "whatsapp",
              accountId: "account1",
            },
          },
        ],
      });

      const result = resolveAgentRoute({
        cfg: config,
        channel: "WhatsApp", // Different case
        accountId: "account1",
      });

      expect(result.agentId).toBe("agent2");
      expect(result.matchedBy).toBe("binding.account");
    });

    it("handles missing peer information", () => {
      const config = createMockConfig();

      const result = resolveAgentRoute({
        cfg: config,
        channel: "whatsapp",
        accountId: "account1",
        peer: null,
      });

      expect(result.agentId).toBe("agent1");
      expect(result.matchedBy).toBe("default");
    });

    it("generates appropriate session keys", () => {
      const config = createMockConfig();

      const result = resolveAgentRoute({
        cfg: config,
        channel: "whatsapp",
        accountId: "account1",
        peer: { kind: "dm", id: "peer1" },
      });

      // With dmScope "main", sessionKey is the same as mainSessionKey
      expect(result.sessionKey).toBe("agent:agent1:main");
      expect(result.mainSessionKey).toBe("agent:agent1:main");
    });

    it("respects priority order: peer > parent peer > guild > team > account > channel > default", () => {
      const config = createMockConfig({
        bindings: [
          // Lowest priority
          {
            agentId: "agent-channel",
            match: {
              channel: "whatsapp",
              accountId: "*",
            },
          },
          // Higher priority
          {
            agentId: "agent-account",
            match: {
              channel: "whatsapp",
              accountId: "account1",
            },
          },
          // Higher priority
          {
            agentId: "agent-team",
            match: {
              channel: "whatsapp",
              accountId: "account1",
              teamId: "team1",
            },
          },
          // Higher priority
          {
            agentId: "agent-guild",
            match: {
              channel: "whatsapp",
              accountId: "account1",
              guildId: "guild1",
            },
          },
          // Highest priority
          {
            agentId: "agent2",
            match: {
              channel: "whatsapp",
              accountId: "account1",
              peer: { kind: "dm", id: "peer1" },
            },
          },
        ],
      });

      const result = resolveAgentRoute({
        cfg: config,
        channel: "whatsapp",
        accountId: "account1",
        peer: { kind: "dm", id: "peer1" },
        guildId: "guild1",
        teamId: "team1",
      });

      expect(result.agentId).toBe("agent2");
      expect(result.matchedBy).toBe("binding.peer");
    });
  });
});
