import { describe, expect, it } from "vitest";
import { toDisplayPageNumber, toPageIndex } from "./page";

describe("page index conversion", () => {
  it("converts a zero-based page index to a one-based display number", () => {
    expect(toDisplayPageNumber(0)).toBe(1);
    expect(toDisplayPageNumber(2)).toBe(3);
  });

  it("converts a one-based display number to a zero-based page index", () => {
    expect(toPageIndex(1)).toBe(0);
    expect(toPageIndex(3)).toBe(2);
  });

  it("round-trips between representations", () => {
    expect(toDisplayPageNumber(toPageIndex(5))).toBe(5);
  });
});
