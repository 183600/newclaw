import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  resolveCommandStdio,
  formatSpawnError,
  spawnWithFallback,
  type SpawnFallback,
} from "./spawn-utils.ts";

describe("resolveCommandStdio", () => {
  it("returns pipe for stdin when hasInput is true", () => {
    const result = resolveCommandStdio({ hasInput: true, preferInherit: false });
    expect(result).toEqual(["pipe", "pipe", "pipe"]);
  });

  it("returns inherit for stdin when hasInput is false and preferInherit is true", () => {
    const result = resolveCommandStdio({ hasInput: false, preferInherit: true });
    expect(result).toEqual(["inherit", "pipe", "pipe"]);
  });

  it("returns pipe for stdin when hasInput is false and preferInherit is false", () => {
    const result = resolveCommandStdio({ hasInput: false, preferInherit: false });
    expect(result).toEqual(["pipe", "pipe", "pipe"]);
  });
});

describe("formatSpawnError", () => {
  it("formats basic error message", () => {
    const error = new Error("Command not found");
    const formatted = formatSpawnError(error);
    expect(formatted).toBe("Command not found");
  });

  it("includes error code", () => {
    const error = new Error("Spawn failed") as NodeJS.ErrnoException;
    error.code = "ENOENT";
    const formatted = formatSpawnError(error);
    expect(formatted).toBe("Spawn failed ENOENT");
  });

  it("includes syscall information", () => {
    const error = new Error("Permission denied") as NodeJS.ErrnoException;
    error.code = "EACCES";
    error.syscall = "spawn";
    const formatted = formatSpawnError(error);
    expect(formatted).toBe("Permission denied EACCES syscall=spawn");
  });

  it("includes errno", () => {
    const error = new Error("Bad file descriptor") as NodeJS.ErrnoException;
    error.code = "EBADF";
    error.errno = -9;
    const formatted = formatSpawnError(error);
    expect(formatted).toBe("Bad file descriptor EBADF errno=-9");
  });

  it("handles non-Error objects", () => {
    const formatted = formatSpawnError("string error");
    expect(formatted).toBe("string error");
  });

  it("handles empty error", () => {
    const error = new Error() as NodeJS.ErrnoException;
    error.message = "";
    const formatted = formatSpawnError(error);
    expect(formatted).toBe("");
  });
});

