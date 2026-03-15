import { resolve } from "node:path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      "element-source": resolve(import.meta.dirname, "../../packages/element-source/src/index.ts"),
    },
  },
});
