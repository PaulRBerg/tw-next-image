# tw-next-image

[![npm version](https://img.shields.io/npm/v/tw-next-image)](https://www.npmjs.com/package/tw-next-image)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Tailwind-first Next.js image component with automatic `sizes` inference.

See [DOCS.md](./DOCS.md) for full examples and API reference.

## Why

The `next/image` component requires a [`sizes`][mdn-sizes] attribute to serve optimally-sized images. Without it,
Next.js defaults to `100vw`—meaning a 64px thumbnail requests the same massive image as a full-width hero. This wastes
bandwidth and hurts Core Web Vitals.

The problem: crafting `sizes` by hand is tedious. Every responsive image needs a media query string that mirrors your
CSS breakpoints:

```tsx
// Manual sizes for a responsive image 😴
<Image src="/avatar.webp" sizes="(min-width: 1024px) 120px, 100px" className="size-25 lg:size-30" />
```

**`tw-next-image` eliminates this busywork.** It parses your Tailwind classes and infers the correct `sizes`
automatically:

```tsx
// Same result, zero mental overhead 🎉
<SmartImage src="/avatar.webp" className="size-25 lg:size-30" />
// → sizes="(min-width: 1024px) 120px, 100px"
```

<details>
<summary>Further reading</summary>

- [next/image responsive behavior discussion](https://github.com/vercel/next.js/discussions/25564)
- [Tailwind + next/image integration request](https://github.com/vercel/next.js/discussions/38945)
- [Inefficient srcset generation issue](https://github.com/vercel/next.js/issues/27547)
- [Deep dive: the sizes attribute in Next.js](https://morganfeeney.com/posts/sizes-attribute-nextjs-image)

</details>

[mdn-sizes]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes

## 📦 Install

```bash
npm install tw-next-image
# or
pnpm add tw-next-image
# or
yarn add tw-next-image
# or
bun add tw-next-image
```

**Requirements**: Next.js ≥13, React ≥18

## 🚀 Quick Start

```tsx
import { SmartImage } from "tw-next-image";

// sizes inferred from className
<SmartImage src="/logo.png" className="size-11" />
// → sizes="44px"

// Responsive breakpoints
<SmartImage src="/avatar.webp" className="size-25 lg:size-30" />
// → sizes="(min-width: 1024px) 120px, 100px"
```

`SmartImage` wraps `next/image` with `fill` mode—ensure the wrapper has height via `size-*`, `h-*`, `aspect-*`, or
inline styles. Inference also respects `min-w-*`/`max-w-*` and `min-h-*`/`max-h-*` constraints, and uses
`style.aspectRatio` for height-only layouts.

## 🔧 Custom `tailwind-merge`

If your app uses a custom `tailwind-merge` config, inject it via `createSmartImage`:

```tsx
import { createSmartImage } from "tw-next-image";
import { customTwMerge } from "./tailwind/merge";

export const SmartImage = createSmartImage({ cx: customTwMerge });
```

## 📖 Standalone Inference

Use `inferImageSizes` without the React component:

```tsx
import { inferImageSizes } from "tw-next-image/infer-sizes";

inferImageSizes({ className: "w-75" });
// → "300px"

inferImageSizes({ className: "size-25 lg:size-30" });
// → "(min-width: 1024px) 120px, 100px"
```

## 📄 License

[MIT](./LICENSE) © [Paul Razvan Berg](https://github.com/PaulRBerg)
