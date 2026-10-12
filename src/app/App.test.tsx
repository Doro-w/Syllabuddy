import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the workspace layout", () => {
    render(<App />);
    expect(screen.getByText("Document Viewer")).toBeInTheDocument();
  });
});
