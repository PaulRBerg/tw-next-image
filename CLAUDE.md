# Development Instructions

AI agents working on this TypeScript library must follow these guidelines.

References:

- **Project overview**: @README.md
- **Dependencies**: @package.json
- **Commands**: @justfile

## Lint Rules

After generating code, run these commands **in order**.

**File argument rules:**

- Changed fewer than 10 files? → Pass specific paths or globs
- Changed 10+ files? → Omit file arguments to process all files

**Command sequence:**

1. **Identify which file types changed**

2. **`na biome lint <files>`** — lint TS/TSX/JSON (skip if none changed)

3. **`na tsc --noEmit`** — verify TypeScript types (always run on entire project)

**Examples:**

```bash
# Fewer than 10 files: use specific paths and/or globs
na biome lint src/infer-sizes.ts src/smart-image/smart-image.tsx

# 10+ files: run default command
na biome lint

# TypeScript check runs on entire project
na tsc --noEmit
```

If any command fails, analyze the errors and fix only those related to files you changed. Ignore pre-existing errors in
other files. Then, run `just biome-write` to format all code at the end.

## Commands

```bash
just build        # Build project (clean + tsc + npm pack)
just test         # Run tests (alias: just t)
just test-ui      # Run tests with UI (alias: just tui)
just clean        # Clean dist directory
```

### Dependency Management

```bash
ni                   # Install all dependencies
ni package-name      # Add dependency
ni -D package-name   # Add dev dependency
nun package-name     # Remove dependency
```

## Code Standards

### Naming Conventions

- **Directories**: `kebab-case` (e.g., `smart-image`)
- **Files**: `kebab-case` for all files (e.g., `smart-image.tsx`, `css-length.ts`)

### TypeScript

- Prefer `type` over `interface`
- Prefer `function` over `() =>` for exported functions
- Use `satisfies` operator for type-safe constants
- Avoid `any`; use `unknown` if type is truly unknown
- Export types from dedicated `.types.ts` files or `types.ts`
- Named exports only: `export function foo()` not `export default`

### Testing

- Test files: `*.test.ts` or `*.test.tsx` colocated with source
- Use Vitest globals (no imports needed for `describe`, `it`, `expect`)
- Mock `next/image` in component tests
- Run `just test` before committing

## Project Structure

```
src/
├── index.ts              # Public API exports
├── types.ts              # Shared type definitions
├── infer-sizes.ts        # Main inference logic
├── infer-sizes.test.ts   # Tests
├── breakpoints.ts        # Tailwind breakpoint config
├── internal/             # Internal utilities (not exported)
│   ├── aspect-ratio.ts       # Aspect ratio parsing
│   ├── class-names.ts        # Class name utilities
│   ├── constants.ts          # Shared constants
│   ├── css-length.ts         # CSS length parsing/formatting
│   ├── is-non-empty-string.ts # Type guard
│   ├── size-info.ts          # Size aggregation by breakpoint
│   ├── tailwind-length.ts    # Tailwind spacing utilities
│   └── tailwind-variants.ts  # Tailwind class variant parsing
├── infer-sizes/
│   └── index.ts          # Standalone barrel (no React)
└── smart-image/
    ├── index.ts                   # SmartImage barrel
    ├── create-smart-image.tsx     # Factory for custom tailwind-merge
    ├── create-smart-image.types.ts
    ├── smart-image.tsx            # SmartImage component
    ├── smart-image.types.ts
    ├── smart-image.test.tsx
    └── get-alt-from-src.ts
```

## Library API

### Main exports (`tw-next-image`)

- `SmartImage` - Tailwind-first Next.js image component
- `createSmartImage` - Factory for custom tailwind-merge config
- `inferImageSizes` - Infer sizes from className/style
- `DEFAULT_BREAKPOINTS` - Tailwind v4 breakpoint config
- Types: `SmartImageProps`, `SmartImageComponent`, `CreateSmartImageOptions`, `SmartImageClassNameFn`
- Types: `InferSizesInput`, `InferSizesStyle`, `SizeInfo`, `StaticImageData`, `Breakpoint`, `BreakpointConfig`

### Standalone exports (`tw-next-image/infer-sizes`)

- `inferImageSizes` - Core inference function (no React dependency)
- `DEFAULT_BREAKPOINTS` - Tailwind v4 breakpoint config
- Types: `InferSizesInput`, `InferSizesStyle`, `SizeInfo`, `StaticImageData`, `Breakpoint`, `BreakpointConfig`
