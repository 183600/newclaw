import { describe, expect, it, vi } from "vitest";
import { listChannelDocks, getChannelDock } from "./dock.js";

// Mock the dependencies
vi.mock("../plugins/runtime.js", () => ({
  requireActivePluginRegistry: vi.fn(() => ({
    channels: [],
  })),
}));

vi.mock("../discord/accounts.js", () => ({
  resolveDiscordAccount: vi.fn(() => ({
    config: {
      dm: {
        allowFrom: ["123456789"],
      },
    },
  })),
}));

vi.mock("../imessage/accounts.js", () => ({
  resolveIMessageAccount: vi.fn(() => ({
    config: {
      allowFrom: ["test@example.com"],
    },
  })),
}));

vi.mock("../signal/accounts.js", () => ({
  resolveSignalAccount: vi.fn(() => ({
    config: {
      allowFrom: ["+1234567890"],
    },
  })),
}));

vi.mock("../slack/accounts.js", () => ({
  resolveSlackAccount: vi.fn(() => ({
    dm: {
      allowFrom: ["U1234567890"],
    },
  })),
  resolveSlackReplyToMode: vi.fn(() => "first"),
}));

vi.mock("../telegram/accounts.js", () => ({
  resolveTelegramAccount: vi.fn(() => ({
    config: {
      allowFrom: ["@username"],
    },
  })),
}));

vi.mock("../web/accounts.js", () => ({
  resolveWhatsAppAccount: vi.fn(() => ({
    allowFrom: ["1234567890@c.us"],
  })),
}));

vi.mock("../utils.js", () => ({
  normalizeE164: vi.fn((e164) => e164),
}));

vi.mock("../whatsapp/normalize.js", () => ({
  normalizeWhatsAppTarget: vi.fn((target) => target),
}));

vi.mock("./plugins/group-mentions.js", () => ({
  resolveDiscordGroupRequireMention: vi.fn(),
  resolveDiscordGroupToolPolicy: vi.fn(),
  resolveGoogleChatGroupRequireMention: vi.fn(),
  resolveGoogleChatGroupToolPolicy: vi.fn(),
  resolveIMessageGroupRequireMention: vi.fn(),
  resolveIMessageGroupToolPolicy: vi.fn(),
  resolveSlackGroupRequireMention: vi.fn(),
  resolveSlackGroupToolPolicy: vi.fn(),
  resolveTelegramGroupRequireMention: vi.fn(),
  resolveTelegramGroupToolPolicy: vi.fn(),
  resolveWhatsAppGroupRequireMention: vi.fn(),
  resolveWhatsAppGroupToolPolicy: vi.fn(),
}));

vi.mock("../slack/threading-tool-context.js", () => ({
  buildSlackThreadingToolContext: vi.fn(),
}));

describe("listChannelDocks", () => {
  it("should return a list of channel docks", () => {
    const docks = listChannelDocks();

    expect(Array.isArray(docks)).toBe(true);
    expect(docks.length).toBeGreaterThan(0);
  });

  it("should include expected core channels", () => {
    const docks = listChannelDocks();
    const channelIds = docks.map((dock) => dock.id);

    // Check that core channels are included
    expect(channelIds).toContain("telegram");
    expect(channelIds).toContain("whatsapp");
    expect(channelIds).toContain("discord");
    expect(channelIds).toContain("slack");
    expect(channelIds).toContain("signal");
    expect(channelIds).toContain("imessage");
    expect(channelIds).toContain("googlechat");
  });

  it("should return docks with required properties", () => {
    const docks = listChannelDocks();

    for (const dock of docks) {
      expect(dock).toHaveProperty("id");
      expect(dock).toHaveProperty("capabilities");
      expect(typeof dock.id).toBe("string");
      expect(typeof dock.capabilities).toBe("object");
    }
  });

  it("should return docks in a consistent order", () => {
    const docks1 = listChannelDocks();
    const docks2 = listChannelDocks();

    expect(docks1.map((d) => d.id)).toEqual(docks2.map((d) => d.id));
  });
});

