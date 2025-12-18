# Documentation

## SmartImage Component

A Tailwind-first wrapper around `next/image`:

- Never requires `width`/`height`
- Always uses `fill` mode
- Infers `sizes` from Tailwind sizing classes
- Auto-derives `alt` from filename

Because it always uses `fill`, the wrapper must resolve to a non-zero height (via `size-*`, `h-*`, `aspect-*` class,
inline `style={{ aspectRatio }}`, or the `ratio` prop).

### Basic Usage

```tsx
import { SmartImage } from "tw-next-image";

// Fixed size
<SmartImage src="/logo.png" className="size-11" />
// → sizes="44px"

// Width utility
<SmartImage src="/icon.png" className="w-75 aspect-square" />
// → sizes="300px"

// Viewport width
<SmartImage src="/hero.webp" className="w-screen aspect-16/9" />
// → sizes="100vw"

// Full width (explicit sizes required)
<SmartImage src="/banner.webp" className="w-full aspect-video" sizes="100vw" />
```

### Responsive Sizes

```tsx
// Two breakpoints
<SmartImage src="/avatar.webp" className="size-25 lg:size-30" />
// → sizes="(min-width: 1024px) 120px, 100px"

// Multiple breakpoints
<SmartImage src="/card.webp" className="w-full sm:w-80 lg:w-96 xl:w-120" />
// → sizes="(min-width: 1280px) 480px, (min-width: 1024px) 384px, (min-width: 640px) 320px, 100vw"

// Mixed responsive patterns
<SmartImage src="/thumb.webp" className="size-16 md:size-20 xl:size-24" />
// → sizes="(min-width: 1280px) 96px, (min-width: 768px) 80px, 64px"
```

### Constrained Widths

```tsx
// Max-width constraint
<SmartImage src="/hero.webp" className="w-full max-w-80" />
// → sizes="320px"

// Responsive max-width
<SmartImage src="/content.webp" className="w-full max-w-prose lg:max-w-4xl" />
// → sizes="(min-width: 1024px) 896px, 65ch"

// Arbitrary max-width
<SmartImage src="/modal.webp" className="w-full max-w-[calc(100vw-640px)]" />
// → sizes="calc(100vw-640px)"
```

### Aspect Ratio Layouts

```tsx
// Aspect ratio class
<SmartImage src="/video-thumb.webp" className="w-80 aspect-video" />
// → sizes="320px"

// Height + ratio prop (width = height × ratio)
<SmartImage src="/banner.webp" className="h-10" ratio={2} />
// → sizes="80px"

// Static image import (aspect ratio inferred)
import hero from "./hero.webp";
<SmartImage src={hero} className="h-64" />
// → sizes inferred from image dimensions
```

### Arbitrary Values

```tsx
// Arbitrary width
<SmartImage src="/custom.webp" className="w-[350px] aspect-square" />
// → sizes="350px"

// Arbitrary with responsive
<SmartImage src="/card.webp" className="w-[280px] lg:w-[400px]" />
// → sizes="(min-width: 1024px) 400px, 280px"

// Calc expressions
<SmartImage src="/sidebar.webp" className="w-[calc(100%-2rem)] max-w-xs" />
// → sizes="320px"
```

### Explicit Sizes

Use explicit `sizes` when inference isn't possible or you need full control:

```tsx
// Container query scenarios
<SmartImage src="/flex-item.webp" className="flex-1" sizes="33vw" />

// Complex responsive logic
<SmartImage src="/grid.webp" className="w-full" sizes="(min-width: 768px) 50vw, 100vw" />

// Override inferred value
<SmartImage src="/hero.webp" className="w-80" sizes="100vw" />
```

### Props Reference

| Prop           | Type            | Description                                       |
| -------------- | --------------- | ------------------------------------------------- |
| `className`    | `string`        | Wrapper classes. Use Tailwind sizing here.        |
| `style`        | `CSSProperties` | Wrapper inline styles.                            |
| `imgClassName` | `string`        | Classes for `<img>` (`object-*`, filters, etc).   |
| `imgStyle`     | `CSSProperties` | Inline styles for `<img>`.                        |
| `ratio`        | `number`        | Width/height ratio for height-only layouts.       |
| `sizes`        | `string`        | Required unless inferable from className/style.   |
| `alt`          | `string`        | Alt text. Derived from filename if omitted.       |
| `src`          | `string`        | Image source (same as `next/image`).              |
| `...props`     | -               | All other `next/image` props (except fill/width). |

