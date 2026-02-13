import { describe, expect, it, vi, beforeEach } from "vitest";
import type { MsgContext } from "../auto-reply/templating.js";
import type { OpenClawConfig } from "../config/config.js";
import { runLinkUnderstanding } from "./runner.js";

describe("Link Understanding - runLinkUnderstanding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty result when links are disabled", async () => {
    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: false,
        },
      },
    } as OpenClawConfig;

    const mockCtx: MsgContext = {
      Body: "Check this link: https://example.com",
    } as MsgContext;

    const result = await runLinkUnderstanding({ cfg: mockCfg, ctx: mockCtx });

    expect(result.urls).toEqual([]);
    expect(result.outputs).toEqual([]);
  });

  it("returns empty result when links config is missing", async () => {
    const mockCfg: OpenClawConfig = {} as OpenClawConfig;

    const mockCtx: MsgContext = {
      Body: "Check this link: https://example.com",
    } as MsgContext;

    const result = await runLinkUnderstanding({ cfg: mockCfg, ctx: mockCtx });

    expect(result.urls).toEqual([]);
    expect(result.outputs).toEqual([]);
  });

  it("returns empty result when scope decision is deny", async () => {
    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: true,
          scope: {
            default: "deny",
          },
        },
      },
    } as OpenClawConfig;

    const mockCtx: MsgContext = {
      Body: "Check this link: https://example.com",
      SessionKey: "test-session",
      Surface: "web",
      ChatType: "dm",
    } as MsgContext;

    const result = await runLinkUnderstanding({ cfg: mockCfg, ctx: mockCtx });

    expect(result.urls).toEqual([]);
    expect(result.outputs).toEqual([]);
  });

  it("returns empty result when no links are found", async () => {
    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: true,
        },
      },
    } as OpenClawConfig;

    const mockCtx: MsgContext = {
      Body: "No links here",
    } as MsgContext;

    const result = await runLinkUnderstanding({ cfg: mockCfg, ctx: mockCtx });

    expect(result.urls).toEqual([]);
    expect(result.outputs).toEqual([]);
  });

  it("returns URLs but no outputs when no models are configured", async () => {
    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: true,
          models: [],
        },
      },
    } as OpenClawConfig;

    const mockCtx: MsgContext = {
      Body: "Check this link: https://example.com",
    } as MsgContext;

    const result = await runLinkUnderstanding({ cfg: mockCfg, ctx: mockCtx });

    expect(result.urls).toEqual(["https://example.com"]);
    expect(result.outputs).toEqual([]);
  });

  it("processes links with configured models", async () => {
    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: true,
          models: [
            {
              type: "cli",
              command: "echo",
              args: ["Page content"],
            },
          ],
        },
      },
    } as OpenClawConfig;

    const mockCtx: MsgContext = {
      Body: "Check this link: https://example.com",
    } as MsgContext;

    const result = await runLinkUnderstanding({ cfg: mockCfg, ctx: mockCtx });

    expect(result.urls).toEqual(["https://example.com"]);
    // Since we're using echo, the output will be "Page content"
    expect(result.outputs).toEqual(["Page content"]);
  });

  it("handles multiple links", async () => {
    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: true,
          models: [
            {
              type: "cli",
              command: "echo",
              args: ["Example content"],
            },
          ],
        },
      },
    } as OpenClawConfig;

    const mockCtx: MsgContext = {
      Body: "Check https://example.com and https://test.com",
    } as MsgContext;

    const result = await runLinkUnderstanding({ cfg: mockCfg, ctx: mockCtx });

    expect(result.urls).toEqual(["https://example.com", "https://test.com"]);
    // Since both links use the same echo command, both will return "Example content"
    expect(result.outputs).toEqual(["Example content", "Example content"]);
  });

  it("handles CLI command failures gracefully", async () => {
    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: true,
          models: [
            {
              type: "cli",
              command: "nonexistent-command",
              args: [],
            },
          ],
        },
      },
    } as OpenClawConfig;

    const mockCtx: MsgContext = {
      Body: "Check this link: https://example.com",
    } as MsgContext;

    const result = await runLinkUnderstanding({ cfg: mockCfg, ctx: mockCtx });

    expect(result.urls).toEqual(["https://example.com"]);
    expect(result.outputs).toEqual([]);
  });

  it("respects maxLinks configuration", async () => {
    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: true,
          maxLinks: 2,
          models: [
            {
              type: "cli",
              command: "echo",
              args: ["Content"],
            },
          ],
        },
      },
    } as OpenClawConfig;

    const mockCtx: MsgContext = {
      Body: "Check https://a.com, https://b.com, and https://c.com",
    } as MsgContext;

    const result = await runLinkUnderstanding({ cfg: mockCfg, ctx: mockCtx });

    expect(result.urls).toEqual(["https://a.com", "https://b.com"]);
    expect(result.outputs).toEqual(["Content", "Content"]);
  });

  it("uses custom message parameter when provided", async () => {
    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: true,
          models: [
            {
              type: "cli",
              command: "echo",
              args: ["Custom content"],
            },
          ],
        },
      },
    } as OpenClawConfig;

    const mockCtx: MsgContext = {
      Body: "Original body",
    } as MsgContext;

    const customMessage = "Check this custom link: https://custom.com";

    const result = await runLinkUnderstanding({
      cfg: mockCfg,
      ctx: mockCtx,
      message: customMessage,
    });

    expect(result.urls).toEqual(["https://custom.com"]);
    expect(result.outputs).toEqual(["Custom content"]);
  });

  it("applies template variables to CLI arguments", async () => {
    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: true,
          models: [
            {
              type: "cli",
              command: "echo",
              args: ["{{LinkUrl}}", "{{Provider}}"],
            },
          ],
        },
      },
    } as OpenClawConfig;

    const mockCtx: MsgContext = {
      Body: "Check this link: https://example.com",
      Provider: "test-provider",
    } as MsgContext;

    const result = await runLinkUnderstanding({ cfg: mockCfg, ctx: mockCtx });

    expect(result.urls).toEqual(["https://example.com"]);
    // The template variables should be applied
    expect(result.outputs).toEqual(["https://example.com test-provider"]);
  });
});
