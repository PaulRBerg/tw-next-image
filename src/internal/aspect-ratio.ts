import type { StaticImageData } from "../types.js";
import { WHITESPACE_REGEX } from "./constants.js";
import { parseVariantToken } from "./tailwind-variants.js";

const ASPECT_FRACTION_REGEX = /^aspect-(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/;
const ASPECT_BRACKET_REGEX = /^aspect-\[(.+)\]$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStaticImageData(value: unknown): value is StaticImageData {
  if (!isPlainObject(value)) {
    return false;
  }
  return typeof value.width === "number" && typeof value.height === "number";
}

export function getSrcAspectRatio(src: unknown): number | null {
  if (isStaticImageData(src) && src.height > 0 && src.width > 0) {
    return src.width / src.height;
  }

  if (
    isPlainObject(src) &&
    isStaticImageData(src.default) &&
    src.default.height > 0 &&
    src.default.width > 0
  ) {
    return src.default.width / src.default.height;
  }

  return null;
}

function parseAspectRatioFromBaseToken(baseToken: string): number | null {
  if (baseToken === "aspect-square") {
    return 1;
  }
  if (baseToken === "aspect-video") {
    return 16 / 9;
  }

  const fractionMatch = ASPECT_FRACTION_REGEX.exec(baseToken);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (
      Number.isFinite(numerator) &&
      Number.isFinite(denominator) &&
      numerator > 0 &&
      denominator > 0
    ) {
      return numerator / denominator;
    }
    return null;
  }

  const match = ASPECT_BRACKET_REGEX.exec(baseToken);
  if (!match) {
    return null;
  }

  const raw = match[1]?.replaceAll("_", " ").trim();
  if (!raw) {
    return null;
  }

  if (raw.includes("/")) {
    const [numerator, denominator] = raw.split("/", 2).map((part) => Number(part.trim()));
    if (
      Number.isFinite(numerator) &&
      Number.isFinite(denominator) &&
      numerator > 0 &&
      denominator > 0
    ) {
      return numerator / denominator;
    }
    return null;
  }

  const value = Number(raw);
  if (Number.isFinite(value) && value > 0) {
    return value;
  }

  return null;
}

export function getAspectRatioFromClassName(className: string | undefined): number | null {
  if (!className) {
    return null;
  }

  for (const token of className.split(WHITESPACE_REGEX)) {
    const { base: baseToken } = parseVariantToken(token);
    const aspectRatio = parseAspectRatioFromBaseToken(baseToken);
    if (aspectRatio !== null) {
      return aspectRatio;
    }
  }

  return null;
}
