import { cx } from "./class-names.js";

describe("cx", () => {
  it("joins class names with spaces", () => {
    expect(cx("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy and empty strings", () => {
    expect(cx("a", undefined, "", false, null, "b")).toBe("a b");
  });

  it("splits on internal whitespace", () => {
    expect(cx("a  b", " c\t\nd ")).toBe("a b c d");
  });
});
