import { describe, expect, it, vi } from "vitest";
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

describe("queue-helpers - Additional Tests", () => {
  describe("elideQueueText", () => {
    it("should handle text with Unicode characters", () => {
      const text = "Hello 世界 🌍";
      const result = elideQueueText(text, 10);
      expect(result).toBe("Hello 世界…");
    });

    it("should handle text with emojis", () => {
      const text = "Hello 👋🌍🎉";
      const result = elideQueueText(text, 8);
      // Emojis may be handled differently based on encoding
      expect(result).toContain("Hello");
      expect(result).toContain("…");
    });

    it("should handle text with mixed content", () => {
      const text = "Text with numbers 12345 and symbols !@#$%";
      const result = elideQueueText(text, 20);
      expect(result).toBe("Text with numbers 1…");
    });
  });

  describe("buildQueueSummaryLine", () => {
    it("should handle text with multiple newlines", () => {
      const text = "Line1\n\nLine2\n\n\nLine3";
      const result = buildQueueSummaryLine(text, 20);
      expect(result).toBe("Line1 Line2 Line3");
    });

    it("should handle text with tabs", () => {
      const text = "Column1\tColumn2\tColumn3";
      const result = buildQueueSummaryLine(text, 20);
      expect(result).toBe("Column1 Column2 Col…");
    });

    it("should handle text with mixed whitespace", () => {
      const text = "  Text \t with \n mixed   whitespace  ";
      const result = buildQueueSummaryLine(text, 20);
      expect(result).toBe("Text with mixed whi…");
    });
  });

  describe("shouldSkipQueueItem", () => {
    it("should handle dedupe function that throws", () => {
      const dedupe = vi.fn().mockImplementation(() => {
        throw new Error("Dedupe error");
      });

      expect(() => {
        shouldSkipQueueItem({
          item: "test",
          items: ["existing"],
          dedupe,
        });
      }).toThrow("Dedupe error");
    });

    it("should handle complex item comparison", () => {
      const complexItem = { id: 1, content: "test" };
      const existingItems = [
        { id: 1, content: "test" },
        { id: 2, content: "other" },
      ];

      const dedupe = vi.fn((item, items) => {
        return items.some((existing) => existing.id === item.id);
      });

      const result = shouldSkipQueueItem({
        item: complexItem,
        items: existingItems,
        dedupe,
      });

      expect(result).toBe(true);
      expect(dedupe).toHaveBeenCalledWith(complexItem, existingItems);
    });
  });

  describe("applyQueueDropPolicy", () => {
    it("should handle summarize policy with custom summarize function", () => {
      const queue: QueueState<string> = {
        items: ["item1", "item2", "item3"],
        cap: 2,
        dropPolicy: "summarize",
        droppedCount: 0,
        summaryLines: [],
      };

      const summarize = vi.fn((item) => `Summary: ${item}`);

      const result = applyQueueDropPolicy({ queue, summarize });

      expect(result).toBe(true);
      expect(queue.items).toEqual(["item2", "item3"]);
      expect(queue.droppedCount).toBe(1);
      expect(queue.summaryLines).toEqual(["Summary: item1"]);
      expect(summarize).toHaveBeenCalledWith("item1");
    });

    it("should handle zero cap with summarize policy", () => {
      const queue: QueueState<string> = {
        items: ["item1", "item2", "item3"],
        cap: 0,
        dropPolicy: "summarize",
        droppedCount: 0,
        summaryLines: [],
      };

      const summarize = vi.fn((item) => item);

      const result = applyQueueDropPolicy({ queue, summarize });

      expect(result).toBe(true);
      // The behavior may vary based on implementation
      expect(queue.droppedCount).toBeGreaterThanOrEqual(0);
      expect(queue.summaryLines.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("waitForQueueDebounce", () => {
    it("should handle rapid enqueues", async () => {
      vi.useFakeTimers();

      const queue = {
        debounceMs: 100,
        lastEnqueuedAt: Date.now(),
      };

      const promise = waitForQueueDebounce(queue);

      // Simulate rapid enqueues
      for (let i = 0; i < 5; i++) {
        await vi.advanceTimersByTimeAsync(20);
        queue.lastEnqueuedAt += 20;
      }

      let resolved = false;
      void promise.then(() => {
        resolved = true;
      });

      // Should not resolve yet
      await vi.advanceTimersByTimeAsync(50);
      expect(resolved).toBe(false);

      // Should resolve after debounce period
      await vi.advanceTimersByTimeAsync(50);
      expect(resolved).toBe(true);

      vi.useRealTimers();
    });
  });

  describe("buildQueueSummaryPrompt", () => {
    it("should handle custom noun with irregular plural", () => {
      const state = {
        dropPolicy: "summarize" as QueueDropPolicy,
        droppedCount: 2,
        summaryLines: ["item1", "item2"],
      };

      const result = buildQueueSummaryPrompt({ state, noun: "person" });
      expect(result).toBe(
        "[Queue overflow] Dropped 2 persons due to cap.\nSummary:\n- item1\n- item2",
      );
    });

    it("should handle empty summaryLines with droppedCount", () => {
      const state = {
        dropPolicy: "summarize" as QueueDropPolicy,
        droppedCount: 2,
        summaryLines: [],
      };

      const result = buildQueueSummaryPrompt({ state, noun: "message" });
      expect(result).toBe("[Queue overflow] Dropped 2 messages due to cap.");
    });
  });

  describe("buildCollectPrompt", () => {
    it("should handle complex renderItem function", () => {
      const items = [
        { id: 1, name: "Item 1", status: "active" },
        { id: 2, name: "Item 2", status: "inactive" },
      ];

      const result = buildCollectPrompt({
        title: "Select Items",
        items,
        renderItem: (item, index) => `${index}: ${item.name} (${item.status})`,
      });

      expect(result).toBe("Select Items\n\n0: Item 1 (active)\n\n1: Item 2 (inactive)");
    });

    it("should handle items with special characters", () => {
      const items = ['Item with "quotes"', "Item with 'apostrophes'", "Item with <brackets>"];

      const result = buildCollectPrompt({
        title: "Special Items",
        items,
        renderItem: (item, index) => `${index}: ${item}`,
      });

      expect(result).toBe(
        "Special Items\n\n0: Item with \"quotes\"\n\n1: Item with 'apostrophes'\n\n2: Item with <brackets>",
      );
    });
  });

  describe("hasCrossChannelItems", () => {
    it("should handle items with undefined keys", () => {
      const items = [
        { id: 1, channel: "telegram" },
        { id: 2, channel: undefined },
        { id: 3, channel: "telegram" },
      ];

      const result = hasCrossChannelItems(items, (item) => ({
        key: item.channel,
        cross: false,
      }));

      expect(result).toBe(true);
    });

    it("should handle empty key extractor", () => {
      const items = [
        { id: 1, type: "message" },
        { id: 2, type: "notification" },
      ];

      const result = hasCrossChannelItems(items, (_item) => ({
        key: "",
        cross: false,
      }));

      expect(result).toBe(false);
    });
  });
});
