import { describe, expect, it } from "vitest";
import {
  normalizeCronJobInput,
  normalizeCronJobCreate,
  normalizeCronJobPatch,
} from "./normalize.js";
import { parseAbsoluteTimeMs } from "./parse.js";
import { migrateLegacyCronPayload } from "./payload-migration.js";

describe("Cron Normalize", () => {
  describe("normalizeCronJobInput", () => {
    it("returns null for non-object input", () => {
      expect(normalizeCronJobInput(null)).toBe(null);
      expect(normalizeCronJobInput(undefined)).toBe(null);
      expect(normalizeCronJobInput("string")).toBe(null);
      expect(normalizeCronJobInput(123)).toBe(null);
      expect(normalizeCronJobInput([])).toBe(null);
    });

    it("sanitizes agent ID", () => {
      const result = normalizeCronJobInput({
        agentId: "  test-agent  ",
      });
      expect(result?.agentId).toBe("test-agent");
    });

    it("handles null agent ID", () => {
      const result = normalizeCronJobInput({
        agentId: null,
      });
      expect(result?.agentId).toBe(null);
    });

    it("removes empty agent ID", () => {
      const result = normalizeCronJobInput({
        agentId: "  ",
      });
      expect(result?.agentId).toBeUndefined();
    });

    it("converts string enabled to boolean", () => {
      const trueResult = normalizeCronJobInput({
        enabled: "true",
      });
      expect(trueResult?.enabled).toBe(true);

      const falseResult = normalizeCronJobInput({
        enabled: "false",
      });
      expect(falseResult?.enabled).toBe(false);

      const caseResult = normalizeCronJobInput({
        enabled: "TRUE",
      });
      expect(caseResult?.enabled).toBe(true);
    });

    it("keeps boolean enabled as is", () => {
      const result = normalizeCronJobInput({
        enabled: true,
      });
      expect(result?.enabled).toBe(true);
    });

    it("normalizes schedule with atMs number", () => {
      const result = normalizeCronJobInput({
        schedule: {
          atMs: 1234567890,
        },
      });
      expect(result?.schedule).toEqual({
        atMs: 1234567890,
        kind: "at",
      });
    });

    it("normalizes schedule with atMs string", () => {
      const result = normalizeCronJobInput({
        schedule: {
          atMs: "1234567890",
        },
      });
      expect(result?.schedule).toEqual({
        atMs: 1234567890,
        kind: "at",
      });
    });

    it("normalizes schedule with at string", () => {
      const result = normalizeCronJobInput({
        schedule: {
          at: "2023-01-01T00:00:00Z",
        },
      });
      expect(result?.schedule).toEqual({
        atMs: 1672531200000,
        kind: "at",
      });
    });

    it("removes at property after normalization", () => {
      const result = normalizeCronJobInput({
        schedule: {
          at: "2023-01-01T00:00:00Z",
        },
      });
      expect("at" in result?.schedule).toBe(false);
    });

    it("normalizes schedule with everyMs", () => {
      const result = normalizeCronJobInput({
        schedule: {
          everyMs: 60000,
        },
      });
      expect(result?.schedule).toEqual({
        everyMs: 60000,
        kind: "every",
      });
    });

    it("normalizes schedule with expr", () => {
      const result = normalizeCronJobInput({
        schedule: {
          expr: "0 0 * * *",
        },
      });
      expect(result?.schedule).toEqual({
        expr: "0 0 * * *",
        kind: "cron",
      });
    });

    it("applies defaults when applyDefaults is true", () => {
      const result = normalizeCronJobInput(
        {
          payload: {
            kind: "systemEvent",
          },
        },
        { applyDefaults: true },
      );
      expect(result?.wakeMode).toBe("next-heartbeat");
      expect(result?.sessionTarget).toBe("main");
    });

    it("sets sessionTarget to isolated for agentTurn", () => {
      const result = normalizeCronJobInput(
        {
          payload: {
            kind: "agentTurn",
          },
        },
        { applyDefaults: true },
      );
      expect(result?.sessionTarget).toBe("isolated");
    });

    it("unwraps job from data property", () => {
      const result = normalizeCronJobInput({
        data: {
          agentId: "test-agent",
          enabled: true,
        },
      });
      expect(result?.agentId).toBe("test-agent");
      expect(result?.enabled).toBe(true);
    });

    it("unwraps job from job property", () => {
      const result = normalizeCronJobInput({
        job: {
          agentId: "test-agent",
          enabled: true,
        },
      });
      expect(result?.agentId).toBe("test-agent");
      expect(result?.enabled).toBe(true);
    });

    it("handles nested job structure", () => {
      const result = normalizeCronJobInput({
        data: {
          job: {
            agentId: "test-agent",
            enabled: true,
          },
        },
      });
      // unwrapJob only looks one level deep, so it returns the data object itself
      expect(result?.job).toBeDefined();
      expect(result?.job?.agentId).toBe("test-agent");
      expect(result?.job?.enabled).toBe(true);
    });
  });

  describe("normalizeCronJobCreate", () => {
    it("applies defaults for create", () => {
      const result = normalizeCronJobCreate({
        agentId: "test-agent",
      });
      expect(result?.wakeMode).toBe("next-heartbeat");
    });
  });

  describe("normalizeCronJobPatch", () => {
    it("does not apply defaults for patch", () => {
      const result = normalizeCronJobPatch({
        agentId: "test-agent",
      });
      expect(result?.wakeMode).toBeUndefined();
    });
  });
});

