import type { CSSProperties } from "react";

import { createSmartImage } from "./create-smart-image.js";
import type { SmartImageProps } from "./smart-image.types.js";

const SmartImageImpl = createSmartImage();

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
>(props: SmartImageProps<C, S>) {
  return SmartImageImpl(props);
}
