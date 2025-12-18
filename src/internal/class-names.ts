import { isNonEmptyString } from "./is-non-empty-string.js";

export type ClassNameValue = string | false | null | undefined;

const whitespaceRegex = /\s+/;

export function cx(...values: readonly ClassNameValue[]): string {
  if (values.length === 0) {
    return "";
  }

  const tokens: string[] = [];

  for (const value of values) {
    if (!isNonEmptyString(value)) {
      continue;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      continue;
    }

    tokens.push(...trimmed.split(whitespaceRegex));
  }

  return tokens.join(" ");
}
