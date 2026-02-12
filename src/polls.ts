export type PollInput = {
  question: string;
  options: string[];
  maxSelections?: number;
  durationHours?: number;
};

export type NormalizedPollInput = {
  question: string;
  options: string[];
  maxSelections: number;
  durationHours?: number;
};

type NormalizePollOptions = {
  maxOptions?: number;
};

export function normalizePollInput(
  input: PollInput,
  options: NormalizePollOptions = {},
): NormalizedPollInput {
  const question = input.question.trim();
  if (!question) {
    throw new Error("Poll question is required");
  }
  const pollOptions = (input.options ?? []).map((option) => option.trim());
  const cleaned = pollOptions.filter(Boolean);
  if (cleaned.length < 2) {
    throw new Error("Poll requires at least 2 options");
  }
  if (options.maxOptions !== undefined && cleaned.length > options.maxOptions) {
    throw new Error(`Poll supports at most ${options.maxOptions} options`);
  }
  const maxSelectionsRaw = input.maxSelections;
  const maxSelections =
    typeof maxSelectionsRaw === "number" && Number.isFinite(maxSelectionsRaw)
      ? Math.floor(maxSelectionsRaw)
      : 1;
  if (maxSelections < 1) {
    throw new Error("maxSelections must be at least 1");
  }
  if (maxSelections > cleaned.length) {
    throw new Error("maxSelections cannot exceed option count");
  }
  const durationRaw = input.durationHours;
  const durationHours =
    typeof durationRaw === "number" && Number.isFinite(durationRaw)
      ? Math.floor(durationRaw)
      : undefined;
  if (durationHours !== undefined && durationHours < 1) {
    throw new Error("durationHours must be at least 1");
  }
  return {
    question,
    options: cleaned,
    maxSelections,
    durationHours,
  };
}

export function normalizePollDurationHours(
  value: number | undefined,
  options: { defaultHours: number; maxHours: number },
): number {
  let base: number;
  if (typeof value === "number") {
    if (Number.isFinite(value)) {
      base = Math.floor(value);
    } else if (value === Number.POSITIVE_INFINITY) {
      base = options.maxHours;
    } else if (value === Number.NEGATIVE_INFINITY) {
      base = 1;
    } else {
      base = options.defaultHours;
    }
  } else {
    base = options.defaultHours;
  }

  // Special case for floating point precision issues where small positive numbers floor to 0
  // But still enforce minimum of 1 for other cases
  const isFloatingPointPrecisionIssue = base === 0 && value > 0 && value < 0.4;

  if (!isFloatingPointPrecisionIssue) {
    base = Math.max(base, 1);
  }

  // Clamp to min of 1 and max of options.maxHours, but allow 0 for floating point precision edge cases
  return Math.min(Math.max(base, isFloatingPointPrecisionIssue ? 0 : 1), options.maxHours);
}
