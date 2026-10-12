import { describe, expect, it } from "vitest";
import { basename } from "./path";

describe("basename", () => {
  it("returns the file name from a Windows path", () => {
    expect(basename("C:\\docs\\lecture.pdf")).toBe("lecture.pdf");
  });

  it("returns the file name from a POSIX path", () => {
    expect(basename("/home/user/lecture.pdf")).toBe("lecture.pdf");
  });

  it("returns the input when there is no separator", () => {
    expect(basename("lecture.pdf")).toBe("lecture.pdf");
  });
});
