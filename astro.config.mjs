// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";
import { webcore } from "webcoreui/integration";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://wiki.kiseki-miracle.dev",
  integrations: [mdx(), sitemap(), vue(), webcore()],

  vite: {
    plugins: [tailwindcss()],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
  security: {
    checkOrigin: false,
  },

  adapter: node({
    mode: "standalone",
  }),
  output: "server",
});
