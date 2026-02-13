import type { SpawnOptions } from "node:child_process";
import { spawn } from "node:child_process";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  resolveCommandStdio,
  formatSpawnError,
  spawnWithFallback,
  type SpawnFallback,
} from "./spawn-utils.js";

// Mock the spawn function
const mockSpawn = vi.fn();
vi.mock("node:child_process", async () => {
  const actual = await vi.importActual("node:child_process");
  return {
    ...actual,
    spawn: mockSpawn,
  };
});

describe("resolveCommandStdio", () => {
  it("returns pipe for stdin when hasInput is true", () => {
    const result = resolveCommandStdio({ hasInput: true, preferInherit: false });
    expect(result).toEqual(["pipe", "pipe", "pipe"]);
  });

  it("returns inherit for stdin when preferInherit is true and no input", () => {
    const result = resolveCommandStdio({ hasInput: false, preferInherit: true });
    expect(result).toEqual(["inherit", "pipe", "pipe"]);
  });

  it("returns pipe for stdin when preferInherit is false and no input", () => {
    const result = resolveCommandStdio({ hasInput: false, preferInherit: false });
    expect(result).toEqual(["pipe", "pipe", "pipe"]);
  });
});

describe("formatSpawnError", () => {
  it("handles non-Error objects", () => {
    expect(formatSpawnError("string error")).toBe("string error");
    expect(formatSpawnError(123)).toBe("123");
    expect(formatSpawnError(null)).toBe("null");
    expect(formatSpawnError(undefined)).toBe("undefined");
  });

  it("formats Error with message only", () => {
    const err = new Error("Test error");
    expect(formatSpawnError(err)).toBe("Test error");
  });

  it("formats Error with code", () => {
    const err = new Error("Test error") as NodeJS.ErrnoException;
    err.code = "ENOENT";
    expect(formatSpawnError(err)).toBe("Test error ENOENT");
  });

  it("formats Error with syscall", () => {
    const err = new Error("Test error") as NodeJS.ErrnoException;
    err.syscall = "spawn";
    expect(formatSpawnError(err)).toBe("Test error syscall=spawn");
  });

  it("formats Error with errno", () => {
    const err = new Error("Test error") as NodeJS.ErrnoException;
    err.errno = -2;
    expect(formatSpawnError(err)).toBe("Test error errno=-2");
  });

  it("formats Error with all properties", () => {
    const err = new Error("Test error") as NodeJS.ErrnoException;
    err.code = "ENOENT";
    err.syscall = "spawn";
    err.errno = -2;
    expect(formatSpawnError(err)).toBe("Test error ENOENT syscall=spawn errno=-2");
  });

  it("avoids duplicate code in message", () => {
    const err = new Error("ENOENT: no such file") as NodeJS.ErrnoException;
    err.code = "ENOENT";
    err.syscall = "spawn";
    err.errno = -2;
    expect(formatSpawnError(err)).toBe("ENOENT: no such file syscall=spawn errno=-2");
  });

  it("handles empty message", () => {
    const err = new Error() as NodeJS.ErrnoException;
    err.code = "ENOENT";
    err.syscall = "spawn";
    err.errno = -2;
    expect(formatSpawnError(err)).toBe("ENOENT syscall=spawn errno=-2");
  });
});

