import { instrument, getFiberFromHostInstance } from "bippy";
import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import React from "react";
import ReactDOM from "react-dom/client";
import { flushSync } from "react-dom";
import { createApp } from "vue";
import { mount, unmount } from "svelte";
import VueApp from "./fixtures/VueApp.vue";
import SvelteParent from "./fixtures/SvelteParent.svelte";
import { createSourceResolver } from "../src/resolve.js";
import { reactResolver } from "../src/frameworks/react.js";
import { svelteResolver } from "../src/frameworks/svelte.js";
import { vueResolver } from "../src/frameworks/vue.js";
import { solidResolver } from "../src/frameworks/solid.js";
import { getTagName } from "../src/utils/get-tag-name.js";

let container: HTMLDivElement;

beforeAll(() => {
  instrument({
    name: "resolve-integration-test",
    onCommitFiberRoot: () => {},
  });
});

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  container.remove();
});

describe("resolveElementInfo integration across real frameworks", () => {
  it("React: resolves component name from real render", async () => {
    const { resolveElementInfo } = createSourceResolver();

    const Button = () => React.createElement("button", { "data-testid": "react-btn" }, "Click");

    const root = ReactDOM.createRoot(container);
    flushSync(() => root.render(React.createElement(Button)));

    const element = container.querySelector("[data-testid='react-btn']")!;
    const info = await resolveElementInfo(element);

    expect(info.tagName).toBe("button");
    expect(info.componentName).toBe("Button");

    root.unmount();
  });

  it("Vue: resolves file path and hierarchy from real SFC render", async () => {
    const { resolveElementInfo } = createSourceResolver({ resolvers: [vueResolver] });

    const app = createApp(VueApp);
    app.mount(container);

    const element = container.querySelector("[data-testid='vue-child']")!;
    const info = await resolveElementInfo(element);

    expect(info.tagName).toBe("span");
    expect(info.stack.length).toBeGreaterThanOrEqual(1);
    expect(info.stack[0].filePath).toContain("VueChild.vue");

    app.unmount();
  });

  it("Svelte: resolves source location from real compiled component", async () => {
    const { resolveElementInfo } = createSourceResolver({ resolvers: [svelteResolver] });

    const component = mount(SvelteParent, { target: container });

    const element = container.querySelector("[data-testid='svelte-child']")!;
    const info = await resolveElementInfo(element);

    expect(info.tagName).toBe("p");
    expect(info.source).not.toBeNull();
    expect(info.source!.filePath).toContain("SvelteChild.svelte");
    expect(info.source!.lineNumber).toBeTypeOf("number");

    unmount(component);
  });
});

const REACT_FIBER_KEY_PREFIX = "__reactFiber$";

const extractFiberKey = (element: Element): string | null => {
  for (const key of Object.getOwnPropertyNames(element)) {
    if (key.startsWith(REACT_FIBER_KEY_PREFIX)) return key;
  }
  return null;
};

const createNodeWithFiber = (element: Element): object | null => {
  const fiberKey = extractFiberKey(element);
  if (!fiberKey) return null;
  return { [fiberKey]: Reflect.get(element, fiberKey) };
};

const Header = ({ title }: { title: string }) =>
  React.createElement("h1", { "data-testid": "env-header" }, title);

const ResolveApp = () =>
  React.createElement("main", null, React.createElement(Header, { title: "Hello" }));

