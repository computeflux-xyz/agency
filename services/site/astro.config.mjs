// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://computeflux.xyz",
  output: "static",
  // French is the reference locale and is served at the root; English under /en.
  // `fallbackType: "rewrite"` generates every /en/* route from its French
  // counterpart and serves it at the /en URL (no redirect) until an
  // English-specific page exists. So localization rolls out page by page
  // without ever leaving an /en URL 404ing.
  i18n: {
    defaultLocale: "fr",
    locales: ["fr", "en"],
    routing: {
      prefixDefaultLocale: false,
      fallbackType: "rewrite",
    },
    fallback: {
      en: "fr",
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
        defaultLocale: "fr",
        locales: { fr: "fr", en: "en" },
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
