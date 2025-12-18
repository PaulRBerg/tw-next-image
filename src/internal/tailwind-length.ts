import type { BreakpointConfig } from "../breakpoints.js";
import { formatPx } from "./css-length.js";

const TRAILING_ZEROES_REGEX = /\.0+$/;

export function parseTailwindLength(
  raw: string,
  baseSpacingPx: number,
  breakpoints: BreakpointConfig,
  customSpacing: Record<string, string> = {}
): string | null {
  if (raw === "auto" || raw === "full") {
    return null;
  }

  return (
    parseTailwindLengthFromCustomSpacing(raw, customSpacing) ??
    parseTailwindLengthFromScreen(raw, breakpoints) ??
    parseTailwindLengthFromViewport(raw) ??
    parseTailwindLengthFromFraction(raw) ??
    parseTailwindLengthFromArbitraryBrackets(raw) ??
    parseTailwindLengthFromArbitraryParens(raw) ??
    parseTailwindLengthFromNumber(raw, baseSpacingPx)
  );
}

function parseTailwindLengthFromCustomSpacing(
  raw: string,
  customSpacing: Record<string, string>
): string | null {
  if (raw in customSpacing) {
    return customSpacing[raw];
  }
  if (raw === "px") {
    return "1px";
  }
  return null;
}

function parseTailwindLengthFromScreen(raw: string, breakpoints: BreakpointConfig): string | null {
  if (raw === "screen") {
    return "100vw";
  }
  if (!raw.startsWith("screen-")) {
    return null;
  }

  const breakpoint = raw.slice("screen-".length);
  if (!(breakpoint in breakpoints)) {
    return null;
  }

  return `${breakpoints[breakpoint]}px`;
}

function parseTailwindLengthFromViewport(raw: string): string | null {
  if (
    raw === "dvw" ||
    raw === "lvw" ||
    raw === "svw" ||
    raw === "dvh" ||
    raw === "lvh" ||
    raw === "svh"
  ) {
    return `100${raw}`;
  }
  return null;
}

function parseTailwindLengthFromFraction(raw: string): string | null {
  const [numeratorRaw, denominatorRaw] = raw.split("/", 2);
  if (numeratorRaw === undefined || denominatorRaw === undefined) {
    return null;
  }

  const numerator = Number(numeratorRaw);
  const denominator = Number(denominatorRaw);
  if (!(Number.isFinite(numerator) && Number.isFinite(denominator)) || denominator === 0) {
    return null;
  }

  const percent = (numerator / denominator) * 100;
  if (!Number.isFinite(percent)) {
    return null;
  }

  const rounded = Math.round(percent * 1_000_000) / 1_000_000;
  const formatted = String(rounded).replace(TRAILING_ZEROES_REGEX, "");
  return `${formatted}%`;
}

function parseTailwindLengthFromArbitraryBrackets(raw: string): string | null {
  if (!(raw.startsWith("[") && raw.endsWith("]"))) {
    return null;
  }

  const inner = raw.slice(1, -1).replaceAll("_", " ").trim();
  return inner === "" ? null : inner;
}

function parseTailwindLengthFromArbitraryParens(raw: string): string | null {
  if (!(raw.startsWith("(") && raw.endsWith(")"))) {
    return null;
  }

  const inner = raw.slice(1, -1).trim();
  if (inner === "") {
    return null;
  }
  if (inner.startsWith("--")) {
    return `var(${inner})`;
  }
  return inner;
}

function parseTailwindLengthFromNumber(raw: string, baseSpacingPx: number): string | null {
  const numberValue = Number(raw);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return null;
  }
  return formatPx(numberValue * baseSpacingPx);
}
