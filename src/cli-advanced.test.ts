import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./cli/command-format.js";
import { parseDurationMs } from "./cli/parse-duration.js";

describe("parseDurationMs", () => {
  describe("basic parsing", () => {
    it("parses milliseconds", () => {
      expect(parseDurationMs("100ms")).toBe(100);
      expect(parseDurationMs("0ms")).toBe(0);
      expect(parseDurationMs("1000ms")).toBe(1000);
    });

    it("parses seconds", () => {
      expect(parseDurationMs("1s")).toBe(1000);
      expect(parseDurationMs("5s")).toBe(5000);
      expect(parseDurationMs("0.5s")).toBe(500);
      expect(parseDurationMs("10.5s")).toBe(10500);
    });

    it("parses minutes", () => {
      expect(parseDurationMs("1m")).toBe(60000);
      expect(parseDurationMs("5m")).toBe(300000);
      expect(parseDurationMs("0.5m")).toBe(30000);
      expect(parseDurationMs("10.5m")).toBe(630000);
    });

    it("parses hours", () => {
      expect(parseDurationMs("1h")).toBe(3600000);
      expect(parseDurationMs("5h")).toBe(18000000);
      expect(parseDurationMs("0.5h")).toBe(1800000);
      expect(parseDurationMs("10.5h")).toBe(37800000);
    });

    it("parses days", () => {
      expect(parseDurationMs("1d")).toBe(86400000);
      expect(parseDurationMs("5d")).toBe(432000000);
      expect(parseDurationMs("0.5d")).toBe(43200000);
      expect(parseDurationMs("10.5d")).toBe(907200000);
    });
  });

  describe("default unit", () => {
    it("defaults to milliseconds", () => {
      expect(parseDurationMs("100")).toBe(100);
      expect(parseDurationMs("1000")).toBe(1000);
    });

    it("uses custom default unit", () => {
      expect(parseDurationMs("100", { defaultUnit: "s" })).toBe(100000);
      expect(parseDurationMs("5", { defaultUnit: "m" })).toBe(300000);
      expect(parseDurationMs("2", { defaultUnit: "h" })).toBe(7200000);
      expect(parseDurationMs("3", { defaultUnit: "d" })).toBe(259200000);
    });
  });

  describe("edge cases", () => {
    it("handles decimal values", () => {
      expect(parseDurationMs("1.5s")).toBe(1500);
      expect(parseDurationMs("0.001s")).toBe(1);
      expect(parseDurationMs("0.999s")).toBe(999);
    });

    it("handles zero values", () => {
      expect(parseDurationMs("0")).toBe(0);
      expect(parseDurationMs("0ms")).toBe(0);
      expect(parseDurationMs("0s")).toBe(0);
      expect(parseDurationMs("0m")).toBe(0);
      expect(parseDurationMs("0h")).toBe(0);
      expect(parseDurationMs("0d")).toBe(0);
    });

    it("handles large values", () => {
      expect(parseDurationMs("999999999ms")).toBe(999999999);
      expect(parseDurationMs("999999s")).toBe(999999000);
    });
  });

  describe("error handling", () => {
    it("throws on empty string", () => {
      expect(() => parseDurationMs("")).toThrow("invalid duration (empty)");
      expect(() => parseDurationMs("   ")).toThrow("invalid duration (empty)");
    });

    it("throws on invalid format", () => {
      expect(() => parseDurationMs("abc")).toThrow("invalid duration: abc");
      expect(() => parseDurationMs("10xs")).toThrow("invalid duration: 10xs");
      expect(() => parseDurationMs("10.5.5s")).toThrow("invalid duration: 10.5.5s");
      expect(() => parseDurationMs("10.5.5")).toThrow("invalid duration: 10.5.5");
    });

    it("throws on negative values", () => {
      expect(() => parseDurationMs("-1s")).toThrow("invalid duration: -1s");
      expect(() => parseDurationMs("-100ms")).toThrow("invalid duration: -100ms");
      expect(() => parseDurationMs("-0.5s")).toThrow("invalid duration: -0.5s");
    });

    it("throws on infinite values", () => {
      expect(() => parseDurationMs("Infinity")).toThrow("invalid duration: Infinity");
      expect(() => parseDurationMs("Infinitys")).toThrow("invalid duration: Infinitys");
    });

    it("throws on NaN values", () => {
      expect(() => parseDurationMs("NaN")).toThrow("invalid duration: NaN");
      expect(() => parseDurationMs("NaNs")).toThrow("invalid duration: NaNs");
    });
  });

  describe("case sensitivity", () => {
    it("handles lowercase units", () => {
      expect(parseDurationMs("100MS")).toBe(100);
      expect(parseDurationMs("1S")).toBe(1000);
      expect(parseDurationMs("1M")).toBe(60000);
      expect(parseDurationMs("1H")).toBe(3600000);
      expect(parseDurationMs("1D")).toBe(86400000);
    });
  });

  describe("whitespace handling", () => {
    it("trims whitespace", () => {
      expect(parseDurationMs("  100ms  ")).toBe(100);
      expect(parseDurationMs("\t1s\n")).toBe(1000);
      expect(parseDurationMs("  5m  ")).toBe(300000);
    });
  });
});

