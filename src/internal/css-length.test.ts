import { describe, expect, it } from "vitest";
import { formatPx, minPx, parsePxNumber, parseStyleLength } from "./css-length.js";

describe("parseStyleLength", () => {
  it("returns null for null", () => {
    expect(parseStyleLength(null)).toBe(null);
  });

  it("returns null for undefined", () => {
    expect(parseStyleLength(undefined)).toBe(null);
  });

  it("returns null for empty string", () => {
    expect(parseStyleLength("")).toBe(null);
  });

  it("returns null for whitespace only", () => {
    expect(parseStyleLength("   ")).toBe(null);
    expect(parseStyleLength("\t")).toBe(null);
    expect(parseStyleLength("\n")).toBe(null);
  });

  it("returns null for 'auto'", () => {
    expect(parseStyleLength("auto")).toBe(null);
  });

  it("returns null for 'auto' with whitespace", () => {
    expect(parseStyleLength("  auto  ")).toBe(null);
  });

  it("converts number to px string", () => {
    expect(parseStyleLength(100)).toBe("100px");
    expect(parseStyleLength(0)).toBe("0px");
    expect(parseStyleLength(1.5)).toBe("1.5px");
  });

  it("parses px literals", () => {
    expect(parseStyleLength("100px")).toBe("100px");
    expect(parseStyleLength("0px")).toBe("0px");
    expect(parseStyleLength("1.5px")).toBe("1.5px");
    expect(parseStyleLength("999.999px")).toBe("999.999px");
  });

  it("parses rem literals", () => {
    expect(parseStyleLength("1rem")).toBe("1rem");
    expect(parseStyleLength("2.5rem")).toBe("2.5rem");
    expect(parseStyleLength("0rem")).toBe("0rem");
  });

  it("parses em literals", () => {
    expect(parseStyleLength("1em")).toBe("1em");
    expect(parseStyleLength("0.5em")).toBe("0.5em");
  });

  it.each([
    ["100vw", "100vw"],
    ["50vh", "50vh"],
    ["10vmin", "10vmin"],
    ["90vmax", "90vmax"],
  ] as const)("parses viewport unit %s", (input, expected) => {
    expect(parseStyleLength(input)).toBe(expected);
  });

  it("trims whitespace from valid lengths", () => {
    expect(parseStyleLength("  100px  ")).toBe("100px");
    expect(parseStyleLength("\t2rem\n")).toBe("2rem");
  });

  it("parses calc() functions", () => {
    expect(parseStyleLength("calc(100% - 20px)")).toBe("calc(100% - 20px)");
    expect(parseStyleLength("calc(50vw + 10rem)")).toBe("calc(50vw + 10rem)");
    expect(parseStyleLength("calc(100px)")).toBe("calc(100px)");
  });

  it("parses min() functions", () => {
    expect(parseStyleLength("min(100px, 50vw)")).toBe("min(100px, 50vw)");
    expect(parseStyleLength("min(1rem, 2rem, 3rem)")).toBe("min(1rem, 2rem, 3rem)");
  });

  it("parses max() functions", () => {
    expect(parseStyleLength("max(100px, 50vw)")).toBe("max(100px, 50vw)");
    expect(parseStyleLength("max(1rem, 2rem)")).toBe("max(1rem, 2rem)");
  });

  it("parses clamp() functions", () => {
    expect(parseStyleLength("clamp(100px, 50vw, 200px)")).toBe("clamp(100px, 50vw, 200px)");
    expect(parseStyleLength("clamp(1rem, 2vw, 3rem)")).toBe("clamp(1rem, 2vw, 3rem)");
  });

  it("parses CSS variables", () => {
    expect(parseStyleLength("var(--width)")).toBe("var(--width)");
    expect(parseStyleLength("var(--my-custom-width)")).toBe("var(--my-custom-width)");
    expect(parseStyleLength("var(--width, 100px)")).toBe("var(--width, 100px)");
  });

  it("returns null for invalid units", () => {
    expect(parseStyleLength("100pt")).toBe(null);
    expect(parseStyleLength("100cm")).toBe(null);
    expect(parseStyleLength("100%")).toBe(null);
  });

  it("returns null for missing units", () => {
    expect(parseStyleLength("100")).toBe(null);
    expect(parseStyleLength("1.5")).toBe(null);
  });

  // CSS width/height cannot be negative, so the regex intentionally rejects them
  it("returns null for invalid formats", () => {
    expect(parseStyleLength("abc")).toBe(null);
    expect(parseStyleLength("px100")).toBe(null);
    expect(parseStyleLength("100 px")).toBe(null);
    expect(parseStyleLength("-100px")).toBe(null);
  });

  it("returns null for malformed functions", () => {
    expect(parseStyleLength("calc(")).toBe(null);
    expect(parseStyleLength("min(100px")).toBe(null);
    expect(parseStyleLength("unknown(100px)")).toBe(null);
  });

  it("returns null for malformed variables", () => {
    expect(parseStyleLength("var(")).toBe(null);
    expect(parseStyleLength("var()")).toBe(null);
  });
});

