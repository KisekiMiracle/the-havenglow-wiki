// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";
import { webcore } from "webcoreui/integration";

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

  output: "server",
});