describe("formatCliCommand", () => {
  describe("basic formatting", () => {
    it("passes through non-claw commands", () => {
      expect(formatCliCommand("git status")).toBe("git status");
      expect(formatCliCommand("npm run build")).toBe("npm run build");
      expect(formatCliCommand("ls -la")).toBe("ls -la");
    });

    it("handles claw commands without profile", () => {
      const env = { CLAW_PROFILE: undefined };
      expect(formatCliCommand("iflow status", env)).toBe("claw status");
      expect(formatCliCommand("pnpm claw status", env)).toBe("pnpm claw status");
      expect(formatCliCommand("npm run claw status", env)).toBe("npm run claw status");
    });

    it("adds profile flag when CLAW_PROFILE is set", () => {
      const env = { CLAW_PROFILE: "test" };
      expect(formatCliCommand("iflow status", env)).toBe("claw --profile test status");
      expect(formatCliCommand("pnpm claw status", env)).toBe("pnpm claw --profile test status");
      expect(formatCliCommand("npx claw status", env)).toBe("npx claw --profile test status");
      expect(formatCliCommand("bunx claw status", env)).toBe("bunx claw --profile test status");
    });

    it("handles different profile names", () => {
      expect(formatCliCommand("iflow status", { CLAW_PROFILE: "prod" })).toBe(
        "claw --profile prod status",
      );
      expect(formatCliCommand("iflow status", { CLAW_PROFILE: "dev" })).toBe(
        "claw --profile dev status",
      );
      expect(formatCliCommand("iflow status", { CLAW_PROFILE: "staging" })).toBe(
        "claw --profile staging status",
      );
    });
  });

  describe("existing flags", () => {
    it("doesn't add profile when --profile already exists", () => {
      const env = { CLAW_PROFILE: "test" };
      expect(formatCliCommand("iflow --profile prod status", env)).toBe(
        "claw --profile prod status",
      );
      expect(formatCliCommand("iflow status --profile prod", env)).toBe(
        "claw status --profile prod",
      );
      expect(formatCliCommand("pnpm claw --profile=prod status", env)).toBe(
        "pnpm claw --profile=prod status",
      );
    });

    it("doesn't add profile when --dev flag exists", () => {
      const env = { CLAW_PROFILE: "test" };
      expect(formatCliCommand("iflow --dev status", env)).toBe("claw --dev status");
      expect(formatCliCommand("iflow status --dev", env)).toBe("claw status --dev");
      expect(formatCliCommand("pnpm claw --dev status", env)).toBe("pnpm claw --dev status");
    });

    it("handles multiple flags", () => {
      const env = { CLAW_PROFILE: "test" };
      expect(formatCliCommand("iflow --verbose --dev status", env)).toBe(
        "claw --verbose --dev status",
      );
      expect(formatCliCommand("iflow --profile prod --dev status", env)).toBe(
        "claw --profile prod --dev status",
      );
    });
  });

  describe("edge cases", () => {
    it("handles empty commands", () => {
      expect(formatCliCommand("", { CLAW_PROFILE: "test" })).toBe("");
      expect(formatCliCommand("   ", { CLAW_PROFILE: "test" })).toBe("   ");
    });

    it("handles commands with just claw", () => {
      expect(formatCliCommand("claw", { CLAW_PROFILE: "test" })).toBe("claw --profile test");
      expect(formatCliCommand("pnpm claw", { CLAW_PROFILE: "test" })).toBe(
        "pnpm claw --profile test",
      );
    });

    it("handles complex command structures", () => {
      expect(
        formatCliCommand("iflow agent --mode interactive --verbose", {
          CLAW_PROFILE: "test",
        }),
      ).toBe("claw --profile test agent --mode interactive --verbose");
      expect(formatCliCommand("pnpm claw gateway run --force", { CLAW_PROFILE: "prod" })).toBe(
        "pnpm claw --profile prod gateway run --force",
      );
    });

    it("handles multiple spaces", () => {
      expect(formatCliCommand("iflow  status  --verbose", { CLAW_PROFILE: "test" })).toBe(
        "claw --profile test  status  --verbose",
      );
    });
  });
});
