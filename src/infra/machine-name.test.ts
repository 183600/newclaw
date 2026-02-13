import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMachineDisplayName } from "./machine-name.js";

describe("getMachineDisplayName", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns fallback hostname in test environment", async () => {
    vi.stubEnv("NODE_ENV", "test");

    // Re-import to get fresh module with test environment
    const { getMachineDisplayName: freshGetMachineDisplayName } = await import("./machine-name.js");

    const result = await freshGetMachineDisplayName();
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns fallback hostname in vitest environment", async () => {
    vi.stubEnv("VITEST", "true");

    // Re-import to get fresh module with vitest environment
    const { getMachineDisplayName: freshGetMachineDisplayName } = await import("./machine-name.js");

    const result = await freshGetMachineDisplayName();
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("caches the result", async () => {
    vi.stubEnv("NODE_ENV", "test");

    // Re-import to get fresh module
    const { getMachineDisplayName: freshGetMachineDisplayName } = await import("./machine-name.js");

    const result1 = await freshGetMachineDisplayName();
    const result2 = await freshGetMachineDisplayName();

    expect(result1).toBe(result2);
  });

  it("removes .local suffix from hostname", async () => {
    vi.stubEnv("NODE_ENV", "test");

    // Mock os.hostname to return a value with .local suffix
    const os = await import("node:os");
    vi.spyOn(os, "hostname").mockReturnValue("test-machine.local");

    // Re-import to get fresh module with mocked hostname
    const { getMachineDisplayName: freshGetMachineDisplayName } = await import("./machine-name.js");

    const result = await freshGetMachineDisplayName();
    expect(result).toBe("test-machine");
  });

  it("returns 'openclaw' as ultimate fallback", async () => {
    vi.stubEnv("NODE_ENV", "test");

    // Mock os.hostname to return empty string
    const os = await import("node:os");
    vi.spyOn(os, "hostname").mockReturnValue("");

    // Re-import to get fresh module with mocked hostname
    const { getMachineDisplayName: freshGetMachineDisplayName } = await import("./machine-name.js");

    const result = await freshGetMachineDisplayName();
    expect(result).toBe("openclaw");
  });

  describe("macOS-specific behavior", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("VITEST", "");
    });

    it("tries scutil on macOS platform", async () => {
      // Mock platform to be darwin
      const os = await import("node:os");
      vi.spyOn(os, "platform").mockReturnValue("darwin");
      vi.spyOn(os, "hostname").mockReturnValue("fallback-host");

      // Mock execFile to simulate scutil success
      const { promisify } = await import("node:util");
      const execFileMock = vi.fn().mockResolvedValue({
        stdout: "MacBook Pro",
      });
      vi.spyOn(promisify, vi.fn() as any).mockReturnValue(execFileMock);

      // Re-import to get fresh module
      const { getMachineDisplayName: freshGetMachineDisplayName } =
        await import("./machine-name.js");

      const result = await freshGetMachineDisplayName();
      expect(result).toBe("MacBook Pro");
    });

    it("tries LocalHostName if ComputerName fails", async () => {
      // Mock platform to be darwin
      const os = await import("node:os");
      vi.spyOn(os, "platform").mockReturnValue("darwin");
      vi.spyOn(os, "hostname").mockReturnValue("fallback-host");

      // Mock execFile to simulate ComputerName failure but LocalHostName success
      const { promisify } = await import("node:util");
      const execFileMock = vi
        .fn()
        .mockResolvedValueOnce({ stdout: "" }) // ComputerName fails (empty)
        .mockResolvedValueOnce({ stdout: "Mac-mini" }); // LocalHostName succeeds
      vi.spyOn(promisify, vi.fn() as any).mockReturnValue(execFileMock);

      // Re-import to get fresh module
      const { getMachineDisplayName: freshGetMachineDisplayName } =
        await import("./machine-name.js");

      const result = await freshGetMachineDisplayName();
      expect(result).toBe("Mac-mini");
    });

    it("falls back to hostname on macOS when scutil fails", async () => {
      // Mock platform to be darwin
      const os = await import("node:os");
      vi.spyOn(os, "platform").mockReturnValue("darwin");
      vi.spyOn(os, "hostname").mockReturnValue("mac-hostname");

      // Mock execFile to simulate scutil failure
      const { promisify } = await import("node:util");
      const execFileMock = vi.fn().mockRejectedValue(new Error("Command failed"));
      vi.spyOn(promisify, vi.fn() as any).mockReturnValue(execFileMock);

      // Re-import to get fresh module
      const { getMachineDisplayName: freshGetMachineDisplayName } =
        await import("./machine-name.js");

      const result = await freshGetMachineDisplayName();
      expect(result).toBe("mac-hostname");
    });

    it("handles scutil timeout gracefully", async () => {
      // Mock platform to be darwin
      const os = await import("node:os");
      vi.spyOn(os, "platform").mockReturnValue("darwin");
      vi.spyOn(os, "hostname").mockReturnValue("timeout-host");

      // Mock execFile to simulate timeout
      const { promisify } = await import("node:util");
      const execFileMock = vi.fn().mockRejectedValue(new Error("Command timed out"));
      vi.spyOn(promisify, vi.fn() as any).mockReturnValue(execFileMock);

      // Re-import to get fresh module
      const { getMachineDisplayName: freshGetMachineDisplayName } =
        await import("./machine-name.js");

      const result = await freshGetMachineDisplayName();
      expect(result).toBe("timeout-host");
    });
  });

  describe("non-macOS behavior", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("VITEST", "");
    });

    it("uses hostname on non-macOS platforms", async () => {
      // Mock platform to be linux
      const os = await import("node:os");
      vi.spyOn(os, "platform").mockReturnValue("linux");
      vi.spyOn(os, "hostname").mockReturnValue("linux-hostname");

      // Re-import to get fresh module
      const { getMachineDisplayName: freshGetMachineDisplayName } =
        await import("./machine-name.js");

      const result = await freshGetMachineDisplayName();
      expect(result).toBe("linux-hostname");
    });

    it("uses hostname on Windows", async () => {
      // Mock platform to be win32
      const os = await import("node:os");
      vi.spyOn(os, "platform").mockReturnValue("win32");
      vi.spyOn(os, "hostname").mockReturnValue("windows-pc");

      // Re-import to get fresh module
      const { getMachineDisplayName: freshGetMachineDisplayName } =
        await import("./machine-name.js");

      const result = await freshGetMachineDisplayName();
      expect(result).toBe("windows-pc");
    });
  });
});
