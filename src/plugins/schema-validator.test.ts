import { describe, expect, it } from "vitest";
import { validateJsonSchemaValue } from "./schema-validator.js";

describe("validateJsonSchemaValue", () => {
  it("should validate valid data against schema", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name"],
    };

    const result = validateJsonSchemaValue({
      schema,
      cacheKey: "test-schema",
      value: { name: "John", age: 30 },
    });

    expect(result.ok).toBe(true);
  });

  it("should reject invalid data against schema", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name"],
    };

    const result = validateJsonSchemaValue({
      schema,
      cacheKey: "test-schema",
      value: { age: 30 }, // Missing required 'name' field
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toContain("name");
      expect(result.errors[0]).toContain("required");
    }
  });

  it("should handle type mismatches", () => {
    const schema = {
      type: "object",
      properties: {
        count: { type: "number" },
      },
    };

    const result = validateJsonSchemaValue({
      schema,
      cacheKey: "test-schema",
      value: { count: "not-a-number" },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toContain("count: must be number");
    }
  });

  it("should cache validators for performance", () => {
    const schema = {
      type: "string",
    };

    const result1 = validateJsonSchemaValue({
      schema,
      cacheKey: "cached-schema",
      value: "test",
    });

    const result2 = validateJsonSchemaValue({
      schema,
      cacheKey: "cached-schema",
      value: "test2",
    });

    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
  });

  it("should handle nested object validation", () => {
    const schema = {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            profile: {
              type: "object",
              properties: {
                email: { type: "string", minLength: 5 },
              },
              required: ["email"],
            },
          },
        },
      },
      required: ["user"],
    };

    const result = validateJsonSchemaValue({
      schema,
      cacheKey: "nested-schema",
      value: {
        user: {
          profile: {
            email: "abc", // Too short
          },
        },
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toContain("user.profile.email");
      expect(result.errors[0]).toContain("fewer than 5 characters");
    }
  });
});