describe("getChannelDock", () => {
  it("should return dock for telegram channel", () => {
    const dock = getChannelDock("telegram");

    expect(dock).toBeDefined();
    expect(dock?.id).toBe("telegram");
    expect(dock?.capabilities).toHaveProperty("chatTypes");
    expect(dock?.capabilities).toHaveProperty("nativeCommands");
    expect(dock?.capabilities).toHaveProperty("blockStreaming");
  });

  it("should return dock for whatsapp channel", () => {
    const dock = getChannelDock("whatsapp");

    expect(dock).toBeDefined();
    expect(dock?.id).toBe("whatsapp");
    expect(dock?.capabilities).toHaveProperty("chatTypes");
    expect(dock?.capabilities).toHaveProperty("polls");
    expect(dock?.capabilities).toHaveProperty("reactions");
    expect(dock?.capabilities).toHaveProperty("media");
  });

  it("should return dock for discord channel", () => {
    const dock = getChannelDock("discord");

    expect(dock).toBeDefined();
    expect(dock?.id).toBe("discord");
    expect(dock?.capabilities).toHaveProperty("chatTypes");
    expect(dock?.capabilities).toHaveProperty("polls");
    expect(dock?.capabilities).toHaveProperty("reactions");
    expect(dock?.capabilities).toHaveProperty("media");
    expect(dock?.capabilities).toHaveProperty("nativeCommands");
    expect(dock?.capabilities).toHaveProperty("threads");
  });

  it("should return dock for slack channel", () => {
    const dock = getChannelDock("slack");

    expect(dock).toBeDefined();
    expect(dock?.id).toBe("slack");
    expect(dock?.capabilities).toHaveProperty("chatTypes");
    expect(dock?.capabilities).toHaveProperty("reactions");
    expect(dock?.capabilities).toHaveProperty("media");
    expect(dock?.capabilities).toHaveProperty("nativeCommands");
    expect(dock?.capabilities).toHaveProperty("threads");
  });

  it("should return dock for signal channel", () => {
    const dock = getChannelDock("signal");

    expect(dock).toBeDefined();
    expect(dock?.id).toBe("signal");
    expect(dock?.capabilities).toHaveProperty("chatTypes");
    expect(dock?.capabilities).toHaveProperty("reactions");
    expect(dock?.capabilities).toHaveProperty("media");
  });

  it("should return dock for imessage channel", () => {
    const dock = getChannelDock("imessage");

    expect(dock).toBeDefined();
    expect(dock?.id).toBe("imessage");
    expect(dock?.capabilities).toHaveProperty("chatTypes");
    expect(dock?.capabilities).toHaveProperty("reactions");
    expect(dock?.capabilities).toHaveProperty("media");
  });

  it("should return dock for googlechat channel", () => {
    const dock = getChannelDock("googlechat");

    expect(dock).toBeDefined();
    expect(dock?.id).toBe("googlechat");
    expect(dock?.capabilities).toHaveProperty("chatTypes");
    expect(dock?.capabilities).toHaveProperty("reactions");
    expect(dock?.capabilities).toHaveProperty("media");
    expect(dock?.capabilities).toHaveProperty("threads");
    expect(dock?.capabilities).toHaveProperty("blockStreaming");
  });

  it("should return undefined for unknown channel", () => {
    const dock = getChannelDock("unknown-channel");
    expect(dock).toBeUndefined();
  });

  it("should return dock with outbound configuration", () => {
    const telegramDock = getChannelDock("telegram");
    expect(telegramDock?.outbound).toBeDefined();
    expect(telegramDock?.outbound?.textChunkLimit).toBe(4000);

    const discordDock = getChannelDock("discord");
    expect(discordDock?.outbound).toBeDefined();
    expect(discordDock?.outbound?.textChunkLimit).toBe(2000);
  });

  it("should return dock with streaming configuration for supported channels", () => {
    const discordDock = getChannelDock("discord");
    expect(discordDock?.streaming).toBeDefined();
    expect(discordDock?.streaming?.blockStreamingCoalesceDefaults).toBeDefined();

    const slackDock = getChannelDock("slack");
    expect(slackDock?.streaming).toBeDefined();
    expect(slackDock?.streaming?.blockStreamingCoalesceDefaults).toBeDefined();
  });

  it("should return dock with config functions", () => {
    const telegramDock = getChannelDock("telegram");
    expect(telegramDock?.config).toBeDefined();
    expect(typeof telegramDock?.config?.resolveAllowFrom).toBe("function");
    expect(typeof telegramDock?.config?.formatAllowFrom).toBe("function");

    const whatsappDock = getChannelDock("whatsapp");
    expect(whatsappDock?.config).toBeDefined();
    expect(typeof whatsappDock?.config?.resolveAllowFrom).toBe("function");
    expect(typeof whatsappDock?.config?.formatAllowFrom).toBe("function");
  });

  it("should return dock with groups configuration", () => {
    const telegramDock = getChannelDock("telegram");
    expect(telegramDock?.groups).toBeDefined();
    expect(typeof telegramDock?.groups?.resolveRequireMention).toBe("function");
    expect(typeof telegramDock?.groups?.resolveToolPolicy).toBe("function");

    const whatsappDock = getChannelDock("whatsapp");
    expect(whatsappDock?.groups).toBeDefined();
    expect(typeof whatsappDock?.groups?.resolveRequireMention).toBe("function");
    expect(typeof whatsappDock?.groups?.resolveToolPolicy).toBe("function");
  });

  it("should return dock with threading configuration", () => {
    const telegramDock = getChannelDock("telegram");
    expect(telegramDock?.threading).toBeDefined();
    expect(typeof telegramDock?.threading?.resolveReplyToMode).toBe("function");
    expect(typeof telegramDock?.threading?.buildToolContext).toBe("function");

    const slackDock = getChannelDock("slack");
    expect(slackDock?.threading).toBeDefined();
    expect(typeof slackDock?.threading?.resolveReplyToMode).toBe("function");
    expect(typeof slackDock?.threading?.buildToolContext).toBe("function");
  });

  it("should return dock with mentions configuration for channels that support it", () => {
    const whatsappDock = getChannelDock("whatsapp");
    expect(whatsappDock?.mentions).toBeDefined();
    expect(typeof whatsappDock?.mentions?.stripPatterns).toBe("function");

    const discordDock = getChannelDock("discord");
    expect(discordDock?.mentions).toBeDefined();
    expect(typeof discordDock?.mentions?.stripPatterns).toBe("function");
  });

  it("should return dock with elevated configuration for channels that support it", () => {
    const discordDock = getChannelDock("discord");
    expect(discordDock?.elevated).toBeDefined();
    expect(typeof discordDock?.elevated?.allowFromFallback).toBe("function");
  });

  it("should return dock with commands configuration for channels that support it", () => {
    const whatsappDock = getChannelDock("whatsapp");
    expect(whatsappDock?.commands).toBeDefined();
    expect(whatsappDock?.commands?.enforceOwnerForCommands).toBe(true);
    expect(whatsappDock?.commands?.skipWhenConfigEmpty).toBe(true);
  });
});
