import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ensureDir, sleep, assertWebChannel, WebChannel } from "./utils.js";

describe("General utility functions", () => {
  describe("ensureDir", () => {
    it("should create directory recursively", async () => {
      const testDir = "/tmp/test-ensure-dir/nested/deep/path";

      // Clean up before test
      try {
        await fs.promises.rm("/tmp/test-ensure-dir", { recursive: true, force: true });
      } catch {}

      await ensureDir(testDir);

      expect(fs.existsSync(testDir)).toBe(true);

      // Clean up after test
      await fs.promises.rm("/tmp/test-ensure-dir", { recursive: true, force: true });
    });

    it("should not fail if directory already exists", async () => {
      const testDir = "/tmp/test-ensure-dir-existing";

      // Create directory first
      await fs.promises.mkdir(testDir, { recursive: true });

      // This should not throw
      await expect(ensureDir(testDir)).resolves.toBeUndefined();

      // Clean up after test
      await fs.promises.rm("/tmp/test-ensure-dir-existing", { recursive: true, force: true });
    });
  });

  describe("sleep", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should resolve after specified time", async () => {
      const promise = sleep(1000);

      // Promise should not resolve before time passes
      let resolved = false;
      void promise.then(() => {
        resolved = true;
      });

      await vi.advanceTimersByTimeAsync(999);
      expect(resolved).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(resolved).toBe(true);
    });

    it("should work with zero delay", async () => {
      const promise = sleep(0);

      // With fake timers, we need to advance time for the promise to resolve
      await vi.advanceTimersByTimeAsync(0);
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe("assertWebChannel", () => {
    it("should not throw for valid web channel", () => {
      expect(() => assertWebChannel("web")).not.toThrow();
    });

    it("should throw for invalid web channel", () => {
      expect(() => assertWebChannel("invalid")).toThrow("Web channel must be 'web'");
      expect(() => assertWebChannel("web2")).toThrow("Web channel must be 'web'");
      expect(() => assertWebChannel("")).toThrow("Web channel must be 'web'");
    });

    it("should narrow type correctly", () => {
      const input: string = "web";
      assertWebChannel(input);

      // TypeScript should know this is now WebChannel type
      const channel: WebChannel = input;
      expect(channel).toBe("web");
    });
  });
});
