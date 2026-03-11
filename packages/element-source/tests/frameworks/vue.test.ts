import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createApp, type App } from "vue";
import VueChild from "../fixtures/VueChild.vue";
import VueApp from "../fixtures/VueApp.vue";
import { vueResolver } from "../../src/frameworks/vue.js";

let container: HTMLDivElement;
let app: App | null;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  app?.unmount();
  app = null;
  container.remove();
});

describe("vueResolver (real Vue 3 SFC rendering)", () => {
  it("attaches __vueParentComponent with __file on rendered SFC elements", () => {
    app = createApp(VueChild);
    app.mount(container);

    const child = container.querySelector("[data-testid='vue-child']")!;
    expect(child).not.toBeNull();

    const component = Reflect.get(child, "__vueParentComponent");
    console.log("[vue] __vueParentComponent exists:", Boolean(component));
    console.log("[vue] component type keys:", Object.keys(component?.type ?? {}));
    console.log("[vue] component type __file:", component?.type?.__file);
    expect(component).toBeTruthy();
    expect(component.type.__file).toContain("VueChild.vue");
  });

  it("resolves file path from SFC", async () => {
    app = createApp(VueChild);
    app.mount(container);

    const child = container.querySelector("[data-testid='vue-child']")!;
    const stack = await vueResolver.resolveStack(child);
    console.log("[vue resolveStack child SFC]", JSON.stringify(stack, null, 2));

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toContain("VueChild.vue");
  });

  it("resolves full component hierarchy from nested SFCs", async () => {
    app = createApp(VueApp);
    app.mount(container);

    const child = container.querySelector("[data-testid='vue-child']")!;
    const stack = await vueResolver.resolveStack(child);
    console.log("[vue resolveStack hierarchy SFC]", JSON.stringify(stack, null, 2));

    expect(stack).toHaveLength(3);

    const filePaths = stack.map((frame) => frame.filePath);
    expect(filePaths[0]).toContain("VueChild.vue");
    expect(filePaths[1]).toContain("VueParent.vue");
    expect(filePaths[2]).toContain("VueApp.vue");

    const names = stack.map((frame) => frame.componentName).filter(Boolean);
    expect(names).toContain("VueParent");
    expect(names).toContain("VueApp");
  });

  it("resolves stack for parent element with component name", async () => {
    app = createApp(VueApp);
    app.mount(container);

    const parent = container.querySelector("[data-testid='vue-parent']")!;
    const stack = await vueResolver.resolveStack(parent);
    console.log("[vue resolveStack parent SFC]", JSON.stringify(stack, null, 2));

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toContain("VueParent.vue");
    expect(stack[0].componentName).toBe("VueParent");
  });

  it("resolves stack for root app element", async () => {
    app = createApp(VueApp);
    app.mount(container);

    const root = container.querySelector("#vue-app")!;
    const stack = await vueResolver.resolveStack(root);
    console.log("[vue resolveStack root SFC]", JSON.stringify(stack, null, 2));

    expect(stack.length).toBeGreaterThanOrEqual(1);
    expect(stack[0].filePath).toContain("VueApp.vue");
    expect(stack[0].componentName).toBe("VueApp");
  });
});
