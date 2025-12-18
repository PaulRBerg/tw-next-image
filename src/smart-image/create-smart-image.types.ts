import type { CSSProperties } from "react";

import type { ClassNameValue } from "../internal/class-names.js";
import type { SmartImageProps } from "./smart-image.types.js";

export type SmartImageClassNameFn = (...values: readonly ClassNameValue[]) => string;

export type CreateSmartImageOptions = {
  /**
   * How to combine/merge class names.
   *
   * Pass a custom `tailwind-merge` instance (e.g. from `extendTailwindMerge`) if your project extends Tailwind tokens
   * (like `max-w-container`, `px-edge`, etc.) and you want "last class wins" semantics.
   */
  cx?: SmartImageClassNameFn;
  /** Base classes applied to the wrapper element. */
  wrapperClassName?: ClassNameValue;
  /** Base classes applied to the underlying `<img>`. */
  imgClassName?: ClassNameValue;
};

export type SmartImageComponent = <
  C extends string | undefined = undefined,
  S extends CSSProperties | undefined = undefined,
>(
  props: SmartImageProps<C, S>
) => React.ReactElement;