describe("spawnWithFallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("spawns successfully without fallbacks", async () => {
    const mockChild = {
      once: vi.fn(),
      pid: 123,
      removeListener: vi.fn(),
    } as any;

    mockSpawn.mockReturnValue(mockChild);

    // Simulate successful spawn
    mockChild.once.mockImplementation((event, callback) => {
      if (event === "spawn") {
        process.nextTick(callback);
      }
    });

    const result = await spawnWithFallback({
      argv: ["echo", "hello"],
      options: {},
      spawnImpl: mockSpawn,
    });

    expect(result.child).toBe(mockChild);
    expect(result.usedFallback).toBe(false);
    expect(result.fallbackLabel).toBeUndefined();
    expect(mockSpawn).toHaveBeenCalledWith("echo", ["hello"], {});
  });

  it("uses fallback when primary spawn fails", async () => {
    const mockChild = {
      once: vi.fn(),
      pid: 123,
      removeListener: vi.fn(),
    } as any;

    const mockFailedChild = {
      once: vi.fn(),
      removeListener: vi.fn(),
    } as any;

    mockSpawn.mockReturnValueOnce(mockFailedChild).mockReturnValueOnce(mockChild);

    const fallbacks: SpawnFallback[] = [{ label: "fallback1", options: { shell: true } }];

    const onFallback = vi.fn();

    // Simulate primary spawn failure
    mockFailedChild.once.mockImplementation((event, callback) => {
      if (event === "error") {
        const error = new Error("EBADF") as NodeJS.ErrnoException;
        error.code = "EBADF";
        process.nextTick(() => callback(error));
      }
    });

    // Simulate fallback spawn success
    mockChild.once.mockImplementation((event, callback) => {
      if (event === "spawn") {
        process.nextTick(callback);
      }
    });

    const result = await spawnWithFallback({
      argv: ["echo", "hello"],
      options: {},
      fallbacks,
      onFallback,
      spawnImpl: mockSpawn,
    });

    expect(result.child).toBe(mockChild);
    expect(result.usedFallback).toBe(true);
    expect(result.fallbackLabel).toBe("fallback1");
    expect(onFallback).toHaveBeenCalledWith(expect.any(Error), fallbacks[0]);
  });

  it("throws when all spawns fail", async () => {
    const mockChild1 = {
      once: vi.fn(),
      removeListener: vi.fn(),
    } as any;

    const mockChild2 = {
      once: vi.fn(),
      removeListener: vi.fn(),
    } as any;

    mockSpawn.mockReturnValueOnce(mockChild1).mockReturnValueOnce(mockChild2);

    const fallbacks: SpawnFallback[] = [{ label: "fallback1", options: { shell: true } }];

    // Simulate primary spawn failure with retry code
    mockChild1.once.mockImplementation((event, callback) => {
      if (event === "error") {
        const error = new Error("EBADF") as NodeJS.ErrnoException;
        error.code = "EBADF";
        process.nextTick(() => callback(error));
      }
    });

    // Simulate fallback spawn failure with non-retry code
    mockChild2.once.mockImplementation((event, callback) => {
      if (event === "error") {
        const error = new Error("ENOENT") as NodeJS.ErrnoException;
        error.code = "ENOENT";
        process.nextTick(() => callback(error));
      }
    });

    await expect(
      spawnWithFallback({
        argv: ["echo", "hello"],
        options: {},
        fallbacks,
        spawnImpl: mockSpawn,
      }),
    ).rejects.toThrow("ENOENT");
  });

  it("throws when primary spawn fails with non-retry code", async () => {
    const mockChild = {
      once: vi.fn(),
      removeListener: vi.fn(),
    } as any;

    mockSpawn.mockReturnValue(mockChild);

    // Simulate spawn failure with non-retry code
    mockChild.once.mockImplementation((event, callback) => {
      if (event === "error") {
        const error = new Error("ENOENT") as NodeJS.ErrnoException;
        error.code = "ENOENT";
        process.nextTick(() => callback(error));
      }
    });

    await expect(
      spawnWithFallback({
        argv: ["echo", "hello"],
        options: {},
        fallbacks: [{ label: "fallback1", options: { shell: true } }],
        spawnImpl: mockSpawn,
      }),
    ).rejects.toThrow("ENOENT");
  });

  it("uses custom retry codes", async () => {
    const mockChild = {
      once: vi.fn(),
      removeListener: vi.fn(),
    } as any;

    const mockFailedChild = {
      once: vi.fn(),
      removeListener: vi.fn(),
    } as any;

    mockSpawn.mockReturnValueOnce(mockFailedChild).mockReturnValueOnce(mockChild);

    const fallbacks: SpawnFallback[] = [{ label: "fallback1", options: { shell: true } }];

    // Simulate primary spawn failure with custom retry code
    mockFailedChild.once.mockImplementation((event, callback) => {
      if (event === "error") {
        const error = new Error("CUSTOM") as NodeJS.ErrnoException;
        error.code = "CUSTOM";
        process.nextTick(() => callback(error));
      }
    });

    // Simulate fallback spawn success
    mockChild.once.mockImplementation((event, callback) => {
      if (event === "spawn") {
        process.nextTick(callback);
      }
    });

    const result = await spawnWithFallback({
      argv: ["echo", "hello"],
      options: {},
      fallbacks,
      retryCodes: ["CUSTOM"],
      spawnImpl: mockSpawn,
    });

    expect(result.usedFallback).toBe(true);
    expect(result.fallbackLabel).toBe("fallback1");
  });

  it("uses custom spawn implementation", async () => {
    const mockChild = {
      once: vi.fn(),
      pid: 123,
      removeListener: vi.fn(),
    } as any;

    const customSpawn = vi.fn().mockReturnValue(mockChild);

    // Simulate successful spawn
    mockChild.once.mockImplementation((event, callback) => {
      if (event === "spawn") {
        process.nextTick(callback);
      }
    });

    const result = await spawnWithFallback({
      argv: ["echo", "hello"],
      options: {},
      spawnImpl: customSpawn,
    });

    expect(result.child).toBe(mockChild);
    expect(customSpawn).toHaveBeenCalledWith("echo", ["hello"], {});
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it("handles multiple fallbacks", async () => {
    const mockChild = {
      once: vi.fn(),
      pid: 123,
      removeListener: vi.fn(),
    } as any;

    const mockChildren = Array(3)
      .fill(null)
      .map(() => ({
        once: vi.fn(),
        removeListener: vi.fn(),
      }));

    mockSpawn
      .mockReturnValueOnce(mockChildren[0])
      .mockReturnValueOnce(mockChildren[1])
      .mockReturnValueOnce(mockChild);

    const fallbacks: SpawnFallback[] = [
      { label: "fallback1", options: { shell: true } },
      { label: "fallback2", options: { detached: true } },
    ];

    const onFallback = vi.fn();

    // Simulate primary spawn failure
    mockChildren[0].once.mockImplementation((event, callback) => {
      if (event === "error") {
        const error = new Error("EBADF") as NodeJS.ErrnoException;
        error.code = "EBADF";
        process.nextTick(() => callback(error));
      }
    });

    // Simulate first fallback spawn failure
    mockChildren[1].once.mockImplementation((event, callback) => {
      if (event === "error") {
        const error = new Error("EBADF") as NodeJS.ErrnoException;
        error.code = "EBADF";
        process.nextTick(() => callback(error));
      }
    });

    // Simulate second fallback spawn success
    mockChild.once.mockImplementation((event, callback) => {
      if (event === "spawn") {
        process.nextTick(callback);
      }
    });

    const result = await spawnWithFallback({
      argv: ["echo", "hello"],
      options: {},
      fallbacks,
      onFallback,
      spawnImpl: mockSpawn,
    });

    expect(result.child).toBe(mockChild);
    expect(result.usedFallback).toBe(true);
    expect(result.fallbackLabel).toBe("fallback2");
    expect(onFallback).toHaveBeenCalledTimes(2);
  });

  it("handles spawn with immediate PID", async () => {
    const mockChild = {
      once: vi.fn(),
      pid: 123,
      removeListener: vi.fn(),
    } as any;

    mockSpawn.mockReturnValue(mockChild);

    // Don't simulate spawn event, PID should trigger resolution
    const result = await spawnWithFallback({
      argv: ["echo", "hello"],
      options: {},
      spawnImpl: mockSpawn,
    });

    expect(result.child).toBe(mockChild);
    expect(result.usedFallback).toBe(false);
  });
});
