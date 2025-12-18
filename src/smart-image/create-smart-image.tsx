import NextImage from "next/image.js";
import type { CSSProperties } from "react";

import { inferImageSizes } from "../infer-sizes.js";
import { cx as defaultCx } from "../internal/class-names.js";
import type { CreateSmartImageOptions, SmartImageComponent } from "./create-smart-image.types.js";
import { getAltFromSrc } from "./get-alt-from-src.js";
import type { SmartImageProps } from "./smart-image.types.js";

const HAS_HEIGHT_OR_ASPECT_CLASS_REGEX = /(^|\s)(size-|h-|max-h-|aspect-)/;

function inferAltText({
  alt,
  ariaHidden,
  src,
}: {
  alt: string | undefined;
  ariaHidden: unknown;
  src: unknown;
}): string {
  if (alt !== undefined) {
    return alt;
  }
  const isAriaHidden = ariaHidden === true || ariaHidden === "true";
  if (isAriaHidden) {
    return "";
  }
  return getAltFromSrc(typeof src === "string" ? src : "");
}

function warnMissingLayoutSizing({
  className,
  ratio,
  style,
  shouldWarn,
  didWarn,
}: {
  className: string | undefined;
  ratio: number | undefined;
  style: CSSProperties | undefined;
  shouldWarn: boolean;
  didWarn: boolean;
}): boolean {
  if (!shouldWarn || didWarn) {
    return didWarn;
  }

  const classTokens = className ?? "";
  const hasHeightOrAspectClass = HAS_HEIGHT_OR_ASPECT_CLASS_REGEX.test(classTokens);
  const hasHeightOrAspectStyle = Boolean(style?.height || style?.maxHeight || style?.aspectRatio);

  if (hasHeightOrAspectClass || hasHeightOrAspectStyle || ratio) {
    return didWarn;
  }

  console.warn(
    "SmartImage: `fill` requires the wrapper to have a height. " +
      "Use `size-*`/`h-*`, an `aspect-*` class, inline `style={{ aspectRatio }}`, or pass `ratio`."
  );
  return true;
}

/**
 * Create a `SmartImage` component with an injected `cx` implementation.
 *
 * This is the recommended integration pattern for design systems which:
 * - configure `tailwind-merge` with custom theme tokens, or
 * - want strict "last class wins" conflict resolution for wrapper/img classes.
 *
 * @remarks
 * Each factory instance maintains its own warning state. The missing-layout-sizing
 * warning fires only once per factory instance (not per render) to prevent console spam.
 * Call `createSmartImage()` multiple times if you need independent warning behavior.
 */
export function createSmartImage(options: CreateSmartImageOptions = {}): SmartImageComponent {
  const cx = options.cx ?? defaultCx;
  const baseWrapperClassName = options.wrapperClassName ?? "relative inline-block";
  const baseImgClassName = options.imgClassName ?? "object-contain";

  let didWarnMissingLayoutSizing = false;

  return function SmartImage<
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
    const derivedAlt = inferAltText({ alt, ariaHidden: props["aria-hidden"], src });
    const inferredSizes = sizes ?? inferImageSizes({ className, ratio, src, style });

    didWarnMissingLayoutSizing = warnMissingLayoutSizing({
      className,
      didWarn: didWarnMissingLayoutSizing,
      ratio,
      shouldWarn: process.env.NODE_ENV !== "production",
      style,
    });

    if (!inferredSizes && process.env.NODE_ENV !== "production") {
      throw new Error(
        "SmartImage: missing `sizes` and couldn't infer from className/style. " +
          "Add Tailwind sizing classes (size-*, w-*, max-w-*) or pass `sizes` explicitly."
      );
    }

    return (
      <span className={cx(baseWrapperClassName, className)} style={style}>
        <NextImage
          {...props}
          alt={derivedAlt}
          className={cx(baseImgClassName, imgClassName)}
          fill
          sizes={inferredSizes ?? "100vw"}
          src={src}
          style={imgStyle}
        />
      </span>
    );
  };
}
