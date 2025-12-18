const CSS_LENGTH_LITERAL_REGEX = /^\d+(\.\d+)?(px|rem|em|vw|vh|vmin|vmax|dvw|lvw|svw|dvh|lvh|svh)$/;
const CSS_FUNC_LENGTH_REGEX = /^(calc|min|max|clamp)\(.+\)$/;
const CSS_VAR_REGEX = /^var\(.+\)$/;
const PX_NUMBER_REGEX = /^(\d+(?:\.\d+)?)px$/;
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
