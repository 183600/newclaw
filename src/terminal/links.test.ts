import { describe, expect, it, vi, beforeEach } from "vitest";
import { formatDocsLink, formatDocsRootLink, DOCS_ROOT } from "./links.js";

// Mock the formatTerminalLink function from utils
vi.mock("../utils.js", () => ({
  formatTerminalLink: vi.fn((label: string, url: string, opts?: any) => {
    if (opts?.force === false) {
      return opts?.fallback ?? url;
    }
    return `[${label}](${url})`;
  }),
}));

describe("links", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DOCS_ROOT", () => {
    it("should have the correct docs root URL", () => {
      expect(DOCS_ROOT).toBe("https://docs.openclaw.ai");
    });
  });

  describe("formatDocsLink", () => {
    it("should format a link with path starting with slash", async () => {
      const { formatTerminalLink } = await import("../utils.js");
      const mockFormatTerminalLink = vi.mocked(formatTerminalLink);

      formatDocsLink("/channels/telegram");
      expect(mockFormatTerminalLink).toHaveBeenCalledWith(
        "https://docs.openclaw.ai/channels/telegram",
        "https://docs.openclaw.ai/channels/telegram",
        { fallback: "https://docs.openclaw.ai/channels/telegram", force: undefined },
      );
    });

    it("should format a link with path not starting with slash", async () => {
      const { formatTerminalLink } = await import("../utils.js");
      const mockFormatTerminalLink = vi.mocked(formatTerminalLink);

      formatDocsLink("channels/telegram");
      expect(mockFormatTerminalLink).toHaveBeenCalledWith(
        "https://docs.openclaw.ai/channels/telegram",
        "https://docs.openclaw.ai/channels/telegram",
        { fallback: "https://docs.openclaw.ai/channels/telegram", force: undefined },
      );
    });

    it("should use the full URL when path starts with http", async () => {
      const { formatTerminalLink } = await import("../utils.js");
      const mockFormatTerminalLink = vi.mocked(formatTerminalLink);

      formatDocsLink("https://example.com/path");
      expect(mockFormatTerminalLink).toHaveBeenCalledWith(
        "https://example.com/path",
        "https://example.com/path",
        { fallback: "https://example.com/path", force: undefined },
      );
    });

    it("should use custom label when provided", async () => {
      const { formatTerminalLink } = await import("../utils.js");
      const mockFormatTerminalLink = vi.mocked(formatTerminalLink);

      formatDocsLink("/channels/telegram", "Telegram Guide");
      expect(mockFormatTerminalLink).toHaveBeenCalledWith(
        "Telegram Guide",
        "https://docs.openclaw.ai/channels/telegram",
        { fallback: "https://docs.openclaw.ai/channels/telegram", force: undefined },
      );
    });

    it("should use URL as label when no custom label is provided", async () => {
      const { formatTerminalLink } = await import("../utils.js");
      const mockFormatTerminalLink = vi.mocked(formatTerminalLink);

      formatDocsLink("/channels/telegram");
      expect(mockFormatTerminalLink).toHaveBeenCalledWith(
        "https://docs.openclaw.ai/channels/telegram",
        "https://docs.openclaw.ai/channels/telegram",
        { fallback: "https://docs.openclaw.ai/channels/telegram", force: undefined },
      );
    });

    it("should trim whitespace from path", async () => {
      const { formatTerminalLink } = await import("../utils.js");
      const mockFormatTerminalLink = vi.mocked(formatTerminalLink);

      formatDocsLink("  /channels/telegram  ");
      expect(mockFormatTerminalLink).toHaveBeenCalledWith(
        "https://docs.openclaw.ai/channels/telegram",
        "https://docs.openclaw.ai/channels/telegram",
        { fallback: "https://docs.openclaw.ai/channels/telegram", force: undefined },
      );
    });

    it("should pass custom fallback option", async () => {
      const { formatTerminalLink } = await import("../utils.js");
      const mockFormatTerminalLink = vi.mocked(formatTerminalLink);

      formatDocsLink("/channels/telegram", "Telegram", { fallback: "Custom fallback" });
      expect(mockFormatTerminalLink).toHaveBeenCalledWith(
        "Telegram",
        "https://docs.openclaw.ai/channels/telegram",
        { fallback: "Custom fallback", force: undefined },
      );
    });

    it("should pass force option", async () => {
      const { formatTerminalLink } = await import("../utils.js");
      const mockFormatTerminalLink = vi.mocked(formatTerminalLink);

      formatDocsLink("/channels/telegram", "Telegram", { force: true });
      expect(mockFormatTerminalLink).toHaveBeenCalledWith(
        "Telegram",
        "https://docs.openclaw.ai/channels/telegram",
        { fallback: "https://docs.openclaw.ai/channels/telegram", force: true },
      );
    });
  });

  describe("formatDocsRootLink", () => {
    it("should format a link to the docs root with default label", async () => {
      const { formatTerminalLink } = await import("../utils.js");
      const mockFormatTerminalLink = vi.mocked(formatTerminalLink);

      formatDocsRootLink();
      expect(mockFormatTerminalLink).toHaveBeenCalledWith(
        "https://docs.openclaw.ai",
        "https://docs.openclaw.ai",
        { fallback: "https://docs.openclaw.ai" },
      );
    });

    it("should format a link to the docs root with custom label", async () => {
      const { formatTerminalLink } = await import("../utils.js");
      const mockFormatTerminalLink = vi.mocked(formatTerminalLink);

      formatDocsRootLink("OpenClaw Docs");
      expect(mockFormatTerminalLink).toHaveBeenCalledWith(
        "OpenClaw Docs",
        "https://docs.openclaw.ai",
        { fallback: "https://docs.openclaw.ai" },
      );
    });
  });
});
