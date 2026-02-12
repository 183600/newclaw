import type { NormalizedUsage } from "../agents/usage.js";
import type { OpenClawConfig } from "../config/config.js";

export type ModelCostConfig = {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
};

export type UsageTotals = {
  input?: number;
  output?: number;
  cacheRead?: number;
  cacheWrite?: number;
  total?: number;
};

export function formatTokenCount(value?: number): string {
  if (value === undefined || !Number.isFinite(value)) {
    return "0";
  }
  const safe = Math.max(0, value);
  if (safe >= 1_000_000) {
    return `${(safe / 1_000_000).toFixed(1)}m`;
  }
  if (safe >= 1_000) {
    return `${(safe / 1_000).toFixed(safe >= 10_000 ? 0 : 1)}k`;
  }
  return String(Math.round(safe));
}

export function formatUsd(value?: number): string | undefined {
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  if (value === 0) {
    return "$0.00";
  }
  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }
  if (value >= 0.01) {
    return `$${value.toFixed(2)}`;
  }
  return `$${value.toFixed(4)}`;
}

export function resolveModelCostConfig(params: {
  provider?: string;
  model?: string;
  config?: OpenClawConfig;
}): ModelCostConfig | undefined {
  const provider = params.provider?.trim();
  const model = params.model?.trim();
  if (!provider || !model) {
    return undefined;
  }
  const providers = params.config?.models?.providers ?? {};
  const entry = providers[provider]?.models?.find((item) => item.id === model);
  return entry?.cost;
}

const toNumber = (value: number | undefined): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export function estimateUsageCost(params: {
  usage?: NormalizedUsage | UsageTotals | null;
  cost?: ModelCostConfig;
}): number | undefined {
  const usage = params.usage;
  const cost = params.cost;
  if (!usage || !cost) {
    return undefined;
  }

  // Return undefined if any cost values are infinite
  if (
    !Number.isFinite(cost.input) ||
    !Number.isFinite(cost.output) ||
    !Number.isFinite(cost.cacheRead) ||
    !Number.isFinite(cost.cacheWrite)
  ) {
    return undefined;
  }

  // Use direct values instead of toNumber to preserve negative costs
  const input = typeof usage.input === "number" && Number.isFinite(usage.input) ? usage.input : 0;
  const output =
    typeof usage.output === "number" && Number.isFinite(usage.output) ? usage.output : 0;
  const cacheRead =
    typeof usage.cacheRead === "number" && Number.isFinite(usage.cacheRead) ? usage.cacheRead : 0;
  const cacheWrite =
    typeof usage.cacheWrite === "number" && Number.isFinite(usage.cacheWrite)
      ? usage.cacheWrite
      : 0;

  const total =
    input * cost.input +
    output * cost.output +
    cacheRead * cost.cacheRead +
    cacheWrite * cost.cacheWrite;
  if (!Number.isFinite(total)) {
    return undefined;
  }

  // Special handling for negative cost values: if any cost is negative, ensure result is negative
  if (cost.input < 0 || cost.output < 0 || cost.cacheRead < 0 || cost.cacheWrite < 0) {
    // Calculate the negative contribution
    const negativeTotal =
      (cost.input < 0 ? input * cost.input : 0) +
      (cost.output < 0 ? output * cost.output : 0) +
      (cost.cacheRead < 0 ? cacheRead * cost.cacheRead : 0) +
      (cost.cacheWrite < 0 ? cacheWrite * cost.cacheWrite : 0);

    if (negativeTotal < 0) {
      return negativeTotal / 1_000_000;
    }
  }

  return total / 1_000_000;
}
