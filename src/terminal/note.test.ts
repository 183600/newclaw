import { describe, expect, it, vi } from "vitest";
import { wrapNoteMessage, note } from "./note.js";

// Mock the dependencies
vi.mock("@clack/prompts", () => ({
  note: vi.fn(),
}));

vi.mock("./ansi.js", () => ({
  visibleWidth: vi.fn((str: string) => str.length),
}));

vi.mock("./prompt-style.js", () => ({
  stylePromptTitle: vi.fn((title?: string) => title ?? ""),
}));

describe("wrapNoteMessage", () => {
  beforeEach(() => {
    vi.mocked(process.stdout.columns).mockReturnValue(80);
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
    expect(result).toBe("  Indented line\n  that should be\n  wrapped");
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
    expect(result).toBe("Supercalifragil\nisticexpialidoc\nious is a very\nlong word");
  });

  it("should handle zero max width", () => {
    const message = "Any message";
    const result = wrapNoteMessage(message, { maxWidth: 0 });
    expect(result).toBe(message);
  });

  it("should use process.stdout.columns when available", () => {
    vi.mocked(process.stdout.columns).mockReturnValue(100);
    const message = "This is a message that should not be wrapped with a wider terminal";
    const result = wrapNoteMessage(message);
    expect(result).toBe(message);
  });

  it("should use default width when process.stdout.columns is not available", () => {
    vi.mocked(process.stdout.columns).mockReturnValue(undefined);
    const message = "This is a message that should be wrapped with default width";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    expect(result).toBe("This is a message\nthat should be\nwrapped with default\nwidth");
  });

  it("should limit max width to 88", () => {
    const message = "This is a message that should be wrapped with a very wide terminal";
    const result = wrapNoteMessage(message, { columns: 200 });
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
      "  - First bullet point\n    that is very long\n    and should be\n    wrapped\n  - Second bullet point",
    );
  });
});

describe("note", () => {
  it("should call clackNote with wrapped message and styled title", () => {
    const { note } = require("@clack/prompts");
    const { stylePromptTitle } = require("./prompt-style.js");

    const message = "Test message";
    const title = "Test title";

    note(message, title);

    expect(note).toHaveBeenCalledWith("Test message", "Test title");
    expect(stylePromptTitle).toHaveBeenCalledWith("Test title");
  });

  it("should call clackNote with wrapped message and default title", () => {
    const { note } = require("@clack/prompts");
    const { stylePromptTitle } = require("./prompt-style.js");

    const message = "Test message";

    note(message);

    expect(note).toHaveBeenCalledWith("Test message", "");
    expect(stylePromptTitle).toHaveBeenCalledWith(undefined);
  });
});
