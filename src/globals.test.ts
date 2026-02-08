import { afterEach, describe, expect, it, vi } from "vitest";
import { 
  isVerbose, 
  isYes, 
  logVerbose, 
  logVerboseConsole,
  setVerbose, 
  setYes,
  shouldLogVerbose,
  success,
  warn,
  info,
  danger
} from "./globals.js";

// Mock the logger and theme modules
vi.mock("./logging/logger.js", () => ({
  getLogger: () => ({
    debug: vi.fn()
  }),
  isFileLogLevelEnabled: vi.fn()
}));

vi.mock("./terminal/theme.js", () => ({
  theme: {
    success: vi.fn((text) => `success:${text}`),
    warn: vi.fn((text) => `warn:${text}`),
    info: vi.fn((text) => `info:${text}`),
    error: vi.fn((text) => `error:${text}`),
    muted: vi.fn((text) => `muted:${text}`)
  }
}));

describe("globals", () => {
  afterEach(() => {
    setVerbose(false);
    setYes(false);
    vi.restoreAllMocks();
  });

  describe("verbose functionality", () => {
    it("toggles verbose flag and logs when enabled", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      setVerbose(false);
      logVerbose("hidden");
      expect(logSpy).not.toHaveBeenCalled();

      setVerbose(true);
      logVerbose("shown");
      expect(isVerbose()).toBe(true);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("shown"));
    });

    it("defaults to verbose disabled", () => {
      expect(isVerbose()).toBe(false);
    });

    it("handles multiple verbose state changes", () => {
      setVerbose(true);
      expect(isVerbose()).toBe(true);
      
      setVerbose(false);
      expect(isVerbose()).toBe(false);
      
      setVerbose(true);
      expect(isVerbose()).toBe(true);
      
      setVerbose(false);
      expect(isVerbose()).toBe(false);
    });

    it("handles empty and undefined log messages", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      setVerbose(true);
      
      logVerbose("");
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(""));
      
      logVerbose(undefined as any);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("undefined"));
      
      logVerbose(null as any);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("null"));
    });
  });

  describe("logVerbose function", () => {
    it("uses logger when verbose is disabled but file debug is enabled", () => {
      const { getLogger, isFileLogLevelEnabled } = await import("./logging/logger.js");
      const mockLogger = { debug: vi.fn() };
      const mockIsFileLogLevelEnabled = vi.fn().mockReturnValue(true);
      
      vi.mocked(getLogger).mockReturnValue(mockLogger);
      vi.mocked(isFileLogLevelEnabled).mockReturnValue(mockIsFileLogLevelEnabled);
      
      setVerbose(false);
      logVerbose("test message");
      
      expect(mockLogger.debug).toHaveBeenCalledWith(
        { message: "test message" },
        "verbose"
      );
    });

    it("does not log when both verbose and file debug are disabled", () => {
      const { getLogger, isFileLogLevelEnabled } = await import("./logging/logger.js");
      const mockLogger = { debug: vi.fn() };
      const mockIsFileLogLevelEnabled = vi.fn().mockReturnValue(false);
      
      vi.mocked(getLogger).mockReturnValue(mockLogger);
      vi.mocked(isFileLogLevelEnabled).mockReturnValue(mockIsFileLogLevelEnabled);
      
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      setVerbose(false);
      logVerbose("test message");
      
      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(logSpy).not.toHaveBeenCalled();
    });

    it("handles logger failures gracefully", () => {
      const { getLogger } = await import("./logging/logger.js");
      const mockLogger = { 
        debug: vi.fn().mockImplementation(() => {
          throw new Error("Logger failed");
        })
      };
      
      vi.mocked(getLogger).mockReturnValue(mockLogger);
      
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      setVerbose(true);
      logVerbose("test message");
      
      expect(mockLogger.debug).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("test message"));
    });
  });

  describe("logVerboseConsole function", () => {
    it("logs to console only when verbose is enabled", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      
      setVerbose(false);
      logVerboseConsole("hidden");
      expect(logSpy).not.toHaveBeenCalled();
      
      setVerbose(true);
      logVerboseConsole("visible");
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("visible"));
    });

    it("applies theme formatting to console output", () => {
      const { theme } = await import("./terminal/theme.js");
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      
      setVerbose(true);
      logVerboseConsole("test message");
      
      expect(theme.muted).toHaveBeenCalledWith("test message");
      expect(logSpy).toHaveBeenCalledWith("muted:test message");
    });
  });

  describe("shouldLogVerbose function", () => {
    it("returns true when verbose is enabled", () => {
      setVerbose(true);
      expect(shouldLogVerbose()).toBe(true);
    });

    it("returns true when file debug is enabled", async () => {
      const { isFileLogLevelEnabled } = await import("./logging/logger.js");
      vi.mocked(isFileLogLevelEnabled).mockReturnValue(true);
      
      setVerbose(false);
      expect(shouldLogVerbose()).toBe(true);
    });

    it("returns false when both are disabled", async () => {
      const { isFileLogLevelEnabled } = await import("./logging/logger.js");
      vi.mocked(isFileLogLevelEnabled).mockReturnValue(false);
      
      setVerbose(false);
      expect(shouldLogVerbose()).toBe(false);
    });
  });

  describe("yes flag functionality", () => {
    it("stores yes flag", () => {
      setYes(true);
      expect(isYes()).toBe(true);
      setYes(false);
      expect(isYes()).toBe(false);
    });

    it("defaults to yes disabled", () => {
      expect(isYes()).toBe(false);
    });

    it("handles multiple yes state changes", () => {
      setYes(true);
      expect(isYes()).toBe(true);
      
      setYes(false);
      expect(isYes()).toBe(false);
      
      setYes(true);
      expect(isYes()).toBe(true);
    });
  });

  describe("theme color exports", () => {
    it("exports theme color functions", async () => {
      const { theme } = await import("./terminal/theme.js");
      
      success("test");
      expect(theme.success).toHaveBeenCalledWith("test");
      
      warn("test");
      expect(theme.warn).toHaveBeenCalledWith("test");
      
      info("test");
      expect(theme.info).toHaveBeenCalledWith("test");
      
      danger("test");
      expect(theme.error).toHaveBeenCalledWith("test");
    });

    it("returns themed output", () => {
      expect(success("message")).toBe("success:message");
      expect(warn("message")).toBe("warn:message");
      expect(info("message")).toBe("info:message");
      expect(danger("message")).toBe("error:message");
    });
  });

  describe("integration tests", () => {
    it("works with verbose and yes flags together", () => {
      setVerbose(true);
      setYes(true);
      
      expect(isVerbose()).toBe(true);
      expect(isYes()).toBe(true);
      
      setVerbose(false);
      setYes(false);
      
      expect(isVerbose()).toBe(false);
      expect(isYes()).toBe(false);
    });

    it("handles concurrent function calls", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      setVerbose(true);
      
      logVerbose("message 1");
      logVerboseConsole("message 2");
      logVerbose("message 3");
      
      expect(logSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("edge cases", () => {
    it("handles rapid state changes", () => {
      for (let i = 0; i < 10; i++) {
        setVerbose(i % 2 === 0);
        expect(isVerbose()).toBe(i % 2 === 0);
      }
    });

    it("handles boolean conversion for setVerbose", () => {
      setVerbose(true as any);
      expect(isVerbose()).toBe(true);
      
      setVerbose(false as any);
      expect(isVerbose()).toBe(false);
      
      setVerbose(1 as any);
      expect(isVerbose()).toBe(true);
      
      setVerbose(0 as any);
      expect(isVerbose()).toBe(false);
    });

    it("handles boolean conversion for setYes", () => {
      setYes(true as any);
      expect(isYes()).toBe(true);
      
      setYes(false as any);
      expect(isYes()).toBe(false);
      
      setYes(1 as any);
      expect(isYes()).toBe(true);
      
      setYes(0 as any);
      expect(isYes()).toBe(false);
    });
  });
});
