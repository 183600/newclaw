import { spawn } from "node:child_process";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createAcpClient } from "./client.js";

// Mock dependencies
vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

vi.mock("node:readline", () => ({
  createInterface: vi.fn(() => ({
    question: vi.fn(),
    close: vi.fn(),
  })),
}));

vi.mock("../infra/path-env.js", () => ({
  ensureOpenClawCliOnPath: vi.fn(),
}));

describe("ACP Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Note: toArgs and buildServerArgs are internal helper functions
  // and are not exported from the module. We'll test them indirectly
  // through the public API.
  describe("createAcpClient", () => {
    it("throws when pipes cannot be created", async () => {
      const mockAgent = {
        stdin: null,
        stdout: null,
        kill: vi.fn(),
      } as unknown;

      vi.mocked(spawn).mockReturnValue(mockAgent);

      await expect(createAcpClient()).rejects.toThrow("Failed to create ACP stdio pipes");
    });

    // Note: Testing the successful case requires complex mocking of Node.js streams
    // and the AgentClientProtocol SDK, which is beyond the scope of unit tests.
    // These would be better tested as integration tests.
  });

  // Note: printSessionUpdate is an internal helper function
  // and is not exported from the module. We'll test it indirectly
  // through the public API.
});
