import { describe, expect, it } from "vitest";
import { getAspectRatioFromClassName, getSrcAspectRatio } from "./aspect-ratio.js";

describe("getSrcAspectRatio", () => {
  it("returns aspect ratio from valid StaticImageData", () => {
    const src = { height: 1080, width: 1920 };
    expect(getSrcAspectRatio(src)).toBeCloseTo(16 / 9);
  });

  it("returns aspect ratio from StaticImageData with width 100 height 50", () => {
    const src = { height: 50, width: 100 };
    expect(getSrcAspectRatio(src)).toBe(2);
  });

  it("returns aspect ratio from nested .default property", () => {
    const src = { default: { height: 600, width: 800 } };
    expect(getSrcAspectRatio(src)).toBeCloseTo(4 / 3);
  });

  it("returns null when height is zero", () => {
    const src = { height: 0, width: 1920 };
    expect(getSrcAspectRatio(src)).toBeNull();
  });

  it("returns null when .default height is zero", () => {
    const src = { default: { height: 0, width: 1920 } };
    expect(getSrcAspectRatio(src)).toBeNull();
  });

  it("returns null for null input", () => {
    expect(getSrcAspectRatio(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(getSrcAspectRatio(undefined)).toBeNull();
  });

  it("returns null for empty object", () => {
    expect(getSrcAspectRatio({})).toBeNull();
  });

  it("returns null for object missing width", () => {
    const src = { height: 1080 };
    expect(getSrcAspectRatio(src)).toBeNull();
  });

  it("returns null for object missing height", () => {
    const src = { width: 1920 };
    expect(getSrcAspectRatio(src)).toBeNull();
  });

  it("returns null for object with non-numeric dimensions", () => {
    const src = { height: "1080", width: "1920" };
    expect(getSrcAspectRatio(src)).toBeNull();
  });

  it("returns null for string input", () => {
    expect(getSrcAspectRatio("image.jpg")).toBeNull();
  });

  it("returns null for number input", () => {
    expect(getSrcAspectRatio(123)).toBeNull();
  });

  it("returns null when .default is not StaticImageData", () => {
    const src = { default: { height: 600, width: "800" } };
    expect(getSrcAspectRatio(src)).toBeNull();
  });

  it("returns null when .default is missing height", () => {
    const src = { default: { width: 800 } };
    expect(getSrcAspectRatio(src)).toBeNull();
  });

  it("rejects negative dimensions", () => {
    expect(getSrcAspectRatio({ height: -100, width: -200 })).toBeNull();
    expect(getSrcAspectRatio({ height: 100, width: -200 })).toBeNull();
    expect(getSrcAspectRatio({ height: -100, width: 200 })).toBeNull();
  });

  it("returns null for array input (not a valid StaticImageData)", () => {
    expect(getSrcAspectRatio([1920, 1080])).toBeNull();
  });

  it("handles square image", () => {
    const src = { height: 500, width: 500 };
    expect(getSrcAspectRatio(src)).toBe(1);
  });

  it("handles portrait orientation", () => {
    const src = { height: 1920, width: 1080 };
    expect(getSrcAspectRatio(src)).toBeCloseTo(9 / 16);
  });
});

describe("getAspectRatioFromClassName", () => {
  it("returns null for undefined className", () => {
    expect(getAspectRatioFromClassName(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getAspectRatioFromClassName("")).toBeNull();
  });

  it("returns null for className with no aspect ratio", () => {
    expect(getAspectRatioFromClassName("w-full h-auto")).toBeNull();
  });

  it("returns 1 for aspect-square", () => {
    expect(getAspectRatioFromClassName("aspect-square")).toBe(1);
  });

  it("returns 16/9 for aspect-video", () => {
    expect(getAspectRatioFromClassName("aspect-video")).toBeCloseTo(16 / 9);
  });

  it("parses built-in fraction utilities", () => {
    expect(getAspectRatioFromClassName("aspect-16/9")).toBeCloseTo(16 / 9);
    expect(getAspectRatioFromClassName("aspect-3/2")).toBeCloseTo(3 / 2);
  });

  it("parses arbitrary ratio with slash notation", () => {
    expect(getAspectRatioFromClassName("aspect-[4/3]")).toBeCloseTo(4 / 3);
  });

  it("parses arbitrary ratio with decimal notation", () => {
    expect(getAspectRatioFromClassName("aspect-[1.5]")).toBe(1.5);
  });

  it("parses arbitrary ratio with integer notation", () => {
    expect(getAspectRatioFromClassName("aspect-[2]")).toBe(2);
  });

  it("handles underscores in arbitrary values as spaces", () => {
    expect(getAspectRatioFromClassName("aspect-[16_/_9]")).toBeCloseTo(16 / 9);
  });

  it("returns first valid aspect ratio when multiple classes present", () => {
    expect(getAspectRatioFromClassName("w-full aspect-square h-auto")).toBe(1);
  });

  it("handles aspect ratio with responsive variants", () => {
    expect(getAspectRatioFromClassName("md:aspect-video")).toBeCloseTo(16 / 9);
  });

  it("handles aspect ratio with multiple variants", () => {
    expect(getAspectRatioFromClassName("hover:md:aspect-square")).toBe(1);
  });

  it("returns null for invalid arbitrary ratio with zero denominator", () => {
    expect(getAspectRatioFromClassName("aspect-[4/0]")).toBeNull();
  });

  it("returns null for arbitrary ratio with zero value", () => {
    expect(getAspectRatioFromClassName("aspect-[0]")).toBeNull();
  });

  it("returns null for invalid arbitrary ratio format", () => {
    expect(getAspectRatioFromClassName("aspect-[invalid]")).toBeNull();
  });

  it("returns null for empty arbitrary value", () => {
    expect(getAspectRatioFromClassName("aspect-[]")).toBeNull();
  });

  it("handles whitespace-separated classes", () => {
    expect(
      getAspectRatioFromClassName("flex items-center aspect-video justify-center")
    ).toBeCloseTo(16 / 9);
  });

  it("handles multiple whitespace between classes", () => {
    expect(getAspectRatioFromClassName("flex    aspect-square    w-full")).toBe(1);
  });

  it("handles tabs and newlines in className", () => {
    expect(getAspectRatioFromClassName("flex\taspect-square\nw-full")).toBe(1);
  });

  it("parses complex arbitrary ratio", () => {
    expect(getAspectRatioFromClassName("aspect-[21/9]")).toBeCloseTo(21 / 9);
  });

  it("handles arbitrary ratio with spaces around slash", () => {
    expect(getAspectRatioFromClassName("aspect-[16_/_9]")).toBeCloseTo(16 / 9);
  });

  it("returns null for non-numeric arbitrary ratio parts", () => {
    expect(getAspectRatioFromClassName("aspect-[abc/def]")).toBeNull();
  });

  it("returns null for arbitrary ratio with only numerator", () => {
    expect(getAspectRatioFromClassName("aspect-[16/]")).toBeNull();
  });

  // Malformed input that shouldn't occur in real usage.
  it("rejects malformed arbitrary ratio with only denominator", () => {
    expect(getAspectRatioFromClassName("aspect-[/9]")).toBeNull();
  });

  it("handles arbitrary ratio with decimal parts", () => {
    expect(getAspectRatioFromClassName("aspect-[1.5/2.5]")).toBeCloseTo(1.5 / 2.5);
  });

  it("returns first valid ratio when multiple aspect classes present", () => {
    expect(getAspectRatioFromClassName("aspect-square aspect-video")).toBe(1);
  });

  it("skips invalid aspect class and finds valid one", () => {
    expect(getAspectRatioFromClassName("aspect-[invalid] aspect-video")).toBeCloseTo(16 / 9);
  });

  it("rejects negative arbitrary values", () => {
    expect(getAspectRatioFromClassName("aspect-[-1]")).toBeNull();
    expect(getAspectRatioFromClassName("aspect-[-16/9]")).toBeNull();
  });

  it("parses very small arbitrary ratio", () => {
    expect(getAspectRatioFromClassName("aspect-[0.1]")).toBe(0.1);
  });

  it("parses very large arbitrary ratio", () => {
    expect(getAspectRatioFromClassName("aspect-[1000]")).toBe(1000);
  });

  it("handles scientific notation in arbitrary value", () => {
    expect(getAspectRatioFromClassName("aspect-[1e2]")).toBe(100);
  });

  it("returns null for Infinity", () => {
    expect(getAspectRatioFromClassName("aspect-[Infinity]")).toBeNull();
  });

  it("returns null for NaN in arbitrary value", () => {
    expect(getAspectRatioFromClassName("aspect-[NaN]")).toBeNull();
  });
});
