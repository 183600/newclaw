import { describe, expect, it, vi } from "vitest";
import { formatDocsLink, formatDocsRootLink, DOCS_ROOT } from "./links.js";

// Mock the formatTerminalLink function from utils
vi.mock("../utils.js", () => ({
  formatTerminalLink: vi.fn((label: string, url: string, _opts?: unknown) => {
    // Always return link format in tests to ensure consistent behavior
    return `[LINK:${label}->${url}]`;
  }),
}));

describe("DOCS_ROOT", () => {
  it("should be https://docs.openclaw.ai", () => {
    expect(DOCS_ROOT).toBe("https://docs.openclaw.ai");
  });
});

describe("formatDocsLink", () => {
  it("should format relative path with full URL", () => {
    const result = formatDocsLink("/configuration");
    expect(result).toBe("[LINK:/configuration->https://docs.openclaw.ai/configuration]");
  });

  it("should format relative path without leading slash", () => {
    const result = formatDocsLink("configuration");
    expect(result).toBe(
      "[LINK:https://docs.openclaw.ai/configuration->https://docs.openclaw.ai/configuration]",
    );
  });

  it("should use custom label", () => {
    const result = formatDocsLink("/configuration", "Config");
    expect(result).toBe("[LINK:Config->https://docs.openclaw.ai/configuration]");
  });

  it("should handle absolute URL", () => {
    const result = formatDocsLink("https://example.com/docs");
    expect(result).toBe("[LINK:https://example.com/docs->https://example.com/docs]");
  });

  it("should handle absolute URL with custom label", () => {
    const result = formatDocsLink("https://example.com/docs", "External Docs");
    expect(result).toBe("[LINK:External Docs->https://example.com/docs]");
  });

  it("should trim whitespace from path", () => {
    const result = formatDocsLink("  /configuration  ");
    expect(result).toBe("[LINK:/configuration->https://docs.openclaw.ai/configuration]");
  });

  it("should use custom fallback", () => {
    const result = formatDocsLink("/configuration", "Config", {
      fallback: "Custom fallback",
    });
    expect(result).toBe("[LINK:Config->https://docs.openclaw.ai/configuration]");
  });

  it("should force link display", () => {
    const result = formatDocsLink("/configuration", "Config", {
      force: true,
    });
    expect(result).toBe("[LINK:Config->https://docs.openclaw.ai/configuration]");
  });

  it("should handle empty path", () => {
    const result = formatDocsLink("");
    expect(result).toBe("[LINK:https://docs.openclaw.ai/->https://docs.openclaw.ai/]");
  });

  it("should handle whitespace-only path", () => {
    const result = formatDocsLink("   ");
    expect(result).toBe("[LINK:https://docs.openclaw.ai/->https://docs.openclaw.ai/]");
  });

  it("should handle protocol-relative URL", () => {
    const result = formatDocsLink("//example.com/docs");
    expect(result).toBe("[LINK://example.com/docs->//example.com/docs]");
  });
});

describe("formatDocsRootLink", () => {
  it("should format root link with default label", () => {
    const result = formatDocsRootLink();
    expect(result).toBe(`[LINK:${DOCS_ROOT}->${DOCS_ROOT}]`);
  });

  it("should format root link with custom label", () => {
    const result = formatDocsRootLink("OpenClaw Docs");
    expect(result).toBe(`[LINK:OpenClaw Docs->${DOCS_ROOT}]`);
  });
});
