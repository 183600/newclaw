import { describe, it, expect, vi } from "vitest";
import {
  elideQueueText,
  buildQueueSummaryLine,
  shouldSkipQueueItem,
  applyQueueDropPolicy,
  waitForQueueDebounce,
  buildQueueSummaryPrompt,
  buildCollectPrompt,
  hasCrossChannelItems,
  type QueueState,
} from "./queue-helpers";

describe("elideQueueText", () => {
  it("should return text as-is when under limit", () => {
    expect(elideQueueText("short text")).toBe("short text");
    expect(elideQueueText("exact limit", 11)).toBe("exact limit");
  });

  it("should elide text when over limit", () => {
    expect(elideQueueText("this is a long text", 10)).toBe("this is a…");
    expect(elideQueueText("verylongword", 5)).toBe("very…");
  });

  it("should handle edge cases", () => {
    expect(elideQueueText("", 5)).toBe("");
    expect(elideQueueText("a", 0)).toBe("…");
    expect(elideQueueText("text", -1)).toBe("…");
  });
});

describe("buildQueueSummaryLine", () => {
  it("should normalize whitespace and elide text", () => {
    expect(buildQueueSummaryLine("  multiple   spaces  ")).toBe("multiple spaces");
    expect(buildQueueSummaryLine("line\nbreaks\tand\ttabs")).toBe("line breaks and tabs");
  });

  it("should elide long text", () => {
    const longText = "a".repeat(200);
    const result = buildQueueSummaryLine(longText);
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result).toMatch(/…$/);
  });

  it("should handle empty input", () => {
    expect(buildQueueSummaryLine("")).toBe("");
    expect(buildQueueSummaryLine("   ")).toBe("");
  });
});

describe("shouldSkipQueueItem", () => {
  it("should not skip when no dedupe function provided", () => {
    expect(shouldSkipQueueItem({ item: "test", items: [] })).toBe(false);
  });

  it("should use dedupe function to determine skip", () => {
    const dedupe = vi.fn((item: string, items: string[]) => items.includes(item));

    expect(shouldSkipQueueItem({ item: "test", items: ["other"], dedupe })).toBe(false);
    expect(shouldSkipQueueItem({ item: "test", items: ["test"], dedupe })).toBe(true);
    expect(dedupe).toHaveBeenCalledTimes(2);
  });
});

describe("applyQueueDropPolicy", () => {
  it("should accept when under capacity", () => {
    const queue: QueueState<string> = {
      items: ["a", "b"],
      cap: 5,
      dropPolicy: "old",
      droppedCount: 0,
      summaryLines: [],
    };

    expect(applyQueueDropPolicy({ queue, summarize: (x) => x })).toBe(true);
    expect(queue.items).toEqual(["a", "b"]);
  });

  it("should reject new items when dropPolicy is 'new'", () => {
    const queue: QueueState<string> = {
      items: ["a", "b", "c"],
      cap: 2,
      dropPolicy: "new",
      droppedCount: 0,
      summaryLines: [],
    };

    expect(applyQueueDropPolicy({ queue, summarize: (x) => x })).toBe(false);
    expect(queue.items).toEqual(["a", "b", "c"]);
  });

  it("should drop old items when dropPolicy is 'old'", () => {
    const queue: QueueState<string> = {
      items: ["a", "b", "c"],
      cap: 2,
      dropPolicy: "old",
      droppedCount: 0,
      summaryLines: [],
    };

    expect(applyQueueDropPolicy({ queue, summarize: (x) => x })).toBe(true);
    expect(queue.items).toEqual(["c"]);
  });

  it("should summarize dropped items when dropPolicy is 'summarize'", () => {
    const queue: QueueState<string> = {
      items: ["a", "b", "c"],
      cap: 2,
      dropPolicy: "summarize",
      droppedCount: 0,
      summaryLines: [],
    };

    expect(applyQueueDropPolicy({ queue, summarize: (x) => x.toUpperCase() })).toBe(true);
    expect(queue.items).toEqual(["c"]);
    expect(queue.droppedCount).toBe(2);
    expect(queue.summaryLines).toEqual(["A", "B"]);
  });

  it("should limit summary lines", () => {
    const queue: QueueState<string> = {
      items: ["a", "b", "c", "d", "e"],
      cap: 2,
      dropPolicy: "summarize",
      droppedCount: 0,
      summaryLines: ["existing"],
    };

    expect(applyQueueDropPolicy({ queue, summarize: (x) => x, summaryLimit: 2 })).toBe(true);
    expect(queue.items).toEqual(["e"]);
    expect(queue.droppedCount).toBe(4);
    expect(queue.summaryLines).toEqual(["c", "d"]);
  });
});

