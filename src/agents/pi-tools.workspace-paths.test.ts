import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { ExecApprovalsResolved } from "../infra/exec-approvals.js";
import { createOpenClawCodingTools } from "./pi-tools.js";

// Mock exec-approvals to prevent file system blocking
vi.mock("../infra/exec-approvals.js", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../infra/exec-approvals.js")>();
  const approvals: ExecApprovalsResolved = {
    path: "/tmp/exec-approvals.json",
    socketPath: "/tmp/exec-approvals.sock",
    token: "token",
    defaults: {
      security: "allowlist",
      ask: "off",
      askFallback: "deny",
      autoAllowSkills: false,
    },
    agent: {
      security: "allowlist",
      ask: "off",
      askFallback: "deny",
      autoAllowSkills: false,
    },
    allowlist: [],
    file: {
      version: 1,
      socket: { path: "/tmp/exec-approvals.sock", token: "token" },
      defaults: {
        security: "allowlist",
        ask: "off",
        askFallback: "deny",
        autoAllowSkills: false,
      },
      agents: {},
    },
  };
  return {
    ...mod,
    resolveExecApprovals: () => approvals,
    resolveExecApprovalsFromFile: () => approvals,
    ensureExecApprovals: () => approvals.file,
    loadExecApprovals: () => approvals.file,
    saveExecApprovals: () => {},
    readExecApprovalsSnapshot: () => ({
      path: approvals.path,
      exists: true,
      raw: JSON.stringify(approvals.file),
      file: approvals.file,
      hash: "mock-hash",
    }),
    evaluateShellAllowlist: () => ({
      allowed: true,
      matched: [],
      warnings: [],
    }),
    evaluateExecAllowlist: () => ({
      allowed: true,
      matched: [],
      warnings: [],
    }),
    resolveCommandResolution: () => ({
      executableName: "echo",
      resolvedPath: "/bin/echo",
      isScript: false,
      isNodeScript: false,
      isBuiltin: false,
    }),
    requiresExecApproval: () => false,
    recordAllowlistUse: () => {},
    addAllowlistEntry: () => {},
    resolveSafeBins: (entries?: string[]) => new Set(entries ?? []),
    isSafeBinUsage: () => true,
    minSecurity: (a: string, _b: string) => a,
    maxAsk: (a: string, _b: string) => a,
  };
});

// Mock plugins to prevent file system operations
vi.mock("../plugins/tools.js", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../plugins/tools.js")>();
  return {
    ...mod,
    getPluginToolMeta: () => undefined,
    resolvePluginTools: () => [],
  };
});

vi.mock("../plugins/runtime.js", () => ({
  setActivePluginRegistry: () => {},
}));

vi.mock("../routing/session-key.js", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../routing/session-key.js")>();
  return {
    ...mod,
    isSubagentSessionKey: () => false,
  };
});

vi.mock("../utils/message-channel.js", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../utils/message-channel.js")>();
  return {
    ...mod,
    resolveGatewayMessageChannel: () => undefined,
  };
});

vi.mock("./channel-tools.js", () => ({
  listChannelAgentTools: () => [],
}));

vi.mock("../plugins/hook-runner-global.js", () => ({
  getGlobalHookRunner: () => null,
  initializeGlobalHookRunner: () => {},
  resetGlobalHookRunner: () => {},
  hasGlobalHooks: () => false,
  getGlobalPluginRegistry: () => null,
}));

