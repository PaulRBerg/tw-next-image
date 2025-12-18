/**
 * Standalone subpath export (`tw-next-image/infer-sizes`) for React-free usage.
 * Use this entry point in server-side code or non-React projects.
 */
export { type Breakpoint, type BreakpointConfig, DEFAULT_BREAKPOINTS } from "../breakpoints.js";
export { inferImageSizes } from "../infer-sizes.js";
export type { InferSizesInput, InferSizesStyle, SizeInfo, StaticImageData } from "../types.js";