describe("waitForQueueDebounce", () => {
  it("should resolve immediately when debounceMs is 0", async () => {
    const queue = { debounceMs: 0, lastEnqueuedAt: Date.now() };
    const start = Date.now();
    await waitForQueueDebounce(queue);
    expect(Date.now() - start).toBeLessThan(10);
  });

  it("should wait for debounce period", async () => {
    const queue = { debounceMs: 50, lastEnqueuedAt: Date.now() };
    const start = Date.now();
    await waitForQueueDebounce(queue);
    expect(Date.now() - start).toBeGreaterThanOrEqual(45);
  });
});

describe("buildQueueSummaryPrompt", () => {
  it("should return undefined when not summarize policy", () => {
    const state = {
      dropPolicy: "old" as const,
      droppedCount: 5,
      summaryLines: ["a", "b"],
    };

    expect(buildQueueSummaryPrompt({ state, noun: "message" })).toBeUndefined();
  });

  it("should return undefined when no dropped items", () => {
    const state = {
      dropPolicy: "summarize" as const,
      droppedCount: 0,
      summaryLines: [],
    };

    expect(buildQueueSummaryPrompt({ state, noun: "message" })).toBeUndefined();
  });

  it("should build summary prompt with dropped items", () => {
    const state = {
      dropPolicy: "summarize" as const,
      droppedCount: 2,
      summaryLines: ["msg1", "msg2"],
    };

    const result = buildQueueSummaryPrompt({ state, noun: "message" });
    expect(result).toContain("Dropped 2 messages");
    expect(result).toContain("Summary:");
    expect(result).toContain("- msg1");
    expect(result).toContain("- msg2");
  });

  it("should reset state after building prompt", () => {
    const state = {
      dropPolicy: "summarize" as const,
      droppedCount: 2,
      summaryLines: ["msg1"],
    };

    buildQueueSummaryPrompt({ state, noun: "message" });
    expect(state.droppedCount).toBe(0);
    expect(state.summaryLines).toEqual([]);
  });
});

describe("buildCollectPrompt", () => {
  it("should build prompt with title and items", () => {
    const result = buildCollectPrompt({
      title: "Test Collection",
      items: ["item1", "item2"],
      renderItem: (item, idx) => `${idx + 1}. ${item}`,
    });

    expect(result).toBe("Test Collection\n\n1. item1\n\n2. item2");
  });

  it("should include summary when provided", () => {
    const result = buildCollectPrompt({
      title: "Test Collection",
      items: ["item1"],
      summary: "Previous summary",
      renderItem: (item) => `- ${item}`,
    });

    expect(result).toBe("Test Collection\n\nPrevious summary\n\n- item1");
  });
});

describe("hasCrossChannelItems", () => {
  it("should return false for empty items", () => {
    expect(hasCrossChannelItems([], () => ({ key: "test", cross: false }))).toBe(false);
  });

  it("should return true when any item is cross-channel", () => {
    const items = [{ id: 1 }, { id: 2 }];
    const resolveKey = (item: any) => ({
      key: item.id.toString(),
      cross: item.id === 2,
    });

    expect(hasCrossChannelItems(items, resolveKey)).toBe(true);
  });

  it("should return true when multiple different keys exist", () => {
    const items = [{ id: 1 }, { id: 2 }];
    const resolveKey = (item: any) => ({
      key: item.id.toString(),
      cross: false,
    });

    expect(hasCrossChannelItems(items, resolveKey)).toBe(true);
  });

  it("should return true when there are unkeyed items with other keyed items", () => {
    const items = [{ id: 1 }, { id: undefined }];
    const resolveKey = (item: any) => ({
      key: item.id?.toString(),
      cross: false,
    });

    expect(hasCrossChannelItems(items, resolveKey)).toBe(true);
  });

  it("should return false when all items have the same key", () => {
    const items = [{ id: 1 }, { id: 1 }];
    const resolveKey = (item: any) => ({
      key: item.id.toString(),
      cross: false,
    });

    expect(hasCrossChannelItems(items, resolveKey)).toBe(false);
  });
});
