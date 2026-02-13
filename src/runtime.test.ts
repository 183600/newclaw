import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultRuntime, type RuntimeEnv } from "./runtime.js";

describe("defaultRuntime", () => {
  let mockConsole: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };
  let mockProcess: {
    exit: ReturnType<typeof vi.spyOn>;
  };
  let mockClearActiveProgressLine: ReturnType<typeof vi.fn>;
  let mockRestoreTerminalState: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock console methods
    mockConsole = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };

    // Mock process.exit
    mockProcess = {
      exit: vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      }),
    };

    // Mock imported functions
    mockClearActiveProgressLine = vi.fn();
    mockRestoreTerminalState = vi.fn();

    vi.doMock("./terminal/progress-line.js", () => ({
      clearActiveProgressLine: mockClearActiveProgressLine,
    }));

    vi.doMock("./terminal/restore.js", () => ({
      restoreTerminalState: mockRestoreTerminalState,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe("log method", () => {
    it("clears active progress line before logging", () => {
      const testMessage = "Test log message";
      defaultRuntime.log(testMessage);

      expect(mockClearActiveProgressLine).toHaveBeenCalled();
      expect(mockConsole.log).toHaveBeenCalledWith(testMessage);
    });

    it("passes multiple arguments to console.log", () => {
      const arg1 = "First argument";
      const arg2 = { data: "object" };
      const arg3 = 42;

      defaultRuntime.log(arg1, arg2, arg3);

      expect(mockClearActiveProgressLine).toHaveBeenCalled();
      expect(mockConsole.log).toHaveBeenCalledWith(arg1, arg2, arg3);
    });
  });

  describe("error method", () => {
    it("clears active progress line before error logging", () => {
      const errorMessage = "Test error message";
      defaultRuntime.error(errorMessage);

      expect(mockClearActiveProgressLine).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledWith(errorMessage);
    });

    it("passes multiple arguments to console.error", () => {
      const arg1 = "Error message";
      const arg2 = new Error("Test error");
      const arg3 = { context: "additional info" };

      defaultRuntime.error(arg1, arg2, arg3);

      expect(mockClearActiveProgressLine).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledWith(arg1, arg2, arg3);
    });
  });

  describe("exit method", () => {
    it("restores terminal state before exiting", () => {
      expect(() => defaultRuntime.exit(1)).toThrow("process.exit called");
      expect(mockRestoreTerminalState).toHaveBeenCalledWith("runtime exit");
      expect(mockProcess.exit).toHaveBeenCalledWith(1);
    });

    it("passes exit code to process.exit", () => {
      expect(() => defaultRuntime.exit(0)).toThrow("process.exit called");
      expect(mockProcess.exit).toHaveBeenCalledWith(0);
    });

    it("throws an error after process.exit for test purposes", () => {
      expect(() => defaultRuntime.exit(42)).toThrow("unreachable");
    });
  });

  describe("RuntimeEnv type", () => {
    it("has the correct interface structure", () => {
      const runtime: RuntimeEnv = defaultRuntime;

      expect(typeof runtime.log).toBe("function");
      expect(typeof runtime.error).toBe("function");
      expect(typeof runtime.exit).toBe("function");
    });

    it("matches console.log signature", () => {
      const logFunc: typeof console.log = defaultRuntime.log;
      expect(typeof logFunc).toBe("function");
    });

    it("matches console.error signature", () => {
      const errorFunc: typeof console.error = defaultRuntime.error;
      expect(typeof errorFunc).toBe("function");
    });

    it("exit function returns never", () => {
      // This test verifies the exit function has the correct return type
      // In practice, it should never return normally
      expect(() => {
        defaultRuntime.exit(0);
      }).toThrow();
    });
  });
});
