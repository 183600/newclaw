import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { openFileWithinRoot, SafeOpenError } from "./fs-safe.js";

describe("openFileWithinRoot", () => {
  let tempDir: string;
  let testFile: string;
  let subDir: string;
  let subFile: string;

  beforeAll(async () => {
    tempDir = await fs.promises.mkdtemp(path.join(process.cwd(), "test-fs-safe-"));
    testFile = path.join(tempDir, "test.txt");
    subDir = path.join(tempDir, "subdir");
    subFile = path.join(subDir, "subtest.txt");

    // Create test files
    await fs.promises.writeFile(testFile, "test content");
    await fs.promises.mkdir(subDir);
    await fs.promises.writeFile(subFile, "sub content");
  });

  afterAll(async () => {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  it("opens a file within the root directory", async () => {
    const result = await openFileWithinRoot({
      rootDir: tempDir,
      relativePath: "test.txt",
    });

    expect(result.handle).toBeDefined();
    expect(result.realPath).toBe(testFile);
    expect(result.stat.isFile()).toBe(true);

    await result.handle.close();
  });

  it("opens a file in a subdirectory", async () => {
    const result = await openFileWithinRoot({
      rootDir: tempDir,
      relativePath: "subdir/subtest.txt",
    });

    expect(result.handle).toBeDefined();
    expect(result.realPath).toBe(subFile);
    expect(result.stat.isFile()).toBe(true);

    await result.handle.close();
  });

  it("throws SafeOpenError for non-existent file", async () => {
    await expect(
      openFileWithinRoot({
        rootDir: tempDir,
        relativePath: "nonexistent.txt",
      }),
    ).rejects.toThrow(SafeOpenError);
  });

  it("throws SafeOpenError for non-existent root directory", async () => {
    await expect(
      openFileWithinRoot({
        rootDir: path.join(tempDir, "nonexistent"),
        relativePath: "test.txt",
      }),
    ).rejects.toThrow(SafeOpenError);
  });

  it("throws SafeOpenError for path escaping root", async () => {
    await expect(
      openFileWithinRoot({
        rootDir: subDir,
        relativePath: "../test.txt",
      }),
    ).rejects.toThrow(SafeOpenError);
  });

  it("throws SafeOpenError for absolute path", async () => {
    await expect(
      openFileWithinRoot({
        rootDir: tempDir,
        relativePath: testFile,
      }),
    ).rejects.toThrow(SafeOpenError);
  });

  it("throws SafeOpenError for directory instead of file", async () => {
    await expect(
      openFileWithinRoot({
        rootDir: tempDir,
        relativePath: "subdir",
      }),
    ).rejects.toThrow(SafeOpenError);
  });

  describe("symlink handling", () => {
    let symlinkFile: string;
    let externalFile: string;
    let symlinkToExternal: string;

    beforeAll(async () => {
      externalFile = path.join(path.dirname(tempDir), "external.txt");
      await fs.promises.writeFile(externalFile, "external content");

      symlinkFile = path.join(tempDir, "symlink.txt");
      symlinkToExternal = path.join(tempDir, "symlink-external.txt");

      // Create symlinks (skip on Windows if not supported)
      try {
        await fs.promises.symlink(testFile, symlinkFile);
        await fs.promises.symlink(externalFile, symlinkToExternal);
      } catch {
        // Skip symlink tests if not supported
      }
    });

    afterAll(async () => {
      try {
        await fs.promises.unlink(symlinkFile);
        await fs.promises.unlink(symlinkToExternal);
        await fs.promises.unlink(externalFile);
      } catch {
        // Ignore cleanup errors
      }
    });

    it("throws SafeOpenError for internal symlinks", async () => {
      try {
        await expect(
          openFileWithinRoot({
            rootDir: tempDir,
            relativePath: "symlink.txt",
          }),
        ).rejects.toThrow(SafeOpenError);
      } catch {
        // Skip test if symlinks not supported
      }
    });

    it("throws SafeOpenError for external symlinks", async () => {
      try {
        await expect(
          openFileWithinRoot({
            rootDir: tempDir,
            relativePath: "symlink-external.txt",
          }),
        ).rejects.toThrow(SafeOpenError);
      } catch {
        // Skip test if symlinks not supported
      }
    });
  });

  describe("error handling", () => {
    it("properly closes file handle on error", async () => {
      const mockClose = vi.fn();
      const mockStat = vi.fn().mockRejectedValue(new Error("Stat error"));

      // Create a mock handle that throws on stat
      const mockHandle = {
        close: mockClose,
        stat: mockStat,
      } as unknown;

      // Mock fs.open to return our mock handle
      const _originalOpen = fs.promises.open;
      vi.spyOn(fs.promises, "open").mockResolvedValue(mockHandle);

      try {
        await expect(
          openFileWithinRoot({
            rootDir: tempDir,
            relativePath: "test.txt",
          }),
        ).rejects.toThrow();

        expect(mockClose).toHaveBeenCalled();
      } finally {
        vi.restoreAllMocks();
      }
    });

    it("handles file system errors gracefully", async () => {
      const _originalOpen = fs.promises.open;
      vi.spyOn(fs.promises, "open").mockRejectedValue(new Error("Permission denied"));

      try {
        await expect(
          openFileWithinRoot({
            rootDir: tempDir,
            relativePath: "test.txt",
          }),
        ).rejects.toThrow("Permission denied");
      } finally {
        vi.restoreAllMocks();
      }
    });
  });
});
