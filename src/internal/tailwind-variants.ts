import type { BreakpointConfig } from "../breakpoints.js";

type VariantSplitState = {
  bracketDepth: number;
  current: string;
  parenDepth: number;
  parts: string[];
};

function splitVariantsAndBase(token: string): string[] {
  const state: VariantSplitState = { bracketDepth: 0, current: "", parenDepth: 0, parts: [] };

  for (const char of token) {
    state.bracketDepth = nextBracketDepth(state.bracketDepth, state.parenDepth, char);
    state.parenDepth = nextParenDepth(state.parenDepth, state.bracketDepth, char);

    if (char === ":" && state.bracketDepth === 0 && state.parenDepth === 0) {
      state.parts.push(state.current);
      state.current = "";
      continue;
    }

    state.current += char;
  }

  state.parts.push(state.current);
  return state.parts;
}

function nextBracketDepth(current: number, parenDepth: number, char: string): number {
  if (parenDepth !== 0) {
    return current;
  }
  if (char === "[") {
    return current + 1;
  }
  if (char === "]" && current > 0) {
    return current - 1;
  }
  return current;
}

function nextParenDepth(current: number, bracketDepth: number, char: string): number {
  if (bracketDepth !== 0) {
    return current;
  }
  if (char === "(") {
    return current + 1;
  }
  if (char === ")" && current > 0) {
    return current - 1;
  }
  return current;
}

export function parseVariantToken(token: string): { base: string; variants: string[] } {
  if (!token.includes(":")) {
    return { base: token, variants: [] };
  }

  const parts = splitVariantsAndBase(token);

  if (parts.length <= 1) {
    return { base: token, variants: [] };
  }

  if (parts.some((part) => part === "")) {
    return { base: token, variants: [] };
  }

  const base = parts.at(-1) ?? token;
  const variants = parts.slice(0, -1).filter(Boolean);
  return { base, variants };
}

export function getBreakpoint(variants: string[], breakpoints: BreakpointConfig): string | null {
  for (const variant of variants) {
    if (variant in breakpoints) {
      return variant;
    }
  }
  return null;
}
