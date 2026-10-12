import { describe, expect, it } from "vitest";
import { detectDocumentType } from "./document";

describe("detectDocumentType", () => {
  it("detects PDF from a Windows path", () => {
    expect(detectDocumentType("C:\\docs\\lecture.pdf")).toBe("pdf");
  });

  it("detects PPTX from a POSIX path", () => {
    expect(detectDocumentType("/home/user/slides.pptx")).toBe("pptx");
  });

  it("is case-insensitive", () => {
    expect(detectDocumentType("C:\\docs\\SLIDES.PPTX")).toBe("pptx");
  });

  it("returns null for an unsupported extension", () => {
    expect(detectDocumentType("C:\\docs\\notes.docx")).toBeNull();
  });

  it("returns null when there is no extension", () => {
    expect(detectDocumentType("C:\\docs\\README")).toBeNull();
  });
});
