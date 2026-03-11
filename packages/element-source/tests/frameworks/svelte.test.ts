import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount, unmount } from "svelte";
import SvelteParent from "../fixtures/SvelteParent.svelte";
import SvelteChild from "../fixtures/SvelteChild.svelte";
import { svelteResolver } from "../../src/frameworks/svelte.js";

let container: HTMLDivElement;
let component: Record<string, unknown>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  if (component) unmount(component);
  container.remove();
});

describe("svelteResolver (real Svelte 5 rendering)", () => {
  it("resolves source from a rendered Svelte element", async () => {
    component = mount(SvelteChild, { target: container });

    const element = container.querySelector("[data-testid='svelte-child']")!;
    expect(element).not.toBeNull();

    const meta = Reflect.get(element, "__svelte_meta");
    console.log("[svelte] __svelte_meta on child:", JSON.stringify(meta, null, 2));

    const stack = await svelteResolver.resolveStack(element);
    console.log("[svelte resolveStack child]", JSON.stringify(stack, null, 2));

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toContain("SvelteChild.svelte");
    expect(stack[0].lineNumber).toBeTypeOf("number");
  });

  it("resolves source with parent component context", async () => {
    component = mount(SvelteParent, { target: container });

    const child = container.querySelector("[data-testid='svelte-child']")!;
    expect(child).not.toBeNull();

    const stack = await svelteResolver.resolveStack(child);
    console.log("[svelte resolveStack nested]", JSON.stringify(stack, null, 2));

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toContain("SvelteChild.svelte");
  });

  it("resolves parent wrapper element", async () => {
    component = mount(SvelteParent, { target: container });

    const parent = container.querySelector("[data-testid='svelte-parent']")!;
    expect(parent).not.toBeNull();

    const stack = await svelteResolver.resolveStack(parent);
    console.log("[svelte resolveStack parent]", JSON.stringify(stack, null, 2));

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toContain("SvelteParent.svelte");
  });
});
