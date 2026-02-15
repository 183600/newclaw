import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock the dependencies
vi.mock("../channels/registry.js", () => ({
  CHANNEL_IDS: ["telegram", "discord", "slack", "signal", "whatsapp"],
  listChatChannelAliases: () => ["tg", "dc", "slack"],
  normalizeChatChannelId: vi.fn((id: string) => {
    const channels: Record<string, string> = {
      tg: "telegram",
      dc: "discord",
    };
    return channels[id] || id;
  }),
}));

vi.mock("../gateway/protocol/client-info.js", () => ({
  GATEWAY_CLIENT_MODES: {
    CLI: "cli",
    WEBCHAT: "webchat",
    AGENT: "agent",
  },
  GATEWAY_CLIENT_NAMES: {
    WEBCHAT_UI: "webchat-ui",
    AGENT: "agent",
  },
  normalizeGatewayClientMode: (mode: string | null | undefined) => mode?.toLowerCase(),
  normalizeGatewayClientName: (id: string | null | undefined) => id?.toLowerCase(),
}));

vi.mock("../plugins/runtime.js", () => {
  const mockRegistry = {
    channels: [
      {
        plugin: {
          id: "custom-channel",
          meta: {
            aliases: ["custom", "cc"],
          },
        },
      },
    ],
  };
  return {
    getActivePluginRegistry: () => mockRegistry,
  };
});

import {
  INTERNAL_MESSAGE_CHANNEL,
  isGatewayCliClient,
  isInternalMessageChannel,
  isWebchatClient,
  normalizeMessageChannel,
  listDeliverableMessageChannels,
  listGatewayMessageChannels,
  listGatewayAgentChannelAliases,
  listGatewayAgentChannelValues,
  isGatewayMessageChannel,
  isDeliverableMessageChannel,
  resolveGatewayMessageChannel,
  resolveMessageChannel,
  isMarkdownCapableMessageChannel,
  type GatewayClientInfoLike,
} from "./message-channel.js";

