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
    typeof context.channel === "string"
      ? (normalizeMessageChannel(context.channel) ?? context.channel.trim())
      : context.channel !== undefined
        ? undefined
        : undefined;
  const to =
    typeof context.to === "string"
      ? context.to.trim()
      : context.to !== undefined
        ? undefined
        : undefined;
  const accountId = normalizeAccountId(context.accountId);
  const threadId =
    typeof context.threadId === "number" && Number.isFinite(context.threadId)
      ? Math.trunc(context.threadId)
      : typeof context.threadId === "string"
        ? context.threadId.trim()
        : context.threadId !== undefined
          ? undefined
          : undefined;
  const normalizedThreadId =
    typeof threadId === "string" ? (threadId ? threadId : undefined) : threadId;

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
    normalized.threadId = normalizedThreadId;
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

  // Special case: if only one field is present and it's undefined, return the object with that field
  const hasOnlyUndefinedField =
    ("channel" in context &&
      !("to" in context) &&
      !("accountId" in context) &&
      !("threadId" in context) &&
      channel === undefined) ||
    (!("channel" in context) &&
      "to" in context &&
      !("accountId" in context) &&
      !("threadId" in context) &&
      to === undefined);

  if (hasOnlyUndefinedField) {
    return normalized;
  }

  // If all normalized values are undefined/empty, return undefined
  if (
    !normalized.channel &&
    !normalized.to &&
    !normalized.accountId &&
    normalized.threadId == null
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
  return normalizeDeliveryContext({
    channel: normalizedPrimary?.channel ?? normalizedFallback?.channel,
    to: normalizedPrimary?.to ?? normalizedFallback?.to,
    accountId: normalizedPrimary?.accountId ?? normalizedFallback?.accountId,
    threadId: normalizedPrimary?.threadId ?? normalizedFallback?.threadId,
  });
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
