import { describe, expect, it } from "vitest";
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
  type QueueDropPolicy,
} from "./queue-helpers.js";

describe("elideQueueText", () => {
  it("should return original text if under limit", () => {
    expect(elideQueueText("short text", 20)).toBe("short text");
    expect(elideQueueText("exact", 5)).toBe("exact");
  });

  it("should elide text if over limit", () => {
    expect(elideQueueText("this is a long text", 10)).toBe("this is a…");
  });

  it("should handle limit of 0", () => {
    expect(elideQueueText("any text", 0)).toBe("…");
  });

  it("should handle negative limit", () => {
    expect(elideQueueText("any text", -5)).toBe("…");
  });

  it("should trim trailing whitespace before eliding", () => {
    expect(elideQueueText("text with trailing spaces   ", 15)).toBe("text with…");
  });

  it("should handle empty string", () => {
    expect(elideQueueText("", 10)).toBe("");
  });

  it("should use default limit of 140", () => {
    const longText = "a".repeat(150);
    expect(elideQueueText(longText)).toBe("a".repeat(139) + "…");
  });
});

describe("buildQueueSummaryLine", () => {
  it("should clean up whitespace and elide if necessary", () => {
    expect(buildQueueSummaryLine("text   with    multiple   spaces", 20)).toBe(
      "text with multiple…",
    );
  });

  it("should trim start and end whitespace", () => {
    expect(buildQueueSummaryLine("  text with spaces  ", 20)).toBe("text with spaces");
  });

  it("should handle empty string", () => {
    expect(buildQueueSummaryLine("", 20)).toBe("");
  });

  it("should handle whitespace-only string", () => {
    expect(buildQueueSummaryLine("   \t\n   ", 20)).toBe("");
  });

  it("should use default limit of 160", () => {
    const longText = "a".repeat(170);
    expect(buildQueueSummaryLine(longText)).toBe("a".repeat(159) + "…");
  });
});

describe("shouldSkipQueueItem", () => {
  it("should return false when dedupe is not provided", () => {
    const result = shouldSkipQueueItem({
      item: "test",
      items: ["existing"],
    });
    expect(result).toBe(false);
  });

  it("should return false when dedupe returns false", () => {
    const result = shouldSkipQueueItem({
      item: "test",
      items: ["existing"],
      dedupe: () => false,
    });
    expect(result).toBe(false);
  });

  it("should return true when dedupe returns true", () => {
    const result = shouldSkipQueueItem({
      item: "test",
      items: ["existing"],
      dedupe: () => true,
    });
    expect(result).toBe(true);
  });

  it("should pass item and items to dedupe function", () => {
    const dedupe = vi.fn().mockReturnValue(true);
    const item = "test";
    const items = ["existing"];

    shouldSkipQueueItem({ item, items, dedupe });

    expect(dedupe).toHaveBeenCalledWith(item, items);
  });
});

