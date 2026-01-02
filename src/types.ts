import type { BreakpointConfig } from "./breakpoints.js";

export type InferSizesStyle = Partial<{
  width: number | string | null | undefined;
  maxWidth: number | string | null | undefined;
  height: number | string | null | undefined;
  maxHeight: number | string | null | undefined;
}>;

export type InferSizesInput = {
  /**
   * Optional override for Tailwind's base spacing unit in px.
   * Tailwind v4 defaults to 4px (0.25rem).
   */
  baseSpacingPx?: number;
  /**
   * Optional custom breakpoints configuration.
   * Defaults to standard Tailwind CSS v4 breakpoints.
   */
  breakpoints?: BreakpointConfig;
  className?: string;
  /**
   * Optional custom spacing values (e.g., `{ container: "1312px" }`).
   * Used for named Tailwind utilities like `w-container`.
   */
  customSpacing?: Record<string, string>;
  /**
   * Optional width-to-height ratio (e.g., `16 / 9` for landscape, `9 / 16` for portrait).
   * Used only when width is not inferable but height is.
   * This is a last-resort escape hatch for layouts like `h-10 w-auto`.
   */
  ratio?: number;
  /**
   * Optional image src (e.g. imported static image) used to infer aspect ratio.
   */
  src?: unknown;
  style?: InferSizesStyle;
};

export type SizeInfo = {
  height?: string;
  maxHeight?: string;
  maxWidth?: string;
  width?: string;
};

export type StaticImageData = {
  height: number;
  width: number;
};
