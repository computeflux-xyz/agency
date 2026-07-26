import type { APIRoute } from "astro";
import { createApiClient, ApiError, type ContactPayload, type ContactPreference } from "@lib/api";

// Server-rendered: the browser posts here, and this handler calls site-api with
// the secret bearer token so it never reaches the client bundle.
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
    return json({ ok: false, message: "Contact API is not configured." }, 500);
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, message: "Invalid request body." }, 400);
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const payload: ContactPayload = {
    name: str(raw.name),
    surname: str(raw.surname),
    email: str(raw.email),
    phoneNumber: str(raw.phoneNumber),
    preferredContact: str(raw.preferredContact) as ContactPreference,
    company: str(raw.company) || undefined,
    linkedinProfile: str(raw.linkedinProfile) || undefined,
    message: str(raw.message),
  };

  // Lightweight shape check for a friendly message; site-api remains the
  // source of truth for validation.
  const requiredMissing = (["name", "surname", "email", "phoneNumber", "message"] as const).some(
    (k) => !payload[k],
  );
  const badPreference = payload.preferredContact !== "phone" && payload.preferredContact !== "email";
  if (requiredMissing || badPreference) {
    return json({ ok: false, message: "Please fill in all required fields." }, 400);
  }

  try {
    const api = createApiClient({ baseUrl, token });
    await api.submitContact(payload);
    return json({ ok: true }, 200);
  } catch (e) {
    if (e instanceof ApiError && e.status >= 400 && e.status < 500) {
      return json({ ok: false, message: e.message }, e.status);
    }

    return json(
      {
        ok: false,
        message:
          "Something went wrong sending your message. Please try again, or email us directly.",
      },
      502,
    );
  }
};