describe("applyQueueDropPolicy", () => {
  it("should return true when cap is 0", () => {
    const queue: QueueState<string> = {
      items: ["item1", "item2"],
      cap: 0,
      dropPolicy: "old",
      droppedCount: 0,
      summaryLines: [],
    };

    const result = applyQueueDropPolicy({ queue, summarize: (item) => item });
    expect(result).toBe(true);
  });

  it("should return true when items length is within cap", () => {
    const queue: QueueState<string> = {
      items: ["item1", "item2"],
      cap: 3,
      dropPolicy: "old",
      droppedCount: 0,
      summaryLines: [],
    };

    const result = applyQueueDropPolicy({ queue, summarize: (item) => item });
    expect(result).toBe(true);
    expect(queue.items).toEqual(["item1", "item2"]);
  });

  it("should return true when items length equals cap", () => {
    const queue: QueueState<string> = {
      items: ["item1", "item2"],
      cap: 2,
      dropPolicy: "old",
      droppedCount: 0,
      summaryLines: [],
    };

    const result = applyQueueDropPolicy({ queue, summarize: (item) => item });
    expect(result).toBe(true);
    expect(queue.items).toEqual(["item1", "item2"]);
  });

  it("should return false when drop policy is new and queue is over capacity", () => {
    const queue: QueueState<string> = {
      items: ["item1", "item2", "item3"],
      cap: 2,
      dropPolicy: "new",
      droppedCount: 0,
      summaryLines: [],
    };

    const result = applyQueueDropPolicy({ queue, summarize: (item) => item });
    expect(result).toBe(false);
    expect(queue.items).toEqual(["item1", "item2", "item3"]);
  });

  it("should drop old items when drop policy is old", () => {
    const queue: QueueState<string> = {
      items: ["item1", "item2", "item3"],
      cap: 2,
      dropPolicy: "old",
      droppedCount: 0,
      summaryLines: [],
    };

    const result = applyQueueDropPolicy({ queue, summarize: (item) => item });
    expect(result).toBe(true);
    expect(queue.items).toEqual(["item2", "item3"]);
  });

  it("should summarize dropped items when drop policy is summarize", () => {
    const queue: QueueState<string> = {
      items: ["item1", "item2", "item3"],
      cap: 2,
      dropPolicy: "summarize",
      droppedCount: 0,
      summaryLines: [],
    };

    const result = applyQueueDropPolicy({ queue, summarize: (item) => item });
    expect(result).toBe(true);
    expect(queue.items).toEqual(["item2", "item3"]);
    expect(queue.droppedCount).toBe(1);
    expect(queue.summaryLines).toEqual(["item1"]);
  });

  it("should limit summary lines to summaryLimit", () => {
    const queue: QueueState<string> = {
      items: ["item1", "item2", "item3", "item4", "item5"],
      cap: 2,
      dropPolicy: "summarize",
      droppedCount: 0,
      summaryLines: [],
    };

    const result = applyQueueDropPolicy({
      queue,
      summarize: (item) => item,
      summaryLimit: 2,
    });
    expect(result).toBe(true);
    expect(queue.items).toEqual(["item4", "item5"]);
    expect(queue.droppedCount).toBe(3);
    expect(queue.summaryLines).toEqual(["item2", "item3"]);
  });
});

describe("waitForQueueDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should resolve immediately when debounceMs is 0", async () => {
    const queue = {
      debounceMs: 0,
      lastEnqueuedAt: Date.now(),
    };

    const promise = waitForQueueDebounce(queue);
    await expect(promise).resolves.toBeUndefined();
  });

  it("should resolve immediately when debounceMs is negative", async () => {
    const queue = {
      debounceMs: -100,
      lastEnqueuedAt: Date.now(),
    };

    const promise = waitForQueueDebounce(queue);
    await expect(promise).resolves.toBeUndefined();
  });

  it("should wait for debounce period", async () => {
    const queue = {
      debounceMs: 100,
      lastEnqueuedAt: Date.now(),
    };

    const promise = waitForQueueDebounce(queue);

    // Should not resolve immediately
    let resolved = false;
    promise.then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(50);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(50);
    expect(resolved).toBe(true);
  });

  it("should extend wait if new item is enqueued", async () => {
    const queue = {
      debounceMs: 100,
      lastEnqueuedAt: Date.now(),
    };

    const promise = waitForQueueDebounce(queue);

    // Advance time halfway
    await vi.advanceTimersByTimeAsync(50);

    // Update lastEnqueuedAt to extend the wait
    queue.lastEnqueuedAt += 50;

    let resolved = false;
    promise.then(() => {
      resolved = true;
    });

    // Should not resolve yet
    await vi.advanceTimersByTimeAsync(50);
    expect(resolved).toBe(false);

    // Should resolve after additional time
    await vi.advanceTimersByTimeAsync(50);
    expect(resolved).toBe(true);
  });
});

