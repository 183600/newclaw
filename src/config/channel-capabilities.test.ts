import { describe, expect, it, vi } from "vitest";
import type { OpenClawConfig } from "./config.js";
import { resolveChannelCapabilities } from "./channel-capabilities.js";

// Mock the dependencies
vi.mock("../channels/plugins/index.js", () => ({
  normalizeChannelId: (channel: string | null | undefined) => channel?.trim().toLowerCase(),
}));

vi.mock("../routing/session-key.js", () => ({
  normalizeAccountId: (accountId: string | null | undefined) => accountId?.trim(),
}));

describe("resolveChannelCapabilities", () => {
  it("should return undefined for undefined config", () => {
    const result = resolveChannelCapabilities({ cfg: undefined, channel: "telegram" });
    expect(result).toBeUndefined();
  });

  it("should return undefined for undefined channel", () => {
    const cfg = {} as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: undefined });
    expect(result).toBeUndefined();
  });

  it("should return undefined for null channel", () => {
    const cfg = {} as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: null });
    expect(result).toBeUndefined();
  });

  it("should return undefined for empty string channel", () => {
    const cfg = {} as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: "" });
    expect(result).toBeUndefined();
  });

  it("should return undefined for config without channels", () => {
    const cfg = {} as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: "telegram" });
    expect(result).toBeUndefined();
  });

  it("should return undefined for config with empty channels", () => {
    const cfg = { channels: {} } as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: "telegram" });
    expect(result).toBeUndefined();
  });

  it("should return undefined for channel without capabilities", () => {
    const cfg = { channels: { telegram: {} } } as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: "telegram" });
    expect(result).toBeUndefined();
  });

  it("should return undefined for channel with non-array capabilities", () => {
    const cfg = {
      channels: {
        telegram: {
          capabilities: { inlineButtons: "dm" },
        },
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: "telegram" });
    expect(result).toBeUndefined();
  });

  it("should return normalized capabilities for channel with array capabilities", () => {
    const cfg = {
      channels: {
        telegram: {
          capabilities: ["inlineButtons", "reactions"],
        },
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: "telegram" });
    expect(result).toEqual(["inlineButtons", "reactions"]);
  });

  it("should trim and filter capabilities", () => {
    const cfg = {
      channels: {
        telegram: {
          capabilities: [" inlineButtons ", "reactions", "", "  "],
        },
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: "telegram" });
    expect(result).toEqual(["inlineButtons", "reactions"]);
  });

  it("should return undefined for channel with empty array capabilities", () => {
    const cfg = {
      channels: {
        telegram: {
          capabilities: [],
        },
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: "telegram" });
    expect(result).toBeUndefined();
  });

  it("should return undefined for channel with only whitespace capabilities", () => {
    const cfg = {
      channels: {
        telegram: {
          capabilities: ["  ", "", "\t"],
        },
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: "telegram" });
    expect(result).toBeUndefined();
  });

  it("should return account-specific capabilities when account is provided", () => {
    const cfg = {
      channels: {
        telegram: {
          capabilities: ["inlineButtons", "reactions"],
          accounts: {
            account1: {
              capabilities: ["customCapability"],
            },
          },
        },
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({
      cfg,
      channel: "telegram",
      accountId: "account1",
    });
    expect(result).toEqual(["customCapability"]);
  });

  it("should fall back to channel capabilities when account has no capabilities", () => {
    const cfg = {
      channels: {
        telegram: {
          capabilities: ["inlineButtons", "reactions"],
          accounts: {
            account1: {},
          },
        },
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({
      cfg,
      channel: "telegram",
      accountId: "account1",
    });
    expect(result).toEqual(["inlineButtons", "reactions"]);
  });

  it("should match account case-insensitively", () => {
    const cfg = {
      channels: {
        telegram: {
          capabilities: ["inlineButtons", "reactions"],
          accounts: {
            Account1: {
              capabilities: ["customCapability"],
            },
          },
        },
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({
      cfg,
      channel: "telegram",
      accountId: "account1",
    });
    expect(result).toEqual(["customCapability"]);
  });

  it("should handle missing accounts object", () => {
    const cfg = {
      channels: {
        telegram: {
          capabilities: ["inlineButtons", "reactions"],
        },
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({
      cfg,
      channel: "telegram",
      accountId: "account1",
    });
    expect(result).toEqual(["inlineButtons", "reactions"]);
  });

  it("should normalize channel name", () => {
    const cfg = {
      channels: {
        telegram: {
          capabilities: ["inlineButtons", "reactions"],
        },
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: "  TELEGRAM  " });
    expect(result).toEqual(["inlineButtons", "reactions"]);
  });

  it("should normalize account ID", () => {
    const cfg = {
      channels: {
        telegram: {
          capabilities: ["inlineButtons", "reactions"],
          accounts: {
            account1: {
              capabilities: ["customCapability"],
            },
          },
        },
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({
      cfg,
      channel: "telegram",
      accountId: "  account1  ",
    });
    expect(result).toEqual(["customCapability"]);
  });

  it("should handle legacy channel config at top level", () => {
    const cfg = {
      telegram: {
        capabilities: ["inlineButtons", "reactions"],
      },
    } as OpenClawConfig;
    const result = resolveChannelCapabilities({ cfg, channel: "telegram" });
    expect(result).toEqual(["inlineButtons", "reactions"]);
  });
});
