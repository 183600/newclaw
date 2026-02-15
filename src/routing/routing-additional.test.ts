import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import { resolveAgentRoute, type ResolveAgentRouteInput } from "./resolve-route.js";

describe("routing additional edge cases", () => {
  describe("resolveAgentRoute edge cases", () => {
    it("handles empty configuration gracefully", () => {
      const cfg: OpenClawConfig = {};
      const route = resolveAgentRoute({
        cfg,
        channel: "",
        accountId: "",
        peer: null,
      });
      expect(route.agentId).toBe("main");
      expect(route.channel).toBe("unknown");
      expect(route.accountId).toBe("default");
      expect(route.matchedBy).toBe("default");
    });

    it("handles malformed bindings gracefully", () => {
      const cfg: OpenClawConfig = {
        agents: {
          bindings: [
            null as any,
            undefined as any,
            "invalid" as any,
            { match: null },
            { match: { channel: "test" }, agentId: "" },
          ],
        },
      };
      const route = resolveAgentRoute({
        cfg,
        channel: "test",
        accountId: "account1",
        peer: { kind: "dm", id: "user1" },
      });
      expect(route.agentId).toBe("main");
      expect(route.matchedBy).toBe("default");
    });

    it("handles whitespace-only inputs", () => {
      const cfg: OpenClawConfig = {};
      const route = resolveAgentRoute({
        cfg,
        channel: "   ",
        accountId: "   ",
        peer: { kind: "dm", id: "   " },
      });
      expect(route.channel).toBe("unknown");
      expect(route.accountId).toBe("default");
      expect(route.sessionKey).toBe("agent:main:main");
    });

    it("handles special characters in IDs", () => {
      const cfg: OpenClawConfig = {
        agents: {
          bindings: [
            {
              match: {
                channel: "test",
                accountId: "account-with-special-chars_123",
                peer: { kind: "dm", id: "user@domain.com" },
              },
              agentId: "special-agent",
            },
          ],
        },
      };
      const route = resolveAgentRoute({
        cfg,
        channel: "test",
        accountId: "account-with-special-chars_123",
        peer: { kind: "dm", id: "user@domain.com" },
      });
      expect(route.agentId).toBe("special-agent");
      expect(route.matchedBy).toBe("binding.peer");
    });

    it("respects binding priority order", () => {
      const cfg: OpenClawConfig = {
        agents: {
          bindings: [
            {
              match: {
                channel: "test",
                accountId: "*",
              },
              agentId: "channel-agent",
            },
            {
              match: {
                channel: "test",
                accountId: "account1",
                peer: { kind: "dm", id: "user1" },
              },
              agentId: "peer-agent",
            },
          ],
        },
      };
      const route = resolveAgentRoute({
        cfg,
        channel: "test",
        accountId: "account1",
        peer: { kind: "dm", id: "user1" },
      });
      // Peer match should take priority over channel match
      expect(route.agentId).toBe("peer-agent");
      expect(route.matchedBy).toBe("binding.peer");
    });

    it("handles case-insensitive matching", () => {
      const cfg: OpenClawConfig = {
        agents: {
          bindings: [
            {
              match: {
                channel: "TEST",
                accountId: "Account1",
                peer: { kind: "dm", id: "User1" },
              },
              agentId: "case-insensitive-agent",
            },
          ],
        },
      };
      const route = resolveAgentRoute({
        cfg,
        channel: "test",
        accountId: "account1",
        peer: { kind: "dm", id: "user1" },
      });
      expect(route.agentId).toBe("case-insensitive-agent");
      expect(route.matchedBy).toBe("binding.peer");
    });

    it("handles parent peer inheritance correctly", () => {
      const cfg: OpenClawConfig = {
        agents: {
          bindings: [
            {
              match: {
                channel: "test",
                accountId: "account1",
                peer: { kind: "group", id: "parent-group" },
              },
              agentId: "parent-agent",
            },
          ],
        },
      };
      const route = resolveAgentRoute({
        cfg,
        channel: "test",
        accountId: "account1",
        peer: { kind: "dm", id: "thread-user" },
        parentPeer: { kind: "group", id: "parent-group" },
      });
      expect(route.agentId).toBe("parent-agent");
      expect(route.matchedBy).toBe("binding.peer.parent");
    });

    it("handles guild and team ID matching", () => {
      const cfg: OpenClawConfig = {
        agents: {
          bindings: [
            {
              match: {
                channel: "discord",
                accountId: "account1",
                guildId: "guild123",
              },
              agentId: "guild-agent",
            },
            {
              match: {
                channel: "slack",
                accountId: "account1",
                teamId: "team456",
              },
              agentId: "team-agent",
            },
          ],
        },
      };

      const guildRoute = resolveAgentRoute({
        cfg,
        channel: "discord",
        accountId: "account1",
        peer: { kind: "dm", id: "user1" },
        guildId: "guild123",
      });
      expect(guildRoute.agentId).toBe("guild-agent");
      expect(guildRoute.matchedBy).toBe("binding.guild");

      const teamRoute = resolveAgentRoute({
        cfg,
        channel: "slack",
        accountId: "account1",
        peer: { kind: "dm", id: "user1" },
        teamId: "team456",
      });
      expect(teamRoute.agentId).toBe("team-agent");
      expect(teamRoute.matchedBy).toBe("binding.team");
    });

    it("handles wildcard account matching", () => {
      const cfg: OpenClawConfig = {
        agents: {
          bindings: [
            {
              match: {
                channel: "test",
                accountId: "*",
              },
              agentId: "wildcard-agent",
            },
          ],
        },
      };
      const route = resolveAgentRoute({
        cfg,
        channel: "test",
        accountId: "any-account",
        peer: { kind: "dm", id: "user1" },
      });
      expect(route.agentId).toBe("wildcard-agent");
      expect(route.matchedBy).toBe("binding.channel");
    });

    it("prefers specific account over wildcard", () => {
      const cfg: OpenClawConfig = {
        agents: {
          bindings: [
            {
              match: {
                channel: "test",
                accountId: "*",
              },
              agentId: "wildcard-agent",
            },
            {
              match: {
                channel: "test",
                accountId: "account1",
              },
              agentId: "specific-agent",
            },
          ],
        },
      };
      const route = resolveAgentRoute({
        cfg,
        channel: "test",
        accountId: "account1",
        peer: { kind: "dm", id: "user1" },
      });
      // Specific account match should take priority
      expect(route.agentId).toBe("specific-agent");
      expect(route.matchedBy).toBe("binding.account");
    });

    it("handles missing agent list gracefully", () => {
      const cfg: OpenClawConfig = {
        agents: {
          bindings: [
            {
              match: {
                channel: "test",
                accountId: "account1",
              },
              agentId: "nonexistent-agent",
            },
          ],
        },
      };
      const route = resolveAgentRoute({
        cfg,
        channel: "test",
        accountId: "account1",
        peer: { kind: "dm", id: "user1" },
      });
      // Should fall back to default agent when specified agent doesn't exist
      expect(route.agentId).toBe("main");
      expect(route.matchedBy).toBe("binding.account");
    });

    it("handles different dmScope settings correctly", () => {
      const testCases = [
        { dmScope: "main", expectedKey: "agent:main:main" },
        { dmScope: "per-peer", expectedKey: "agent:main:dm:user1" },
        { dmScope: "per-channel-peer", expectedKey: "agent:test:dm:user1" },
        { dmScope: "per-account-channel-peer", expectedKey: "agent:test:account1:dm:user1" },
      ];

      testCases.forEach(({ dmScope, expectedKey }) => {
        const cfg: OpenClawConfig = {
          session: { dmScope: dmScope as any },
        };
        const route = resolveAgentRoute({
          cfg,
          channel: "test",
          accountId: "account1",
          peer: { kind: "dm", id: "user1" },
        });
        expect(route.sessionKey).toBe(expectedKey);
      });
    });
  });

  describe("routing integration tests", () => {
    it("handles complex multi-channel routing", () => {
      const cfg: OpenClawConfig = {
        agents: {
          bindings: [
            {
              match: {
                channel: "discord",
                accountId: "account1",
                guildId: "guild123",
              },
              agentId: "discord-guild-agent",
            },
            {
              match: {
                channel: "slack",
                accountId: "account1",
                teamId: "team456",
              },
              agentId: "slack-team-agent",
            },
            {
              match: {
                channel: "whatsapp",
                accountId: "account1",
                peer: { kind: "group", id: "group789" },
              },
              agentId: "whatsapp-group-agent",
            },
          ],
        },
      };

      const discordRoute = resolveAgentRoute({
        cfg,
        channel: "discord",
        accountId: "account1",
        peer: { kind: "dm", id: "user1" },
        guildId: "guild123",
      });
      expect(discordRoute.agentId).toBe("discord-guild-agent");

      const slackRoute = resolveAgentRoute({
        cfg,
        channel: "slack",
        accountId: "account1",
        peer: { kind: "channel", id: "channel1" },
        teamId: "team456",
      });
      expect(slackRoute.agentId).toBe("slack-team-agent");

      const whatsappRoute = resolveAgentRoute({
        cfg,
        channel: "whatsapp",
        accountId: "account1",
        peer: { kind: "group", id: "group789" },
      });
      expect(whatsappRoute.agentId).toBe("whatsapp-group-agent");
    });

    it("handles identity links across channels", () => {
      const cfg: OpenClawConfig = {
        session: {
          dmScope: "per-peer",
          identityLinks: {
            "canonical-user": ["discord:user123", "slack:user456"],
          },
        },
      };

      const discordRoute = resolveAgentRoute({
        cfg,
        channel: "discord",
        accountId: "account1",
        peer: { kind: "dm", id: "user123" },
      });
      expect(discordRoute.sessionKey).toBe("agent:main:dm:canonical-user");

      const slackRoute = resolveAgentRoute({
        cfg,
        channel: "slack",
        accountId: "account1",
        peer: { kind: "dm", id: "user456" },
      });
      expect(slackRoute.sessionKey).toBe("agent:main:dm:canonical-user");
    });
  });
});
