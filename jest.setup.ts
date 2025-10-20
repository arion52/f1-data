import "@testing-library/jest-dom";
import React from "react";

class ResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe() {}
  unobserve() {}
  disconnect() {}
}

(
  globalThis as unknown as { ResizeObserver: typeof ResizeObserver }
).ResizeObserver = ResizeObserver;

jest.mock("next/image", () => {
  return {
    __esModule: true,
    default: ({ alt, ...props }: { alt: string }) =>
      React.createElement("img", { alt, ...props }),
  };
});
