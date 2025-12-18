import type { BreakpointConfig } from "./breakpoints.js";
import { DEFAULT_BREAKPOINTS } from "./breakpoints.js";
import { getAspectRatioFromClassName, getSrcAspectRatio } from "./internal/aspect-ratio.js";
import { formatPx, minPx, parsePxNumber } from "./internal/css-length.js";
import { mergeStyleIntoSizeInfo, parseSizeInfoByBreakpoint } from "./internal/size-info.js";
import type { InferSizesInput, SizeInfo } from "./types.js";

const DEFAULT_BASE_SPACING_PX = 4;

function resolveWidthCandidate(info: SizeInfo, aspectRatio: number | null): string | null {
  const fromWidthOrMax = (() => {
    if (info.width && info.maxWidth) {
      return minPx(info.width, info.maxWidth) ?? `min(${info.width}, ${info.maxWidth})`;
    }
    return info.width ?? info.maxWidth;
  })();

  if (fromWidthOrMax) {
    return fromWidthOrMax;
  }

  if (!aspectRatio) {
    return null;
  }

  const height = (() => {
    if (info.height && info.maxHeight) {
      return (
        minPx(info.height, info.maxHeight) ??
        (parsePxNumber(info.height) === null ? null : info.height) ??
        (parsePxNumber(info.maxHeight) === null ? null : info.maxHeight)
      );
    }
    return info.height ?? info.maxHeight ?? null;
  })();
  if (!height) {
    return null;
  }

  const heightPx = parsePxNumber(height);
  if (heightPx === null) {
    return null;
  }

  return formatPx(heightPx * aspectRatio);
}

function buildBreakpointConditions(
  byBreakpoint: Partial<Record<string, SizeInfo>>,
  aspectRatio: number | null,
  breakpoints: BreakpointConfig
): string[] {
  const conditions: string[] = [];
  const orderedBreakpoints = (Object.entries(breakpoints) as [string, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  for (const [breakpoint, minWidthPx] of orderedBreakpoints) {
    const info = byBreakpoint[breakpoint];
    if (!info) {
      continue;
    }
    const resolved = resolveWidthCandidate(info, aspectRatio);
    if (!resolved) {
      continue;
    }
    conditions.push(`(min-width: ${minWidthPx}px) ${resolved}`);
  }

  return conditions;
}

/**
 * Infer a Next.js `sizes` string from Tailwind sizing utilities applied to the wrapper.
 *
 * Supports:
 * - `size-*`, `w-*`, `max-w-*` (with responsive prefixes like `lg:`)
 * - Arbitrary values: `w-[350px]`, `max-w-[calc(100vw-640px)]`
 * - Inline styles: `style={{ width: 120 }}`
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

  const baseInfo: SizeInfo = byBreakpoint.base ?? {};
  byBreakpoint.base = baseInfo;
  mergeStyleIntoSizeInfo(baseInfo, style);

  const aspectRatio = ratio ?? getSrcAspectRatio(src) ?? getAspectRatioFromClassName(className);

  const resolvedBase = resolveWidthCandidate(baseInfo, aspectRatio);
  if (!resolvedBase) {
    return null;
  }

  const conditions = buildBreakpointConditions(byBreakpoint, aspectRatio, breakpoints);
  return conditions.length === 0 ? resolvedBase : `${conditions.join(", ")}, ${resolvedBase}`;
}