## Standalone Inference

Use `inferImageSizes` without the React component:

```tsx
import { inferImageSizes } from "tw-next-image/infer-sizes";
```

### Basic Usage

```tsx
inferImageSizes({ className: "w-75" });
// → "300px"

inferImageSizes({ className: "size-25 lg:size-30" });
// → "(min-width: 1024px) 120px, 100px"

inferImageSizes({ className: "w-[350px]" });
// → "350px"

// Returns null when inference isn't possible
inferImageSizes({ className: "w-full" });
// → null
```

### With Aspect Ratio

```tsx
// Height + ratio
inferImageSizes({ className: "h-10", ratio: 2 });
// → "80px"

// Static image import
import hero from "./hero.webp";
inferImageSizes({ className: "h-64", src: hero });
// → inferred from image dimensions
```

### With Inline Styles

```tsx
// Style overrides className
inferImageSizes({
  className: "w-80",
  style: { width: 400 },
});
// → "400px"

// Max-width constraint
inferImageSizes({
  className: "w-full",
  style: { maxWidth: "600px" },
});
// → "600px"
```

### With Custom Breakpoints

```tsx
import { inferImageSizes } from "tw-next-image/infer-sizes";

inferImageSizes({
  className: "w-full sm:w-80",
  breakpoints: {
    sm: 480, // Custom small breakpoint
    md: 768,
    lg: 1024,
  },
});
// → "(min-width: 480px) 320px, 100vw"
```

### With Custom Spacing

```tsx
inferImageSizes({
  className: "w-container",
  customSpacing: {
    container: "1312px",
    sidebar: "280px",
  },
});
// → "1312px"
```

### API Reference

#### `InferSizesInput`

| Property        | Type                     | Default       | Description                                             |
| --------------- | ------------------------ | ------------- | ------------------------------------------------------- |
| `className`     | `string`                 | -             | Tailwind CSS classes                                    |
| `style`         | `InferSizesStyle`        | -             | Inline styles (override classes)                        |
| `ratio`         | `number`                 | -             | Width/height ratio for height-to-width conversion       |
| `baseSpacingPx` | `number`                 | `4`           | Tailwind base spacing unit                              |
| `src`           | `unknown`                | -             | Static image import for aspect ratio inference          |
| `breakpoints`   | `BreakpointConfig`       | Default TW v4 | Custom breakpoint configuration                         |
| `customSpacing` | `Record<string, string>` | `{}`          | Custom spacing values (e.g., `{ container: "1312px" }`) |

## Configuration

### Default Breakpoints

Matches Tailwind CSS v4 defaults:

```ts
import { DEFAULT_BREAKPOINTS } from "tw-next-image/infer-sizes";

// {
//   sm: 640,
//   md: 768,
//   lg: 1024,
//   xl: 1280,
//   "2xl": 1536,
// }
```

### Custom Breakpoints

```tsx
import { inferImageSizes } from "tw-next-image/infer-sizes";

const customBreakpoints = {
  tablet: 640,
  desktop: 1024,
  wide: 1440,
};

inferImageSizes({
  className: "w-full tablet:w-80 desktop:w-96",
  breakpoints: customBreakpoints,
});
```

### Base Spacing

Default is `4` (Tailwind's default). Adjust if using a custom spacing scale:

```tsx
inferImageSizes({
  className: "w-10", // With default: 40px
  baseSpacingPx: 8, // With custom: 80px
});
```

## Supported Utilities

### Width

- `w-{n}` — Fixed width (e.g., `w-80` → 320px)
- `w-screen` — 100vw
- `w-full` — 100% (requires explicit `sizes` or max-width constraint)
- `w-[{value}]` — Arbitrary value

### Max-Width

- `max-w-{n}` — Maximum width constraint
- `max-w-{size}` — Named sizes (xs, sm, md, lg, xl, etc.)
- `max-w-prose` — 65ch
- `max-w-[{value}]` — Arbitrary value

### Size

- `size-{n}` — Sets both width and height

### Height (with ratio)

- `h-{n}` — Height (requires `ratio` prop or static image for width inference)

### Responsive Prefixes

All utilities support responsive prefixes:

- `sm:` — 640px+
- `md:` — 768px+
- `lg:` — 1024px+
- `xl:` — 1280px+
- `2xl:` — 1536px+
