import fs from "node:fs";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { loadJsonFile, saveJsonFile } from "./json-file.js";

describe("loadJsonFile", () => {
  let tempDir: string;
  let testFile: string;

  beforeAll(async () => {
    tempDir = await fs.promises.mkdtemp(path.join(process.cwd(), "test-json-file-"));
    testFile = path.join(tempDir, "test.json");
  });

  afterAll(async () => {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns undefined for non-existent file", () => {
    const nonExistentFile = path.join(tempDir, "nonexistent.json");
    expect(loadJsonFile(nonExistentFile)).toBeUndefined();
  });

  it("loads and parses valid JSON file", () => {
    const testData = { name: "test", value: 123, active: true };
    fs.writeFileSync(testFile, JSON.stringify(testData), "utf8");

    const result = loadJsonFile(testFile);
    expect(result).toEqual(testData);
  });

  it("loads JSON with various data types", () => {
    const testData = {
      string: "hello",
      number: 42,
      boolean: true,
      null: null,
      array: [1, 2, 3],
      object: { nested: "value" },
    };
    fs.writeFileSync(testFile, JSON.stringify(testData), "utf8");

    const result = loadJsonFile(testFile);
    expect(result).toEqual(testData);
  });

  it("returns undefined for invalid JSON", () => {
    fs.writeFileSync(testFile, "{ invalid json }", "utf8");

    const result = loadJsonFile(testFile);
    expect(result).toBeUndefined();
  });

  it("returns undefined for empty file", () => {
    fs.writeFileSync(testFile, "", "utf8");

    const result = loadJsonFile(testFile);
    expect(result).toBeUndefined();
  });

  it("returns undefined when file read throws error", () => {
    const mockReadFileSync = vi.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw new Error("Permission denied");
    });

    try {
      const result = loadJsonFile(testFile);
      expect(result).toBeUndefined();
    } finally {
      mockReadFileSync.mockRestore();
    }
  });

  it("returns undefined when existsSync throws error", () => {
    const mockExistsSync = vi.spyOn(fs, "existsSync").mockImplementation(() => {
      throw new Error("File system error");
    });

    try {
      const result = loadJsonFile(testFile);
      expect(result).toBeUndefined();
    } finally {
      mockExistsSync.mockRestore();
    }
  });

  it("handles JSON with whitespace", () => {
    const testData = { test: "value" };
    fs.writeFileSync(testFile, `  \n\t${JSON.stringify(testData)}\n  `, "utf8");

    const result = loadJsonFile(testFile);
    expect(result).toEqual(testData);
  });
});

describe("saveJsonFile", () => {
  let tempDir: string;
  let testFile: string;
  let nestedDir: string;
  let nestedFile: string;

  beforeAll(async () => {
    tempDir = await fs.promises.mkdtemp(path.join(process.cwd(), "test-json-file-save-"));
    testFile = path.join(tempDir, "test.json");
    nestedDir = path.join(tempDir, "nested", "dir");
    nestedFile = path.join(nestedDir, "nested.json");
  });

  afterAll(async () => {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("saves object to JSON file", () => {
    const testData = { name: "test", value: 123 };
    saveJsonFile(testFile, testData);

    expect(fs.existsSync(testFile)).toBe(true);
    const content = fs.readFileSync(testFile, "utf8");
    expect(JSON.parse(content)).toEqual(testData);
  });

  it("saves array to JSON file", () => {
    const testData = [1, 2, 3, { nested: "value" }];
    saveJsonFile(testFile, testData);

    expect(fs.existsSync(testFile)).toBe(true);
    const content = fs.readFileSync(testFile, "utf8");
    expect(JSON.parse(content)).toEqual(testData);
  });

  it("saves primitive values to JSON file", () => {
    saveJsonFile(testFile, "string value");
    let content = fs.readFileSync(testFile, "utf8");
    expect(JSON.parse(content)).toBe("string value");

    saveJsonFile(testFile, 42);
    content = fs.readFileSync(testFile, "utf8");
    expect(JSON.parse(content)).toBe(42);

    saveJsonFile(testFile, true);
    content = fs.readFileSync(testFile, "utf8");
    expect(JSON.parse(content)).toBe(true);

    saveJsonFile(testFile, null);
    content = fs.readFileSync(testFile, "utf8");
    expect(JSON.parse(content)).toBe(null);
  });

  it("creates nested directories if they don't exist", () => {
    const testData = { nested: "value" };
    saveJsonFile(nestedFile, testData);

    expect(fs.existsSync(nestedDir)).toBe(true);
    expect(fs.existsSync(nestedFile)).toBe(true);

    const content = fs.readFileSync(nestedFile, "utf8");
    expect(JSON.parse(content)).toEqual(testData);
  });

  it("formats JSON with 2-space indentation", () => {
    const testData = { level1: { level2: "value" } };
    saveJsonFile(testFile, testData);

    const content = fs.readFileSync(testFile, "utf8");
    expect(content).toContain('  "level1":');
    expect(content).toContain('    "level2":');
  });

  it("adds newline at end of file", () => {
    const testData = { test: "value" };
    saveJsonFile(testFile, testData);

    const content = fs.readFileSync(testFile, "utf8");
    expect(content).toMatch(/\n$/);
  });

  it("sets file permissions to 0o600 (read/write for owner only)", () => {
    const testData = { test: "value" };
    saveJsonFile(testFile, testData);

    const stats = fs.statSync(testFile);
    // On Windows, mode might be different, so we check on Unix-like systems only
    if (process.platform !== "win32") {
      expect(stats.mode & 0o777).toBe(0o600);
    }
  });

  it("sets directory permissions to 0o700 (rwx for owner only)", () => {
    const testData = { nested: "value" };
    saveJsonFile(nestedFile, testData);

    const stats = fs.statSync(nestedDir);
    // On Windows, mode might be different, so we check on Unix-like systems only
    if (process.platform !== "win32") {
      expect(stats.mode & 0o777).toBe(0o700);
    }
  });

  it("overwrites existing file", () => {
    // Create initial file
    saveJsonFile(testFile, { initial: "value" });

    // Overwrite with new data
    const newData = { new: "data" };
    saveJsonFile(testFile, newData);

    const content = fs.readFileSync(testFile, "utf8");
    expect(JSON.parse(content)).toEqual(newData);
  });

  it("handles circular references by throwing error", () => {
    const circular: { name: string; self?: unknown } = { name: "test" };
    circular.self = circular;

    expect(() => saveJsonFile(testFile, circular)).toThrow();
  });

  it("handles undefined values", () => {
    const testData = { defined: "value", undefined: undefined };
    saveJsonFile(testFile, testData);

    const content = fs.readFileSync(testFile, "utf8");
    const parsed = JSON.parse(content);
    expect(parsed).toEqual({ defined: "value" }); // undefined is omitted by JSON.stringify
  });

  it("handles special characters in data", () => {
    const testData = {
      unicode: "Hello 世界 🌍",
      specialChars: "Special: \"quotes\" and 'apostrophes' and \\backslashes\\",
      newlines: "Line 1\nLine 2\r\nLine 3",
      tabs: "Column1\tColumn2\tColumn3",
    };
    saveJsonFile(testFile, testData);

    const content = fs.readFileSync(testFile, "utf8");
    expect(JSON.parse(content)).toEqual(testData);
  });
});
