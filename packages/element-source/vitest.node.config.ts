import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/environments/**/*.test.ts", "tests/e2e/**/*.test.ts"],
    setupFiles: ["tests/environments/setup.ts"],
    testTimeout: 60000,
  },
});
