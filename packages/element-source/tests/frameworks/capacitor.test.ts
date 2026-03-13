import { instrument } from "bippy";
import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import React from "react";
import ReactDOM from "react-dom/client";
import { flushSync } from "react-dom";
import { createApp, type App } from "vue";
import { mount, unmount } from "svelte";
import VueApp from "../fixtures/VueApp.vue";
import SvelteParent from "../fixtures/SvelteParent.svelte";
import { createSourceResolver } from "../../src/resolve.js";
import { svelteResolver } from "../../src/frameworks/svelte.js";
import { vueResolver } from "../../src/frameworks/vue.js";

let container: HTMLDivElement;

beforeAll(() => {
  instrument({
    name: "capacitor-test",
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

const Button = () => React.createElement("button", { "data-testid": "cap-btn" }, "Tap me");

const CapacitorApp = () =>
  React.createElement("div", { className: "capacitor-webview" }, React.createElement(Button));

describe("Capacitor WebView (real browser rendering)", () => {
  describe("React in WebView", () => {
    it("resolves component name from React render", async () => {
      const root = ReactDOM.createRoot(container);
      flushSync(() => root.render(React.createElement(CapacitorApp)));

      const button = container.querySelector("[data-testid='cap-btn']")!;
      const { resolveElementInfo } = createSourceResolver();
      const info = await resolveElementInfo(button);

      expect(info.tagName).toBe("button");
      expect(info.componentName).toBe("Button");

      root.unmount();
    });
  });

  describe("Vue SFC in WebView", () => {
    let app: App | null = null;

    afterEach(() => {
      app?.unmount();
      app = null;
    });

    it("resolves Vue component source", async () => {
      app = createApp(VueApp);
      app.mount(container);

      const child = container.querySelector("[data-testid='vue-child']")!;
      const { resolveElementInfo } = createSourceResolver({ resolvers: [vueResolver] });
      const info = await resolveElementInfo(child);

      expect(info.tagName).toBe("span");
      expect(info.source).not.toBeNull();
      expect(info.source!.filePath).toContain("VueChild.vue");
    });

    it("resolves full Vue component hierarchy", async () => {
      app = createApp(VueApp);
      app.mount(container);

      const child = container.querySelector("[data-testid='vue-child']")!;
      const { resolveStack } = createSourceResolver({ resolvers: [vueResolver] });
      const stack = await resolveStack(child);

      const filePaths = stack.map((frame) => frame.filePath);
      expect(filePaths.some((path) => path.includes("VueChild.vue"))).toBe(true);
      expect(filePaths.some((path) => path.includes("VueApp.vue"))).toBe(true);
    });
  });

  describe("Svelte in WebView", () => {
    let component: Record<string, unknown> | null = null;

    afterEach(() => {
      if (component) unmount(component);
      component = null;
    });

    it("resolves Svelte component source", async () => {
      component = mount(SvelteParent, { target: container });

      const child = container.querySelector("[data-testid='svelte-child']")!;
      const { resolveElementInfo } = createSourceResolver({ resolvers: [svelteResolver] });
      const info = await resolveElementInfo(child);

      expect(info.tagName).toBe("p");
      expect(info.source).not.toBeNull();
      expect(info.source!.filePath).toContain("SvelteChild.svelte");
    });

    it("resolves Svelte parent component context", async () => {
      component = mount(SvelteParent, { target: container });

      const parent = container.querySelector("[data-testid='svelte-parent']")!;
      const { resolveStack } = createSourceResolver({ resolvers: [svelteResolver] });
      const stack = await resolveStack(parent);

      expect(stack.length).toBeGreaterThanOrEqual(1);
      expect(stack[0].filePath).toContain("SvelteParent.svelte");
    });
  });
});
