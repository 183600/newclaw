import { normalizeAccountId } from "./account-id.js";
import { normalizeMessageChannel } from "./message-channel.js";

export type DeliveryContext = {
  channel?: string;
  to?: string;
  accountId?: string;
  threadId?: string | number;
};

export type DeliveryContextSessionSource = {
  channel?: string;
  lastChannel?: string;
  lastTo?: string;
  lastAccountId?: string;
  lastThreadId?: string | number;
  deliveryContext?: DeliveryContext;
};

export function normalizeDeliveryContext(context?: DeliveryContext): DeliveryContext | undefined {
  if (!context) {
    return undefined;
  }

  const channel =
    context.channel !== undefined ? normalizeMessageChannel(context.channel) : undefined;
  const to = context.to !== undefined ? context.to.trim() || undefined : undefined;
  const accountId = normalizeAccountId(context.accountId);

  let threadId: string | number | undefined;
  if (typeof context.threadId === "number" && Number.isFinite(context.threadId)) {
    threadId = Math.trunc(context.threadId);
  } else if (typeof context.threadId === "string") {
    const trimmed = context.threadId.trim();
    threadId = trimmed || undefined;
  } else if (context.threadId !== undefined) {
    threadId = undefined;
  }

  const normalized: DeliveryContext = {};

  // Only include fields that were present in the input
  if ("channel" in context) {
    normalized.channel = channel;
  }
  if ("to" in context) {
    normalized.to = to;
  }
  if ("accountId" in context) {
    normalized.accountId = accountId;
  }
  if ("threadId" in context) {
    normalized.threadId = threadId;
  }

  // If no fields were present in input, return undefined
  if (
    !("channel" in context) &&
    !("to" in context) &&
    !("accountId" in context) &&
    !("threadId" in context)
  ) {
    return undefined;
  }

  // If all normalized values are undefined/empty, but only one field was present in input, return the object with that field
  const fieldCount =
    ("channel" in context ? 1 : 0) +
    ("to" in context ? 1 : 0) +
    ("accountId" in context ? 1 : 0) +
    ("threadId" in context ? 1 : 0);

  // If all normalized values are undefined/empty and more than one field was present, return undefined
  if (
    fieldCount > 1 &&
    normalized.channel === undefined &&
    normalized.to === undefined &&
    normalized.accountId === undefined &&
    normalized.threadId === undefined
  ) {
    return undefined;
  }

  return normalized;
}

export function normalizeSessionDeliveryFields(source?: DeliveryContextSessionSource): {
  deliveryContext?: DeliveryContext;
  lastChannel?: string;
  lastTo?: string;
  lastAccountId?: string;
  lastThreadId?: string | number;
} {
  if (!source) {
    return {
      deliveryContext: undefined,
      lastChannel: undefined,
      lastTo: undefined,
      lastAccountId: undefined,
      lastThreadId: undefined,
    };
  }

  const merged = mergeDeliveryContext(
    normalizeDeliveryContext(source.deliveryContext),
    normalizeDeliveryContext({
      channel: source.lastChannel ?? source.channel,
      to: source.lastTo,
      accountId: source.lastAccountId,
      threadId: source.lastThreadId,
    }),
  );

  if (!merged) {
    return {
      deliveryContext: undefined,
      lastChannel: undefined,
      lastTo: undefined,
      lastAccountId: undefined,
      lastThreadId: undefined,
    };
  }

  return {
    deliveryContext: merged,
    lastChannel: merged.channel,
    lastTo: merged.to,
    lastAccountId: merged.accountId,
    lastThreadId: merged.threadId,
  };
}

export function deliveryContextFromSession(
  entry?: DeliveryContextSessionSource & { origin?: { threadId?: string | number } },
): DeliveryContext | undefined {
  if (!entry) {
    return undefined;
  }
  const source: DeliveryContextSessionSource = {
    channel: entry.channel,
    lastChannel: entry.lastChannel,
    lastTo: entry.lastTo,
    lastAccountId: entry.lastAccountId,
    lastThreadId: entry.lastThreadId ?? entry.origin?.threadId,
    deliveryContext: entry.deliveryContext,
  };
  return normalizeSessionDeliveryFields(source).deliveryContext;
}

export function mergeDeliveryContext(
  primary?: DeliveryContext,
  fallback?: DeliveryContext,
): DeliveryContext | undefined {
  const normalizedPrimary = normalizeDeliveryContext(primary);
  const normalizedFallback = normalizeDeliveryContext(fallback);
  if (!normalizedPrimary && !normalizedFallback) {
    return undefined;
  }

  const merged: DeliveryContext = {
    channel: normalizedPrimary?.channel ?? normalizedFallback?.channel,
    to: normalizedPrimary?.to ?? normalizedFallback?.to,
    accountId: normalizedPrimary?.accountId ?? normalizedFallback?.accountId,
    threadId: normalizedPrimary?.threadId ?? normalizedFallback?.threadId,
  };

  // Only include fields that were present in either input
  const result: DeliveryContext = {};
  if (normalizedPrimary?.channel !== undefined || normalizedFallback?.channel !== undefined) {
    result.channel = merged.channel;
  }
  if (normalizedPrimary?.to !== undefined || normalizedFallback?.to !== undefined) {
    result.to = merged.to;
  }
  if (normalizedPrimary?.accountId !== undefined || normalizedFallback?.accountId !== undefined) {
    result.accountId = merged.accountId;
  }
  if (normalizedPrimary?.threadId !== undefined || normalizedFallback?.threadId !== undefined) {
    result.threadId = merged.threadId;
  }

  return result;
}

export function deliveryContextKey(context?: DeliveryContext): string | undefined {
  const normalized = normalizeDeliveryContext(context);
  if (!normalized?.channel || !normalized?.to) {
    return undefined;
  }
  const threadId =
    normalized.threadId != null && normalized.threadId !== "" ? String(normalized.threadId) : "";
  return `${normalized.channel}|${normalized.to}|${normalized.accountId ?? ""}|${threadId}`;
}
