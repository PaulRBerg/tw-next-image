// Core inference

export { type Breakpoint, type BreakpointConfig, DEFAULT_BREAKPOINTS } from "./breakpoints.js";
export { inferImageSizes } from "./infer-sizes.js";
export type {
  CreateSmartImageOptions,
  SmartImageClassNameFn,
  SmartImageComponent,
  SmartImageProps,
} from "./smart-image/index.js";
// SmartImage component
export { createSmartImage, SmartImage } from "./smart-image/index.js";
export type { InferSizesInput, InferSizesStyle, SizeInfo, StaticImageData } from "./types.js";
