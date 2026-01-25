import { describe, expect, test } from "vitest";
import { inferImageSizes } from "./infer-sizes.js";

describe("inferImageSizes", () => {
  test("infers fixed size from `size-*`", () => {
    expect(inferImageSizes({ className: "size-11" })).toBe("44px");
  });

  test("infers fixed size from `w-*`", () => {
    expect(inferImageSizes({ className: "w-75" })).toBe("300px");
  });

  test("infers responsive sizes from breakpoint variants", () => {
    expect(inferImageSizes({ className: "size-25 lg:size-30" })).toBe(
      "(min-width: 1024px) 120px, 100px"
    );
  });

  test("prefers `max-w-*` when width is fluid", () => {
    expect(inferImageSizes({ className: "w-full max-w-50" })).toBe("200px");
  });

  test("supports arbitrary values", () => {
    expect(inferImageSizes({ className: "w-[350px]" })).toBe("350px");
  });

  test("preserves max-width constraints for mixed units", () => {
    expect(inferImageSizes({ className: "w-[50%] max-w-80" })).toBe("min(50%, 320px)");
  });

  test("style.width overrides class-derived sizing", () => {
    expect(inferImageSizes({ className: "size-11", style: { width: 80 } })).toBe("80px");
  });

  test("derives width from height + ratio", () => {
    expect(inferImageSizes({ className: "h-10", ratio: 2 })).toBe("80px");
  });

  test("respects max-height when deriving width from height + ratio", () => {
    expect(inferImageSizes({ className: "h-20 max-h-10", ratio: 2 })).toBe("80px");
  });

  test("respects min-height when deriving width from height + ratio", () => {
    expect(inferImageSizes({ className: "h-10 min-h-20", ratio: 2 })).toBe("160px");
  });

  test("returns null when it cannot infer", () => {
    expect(inferImageSizes({ className: "w-full" })).toBeNull();
  });

  test("supports custom breakpoints", () => {
    const breakpoints = { lg: 1200, md: 768, sm: 480 };
    expect(inferImageSizes({ breakpoints, className: "w-10 lg:w-20" })).toBe(
      "(min-width: 1200px) 80px, 40px"
    );
  });

  test("supports custom spacing", () => {
    const customSpacing = { container: "1312px" };
    expect(inferImageSizes({ className: "w-container", customSpacing })).toBe("1312px");
  });

  test("respects min-width when width is explicit", () => {
    expect(inferImageSizes({ className: "w-10 min-w-20" })).toBe("80px");
  });

  test("applies base min-width constraints at breakpoints", () => {
    expect(inferImageSizes({ className: "w-30 min-w-20 lg:w-10" })).toBe(
      "(min-width: 1024px) 80px, 120px"
    );
  });

  test("uses style aspect ratio for inference", () => {
    expect(inferImageSizes({ className: "h-10", style: { aspectRatio: "2" } })).toBe("80px");
  });

  test("infers aspect ratio from aspect-video class", () => {
    expect(inferImageSizes({ className: "h-10 aspect-video" })).toBe("71.111px");
  });

  test("infers aspect ratio from aspect-square class", () => {
    expect(inferImageSizes({ className: "h-10 aspect-square" })).toBe("40px");
  });

  test("infers aspect ratio from arbitrary aspect class", () => {
    expect(inferImageSizes({ className: "h-10 aspect-[4/3]" })).toBe("53.333px");
  });

  test("infers aspect ratio from static image data", () => {
    const src = { height: 1080, width: 1920 };
    expect(inferImageSizes({ className: "h-10", src })).toBe("71.111px");
  });
});
