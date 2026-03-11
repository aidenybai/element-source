import { instrument } from "bippy";
import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import React from "react";
import ReactDOM from "react-dom/client";
import { flushSync } from "react-dom";
import { createApp } from "vue";
import { mount, unmount } from "svelte";
import VueApp from "./fixtures/VueApp.vue";
import SvelteParent from "./fixtures/SvelteParent.svelte";
import { createSourceResolver } from "../src/resolve.js";
import { svelteResolver } from "../src/frameworks/svelte.js";
import { vueResolver } from "../src/frameworks/vue.js";

let container: HTMLDivElement;

beforeAll(() => {
  instrument({
    name: "dom-inspect-integration-test",
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
    console.log("[integration react]", JSON.stringify(info, null, 2));

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
    console.log("[integration vue]", JSON.stringify(info, null, 2));

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
    console.log("[integration svelte]", JSON.stringify(info, null, 2));

    expect(info.tagName).toBe("p");
    expect(info.source).not.toBeNull();
    expect(info.source!.filePath).toContain("SvelteChild.svelte");
    expect(info.source!.lineNumber).toBeTypeOf("number");

    unmount(component);
  });
});
