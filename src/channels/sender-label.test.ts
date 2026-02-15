import { describe, expect, it } from "vitest";
import { resolveSenderLabel, listSenderLabelCandidates } from "./sender-label.js";

describe("resolveSenderLabel", () => {
  it("should return null when all parameters are empty", () => {
    const result = resolveSenderLabel({});
    expect(result).toBeNull();
  });

  it("should return name when name is provided", () => {
    const result = resolveSenderLabel({ name: "John Doe" });
    expect(result).toBe("John Doe");
  });

  it("should return username when username is provided", () => {
    const result = resolveSenderLabel({ username: "johndoe" });
    expect(result).toBe("johndoe");
  });

  it("should return tag when tag is provided", () => {
    const result = resolveSenderLabel({ tag: "JD123" });
    expect(result).toBe("JD123");
  });

  it("should return e164 when e164 is provided", () => {
    const result = resolveSenderLabel({ e164: "+1234567890" });
    expect(result).toBe("+1234567890");
  });

  it("should return id when id is provided", () => {
    const result = resolveSenderLabel({ id: "user123" });
    expect(result).toBe("user123");
  });

  it("should prioritize name over other fields", () => {
    const result = resolveSenderLabel({
      name: "John Doe",
      username: "johndoe",
      tag: "JD123",
      e164: "+1234567890",
      id: "user123",
    });
    expect(result).toBe("John Doe (+1234567890)");
  });

  it("should prioritize username over tag, e164, and id", () => {
    const result = resolveSenderLabel({
      username: "johndoe",
      tag: "JD123",
      e164: "+1234567890",
      id: "user123",
    });
    expect(result).toBe("johndoe (+1234567890)");
  });

  it("should combine display name with id when they differ", () => {
    const result = resolveSenderLabel({
      name: "John Doe",
      id: "user123",
    });
    expect(result).toBe("John Doe (user123)");
  });

  it("should combine display name with e164 when they differ", () => {
    const result = resolveSenderLabel({
      name: "John Doe",
      e164: "+1234567890",
    });
    expect(result).toBe("John Doe (+1234567890)");
  });

  it("should combine username with id when they differ", () => {
    const result = resolveSenderLabel({
      username: "johndoe",
      id: "user123",
    });
    expect(result).toBe("johndoe (user123)");
  });

  it("should not combine when display name and id are the same", () => {
    const result = resolveSenderLabel({
      name: "user123",
      id: "user123",
    });
    expect(result).toBe("user123");
  });

  it("should handle whitespace in parameters", () => {
    const result = resolveSenderLabel({
      name: "  John Doe  ",
      username: "  johndoe  ",
      tag: "  JD123  ",
      e164: "  +1234567890  ",
      id: "  user123  ",
    });
    expect(result).toBe("John Doe (+1234567890)");
  });

  it("should handle empty strings in parameters", () => {
    const result = resolveSenderLabel({
      name: "",
      username: "",
      tag: "",
      e164: "",
      id: "",
    });
    expect(result).toBeNull();
  });
});

describe("listSenderLabelCandidates", () => {
  it("should return empty array when all parameters are empty", () => {
    const result = listSenderLabelCandidates({});
    expect(result).toEqual([]);
  });

  it("should return name as candidate when name is provided", () => {
    const result = listSenderLabelCandidates({ name: "John Doe" });
    expect(result).toEqual(["John Doe"]);
  });

  it("should return all non-empty parameters as candidates", () => {
    const result = listSenderLabelCandidates({
      name: "John Doe",
      username: "johndoe",
      tag: "JD123",
      e164: "+1234567890",
      id: "user123",
    });
    expect(result).toEqual([
      "John Doe",
      "johndoe",
      "JD123",
      "+1234567890",
      "user123",
      "John Doe (+1234567890)", // Combined result
    ]);
  });

  it("should include resolved label as candidate", () => {
    const result = listSenderLabelCandidates({
      name: "John Doe",
      id: "user123",
    });
    expect(result).toContain("John Doe");
    expect(result).toContain("user123");
    expect(result).toContain("John Doe (user123)");
  });

  it("should handle whitespace in parameters", () => {
    const result = listSenderLabelCandidates({
      name: "  John Doe  ",
      username: "  johndoe  ",
      tag: "  JD123  ",
      e164: "  +1234567890  ",
      id: "  user123  ",
    });
    expect(result).toEqual([
      "John Doe",
      "johndoe",
      "JD123",
      "+1234567890",
      "user123",
      "John Doe (+1234567890)",
    ]);
  });

  it("should handle empty strings in parameters", () => {
    const result = listSenderLabelCandidates({
      name: "",
      username: "",
      tag: "",
      e164: "",
      id: "",
    });
    expect(result).toEqual([]);
  });

  it("should remove duplicates", () => {
    const result = listSenderLabelCandidates({
      name: "John Doe",
      username: "John Doe", // Same as name
      id: "John Doe", // Same as name
    });
    expect(result).toEqual(["John Doe"]);
  });

  it("should handle undefined parameters", () => {
    const result = listSenderLabelCandidates({
      name: undefined,
      username: undefined,
      tag: undefined,
      e164: undefined,
      id: undefined,
    });
    expect(result).toEqual([]);
  });
});
