import { describe, expect, it, vi } from "vitest";
import { getMachineDisplayName, setMachineNameDeps } from "./machine-name.js";

describe("getMachineDisplayName", () => {
  const originalDeps = {
    platform: () => process.platform,
    hostname: () => require("os").hostname(),
    execFile: require("util").promisify(require("child_process").execFile),
    env: process.env,
  };

  afterEach(() => {
    // Reset dependencies after each test
    setMachineNameDeps(originalDeps);
  });

  it("returns fallback hostname in test environment", async () => {
    const mockDeps = {
      platform: () => "linux",
      hostname: () => "test-hostname.local",
      execFile: vi.fn(),
      env: { NODE_ENV: "test" },
    };
    setMachineNameDeps(mockDeps);

    const result = await getMachineDisplayName();
    expect(result).toBe("test-hostname");
    expect(mockDeps.execFile).not.toHaveBeenCalled();
  });

  it("returns fallback hostname when VITEST env is set", async () => {
    const mockDeps = {
      platform: () => "linux",
      hostname: () => "test-hostname.local",
      execFile: vi.fn(),
      env: { VITEST: "true" },
    };
    setMachineNameDeps(mockDeps);

    const result = await getMachineDisplayName();
    expect(result).toBe("test-hostname");
    expect(mockDeps.execFile).not.toHaveBeenCalled();
  });

  it("returns fallback hostname when hostname is empty", async () => {
    const mockDeps = {
      platform: () => "linux",
      hostname: () => "",
      execFile: vi.fn(),
      env: {},
    };
    setMachineNameDeps(mockDeps);

    const result = await getMachineDisplayName();
    expect(result).toBe("openclaw");
  });

  it("returns fallback hostname when hostname is only whitespace", async () => {
    const mockDeps = {
      platform: () => "linux",
      hostname: () => "   ",
      execFile: vi.fn(),
      env: {},
    };
    setMachineNameDeps(mockDeps);

    const result = await getMachineDisplayName();
    expect(result).toBe("openclaw");
  });

  it("trims .local suffix from hostname", async () => {
    const mockDeps = {
      platform: () => "linux",
      hostname: () => "my-computer.local",
      execFile: vi.fn(),
      env: {},
    };
    setMachineNameDeps(mockDeps);

    const result = await getMachineDisplayName();
    expect(result).toBe("my-computer");
  });

  it("trims .LOCAL suffix from hostname case-insensitively", async () => {
    const mockDeps = {
      platform: () => "linux",
      hostname: () => "MY-COMputer.LOCAL",
      execFile: vi.fn(),
      env: {},
    };
    setMachineNameDeps(mockDeps);

    const result = await getMachineDisplayName();
    expect(result).toBe("MY-COMputer");
  });

  it("caches the result", async () => {
    const mockDeps = {
      platform: () => "linux",
      hostname: () => "test-hostname",
      execFile: vi.fn(),
      env: {},
    };
    setMachineNameDeps(mockDeps);

    const result1 = await getMachineDisplayName();
    const result2 = await getMachineDisplayName();

    expect(result1).toBe("test-hostname");
    expect(result2).toBe("test-hostname");
    expect(mockDeps.hostname).toHaveBeenCalledTimes(1);
  });

  it("resets cache when dependencies change", async () => {
    const mockDeps1 = {
      platform: () => "linux",
      hostname: () => "host1",
      execFile: vi.fn(),
      env: {},
    };
    const mockDeps2 = {
      platform: () => "linux",
      hostname: () => "host2",
      execFile: vi.fn(),
      env: {},
    };

    setMachineNameDeps(mockDeps1);
    const result1 = await getMachineDisplayName();
    expect(result1).toBe("host1");

    setMachineNameDeps(mockDeps2);
    const result2 = await getMachineDisplayName();
    expect(result2).toBe("host2");
  });

  describe("macOS platform", () => {
    it("uses scutil ComputerName when available", async () => {
      const mockExecFile = vi.fn().mockResolvedValueOnce({
        stdout: "My MacBook Pro",
      });
      const mockDeps = {
        platform: () => "darwin",
        hostname: () => "hostname.local",
        execFile: mockExecFile,
        env: {},
      };
      setMachineNameDeps(mockDeps);

      const result = await getMachineDisplayName();
      expect(result).toBe("My MacBook Pro");
      expect(mockExecFile).toHaveBeenCalledWith("/usr/sbin/scutil", ["--get", "ComputerName"], {
        timeout: 1000,
        windowsHide: true,
      });
    });

    it("falls back to LocalHostName when ComputerName fails", async () => {
      const mockExecFile = vi
        .fn()
        .mockRejectedValueOnce(new Error("Command failed"))
        .mockResolvedValueOnce({ stdout: "My-MacBook-Pro" });
      const mockDeps = {
        platform: () => "darwin",
        hostname: () => "hostname.local",
        execFile: mockExecFile,
        env: {},
      };
      setMachineNameDeps(mockDeps);

      const result = await getMachineDisplayName();
      expect(result).toBe("My-MacBook-Pro");
      expect(mockExecFile).toHaveBeenNthCalledWith(
        1,
        "/usr/sbin/scutil",
        ["--get", "ComputerName"],
        {
          timeout: 1000,
          windowsHide: true,
        },
      );
      expect(mockExecFile).toHaveBeenNthCalledWith(
        2,
        "/usr/sbin/scutil",
        ["--get", "LocalHostName"],
        {
          timeout: 1000,
          windowsHide: true,
        },
      );
    });

    it("falls back to hostname when both scutil commands fail", async () => {
      const mockExecFile = vi
        .fn()
        .mockRejectedValueOnce(new Error("Command failed"))
        .mockRejectedValueOnce(new Error("Command failed"));
      const mockDeps = {
        platform: () => "darwin",
        hostname: () => "my-mac.local",
        execFile: mockExecFile,
        env: {},
      };
      setMachineNameDeps(mockDeps);

      const result = await getMachineDisplayName();
      expect(result).toBe("my-mac");
    });

    it("falls back to hostname when ComputerName returns empty", async () => {
      const mockExecFile = vi
        .fn()
        .mockResolvedValueOnce({ stdout: "   " }) // Empty after trim
        .mockResolvedValueOnce({ stdout: "My-Mac" });
      const mockDeps = {
        platform: () => "darwin",
        hostname: () => "hostname.local",
        execFile: mockExecFile,
        env: {},
      };
      setMachineNameDeps(mockDeps);

      const result = await getMachineDisplayName();
      expect(result).toBe("My-Mac");
    });

    it("handles scutil timeout", async () => {
      const mockExecFile = vi.fn().mockRejectedValueOnce(new Error("Command timed out"));
      const mockDeps = {
        platform: () => "darwin",
        hostname: () => "my-mac.local",
        execFile: mockExecFile,
        env: {},
      };
      setMachineNameDeps(mockDeps);

      const result = await getMachineDisplayName();
      expect(result).toBe("my-mac");
    });
  });

  describe("non-macOS platforms", () => {
    it("uses hostname fallback on Linux", async () => {
      const mockDeps = {
        platform: () => "linux",
        hostname: () => "linux-box.local",
        execFile: vi.fn(),
        env: {},
      };
      setMachineNameDeps(mockDeps);

      const result = await getMachineDisplayName();
      expect(result).toBe("linux-box");
      expect(mockDeps.execFile).not.toHaveBeenCalled();
    });

    it("uses hostname fallback on Windows", async () => {
      const mockDeps = {
        platform: () => "win32",
        hostname: () => "windows-pc",
        execFile: vi.fn(),
        env: {},
      };
      setMachineNameDeps(mockDeps);

      const result = await getMachineDisplayName();
      expect(result).toBe("windows-pc");
      expect(mockDeps.execFile).not.toHaveBeenCalled();
    });

    it("uses hostname fallback on other platforms", async () => {
      const mockDeps = {
        platform: () => "freebsd",
        hostname: () => "freebsd-server",
        execFile: vi.fn(),
        env: {},
      };
      setMachineNameDeps(mockDeps);

      const result = await getMachineDisplayName();
      expect(result).toBe("freebsd-server");
      expect(mockDeps.execFile).not.toHaveBeenCalled();
    });
  });
});
