import { danger, info, logVerboseConsole, success, warn } from "./globals.js";
import { getLogger } from "./logging/logger.js";
import { createSubsystemLogger } from "./logging/subsystem.js";
import { defaultRuntime, type RuntimeEnv } from "./runtime.js";

const subsystemPrefixRe = /^([a-z][a-z0-9-]{1,20}):\s+(.*)$/i;

function splitSubsystem(message: string) {
  const match = message.match(subsystemPrefixRe);
  if (!match) {
    return null;
  }
  const [, subsystem, rest] = match;
  return { subsystem, rest };
}

function ensureString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return String(value);
  } catch {
    return "";
  }
}

export function logInfo(message: string, runtime: RuntimeEnv = defaultRuntime) {
  const strMessage = ensureString(message);
  const parsed = runtime === defaultRuntime ? splitSubsystem(strMessage) : null;
  if (parsed) {
    createSubsystemLogger(parsed.subsystem).info(parsed.rest);
    return;
  }
  runtime.log(info(strMessage));
  getLogger().info(strMessage);
}

export function logWarn(message: string, runtime: RuntimeEnv = defaultRuntime) {
  const strMessage = ensureString(message);
  const parsed = runtime === defaultRuntime ? splitSubsystem(strMessage) : null;
  if (parsed) {
    createSubsystemLogger(parsed.subsystem).warn(parsed.rest);
    return;
  }
  runtime.log(warn(strMessage));
  getLogger().warn(strMessage);
}

export function logSuccess(message: string, runtime: RuntimeEnv = defaultRuntime) {
  const strMessage = ensureString(message);
  const parsed = runtime === defaultRuntime ? splitSubsystem(strMessage) : null;
  if (parsed) {
    createSubsystemLogger(parsed.subsystem).info(parsed.rest);
    return;
  }
  runtime.log(success(strMessage));
  getLogger().info(strMessage);
}

export function logError(message: string, runtime: RuntimeEnv = defaultRuntime) {
  const strMessage = ensureString(message);
  const parsed = runtime === defaultRuntime ? splitSubsystem(strMessage) : null;
  if (parsed) {
    createSubsystemLogger(parsed.subsystem).error(parsed.rest);
    return;
  }
  runtime.error(danger(strMessage));
  getLogger().error(strMessage);
}

export function logDebug(message: string) {
  // Always emit to file logger (level-filtered); console only when verbose.
  const strMessage = ensureString(message);
  getLogger().debug(strMessage);
  logVerboseConsole(strMessage);
}
