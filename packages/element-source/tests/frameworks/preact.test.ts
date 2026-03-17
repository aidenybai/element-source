import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement, render, options, Fragment } from "preact";
import { preactResolver } from "../../src/frameworks/preact.js";

let container: HTMLDivElement;
let restoreHooks: (() => void) | null = null;

const getVNodeDom = (vnode: Record<string, unknown>): Element | null => {
  const dom = vnode._dom ?? vnode.__e;
  return dom instanceof Element ? dom : null;
};

const installSourceHooks = () => {
  const previousVnodeHook = options.vnode;
  const previousDiffedHook = options.diffed;

  (options as Record<string, unknown>).vnode = (vnode: Record<string, unknown>) => {
    const props = vnode.props as Record<string, unknown> | null;
    if (vnode.type !== null && props !== null && props !== undefined && "__source" in props) {
      const cleanedProps: Record<string, unknown> = {};
      for (const key in props) {
        if (key === "__source") vnode.__source = props[key];
        else cleanedProps[key] = props[key];
      }
      vnode.props = cleanedProps;
    }
    if (previousVnodeHook) (previousVnodeHook as (vnode: unknown) => void)(vnode);
  };

  (options as Record<string, unknown>).diffed = (vnode: Record<string, unknown>) => {
    const dom = getVNodeDom(vnode);
    if (typeof vnode.type === "string" && dom) {
      (dom as Record<string, unknown>).__preactVNode = vnode;
    }
    if (previousDiffedHook) (previousDiffedHook as (vnode: unknown) => void)(vnode);
  };

  return () => {
    (options as Record<string, unknown>).vnode = previousVnodeHook;
    (options as Record<string, unknown>).diffed = previousDiffedHook;
  };
};

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  restoreHooks = installSourceHooks();
});

afterEach(() => {
  render(null, container);
  restoreHooks?.();
  restoreHooks = null;
  container.remove();
});

const ChildComponent = (props: { text: string }) =>
  createElement(
    "span",
    {
      "data-testid": "preact-child",
      __source: { fileName: "src/components/Child.tsx", lineNumber: 8 },
    } as Record<string, unknown>,
    props.text,
  );

const ParentComponent = () =>
  createElement(
    "div",
    {
      "data-testid": "preact-parent",
      __source: { fileName: "src/components/Parent.tsx", lineNumber: 5 },
    } as Record<string, unknown>,
    createElement(ChildComponent, {
      text: "hello",
      __source: { fileName: "src/components/Parent.tsx", lineNumber: 6 },
    } as Record<string, unknown>),
  );

const AppComponent = () =>
  createElement(ParentComponent, {
    __source: { fileName: "src/App.tsx", lineNumber: 10 },
  } as Record<string, unknown>);

describe("preactResolver (real Preact rendering with source hooks)", () => {
  it("resolves source from a rendered Preact element", async () => {
    render(
      createElement(ChildComponent, {
        text: "test",
        __source: { fileName: "src/Test.tsx", lineNumber: 3 },
      } as Record<string, unknown>),
      container,
    );

    const element = container.querySelector("[data-testid='preact-child']")!;
    expect(element).not.toBeNull();

    const stack = await preactResolver.resolveStack(element);

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toBe("src/components/Child.tsx");
    expect(stack[0].lineNumber).toBe(8);
    expect(stack[0].componentName).toBe("ChildComponent");
  });

  it("resolves component name from nearest composite parent", async () => {
    render(createElement(AppComponent, null), container);

    const child = container.querySelector("[data-testid='preact-child']")!;
    expect(child).not.toBeNull();

    const stack = await preactResolver.resolveStack(child);

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].componentName).toBe("ChildComponent");
  });

  it("resolves full component hierarchy stack", async () => {
    render(createElement(AppComponent, null), container);

    const child = container.querySelector("[data-testid='preact-child']")!;
    const stack = await preactResolver.resolveStack(child);

    expect(stack.length).toBeGreaterThanOrEqual(2);

    const filePaths = stack.map((frame) => frame.filePath);
    expect(filePaths[0]).toBe("src/components/Child.tsx");

    const names = stack.map((frame) => frame.componentName).filter(Boolean);
    expect(names).toContain("ChildComponent");
  });

  it("resolves stack for parent wrapper element", async () => {
    render(createElement(AppComponent, null), container);

    const parent = container.querySelector("[data-testid='preact-parent']")!;
    expect(parent).not.toBeNull();

    const stack = await preactResolver.resolveStack(parent);

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toBe("src/components/Parent.tsx");
    expect(stack[0].componentName).toBe("ParentComponent");
  });

  it("returns empty stack for elements without __preactVNode", async () => {
    const orphan = document.createElement("div");
    container.appendChild(orphan);

    const stack = await preactResolver.resolveStack(orphan);
    expect(stack).toHaveLength(0);
  });

  it("walks to nearest parent element with __preactVNode", async () => {
    render(
      createElement(ChildComponent, {
        text: "test",
        __source: { fileName: "src/Test.tsx", lineNumber: 1 },
      } as Record<string, unknown>),
      container,
    );

    const element = container.querySelector("[data-testid='preact-child']")!;
    const wrapper = document.createElement("em");
    element.appendChild(wrapper);

    const stack = await preactResolver.resolveStack(wrapper);
    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toBe("src/components/Child.tsx");
  });

  it("handles Fragment children", async () => {
    const FragApp = () =>
      createElement(
        Fragment,
        null,
        createElement(
          "span",
          {
            "data-testid": "frag-a",
            __source: { fileName: "src/Frag.tsx", lineNumber: 3 },
          } as Record<string, unknown>,
          "a",
        ),
        createElement(
          "span",
          {
            "data-testid": "frag-b",
            __source: { fileName: "src/Frag.tsx", lineNumber: 4 },
          } as Record<string, unknown>,
          "b",
        ),
      );

    render(
      createElement(FragApp, {
        __source: { fileName: "src/Main.tsx", lineNumber: 1 },
      } as Record<string, unknown>),
      container,
    );

    const spanA = container.querySelector("[data-testid='frag-a']")!;
    const spanB = container.querySelector("[data-testid='frag-b']")!;

    const stackA = await preactResolver.resolveStack(spanA);
    const stackB = await preactResolver.resolveStack(spanB);

    expect(stackA.length).toBeGreaterThanOrEqual(1);
    expect(stackA[0].filePath).toBe("src/Frag.tsx");
    expect(stackA[0].lineNumber).toBe(3);

    expect(stackB.length).toBeGreaterThanOrEqual(1);
    expect(stackB[0].filePath).toBe("src/Frag.tsx");
    expect(stackB[0].lineNumber).toBe(4);
  });

  it("reads __source from props fallback when not on vnode directly", async () => {
    const previousDiffed = options.diffed;
    (options as Record<string, unknown>).diffed = (vnode: Record<string, unknown>) => {
      const dom = getVNodeDom(vnode);
      if (typeof vnode.type === "string" && dom) {
        (dom as Record<string, unknown>).__preactVNode = vnode;
      }
      if (previousDiffed) (previousDiffed as (vnode: unknown) => void)(vnode);
    };

    render(
      createElement("div", {
        "data-testid": "props-source",
        __source: { fileName: "src/PropsSource.tsx", lineNumber: 99 },
      } as Record<string, unknown>),
      container,
    );

    const element = container.querySelector("[data-testid='props-source']")!;
    const stack = await preactResolver.resolveStack(element);

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toBe("src/PropsSource.tsx");
    expect(stack[0].lineNumber).toBe(99);

    (options as Record<string, unknown>).diffed = previousDiffed;
  });
});
