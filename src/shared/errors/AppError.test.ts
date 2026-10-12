import { describe, expect, it } from "vitest";
import { appError } from "./AppError";

describe("appError", () => {
  it("creates an error with a category and message", () => {
    const error = appError("document", "unsupported file type");
    expect(error.category).toBe("document");
    expect(error.message).toBe("unsupported file type");
  });

  it("carries an optional correlation id", () => {
    const error = appError("ai", "provider timeout", { correlationId: "req-1" });
    expect(error.correlationId).toBe("req-1");
  });
});
