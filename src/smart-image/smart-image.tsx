import NextImage from "next/image.js";
import type { CSSProperties } from "react";

import { inferImageSizes } from "../infer-sizes.js";
import { cx } from "../internal/class-names.js";
import { getAltFromSrc } from "./get-alt-from-src.js";
import type { SmartImageProps } from "./smart-image.types.js";

const HAS_HEIGHT_OR_ASPECT_CLASS_REGEX = /(^|\s)(size-|h-|max-h-|aspect-)/;

let didWarnMissingLayoutSizing = false;

/**
 * A Tailwind-first wrapper around `next/image`:
 * - Never requires `width`/`height`
 * - Always uses `fill`
 * - Infers a correct `sizes` attribute from Tailwind sizing classes
 *
 * @example
 * ```tsx
 * <SmartImage src="/logo.png" className="size-11" />
 * <SmartImage src="/hero.webp" className="w-full max-w-80" sizes="(min-width: 1024px) 640px, 100vw" />
 * ```
 */
export function SmartImage<
  C extends string | undefined = undefined,
  S extends CSSProperties | undefined = undefined,
>({
  alt,
  className,
  imgClassName,
  imgStyle,
  ratio,
  sizes,
  src,
  style,
  ...props
}: SmartImageProps<C, S>) {
  const derivedAlt =
    alt ?? (props["aria-hidden"] ? "" : getAltFromSrc(typeof src === "string" ? src : ""));

  const inferredSizes = sizes ?? inferImageSizes({ className, ratio, src, style });

  if (!didWarnMissingLayoutSizing && process.env.NODE_ENV !== "production") {
    const classTokens = className ?? "";
    const hasHeightOrAspectClass = HAS_HEIGHT_OR_ASPECT_CLASS_REGEX.test(classTokens);
    const hasHeightOrAspectStyle = Boolean(style?.height || style?.maxHeight || style?.aspectRatio);

    if (!(hasHeightOrAspectClass || hasHeightOrAspectStyle || ratio)) {
      didWarnMissingLayoutSizing = true;
      console.warn(
        "SmartImage: `fill` requires the wrapper to have a height. " +
          "Use `size-*`/`h-*`, an `aspect-*` class, inline `style={{ aspectRatio }}`, or pass `ratio`."
      );
    }
  }

  if (!inferredSizes && process.env.NODE_ENV !== "production") {
    throw new Error(
      "SmartImage: missing `sizes` and couldn't infer from className/style. " +
        "Add Tailwind sizing classes (size-*, w-*, max-w-*) or pass `sizes` explicitly."
    );
  }

  return (
    <span className={cx("relative inline-block", className)} style={style}>
      <NextImage
        {...props}
        alt={derivedAlt}
        className={cx("object-contain", imgClassName)}
        fill
        sizes={inferredSizes ?? "100vw"}
        src={src}
        style={imgStyle}
      />
    </span>
  );
}
