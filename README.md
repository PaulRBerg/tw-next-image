# tw-next-image

[![npm version](https://img.shields.io/npm/v/tw-next-image)](https://www.npmjs.com/package/tw-next-image)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Tailwind-first Next.js image component with automatic `sizes` inference.

See [DOCS.md](./DOCS.md) for full examples and API reference.

## 📦 Install

```bash
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
inline styles.

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
