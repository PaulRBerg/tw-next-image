import type { BreakpointConfig } from "../breakpoints.js";
import type { BreakpointKey, InferSizesStyle, SizeInfo } from "../types.js";
import { WHITESPACE_REGEX } from "./constants.js";
import { parseStyleLength } from "./css-length.js";
import { parseTailwindLength } from "./tailwind-length.js";
import { getBreakpoint, parseVariantToken } from "./tailwind-variants.js";

const SIZE_REGEX = /^size-(.+)$/;
const WIDTH_REGEX = /^w-(.+)$/;
const MAX_WIDTH_REGEX = /^max-w-(.+)$/;
const HEIGHT_REGEX = /^h-(.+)$/;
const MAX_HEIGHT_REGEX = /^max-h-(.+)$/;

type SizingHandler = {
  apply: (info: SizeInfo, value: string) => void;
  regex: RegExp;
};

const SIZING_HANDLERS = [
  {
    apply: (info, value) => {
      info.width = value;
      info.height = value;
    },
    regex: SIZE_REGEX,
  },
  {
    apply: (info, value) => {
      info.width = value;
    },
    regex: WIDTH_REGEX,
  },
  {
    apply: (info, value) => {
      info.maxWidth = value;
    },
    regex: MAX_WIDTH_REGEX,
  },
  {
    apply: (info, value) => {
      info.height = value;
    },
    regex: HEIGHT_REGEX,
  },
  {
    apply: (info, value) => {
      info.maxHeight = value;
    },
    regex: MAX_HEIGHT_REGEX,
  },
] satisfies readonly SizingHandler[];

export function parseSizeInfoByBreakpoint(
  className: string | undefined,
  baseSpacingPx: number,
  breakpoints: BreakpointConfig,
  customSpacing: Record<string, string> = {}
): Partial<Record<BreakpointKey, SizeInfo>> {
  const byBreakpoint: Partial<Record<BreakpointKey, SizeInfo>> = {};
  if (!className) {
    return byBreakpoint;
  }

  for (const token of className.split(WHITESPACE_REGEX)) {
    if (!token) {
      continue;
    }

    const { base: baseToken, variants } = parseVariantToken(token);
    const breakpoint = getBreakpoint(variants, breakpoints);
    const key: BreakpointKey = breakpoint ?? "base";

    const existing = byBreakpoint[key] ?? {};
    const didApply = applySizingBaseTokenToInfo({
      baseSpacingPx,
      baseToken,
      breakpoints,
      customSpacing,
      info: existing,
    });
    if (didApply) {
      byBreakpoint[key] = existing;
    }
  }

  return byBreakpoint;
}

export function mergeStyleIntoSizeInfo(info: SizeInfo, style: InferSizesStyle | undefined) {
  if (!style) {
    return;
  }

  const styleWidth = parseStyleLength(style.width);
  const styleMaxWidth = parseStyleLength(style.maxWidth);
  const styleHeight = parseStyleLength(style.height);
  const styleMaxHeight = parseStyleLength(style.maxHeight);

  if (styleWidth) {
    info.width = styleWidth;
  }
  if (styleMaxWidth) {
    info.maxWidth = styleMaxWidth;
  }
  if (styleHeight) {
    info.height = styleHeight;
  }
  if (styleMaxHeight) {
    info.maxHeight = styleMaxHeight;
  }
}

type ApplySizingOptions = {
  baseSpacingPx: number;
  baseToken: string;
  breakpoints: BreakpointConfig;
  customSpacing: Record<string, string>;
  info: SizeInfo;
};

function applySizingBaseTokenToInfo({
  baseSpacingPx,
  baseToken,
  breakpoints,
  customSpacing,
  info,
}: ApplySizingOptions): boolean {
  for (const handler of SIZING_HANDLERS) {
    const match = handler.regex.exec(baseToken);
    if (!match) {
      continue;
    }

    const parsed = parseTailwindLength(match[1] ?? "", baseSpacingPx, breakpoints, customSpacing);
    if (!parsed) {
      return false;
    }

    handler.apply(info, parsed);
    return true;
  }

  return false;
}
