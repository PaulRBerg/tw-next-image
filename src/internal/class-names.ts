import { WHITESPACE_REGEX } from "./constants.js";
import { isNonEmptyString } from "./is-non-empty-string.js";

export type ClassNameValue = ClassNameArray | string | null | undefined | 0 | 0n | false;
type ClassNameArray = ClassNameValue[];

const MAX_NESTING_DEPTH = 10;

export function cx(...values: readonly ClassNameValue[]): string {
  if (values.length === 0) {
    return "";
  }

  const tokens: string[] = [];

  appendTokens(tokens, values, 0);

  return tokens.join(" ");
}

function appendTokens(out: string[], values: readonly ClassNameValue[], depth: number) {
  if (depth > MAX_NESTING_DEPTH) {
    return;
  }

  for (const value of values) {
    if (!value) {
      continue;
    }

    if (Array.isArray(value)) {
      appendTokens(out, value, depth + 1);
      continue;
    }

    if (!isNonEmptyString(value)) {
      continue;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      continue;
    }

    out.push(...trimmed.split(WHITESPACE_REGEX));
  }
}
