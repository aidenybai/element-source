import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import vue from "@astrojs/vue";
import solidJs from "@astrojs/solid-js";

export default defineConfig({
  integrations: [
    react({ include: ["**/react/*"] }),
    svelte(),
    vue(),
    solidJs({ include: ["**/solid/*"] }),
  ],
});
