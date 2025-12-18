/**
 * Standard Tailwind CSS v4 breakpoints (min-widths in pixels).
 * @see https://tailwindcss.com/docs/responsive-design
 */
export const DEFAULT_BREAKPOINTS = {
  "2xl": 1536,
  lg: 1024,
  md: 768,
  sm: 640,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof DEFAULT_BREAKPOINTS;

export type BreakpointConfig = Record<string, number>;
