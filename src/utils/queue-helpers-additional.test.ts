import { describe, expect, it, vi } from "vitest";
import { elideQueueText, buildQueueSummaryLine, shouldSkipQueueItem } from "./queue-helpers.js";

describe("queue-helpers - Additional Tests", () => {
  describe("elideQueueText", () => {
    it("handles empty text", () => {
      expect(elideQueueText("", 100)).toBe("");
    });

    it("handles text shorter than max length", () => {
      expect(elideQueueText("short", 100)).toBe("short");
    });

    it("handles text equal to max length", () => {
      expect(elideQueueText("exactly100characters".padEnd(100, "x"), 100)).toHaveLength(100);
    });

    it("handles text longer than max length", () => {
      expect(elideQueueText("this is a very long text that exceeds the maximum length", 20)).toBe(
        "this is a very long…",
      );
    });

    it("preserves Unicode characters", () => {
      expect(elideQueueText("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥", 15)).toBe("🔥🔥🔥🔥🔥🔥🔥…");
    });
  });

  describe("buildQueueSummaryLine", () => {
    it("handles empty text", () => {
      expect(buildQueueSummaryLine("", 100)).toBe("");
    });

    it("handles short text", () => {
      expect(buildQueueSummaryLine("short summary", 100)).toBe("short summary");
    });

    it("handles text with extra whitespace", () => {
      expect(buildQueueSummaryLine("  multiple   spaces  \t here  ", 100)).toBe(
        "multiple spaces here",
      );
    });

    it("handles text longer than limit", () => {
      expect(buildQueueSummaryLine("this is a very long summary that exceeds the limit", 20)).toBe(
        "this is a very long…",
      );
    });
  });

  describe("shouldSkipQueueItem", () => {
    it("returns false when no dedupe function provided", () => {
      expect(
        shouldSkipQueueItem({
          item: "test",
          items: ["test", "test2"],
        }),
      ).toBe(false);
    });

    it("calls dedupe function when provided", () => {
      const dedupeFn = vi.fn(() => true);
      expect(
        shouldSkipQueueItem({
          item: "test",
          items: ["test", "test2"],
          dedupe: dedupeFn,
        }),
      ).toBe(true);
      expect(dedupeFn).toHaveBeenCalledWith("test", ["test", "test2"]);
    });

    it("passes dedupe function result through", () => {
      const dedupeFn = vi.fn(() => false);
      expect(
        shouldSkipQueueItem({
          item: "test",
          items: ["test", "test2"],
          dedupe: dedupeFn,
        }),
      ).toBe(false);
    });
  });
});
