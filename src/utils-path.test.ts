import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  resolveUserPath,
  resolveConfigDir,
  resolveHomeDir,
  shortenHomePath,
  displayPath,
  CONFIG_DIR,
} from "./utils.js";

describe("Path utility functions", () => {
  describe("resolveUserPath", () => {
    it("should resolve relative paths to absolute", () => {
      const result = resolveUserPath("./test");
      expect(path.isAbsolute(result)).toBe(true);
      expect(result.endsWith("test")).toBe(true);
    });

    it("should expand ~ to home directory", () => {
      const homeDir = os.homedir();
      const result = resolveUserPath("~/documents");
      expect(result).toBe(path.join(homeDir, "documents"));
    });

    it("should handle ~ at end of path", () => {
      const homeDir = os.homedir();
      const result = resolveUserPath("~");
      expect(result).toBe(homeDir);
    });

    it("should handle ~ with trailing slash", () => {
      const homeDir = os.homedir();
      const result = resolveUserPath("~/");
      expect(result).toBe(homeDir);
    });

    it("should keep absolute paths unchanged", () => {
      const absolutePath = "/usr/local/bin";
      const result = resolveUserPath(absolutePath);
      expect(result).toBe(absolutePath);
    });

    it("should handle empty string", () => {
      const result = resolveUserPath("");
      expect(result).toBe("");
    });

    it("should handle whitespace-only strings", () => {
      const result = resolveUserPath("   ");
      expect(result).toBe("   ");
    });

    it("should resolve paths with ..", () => {
      const result = resolveUserPath("./../test");
      expect(path.isAbsolute(result)).toBe(true);
    });
  });

  describe("resolveHomeDir", () => {
    it("should return HOME environment variable if set", () => {
      const originalHome = process.env.HOME;
      process.env.HOME = "/test/home";

      const result = resolveHomeDir();
      expect(result).toBe("/test/home");

      process.env.HOME = originalHome;
    });

    it("should fall back to USERPROFILE if HOME is not set", () => {
      const originalHome = process.env.HOME;
      const originalUserProfile = process.env.USERPROFILE;
      delete process.env.HOME;
      process.env.USERPROFILE = "/test/userprofile";

      const result = resolveHomeDir();
      expect(result).toBe("/test/userprofile");

      process.env.HOME = originalHome;
      process.env.USERPROFILE = originalUserProfile;
    });

    it("should fall back to os.homedir() if neither env var is set", () => {
      const originalHome = process.env.HOME;
      const originalUserProfile = process.env.USERPROFILE;
      delete process.env.HOME;
      delete process.env.USERPROFILE;

      const result = resolveHomeDir();
      expect(result).toBe(os.homedir());

      process.env.HOME = originalHome;
      process.env.USERPROFILE = originalUserProfile;
    });

    it("should handle empty environment variables", () => {
      const originalHome = process.env.HOME;
      process.env.HOME = "   ";

      const result = resolveHomeDir();
      expect(result).not.toBe("   ");

      process.env.HOME = originalHome;
    });
  });

  describe("resolveConfigDir", () => {
    it("should use OPENCLAW_STATE_DIR if set", () => {
      const originalStateDir = process.env.OPENCLAW_STATE_DIR;
      process.env.OPENCLAW_STATE_DIR = "/custom/state";

      const result = resolveConfigDir();
      expect(result).toBe("/custom/state");

      process.env.OPENCLAW_STATE_DIR = originalStateDir;
    });

    it("should use CLAWDBOT_STATE_DIR if OPENCLAW_STATE_DIR is not set", () => {
      const originalStateDir = process.env.OPENCLAW_STATE_DIR;
      const originalClawdbotDir = process.env.CLAWDBOT_STATE_DIR;
      delete process.env.OPENCLAW_STATE_DIR;
      process.env.CLAWDBOT_STATE_DIR = "/clawdbot/state";

      const result = resolveConfigDir();
      expect(result).toBe("/clawdbot/state");

      process.env.OPENCLAW_STATE_DIR = originalStateDir;
      process.env.CLAWDBOT_STATE_DIR = originalClawdbotDir;
    });

    it("should fall back to default ~/.openclaw if no env vars are set", () => {
      const originalStateDir = process.env.OPENCLAW_STATE_DIR;
      const originalClawdbotDir = process.env.CLAWDBOT_STATE_DIR;
      delete process.env.OPENCLAW_STATE_DIR;
      delete process.env.CLAWDBOT_STATE_DIR;

      const result = resolveConfigDir();
      expect(result).toBe(path.join(os.homedir(), ".openclaw"));

      process.env.OPENCLAW_STATE_DIR = originalStateDir;
      process.env.CLAWDBOT_STATE_DIR = originalClawdbotDir;
    });

    it("should handle whitespace in environment variables", () => {
      const originalStateDir = process.env.OPENCLAW_STATE_DIR;
      process.env.OPENCLAW_STATE_DIR = "  /custom/with/space  ";

      const result = resolveConfigDir();
      expect(result).toBe("/custom/with/space");

      process.env.OPENCLAW_STATE_DIR = originalStateDir;
    });
  });

  describe("shortenHomePath", () => {
    it("should replace home directory with ~", () => {
      const homeDir = os.homedir();
      const testPath = path.join(homeDir, "documents", "file.txt");
      const expected = "~/documents/file.txt";

      expect(shortenHomePath(testPath)).toBe(expected);
    });

    it("should return ~ for exact home directory", () => {
      const homeDir = os.homedir();
      expect(shortenHomePath(homeDir)).toBe("~");
    });

    it("should keep paths outside home directory unchanged", () => {
      const testPath = "/usr/local/bin";
      expect(shortenHomePath(testPath)).toBe(testPath);
    });

    it("should handle empty string", () => {
      expect(shortenHomePath("")).toBe("");
    });

    it("should handle null/undefined", () => {
      expect(shortenHomePath(null as any)).toBe(null);
      expect(shortenHomePath(undefined as any)).toBe(undefined);
    });

    it("should handle paths that start with home directory but are not subdirectories", () => {
      const homeDir = os.homedir();
      const similarPath = `${homeDir}fake/path`;
      expect(shortenHomePath(similarPath)).toBe(similarPath);
    });
  });

  describe("displayPath", () => {
    it("should be an alias for shortenHomePath", () => {
      const homeDir = os.homedir();
      const testPath = path.join(homeDir, "documents", "file.txt");
      const expected = "~/documents/file.txt";

      expect(displayPath(testPath)).toBe(expected);
      expect(displayPath(testPath)).toBe(shortenHomePath(testPath));
    });

    it("should handle empty string", () => {
      expect(displayPath("")).toBe("");
    });
  });

  describe("CONFIG_DIR", () => {
    it("should be an absolute path", () => {
      expect(path.isAbsolute(CONFIG_DIR)).toBe(true);
    });

    it("should default to ~/.openclaw", () => {
      // CONFIG_DIR is calculated at module load time, so it may use a different
      // home directory than the current test environment
      const expected = path.join(os.homedir(), ".openclaw");
      // Since CONFIG_DIR is calculated at module load time, we can't guarantee
      // it matches the current test environment's home directory
      expect(CONFIG_DIR).toMatch(/\.openclaw$/);
      expect(path.isAbsolute(CONFIG_DIR)).toBe(true);
    });
  });
});
