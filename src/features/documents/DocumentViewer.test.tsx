import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentViewer } from "./DocumentViewer";
import { readFileBytes } from "../../services/filesystem/readFile";

vi.mock("../../services/filesystem/readFile", () => ({
  readFileBytes: vi.fn(),
}));

const readFileBytesMock = vi.mocked(readFileBytes);

// Captures the `onTotalChange` callbacks the child viewers receive so tests can
// drive the "document finished loading" signal without touching react-pdf or
// pptx-renderer in jsdom.
const viewers = vi.hoisted(() => ({
  pdfOnTotalChange: null as null | ((total: number) => void),
  pptxOnTotalChange: null as null | ((total: number) => void),
}));

vi.mock("./PdfViewer", () => ({
  PdfViewer: (props: { page: number; onTotalChange: (total: number) => void }) => {
    viewers.pdfOnTotalChange = props.onTotalChange;
    return <div data-testid="pdf-viewer">PDF page {props.page}</div>;
  },
}));

vi.mock("./PptxViewer", () => ({
  PptxViewer: (props: { page: number; onTotalChange: (total: number) => void }) => {
    viewers.pptxOnTotalChange = props.onTotalChange;
    return <div data-testid="pptx-viewer">Slide {props.page}</div>;
  },
}));

describe("DocumentViewer", () => {
  beforeEach(() => {
    readFileBytesMock.mockReset();
    viewers.pdfOnTotalChange = null;
    viewers.pptxOnTotalChange = null;
  });

  it("shows a loading state while reading the file", () => {
    readFileBytesMock.mockReturnValue(new Promise<ArrayBuffer>(() => {}));
    render(<DocumentViewer path="C:\\docs\\lecture.pdf" />);

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders the PDF viewer and navigates between pages", async () => {
    readFileBytesMock.mockResolvedValue(new ArrayBuffer(8));
    render(<DocumentViewer path="C:\\docs\\lecture.pdf" />);

    expect(await screen.findByTestId("pdf-viewer")).toBeInTheDocument();

    act(() => viewers.pdfOnTotalChange?.(3));
    expect(screen.getByText("Page 1 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByTestId("pdf-viewer")).toHaveTextContent("PDF page 2");

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByTestId("pdf-viewer")).toHaveTextContent("PDF page 1");
  });

  it("renders the PPTX viewer with a Slide label", async () => {
    readFileBytesMock.mockResolvedValue(new ArrayBuffer(8));
    render(<DocumentViewer path="C:\\docs\\deck.pptx" />);

    expect(await screen.findByTestId("pptx-viewer")).toBeInTheDocument();

    act(() => viewers.pptxOnTotalChange?.(4));
    expect(screen.getByText("Slide 1 / 4")).toBeInTheDocument();
  });

  it("shows an error for an unsupported document type", async () => {
    render(<DocumentViewer path="C:\\docs\\notes.docx" />);

    expect(
      await screen.findByText(/unsupported document type/i),
    ).toBeInTheDocument();
  });

  it("shows an error when the file cannot be read", async () => {
    readFileBytesMock.mockRejectedValue(new Error("read failed"));
    render(<DocumentViewer path="C:\\docs\\lecture.pdf" />);

    expect(await screen.findByText(/read failed/i)).toBeInTheDocument();
  });
});
