import { describe, expect, it } from "vitest";

import { getAltFromSrc } from "./get-alt-from-src.js";

describe("getAltFromSrc", () => {
  it("extracts filename without extension", () => {
    expect(getAltFromSrc("/images/logo.png")).toBe("logo");
  });

  it("handles paths with multiple dots", () => {
    expect(getAltFromSrc("/images/my.image.webp")).toBe("my.image");
  });

  it("handles hyphenated names", () => {
    expect(getAltFromSrc("/brands/a16z-crypto.webp")).toBe("a16z-crypto");
  });

  it("returns empty string for empty input", () => {
    expect(getAltFromSrc("")).toBe("");
  });

  it("handles filename only (no path)", () => {
    expect(getAltFromSrc("avatar.jpg")).toBe("avatar");
  });
});
