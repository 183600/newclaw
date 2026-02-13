import { clearActiveProgressLine } from "./terminal/progress-line.js";
import { restoreTerminalState } from "./terminal/restore.js";

export type RuntimeEnv = {
  log: typeof console.log;
  error: typeof console.error;
  exit: (code: number) => never;
};

export const createRuntime = (
  clearProgressFn: () => void = clearActiveProgressLine,
  restoreStateFn: (reason?: string) => void = restoreTerminalState,
  processExitFn: (code: number) => never = (code) => {
    restoreStateFn("runtime exit");
    process.exit(code);
    throw new Error("unreachable"); // satisfies tests when mocked
  },
): RuntimeEnv =>
  ({
    log: (...args: Parameters<typeof console.log>) => {
      clearProgressFn();
      console.log(...args);
    },
    error: (...args: Parameters<typeof console.error>) => {
      clearProgressFn();
      console.error(...args);
    },
    exit: (code: number) => {
      restoreStateFn("runtime exit");
      return processExitFn(code);
    },
  });

export const defaultRuntime: RuntimeEnv = createRuntime();
