import { instrument, getFiberFromHostInstance, isInstrumentationActive } from "bippy";
import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import React from "react";
import ReactDOM from "react-dom/client";
import { flushSync } from "react-dom";
import { reactResolver } from "../../src/frameworks/react.js";
import { createSourceResolver } from "../../src/resolve.js";

let container: HTMLDivElement;
let root: ReactDOM.Root;

beforeAll(() => {
  instrument({
    name: "dom-inspect-test",
    onCommitFiberRoot: () => {},
  });
});

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = ReactDOM.createRoot(container);
});

afterEach(() => {
  root.unmount();
  container.remove();
});

const renderSync = (element: React.ReactElement): void => {
  flushSync(() => root.render(element));
};

const Header = ({ title }: { title: string }) =>
  React.createElement("h1", { "data-testid": "header" }, title);

const Card = ({ children }: { children: React.ReactNode }) =>
  React.createElement("div", { className: "card", "data-testid": "card" }, children);

const App = () =>
  React.createElement(
    "main",
    { id: "app" },
    React.createElement(Card, null, React.createElement(Header, { title: "Hello" })),
  );

describe("reactResolver (real React 19 rendering)", () => {
  it("bippy instrumentation is active after instrument()", () => {
    expect(isInstrumentationActive()).toBe(true);
  });

  it("getFiberFromHostInstance finds fiber on rendered element", () => {
    renderSync(React.createElement(App));

    const header = container.querySelector("[data-testid='header']")!;
    expect(header).not.toBeNull();
    expect(getFiberFromHostInstance(header)).not.toBeNull();
  });

  it("resolveStack returns source frames", async () => {
    renderSync(React.createElement(App));

    const header = container.querySelector("[data-testid='header']")!;
    const stack = await reactResolver.resolveStack(header);

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].componentName).toBe("Header");
    expect(stack[0].filePath).toContain("react.test.ts");
  });

  it("resolveComponentName returns component name", async () => {
    renderSync(React.createElement(App));

    const header = container.querySelector("[data-testid='header']")!;
    const name = await reactResolver.resolveComponentName?.(header);

    expect(name).toBe("Header");
  });

  it("resolveElementInfo returns full metadata for leaf component", async () => {
    const { resolveElementInfo } = createSourceResolver();
    renderSync(React.createElement(App));

    const header = container.querySelector("[data-testid='header']")!;
    const info = await resolveElementInfo(header);

    expect(info.tagName).toBe("h1");
    expect(info.componentName).toBe("Header");
    expect(info.source).not.toBeNull();
    expect(info.source!.filePath).toContain("react.test.ts");
  });

  it("resolveElementInfo returns full metadata for wrapper component", async () => {
    const { resolveElementInfo } = createSourceResolver();
    renderSync(React.createElement(App));

    const card = container.querySelector("[data-testid='card']")!;
    const info = await resolveElementInfo(card);

    expect(info.tagName).toBe("div");
    expect(info.componentName).toBe("Card");
    expect(info.source).not.toBeNull();
  });

  it("resolveElementInfo for root element resolves component name", async () => {
    const { resolveElementInfo } = createSourceResolver();
    renderSync(React.createElement(App));

    const main = container.querySelector("#app")!;
    const info = await resolveElementInfo(main);

    expect(info.tagName).toBe("main");
    expect(info.componentName).toBe("App");
  });
});