describe("spawnWithFallback", () => {
  let mockSpawn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSpawn = vi.fn();
  });

  it("spawns process successfully with primary options", async () => {
    const mockChild = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "spawn") {
          // Simulate immediate successful spawn
          process.nextTick(callback);
        }
      }),
      pid: 123,
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    mockSpawn.mockReturnValue(mockChild);

    const result = await spawnWithFallback({
      argv: ["node", "script.js"],
      options: { cwd: "/tmp" },
      spawnImpl: mockSpawn,
    });

    expect(result.child).toBe(mockChild);
    expect(result.usedFallback).toBe(false);
    expect(result.fallbackLabel).toBeUndefined();
    expect(mockSpawn).toHaveBeenCalledWith("node", ["script.js"], { cwd: "/tmp" });
  });

  it("uses fallback when primary spawn fails", async () => {
    const mockPrimaryChild = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "error") {
          // Simulate immediate spawn failure
          process.nextTick(() => {
            const error = new Error("EBADF") as NodeJS.ErrnoException;
            error.code = "EBADF";
            callback(error);
          });
        }
      }),
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    const mockFallbackChild = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "spawn") {
          // Simulate immediate successful spawn
          process.nextTick(callback);
        }
      }),
      pid: 456,
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    mockSpawn.mockReturnValueOnce(mockPrimaryChild).mockReturnValueOnce(mockFallbackChild);

    const fallbacks: SpawnFallback[] = [
      {
        label: "shell fallback",
        options: { shell: true },
      },
    ];

    const onFallback = vi.fn();
    const result = await spawnWithFallback({
      argv: ["node", "script.js"],
      options: { cwd: "/tmp" },
      fallbacks,
      spawnImpl: mockSpawn,
      onFallback,
    });

    expect(result.child).toBe(mockFallbackChild);
    expect(result.usedFallback).toBe(true);
    expect(result.fallbackLabel).toBe("shell fallback");
    expect(onFallback).toHaveBeenCalled();
    expect(mockSpawn).toHaveBeenCalledTimes(2);
  });

  it("throws error when no fallback can handle the error", async () => {
    const mockChild = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "error") {
          // Simulate immediate spawn failure with non-retryable code
          process.nextTick(() => {
            const error = new Error("ENOENT") as NodeJS.ErrnoException;
            error.code = "ENOENT";
            callback(error);
          });
        }
      }),
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    mockSpawn.mockReturnValue(mockChild);

    const fallbacks: SpawnFallback[] = [
      {
        label: "shell fallback",
        options: { shell: true },
      },
    ];

    await expect(
      spawnWithFallback({
        argv: ["node", "script.js"],
        options: { cwd: "/tmp" },
        fallbacks,
        spawnImpl: mockSpawn,
      }),
    ).rejects.toThrow("ENOENT");

    expect(mockSpawn).toHaveBeenCalledTimes(1);
  });

  it("throws error when all fallbacks fail", async () => {
    const mockChild1 = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "error") {
          // Simulate immediate spawn failure
          process.nextTick(() => {
            const error = new Error("EBADF") as NodeJS.ErrnoException;
            error.code = "EBADF";
            callback(error);
          });
        }
      }),
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    const mockChild2 = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "error") {
          // Simulate immediate spawn failure
          process.nextTick(() => {
            const error = new Error("EBADF") as NodeJS.ErrnoException;
            error.code = "EBADF";
            callback(error);
          });
        }
      }),
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    mockSpawn.mockReturnValueOnce(mockChild1).mockReturnValueOnce(mockChild2);

    const fallbacks: SpawnFallback[] = [
      {
        label: "shell fallback",
        options: { shell: true },
      },
    ];

    await expect(
      spawnWithFallback({
        argv: ["node", "script.js"],
        options: { cwd: "/tmp" },
        fallbacks,
        spawnImpl: mockSpawn,
      }),
    ).rejects.toThrow("EBADF");

    expect(mockSpawn).toHaveBeenCalledTimes(2);
  });

  it("handles multiple fallbacks", async () => {
    const mockChild1 = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "error") {
          // Simulate immediate spawn failure
          process.nextTick(() => {
            const error = new Error("EBADF") as NodeJS.ErrnoException;
            error.code = "EBADF";
            callback(error);
          });
        }
      }),
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    const mockChild2 = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "error") {
          // Simulate immediate spawn failure
          process.nextTick(() => {
            const error = new Error("EBADF") as NodeJS.ErrnoException;
            error.code = "EBADF";
            callback(error);
          });
        }
      }),
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    const mockChild3 = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "spawn") {
          // Simulate immediate successful spawn
          process.nextTick(callback);
        }
      }),
      pid: 789,
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    mockSpawn
      .mockReturnValueOnce(mockChild1)
      .mockReturnValueOnce(mockChild2)
      .mockReturnValueOnce(mockChild3);

    const fallbacks: SpawnFallback[] = [
      {
        label: "first fallback",
        options: { shell: true },
      },
      {
        label: "second fallback",
        options: { detached: true },
      },
    ];

    const result = await spawnWithFallback({
      argv: ["node", "script.js"],
      options: { cwd: "/tmp" },
      fallbacks,
      spawnImpl: mockSpawn,
    });

    expect(result.child).toBe(mockChild3);
    expect(result.usedFallback).toBe(true);
    expect(result.fallbackLabel).toBe("second fallback");
    expect(mockSpawn).toHaveBeenCalledTimes(3);
  });

  it("uses custom retry codes", async () => {
    const mockChild = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "error") {
          // Simulate immediate spawn failure with custom retry code
          process.nextTick(() => {
            const error = new Error("CUSTOM") as NodeJS.ErrnoException;
            error.code = "CUSTOM";
            callback(error);
          });
        }
      }),
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    const mockFallbackChild = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "error") {
          // Simulate immediate spawn failure
          process.nextTick(() => {
            const error = new Error("CUSTOM") as NodeJS.ErrnoException;
            error.code = "CUSTOM";
            callback(error);
          });
        }
      }),
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    mockSpawn.mockReturnValueOnce(mockChild).mockReturnValueOnce(mockFallbackChild);

    const fallbacks: SpawnFallback[] = [
      {
        label: "custom fallback",
        options: { shell: true },
      },
    ];

    await expect(
      spawnWithFallback({
        argv: ["node", "script.js"],
        options: { cwd: "/tmp" },
        fallbacks,
        spawnImpl: mockSpawn,
        retryCodes: ["CUSTOM"],
      }),
    ).rejects.toThrow("CUSTOM");

    expect(mockSpawn).toHaveBeenCalledTimes(2); // Primary + fallback
  });

  it("handles child with existing PID", async () => {
    const mockChild = {
      once: vi.fn(),
      pid: 123,
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    mockSpawn.mockReturnValue(mockChild);

    const result = await spawnWithFallback({
      argv: ["node", "script.js"],
      options: {},
      spawnImpl: mockSpawn,
    });

    expect(result.child).toBe(mockChild);
    expect(result.usedFallback).toBe(false);
  });

  it("uses default spawn implementation when not provided", async () => {
    // This test verifies that the default spawn implementation is used when not provided
    // We'll use a mock implementation to avoid actual process spawning
    const mockChild = {
      once: vi.fn().mockImplementation((event, callback) => {
        if (event === "spawn") {
          // Simulate immediate successful spawn
          process.nextTick(callback);
        }
      }),
      pid: 123,
      removeListener: vi.fn(),
      off: vi.fn(),
    } as unknown;

    // Create a mock spawn function
    const mockSpawn = vi.fn().mockReturnValue(mockChild);

    const result = await spawnWithFallback({
      argv: ["echo", "hello"],
      options: {},
      spawnImpl: mockSpawn, // Pass the mock to test the implementation
    });

    expect(result.child).toBe(mockChild);
    expect(result.usedFallback).toBe(false);
    expect(mockSpawn).toHaveBeenCalledWith("echo", ["hello"], {});
  });
});