describe("buildQueueSummaryPrompt", () => {
  it("should return undefined when drop policy is not summarize", () => {
    const state = {
      dropPolicy: "old" as QueueDropPolicy,
      droppedCount: 5,
      summaryLines: ["item1", "item2"],
    };

    const result = buildQueueSummaryPrompt({ state, noun: "message" });
    expect(result).toBeUndefined();
  });

  it("should return undefined when droppedCount is 0", () => {
    const state = {
      dropPolicy: "summarize" as QueueDropPolicy,
      droppedCount: 0,
      summaryLines: [],
    };

    const result = buildQueueSummaryPrompt({ state, noun: "message" });
    expect(result).toBeUndefined();
  });

  it("should build summary with default title", () => {
    const state = {
      dropPolicy: "summarize" as QueueDropPolicy,
      droppedCount: 3,
      summaryLines: ["item1", "item2"],
    };

    const result = buildQueueSummaryPrompt({ state, noun: "message" });
    expect(result).toBe(
      "[Queue overflow] Dropped 3 messages due to cap.\nSummary:\n- item1\n- item2",
    );
  });

  it("should build summary with custom title", () => {
    const state = {
      dropPolicy: "summarize" as QueueDropPolicy,
      droppedCount: 1,
      summaryLines: ["item1"],
    };

    const result = buildQueueSummaryPrompt({
      state,
      noun: "message",
      title: "Custom title",
    });
    expect(result).toBe("Custom title\nSummary:\n- item1");
  });

  it("should handle singular noun", () => {
    const state = {
      dropPolicy: "summarize" as QueueDropPolicy,
      droppedCount: 1,
      summaryLines: ["item1"],
    };

    const result = buildQueueSummaryPrompt({ state, noun: "message" });
    expect(result).toBe("[Queue overflow] Dropped 1 message due to cap.\nSummary:\n- item1");
  });

  it("should handle no summary lines", () => {
    const state = {
      dropPolicy: "summarize" as QueueDropPolicy,
      droppedCount: 2,
      summaryLines: [],
    };

    const result = buildQueueSummaryPrompt({ state, noun: "message" });
    expect(result).toBe("[Queue overflow] Dropped 2 messages due to cap.");
  });

  it("should reset droppedCount and summaryLines", () => {
    const state = {
      dropPolicy: "summarize" as QueueDropPolicy,
      droppedCount: 2,
      summaryLines: ["item1", "item2"],
    };

    buildQueueSummaryPrompt({ state, noun: "message" });

    expect(state.droppedCount).toBe(0);
    expect(state.summaryLines).toEqual([]);
  });
});

describe("buildCollectPrompt", () => {
  it("should build prompt with title and items", () => {
    const result = buildCollectPrompt({
      title: "Test Title",
      items: ["item1", "item2"],
      renderItem: (item, index) => `${index}: ${item}`,
    });

    expect(result).toBe("Test Title\n\n0: item1\n\n1: item2");
  });

  it("should include summary if provided", () => {
    const result = buildCollectPrompt({
      title: "Test Title",
      items: ["item1", "item2"],
      summary: "This is a summary",
      renderItem: (item, index) => `${index}: ${item}`,
    });

    expect(result).toBe("Test Title\nThis is a summary\n\n0: item1\n\n1: item2");
  });

  it("should handle empty items", () => {
    const result = buildCollectPrompt({
      title: "Test Title",
      items: [],
      renderItem: (item, index) => `${index}: ${item}`,
    });

    expect(result).toBe("Test Title");
  });
});

describe("hasCrossChannelItems", () => {
  it("should return false when no items", () => {
    const result = hasCrossChannelItems([], () => ({ key: "test", cross: false }));
    expect(result).toBe(false);
  });

  it("should return true when any item has cross flag", () => {
    const items = [
      { id: 1, channel: "telegram" },
      { id: 2, channel: "discord" },
    ];

    const result = hasCrossChannelItems(items, (item) => ({
      key: item.channel,
      cross: item.channel === "discord",
    }));

    expect(result).toBe(true);
  });

  it("should return true when items have different keys", () => {
    const items = [
      { id: 1, channel: "telegram" },
      { id: 2, channel: "discord" },
    ];

    const result = hasCrossChannelItems(items, (item) => ({
      key: item.channel,
      cross: false,
    }));

    expect(result).toBe(true);
  });

  it("should return true when some items have no key", () => {
    const items = [
      { id: 1, channel: "telegram" },
      { id: 2, channel: null },
    ];

    const result = hasCrossChannelItems(items, (item) => ({
      key: item.channel || undefined,
      cross: false,
    }));

    expect(result).toBe(true);
  });

  it("should return false when all items have the same key", () => {
    const items = [
      { id: 1, channel: "telegram" },
      { id: 2, channel: "telegram" },
    ];

    const result = hasCrossChannelItems(items, (item) => ({
      key: item.channel,
      cross: false,
    }));

    expect(result).toBe(false);
  });

  it("should return false when all items have no key", () => {
    const items = [
      { id: 1, channel: null },
      { id: 2, channel: null },
    ];

    const result = hasCrossChannelItems(items, (item) => ({
      key: undefined,
      cross: false,
    }));

    expect(result).toBe(false);
  });
});
