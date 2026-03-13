import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  server: { port: Number(process.env.PORT) || 3200 },
  plugins: [tsConfigPaths(), tanstackStart(), viteReact()],
});