describe("non-Element resolution (environment branching)", () => {
  let root: ReactDOM.Root;

  beforeEach(() => {
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    root.unmount();
  });

  const renderSync = (element: React.ReactElement): void => {
    flushSync(() => root.render(element));
  };

  it("resolveElementInfo resolves source from a plain object with fiber attached", async () => {
    renderSync(React.createElement(ResolveApp));
    const element = container.querySelector("[data-testid='env-header']")!;
    const fiberNode = createNodeWithFiber(element);
    expect(fiberNode).not.toBeNull();

    const { resolveElementInfo } = createSourceResolver();
    const info = await resolveElementInfo(fiberNode!);

    expect(info.componentName).toBe("Header");
    expect(info.source).not.toBeNull();
    expect(info.source!.filePath).toContain("resolve.test.ts");
    expect(info.tagName).toBe("");
  });

  it("resolveStack returns source frames from a plain object", async () => {
    renderSync(React.createElement(ResolveApp));
    const element = container.querySelector("[data-testid='env-header']")!;
    const fiberNode = createNodeWithFiber(element);

    const { resolveStack } = createSourceResolver();
    const stack = await resolveStack(fiberNode!);

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].componentName).toBe("Header");
  });

  it("resolveComponentName returns name from a plain object", async () => {
    renderSync(React.createElement(ResolveApp));
    const element = container.querySelector("[data-testid='env-header']")!;
    const fiberNode = createNodeWithFiber(element);

    const { resolveComponentName } = createSourceResolver();
    const name = await resolveComponentName(fiberNode!);

    expect(name).toBe("Header");
  });

  it("framework resolvers are skipped for non-Element inputs", async () => {
    renderSync(React.createElement(ResolveApp));
    const element = container.querySelector("[data-testid='env-header']")!;
    const fiberNode = createNodeWithFiber(element);

    const { resolveElementInfo } = createSourceResolver({
      resolvers: [svelteResolver, vueResolver, solidResolver],
    });
    const info = await resolveElementInfo(fiberNode!);

    expect(info.source).not.toBeNull();
    expect(info.componentName).toBe("Header");
  });

  it("reactResolver works directly with non-Element objects", async () => {
    renderSync(React.createElement(ResolveApp));
    const element = container.querySelector("[data-testid='env-header']")!;
    const fiberNode = createNodeWithFiber(element);

    const stack = await reactResolver.resolveStack(fiberNode!);
    expect(stack.length).toBeGreaterThanOrEqual(1);

    const name = await reactResolver.resolveComponentName(fiberNode!);
    expect(name).toBe("Header");
  });

  it("getFiberFromHostInstance works for both Element and plain object", () => {
    renderSync(React.createElement(ResolveApp));
    const element = container.querySelector("[data-testid='env-header']")!;

    expect(getFiberFromHostInstance(element)).not.toBeNull();
    expect(getFiberFromHostInstance(createNodeWithFiber(element))).not.toBeNull();
  });

  it("resolveElementInfo resolves source from RN-like view with fiber", async () => {
    renderSync(React.createElement(ResolveApp));
    const element = container.querySelector("[data-testid='env-header']")!;
    const fiberKey = extractFiberKey(element)!;

    const rnLikeView = { _nativeTag: 42, [fiberKey]: Reflect.get(element, fiberKey) };
    const { resolveElementInfo } = createSourceResolver();
    const info = await resolveElementInfo(rnLikeView);

    expect(info.componentName).toBe("Header");
    expect(info.source).not.toBeNull();
    expect(info.tagName).toBe("");
  });
});

describe("getTagName", () => {
  it("returns lowercase tagName for DOM elements", () => {
    expect(getTagName(document.createElement("div"))).toBe("div");
    expect(getTagName(document.createElement("my-component"))).toBe("my-component");
  });

  it("returns nodeName for Ink-like nodes", () => {
    expect(getTagName({ nodeName: "ink-box" })).toBe("ink-box");
    expect(getTagName({ nodeName: "INK-ROOT" })).toBe("ink-root");
  });

  it("returns empty string for objects without tag/node name", () => {
    expect(getTagName({})).toBe("");
    expect(getTagName({ _nativeTag: 123 })).toBe("");
    expect(getTagName({ tagName: 123 })).toBe("");
  });

  it("prefers tagName over nodeName", () => {
    expect(getTagName({ tagName: "DIV", nodeName: "ink-box" })).toBe("div");
  });
});
