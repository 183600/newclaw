import { describe, expect, it } from "vitest";
import { isValidProfileName, normalizeProfileName } from "./profile-utils.js";

describe("isValidProfileName", () => {
  it("should return false for empty string", () => {
    expect(isValidProfileName("")).toBe(false);
  });

  it("should return false for null/undefined", () => {
    expect(isValidProfileName(null as unknown)).toBe(false);
    expect(isValidProfileName(undefined as unknown)).toBe(false);
  });

  it("should return true for valid single character", () => {
    expect(isValidProfileName("a")).toBe(true);
    expect(isValidProfileName("1")).toBe(true);
  });

  it("should return true for valid profile names", () => {
    expect(isValidProfileName("dev")).toBe(true);
    expect(isValidProfileName("prod")).toBe(true);
    expect(isValidProfileName("test123")).toBe(true);
    expect(isValidProfileName("my-profile")).toBe(true);
    expect(isValidProfileName("my_profile")).toBe(true);
    expect(isValidProfileName("profile123")).toBe(true);
  });

  it("should return true for maximum length profile name", () => {
    const maxProfile = "a" + "b".repeat(63); // 64 characters total
    expect(isValidProfileName(maxProfile)).toBe(true);
  });

  it("should return false for profile name that's too long", () => {
    const tooLongProfile = "a" + "b".repeat(64); // 65 characters total
    expect(isValidProfileName(tooLongProfile)).toBe(false);
  });

  it("should return false for profile name starting with invalid character", () => {
    expect(isValidProfileName("-profile")).toBe(false);
    expect(isValidProfileName("_profile")).toBe(false);
    expect(isValidProfileName("!profile")).toBe(false);
    expect(isValidProfileName(".profile")).toBe(false);
    expect(isValidProfileName(" profile")).toBe(false);
  });

  it("should return false for profile name with invalid characters", () => {
    expect(isValidProfileName("profile!")).toBe(false);
    expect(isValidProfileName("profile@")).toBe(false);
    expect(isValidProfileName("profile#")).toBe(false);
    expect(isValidProfileName("profile$")).toBe(false);
    expect(isValidProfileName("profile%")).toBe(false);
    expect(isValidProfileName("profile^")).toBe(false);
    expect(isValidProfileName("profile&")).toBe(false);
    expect(isValidProfileName("profile*")).toBe(false);
    expect(isValidProfileName("profile(")).toBe(false);
    expect(isValidProfileName("profile)")).toBe(false);
    expect(isValidProfileName("profile+")).toBe(false);
    expect(isValidProfileName("profile=")).toBe(false);
    expect(isValidProfileName("profile{")).toBe(false);
    expect(isValidProfileName("profile}")).toBe(false);
    expect(isValidProfileName("profile|")).toBe(false);
    expect(isValidProfileName("profile\\")).toBe(false);
    expect(isValidProfileName("profile:")).toBe(false);
    expect(isValidProfileName('profile"')).toBe(false);
    expect(isValidProfileName("profile'")).toBe(false);
    expect(isValidProfileName("profile<")).toBe(false);
    expect(isValidProfileName("profile>")).toBe(false);
    expect(isValidProfileName("profile?")).toBe(false);
    expect(isValidProfileName("profile/")).toBe(false);
    expect(isValidProfileName("profile~")).toBe(false);
    expect(isValidProfileName("profile`")).toBe(false);
  });

  it("should return false for profile name with spaces", () => {
    expect(isValidProfileName("my profile")).toBe(false);
    expect(isValidProfileName("my\tprofile")).toBe(false);
    expect(isValidProfileName("my\nprofile")).toBe(false);
  });

  it("should be case insensitive", () => {
    expect(isValidProfileName("PROFILE")).toBe(true);
    expect(isValidProfileName("Profile")).toBe(true);
    expect(isValidProfileName("PrOfIlE")).toBe(true);
  });
});

describe("normalizeProfileName", () => {
  it("should return null for undefined", () => {
    expect(normalizeProfileName(undefined)).toBeNull();
  });

  it("should return null for null", () => {
    expect(normalizeProfileName(null)).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(normalizeProfileName("")).toBeNull();
  });

  it("should return null for whitespace only string", () => {
    expect(normalizeProfileName("   ")).toBeNull();
    expect(normalizeProfileName("\t")).toBeNull();
    expect(normalizeProfileName("\n")).toBeNull();
  });

  it("should return null for 'default' (case insensitive)", () => {
    expect(normalizeProfileName("default")).toBeNull();
    expect(normalizeProfileName("DEFAULT")).toBeNull();
    expect(normalizeProfileName("Default")).toBeNull();
    expect(normalizeProfileName("dEfAuLt")).toBeNull();
  });

  it("should return null for invalid profile names", () => {
    expect(normalizeProfileName("-invalid")).toBeNull();
    expect(normalizeProfileName("invalid!")).toBeNull();
    expect(normalizeProfileName("my profile")).toBeNull();
    expect(normalizeProfileName("")).toBeNull();
  });

  it("should return null for profile name that's too long", () => {
    const tooLongProfile = "a" + "b".repeat(64); // 65 characters total
    expect(normalizeProfileName(tooLongProfile)).toBeNull();
  });

  it("should return normalized valid profile names", () => {
    expect(normalizeProfileName("dev")).toBe("dev");
    expect(normalizeProfileName("prod")).toBe("prod");
    expect(normalizeProfileName("test123")).toBe("test123");
    expect(normalizeProfileName("my-profile")).toBe("my-profile");
    expect(normalizeProfileName("my_profile")).toBe("my_profile");
  });

  it("should trim whitespace from valid profile names", () => {
    expect(normalizeProfileName("  dev  ")).toBe("dev");
    expect(normalizeProfileName("\tprod\n")).toBe("prod");
    expect(normalizeProfileName(" test123 ")).toBe("test123");
  });

  it("should preserve case for valid profile names", () => {
    expect(normalizeProfileName("Dev")).toBe("Dev");
    expect(normalizeProfileName("PROD")).toBe("PROD");
    expect(normalizeProfileName("Test_Profile")).toBe("Test_Profile");
  });

  it("should return null for trimmed whitespace", () => {
    expect(normalizeProfileName("   ")).toBeNull();
    expect(normalizeProfileName("\t\n")).toBeNull();
  });

  it("should handle maximum length valid profile name", () => {
    const maxProfile = "a" + "b".repeat(63); // 64 characters total
    expect(normalizeProfileName(maxProfile)).toBe(maxProfile);
  });

  it("should return null for invalid profile name after trimming", () => {
    expect(normalizeProfileName("  -invalid  ")).toBeNull();
    expect(normalizeProfileName("\tinvalid!\n")).toBeNull();
  });
});
