import type { APIRoute } from "astro";
import {
  createApiClient,
  ApiError,
  type ContactPreference,
  type WhitePaperRequestPayload,
} from "@lib/api";

export const prerender = false;

type Runtime = { env?: Record<string, string | undefined> };

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const runtimeEnv = (locals as { runtime?: Runtime })?.runtime?.env;
  const baseUrl = runtimeEnv?.API_BASE_URL ?? (import.meta.env.API_BASE_URL as string | undefined);
  const token = runtimeEnv?.API_TOKEN ?? (import.meta.env.API_TOKEN as string | undefined);

  if (!baseUrl) {
    return json({ ok: false, message: "White paper API is not configured." }, 500);
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, message: "Invalid request body." }, 400);
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const slug = str(raw.slug);
  const lang = str(raw.lang) === "en" ? "en" : "fr";
  const payload: WhitePaperRequestPayload = {
    lang,
    name: str(raw.name),
    surname: str(raw.surname),
    email: str(raw.email),
    phoneNumber: str(raw.phoneNumber),
    preferredContact: str(raw.preferredContact) as ContactPreference,
    company: str(raw.company) || undefined,
    linkedinProfile: str(raw.linkedinProfile) || undefined,
    message: str(raw.message),
  };

  const requiredMissing = (["name", "surname", "email", "phoneNumber"] as const).some(
    (k) => !payload[k],
  );
  const badPreference = payload.preferredContact !== "phone" && payload.preferredContact !== "email";
  if (!slug || requiredMissing || badPreference) {
    return json({ ok: false, message: "Please fill in all required fields." }, 400);
  }

  try {
    const api = createApiClient({ baseUrl, token, lang });
    const res = await api.requestWhitePaper(slug, payload);
    return json({ ok: true, lang: res.lang }, 200);
  } catch (e) {
    if (e instanceof ApiError && e.status >= 400 && e.status < 500) {
      return json({ ok: false, message: e.message }, e.status);
    }

    return json(
      {
        ok: false,
        message:
          "Something went wrong sending the document. Please try again, or email us directly.",
      },
      502,
    );
  }
};
