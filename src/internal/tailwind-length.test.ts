import { describe, expect, it } from "vitest";
import { DEFAULT_BREAKPOINTS } from "../breakpoints.js";
import { parseTailwindLength } from "./tailwind-length.js";

const BASE_SPACING_PX = 4;

describe("parseTailwindLength", () => {
  describe("custom spacing", () => {
    it("returns value from custom spacing map", () => {
      const customSpacing = { container: "1200px", hero: "100vh" };
      expect(parseTailwindLength("hero", BASE_SPACING_PX, DEFAULT_BREAKPOINTS, customSpacing)).toBe(
        "100vh"
      );
      expect(
        parseTailwindLength("container", BASE_SPACING_PX, DEFAULT_BREAKPOINTS, customSpacing)
      ).toBe("1200px");
    });

    it("returns 1px for px token", () => {
      expect(parseTailwindLength("px", BASE_SPACING_PX, DEFAULT_BREAKPOINTS, {})).toBe("1px");
    });

    it("returns 1px for px token even with custom spacing", () => {
      const customSpacing = { hero: "100vh" };
      expect(parseTailwindLength("px", BASE_SPACING_PX, DEFAULT_BREAKPOINTS, customSpacing)).toBe(
        "1px"
      );
    });

    it("does not match when key not in custom spacing", () => {
      const customSpacing = { hero: "100vh" };
      expect(parseTailwindLength("4", BASE_SPACING_PX, DEFAULT_BREAKPOINTS, customSpacing)).toBe(
        "16px"
      );
    });

    it("handles empty custom spacing object", () => {
      expect(parseTailwindLength("4", BASE_SPACING_PX, DEFAULT_BREAKPOINTS, {})).toBe("16px");
    });
  });

  describe("screen values", () => {
    it("returns 100vw for screen", () => {
      expect(parseTailwindLength("screen", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("100vw");
    });

    it("returns breakpoint value for screen-{breakpoint}", () => {
      expect(parseTailwindLength("screen-sm", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("640px");
      expect(parseTailwindLength("screen-md", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("768px");
      expect(parseTailwindLength("screen-lg", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("1024px");
      expect(parseTailwindLength("screen-xl", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("1280px");
      expect(parseTailwindLength("screen-2xl", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe(
        "1536px"
      );
    });

    it("returns null for unknown screen breakpoint", () => {
      expect(parseTailwindLength("screen-3xl", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
      expect(parseTailwindLength("screen-xs", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("does not match screen prefix without dash", () => {
      expect(parseTailwindLength("screenmd", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("works with custom breakpoint config", () => {
      const customBreakpoints = { desktop: 1440, mobile: 375, tablet: 768 };
      expect(parseTailwindLength("screen-mobile", BASE_SPACING_PX, customBreakpoints)).toBe(
        "375px"
      );
      expect(parseTailwindLength("screen-tablet", BASE_SPACING_PX, customBreakpoints)).toBe(
        "768px"
      );
      expect(parseTailwindLength("screen-desktop", BASE_SPACING_PX, customBreakpoints)).toBe(
        "1440px"
      );
    });
  });

  describe("arbitrary brackets", () => {
    it("parses arbitrary length values", () => {
      expect(parseTailwindLength("[100px]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("100px");
      expect(parseTailwindLength("[50%]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("50%");
      expect(parseTailwindLength("[10rem]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("10rem");
      expect(parseTailwindLength("[75vw]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("75vw");
    });

    it("does not confuse slashes in arbitrary values with fractions", () => {
      expect(parseTailwindLength("[calc(100%/2)]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe(
        "calc(100%/2)"
      );
    });

    it("replaces underscores with spaces", () => {
      expect(parseTailwindLength("[calc(100%_-_2rem)]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe(
        "calc(100% - 2rem)"
      );
      expect(
        parseTailwindLength("[clamp(10px,_50%,_100px)]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)
      ).toBe("clamp(10px, 50%, 100px)");
    });

    it("handles complex CSS functions", () => {
      expect(parseTailwindLength("[min(50vw,500px)]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe(
        "min(50vw,500px)"
      );
      expect(parseTailwindLength("[max(100px,10vw)]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe(
        "max(100px,10vw)"
      );
    });

    it("returns null for empty brackets", () => {
      expect(parseTailwindLength("[]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
      expect(parseTailwindLength("[  ]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("does not match incomplete brackets", () => {
      expect(parseTailwindLength("[100px", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
      expect(parseTailwindLength("100px]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("trims whitespace inside brackets", () => {
      expect(parseTailwindLength("[  100px  ]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe(
        "100px"
      );
    });
  });

  describe("arbitrary parens", () => {
    it("parses CSS variables with parens", () => {
      expect(parseTailwindLength("(--custom-width)", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe(
        "var(--custom-width)"
      );
      expect(parseTailwindLength("(--spacing-lg)", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe(
        "var(--spacing-lg)"
      );
    });

    it("parses plain values in parens", () => {
      expect(parseTailwindLength("(100px)", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("100px");
      expect(parseTailwindLength("(50%)", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("50%");
    });

    it("returns null for empty parens", () => {
      expect(parseTailwindLength("()", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
      expect(parseTailwindLength("(  )", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("does not match incomplete parens", () => {
      expect(parseTailwindLength("(100px", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
      expect(parseTailwindLength("100px)", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("trims whitespace inside parens", () => {
      expect(parseTailwindLength("(  100px  )", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe(
        "100px"
      );
    });

    it("handles CSS variable without -- prefix", () => {
      expect(parseTailwindLength("(custom)", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("custom");
    });
  });

  describe("numeric values", () => {
    it("converts integers to px values", () => {
      expect(parseTailwindLength("0", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("0px");
      expect(parseTailwindLength("1", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("4px");
      expect(parseTailwindLength("4", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("16px");
      expect(parseTailwindLength("8", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("32px");
      expect(parseTailwindLength("16", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("64px");
    });

    it("converts decimals to px values", () => {
      expect(parseTailwindLength("0.5", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("2px");
      expect(parseTailwindLength("1.5", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("6px");
      expect(parseTailwindLength("2.5", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("10px");
    });

    it("rounds decimal results correctly", () => {
      expect(parseTailwindLength("0.333", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("1.332px");
    });

    it("removes trailing zeros", () => {
      expect(parseTailwindLength("2", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("8px");
      expect(parseTailwindLength("2.0", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("8px");
    });

    it("returns null for negative numbers", () => {
      expect(parseTailwindLength("-1", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
      expect(parseTailwindLength("-4", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("returns null for invalid numbers", () => {
      expect(parseTailwindLength("abc", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
      expect(parseTailwindLength("12abc", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("returns null for NaN", () => {
      expect(parseTailwindLength("NaN", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("returns null for Infinity", () => {
      expect(parseTailwindLength("Infinity", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("works with different base spacing", () => {
      expect(parseTailwindLength("4", 8, DEFAULT_BREAKPOINTS)).toBe("32px");
      expect(parseTailwindLength("4", 2, DEFAULT_BREAKPOINTS)).toBe("8px");
    });
  });

  describe("special values", () => {
    it("returns null for auto", () => {
      expect(parseTailwindLength("auto", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("returns null for full", () => {
      expect(parseTailwindLength("full", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBeNull();
    });

    it("parses fraction values", () => {
      expect(parseTailwindLength("1/2", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("50%");
      expect(parseTailwindLength("1/3", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("33.333333%");
      expect(parseTailwindLength("2/3", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("66.666667%");
      expect(parseTailwindLength("3/4", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("75%");
    });
  });

  describe("viewport units", () => {
    it("parses dvw/svw/lvw", () => {
      expect(parseTailwindLength("dvw", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("100dvw");
      expect(parseTailwindLength("svw", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("100svw");
      expect(parseTailwindLength("lvw", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("100lvw");
    });

    it("parses dvh/svh/lvh", () => {
      expect(parseTailwindLength("dvh", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("100dvh");
      expect(parseTailwindLength("svh", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("100svh");
      expect(parseTailwindLength("lvh", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("100lvh");
    });
  });

  describe("parsing priority", () => {
    it("custom spacing takes precedence over screen values", () => {
      const customSpacing = { screen: "custom-screen" };
      expect(
        parseTailwindLength("screen", BASE_SPACING_PX, DEFAULT_BREAKPOINTS, customSpacing)
      ).toBe("custom-screen");
    });

    it("custom spacing takes precedence over numeric values", () => {
      const customSpacing = { "4": "custom-4" };
      expect(parseTailwindLength("4", BASE_SPACING_PX, DEFAULT_BREAKPOINTS, customSpacing)).toBe(
        "custom-4"
      );
    });

    it("screen values take precedence over arbitrary values", () => {
      // screen-md should match before falling through to other parsers
      expect(parseTailwindLength("screen-md", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("768px");
    });

    it("brackets take precedence over numeric values", () => {
      expect(parseTailwindLength("[4]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("4");
    });

    it("parens take precedence over numeric values", () => {
      expect(parseTailwindLength("(4)", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("4");
    });
  });

  describe("edge cases", () => {
    it("handles zero value", () => {
      expect(parseTailwindLength("0", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("0px");
    });

    it("handles very large numbers", () => {
      expect(parseTailwindLength("999", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("3996px");
    });

    it("handles very small decimals", () => {
      expect(parseTailwindLength("0.001", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("0.004px");
    });

    it("handles nested underscores in brackets", () => {
      expect(
        parseTailwindLength("[calc(100%_-_var(--spacing))]", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)
      ).toBe("calc(100% - var(--spacing))");
    });

    it("handles empty string as 0", () => {
      expect(parseTailwindLength("", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("0px");
    });

    it("handles strings with only whitespace as 0", () => {
      expect(parseTailwindLength("   ", BASE_SPACING_PX, DEFAULT_BREAKPOINTS)).toBe("0px");
    });
  });
});
