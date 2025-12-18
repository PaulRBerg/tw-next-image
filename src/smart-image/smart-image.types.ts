import type { ImageProps as NextImageProps } from "next/image.js";
import type { CSSProperties } from "react";

// Inlined from type-fest to avoid runtime dependency
type Simplify<T> = { [K in keyof T]: T[K] } & {};
type IsStringLiteral<T> = T extends string ? (string extends T ? false : true) : false;
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

type NextImageBaseProps = Omit<
  NextImageProps,
  "alt" | "className" | "fill" | "height" | "sizes" | "style" | "width"
>;

type InferableTailwindLengthValue =
  | `${number}`
  | `[${string}]`
  | `(${string})`
  | "container"
  | "edge"
  | "dvh"
  | "dvw"
  | "lvh"
  | "lvw"
  | "px"
  | "screen"
  | "svh"
  | "svw"
  | `screen-${string}`;

type HasInferableClassSizingToken<C extends string> = C extends
  | `${string}size-${InferableTailwindLengthValue}${string}`
  | `${string}w-${InferableTailwindLengthValue}${string}`
  | `${string}max-w-${InferableTailwindLengthValue}${string}`
  ? true
  : false;

type IsBroadStyle<S> = [NonNullable<S>] extends [CSSProperties]
  ? CSSProperties extends NonNullable<S>
    ? true
    : false
  : false;

type CanInferFromClassName<C> = [NonNullable<C>] extends [string]
  ? IsStringLiteral<NonNullable<C>> extends true
    ? HasInferableClassSizingToken<NonNullable<C>>
    : false
  : false;

type InferableStyle = RequireAtLeastOne<CSSProperties, "maxWidth" | "width">;

type CanInferFromStyle<S> = [NonNullable<S>] extends [CSSProperties]
  ? IsBroadStyle<S> extends true
    ? false
    : NonNullable<S> extends InferableStyle
      ? true
      : false
  : false;

type SizesConstraint<C, S> =
  | { sizes: string }
  | (CanInferFromClassName<C> extends true ? { sizes?: string } : never)
  | (CanInferFromStyle<S> extends true ? { sizes?: string } : never)
  | ([NonNullable<C>] extends [string]
      ? IsStringLiteral<NonNullable<C>> extends false
        ? { sizes?: string }
        : never
      : never)
  | (IsBroadStyle<S> extends true ? { sizes?: string } : never);

export type SmartImageProps<
  C extends string | undefined = undefined,
  S extends CSSProperties | undefined = undefined,
> = Simplify<
  NextImageBaseProps & {
    /** Alt text. If omitted, derived from src filename or empty for aria-hidden. */
    alt?: string;
    /** Classes for wrapper element. Use Tailwind sizing utilities here. */
    className?: C;
    /** Inline styles for wrapper element. */
    style?: S;
    /** Classes for underlying img. Use object-*, filters, etc. */
    imgClassName?: string;
    /** Inline styles for underlying img. */
    imgStyle?: NextImageProps["style"];
    /** Width/height ratio for height-only layouts. */
    ratio?: number;
    /** Image sizes. Required unless className/style are statically inferable. */
    sizes?: string;
  } & SizesConstraint<C, S>
>;
