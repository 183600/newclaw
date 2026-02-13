import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  setCommandLaneConcurrency,
  enqueueCommandInLane,
  enqueueCommand,
  getQueueSize,
  getTotalQueueSize,
  clearCommandLane,
} from "./command-queue.js";
import { CommandLane } from "./lanes.js";

// Mock dependencies
vi.mock("../logging/diagnostic.js");

import { diagnosticLogger as diag, logLaneDequeue, logLaneEnqueue } from "../logging/diagnostic.js";

const mockDiag = {
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
vi.mocked(diag).mockImplementation(() => mockDiag);

describe("command-queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // Clear all lanes after each test
    clearCommandLane(CommandLane.Main);
  });

  describe("enqueueCommand", () => {
    it("executes task in main lane", async () => {
      const task = vi.fn().mockResolvedValue("result");
      const promise = enqueueCommand(task);

      expect(task).not.toHaveBeenCalled();

      vi.advanceTimersByTime(0);
      await promise;

      expect(task).toHaveBeenCalledTimes(1);
    });

    it("handles task rejection", async () => {
      const error = new Error("Task failed");
      const task = vi.fn().mockRejectedValue(error);

      await expect(enqueueCommand(task)).rejects.toThrow("Task failed");
      expect(mockDiag.error).toHaveBeenCalledWith(expect.stringContaining("lane task error"));
    });

    it("respects warnAfterMs option", async () => {
      const task = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("result"), 3000);
        });
      });

      const onWait = vi.fn();
      const promise = enqueueCommand(task, { warnAfterMs: 2000, onWait });

      vi.advanceTimersByTime(2000);
      expect(onWait).toHaveBeenCalledWith(2000, 0);
      expect(mockDiag.warn).toHaveBeenCalledWith(expect.stringContaining("lane wait exceeded"));

      vi.advanceTimersByTime(1000);
      await promise;
    });

    it("handles onWait callback", async () => {
      const task = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("result"), 3000);
        });
      });

      const onWait = vi.fn();
      const promise = enqueueCommand(task, { warnAfterMs: 1000, onWait });

      vi.advanceTimersByTime(1000);
      expect(onWait).toHaveBeenCalledWith(1000, 0);

      vi.advanceTimersByTime(2000);
      await promise;
    });
  });

  describe("enqueueCommandInLane", () => {
    it("executes tasks in separate lanes concurrently", async () => {
      const task1 = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("result1"), 100);
        });
      });
      const task2 = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("result2"), 100);
        });
      });

      const promise1 = enqueueCommandInLane("lane1", task1);
      const promise2 = enqueueCommandInLane("lane2", task2);

      vi.advanceTimersByTime(0);
      expect(task1).toHaveBeenCalled();
      expect(task2).toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe("result1");
      expect(result2).toBe("result2");
    });

    it("serializes tasks in same lane", async () => {
      const task1 = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("result1"), 100);
        });
      });
      const task2 = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("result2"), 100);
        });
      });

      const promise1 = enqueueCommandInLane("test-lane", task1);
      const promise2 = enqueueCommandInLane("test-lane", task2);

      vi.advanceTimersByTime(0);
      expect(task1).toHaveBeenCalled();
      expect(task2).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      const result1 = await promise1;
      expect(result1).toBe("result1");
      expect(task2).toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      const result2 = await promise2;
      expect(result2).toBe("result2");
    });

    it("normalizes lane names", async () => {
      const task = vi.fn().mockResolvedValue("result");
      const promise = enqueueCommandInLane("  test-lane  ", task);

      vi.advanceTimersByTime(0);
      await promise;

      expect(task).toHaveBeenCalled();
    });

    it("uses main lane for empty lane name", async () => {
      const task = vi.fn().mockResolvedValue("result");
      const promise = enqueueCommandInLane("", task);

      vi.advanceTimersByTime(0);
      await promise;

      expect(task).toHaveBeenCalled();
      expect(getQueueSize(CommandLane.Main)).toBe(0);
    });
  });

  describe("setCommandLaneConcurrency", () => {
    it("sets concurrency for lane", async () => {
      setCommandLaneConcurrency("concurrent-lane", 2);

      const task1 = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("result1"), 100);
        });
      });
      const task2 = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("result2"), 100);
        });
      });

      const promise1 = enqueueCommandInLane("concurrent-lane", task1);
      const promise2 = enqueueCommandInLane("concurrent-lane", task2);

      vi.advanceTimersByTime(0);
      expect(task1).toHaveBeenCalled();
      expect(task2).toHaveBeenCalled(); // Both should run concurrently

      vi.advanceTimersByTime(100);
      await Promise.all([promise1, promise2]);
    });

    it("enforces minimum concurrency of 1", () => {
      setCommandLaneConcurrency("test-lane", 0);
      setCommandLaneConcurrency("test-lane", -5);

      // Should not throw and should default to 1
      expect(getQueueSize("test-lane")).toBe(0);
    });

    it("normalizes lane names", () => {
      setCommandLaneConcurrency("  test-lane  ", 2);
      // Should not throw
      expect(getQueueSize("test-lane")).toBe(0);
    });
  });

  describe("getQueueSize", () => {
    it("returns 0 for non-existent lane", () => {
      expect(getQueueSize("non-existent")).toBe(0);
    });

    it("returns combined queue and active count", async () => {
      const task1 = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("result1"), 100);
        });
      });
      const task2 = vi.fn().mockResolvedValue("result2");

      const promise1 = enqueueCommandInLane("size-test", task1);
      enqueueCommandInLane("size-test", task2);

      vi.advanceTimersByTime(0);
      expect(getQueueSize("size-test")).toBe(2); // 1 active + 1 queued

      vi.advanceTimersByTime(100);
      await promise1;
      vi.advanceTimersByTime(0);
      expect(getQueueSize("size-test")).toBe(1); // 1 active

      vi.advanceTimersByTime(0);
      expect(getQueueSize("size-test")).toBe(0); // Empty
    });

    it("normalizes lane names", () => {
      expect(getQueueSize("  ")).toBe(getQueueSize(CommandLane.Main));
    });
  });

  describe("getTotalQueueSize", () => {
    it("returns sum of all lane sizes", async () => {
      const task1 = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("result1"), 100);
        });
      });
      const task2 = vi.fn().mockResolvedValue("result2");

      enqueueCommandInLane("lane1", task1);
      enqueueCommandInLane("lane2", task2);

      vi.advanceTimersByTime(0);
      expect(getTotalQueueSize()).toBe(2); // 1 in each lane
    });

    it("returns 0 when no lanes exist", () => {
      expect(getTotalQueueSize()).toBe(0);
    });
  });

  describe("clearCommandLane", () => {
    it("clears queued tasks but not active ones", async () => {
      const task1 = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("result1"), 100);
        });
      });
      const task2 = vi.fn().mockResolvedValue("result2");
      const task3 = vi.fn().mockResolvedValue("result3");

      const promise1 = enqueueCommandInLane("clear-test", task1);
      enqueueCommandInLane("clear-test", task2);
      enqueueCommandInLane("clear-test", task3);

      vi.advanceTimersByTime(0);
      expect(getQueueSize("clear-test")).toBe(3);

      const cleared = clearCommandLane("clear-test");
      expect(cleared).toBe(2); // 2 tasks were queued
      expect(getQueueSize("clear-test")).toBe(1); // 1 active task remains

      vi.advanceTimersByTime(100);
      await promise1;
      expect(getQueueSize("clear-test")).toBe(0);
    });

    it("returns 0 for non-existent lane", () => {
      const cleared = clearCommandLane("non-existent");
      expect(cleared).toBe(0);
    });

    it("normalizes lane names", () => {
      const cleared = clearCommandLane("  ");
      expect(cleared).toBe(0);
    });
  });

  describe("probe lane error suppression", () => {
    it("suppresses errors for probe lanes", async () => {
      const error = new Error("Probe failed");
      const task = vi.fn().mockRejectedValue(error);

      await expect(enqueueCommandInLane("auth-probe:test", task)).rejects.toThrow("Probe failed");
      expect(mockDiag.error).not.toHaveBeenCalled();

      await expect(enqueueCommandInLane("session:probe-test", task)).rejects.toThrow(
        "Probe failed",
      );
      expect(mockDiag.error).not.toHaveBeenCalled();
    });

    it("logs errors for non-probe lanes", async () => {
      const error = new Error("Regular task failed");
      const task = vi.fn().mockRejectedValue(error);

      await expect(enqueueCommandInLane("regular-lane", task)).rejects.toThrow(
        "Regular task failed",
      );
      expect(mockDiag.error).toHaveBeenCalledWith(expect.stringContaining("lane task error"));
    });
  });

  describe("logging", () => {
    it("logs enqueue and dequeue events", async () => {
      const task = vi.fn().mockResolvedValue("result");
      const onWait = vi.fn();

      const promise = enqueueCommandInLane("logging-test", task, {
        warnAfterMs: 1000,
        onWait,
      });

      expect(logLaneEnqueue).toHaveBeenCalledWith("logging-test", 1);

      vi.advanceTimersByTime(0);
      expect(logLaneDequeue).toHaveBeenCalledWith("logging-test", 0, 0);

      vi.advanceTimersByTime(0);
      await promise;
    });
  });
});
