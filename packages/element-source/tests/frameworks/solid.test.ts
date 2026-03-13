import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render } from "solid-js/web";
import html from "solid-js/html";
import { solidResolver } from "../../src/frameworks/solid.js";

let container: HTMLDivElement;
let dispose: (() => void) | null;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  dispose?.();
  dispose = null;
  container.remove();
  Reflect.deleteProperty(window, "__SOLID_RUNTIME_MODULES__");
});

describe("solidResolver (real Solid rendering)", () => {
  it("solid render sets $$click on delegated event elements", () => {
    const handler = () => {};

    dispose = render(
      () => html`<button data-testid="solid-btn" onclick=${handler}>Click</button>`,
      container,
    );

    const button = container.querySelector("[data-testid='solid-btn']")!;
    expect(button).not.toBeNull();
    expect(Reflect.get(button, "$$click")).toBeTypeOf("function");
  });

  it("resolves source when handler found in runtime modules", async () => {
    const handler = () => {
      return "solid_real_render_unique_marker_12345";
    };

    dispose = render(
      () => html`<button data-testid="solid-btn2" onclick=${handler}>Click</button>`,
      container,
    );

    const button = container.querySelector("[data-testid='solid-btn2']")!;
    const handlerSource = String(Reflect.get(button, "$$click"));

    Reflect.set(window, "__SOLID_RUNTIME_MODULES__", [
      {
        url: "http://localhost:3000/src/components/Counter.tsx",
        content: `const Counter = () => { ${handlerSource} location: "src/components/Counter.tsx:42:8" };`,
      },
    ]);

    const stack = await solidResolver.resolveStack(button);

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toBe("src/components/Counter.tsx");
    expect(stack[0].lineNumber).toBe(42);
    expect(stack[0].columnNumber).toBe(8);
  });

  it("walks DOM to find handler on parent", async () => {
    const parentHandler = () => {
      return "solid_parent_handler_unique_abc";
    };

    dispose = render(
      () =>
        html`<div data-testid="solid-parent" onclick=${parentHandler}>
          <span data-testid="solid-child">nested</span>
        </div>`,
      container,
    );

    const child = container.querySelector("[data-testid='solid-child']")!;
    const parent = container.querySelector("[data-testid='solid-parent']")!;
    const parentClickSource = String(Reflect.get(parent, "$$click"));

    Reflect.set(window, "__SOLID_RUNTIME_MODULES__", [
      {
        url: "http://localhost:3000/src/components/Parent.tsx",
        content: `${parentClickSource} location: "src/components/Parent.tsx:15:4"`,
      },
    ]);

    const stack = await solidResolver.resolveStack(child);

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toBe("src/components/Parent.tsx");
  });

  it("returns empty stack for elements without handlers", async () => {
    dispose = render(
      () =>
        html`
          <div data-testid="solid-no-handler">no events</div>
        `,
      container,
    );

    const element = container.querySelector("[data-testid='solid-no-handler']")!;
    const stack = await solidResolver.resolveStack(element);

    expect(stack).toHaveLength(0);
  });
});
