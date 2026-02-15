import { describe, expect, it, vi } from "vitest";
import { logDebug, logError, logInfo, logSuccess, logWarn } from "./logger.js";

describe("logger - Additional Edge Cases", () => {
  describe("Basic functionality", () => {
    it("should handle logDebug without errors", () => {
      expect(() => {
        logDebug("Debug message");
      }).not.toThrow();
    });

    it("should handle logInfo without errors", () => {
      expect(() => {
        logInfo("Info message");
      }).not.toThrow();
    });

    it("should handle logWarn without errors", () => {
      expect(() => {
        logWarn("Warning message");
      }).not.toThrow();
    });

    it("should handle logSuccess without errors", () => {
      expect(() => {
        logSuccess("Success message");
      }).not.toThrow();
    });

    it("should handle logError without errors", () => {
      expect(() => {
        logError("Error message");
      }).not.toThrow();
    });
  });

  describe("Message content handling", () => {
    it("should handle empty messages", () => {
      expect(() => {
        logDebug("");
        logInfo("");
        logWarn("");
        logSuccess("");
        logError("");
      }).not.toThrow();
    });

    it("should handle messages with special characters", () => {
      const specialMessage = "Message with special chars: 🚀 \n\t\"'&<>%";
      expect(() => {
        logDebug(specialMessage);
        logInfo(specialMessage);
        logWarn(specialMessage);
        logSuccess(specialMessage);
        logError(specialMessage);
      }).not.toThrow();
    });

    it("should handle Unicode characters", () => {
      const unicodeMessage = "Message with Unicode: 中文 русский العربية עברית";
      expect(() => {
        logDebug(unicodeMessage);
        logInfo(unicodeMessage);
        logWarn(unicodeMessage);
        logSuccess(unicodeMessage);
        logError(unicodeMessage);
      }).not.toThrow();
    });

    it("should handle very long messages", () => {
      const longMessage = "Very long message ".repeat(1000);
      expect(() => {
        logDebug(longMessage);
        logInfo(longMessage);
        logWarn(longMessage);
        logSuccess(longMessage);
        logError(longMessage);
      }).not.toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle messages with only whitespace", () => {
      const whitespaceMessage = "   \n\t   ";
      expect(() => {
        logDebug(whitespaceMessage);
        logInfo(whitespaceMessage);
        logWarn(whitespaceMessage);
        logSuccess(whitespaceMessage);
        logError(whitespaceMessage);
      }).not.toThrow();
    });

    it("should handle messages with ANSI escape sequences", () => {
      const ansiMessage = "Message with \u001b[31mred\u001b[0m and \u001b[1mbold\u001b[0m text";
      expect(() => {
        logDebug(ansiMessage);
        logInfo(ansiMessage);
        logWarn(ansiMessage);
        logSuccess(ansiMessage);
        logError(ansiMessage);
      }).not.toThrow();
    });

    it("should handle messages with multiple colons", () => {
      const colonMessage = "test:subsystem: Message: with: multiple: colons";
      expect(() => {
        logDebug(colonMessage);
        logInfo(colonMessage);
        logWarn(colonMessage);
        logSuccess(colonMessage);
        logError(colonMessage);
      }).not.toThrow();
    });

    it("should handle messages starting with colon", () => {
      const colonStartMessage = ":message with colon at start";
      expect(() => {
        logDebug(colonStartMessage);
        logInfo(colonStartMessage);
        logWarn(colonStartMessage);
        logSuccess(colonStartMessage);
        logError(colonStartMessage);
      }).not.toThrow();
    });

    it("should handle messages ending with colon", () => {
      const colonEndMessage = "message with colon at end:";
      expect(() => {
        logDebug(colonEndMessage);
        logInfo(colonEndMessage);
        logWarn(colonEndMessage);
        logSuccess(colonEndMessage);
        logError(colonEndMessage);
      }).not.toThrow();
    });
  });

  describe("Subsystem-like messages", () => {
    it("should handle messages that look like subsystem prefixes", () => {
      const subsystemMessage = "test-subsystem: This is a test message";
      expect(() => {
        logInfo(subsystemMessage);
        logWarn(subsystemMessage);
        logSuccess(subsystemMessage);
        logError(subsystemMessage);
      }).not.toThrow();
    });

    it("should handle subsystem messages with special characters", () => {
      const specialSubsystemMessage = "test-subsystem-123: Message with special chars!";
      expect(() => {
        logInfo(specialSubsystemMessage);
        logWarn(specialSubsystemMessage);
        logSuccess(specialSubsystemMessage);
        logError(specialSubsystemMessage);
      }).not.toThrow();
    });

    it("should handle long subsystem names", () => {
      const longSubsystemName = "a".repeat(25);
      const longSubsystemMessage = `${longSubsystemName}: Test message`;
      expect(() => {
        logInfo(longSubsystemMessage);
        logWarn(longSubsystemMessage);
        logSuccess(longSubsystemMessage);
        logError(longSubsystemMessage);
      }).not.toThrow();
    });
  });

  describe("Error handling", () => {
    it("should handle null/undefined inputs gracefully", () => {
      // These should not throw TypeScript errors in runtime
      expect(() => {
        logInfo(null as unknown as string);
        logInfo(undefined as unknown as string);
        logWarn(null as unknown as string);
        logWarn(undefined as unknown as string);
        logSuccess(null as unknown as string);
        logSuccess(undefined as unknown as string);
        logError(null as unknown as string);
        logError(undefined as unknown as string);
        logDebug(null as unknown as string);
        logDebug(undefined as unknown as string);
      }).not.toThrow();
    });

    it("should handle non-string inputs", () => {
      expect(() => {
        logInfo(123 as unknown as string);
        logInfo({} as unknown as string);
        logInfo([] as unknown as string);
      }).not.toThrow();
    });
  });

  describe("Performance considerations", () => {
    it("should handle rapid logging without issues", () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          logDebug(`Debug message ${i}`);
          logInfo(`Info message ${i}`);
          logWarn(`Warning message ${i}`);
          logSuccess(`Success message ${i}`);
          logError(`Error message ${i}`);
        }
      }).not.toThrow();
    });
  });
});
