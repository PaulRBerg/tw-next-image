# tw-next-image

Tailwind-first Next.js image component with automatic `sizes` inference.

See [DOCS.md](./DOCS.md) for full examples and API reference.

## Install

```bash
bun add tw-next-image
```

## Quick Start

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

## License

MIT
