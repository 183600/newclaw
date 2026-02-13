import { describe, expect, it, vi, beforeEach } from "vitest";
import type { MsgContext } from "../auto-reply/templating.js";
import type { OpenClawConfig } from "../config/config.js";
import { applyLinkUnderstanding } from "./apply.js";

// Mock the runner module
vi.mock("./runner.js", () => ({
  runLinkUnderstanding: vi.fn(),
}));

// Import after mocking
import { runLinkUnderstanding } from "./runner.js";

describe("Link Understanding - applyLinkUnderstanding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies link understanding results to context", async () => {
    const mockCtx: MsgContext = {
      Body: "Check this link: https://example.com",
      LinkUnderstanding: [],
    } as MsgContext;

    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: true,
          models: [],
        },
      },
    } as OpenClawConfig;

    // Mock runLinkUnderstanding
    vi.mocked(runLinkUnderstanding).mockResolvedValue({
      urls: ["https://example.com"],
      outputs: ["Link content summary"],
    });

    const result = await applyLinkUnderstanding({ ctx: mockCtx, cfg: mockCfg });

    expect(result.urls).toEqual(["https://example.com"]);
    expect(result.outputs).toEqual(["Link content summary"]);
    expect(mockCtx.LinkUnderstanding).toEqual(["Link content summary"]);
    expect(mockCtx.Body).toContain("Link content summary");
  });

  it("does not modify context when no outputs", async () => {
    const originalBody = "Check this link: https://example.com";
    const mockCtx: MsgContext = {
      Body: originalBody,
      LinkUnderstanding: [],
    } as MsgContext;

    const mockCfg: OpenClawConfig = {
      tools: {
        links: {
          enabled: true,
          models: [],
        },
      },
    } as OpenClawConfig;

    vi.mocked(runLinkUnderstanding).mockResolvedValue({
      urls: ["https://example.com"],
      outputs: [],
    });

    const result = await applyLinkUnderstanding({ ctx: mockCtx, cfg: mockCfg });

    expect(result.urls).toEqual(["https://example.com"]);
    expect(result.outputs).toEqual([]);
    expect(mockCtx.LinkUnderstanding).toEqual([]);
    expect(mockCtx.Body).toBe(originalBody);
  });
});
