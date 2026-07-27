import type { APIRoute } from "astro";

export const prerender = false;

type Runtime = { cf?: { country?: string }; env?: Record<string, string | undefined> };

const NON_COUNTRY = new Set(["", "XX", "T1", "A1", "A2"]);

export const GET: APIRoute = ({ request, locals }) => {
  const runtime = (locals as { runtime?: Runtime })?.runtime;
  let country = (request.headers.get("CF-IPCountry") ?? runtime?.cf?.country ?? "").toUpperCase();

  if (!/^[A-Z]{2}$/.test(country) || NON_COUNTRY.has(country)) {
    country = "";
  }

  return new Response(JSON.stringify({ country }), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
};
