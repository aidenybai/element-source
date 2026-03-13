import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";

// HACK: Vite version mismatch between vitest (v6) and framework plugins (v7) in monorepo
export default defineConfig({
  plugins: [svelte() as never, vue() as never],
  test: {
    globals: true,
    include: ["tests/frameworks/**/*.test.ts", "tests/resolve.test.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
