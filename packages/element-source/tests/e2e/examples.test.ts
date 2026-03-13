import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser, type Page } from "playwright";
import { type ChildProcess } from "node:child_process";
import { type Server } from "node:http";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { serveDirectory } from "./serve.js";
import { startDevServer, stopDevServer } from "./dev-server.js";

const EXAMPLES_ROOT = resolve(import.meta.dirname, "../../../../examples");
const BASE_PORT = 4200;

interface StaticApp {
  name: string;
  distPath: string;
  port: number;
}

interface DevServerApp {
  name: string;
  directory: string;
  port: number;
}

const STATIC_APPS: StaticApp[] = [
  { name: "vite-react", distPath: "vite-react/dist", port: BASE_PORT },
  { name: "vite-vue", distPath: "vite-vue/dist", port: BASE_PORT + 1 },
  { name: "vite-svelte", distPath: "vite-svelte/dist", port: BASE_PORT + 2 },
  { name: "vite-solid", distPath: "vite-solid/dist", port: BASE_PORT + 3 },
  { name: "webpack-react", distPath: "webpack-react/dist", port: BASE_PORT + 4 },
  { name: "react-router", distPath: "react-router/dist", port: BASE_PORT + 5 },
  { name: "nextjs", distPath: "nextjs/out", port: BASE_PORT + 6 },
  { name: "astro", distPath: "astro/dist", port: BASE_PORT + 7 },
];

const DEV_SERVER_APPS: DevServerApp[] = [
  { name: "tanstack-start", directory: "tanstack-start", port: 4220 },
];
// HACK: Remix excluded -- requires server runtime with custom start. Capacitor/Expo/Ink excluded -- no browser.

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch();
});

afterAll(async () => {
  await browser?.close();
});

const runInspectorTests = (getPage: () => Page) => {
  it("renders sample cards", async () => {
    const count = await getPage().locator("[data-testid='sample-card']").count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it("has inspector toggle button", async () => {
    const visible = await getPage().locator("[data-testid='inspector-toggle']").isVisible();
    expect(visible).toBe(true);
  });

  it("inspector activates on toggle click", async () => {
    await getPage().locator("[data-testid='inspector-toggle']").click();
    const text = await getPage().locator("[data-testid='inspector-toggle']").textContent();
    expect(text?.toLowerCase()).toContain("stop");
  });

  it("clicking element shows result panel with source info", async () => {
    await getPage().locator("[data-testid='sample-card']").first().click();
    await getPage()
      .locator("[data-testid='result-panel']")
      .waitFor({ state: "visible", timeout: 5000 });
    const visible = await getPage().locator("[data-testid='result-panel']").isVisible();
    expect(visible).toBe(true);
  });
};

const testStaticApp = (app: StaticApp) => {
  const distDir = resolve(EXAMPLES_ROOT, app.distPath);

  describe(app.name, () => {
    let server: Server;
    let page: Page;

    beforeAll(async () => {
      if (!existsSync(distDir)) return;
      const result = await serveDirectory(distDir, app.port);
      server = result.server;
      page = await browser.newPage();
      await page.goto(result.url, { waitUntil: "networkidle" });
    });

    afterAll(async () => {
      await page?.close();
      server?.close();
    });

    it("dist directory exists (app was built)", () => {
      expect(existsSync(distDir)).toBe(true);
    });

    it("page loads and renders content", async () => {
      await page.reload({ waitUntil: "networkidle" });
      const bodyText = await page.locator("body").textContent();
      expect(bodyText?.length).toBeGreaterThan(0);
    });

    runInspectorTests(() => page);
  });
};

const testDevServerApp = (app: DevServerApp) => {
  const appDir = resolve(EXAMPLES_ROOT, app.directory);

  describe(app.name, () => {
    let devProcess: ChildProcess;
    let page: Page;

    beforeAll(async () => {
      if (!existsSync(appDir)) return;
      const result = await startDevServer(appDir, app.port);
      devProcess = result.process;
      page = await browser.newPage();
      await page.goto(result.url, { waitUntil: "networkidle" });
    }, 60000);

    afterAll(async () => {
      await page?.close();
      if (devProcess) await stopDevServer(devProcess);
    });

    it("app directory exists", () => {
      expect(existsSync(appDir)).toBe(true);
    });

    runInspectorTests(() => page);
  });
};

const testAstroMultiFramework = () => {
  const distDir = resolve(EXAMPLES_ROOT, "astro/dist");

  describe("astro-multi-framework", () => {
    let server: Server;
    let page: Page;

    beforeAll(async () => {
      if (!existsSync(distDir)) return;
      const result = await serveDirectory(distDir, BASE_PORT + 10);
      server = result.server;
      page = await browser.newPage();
      await page.goto(result.url, { waitUntil: "networkidle" });
    });

    afterAll(async () => {
      await page?.close();
      server?.close();
    });

    it("renders React island (sample-card)", async () => {
      const count = await page.locator("[data-testid='sample-card']").count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it("renders Svelte island (svelte-card)", async () => {
      const count = await page.locator("[data-testid='svelte-card']").count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it("renders Vue island (vue-card)", async () => {
      const count = await page.locator("[data-testid='vue-card']").count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it("renders Solid island (solid-card)", async () => {
      const count = await page.locator("[data-testid='solid-card']").count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it("inspector resolves source from React island", async () => {
      await page.locator("[data-testid='inspector-toggle']").click();
      await page.locator("[data-testid='sample-card']").click();
      await page.locator("[data-testid='result-panel']").waitFor({ state: "visible", timeout: 5000 });
      expect(await page.locator("[data-testid='result-panel']").isVisible()).toBe(true);
    });

    it("inspector resolves source from Svelte island", async () => {
      await page.locator("[data-testid='svelte-card']").click();
      await page.locator("[data-testid='result-panel']").waitFor({ state: "visible", timeout: 5000 });
      expect(await page.locator("[data-testid='result-panel']").isVisible()).toBe(true);
    });

    it("inspector resolves source from Vue island", async () => {
      await page.locator("[data-testid='vue-card']").click();
      await page.locator("[data-testid='result-panel']").waitFor({ state: "visible", timeout: 5000 });
      expect(await page.locator("[data-testid='result-panel']").isVisible()).toBe(true);
    });

    it("inspector resolves source from Solid island", async () => {
      await page.locator("[data-testid='solid-card']").click();
      await page.locator("[data-testid='result-panel']").waitFor({ state: "visible", timeout: 5000 });
      expect(await page.locator("[data-testid='result-panel']").isVisible()).toBe(true);
    });
  });
};

describe("E2E: static example apps", () => {
  for (const app of STATIC_APPS) {
    testStaticApp(app);
  }
});

describe("E2E: dev server example apps", () => {
  for (const app of DEV_SERVER_APPS) {
    testDevServerApp(app);
  }
});

describe("E2E: multi-framework resolution", () => {
  testAstroMultiFramework();
});
