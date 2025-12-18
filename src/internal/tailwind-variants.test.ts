import { describe, expect, it } from "vitest";
import type { BreakpointConfig } from "../breakpoints.js";
import { getBreakpoint, parseVariantToken } from "./tailwind-variants.js";

describe("parseVariantToken", () => {
  it("should parse token with no variants", () => {
    const result = parseVariantToken("w-full");
    expect(result).toEqual({ base: "w-full", variants: [] });
  });

  it("should parse token with single variant", () => {
    const result = parseVariantToken("md:w-full");
    expect(result).toEqual({ base: "w-full", variants: ["md"] });
  });

  it("should parse token with multiple variants", () => {
    const result = parseVariantToken("md:hover:w-full");
    expect(result).toEqual({ base: "w-full", variants: ["md", "hover"] });
  });

  it("should parse token with many chained variants", () => {
    const result = parseVariantToken("sm:md:lg:hover:focus:dark:w-full");
    expect(result).toEqual({
      base: "w-full",
      variants: ["sm", "md", "lg", "hover", "focus", "dark"],
    });
  });

  it("should handle empty string", () => {
    const result = parseVariantToken("");
    expect(result).toEqual({ base: "", variants: [] });
  });

  it("should handle single colon without variant", () => {
    const result = parseVariantToken(":w-full");
    expect(result).toEqual({ base: ":w-full", variants: [] });
  });

  it("should handle just a colon", () => {
    const result = parseVariantToken(":");
    expect(result).toEqual({ base: ":", variants: [] });
  });

  it("should handle trailing colon", () => {
    const result = parseVariantToken("md:");
    expect(result).toEqual({ base: "md:", variants: [] });
  });

  it("should handle numeric variants", () => {
    const result = parseVariantToken("2xl:w-full");
    expect(result).toEqual({ base: "w-full", variants: ["2xl"] });
  });

  it("should handle variants with hyphens", () => {
    const result = parseVariantToken("max-md:w-full");
    expect(result).toEqual({ base: "w-full", variants: ["max-md"] });
  });

  it("should handle variants with underscores", () => {
    const result = parseVariantToken("custom_variant:w-full");
    expect(result).toEqual({ base: "w-full", variants: ["custom_variant"] });
  });

  it("should handle complex base classes", () => {
    const result = parseVariantToken("md:grid-cols-[1fr_2fr]");
    expect(result).toEqual({ base: "grid-cols-[1fr_2fr]", variants: ["md"] });
  });

  it("should handle uppercase in variants and base", () => {
    const result = parseVariantToken("MD:W-FULL");
    expect(result).toEqual({ base: "W-FULL", variants: ["MD"] });
  });

  it("should handle base with colons", () => {
    const result = parseVariantToken("md:bg-[url('/path:with:colons.jpg')]");
    expect(result).toEqual({
      base: "bg-[url('/path:with:colons.jpg')]",
      variants: ["md"],
    });
  });

  it("should handle arbitrary selector variants", () => {
    const result = parseVariantToken("[&:hover]:w-full");
    expect(result).toEqual({ base: "w-full", variants: ["[&:hover]"] });
  });

  it("should handle container query variants", () => {
    const result = parseVariantToken("@[34rem]:w-full");
    expect(result).toEqual({ base: "w-full", variants: ["@[34rem]"] });
  });
});

describe("getBreakpoint", () => {
  const mockBreakpoints: BreakpointConfig = {
    "2xl": 1536,
    lg: 1024,
    md: 768,
    sm: 640,
    xl: 1280,
  };

  it("should return null when variants array is empty", () => {
    const result = getBreakpoint([], mockBreakpoints);
    expect(result).toBeNull();
  });

  it("should return matching breakpoint from single variant", () => {
    const result = getBreakpoint(["md"], mockBreakpoints);
    expect(result).toBe("md");
  });

  it("should return first matching breakpoint from multiple variants", () => {
    const result = getBreakpoint(["hover", "md", "lg"], mockBreakpoints);
    expect(result).toBe("md");
  });

  it("should return null when no variants match breakpoints", () => {
    const result = getBreakpoint(["hover", "focus", "dark"], mockBreakpoints);
    expect(result).toBeNull();
  });

  it("should return first breakpoint when multiple variants match", () => {
    const result = getBreakpoint(["sm", "md", "lg"], mockBreakpoints);
    expect(result).toBe("sm");
  });

  it("should handle numeric breakpoint variants", () => {
    const result = getBreakpoint(["2xl", "hover"], mockBreakpoints);
    expect(result).toBe("2xl");
  });

  it("should return null with empty breakpoint config", () => {
    const result = getBreakpoint(["md", "lg"], {});
    expect(result).toBeNull();
  });

  it("should handle custom breakpoint names", () => {
    const customBreakpoints: BreakpointConfig = {
      desktop: 1024,
      mobile: 320,
      tablet: 768,
    };
    const result = getBreakpoint(["tablet", "hover"], customBreakpoints);
    expect(result).toBe("tablet");
  });

  it("should handle variants with special characters that don't match", () => {
    const result = getBreakpoint(["max-md", "min-lg"], mockBreakpoints);
    expect(result).toBeNull();
  });

  it("should match exact breakpoint names only", () => {
    const result = getBreakpoint(["m", "md-custom"], mockBreakpoints);
    expect(result).toBeNull();
  });

  it("should handle single variant that matches", () => {
    const result = getBreakpoint(["xl"], mockBreakpoints);
    expect(result).toBe("xl");
  });

  it("should handle many variants with match at end", () => {
    const result = getBreakpoint(
      ["hover", "focus", "dark", "active", "disabled", "lg"],
      mockBreakpoints
    );
    expect(result).toBe("lg");
  });
});
