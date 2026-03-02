import { beforeEach, describe, expect, it, vi } from "vitest";
import { probeIMessage } from "./probe.js";

const detectBinaryMock = vi.hoisted(() => vi.fn());
const runCommandWithTimeoutMock = vi.hoisted(() => vi.fn());
const createIMessageRpcClientMock = vi.hoisted(() => vi.fn());

vi.mock("../commands/onboard-helpers.js", () => ({
  detectBinary: (...args: unknown[]) => detectBinaryMock(...args),
}));

vi.mock("../process/exec.js", () => ({
  runCommandWithTimeout: (...args: unknown[]) => runCommandWithTimeoutMock(...args),
}));

vi.mock("./client.js", () => ({
  createIMessageRpcClient: (...args: unknown[]) => createIMessageRpcClientMock(...args),
}));

beforeEach(() => {
  detectBinaryMock.mockReset().mockResolvedValue(true);
  runCommandWithTimeoutMock.mockReset().mockResolvedValue({
    stdout: "",
    stderr: 'unknown command "rpc" for "imsg"',
    code: 1,
    signal: null,
    killed: false,
  });
  createIMessageRpcClientMock.mockReset();
});

describe("probeIMessage", () => {
  // iMessage is only supported on macOS; skip these tests on other platforms
  const describeMacOS = process.platform === "darwin" ? describe : describe.skip;

  it("returns fatal error on non-macOS platforms", async () => {
    if (process.platform === "darwin") {
      // This test is for non-macOS; skip on macOS
      return;
    }
    const result = await probeIMessage(1000, { cliPath: "imsg" });
    expect(result.ok).toBe(false);
    expect(result.fatal).toBe(true);
    expect(result.error).toBe("iMessage channel is only supported on macOS");
    expect(createIMessageRpcClientMock).not.toHaveBeenCalled();
  });

  describeMacOS("macOS-specific tests", () => {
    it("marks unknown rpc subcommand as fatal", async () => {
      const result = await probeIMessage(1000, { cliPath: "imsg" });
      expect(result.ok).toBe(false);
      expect(result.fatal).toBe(true);
      expect(result.error).toMatch(/rpc/i);
      expect(createIMessageRpcClientMock).not.toHaveBeenCalled();
    });
  });
});
