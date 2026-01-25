const CSS_LENGTH_LITERAL_REGEX = /^\d+(\.\d+)?(px|rem|em|vw|vh|vmin|vmax|dvw|lvw|svw|dvh|lvh|svh)$/;
const CSS_FUNC_LENGTH_REGEX = /^(calc|min|max|clamp)\(.+\)$/;
const CSS_VAR_REGEX = /^var\(.+\)$/;
const PX_NUMBER_REGEX = /^(\d+(?:\.\d+)?)px$/;
const ASPECT_RATIO_NUMBER_REGEX = /^\d+(\.\d+)?$/;
const ASPECT_RATIO_FRACTION_REGEX = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/;
const TRAILING_ZEROES_REGEX = /\.0+$/;

export function parseStyleLength(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return `${value}px`;
  }
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "auto") {
    return null;
  }

  if (CSS_LENGTH_LITERAL_REGEX.test(trimmed)) {
    return trimmed;
  }
  if (CSS_FUNC_LENGTH_REGEX.test(trimmed)) {
    return trimmed;
  }
  if (CSS_VAR_REGEX.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function parsePxNumber(length: string): number | null {
  const match = PX_NUMBER_REGEX.exec(length);
  if (!match) {
    return null;
  }
  return Number(match[1]);
}

export function parseStyleAspectRatio(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  if (ASPECT_RATIO_NUMBER_REGEX.test(trimmed)) {
    const numeric = Number(trimmed);
    return numeric > 0 ? numeric : null;
  }

  const fractionMatch = ASPECT_RATIO_FRACTION_REGEX.exec(trimmed);
  if (!fractionMatch) {
    return null;
  }

  const numerator = Number(fractionMatch[1]);
  const denominator = Number(fractionMatch[2]);
  if (!(Number.isFinite(numerator) && Number.isFinite(denominator)) || denominator <= 0) {
    return null;
  }

  return numerator / denominator;
}

export function formatPx(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return `${String(rounded).replace(TRAILING_ZEROES_REGEX, "")}px`;
}

export function minPx(a: string, b: string): string | null {
  const firstPx = parsePxNumber(a);
  const secondPx = parsePxNumber(b);
  if (firstPx === null || secondPx === null) {
    return null;
  }
  return formatPx(Math.min(firstPx, secondPx));
}

export function maxPx(a: string, b: string): string | null {
  const firstPx = parsePxNumber(a);
  const secondPx = parsePxNumber(b);
  if (firstPx === null || secondPx === null) {
    return null;
  }
  return formatPx(Math.max(firstPx, secondPx));
}
