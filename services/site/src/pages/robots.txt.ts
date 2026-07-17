import type { APIRoute } from "astro";
import { site } from "@lib/site";

export const GET: APIRoute = ({ site: astroSite }) => {
  const origin = astroSite?.origin ?? site.url;
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${origin}/sitemap-index.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
