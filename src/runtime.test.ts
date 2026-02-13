import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRuntime, defaultRuntime, type RuntimeEnv } from "./runtime.js";

describe("createRuntime", () => {
  let mockClearProgress: ReturnType<typeof vi.fn>;
  let mockRestoreState: ReturnType<typeof vi.fn>;
  let mockProcessExit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockClearProgress = vi.fn();
    mockRestoreState = vi.fn();
    mockProcessExit = vi.fn();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("creates a runtime environment with default functions", () => {
    const runtime = createRuntime();

    expect(typeof runtime.log).toBe("function");
    expect(typeof runtime.error).toBe("function");
    expect(typeof runtime.exit).toBe("function");
  });

  it("creates a runtime environment with custom functions", () => {
    const runtime = createRuntime(mockClearProgress, mockRestoreState, mockProcessExit);

    expect(runtime.log).toBeDefined();
    expect(runtime.error).toBeDefined();
    expect(runtime.exit).toBeDefined();
  });

  describe("log method", () => {
    it("calls clearProgress before logging", () => {
      const runtime = createRuntime(mockClearProgress);
      runtime.log("test message");

      expect(mockClearProgress).toHaveBeenCalledTimes(1);
      expect(mockClearProgress).toHaveBeenCalledBefore(console.log as any);
    });

    it("passes all arguments to console.log", () => {
      const runtime = createRuntime(mockClearProgress);
      const arg1 = "message";
      const arg2 = { data: "test" };
      const arg3 = 123;

      runtime.log(arg1, arg2, arg3);

      expect(console.log).toHaveBeenCalledWith(arg1, arg2, arg3);
    });

    it("handles multiple calls", () => {
      const runtime = createRuntime(mockClearProgress);

      runtime.log("first");
      runtime.log("second", { data: "test" });

      expect(mockClearProgress).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenNthCalledWith(1, "first");
      expect(console.log).toHaveBeenNthCalledWith(2, "second", { data: "test" });
    });

    it("works with default clearProgress function", () => {
      const runtime = createRuntime();

      expect(() => runtime.log("test")).not.toThrow();
      expect(console.log).toHaveBeenCalledWith("test");
    });
  });

  describe("error method", () => {
    it("calls clearProgress before error logging", () => {
      const runtime = createRuntime(mockClearProgress);
      runtime.error("error message");

      expect(mockClearProgress).toHaveBeenCalledTimes(1);
      expect(mockClearProgress).toHaveBeenCalledBefore(console.error as any);
    });

    it("passes all arguments to console.error", () => {
      const runtime = createRuntime(mockClearProgress);
      const arg1 = "error message";
      const arg2 = new Error("test error");
      const arg3 = { context: "test" };

      runtime.error(arg1, arg2, arg3);

      expect(console.error).toHaveBeenCalledWith(arg1, arg2, arg3);
    });

    it("handles multiple error calls", () => {
      const runtime = createRuntime(mockClearProgress);

      runtime.error("first error");
      runtime.error("second error", { code: 500 });

      expect(mockClearProgress).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenNthCalledWith(1, "first error");
      expect(console.error).toHaveBeenNthCalledWith(2, "second error", { code: 500 });
    });

    it("works with default clearProgress function", () => {
      const runtime = createRuntime();

      expect(() => runtime.error("test error")).not.toThrow();
      expect(console.error).toHaveBeenCalledWith("test error");
    });
  });

  describe("exit method", () => {
    it("calls restoreState with 'runtime exit' before exiting", () => {
      const runtime = createRuntime(mockClearProgress, mockRestoreState, mockProcessExit);

      try {
        runtime.exit(1);
      } catch {
        // Expected to throw due to mock implementation
      }

      expect(mockRestoreState).toHaveBeenCalledWith("runtime exit");
      expect(mockRestoreState).toHaveBeenCalledBefore(mockProcessExit);
    });

    it("calls processExit with the provided exit code", () => {
      const runtime = createRuntime(mockClearProgress, mockRestoreState, mockProcessExit);

      try {
        runtime.exit(42);
      } catch {
        // Expected to throw due to mock implementation
      }

      expect(mockProcessExit).toHaveBeenCalledWith(42);
    });

    it("handles different exit codes", () => {
      const runtime = createRuntime(mockClearProgress, mockRestoreState, mockProcessExit);

      try {
        runtime.exit(0);
      } catch {
        // Expected to throw due to mock implementation
      }
      expect(mockProcessExit).toHaveBeenLastCalledWith(0);

      try {
        runtime.exit(1);
      } catch {
        // Expected to throw due to mock implementation
      }
      expect(mockProcessExit).toHaveBeenLastCalledWith(1);

      try {
        runtime.exit(255);
      } catch {
        // Expected to throw due to mock implementation
      }
      expect(mockProcessExit).toHaveBeenLastCalledWith(255);
    });

    it("works with default functions", () => {
      const mockProcessExit = vi.fn();
      const runtime = createRuntime(undefined, undefined, mockProcessExit);

      try {
        runtime.exit(1);
      } catch {
        // Expected to throw due to mock implementation
      }

      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe("integration tests", () => {
    it("maintains call order between log and error", () => {
      const runtime = createRuntime(mockClearProgress);

      runtime.log("log message");
      runtime.error("error message");

      expect(mockClearProgress).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith("log message");
      expect(console.error).toHaveBeenCalledWith("error message");
    });

    it("handles complex arguments", () => {
      const runtime = createRuntime(mockClearProgress);

      const complexObject = {
        nested: { value: "test" },
        array: [1, 2, 3],
        date: new Date("2023-01-01"),
      };

      runtime.log("Complex object:", complexObject);

      expect(console.log).toHaveBeenCalledWith("Complex object:", complexObject);
    });
  });
});

describe("defaultRuntime", () => {
  it("is a valid RuntimeEnv object", () => {
    expect(defaultRuntime).toBeDefined();
    expect(typeof defaultRuntime.log).toBe("function");
    expect(typeof defaultRuntime.error).toBe("function");
    expect(typeof defaultRuntime.exit).toBe("function");
  });

  it("uses the actual console methods", () => {
    const originalLog = console.log;
    const originalError = console.error;
    const mockLog = vi.fn();
    const mockError = vi.fn();

    console.log = mockLog;
    console.error = mockError;

    try {
      defaultRuntime.log("test log");
      defaultRuntime.error("test error");

      expect(mockLog).toHaveBeenCalledWith("test log");
      expect(mockError).toHaveBeenCalledWith("test error");
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }
  });
});
