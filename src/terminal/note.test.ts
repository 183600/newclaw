import { describe, expect, it, vi, beforeEach } from "vitest";
import { wrapNoteMessage, note } from "./note.js";

// Mock the dependencies
vi.mock("@clack/prompts", () => ({
  note: vi.fn(),
}));

vi.mock("./ansi.js", () => ({
  visibleWidth: vi.fn((str: string) => str.length),
}));

vi.mock("./theme.js", () => ({
  isRich: vi.fn(() => false),
  theme: {
    accent: vi.fn((str: string) => str),
    heading: vi.fn((str: string) => str),
    muted: vi.fn((str: string) => str),
  },
}));

vi.mock("./prompt-style.js", () => ({
  stylePromptTitle: vi.fn((title?: string) => title ?? ""),
}));

// Mock process.stdout.columns
const mockColumns = vi.fn();
Object.defineProperty(process.stdout, "columns", {
  get: mockColumns,
});

describe("wrapNoteMessage", () => {
  beforeEach(() => {
    mockColumns.mockReturnValue(80);
  });

  it("should return message unchanged when under max width", () => {
    const message = "Short message";
    const result = wrapNoteMessage(message);
    expect(result).toBe(message);
  });

  it("should wrap long lines", () => {
    const message = "This is a very long message that should be wrapped at the appropriate width";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    expect(result).toBe(
      "This is a very long\nmessage that should\nbe wrapped at the\nappropriate width",
    );
  });

  it("should handle multiple lines", () => {
    const message = "First line\nSecond line that is very long and should be wrapped";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    expect(result).toBe("First line\nSecond line that is\nvery long and should\nbe wrapped");
  });

  it("should handle empty lines", () => {
    const message = "First line\n\nThird line";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    expect(result).toBe("First line\n\nThird line");
  });

  it("should handle indented lines", () => {
    const message = "  Indented line that should be wrapped";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    expect(result).toBe("  Indented line that\n  should be wrapped");
  });

  it("should handle bullet points", () => {
    const message = "- Bullet point that should be wrapped";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    expect(result).toBe("- Bullet point that\n  should be wrapped");
  });

  it("should handle asterisk bullet points", () => {
    const message = "* Bullet point that should be wrapped";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    expect(result).toBe("* Bullet point that\n  should be wrapped");
  });

  it("should handle Unicode bullet points", () => {
    const message = "\u2022 Bullet point that should be wrapped";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    expect(result).toBe("\u2022 Bullet point that\n  should be wrapped");
  });

  it("should handle very long words", () => {
    const message = "Supercalifragilisticexpialidocious is a very long word";
    const result = wrapNoteMessage(message, { maxWidth: 15 });
    expect(result).toBe("Supercalifragil\nisticexpialidoc\nious\nis a very long\nword");
  });

  it("should handle zero max width", () => {
    const message = "Any message";
    const result = wrapNoteMessage(message, { maxWidth: 0 });
    // When maxWidth is 0, it uses the default width, so the message should be wrapped
    expect(result).toContain("\n");
  });

  it("should use process.stdout.columns when available", () => {
    mockColumns.mockReturnValue(100);
    const message = "This is a message that should not be wrapped with a wider terminal";
    const result = wrapNoteMessage(message);
    expect(result).toBe(message);
  });

  it("should use default width when process.stdout.columns is not available", () => {
    mockColumns.mockReturnValue(undefined);
    const message = "This is a message that should be wrapped with default width";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    expect(result).toBe("This is a message\nthat should be\nwrapped with default\nwidth");
  });

  it("should limit max width to 88", () => {
    const message =
      "This is a message that should be wrapped with a very wide terminal that exceeds the maximum width limit of eighty eight characters";
    const result = wrapNoteMessage(message, { columns: 200 });
    // With columns=200, maxWidth is clamped to 88, so the message should be wrapped
    expect(result).toContain("\n");
  });

  it("should ensure minimum width of 40", () => {
    const message = "This is a message that should be wrapped with a narrow terminal";
    const result = wrapNoteMessage(message, { columns: 30 });
    expect(result).toContain("\n");
  });

  it("should handle complex wrapping with bullets and indentation", () => {
    const message =
      "  - First bullet point that is very long and should be wrapped\n  - Second bullet point";
    const result = wrapNoteMessage(message, { maxWidth: 25 });
    expect(result).toBe(
      "  - First bullet point\n    that is very long and\n    should be wrapped\n  - Second bullet point",
    );
  });
});

describe("note", () => {
  it("should call clackNote with wrapped message and styled title", async () => {
    const { note: clackNote } = await import("@clack/prompts");
    const message = "Test message";
    const title = "Test title";

    note(message, title);

    expect(clackNote).toHaveBeenCalledWith("Test message", "Test title");
  });

  it("should call clackNote with wrapped message and default title", async () => {
    const { note: clackNote } = await import("@clack/prompts");
    const message = "Test message";

    note(message);

    expect(clackNote).toHaveBeenCalledWith("Test message", "");
  });
});
