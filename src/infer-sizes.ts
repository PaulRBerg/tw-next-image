import type { BreakpointConfig } from "./breakpoints.js";
import { DEFAULT_BREAKPOINTS } from "./breakpoints.js";
import { getAspectRatioFromClassName, getSrcAspectRatio } from "./internal/aspect-ratio.js";
import {
  formatPx,
  maxPx,
  minPx,
  parsePxNumber,
  parseStyleAspectRatio,
} from "./internal/css-length.js";
import { mergeStyleIntoSizeInfo, parseSizeInfoByBreakpoint } from "./internal/size-info.js";
import type { InferSizesInput, SizeInfo } from "./types.js";

const DEFAULT_BASE_SPACING_PX = 4;
type SizeConstraints = Pick<SizeInfo, "minWidth" | "maxWidth" | "minHeight" | "maxHeight">;

function applyMinMax(
  value: string,
  minValue: string | undefined,
  maxValue: string | undefined
): string {
  if (minValue && maxValue) {
    const minPxValue = parsePxNumber(minValue);
    const maxPxValue = parsePxNumber(maxValue);
    const valuePx = parsePxNumber(value);
    if (minPxValue !== null && maxPxValue !== null && valuePx !== null) {
      const clamped = Math.min(Math.max(valuePx, minPxValue), maxPxValue);
      return formatPx(clamped);
    }
    return `clamp(${minValue}, ${value}, ${maxValue})`;
  }

  if (minValue) {
    return maxPx(value, minValue) ?? `max(${value}, ${minValue})`;
  }

  if (maxValue) {
    return minPx(value, maxValue) ?? `min(${value}, ${maxValue})`;
  }

  return value;
}

function resolveHeightPx(info: SizeInfo): number | null {
  const heightPx = info.height ? parsePxNumber(info.height) : null;
  const minHeightPx = info.minHeight ? parsePxNumber(info.minHeight) : null;
  const maxHeightPx = info.maxHeight ? parsePxNumber(info.maxHeight) : null;

  if (heightPx !== null) {
    let resolved = heightPx;
    if (minHeightPx !== null) {
      resolved = Math.max(resolved, minHeightPx);
    }
    if (maxHeightPx !== null) {
      resolved = Math.min(resolved, maxHeightPx);
    }
    return resolved;
  }

  if (maxHeightPx !== null) {
    let resolved = maxHeightPx;
    if (minHeightPx !== null) {
      resolved = Math.max(resolved, minHeightPx);
    }
    return resolved;
  }

  return null;
}

function computeResolvedWidth(info: SizeInfo, aspectRatio: number | null): string | null {
  if (info.width) {
    return applyMinMax(info.width, info.minWidth, info.maxWidth);
  }

  if (info.maxWidth) {
    return info.maxWidth;
  }

  if (!aspectRatio) {
    return null;
  }

  const heightPx = resolveHeightPx(info);
  if (heightPx === null) {
    return null;
  }

  return applyMinMax(formatPx(heightPx * aspectRatio), info.minWidth, info.maxWidth);
}

function getBaseConstraints(info: SizeInfo): SizeConstraints {
  return {
    maxHeight: info.maxHeight,
    maxWidth: info.maxWidth,
    minHeight: info.minHeight,
    minWidth: info.minWidth,
  };
}

function buildBreakpointConditions(
  byBreakpoint: Partial<Record<string, SizeInfo>>,
  aspectRatio: number | null,
  breakpoints: BreakpointConfig,
  baseConstraints: SizeConstraints
): string[] {
  const conditions: string[] = [];
  const orderedBreakpoints = (Object.entries(breakpoints) as [string, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  for (const [breakpoint, minWidthPx] of orderedBreakpoints) {
    const sizeInfo = byBreakpoint[breakpoint];
    if (!sizeInfo) {
      continue;
    }
    const resolvedWidth = computeResolvedWidth({ ...baseConstraints, ...sizeInfo }, aspectRatio);
    if (!resolvedWidth) {
      continue;
    }
    conditions.push(`(min-width: ${minWidthPx}px) ${resolvedWidth}`);
  }

  return conditions;
}

/**
 * Infer a Next.js `sizes` string from Tailwind sizing utilities applied to the wrapper.
 *
 * Supports:
 * - `size-*`, `w-*`, `min-w-*`, `max-w-*` (with responsive prefixes like `lg:`)
 * - `h-*`, `min-h-*`, `max-h-*` (for ratio-based inference)
 * - Arbitrary values: `w-[350px]`, `max-w-[calc(100vw-640px)]`
 * - Inline styles: `style={{ width: 120, minWidth: 80, aspectRatio: 1.5 }}`
 *
 * Returns `null` when inference is not possible.
 */
export function inferImageSizes({
  className,
  style,
  ratio,
  baseSpacingPx = DEFAULT_BASE_SPACING_PX,
  src,
  breakpoints = DEFAULT_BREAKPOINTS,
  customSpacing = {},
}: InferSizesInput): string | null {
  const byBreakpoint = parseSizeInfoByBreakpoint(
    className,
    baseSpacingPx,
    breakpoints,
    customSpacing
  );

  const baseInfo: SizeInfo = { ...(byBreakpoint.base ?? {}) };
  mergeStyleIntoSizeInfo(baseInfo, style);

  const baseConstraints = getBaseConstraints(baseInfo);
  const aspectRatio =
    ratio ??
    parseStyleAspectRatio(style?.aspectRatio) ??
    getSrcAspectRatio(src) ??
    getAspectRatioFromClassName(className);

  const resolvedBase = computeResolvedWidth(baseInfo, aspectRatio);
  if (!resolvedBase) {
    return null;
  }

  const conditions = buildBreakpointConditions(
    byBreakpoint,
    aspectRatio,
    breakpoints,
    baseConstraints
  );
  return conditions.length === 0 ? resolvedBase : `${conditions.join(", ")}, ${resolvedBase}`;
}
