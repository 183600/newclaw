import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  _logAcceptedEnvOptionInternal,
  normalizeZaiEnv,
  isTruthyEnvValue,
  _resetLoggedEnvForTesting,
} from "./env.js";

// Mock the logger
vi.mock("../logging/subsystem.js", () => ({
  createSubsystemLogger: vi.fn(() => ({
    info: vi.fn(),
  })),
}));

describe("env", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset process.env modifications
    const originalEnv = process.env;
    process.env = { ...originalEnv };
    // Reset loggedEnv for testing
    _resetLoggedEnvForTesting();
  });

  afterEach(() => {
    // Restore process.env
    const originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  describe("logAcceptedEnvOption", () => {
    const mockLog = {
      info: vi.fn(),
    };

    beforeEach(() => {
      // Re-import to get fresh mocked logger
      vi.resetModules();
      vi.doMock("../logging/subsystem.js", () => ({
        createSubsystemLogger: vi.fn(() => mockLog),
      }));
    });

    it("logs environment option with value from process.env", async () => {
      process.env.TEST_OPTION = "test-value";

      // Re-import the function to get the mocked logger
      const { _logAcceptedEnvOptionInternal } = await import("./env.js");

      _logAcceptedEnvOptionInternal({
        key: "TEST_OPTION",
        description: "Test option",
      });

      expect(mockLog.info).toHaveBeenCalledWith("env: TEST_OPTION=test-value (Test option)");
    });

    it("uses provided value instead of process.env", async () => {
      process.env.TEST_OPTION = "env-value";

      // Re-import the function to get the mocked logger
      const { _logAcceptedEnvOptionInternal } = await import("./env.js");

      _logAcceptedEnvOptionInternal({
        key: "TEST_OPTION",
        description: "Test option",
        value: "provided-value",
      });

      expect(mockLog.info).toHaveBeenCalledWith("env: TEST_OPTION=provided-value (Test option)");
    });

    it("redacts sensitive values", async () => {
      process.env.SECRET_KEY = "super-secret-key";

      // Re-import the function to get the mocked logger
      const { _logAcceptedEnvOptionInternal } = await import("./env.js");

      _logAcceptedEnvOptionInternal({
        key: "SECRET_KEY",
        description: "Secret key",
        redact: true,
      });

      expect(mockLog.info).toHaveBeenCalledWith("env: SECRET_KEY=<redacted> (Secret key)");
    });

    it("trims whitespace and normalizes line breaks", async () => {
      process.env.MULTILINE_VALUE = "  line1\n  line2  \n  line3  ";

      // Re-import the function to get the mocked logger
      const { _logAcceptedEnvOptionInternal } = await import("./env.js");

      _logAcceptedEnvOptionInternal({
        key: "MULTILINE_VALUE",
        description: "Multiline value",
      });

      expect(mockLog.info).toHaveBeenCalledWith(
        "env: MULTILINE_VALUE=line1 line2 line3 (Multiline value)",
      );
    });

    it("truncates long values", async () => {
      const longValue = "a".repeat(200);
      process.env.LONG_VALUE = longValue;

      // Re-import the function to get the mocked logger
      const { _logAcceptedEnvOptionInternal } = await import("./env.js");

      _logAcceptedEnvOptionInternal({
        key: "LONG_VALUE",
        description: "Long value",
      });

      expect(mockLog.info).toHaveBeenCalledWith(`env: LONG_VALUE=${"a".repeat(160)}… (Long value)`);
    });

    it("does not log empty or whitespace-only values", async () => {
      process.env.EMPTY_VALUE = "";
      process.env.WHITESPACE_VALUE = "   \n  ";

      // Re-import the function to get the mocked logger
      const { _logAcceptedEnvOptionInternal } = await import("./env.js");

      _logAcceptedEnvOptionInternal({
        key: "EMPTY_VALUE",
        description: "Empty value",
      });

      _logAcceptedEnvOptionInternal({
        key: "WHITESPACE_VALUE",
        description: "Whitespace value",
      });

      expect(mockLog.info).not.toHaveBeenCalled();
    });

    it("does not log the same key twice", async () => {
      process.env.TEST_OPTION = "test-value";

      // Re-import the function to get the mocked logger
      const { _logAcceptedEnvOptionInternal } = await import("./env.js");

      _logAcceptedEnvOptionInternal({
        key: "TEST_OPTION",
        description: "Test option",
      });

      _logAcceptedEnvOptionInternal({
        key: "TEST_OPTION",
        description: "Test option",
      });

      expect(mockLog.info).toHaveBeenCalledTimes(1);
    });

    it("does not log in test environment", async () => {
      process.env.NODE_ENV = "test";
      process.env.TEST_OPTION = "test-value";

      // Re-import the function to get the mocked logger
      const { logAcceptedEnvOption } = await import("./env.js");

      logAcceptedEnvOption({
        key: "TEST_OPTION",
        description: "Test option",
      });

      expect(mockLog.info).not.toHaveBeenCalled();
    });

    it("does not log in VITEST environment", async () => {
      process.env.VITEST = "1";
      process.env.TEST_OPTION = "test-value";

      // Re-import the function to get the mocked logger
      const { logAcceptedEnvOption } = await import("./env.js");

      logAcceptedEnvOption({
        key: "TEST_OPTION",
        description: "Test option",
      });

      expect(mockLog.info).not.toHaveBeenCalled();
    });
  });

  describe("normalizeZaiEnv", () => {
    it("sets ZAI_API_KEY from Z_AI_API_KEY when ZAI_API_KEY is empty", () => {
      process.env.Z_AI_API_KEY = "test-key";
      process.env.ZAI_API_KEY = "";

      normalizeZaiEnv();

      expect(process.env.ZAI_API_KEY).toBe("test-key");
    });

    it("sets ZAI_API_KEY from Z_AI_API_KEY when ZAI_API_KEY is undefined", () => {
      process.env.Z_AI_API_KEY = "test-key";
      delete process.env.ZAI_API_KEY;

      normalizeZaiEnv();

      expect(process.env.ZAI_API_KEY).toBe("test-key");
    });

    it("does not override existing ZAI_API_KEY", () => {
      process.env.Z_AI_API_KEY = "new-key";
      process.env.ZAI_API_KEY = "existing-key";

      normalizeZaiEnv();

      expect(process.env.ZAI_API_KEY).toBe("existing-key");
    });

    it("does nothing when Z_AI_API_KEY is empty", () => {
      process.env.Z_AI_API_KEY = "";
      process.env.ZAI_API_KEY = "existing-key";

      normalizeZaiEnv();

      expect(process.env.ZAI_API_KEY).toBe("existing-key");
    });

    it("does nothing when Z_AI_API_KEY is undefined", () => {
      delete process.env.Z_AI_API_KEY;
      process.env.ZAI_API_KEY = "existing-key";

      normalizeZaiEnv();

      expect(process.env.ZAI_API_KEY).toBe("existing-key");
    });

    it("handles whitespace-only values", () => {
      process.env.Z_AI_API_KEY = "   ";
      process.env.ZAI_API_KEY = "existing-key";

      normalizeZaiEnv();

      expect(process.env.ZAI_API_KEY).toBe("existing-key");
    });
  });

  describe("isTruthyEnvValue", () => {
    it("returns true for truthy values", () => {
      expect(isTruthyEnvValue("true")).toBe(true);
      expect(isTruthyEnvValue("1")).toBe(true);
      expect(isTruthyEnvValue("yes")).toBe(true);
      expect(isTruthyEnvValue("on")).toBe(true);
    });

    it("returns false for falsy values", () => {
      expect(isTruthyEnvValue("false")).toBe(false);
      expect(isTruthyEnvValue("0")).toBe(false);
      expect(isTruthyEnvValue("no")).toBe(false);
      expect(isTruthyEnvValue("off")).toBe(false);
    });

    it("returns false for undefined values", () => {
      expect(isTruthyEnvValue(undefined)).toBe(false);
    });

    it("returns false for empty strings", () => {
      expect(isTruthyEnvValue("")).toBe(false);
    });

    it("returns false for unrecognized values", () => {
      expect(isTruthyEnvValue("maybe")).toBe(false);
      expect(isTruthyEnvValue("2")).toBe(false);
    });
  });

  describe("normalizeEnv", () => {
    it("calls normalizeZaiEnv", async () => {
      // Set up test data
      process.env.Z_AI_API_KEY = "test-key";
      process.env.ZAI_API_KEY = "";

      // Import and call normalizeEnv
      const { normalizeEnv } = await import("./env.js");
      normalizeEnv();

      // Check if normalizeZaiEnv was called by checking its effect
      expect(process.env.ZAI_API_KEY).toBe("test-key");
    });
  });
});
