import { describe, expect, it, vi } from "vitest";
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

// Mock the dependencies
vi.mock("../channels/registry.js", () => ({
  CHANNEL_IDS: ["telegram", "discord", "slack", "signal", "whatsapp"],
  listChatChannelAliases: () => ["tg", "dc", "slack"],
  normalizeChatChannelId: (id: string) => {
    const channels: Record<string, string> = {
      tg: "telegram",
      dc: "discord",
    };
    return channels[id] || id;
  },
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

vi.mock("../plugins/runtime.js", () => ({
  getActivePluginRegistry: () => ({
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
  }),
}));

describe("INTERNAL_MESSAGE_CHANNEL", () => {
  it("should be 'webchat'", () => {
    expect(INTERNAL_MESSAGE_CHANNEL).toBe("webchat");
  });
});

describe("isGatewayCliClient", () => {
  it("should return true for CLI client", () => {
    const client: GatewayClientInfoLike = { mode: "cli" };
    expect(isGatewayCliClient(client)).toBe(true);
  });

  it("should return false for non-CLI client", () => {
    const client: GatewayClientInfoLike = { mode: "webchat" };
    expect(isGatewayCliClient(client)).toBe(false);
  });

  it("should return false for undefined client", () => {
    expect(isGatewayCliClient(undefined)).toBe(false);
  });

  it("should return false for null client", () => {
    expect(isGatewayCliClient(null)).toBe(false);
  });

  it("should return false for client with no mode", () => {
    const client: GatewayClientInfoLike = {};
    expect(isGatewayCliClient(client)).toBe(false);
  });
});

describe("isInternalMessageChannel", () => {
  it("should return true for webchat channel", () => {
    expect(isInternalMessageChannel("webchat")).toBe(true);
    expect(isInternalMessageChannel("WEBCHAT")).toBe(true);
    expect(isInternalMessageChannel("  webchat  ")).toBe(true);
  });

  it("should return false for non-webchat channel", () => {
    expect(isInternalMessageChannel("telegram")).toBe(false);
    expect(isInternalMessageChannel("discord")).toBe(false);
  });

  it("should return false for undefined input", () => {
    expect(isInternalMessageChannel(undefined)).toBe(false);
  });

  it("should return false for null input", () => {
    expect(isInternalMessageChannel(null)).toBe(false);
  });
});

describe("isWebchatClient", () => {
  it("should return true for webchat mode", () => {
    const client: GatewayClientInfoLike = { mode: "webchat" };
    expect(isWebchatClient(client)).toBe(true);
  });

  it("should return true for webchat UI ID", () => {
    const client: GatewayClientInfoLike = { id: "webchat-ui" };
    expect(isWebchatClient(client)).toBe(true);
  });

  it("should return false for non-webchat client", () => {
    const client: GatewayClientInfoLike = { mode: "cli", id: "agent" };
    expect(isWebchatClient(client)).toBe(false);
  });

  it("should return false for undefined client", () => {
    expect(isWebchatClient(undefined)).toBe(false);
  });
});

describe("normalizeMessageChannel", () => {
  it("should return undefined for undefined input", () => {
    expect(normalizeMessageChannel(undefined)).toBeUndefined();
  });

  it("should return undefined for null input", () => {
    expect(normalizeMessageChannel(null)).toBeUndefined();
  });

  it("should return undefined for empty string", () => {
    expect(normalizeMessageChannel("")).toBeUndefined();
  });

  it("should return undefined for whitespace-only string", () => {
    expect(normalizeMessageChannel("   ")).toBeUndefined();
  });

  it("should return webchat for internal message channel", () => {
    expect(normalizeMessageChannel("webchat")).toBe("webchat");
    expect(normalizeMessageChannel("WEBCHAT")).toBe("webchat");
    expect(normalizeMessageChannel("  webchat  ")).toBe("webchat");
  });

  it("should normalize channel aliases", () => {
    expect(normalizeMessageChannel("tg")).toBe("telegram");
    expect(normalizeMessageChannel("TG")).toBe("telegram");
    expect(normalizeMessageChannel("dc")).toBe("discord");
    expect(normalizeMessageChannel("DC")).toBe("discord");
  });

  it("should normalize plugin channels", () => {
    expect(normalizeMessageChannel("custom-channel")).toBe("custom-channel");
    expect(normalizeMessageChannel("custom")).toBe("custom-channel");
    expect(normalizeMessageChannel("cc")).toBe("custom-channel");
  });

  it("should return normalized channel for valid channels", () => {
    expect(normalizeMessageChannel("telegram")).toBe("telegram");
    expect(normalizeMessageChannel("TELEGRAM")).toBe("telegram");
    expect(normalizeMessageChannel("  telegram  ")).toBe("telegram");
  });

  it("should return normalized input for unknown channels", () => {
    expect(normalizeMessageChannel("unknown")).toBe("unknown");
    expect(normalizeMessageChannel("UNKNOWN")).toBe("unknown");
    expect(normalizeMessageChannel("  unknown  ")).toBe("unknown");
  });
});

describe("listDeliverableMessageChannels", () => {
  it("should return built-in channels and plugin channels", () => {
    const channels = listDeliverableMessageChannels();
    expect(channels).toContain("telegram");
    expect(channels).toContain("discord");
    expect(channels).toContain("slack");
    expect(channels).toContain("signal");
    expect(channels).toContain("whatsapp");
    expect(channels).toContain("custom-channel");
  });

  it("should return unique channels", () => {
    const channels = listDeliverableMessageChannels();
    const uniqueChannels = [...new Set(channels)];
    expect(channels).toEqual(uniqueChannels);
  });
});

describe("listGatewayMessageChannels", () => {
  it("should return deliverable channels plus internal message channel", () => {
    const channels = listGatewayMessageChannels();
    expect(channels).toContain("telegram");
    expect(channels).toContain("discord");
    expect(channels).toContain("slack");
    expect(channels).toContain("signal");
    expect(channels).toContain("whatsapp");
    expect(channels).toContain("custom-channel");
    expect(channels).toContain("webchat");
  });

  it("should return unique channels", () => {
    const channels = listGatewayMessageChannels();
    const uniqueChannels = [...new Set(channels)];
    expect(channels).toEqual(uniqueChannels);
  });
});

describe("listGatewayAgentChannelAliases", () => {
  it("should return built-in aliases and plugin aliases", () => {
    const aliases = listGatewayAgentChannelAliases();
    expect(aliases).toContain("tg");
    expect(aliases).toContain("dc");
    expect(aliases).toContain("slack");
    expect(aliases).toContain("custom");
    expect(aliases).toContain("cc");
  });

  it("should return unique aliases", () => {
    const aliases = listGatewayAgentChannelAliases();
    const uniqueAliases = [...new Set(aliases)];
    expect(aliases).toEqual(uniqueAliases);
  });
});

describe("listGatewayAgentChannelValues", () => {
  it("should return channels, aliases, and special values", () => {
    const values = listGatewayAgentChannelValues();
    expect(values).toContain("telegram");
    expect(values).toContain("discord");
    expect(values).toContain("slack");
    expect(values).toContain("signal");
    expect(values).toContain("whatsapp");
    expect(values).toContain("custom-channel");
    expect(values).toContain("webchat");
    expect(values).toContain("last");
    expect(values).toContain("tg");
    expect(values).toContain("dc");
    expect(values).toContain("custom");
    expect(values).toContain("cc");
  });

  it("should return unique values", () => {
    const values = listGatewayAgentChannelValues();
    const uniqueValues = [...new Set(values)];
    expect(values).toEqual(uniqueValues);
  });
});

describe("isGatewayMessageChannel", () => {
  it("should return true for gateway message channels", () => {
    expect(isGatewayMessageChannel("telegram")).toBe(true);
    expect(isGatewayMessageChannel("discord")).toBe(true);
    expect(isGatewayMessageChannel("slack")).toBe(true);
    expect(isGatewayMessageChannel("signal")).toBe(true);
    expect(isGatewayMessageChannel("whatsapp")).toBe(true);
    expect(isGatewayMessageChannel("custom-channel")).toBe(true);
    expect(isGatewayMessageChannel("webchat")).toBe(true);
  });

  it("should return false for non-gateway message channels", () => {
    expect(isGatewayMessageChannel("unknown")).toBe(false);
    expect(isGatewayMessageChannel("random")).toBe(false);
  });
});

describe("isDeliverableMessageChannel", () => {
  it("should return true for deliverable message channels", () => {
    expect(isDeliverableMessageChannel("telegram")).toBe(true);
    expect(isDeliverableMessageChannel("discord")).toBe(true);
    expect(isDeliverableMessageChannel("slack")).toBe(true);
    expect(isDeliverableMessageChannel("signal")).toBe(true);
    expect(isDeliverableMessageChannel("whatsapp")).toBe(true);
    expect(isDeliverableMessageChannel("custom-channel")).toBe(true);
  });

  it("should return false for non-deliverable message channels", () => {
    expect(isDeliverableMessageChannel("webchat")).toBe(false);
    expect(isDeliverableMessageChannel("unknown")).toBe(false);
    expect(isDeliverableMessageChannel("random")).toBe(false);
  });
});

describe("resolveGatewayMessageChannel", () => {
  it("should return normalized channel for valid gateway message channels", () => {
    expect(resolveGatewayMessageChannel("telegram")).toBe("telegram");
    expect(resolveGatewayMessageChannel("TELEGRAM")).toBe("telegram");
    expect(resolveGatewayMessageChannel("tg")).toBe("telegram");
    expect(resolveGatewayMessageChannel("webchat")).toBe("webchat");
  });

  it("should return undefined for invalid gateway message channels", () => {
    expect(resolveGatewayMessageChannel("unknown")).toBeUndefined();
    expect(resolveGatewayMessageChannel("")).toBeUndefined();
    expect(resolveGatewayMessageChannel(undefined)).toBeUndefined();
  });
});

describe("resolveMessageChannel", () => {
  it("should return primary channel if valid", () => {
    expect(resolveMessageChannel("telegram", "discord")).toBe("telegram");
  });

  it("should return fallback channel if primary is invalid", () => {
    expect(resolveMessageChannel("unknown", "discord")).toBe("discord");
  });

  it("should return undefined if both primary and fallback are invalid", () => {
    expect(resolveMessageChannel("unknown", "random")).toBeUndefined();
  });

  it("should return undefined if both primary and fallback are undefined", () => {
    expect(resolveMessageChannel(undefined, undefined)).toBeUndefined();
  });
});

describe("isMarkdownCapableMessageChannel", () => {
  it("should return true for markdown-capable channels", () => {
    expect(isMarkdownCapableMessageChannel("slack")).toBe(true);
    expect(isMarkdownCapableMessageChannel("telegram")).toBe(true);
    expect(isMarkdownCapableMessageChannel("signal")).toBe(true);
    expect(isMarkdownCapableMessageChannel("discord")).toBe(true);
    expect(isMarkdownCapableMessageChannel("webchat")).toBe(true);
    expect(isMarkdownCapableMessageChannel("tui")).toBe(true);
  });

  it("should return false for non-markdown-capable channels", () => {
    expect(isMarkdownCapableMessageChannel("whatsapp")).toBe(false);
    expect(isMarkdownCapableMessageChannel("unknown")).toBe(false);
  });

  it("should return false for undefined input", () => {
    expect(isMarkdownCapableMessageChannel(undefined)).toBe(false);
  });
});
