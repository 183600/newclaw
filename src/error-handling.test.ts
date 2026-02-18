import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { retryAsync } from "./infra/retry.js";

describe("Error Handling", () => {
  describe("Error Types", () => {
    it("categorizes different error types", () => {
      const networkError = new Error("Network timeout");
      const validationError = new Error("Invalid input");
      const authError = new Error("Unauthorized access");

      // Simulate error categorization
      const categorizeError = (error: Error) => {
        if (error.message.includes("Network") || error.message.includes("timeout")) {
          return "network";
        }
        if (error.message.includes("Invalid") || error.message.includes("validation")) {
          return "validation";
        }
        if (error.message.includes("Unauthorized") || error.message.includes("auth")) {
          return "authentication";
        }
        return "unknown";
      };

      expect(categorizeError(networkError)).toBe("network");
      expect(categorizeError(validationError)).toBe("validation");
      expect(categorizeError(authError)).toBe("authentication");
    });

    it("determines retryable errors", () => {
      const retryableErrors = [
        new Error("Network timeout"),
        new Error("Connection lost"),
        new Error("Service temporarily unavailable"),
      ];

      const nonRetryableErrors = [
        new Error("Invalid input"),
        new Error("Unauthorized access"),
        new Error("Not found"),
      ];

      const isRetryableError = (error: Error) => {
        const retryablePatterns = ["timeout", "connection", "temporary", "network", "service"];

        return retryablePatterns.some((pattern) => error.message.toLowerCase().includes(pattern));
      };

      retryableErrors.forEach((error) => {
        expect(isRetryableError(error)).toBe(true);
      });

      nonRetryableErrors.forEach((error) => {
        expect(isRetryableError(error)).toBe(false);
      });
    });
  });

  describe("Error Context", () => {
    it("creates error context with metadata", () => {
      const error = new Error("Test error");
      const metadata = {
        userId: "user123",
        operation: "test-operation",
        requestId: "req456",
      };

      const context = {
        error,
        metadata,
        timestamp: new Date(),
        id: `error-${Date.now()}`,
      };

      expect(context.error).toBe(error);
      expect(context.metadata).toEqual(metadata);
      expect(context.timestamp).toBeDefined();
      expect(context.id).toBeDefined();
    });

    it("captures stack trace information", () => {
      const error = new Error("Test error");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("Error: Test error");
    });
  });

  describe("Retry Functionality", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("retries on retryable errors", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockResolvedValue("success");

      const promise = retryAsync(operation, 3, 100);

      // First retry after 100ms
      vi.advanceTimersByTime(100);
      // Second retry after 100ms
      vi.advanceTimersByTime(100);

      const result = await promise;

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("does not retry on non-retryable errors", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("Invalid input"));

      await expect(retryAsync(operation, 3, 100)).rejects.toThrow("Invalid input");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("respects maximum retry attempts", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("Persistent failure"));

      const promise = retryAsync(operation, 3, 100);

      // Advance through all retry attempts
      vi.advanceTimersByTime(100); // First retry
      vi.advanceTimersByTime(100); // Second retry

      await expect(promise).rejects.toThrow("Persistent failure");
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it("uses retry options object", async () => {
      const options: RetryOptions = {
        maxAttempts: 3,
        delayMs: 100,
      };

      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockResolvedValue("success");

      const promise = retryAsync(operation, options);

      // First retry after 100ms
      vi.advanceTimersByTime(100);
      // Second retry after 100ms
      vi.advanceTimersByTime(100);

      const result = await promise;

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("uses shouldRetry function", async () => {
      const options: RetryOptions = {
        maxAttempts: 3,
        delayMs: 100,
        shouldRetry: (error: Error) => error.message.includes("Network"),
      };

      const networkError = vi
        .fn()
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockResolvedValue("success");

      const validationError = vi.fn().mockRejectedValue(new Error("Invalid input"));

      // Should retry network error
      const networkPromise = retryAsync(networkError, options);
      vi.advanceTimersByTime(100);
      vi.advanceTimersByTime(100);
      await expect(networkPromise).resolves.toBe("success");

      // Should not retry validation error
      await expect(retryAsync(validationError, options)).rejects.toThrow("Invalid input");
      expect(validationError).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Recovery", () => {
    it("attempts automatic recovery strategies", async () => {
      const error = new Error("Connection lost");
      const recoveryStrategies = [
        {
          name: "reconnect",
          canHandle: (err: Error) => err.message.includes("Connection"),
          recover: vi.fn().mockResolvedValue(true),
        },
        {
          name: "reset",
          canHandle: (err: Error) => err.message.includes("lost"),
          recover: vi.fn().mockResolvedValue(false),
        },
      ];

      for (const strategy of recoveryStrategies) {
        if (strategy.canHandle(error)) {
          const recovered = await strategy.recover(error);
          if (recovered) {
            expect(strategy.recover).toHaveBeenCalledWith(error);
            break;
          }
        }
      }
    });

    it("falls back through multiple strategies", async () => {
      const error = new Error("Service unavailable");
      const strategy1 = {
        name: "restart",
        recover: vi.fn().mockResolvedValue(false),
      };
      const strategy2 = {
        name: "fallback",
        recover: vi.fn().mockResolvedValue(true),
      };

      const strategies = [strategy1, strategy2];

      for (const strategy of strategies) {
        const recovered = await strategy.recover(error);
        if (recovered) {
          expect(strategy.recover).toHaveBeenCalled();
          break;
        }
      }

      expect(strategy1.recover).toHaveBeenCalled();
      expect(strategy2.recover).toHaveBeenCalled();
    });
  });

  describe("Circuit Breaker Pattern", () => {
    it("opens circuit after failure threshold", () => {
      let failureCount = 0;
      const threshold = 3;

      const circuitBreaker = {
        state: "closed",
        execute: (operation: () => unknown) => {
          if (circuitBreaker.state === "open") {
            throw new Error("Circuit breaker is open");
          }

          try {
            return operation();
          } catch (error) {
            failureCount++;
            if (failureCount >= threshold) {
              circuitBreaker.state = "open";
            }
            throw error;
          }
        },
      };

      const operation = () => {
        throw new Error("Service down");
      };

      // Trip the circuit
      expect(() => circuitBreaker.execute(operation)).toThrow();
      expect(() => circuitBreaker.execute(operation)).toThrow();
      expect(() => circuitBreaker.execute(operation)).toThrow();

      expect(circuitBreaker.state).toBe("open");
    });

    it("prevents operations when circuit is open", () => {
      const circuitBreaker = {
        state: "open",
        execute: () => {
          throw new Error("Circuit breaker is open");
        },
      };

      expect(() => circuitBreaker.execute()).toThrow("Circuit breaker is open");
    });
  });

  describe("Error Reporting", () => {
    it("aggregates similar errors", () => {
      const errorAggregator = new Map<string, number>();

      const errors = [
        new Error("Database connection failed"),
        new Error("Database connection failed"),
        new Error("Network timeout"),
      ];

      errors.forEach((error) => {
        const count = errorAggregator.get(error.message) || 0;
        errorAggregator.set(error.message, count + 1);
      });

      expect(errorAggregator.get("Database connection failed")).toBe(2);
      expect(errorAggregator.get("Network timeout")).toBe(1);
    });

    it("respects rate limiting", () => {
      const rateLimiter = {
        maxReportsPerMinute: 10,
        reportCount: 0,
        canReport: () => {
          const _now = Date.now();
          if (rateLimiter.reportCount >= rateLimiter.maxReportsPerMinute) {
            return false;
          }
          rateLimiter.reportCount++;
          return true;
        },
      };

      let allowedReports = 0;
      for (let i = 0; i < 15; i++) {
        if (rateLimiter.canReport()) {
          allowedReports++;
        }
      }

      expect(allowedReports).toBeLessThanOrEqual(10);
    });
  });

  describe("Error Wrapping", () => {
    it("wraps functions with error handling", async () => {
      const successFn = vi.fn().mockResolvedValue("success");
      const errorFn = vi.fn().mockRejectedValue(new Error("Test error"));

      const withErrorHandling = async (fn: () => Promise<unknown>) => {
        try {
          return await fn();
        } catch (error) {
          throw new Error(`Wrapped error: ${error.message}`, { cause: error });
        }
      };

      await expect(withErrorHandling(successFn)).resolves.toBe("success");
      await expect(withErrorHandling(errorFn)).rejects.toThrow("Wrapped error: Test error");
    });

    it("provides error context", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("Test error"));
      const operation = "test-operation";

      const withErrorContext = async (fn: () => Promise<unknown>, operation: string) => {
        try {
          return await fn();
        } catch (error) {
          const wrappedError = new Error(`Error in ${operation}: ${error.message}`);
          (wrappedError as { context?: { operation: string } }).context = { operation };
          throw wrappedError;
        }
      };

      try {
        await withErrorContext(errorFn, operation);
      } catch (error: unknown) {
        expect((error as { context?: { operation: string } }).context.operation).toBe(
          "test-operation",
        );
      }
    });
  });
});
