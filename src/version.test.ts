import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock the global variable
declare global {
  var __OPENCLAW_VERSION__: string | undefined;
}

describe("VERSION", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalGlobalVersion: string | undefined;
  let mockCreateRequire: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalEnv = process.env;
    originalGlobalVersion = global.__OPENCLAW_VERSION__;

    mockCreateRequire = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    global.__OPENCLAW_VERSION__ = originalGlobalVersion;
    vi.clearAllMocks();
    vi.unmock("node:module");
  });

  it("should use __OPENCLAW_VERSION__ when defined", async () => {
    global.__OPENCLAW_VERSION__ = "1.0.0-test";

    // Re-import to get the updated value
    vi.resetModules();
    const { VERSION: testVersion } = await import("./version.js");

    expect(testVersion).toBe("1.0.0-test");
  });

  it("should use OPENCLAW_BUNDLED_VERSION env var when __OPENCLAW_VERSION__ is undefined", async () => {
    global.__OPENCLAW_VERSION__ = undefined;
    process.env.OPENCLAW_BUNDLED_VERSION = "2.0.0-env";

    vi.resetModules();
    const { VERSION: testVersion } = await import("./version.js");

    expect(testVersion).toBe("2.0.0-env");
  });

  it("should read from package.json when env vars are not set", async () => {
    global.__OPENCLAW_VERSION__ = undefined;
    delete process.env.OPENCLAW_BUNDLED_VERSION;

    const mockRequire = vi.fn(() => ({ version: "3.0.0-package" }));

    vi.doMock("node:module", () => ({
      createRequire: vi.fn(() => mockRequire),
    }));

    vi.resetModules();
    const { VERSION: testVersion } = await import("./version.js");

    expect(testVersion).toBe("3.0.0-package");
  });

  it("should fallback to 0.0.0 when no version source is available", async () => {
    global.__OPENCLAW_VERSION__ = undefined;
    delete process.env.OPENCLAW_BUNDLED_VERSION;

    const mockRequire = vi.fn(() => ({})); // No version field

    vi.doMock("node:module", () => ({
      createRequire: vi.fn(() => mockRequire),
    }));

    vi.resetModules();
    const { VERSION: testVersion } = await import("./version.js");

    expect(testVersion).toBe("0.0.0");
  });

  it("should fallback to 0.0.0 when package.json read fails", async () => {
    global.__OPENCLAW_VERSION__ = undefined;
    delete process.env.OPENCLAW_BUNDLED_VERSION;

    const mockRequire = vi.fn(() => {
      throw new Error("Module not found");
    });

    vi.doMock("node:module", () => ({
      createRequire: vi.fn(() => mockRequire),
    }));

    vi.resetModules();
    const { VERSION: testVersion } = await import("./version.js");

    expect(testVersion).toBe("0.0.0");
  });

  it("should prioritize __OPENCLAW_VERSION__ over env var", async () => {
    global.__OPENCLAW_VERSION__ = "1.0.0-global";
    process.env.OPENCLAW_BUNDLED_VERSION = "2.0.0-env";

    vi.resetModules();
    const { VERSION: testVersion } = await import("./version.js");

    expect(testVersion).toBe("1.0.0-global");
  });

  it("should prioritize env var over package.json", async () => {
    global.__OPENCLAW_VERSION__ = undefined;
    process.env.OPENCLAW_BUNDLED_VERSION = "2.0.0-env";

    const mockRequire = vi.fn(() => ({ version: "3.0.0-package" }));
    mockCreateRequire.mockReturnValue(mockRequire);

    vi.resetModules();
    const { VERSION: testVersion } = await import("./version.js");

    expect(testVersion).toBe("2.0.0-env");
  });

  it("should handle empty string __OPENCLAW_VERSION__", async () => {
    global.__OPENCLAW_VERSION__ = "";
    process.env.OPENCLAW_BUNDLED_VERSION = "2.0.0-env";

    vi.resetModules();
    const { VERSION: testVersion } = await import("./version.js");

    expect(testVersion).toBe("2.0.0-env");
  });

  it("should handle empty string env var", async () => {
    global.__OPENCLAW_VERSION__ = undefined;
    process.env.OPENCLAW_BUNDLED_VERSION = "";

    const mockRequire = vi.fn(() => ({ version: "3.0.0-package" }));

    vi.doMock("node:module", () => ({
      createRequire: vi.fn(() => mockRequire),
    }));

    vi.resetModules();
    const { VERSION: testVersion } = await import("./version.js");

    expect(testVersion).toBe("3.0.0-package");
  });
});
