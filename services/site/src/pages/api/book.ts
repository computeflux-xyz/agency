import type { APIRoute } from "astro";
import { createApiClient, ApiError, type MeetingPayload } from "@lib/api";

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
    return json({ ok: false, message: "Booking API is not configured." }, 500);
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, message: "Invalid request body." }, 400);
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const payload: MeetingPayload = {
    name: str(raw.name),
    surname: str(raw.surname),
    email: str(raw.email),
    phoneNumber: str(raw.phoneNumber),
    company: str(raw.company) || undefined,
    linkedinProfile: str(raw.linkedinProfile) || undefined,
    startDate: str(raw.startDate),
    endDate: str(raw.endDate),
    message: str(raw.message),
  };

  const requiredMissing = (
    ["name", "surname", "email", "phoneNumber", "startDate", "endDate", "message"] as const
  ).some((k) => !payload[k]);
  if (requiredMissing) {
    return json({ ok: false, message: "Please fill in all required fields." }, 400);
  }

  const start = Date.parse(payload.startDate);
  const end = Date.parse(payload.endDate);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return json({ ok: false, message: "Please choose a valid time window (end must be after start)." }, 400);
  }

  try {
    const api = createApiClient({ baseUrl, token });
    await api.requestMeeting(payload);
    return json({ ok: true }, 200);
  } catch (e) {
    if (e instanceof ApiError && e.status >= 400 && e.status < 500) {
      return json({ ok: false, message: e.message }, e.status);
    }

    return json(
      {
        ok: false,
        message: "Something went wrong sending your request. Please try again, or email us directly.",
      },
      502,
    );
  }
};
