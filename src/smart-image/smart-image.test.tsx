import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { cx } from "../internal/class-names.js";
import { WHITESPACE_REGEX } from "../internal/constants.js";
import { createSmartImage } from "./create-smart-image.js";
import { SmartImage } from "./smart-image.js";

// Mock next/image
vi.mock("next/image", () => ({
  default(props: Record<string, unknown>) {
    // Drop Next-specific props that React warns about when rendered to DOM
    const { fill: _fill, ...rest } = props as Record<string, unknown> & { fill?: unknown };
    // biome-ignore lint/a11y/useAltText: mock component for testing
    // biome-ignore lint/correctness/useImageSize: mock component for testing
    // biome-ignore lint/performance/noImgElement: mock component for testing
    return <img {...rest} />;
  },
}));

describe("SmartImage", () => {
  it("renders with inferred sizes from className", () => {
    render(<SmartImage className="size-11" src="/test.png" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("sizes", "44px");
  });

  it("derives alt from src filename", () => {
    render(<SmartImage className="size-11" src="/images/my-image.webp" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "my-image");
  });

  it("uses provided alt over derived", () => {
    render(<SmartImage alt="Custom alt" className="size-11" src="/test.png" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Custom alt");
  });

  it("uses empty alt for aria-hidden images", () => {
    const { container } = render(<SmartImage aria-hidden className="size-11" src="/test.png" />);
    // aria-hidden makes the img presentational, so query directly
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
  });

  it("uses explicit sizes over inferred", () => {
    render(<SmartImage className="size-11" sizes="100vw" src="/test.png" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("sizes", "100vw");
  });

  it("applies imgClassName to the image", () => {
    render(<SmartImage className="size-11" imgClassName="object-cover" src="/test.png" />);
    const img = screen.getByRole("img");
    expect(img).toHaveClass("object-cover");
  });

  it("supports injecting a custom cx for 'last class wins' semantics", () => {
    const SmartImageMerged = createSmartImage({
      cx: (...values) => {
        const base = cx(...values);
        const tokens = base.split(WHITESPACE_REGEX).filter(Boolean);

        const hasBlock = tokens.includes("block");
        const hasInlineBlock = tokens.includes("inline-block");
        const hasObjectCover = tokens.includes("object-cover");

        return tokens
          .filter((token) => !(hasBlock && hasInlineBlock && token === "inline-block"))
          .filter((token) => !(hasObjectCover && token === "object-contain"))
          .join(" ");
      },
    });

    const { container } = render(
      <SmartImageMerged className="block size-11" imgClassName="object-cover" src="/test.png" />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass("block");
    expect(wrapper).not.toHaveClass("inline-block");

    const img = screen.getByRole("img");
    expect(img).toHaveClass("object-cover");
    expect(img).not.toHaveClass("object-contain");
  });

  it("falls back to 100vw in production when inference fails", () => {
    const originalEnv = process.env.NODE_ENV;
    vi.stubEnv("NODE_ENV", "production");

    render(
      <SmartImage className="w-full" sizes={undefined as unknown as string} src="/test.png" />
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("sizes", "100vw");

    vi.stubEnv("NODE_ENV", originalEnv ?? "test");
  });
});