describe("message-channel - Additional Tests", () => {
  describe("normalizeMessageChannel", () => {
    it("should handle channel with mixed case and special characters", () => {
      expect(normalizeMessageChannel("TeLeGrAm-123")).toBe("telegram-123");
      expect(normalizeMessageChannel("CUSTOM_CHANNEL")).toBe("custom_channel");
      expect(normalizeMessageChannel("My-Channel")).toBe("my-channel");
    });

    it("should handle channel with numbers", () => {
      expect(normalizeMessageChannel("telegram2")).toBe("telegram2");
      expect(normalizeMessageChannel("discord-123")).toBe("discord-123");
    });

    it("should handle channel with underscores", () => {
      expect(normalizeMessageChannel("telegram_bot")).toBe("telegram_bot");
      expect(normalizeMessageChannel("discord_server")).toBe("discord_server");
    });

    it("should handle channel with dots", () => {
      expect(normalizeMessageChannel("telegram.bot")).toBe("telegram.bot");
      expect(normalizeMessageChannel("discord.server")).toBe("discord.server");
    });
  });

  describe("isGatewayMessageChannel", () => {
    it("should handle case-sensitive channel comparison", () => {
      expect(isGatewayMessageChannel("TELEGRAM")).toBe(false);
      expect(isGatewayMessageChannel("Telegram")).toBe(false);
      expect(isGatewayMessageChannel("telegram")).toBe(true);
    });

    it("should handle channel with variations", () => {
      expect(isGatewayMessageChannel("telegram-1")).toBe(false);
      expect(isGatewayMessageChannel("discord-server")).toBe(false);
    });
  });

  describe("isDeliverableMessageChannel", () => {
    it("should handle case-sensitive channel comparison", () => {
      expect(isDeliverableMessageChannel("TELEGRAM")).toBe(false);
      expect(isDeliverableMessageChannel("Telegram")).toBe(false);
      expect(isDeliverableMessageChannel("telegram")).toBe(true);
    });

    it("should handle channel with variations", () => {
      expect(isDeliverableMessageChannel("telegram-1")).toBe(false);
      expect(isDeliverableMessageChannel("discord-server")).toBe(false);
    });
  });

  describe("resolveGatewayMessageChannel", () => {
    it("should handle channel with leading/trailing spaces", () => {
      expect(resolveGatewayMessageChannel("  telegram  ")).toBe("telegram");
      expect(resolveGatewayMessageChannel("\tdiscord\n")).toBe("discord");
    });

    it("should handle channel with mixed case", () => {
      expect(resolveGatewayMessageChannel("TELEGRAM")).toBe("telegram");
      expect(resolveGatewayMessageChannel("Discord")).toBe("discord");
    });
  });

  describe("resolveMessageChannel", () => {
    it("should handle both primary and fallback with special characters", () => {
      expect(resolveMessageChannel("telegram-1", "discord-1")).toBe("telegram-1");
      expect(resolveMessageChannel("unknown", "discord-1")).toBe("discord-1");
    });

    it("should handle both primary and fallback with mixed case", () => {
      expect(resolveMessageChannel("TELEGRAM", "DISCORD")).toBe("telegram");
      expect(resolveMessageChannel("unknown", "DISCORD")).toBe("discord");
    });
  });

  describe("isMarkdownCapableMessageChannel", () => {
    it("should handle case-sensitive channel comparison", () => {
      expect(isMarkdownCapableMessageChannel("SLACK")).toBe(true);
      expect(isMarkdownCapableMessageChannel("Slack")).toBe(true);
      expect(isMarkdownCapableMessageChannel("slack")).toBe(true);
    });

    it("should handle channel with variations", () => {
      expect(isMarkdownCapableMessageChannel("slack-1")).toBe(false);
      expect(isMarkdownCapableMessageChannel("telegram-server")).toBe(false);
    });
  });

  describe("isGatewayCliClient", () => {
    it("should handle client with mixed case mode", () => {
      const client: GatewayClientInfoLike = { mode: "CLI" };
      expect(isGatewayCliClient(client)).toBe(true);
    });

    it("should handle client with spaces in mode", () => {
      const client: GatewayClientInfoLike = { mode: " cli " };
      expect(isGatewayCliClient(client)).toBe(true);
    });
  });

  describe("isWebchatClient", () => {
    it("should handle client with mixed case mode", () => {
      const client: GatewayClientInfoLike = { mode: "WEBCHAT" };
      expect(isWebchatClient(client)).toBe(true);
    });

    it("should handle client with mixed case ID", () => {
      const client: GatewayClientInfoLike = { id: "WEBCHAT-UI" };
      expect(isWebchatClient(client)).toBe(true);
    });

    it("should handle client with spaces", () => {
      const client: GatewayClientInfoLike = { mode: " webchat ", id: " webchat-ui " };
      expect(isWebchatClient(client)).toBe(true);
    });
  });

  describe("listDeliverableMessageChannels", () => {
    it("should return unique channels", () => {
      const channels = listDeliverableMessageChannels();
      const uniqueChannels = [...new Set(channels)];
      expect(channels).toEqual(uniqueChannels);
    });

    it("should include built-in channels", () => {
      const channels = listDeliverableMessageChannels();
      expect(channels).toContain("telegram");
      expect(channels).toContain("discord");
      expect(channels).toContain("slack");
      expect(channels).toContain("signal");
      expect(channels).toContain("whatsapp");
    });
  });

  describe("listGatewayMessageChannels", () => {
    it("should return unique channels", () => {
      const channels = listGatewayMessageChannels();
      const uniqueChannels = [...new Set(channels)];
      expect(channels).toEqual(uniqueChannels);
    });

    it("should include internal message channel", () => {
      const channels = listGatewayMessageChannels();
      expect(channels).toContain(INTERNAL_MESSAGE_CHANNEL);
    });
  });

  describe("listGatewayAgentChannelAliases", () => {
    it("should return unique aliases", () => {
      const aliases = listGatewayAgentChannelAliases();
      const uniqueAliases = [...new Set(aliases)];
      expect(aliases).toEqual(uniqueAliases);
    });

    it("should include built-in aliases", () => {
      const aliases = listGatewayAgentChannelAliases();
      expect(aliases).toContain("tg");
      expect(aliases).toContain("dc");
      expect(aliases).toContain("slack");
    });
  });

  describe("listGatewayAgentChannelValues", () => {
    it("should return unique values", () => {
      const values = listGatewayAgentChannelValues();
      const uniqueValues = [...new Set(values)];
      expect(values).toEqual(uniqueValues);
    });

    it("should include special values", () => {
      const values = listGatewayAgentChannelValues();
      expect(values).toContain("last");
    });
  });
});
