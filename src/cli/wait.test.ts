import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { waitForever } from "./wait.js";

describe("waitForever", () => {
  let originalSetInterval: typeof global.setInterval;
  let mockSetInterval: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalSetInterval = global.setInterval;
    mockSetInterval = vi.fn();
    global.setInterval = mockSetInterval;

    // Mock the interval object with unref method
    const mockInterval = {
      unref: vi.fn(),
    };
    mockSetInterval.mockReturnValue(mockInterval);
  });

  afterEach(() => {
    global.setInterval = originalSetInterval;
  });

  it("should create an interval with long timeout", () => {
    const promise = waitForever();

    expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 1_000_000);
    expect(promise).toBeInstanceOf(Promise);
  });

  it("should call unref on the interval", () => {
    const mockInterval = {
      unref: vi.fn(),
    };
    mockSetInterval.mockReturnValue(mockInterval);

    waitForever();

    expect(mockInterval.unref).toHaveBeenCalled();
  });

  it("should return a promise that never resolves", async () => {
    const promise = waitForever();

    // Promise should not resolve immediately
    let resolved = false;
    promise.then(() => {
      resolved = true;
    });

    // Wait a tick to check if promise resolved
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(resolved).toBe(false);
  });

  it("should handle multiple calls", () => {
    const promise1 = waitForever();
    const promise2 = waitForever();

    expect(mockSetInterval).toHaveBeenCalledTimes(2);
    expect(promise1).not.toBe(promise2); // Should return different promises
  });

  it("should use a function that does nothing for interval callback", () => {
    waitForever();

    expect(mockSetInterval).toHaveBeenCalled();
    const callback = mockSetInterval.mock.calls[0][0];
    expect(typeof callback).toBe("function");

    // Calling the callback should not throw
    expect(() => callback()).not.toThrow();
  });
});
