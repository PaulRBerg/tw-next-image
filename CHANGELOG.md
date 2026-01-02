# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

## [1.0.0-beta.1] - 2026-01-02

### Added

- `SmartImage` component: Tailwind-first Next.js image with automatic `sizes` inference
- `createSmartImage` factory: Create custom SmartImage with your own `tailwind-merge` config
- `inferImageSizes` function: Standalone sizes inference from Tailwind classes
- `DEFAULT_BREAKPOINTS`: Tailwind v4 breakpoint configuration
- Standalone export path `tw-next-image/infer-sizes` for React-free usage
- Full TypeScript support with exported types

### Technical

- Supports all Tailwind sizing utilities: `w-*`, `h-*`, `size-*`, `max-w-*`, `max-h-*`
- Handles responsive variants (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- Parses arbitrary values (`w-[300px]`, `h-[50vh]`)
- Infers aspect ratio from static image imports
- Custom spacing and breakpoint configuration