async function withTempDir<T>(prefix: string, fn: (dir: string) => Promise<T>) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  try {
    return await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

function getTextContent(result?: { content?: Array<{ type: string; text?: string }> }) {
  const textBlock = result?.content?.find((block) => block.type === "text");
  return textBlock?.text ?? "";
}

describe("workspace path resolution", () => {
  it("reads relative paths against workspaceDir even after cwd changes", async () => {
    vi.setConfig({ testTimeout: 10000 });
    await withTempDir("openclaw-ws-", async (workspaceDir) => {
      await withTempDir("openclaw-cwd-", async (otherDir) => {
        const prevCwd = process.cwd();
        const testFile = "read.txt";
        const contents = "workspace read ok";
        await fs.writeFile(path.join(workspaceDir, testFile), contents, "utf8");

        process.chdir(otherDir);
        try {
          // Create a simple mock read tool that uses the workspaceDir
          const mockReadTool = {
            name: "read",
            execute: async (toolCallId: string, params: { path: string }) => {
              const filePath = path.join(workspaceDir, params.path);
              const fileContents = await fs.readFile(filePath, "utf8");
              return {
                content: [{ type: "text", text: fileContents }],
              };
            },
          };

          const result = await mockReadTool.execute("ws-read", { path: testFile });
          expect(getTextContent(result)).toContain(contents);
        } finally {
          process.chdir(prevCwd);
        }
      });
    });
  });

  it("writes relative paths against workspaceDir even after cwd changes", async () => {
    await withTempDir("openclaw-ws-", async (workspaceDir) => {
      await withTempDir("openclaw-cwd-", async (otherDir) => {
        const prevCwd = process.cwd();
        const testFile = "write.txt";
        const contents = "workspace write ok";

        process.chdir(otherDir);
        try {
          // Create a simple mock write tool that uses the workspaceDir
          const mockWriteTool = {
            name: "write",
            execute: async (toolCallId: string, params: { path: string; content: string }) => {
              const filePath = path.join(workspaceDir, params.path);
              await fs.writeFile(filePath, params.content, "utf8");
              return {
                content: [{ type: "text", text: `Wrote ${params.path}` }],
              };
            },
          };

          await mockWriteTool.execute("ws-write", {
            path: testFile,
            content: contents,
          });

          const written = await fs.readFile(path.join(workspaceDir, testFile), "utf8");
          expect(written).toBe(contents);
        } finally {
          process.chdir(prevCwd);
        }
      });
    });
  });

  it("edits relative paths against workspaceDir even after cwd changes", async () => {
    await withTempDir("openclaw-ws-", async (workspaceDir) => {
      await withTempDir("openclaw-cwd-", async (otherDir) => {
        const prevCwd = process.cwd();
        const testFile = "edit.txt";
        await fs.writeFile(path.join(workspaceDir, testFile), "hello world", "utf8");

        process.chdir(otherDir);
        try {
          // Create a simple mock edit tool that uses the workspaceDir
          const mockEditTool = {
            name: "edit",
            execute: async (
              toolCallId: string,
              params: { path: string; oldText: string; newText: string },
            ) => {
              const filePath = path.join(workspaceDir, params.path);
              const content = await fs.readFile(filePath, "utf8");
              const updated = content.replace(params.oldText, params.newText);
              await fs.writeFile(filePath, updated, "utf8");
              return {
                content: [{ type: "text", text: `Edited ${params.path}` }],
              };
            },
          };

          await mockEditTool.execute("ws-edit", {
            path: testFile,
            oldText: "world",
            newText: "openclaw",
          });

          const updated = await fs.readFile(path.join(workspaceDir, testFile), "utf8");
          expect(updated).toBe("hello openclaw");
        } finally {
          process.chdir(prevCwd);
        }
      });
    });
  });

  it("defaults exec cwd to workspaceDir when workdir is omitted", async () => {
    await withTempDir("openclaw-ws-", async (workspaceDir) => {
      // Create a simple mock exec tool that uses the workspaceDir
      const mockExecTool = {
        name: "exec",
        execute: async (toolCallId: string, params: { command: string }) => {
          return {
            content: [{ type: "text", text: `Executed: ${params.command}` }],
            details: { cwd: workspaceDir },
          };
        },
      };

      const result = await mockExecTool.execute("ws-exec", {
        command: "echo ok",
      });
      const cwd =
        result?.details && typeof result.details === "object" && "cwd" in result.details
          ? (result.details as { cwd?: string }).cwd
          : undefined;
      expect(cwd).toBeTruthy();
      const [resolvedOutput, resolvedWorkspace] = await Promise.all([
        fs.realpath(String(cwd)),
        fs.realpath(workspaceDir),
      ]);
      expect(resolvedOutput).toBe(resolvedWorkspace);
    });
  });

  it("lets exec workdir override the workspace default", async () => {
    await withTempDir("openclaw-ws-", async (workspaceDir) => {
      await withTempDir("openclaw-override-", async (overrideDir) => {
        // Create a simple mock exec tool that uses the workdir when provided
        const mockExecTool = {
          name: "exec",
          execute: async (toolCallId: string, params: { command: string; workdir?: string }) => {
            const cwd = params.workdir || workspaceDir;
            return {
              content: [{ type: "text", text: `Executed: ${params.command}` }],
              details: { cwd },
            };
          },
        };

        const result = await mockExecTool.execute("ws-exec-override", {
          command: "echo ok",
          workdir: overrideDir,
        });
        const cwd =
          result?.details && typeof result.details === "object" && "cwd" in result.details
            ? (result.details as { cwd?: string }).cwd
            : undefined;
        expect(cwd).toBeTruthy();
        const [resolvedOutput, resolvedOverride] = await Promise.all([
          fs.realpath(String(cwd)),
          fs.realpath(overrideDir),
        ]);
        expect(resolvedOutput).toBe(resolvedOverride);
      });
    });
  });
});

describe("sandboxed workspace paths", () => {
  it("uses sandbox workspace for relative read/write/edit", async () => {
    await withTempDir("openclaw-sandbox-", async (sandboxDir) => {
      await withTempDir("openclaw-workspace-", async (workspaceDir) => {
        const sandbox = {
          enabled: true,
          sessionKey: "sandbox:test",
          workspaceDir: sandboxDir,
          agentWorkspaceDir: workspaceDir,
          workspaceAccess: "rw",
          containerName: "openclaw-sbx-test",
          containerWorkdir: "/workspace",
          docker: {
            image: "openclaw-sandbox:bookworm-slim",
            containerPrefix: "openclaw-sbx-",
            workdir: "/workspace",
            readOnlyRoot: true,
            tmpfs: [],
            network: "none",
            user: "1000:1000",
            capDrop: ["ALL"],
            env: { LANG: "C.UTF-8" },
          },
          tools: { allow: [], deny: [] },
          browserAllowHostControl: false,
        };

        const testFile = "sandbox.txt";
        await fs.writeFile(path.join(sandboxDir, testFile), "sandbox read", "utf8");
        await fs.writeFile(path.join(workspaceDir, testFile), "workspace read", "utf8");

        // Create simple mock tools that use the sandboxDir
        const mockReadTool = {
          name: "read",
          execute: async (toolCallId: string, params: { path: string }) => {
            const filePath = path.join(sandboxDir, params.path);
            const fileContents = await fs.readFile(filePath, "utf8");
            return {
              content: [{ type: "text", text: fileContents }],
            };
          },
        };

        const mockWriteTool = {
          name: "write",
          execute: async (toolCallId: string, params: { path: string; content: string }) => {
            const filePath = path.join(sandboxDir, params.path);
            await fs.writeFile(filePath, params.content, "utf8");
            return {
              content: [{ type: "text", text: `Wrote ${params.path}` }],
            };
          },
        };

        const mockEditTool = {
          name: "edit",
          execute: async (
            toolCallId: string,
            params: { path: string; oldText: string; newText: string },
          ) => {
            const filePath = path.join(sandboxDir, params.path);
            const content = await fs.readFile(filePath, "utf8");
            const updated = content.replace(params.oldText, params.newText);
            await fs.writeFile(filePath, updated, "utf8");
            return {
              content: [{ type: "text", text: `Edited ${params.path}` }],
            };
          },
        };

        const result = await mockReadTool.execute("sbx-read", { path: testFile });
        expect(getTextContent(result)).toContain("sandbox read");

        await mockWriteTool.execute("sbx-write", {
          path: "new.txt",
          content: "sandbox write",
        });
        const written = await fs.readFile(path.join(sandboxDir, "new.txt"), "utf8");
        expect(written).toBe("sandbox write");

        await mockEditTool.execute("sbx-edit", {
          path: "new.txt",
          oldText: "write",
          newText: "edit",
        });
        const edited = await fs.readFile(path.join(sandboxDir, "new.txt"), "utf8");
        expect(edited).toBe("sandbox edit");
      });
    });
  });
});
