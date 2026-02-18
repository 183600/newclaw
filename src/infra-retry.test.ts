import { describe, expect, it, vi } from "vitest";
import { retryAsync, resolveRetryConfig } from "./infra/retry.js";

describe("retryAsync", () => {
  describe("basic functionality", () => {
    it("returns result on first successful attempt", async () => {
      const fn = vi.fn().mockResolvedValue("success");
      const result = await retryAsync(fn);
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("retries on failure and returns success", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("success");

      const result = await retryAsync(fn, 5, 10);
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("throws after max attempts when all fail", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("always fails"));

      await expect(retryAsync(fn, 3, 10)).rejects.toThrow("always fails");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("handles single attempt", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("fails"));

      await expect(retryAsync(fn, 1, 10)).rejects.toThrow("fails");
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("options object", () => {
    it("uses default config when options are empty", async () => {
      const fn = vi.fn().mockRejectedValueOnce(new Error("fail 1")).mockResolvedValue("success");

      const result = await retryAsync(fn, {});
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("respects custom attempts", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("always fails"));

      await expect(retryAsync(fn, { attempts: 5 })).rejects.toThrow("always fails");
      expect(fn).toHaveBeenCalledTimes(5);
    });

    it("respects custom delays", async () => {
      const fn = vi.fn().mockRejectedValueOnce(new Error("fail 1")).mockResolvedValue("success");

      const start = Date.now();
      await retryAsync(fn, { attempts: 3, minDelayMs: 100 });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(100);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("applies jitter", async () => {
      const fn = vi.fn().mockRejectedValueOnce(new Error("fail 1")).mockResolvedValue("success");

      const start = Date.now();
      await retryAsync(fn, { attempts: 3, minDelayMs: 100, jitter: 0.5 });
      const elapsed = Date.now() - start;

      // With jitter, delay should be between 50ms and 150ms
      expect(elapsed).toBeGreaterThanOrEqual(50);
      expect(elapsed).toBeLessThan(200);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("calls onRetry callback", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("success");

      const onRetry = vi.fn();
      await retryAsync(fn, { attempts: 5, minDelayMs: 10, onRetry });

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith({
        attempt: 1,
        maxAttempts: 5,
        delayMs: expect.any(Number),
        err: new Error("fail 1"),
        label: undefined,
      });
      expect(onRetry).toHaveBeenCalledWith({
        attempt: 2,
        maxAttempts: 5,
        delayMs: expect.any(Number),
        err: new Error("fail 2"),
        label: undefined,
      });
    });

    it("includes label in onRetry callback", async () => {
      const fn = vi.fn().mockRejectedValueOnce(new Error("fail 1")).mockResolvedValue("success");

      const onRetry = vi.fn();
      await retryAsync(fn, { attempts: 3, minDelayMs: 10, onRetry, label: "test-op" });

      expect(onRetry).toHaveBeenCalledWith({
        attempt: 1,
        maxAttempts: 3,
        delayMs: expect.any(Number),
        err: new Error("fail 1"),
        label: "test-op",
      });
    });

    it("respects shouldRetry function", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("retryable"))
        .mockRejectedValueOnce(new Error("non-retryable"))
        .mockResolvedValue("success");

      const shouldRetry = vi.fn((err, _attempt) => err.message !== "non-retryable");

      await expect(retryAsync(fn, { attempts: 5, shouldRetry })).rejects.toThrow("non-retryable");
      expect(fn).toHaveBeenCalledTimes(2);
      expect(shouldRetry).toHaveBeenCalledTimes(2);
    });

    it("uses retryAfterMs when available", async () => {
      const fn = vi.fn().mockRejectedValueOnce({ retryAfter: 50 }).mockResolvedValue("success");

      const retryAfterMs = vi.fn((err) => err.retryAfter);
      const start = Date.now();
      await retryAsync(fn, { attempts: 3, minDelayMs: 10, retryAfterMs });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(50);
      expect(retryAfterMs).toHaveBeenCalledTimes(1);
    });
  });

  describe("edge cases", () => {
    it("handles zero minDelayMs", async () => {
      const fn = vi.fn().mockRejectedValueOnce(new Error("fail 1")).mockResolvedValue("success");

      const start = Date.now();
      await retryAsync(fn, { attempts: 3, minDelayMs: 0 });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(50);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("handles maxDelayMs limit", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("success");

      const start = Date.now();
      await retryAsync(fn, { attempts: 4, minDelayMs: 100, maxDelayMs: 150 });
      const elapsed = Date.now() - start;

      // Second retry would be 400ms (100 * 2^2), but should be capped at 150ms
      expect(elapsed).toBeLessThan(300);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("handles infinite maxDelayMs", async () => {
      const fn = vi.fn().mockRejectedValueOnce(new Error("fail 1")).mockResolvedValue("success");

      // Should not throw when maxDelayMs is infinite
      await expect(
        retryAsync(fn, { attempts: 3, minDelayMs: 10, maxDelayMs: Infinity }),
      ).resolves.toBe("success");
    });

    it("handles negative retryAfterMs", async () => {
      const fn = vi.fn().mockRejectedValueOnce({ retryAfter: -50 }).mockResolvedValue("success");

      const retryAfterMs = vi.fn((err) => err.retryAfter);
      await retryAsync(fn, { attempts: 3, minDelayMs: 10, retryAfterMs });

      // Should use minDelayMs when retryAfterMs is negative
      expect(retryAfterMs).toHaveBeenCalledTimes(1);
    });

    it("handles NaN retryAfterMs", async () => {
      const fn = vi.fn().mockRejectedValueOnce({ retryAfter: NaN }).mockResolvedValue("success");

      const retryAfterMs = vi.fn((err) => err.retryAfter);
      await retryAsync(fn, { attempts: 3, minDelayMs: 10, retryAfterMs });

      // Should use exponential backoff when retryAfterMs is NaN
      expect(retryAfterMs).toHaveBeenCalledTimes(1);
    });
  });
});

describe("resolveRetryConfig", () => {
  describe("default values", () => {
    it("returns defaults when no overrides", () => {
      const config = resolveRetryConfig();
      expect(config).toEqual({
        attempts: 3,
        minDelayMs: 300,
        maxDelayMs: 30000,
        jitter: 0,
      });
    });

    it("merges with custom defaults", () => {
      const defaults = { attempts: 5, minDelayMs: 100, maxDelayMs: 10000, jitter: 0.2 };
      const config = resolveRetryConfig(defaults);
      expect(config).toEqual(defaults);
    });
  });

  describe("attempts validation", () => {
    it("clamps attempts to minimum of 1", () => {
      const config = resolveRetryConfig(undefined, { attempts: 0 });
      expect(config.attempts).toBe(1);

      const config2 = resolveRetryConfig(undefined, { attempts: -5 });
      expect(config2.attempts).toBe(1);
    });

    it("rounds attempts to integer", () => {
      const config = resolveRetryConfig(undefined, { attempts: 3.7 });
      expect(config.attempts).toBe(4);

      const config2 = resolveRetryConfig(undefined, { attempts: 3.2 });
      expect(config2.attempts).toBe(3);
    });

    it("handles non-finite attempts", () => {
      const config = resolveRetryConfig(undefined, { attempts: Infinity });
      expect(config.attempts).toBe(3);

      const config2 = resolveRetryConfig(undefined, { attempts: NaN });
      expect(config2.attempts).toBe(3);
    });
  });

  describe("delay validation", () => {
    it("clamps minDelayMs to minimum of 0", () => {
      const config = resolveRetryConfig(undefined, { minDelayMs: -100 });
      expect(config.minDelayMs).toBe(0);
    });

    it("ensures maxDelayMs is at least minDelayMs", () => {
      const config = resolveRetryConfig(undefined, { minDelayMs: 500, maxDelayMs: 300 });
      expect(config.maxDelayMs).toBe(500);
    });

    it("rounds delays to integers", () => {
      const config = resolveRetryConfig(undefined, { minDelayMs: 123.7, maxDelayMs: 456.2 });
      expect(config.minDelayMs).toBe(124);
      expect(config.maxDelayMs).toBe(456);
    });

    it("handles non-finite delays", () => {
      const config = resolveRetryConfig(undefined, { minDelayMs: Infinity, maxDelayMs: NaN });
      expect(config.minDelayMs).toBe(300);
      expect(config.maxDelayMs).toBe(30000); // defaults.maxDelayMs
    });
  });

  describe("jitter validation", () => {
    it("clamps jitter between 0 and 1", () => {
      const config = resolveRetryConfig(undefined, { jitter: -0.5 });
      expect(config.jitter).toBe(0);

      const config2 = resolveRetryConfig(undefined, { jitter: 1.5 });
      expect(config2.jitter).toBe(1);
    });

    it("handles non-finite jitter", () => {
      const config = resolveRetryConfig(undefined, { jitter: Infinity });
      expect(config.jitter).toBe(0);

      const config2 = resolveRetryConfig(undefined, { jitter: NaN });
      expect(config2.jitter).toBe(0);
    });
  });
});
