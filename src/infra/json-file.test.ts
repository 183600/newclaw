import fs from "node:fs";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { loadJsonFile, saveJsonFile } from "./json-file.js";

describe("json-file", () => {
  let tempDir: string;
  let testFile: string;
  let nestedFile: string;

  beforeAll(async () => {
    tempDir = await fs.promises.mkdtemp(path.join(process.cwd(), "test-json-file-"));
    testFile = path.join(tempDir, "test.json");
    nestedFile = path.join(tempDir, "nested", "deep", "test.json");
  });

  afterAll(async () => {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  afterEach(async () => {
    try {
      await fs.promises.rm(testFile, { force: true });
      await fs.promises.rm(path.join(tempDir, "nested"), { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("loadJsonFile", () => {
    it("returns undefined for non-existent file", () => {
      const result = loadJsonFile(testFile);
      expect(result).toBeUndefined();
    });

    it("loads valid JSON file", async () => {
      const testData = { name: "test", value: 42 };
      await fs.promises.writeFile(testFile, JSON.stringify(testData));

      const result = loadJsonFile(testFile);
      expect(result).toEqual(testData);
    });

    it("loads JSON array", async () => {
      const testData = [1, 2, 3, "test"];
      await fs.promises.writeFile(testFile, JSON.stringify(testData));

      const result = loadJsonFile(testFile);
      expect(result).toEqual(testData);
    });

    it("loads JSON primitive values", async () => {
      await fs.promises.writeFile(testFile, "42");
      expect(loadJsonFile(testFile)).toBe(42);

      await fs.promises.writeFile(testFile, '"test string"');
      expect(loadJsonFile(testFile)).toBe("test string");

      await fs.promises.writeFile(testFile, "true");
      expect(loadJsonFile(testFile)).toBe(true);

      await fs.promises.writeFile(testFile, "null");
      expect(loadJsonFile(testFile)).toBe(null);
    });

    it("returns undefined for invalid JSON", async () => {
      await fs.promises.writeFile(testFile, "invalid json");
      const result = loadJsonFile(testFile);
      expect(result).toBeUndefined();
    });

    it("returns undefined for empty file", async () => {
      await fs.promises.writeFile(testFile, "");
      const result = loadJsonFile(testFile);
      expect(result).toBeUndefined();
    });

    it("handles JSON with whitespace", async () => {
      const testData = { test: "value" };
      await fs.promises.writeFile(testFile, `  \n${JSON.stringify(testData)}\n  `);

      const result = loadJsonFile(testFile);
      expect(result).toEqual(testData);
    });

    it("returns undefined on file read errors", () => {
      // Use a directory path instead of file path to trigger an error
      const result = loadJsonFile(tempDir);
      expect(result).toBeUndefined();
    });
  });

  describe("saveJsonFile", () => {
    it("saves object to JSON file", async () => {
      const testData = { name: "test", value: 42 };
      saveJsonFile(testFile, testData);

      const content = await fs.promises.readFile(testFile, "utf8");
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(testData);
    });

    it("saves array to JSON file", async () => {
      const testData = [1, 2, 3, "test"];
      saveJsonFile(testFile, testData);

      const content = await fs.promises.readFile(testFile, "utf8");
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(testData);
    });

    it("saves primitive values to JSON file", async () => {
      saveJsonFile(testFile, 42);
      let content = await fs.promises.readFile(testFile, "utf8");
      expect(JSON.parse(content)).toBe(42);

      saveJsonFile(testFile, "test string");
      content = await fs.promises.readFile(testFile, "utf8");
      expect(JSON.parse(content)).toBe("test string");

      saveJsonFile(testFile, true);
      content = await fs.promises.readFile(testFile, "utf8");
      expect(JSON.parse(content)).toBe(true);

      saveJsonFile(testFile, null);
      content = await fs.promises.readFile(testFile, "utf8");
      expect(JSON.parse(content)).toBe(null);
    });

    it("creates nested directories if they don't exist", async () => {
      const testData = { nested: "file" };
      saveJsonFile(nestedFile, testData);

      expect(fs.existsSync(nestedFile)).toBe(true);

      const content = await fs.promises.readFile(nestedFile, "utf8");
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(testData);
    });

    it("formats JSON with proper indentation", async () => {
      const testData = { level1: { level2: "value" } };
      saveJsonFile(testFile, testData);

      const content = await fs.promises.readFile(testFile, "utf8");
      expect(content).toContain('  "level2": "value"');
      expect(content).toContain("\n");
    });

    it("adds newline at end of file", async () => {
      const testData = { test: "value" };
      saveJsonFile(testFile, testData);

      const content = await fs.promises.readFile(testFile, "utf8");
      expect(content).toEndWith("\n");
    });

    it("sets secure file permissions", async () => {
      const testData = { sensitive: "data" };
      saveJsonFile(testFile, testData);

      const stats = await fs.promises.stat(testFile);
      const mode = stats.mode;

      // Check that file permissions are 0o600 (owner read/write only)
      expect(mode & 0o777).toBe(0o600);
    });

    it("sets secure directory permissions for nested paths", async () => {
      const testData = { nested: "secure" };
      saveJsonFile(nestedFile, testData);

      const nestedDir = path.dirname(nestedFile);
      const stats = await fs.promises.stat(nestedDir);
      const mode = stats.mode;

      // Check that directory permissions are 0o700 ( owner read/write/execute only)
      expect(mode & 0o777).toBe(0o700);
    });

    it("overwrites existing file", async () => {
      // Create initial file
      await fs.promises.writeFile(testFile, "old content");

      const newData = { new: "data" };
      saveJsonFile(testFile, newData);

      const content = await fs.promises.readFile(testFile, "utf8");
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(newData);
    });

    it("handles circular references by throwing", () => {
      const circular: any = { name: "test" };
      circular.self = circular;

      expect(() => saveJsonFile(testFile, circular)).toThrow();
    });
  });

  describe("round-trip tests", () => {
    it("can save and load complex objects", () => {
      const testData = {
        string: "test",
        number: 42,
        boolean: true,
        null: null,
        array: [1, "two", { three: 3 }],
        nested: {
          deep: {
            value: "nested",
          },
        },
      };

      saveJsonFile(testFile, testData);
      const loaded = loadJsonFile(testFile);
      expect(loaded).toEqual(testData);
    });

    it("preserves data types through save/load cycle", () => {
      const testData = {
        int: 42,
        float: 3.14,
        string: "test",
        boolean: true,
        null: null,
        array: [1, "two", true],
      };

      saveJsonFile(testFile, testData);
      const loaded = loadJsonFile(testFile) as any;

      expect(typeof loaded.int).toBe("number");
      expect(typeof loaded.float).toBe("number");
      expect(typeof loaded.string).toBe("string");
      expect(typeof loaded.boolean).toBe("boolean");
      expect(loaded.null).toBe(null);
      expect(Array.isArray(loaded.array)).toBe(true);
    });
  });
});
