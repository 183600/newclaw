import { describe, expect, it } from "vitest";
import { LOBSTER_PALETTE } from "./palette.js";

describe("LOBSTER_PALETTE", () => {
  it("exports all required color tokens", () => {
    expect(LOBSTER_PALETTE).toHaveProperty("accent");
    expect(LOBSTER_PALETTE).toHaveProperty("accentBright");
    expect(LOBSTER_PALETTE).toHaveProperty("accentDim");
    expect(LOBSTER_PALETTE).toHaveProperty("info");
    expect(LOBSTER_PALETTE).toHaveProperty("success");
    expect(LOBSTER_PALETTE).toHaveProperty("warn");
    expect(LOBSTER_PALETTE).toHaveProperty("error");
    expect(LOBSTER_PALETTE).toHaveProperty("muted");
  });

  it("exports valid hex color codes", () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    Object.values(LOBSTER_PALETTE).forEach((color) => {
      expect(color).toMatch(hexColorRegex);
    });
  });

  it("has consistent color family relationships", () => {
    // accent variants should be related
    expect(LOBSTER_PALETTE.accent).toBe("#FF5A2D");
    expect(LOBSTER_PALETTE.accentBright).toBe("#FF7A3D");
    expect(LOBSTER_PALETTE.accentDim).toBe("#D14A22");

    // info should be related to accent
    expect(LOBSTER_PALETTE.info).toBe("#FF8A5B");
  });

  it("has distinct semantic colors", () => {
    // Success should be green
    expect(LOBSTER_PALETTE.success).toBe("#2FBF71");

    // Warn should be yellow/orange
    expect(LOBSTER_PALETTE.warn).toBe("#FFB020");

    // Error should be red
    expect(LOBSTER_PALETTE.error).toBe("#E23D2D");

    // Muted should be gray/brown
    expect(LOBSTER_PALETTE.muted).toBe("#8B7F77");
  });

  it("exports as const for type safety", () => {
    // This test ensures the palette is exported as const for readonly type safety
    const palette = LOBSTER_PALETTE as typeof LOBSTER_PALETTE;
    expect(palette.accent).toBe("#FF5A2D");
  });
});
