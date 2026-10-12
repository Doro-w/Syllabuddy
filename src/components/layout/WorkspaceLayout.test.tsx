import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkspaceLayout } from "./WorkspaceLayout";

describe("WorkspaceLayout", () => {
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
});
