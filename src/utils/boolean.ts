export type BooleanParseOptions = {
  truthy?: string[];
  falsy?: string[];
};

const DEFAULT_TRUTHY = ["true", "1", "yes", "on"] as const;
const DEFAULT_FALSY = ["false", "0", "no", "off"] as const;
const DEFAULT_TRUTHY_SET = new Set<string>(DEFAULT_TRUTHY);
const DEFAULT_FALSY_SET = new Set<string>(DEFAULT_FALSY);

export function parseBooleanValue(
  value: unknown,
  options: BooleanParseOptions = {},
): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  // Use a more comprehensive trim that handles zero-width spaces and other Unicode whitespace
  const trimmed = value.replace(/[\u200B-\u200D\uFEFF\u00A0\s]+/g, "");
  if (!trimmed) {
    return undefined;
  }

  const truthy = options.truthy ?? DEFAULT_TRUTHY;
  const falsy = options.falsy ?? DEFAULT_FALSY;

  // Check if using custom options (case sensitive)
  const usingCustomTruthy = options.truthy !== undefined;
  const usingCustomFalsy = options.falsy !== undefined;

  if (usingCustomTruthy || usingCustomFalsy) {
    // For custom options, use case-sensitive comparison
    if (usingCustomTruthy && (truthy as readonly string[]).includes(trimmed)) {
      return true;
    }
    if (usingCustomFalsy && (falsy as readonly string[]).includes(trimmed)) {
      return false;
    }
  } else {
    // For default options, use case-insensitive comparison
    const normalized = trimmed.toLowerCase();
    if (DEFAULT_TRUTHY_SET.has(normalized)) {
      return true;
    }
    if (DEFAULT_FALSY_SET.has(normalized)) {
      return false;
    }
  }

  return undefined;
}
