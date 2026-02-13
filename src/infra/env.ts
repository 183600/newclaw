import { createSubsystemLogger } from "../logging/subsystem.js";
import { parseBooleanValue } from "../utils/boolean.js";

let loggedEnv = new Set<string>();

// Export for testing
export function _resetLoggedEnvForTesting(): void {
  loggedEnv = new Set<string>();
}

function getLog() {
  return createSubsystemLogger("env");
}

type AcceptedEnvOption = {
  key: string;
  description: string;
  value?: string;
  redact?: boolean;
};

function formatEnvValue(value: string, redact?: boolean): string {
  if (redact) {
    return "<redacted>";
  }
  const singleLine = value.replace(/\s+/g, " ").trim();
  if (singleLine.length <= 160) {
    return singleLine;
  }
  return `${singleLine.slice(0, 160)}…`;
}

export function logAcceptedEnvOption(option: AcceptedEnvOption): void {
  if (process.env.VITEST || process.env.NODE_ENV === "test") {
    return;
  }
  _logAcceptedEnvOptionInternal(option);
}

// Internal function without test environment check - for testing only
export function _logAcceptedEnvOptionInternal(option: AcceptedEnvOption): void {
  if (loggedEnv.has(option.key)) {
    return;
  }
  const rawValue = option.value ?? process.env[option.key];
  if (!rawValue || !rawValue.trim()) {
    return;
  }
  loggedEnv.add(option.key);
  const log = getLog();
  log.info(`env: ${option.key}=${formatEnvValue(rawValue, option.redact)} (${option.description})`);
}

export function normalizeZaiEnv(): void {
  const zaiKey = process.env.ZAI_API_KEY?.trim();
  const zAiKey = process.env.Z_AI_API_KEY?.trim();

  // Only set ZAI_API_KEY from Z_AI_API_KEY if ZAI_API_KEY is empty/undefined
  // and Z_AI_API_KEY has a value
  if ((!zaiKey || zaiKey === "") && zAiKey && zAiKey !== "") {
    process.env.ZAI_API_KEY = zAiKey;
  }
}

export function isTruthyEnvValue(value?: string): boolean {
  return parseBooleanValue(value) === true;
}

export function normalizeEnv(): void {
  normalizeZaiEnv();
}
