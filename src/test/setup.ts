import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount components rendered by each test so the DOM does not leak between
// cases. React Testing Library auto-cleanup requires `globals: true`, which is
// not enabled here, so register it explicitly.
afterEach(() => {
  cleanup();
});

// react-resizable-panels uses ResizeObserver to measure panel sizes.
// jsdom does not implement it, so provide a no-op stand-in for tests.
class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver;
