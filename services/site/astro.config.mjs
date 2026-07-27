// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://computeflux.xyz",
  output: "static",
  // English is served at the root; French under /fr. `fallbackType: "rewrite"`
  // generates every /fr/* route from its English counterpart and serves the
  // English content (at the /fr URL, no redirect) until a French-specific page
  // or translation exists. So, localization can roll out page by page without
  // ever leaving a /fr URL 404ing.
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
    routing: {
      prefixDefaultLocale: false,
      fallbackType: "rewrite",
    },
    fallback: {
      fr: "en",
    },
  },
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: "passthrough",
  }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", fr: "fr" },
      },
    }),
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@chenglou/pretext"],
    },
  },
});
