import { describe, expect, it } from "vitest";

import { DEFAULT_BREAKPOINTS } from "../breakpoints.js";
import type { SizeInfo } from "../types.js";
import { mergeStyleIntoSizeInfo, parseSizeInfoByBreakpoint } from "./size-info.js";

describe("parseSizeInfoByBreakpoint", () => {
  const baseSpacingPx = 4;

  it("returns empty object for undefined className", () => {
    const result = parseSizeInfoByBreakpoint(undefined, baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({});
  });

  it("returns empty object for empty string className", () => {
    const result = parseSizeInfoByBreakpoint("", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({});
  });

  it("returns empty object for whitespace-only className", () => {
    const result = parseSizeInfoByBreakpoint("   ", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({});
  });

  it("parses w- (width) utility", () => {
    const result = parseSizeInfoByBreakpoint("w-32", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      base: { width: "128px" },
    });
  });

  it("parses h- (height) utility", () => {
    const result = parseSizeInfoByBreakpoint("h-16", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      base: { height: "64px" },
    });
  });

  it("parses size- utility (sets both width and height)", () => {
    const result = parseSizeInfoByBreakpoint("size-24", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      base: { height: "96px", width: "96px" },
    });
  });

  it("parses max-w- (maxWidth) utility", () => {
    const result = parseSizeInfoByBreakpoint("max-w-64", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      base: { maxWidth: "256px" },
    });
  });

  it("parses max-h- (maxHeight) utility", () => {
    const result = parseSizeInfoByBreakpoint("max-h-48", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      base: { maxHeight: "192px" },
    });
  });

  it("parses multiple sizing utilities in same breakpoint", () => {
    const result = parseSizeInfoByBreakpoint(
      "w-32 h-16 max-w-64",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({
      base: { height: "64px", maxWidth: "256px", width: "128px" },
    });
  });

  it("parses width with breakpoint variant (sm:)", () => {
    const result = parseSizeInfoByBreakpoint("sm:w-32", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      sm: { width: "128px" },
    });
  });

  it("parses height with breakpoint variant (md:)", () => {
    const result = parseSizeInfoByBreakpoint("md:h-16", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      md: { height: "64px" },
    });
  });

  it("parses size with breakpoint variant (lg:)", () => {
    const result = parseSizeInfoByBreakpoint("lg:size-24", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      lg: { height: "96px", width: "96px" },
    });
  });

  it("parses utilities across multiple breakpoints", () => {
    const result = parseSizeInfoByBreakpoint(
      "w-32 sm:w-48 md:w-64",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({
      base: { width: "128px" },
      md: { width: "256px" },
      sm: { width: "192px" },
    });
  });

  it("combines multiple utilities per breakpoint", () => {
    const result = parseSizeInfoByBreakpoint(
      "w-32 h-16 sm:w-48 sm:h-24",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({
      base: { height: "64px", width: "128px" },
      sm: { height: "96px", width: "192px" },
    });
  });

  it("parses arbitrary value with brackets", () => {
    const result = parseSizeInfoByBreakpoint("w-[500px]", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      base: { width: "500px" },
    });
  });

  it("parses arbitrary value with underscores as spaces", () => {
    const result = parseSizeInfoByBreakpoint(
      "w-[calc(100%_-_2rem)]",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({
      base: { width: "calc(100% - 2rem)" },
    });
  });

  it("parses CSS variable with parentheses", () => {
    const result = parseSizeInfoByBreakpoint(
      "w-(--container-width)",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({
      base: { width: "var(--container-width)" },
    });
  });

  it("ignores w-auto (returns null for auto)", () => {
    const result = parseSizeInfoByBreakpoint("w-auto", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({});
  });

  it("ignores w-full (returns null for full)", () => {
    const result = parseSizeInfoByBreakpoint("w-full", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({});
  });

  it("parses utilities with fractions", () => {
    const result = parseSizeInfoByBreakpoint("w-1/2", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({ base: { width: "50%" } });
  });

  it("parses w-px (1px)", () => {
    const result = parseSizeInfoByBreakpoint("w-px", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      base: { width: "1px" },
    });
  });

  it("parses w-screen (100vw)", () => {
    const result = parseSizeInfoByBreakpoint("w-screen", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      base: { width: "100vw" },
    });
  });

  it("parses w-screen-sm (breakpoint width)", () => {
    const result = parseSizeInfoByBreakpoint("w-screen-sm", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      base: { width: "640px" },
    });
  });

  it("uses custom spacing values", () => {
    const customSpacing = { container: "1312px" };
    const result = parseSizeInfoByBreakpoint(
      "w-container",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS,
      customSpacing
    );
    expect(result).toEqual({
      base: { width: "1312px" },
    });
  });

  it("ignores non-sizing classes", () => {
    const result = parseSizeInfoByBreakpoint(
      "text-red-500 bg-blue-200 p-4",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({});
  });

  it("extracts only sizing classes from mixed className", () => {
    const result = parseSizeInfoByBreakpoint(
      "flex w-32 text-center h-16",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({
      base: { height: "64px", width: "128px" },
    });
  });

  it("handles extra whitespace between classes", () => {
    const result = parseSizeInfoByBreakpoint(
      "w-32   h-16    max-w-64",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({
      base: { height: "64px", maxWidth: "256px", width: "128px" },
    });
  });

  it("later utilities override earlier ones in same breakpoint", () => {
    const result = parseSizeInfoByBreakpoint("w-32 w-48", baseSpacingPx, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      base: { width: "192px" },
    });
  });

  it("handles conflicting utilities in same breakpoint variant", () => {
    const result = parseSizeInfoByBreakpoint(
      "md:w-32 md:w-48 md:h-16 md:h-24",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({
      md: { height: "96px", width: "192px" },
    });
  });

  it("size- utility overrides individual w-/h- when it comes later", () => {
    const result = parseSizeInfoByBreakpoint(
      "w-32 h-16 size-24",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({
      base: { height: "96px", width: "96px" },
    });
  });

  it("complex real-world example with multiple breakpoints and utilities", () => {
    const result = parseSizeInfoByBreakpoint(
      "w-64 h-48 max-w-96 sm:w-80 sm:h-60 md:size-96 lg:w-[800px] lg:h-[600px]",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({
      base: { height: "192px", maxWidth: "384px", width: "256px" },
      lg: { height: "600px", width: "800px" },
      md: { height: "384px", width: "384px" },
      sm: { height: "240px", width: "320px" },
    });
  });

  it("handles all breakpoint variants (sm, md, lg, xl, 2xl)", () => {
    const result = parseSizeInfoByBreakpoint(
      "w-16 sm:w-32 md:w-48 lg:w-64 xl:w-80 2xl:w-96",
      baseSpacingPx,
      DEFAULT_BREAKPOINTS
    );
    expect(result).toEqual({
      "2xl": { width: "384px" },
      base: { width: "64px" },
      lg: { width: "256px" },
      md: { width: "192px" },
      sm: { width: "128px" },
      xl: { width: "320px" },
    });
  });

  it("uses custom breakpoints configuration", () => {
    const customBreakpoints = { desktop: 1200, tablet: 800 };
    const result = parseSizeInfoByBreakpoint(
      "tablet:w-64 desktop:w-96",
      baseSpacingPx,
      customBreakpoints
    );
    expect(result).toEqual({
      desktop: { width: "384px" },
      tablet: { width: "256px" },
    });
  });

  it("respects custom base spacing value", () => {
    const customBaseSpacing = 8; // 8px instead of 4px
    const result = parseSizeInfoByBreakpoint("w-16", customBaseSpacing, DEFAULT_BREAKPOINTS);
    expect(result).toEqual({
      base: { width: "128px" }, // 16 * 8 = 128
    });
  });
});

describe("mergeStyleIntoSizeInfo", () => {
  it("does not modify info when style is undefined", () => {
    const info: SizeInfo = { width: "100px" };
    mergeStyleIntoSizeInfo(info, undefined);
    expect(info).toEqual({ width: "100px" });
  });

  it("does not modify info when style is empty object", () => {
    const info: SizeInfo = { width: "100px" };
    mergeStyleIntoSizeInfo(info, {});
    expect(info).toEqual({ width: "100px" });
  });

  it("merges style.width as number", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { width: 500 });
    expect(info).toEqual({ width: "500px" });
  });

  it("merges style.width as string with px", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { width: "500px" });
    expect(info).toEqual({ width: "500px" });
  });

  it("merges style.width with rem", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { width: "30rem" });
    expect(info).toEqual({ width: "30rem" });
  });

  it("merges style.maxWidth", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { maxWidth: "800px" });
    expect(info).toEqual({ maxWidth: "800px" });
  });

  it("merges style.height", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { height: 400 });
    expect(info).toEqual({ height: "400px" });
  });

  it("merges style.maxHeight", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { maxHeight: "600px" });
    expect(info).toEqual({ maxHeight: "600px" });
  });

  it("merges all style properties at once", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, {
      height: "400px",
      maxHeight: "600px",
      maxWidth: "800px",
      width: "500px",
    });
    expect(info).toEqual({
      height: "400px",
      maxHeight: "600px",
      maxWidth: "800px",
      width: "500px",
    });
  });

  it("overrides existing info properties with style values", () => {
    const info: SizeInfo = { height: "200px", width: "300px" };
    mergeStyleIntoSizeInfo(info, { height: "400px", width: "500px" });
    expect(info).toEqual({ height: "400px", width: "500px" });
  });

  it("preserves existing info properties not in style", () => {
    const info: SizeInfo = { height: "200px", maxWidth: "700px", width: "300px" };
    mergeStyleIntoSizeInfo(info, { width: "500px" });
    expect(info).toEqual({ height: "200px", maxWidth: "700px", width: "500px" });
  });

  it("ignores undefined style values", () => {
    const info: SizeInfo = { width: "300px" };
    mergeStyleIntoSizeInfo(info, { height: undefined, width: undefined });
    expect(info).toEqual({ width: "300px" });
  });

  it("ignores auto style values", () => {
    const info: SizeInfo = { width: "300px" };
    mergeStyleIntoSizeInfo(info, { height: "auto", width: "auto" });
    expect(info).toEqual({ width: "300px" });
  });

  it("ignores empty string style values", () => {
    const info: SizeInfo = { width: "300px" };
    mergeStyleIntoSizeInfo(info, { height: "", width: "" });
    expect(info).toEqual({ width: "300px" });
  });

  it("merges calc() values", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { width: "calc(100% - 2rem)" });
    expect(info).toEqual({ width: "calc(100% - 2rem)" });
  });

  it("merges CSS variable values", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { width: "var(--container-width)" });
    expect(info).toEqual({ width: "var(--container-width)" });
  });

  it("merges min() values", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { width: "min(100%, 800px)" });
    expect(info).toEqual({ width: "min(100%, 800px)" });
  });

  it("merges max() values", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { width: "max(50vw, 400px)" });
    expect(info).toEqual({ width: "max(50vw, 400px)" });
  });

  it("merges clamp() values", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { width: "clamp(300px, 50vw, 800px)" });
    expect(info).toEqual({ width: "clamp(300px, 50vw, 800px)" });
  });

  it("merges viewport units (vw, vh, vmin, vmax)", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, {
      height: "50vh",
      maxHeight: "80vmax",
      maxWidth: "90vmin",
      width: "100vw",
    });
    expect(info).toEqual({
      height: "50vh",
      maxHeight: "80vmax",
      maxWidth: "90vmin",
      width: "100vw",
    });
  });

  it("partial merge preserves unaffected properties", () => {
    const info: SizeInfo = {
      height: "200px",
      maxHeight: "400px",
      maxWidth: "600px",
      width: "300px",
    };
    mergeStyleIntoSizeInfo(info, { maxWidth: "800px", width: "500px" });
    expect(info).toEqual({
      height: "200px",
      maxHeight: "400px",
      maxWidth: "800px",
      width: "500px",
    });
  });

  it("handles floating point number values", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { height: 123.456, width: 789.012 });
    expect(info).toEqual({ height: "123.456px", width: "789.012px" });
  });

  it("handles zero values", () => {
    const info: SizeInfo = {};
    mergeStyleIntoSizeInfo(info, { height: 0, width: 0 });
    expect(info).toEqual({ height: "0px", width: "0px" });
  });

  it("ignores invalid string values", () => {
    const info: SizeInfo = { width: "300px" };
    mergeStyleIntoSizeInfo(info, { height: "invalid", width: "not-a-size" });
    expect(info).toEqual({ width: "300px" });
  });

  it("real-world inline style override", () => {
    const info: SizeInfo = { height: "192px", width: "256px" };
    mergeStyleIntoSizeInfo(info, {
      height: "auto",
      maxWidth: "800px",
      width: "clamp(300px, 50vw, 800px)",
    });
    expect(info).toEqual({
      height: "192px", // auto is ignored
      maxWidth: "800px",
      width: "clamp(300px, 50vw, 800px)",
    });
  });
});