describe("Cron Payload Migration", () => {
  describe("migrateLegacyCronPayload", () => {
    it("migrates provider to channel", () => {
      const payload = {
        provider: "slack",
        other: "value",
      };
      const mutated = migrateLegacyCronPayload(payload);

      expect(mutated).toBe(true);
      expect(payload.channel).toBe("slack");
      expect(payload.provider).toBeUndefined();
      expect(payload.other).toBe("value");
    });

    it("uses channel when both channel and provider exist", () => {
      const payload = {
        channel: "discord",
        provider: "slack",
      };
      const mutated = migrateLegacyCronPayload(payload);

      expect(mutated).toBe(true); // provider should be deleted, causing mutation
      expect(payload.channel).toBe("discord");
      expect(payload.provider).toBeUndefined();
    });

    it("normalizes channel value", () => {
      const payload = {
        provider: "  SLACK  ",
      };
      const mutated = migrateLegacyCronPayload(payload);

      expect(mutated).toBe(true);
      expect(payload.channel).toBe("slack");
    });

    it("handles empty provider", () => {
      const payload = {
        provider: "  ",
        other: "value",
      };
      const mutated = migrateLegacyCronPayload(payload);

      expect(mutated).toBe(true);
      // Empty provider doesn't set channel since nextChannel is empty
      expect(payload.channel).toBeUndefined();
      expect(payload.provider).toBeUndefined();
      expect(payload.other).toBe("value");
    });

    it("does nothing when no provider or channel", () => {
      const payload = {
        other: "value",
      };
      const mutated = migrateLegacyCronPayload(payload);

      expect(mutated).toBe(false);
      expect(payload.other).toBe("value");
    });

    it("handles non-string provider", () => {
      const payload = {
        provider: 123,
      };
      const mutated = migrateLegacyCronPayload(payload);

      expect(mutated).toBe(true);
      // Non-string provider doesn't set channel since nextChannel is empty
      expect(payload.channel).toBeUndefined();
      expect(payload.provider).toBeUndefined();
    });
  });
});

describe("Cron Parse", () => {
  describe("parseAbsoluteTimeMs", () => {
    it("returns null for empty input", () => {
      expect(parseAbsoluteTimeMs("")).toBe(null);
      expect(parseAbsoluteTimeMs("   ")).toBe(null);
    });

    it("parses numeric timestamp", () => {
      expect(parseAbsoluteTimeMs("1234567890")).toBe(1234567890);
      expect(parseAbsoluteTimeMs(" 1234567890 ")).toBe(1234567890);
    });

    it("returns null for invalid numeric", () => {
      expect(parseAbsoluteTimeMs("infinity")).toBe(null);
      expect(parseAbsoluteTimeMs("NaN")).toBe(null);
      // Note: "0" is parsed as a valid date (January 1, 1970)
      // The actual value depends on timezone, so we just check it's a number
      const result0 = parseAbsoluteTimeMs("0");
      expect(typeof result0).toBe("number");
      expect(result0).toBeGreaterThanOrEqual(0);
      // Note: Negative numbers are also parsed as dates (before 1970)
      const resultNeg = parseAbsoluteTimeMs("-123");
      expect(typeof resultNeg).toBe("number");
      expect(resultNeg).toBeLessThan(0);
    });

    it("parses ISO date only", () => {
      expect(parseAbsoluteTimeMs("2023-01-01")).toBe(1672531200000);
    });

    it("parses ISO date-time without timezone", () => {
      // The function adds 'Z' to make it UTC
      const result = parseAbsoluteTimeMs("2023-01-01T12:34:56");
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe("number");
    });

    it("parses ISO date-time with Z timezone", () => {
      // The function keeps the Z timezone as is
      const result = parseAbsoluteTimeMs("2023-01-01T12:34:56Z");
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe("number");
    });

    it("parses ISO date-time with offset", () => {
      // The function keeps the offset as is
      const result1 = parseAbsoluteTimeMs("2023-01-01T12:34:56+05:30");
      expect(result1).toBeGreaterThan(0);
      expect(typeof result1).toBe("number");

      const result2 = parseAbsoluteTimeMs("2023-01-01T12:34:56-08:00");
      expect(result2).toBeGreaterThan(0);
      expect(typeof result2).toBe("number");
    });

    it("parses ISO date-time with compact offset", () => {
      // The function keeps the compact offset as is
      const result1 = parseAbsoluteTimeMs("2023-01-01T12:34:56+0530");
      expect(result1).toBeGreaterThan(0);
      expect(typeof result1).toBe("number");

      const result2 = parseAbsoluteTimeMs("2023-01-01T12:34:56-0800");
      expect(result2).toBeGreaterThan(0);
      expect(typeof result2).toBe("number");
    });

    it("returns null for invalid date strings", () => {
      expect(parseAbsoluteTimeMs("invalid")).toBe(null);
      expect(parseAbsoluteTimeMs("2023-13-01")).toBe(null);
      expect(parseAbsoluteTimeMs("2023-01-32")).toBe(null);
      expect(parseAbsoluteTimeMs("not-a-date")).toBe(null);
    });

    it("handles edge case dates", () => {
      expect(parseAbsoluteTimeMs("1970-01-01")).toBe(0);
      expect(parseAbsoluteTimeMs("1970-01-01T00:00:00Z")).toBe(0);
    });

    it("handles future dates", () => {
      expect(parseAbsoluteTimeMs("2030-01-01")).toBe(1893456000000);
    });

    it("trims whitespace", () => {
      expect(parseAbsoluteTimeMs("  2023-01-01  ")).toBe(1672531200000);
      const result = parseAbsoluteTimeMs("\t2023-01-01T12:34:56Z\n");
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe("number");
    });
  });
});