describe("parsePxNumber", () => {
  it("parses integer px values", () => {
    expect(parsePxNumber("100px")).toBe(100);
    expect(parsePxNumber("0px")).toBe(0);
    expect(parsePxNumber("999px")).toBe(999);
  });

  it("parses decimal px values", () => {
    expect(parsePxNumber("1.5px")).toBe(1.5);
    expect(parsePxNumber("100.25px")).toBe(100.25);
    expect(parsePxNumber("0.1px")).toBe(0.1);
  });

  it("returns null for non-px units", () => {
    expect(parsePxNumber("100rem")).toBe(null);
    expect(parsePxNumber("50vw")).toBe(null);
    expect(parsePxNumber("1em")).toBe(null);
  });

  it("returns null for missing units", () => {
    expect(parsePxNumber("100")).toBe(null);
    expect(parsePxNumber("1.5")).toBe(null);
  });

  it("returns null for invalid formats", () => {
    expect(parsePxNumber("px100")).toBe(null);
    expect(parsePxNumber("100 px")).toBe(null);
    expect(parsePxNumber("abc")).toBe(null);
    expect(parsePxNumber("")).toBe(null);
  });

  it("returns null for negative values", () => {
    expect(parsePxNumber("-100px")).toBe(null);
    expect(parsePxNumber("-1.5px")).toBe(null);
  });

  it("returns null for functions", () => {
    expect(parsePxNumber("calc(100px)")).toBe(null);
    expect(parsePxNumber("min(100px, 200px)")).toBe(null);
  });

  it("returns null for variables", () => {
    expect(parsePxNumber("var(--width)")).toBe(null);
  });
});

describe("formatPx", () => {
  it("formats integer values", () => {
    expect(formatPx(100)).toBe("100px");
    expect(formatPx(0)).toBe("0px");
    expect(formatPx(999)).toBe("999px");
  });

  it("formats decimal values", () => {
    expect(formatPx(1.5)).toBe("1.5px");
    expect(formatPx(100.25)).toBe("100.25px");
    expect(formatPx(0.1)).toBe("0.1px");
  });

  it("removes trailing zeroes", () => {
    expect(formatPx(1.0)).toBe("1px");
    expect(formatPx(100.0)).toBe("100px");
    expect(formatPx(1.5)).toBe("1.5px");
    expect(formatPx(1.1)).toBe("1.1px");
  });

  it("rounds to 3 decimal places", () => {
    expect(formatPx(1.2345)).toBe("1.235px");
    expect(formatPx(100.9999)).toBe("101px");
    expect(formatPx(0.1234)).toBe("0.123px");
    expect(formatPx(1.0005)).toBe("1.001px");
  });

  it("handles very small values", () => {
    expect(formatPx(0.001)).toBe("0.001px");
    expect(formatPx(0.0001)).toBe("0px");
    expect(formatPx(0.0005)).toBe("0.001px");
  });

  it("handles large values", () => {
    expect(formatPx(99_999)).toBe("99999px");
    expect(formatPx(1234.5678)).toBe("1234.568px");
  });

  it("handles negative values", () => {
    expect(formatPx(-100)).toBe("-100px");
    expect(formatPx(-1.5)).toBe("-1.5px");
    expect(formatPx(-0.001)).toBe("-0.001px");
  });
});

describe("minPx", () => {
  it("returns minimum of two px values", () => {
    expect(minPx("100px", "200px")).toBe("100px");
    expect(minPx("200px", "100px")).toBe("100px");
    expect(minPx("50px", "50px")).toBe("50px");
  });

  it("handles decimal values", () => {
    expect(minPx("1.5px", "2.5px")).toBe("1.5px");
    expect(minPx("100.25px", "100.75px")).toBe("100.25px");
    expect(minPx("0.1px", "0.2px")).toBe("0.1px");
  });

  it("handles zero values", () => {
    expect(minPx("0px", "100px")).toBe("0px");
    expect(minPx("100px", "0px")).toBe("0px");
    expect(minPx("0px", "0px")).toBe("0px");
  });

  it("returns null when first value is not px", () => {
    expect(minPx("100rem", "200px")).toBe(null);
    expect(minPx("50vw", "100px")).toBe(null);
    expect(minPx("calc(100px)", "200px")).toBe(null);
  });

  it("returns null when second value is not px", () => {
    expect(minPx("100px", "200rem")).toBe(null);
    expect(minPx("100px", "50vw")).toBe(null);
    expect(minPx("100px", "var(--width)")).toBe(null);
  });

  it("returns null when both values are not px", () => {
    expect(minPx("100rem", "50vw")).toBe(null);
    expect(minPx("calc(100px)", "var(--width)")).toBe(null);
  });

  it("returns null for invalid inputs", () => {
    expect(minPx("", "100px")).toBe(null);
    expect(minPx("100px", "")).toBe(null);
    expect(minPx("abc", "100px")).toBe(null);
    expect(minPx("100px", "xyz")).toBe(null);
  });

  it("applies rounding and formatting", () => {
    expect(minPx("1.2345px", "1.2346px")).toBe("1.235px");
    expect(minPx("100.0px", "200.0px")).toBe("100px");
    expect(minPx("1.1111px", "2.2222px")).toBe("1.111px");
  });

  it("handles large values", () => {
    expect(minPx("99999px", "100000px")).toBe("99999px");
    expect(minPx("1234.5678px", "1234.5679px")).toBe("1234.568px");
  });
});
