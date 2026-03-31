// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), solidJs()],
  adapter: node({
    mode: "middleware",
  }),
  output: "server",
  prefetch: {
    defaultStrategy: "hover",
  },
  vite: {
    server: {
      allowedHosts: ["debian.lan"],
    },
  },
});
