import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { open } from "@tauri-apps/plugin-dialog";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WorkspaceLayout } from "./WorkspaceLayout";

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
}));

vi.mock("../../features/documents/DocumentViewer", () => ({
  DocumentViewer: ({ path }: { path: string }) => (
    <div data-testid="document-viewer">Document: {path}</div>
  ),
}));

const openMock = vi.mocked(open);

describe("WorkspaceLayout", () => {
  beforeEach(() => {
    openMock.mockReset();
  });

  it("renders the three workspace areas", () => {
    render(<WorkspaceLayout />);

    expect(screen.getByText("Left Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Document Viewer")).toBeInTheDocument();
    expect(screen.getByText("Right Sidebar")).toBeInTheDocument();
  });

  it("renders the toolbar actions and AI chat bar", () => {
    render(<WorkspaceLayout />);

    expect(screen.getByRole("button", { name: "Open File" })).toBeInTheDocument();
    expect(
      screen.getByText("AI Chat — Current Document + Page + Selected Text"),
    ).toBeInTheDocument();
  });

  it("shows the selected document after opening a file", async () => {
    openMock.mockResolvedValue("C:\\docs\\lecture.pdf");
    render(<WorkspaceLayout />);

    fireEvent.click(screen.getByRole("button", { name: "Open File" }));

    expect(await screen.findByTestId("document-viewer")).toHaveTextContent(
      "C:\\docs\\lecture.pdf",
    );
  });

  it("keeps the empty state when the dialog is cancelled", async () => {
    openMock.mockResolvedValue(null);
    render(<WorkspaceLayout />);

    fireEvent.click(screen.getByRole("button", { name: "Open File" }));

    await waitFor(() => expect(openMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText("No document open")).toBeInTheDocument();
  });
});
