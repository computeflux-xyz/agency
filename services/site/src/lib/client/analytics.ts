/**
 * Site-wide Umami instrumentation.
 *
 * The Umami script itself records the pageview (see `BaseLayout.astro`). This
 * module is the layer above it: what the visitor did *inside* a page, so a
 * journey reads as more than a list of URLs:
 *
 *   - every link click, classified (internal / outbound / mail / phone /
 *     download / in-page anchor) and attributed to the region it was clicked
 *     from (`data-analytics-section`, else the nearest landmark)
 *   - scroll depth and engaged time, plus a single `page_exit` carrying both
 *   - section impressions for anything marked `data-analytics-view`
 *   - form lifecycle: start -> submit -> success/error
 *   - disclosure toggles, tab switches, searches, copies, and the first JS error
 *
 * Two ways to emit an event:
 *
 *   1. Declaratively, from markup:
 *        <a href="..." data-analytics="study_card" data-analytics-slug="acme">
 *      The `data-analytics` value is the event name. Every other
 *      `data-analytics-*` attribute becomes a snake_case field.
 *   2. Imperatively: `import { track } from "@lib/client/analytics"`.
 *
 * Every event is merged with the page context published by `BaseLayout` on
 * `<body>` (page type, slug, locale, content kind, topics), so any event can be
 * broken down by page without joining anything in the dashboard.
 *
 * Events raised before the Umami script finishes loading are queued and
 * flushed once `window.umami` appears. If it never does (blocked, or analytics
 * not configured) the queue is dropped and nothing throws.
 */

export type EventData = Record<string, string | number | boolean>;

type UmamiApi = { track: (name: string, data?: EventData) => void };

/** Cap on a single string field. Umami stores strings, not essays. */
const MAX_STRING = 120;
/** Events buffered while waiting for the Umami script. */
const QUEUE_LIMIT = 40;
const FLUSH_INTERVAL_MS = 250;
const FLUSH_ATTEMPTS = 40; // ~10s, then give up

let queued: { name: string; data: EventData }[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let flushAttempts = 0;
let context: EventData | null = null;

function umami(): UmamiApi | undefined {
  const u = (window as unknown as { umami?: Partial<UmamiApi> }).umami;
  return typeof u?.track === "function" ? (u as UmamiApi) : undefined;
}

function clip(value: string): string {
  return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING - 1)}…` : value;
}

function clean(data: EventData): EventData {
  const out: EventData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = typeof value === "string" ? clip(value.replace(/\s+/g, " ").trim()) : value;
  }

  return out;
}

/**
 * Page-level fields stamped on every event, published by `BaseLayout` as
 * `data-*` on `<body>`. Read once a page load never changes them (the site is
 * an MPA: every navigation is a fresh document).
 */
function pageContext(): EventData {
  if (context) return context;
  const d = document.body?.dataset ?? ({} as DOMStringMap);
  context = clean({
    page_type: d.pageType ?? "",
    slug: d.pageSlug ?? "",
    locale: d.locale ?? "",
    content_kind: d.contentKind ?? "",
    topics: d.contentTopics ?? "",
    reading_time: d.contentReadingTime ? Number(d.contentReadingTime) : "",
  });
  return context;
}

function flush(): void {
  const api = umami();
  if (api) {
    const pending = queued;
    queued = [];
    stopFlush();
    for (const event of pending) {
      try {
        api.track(event.name, event.data);
      } catch {
        /* analytics must never break the page */
      }
    }
    return;
  }
  if (++flushAttempts >= FLUSH_ATTEMPTS) {
    queued = [];
    stopFlush();
  }
}

function stopFlush(): void {
  if (flushTimer !== null) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

function scheduleFlush(): void {
  if (flushTimer === null) flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);
}

/** Emit a custom event, stamped with the page context. */
export function track(name: string, data: EventData = {}): void {
  const payload = { ...pageContext(), ...clean(data) };
  const api = umami();
  if (api) {
    try {
      api.track(name, payload);
    } catch {
      /* ignore */
    }
    return;
  }

  if (queued.length < QUEUE_LIMIT) queued.push({ name, data: payload });
  scheduleFlush();
}

/** `data-analytics-foo-bar` -> `foo_bar`. `data-analytics-section` is handled separately. */
function attrData(el: HTMLElement): EventData {
  const out: EventData = {};
  for (const [key, value] of Object.entries(el.dataset)) {
    if (!key.startsWith("analytics") || key === "analytics" || key === "analyticsSection") continue;
    if (value === undefined) continue;
    const field = key
      .slice("analytics".length)
      .replace(/^[A-Z]/, (c) => c.toLowerCase())
      .replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    out[field] = value;
  }

  return out;
}

/**
 * Which region of the page the interaction came from. Explicit
 * `data-analytics-section` wins. Otherwise the nearest landmark, so untagged
 * markup still lands somewhere useful instead of "unknown".
 */
function sectionOf(el: Element): string {
  const tagged = el.closest<HTMLElement>("[data-analytics-section]");
  if (tagged?.dataset.analyticsSection) return tagged.dataset.analyticsSection;
  if (el.closest("header")) return "header";
  if (el.closest("footer")) return "footer";
  if (el.closest("[data-mobile-drawer]")) return "mobile-menu";
  if (el.closest("aside")) return "aside";
  return "main";
}

function labelOf(el: Element): string {
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 60);
  return (
    el.getAttribute("aria-label") ??
    el.getAttribute("title") ??
    (el as HTMLElement).dataset?.analytics ??
    ""
  );
}

const DOWNLOAD_EXT = /\.(pdf|zip|csv|tsv|xlsx?|docx?|pptx?|json|md|png|jpe?g|svg|webp|mp4|webm)$/i;

type LinkKind =
  | "internal_link"
  | "outbound_click"
  | "email_click"
  | "phone_click"
  | "file_download"
  | "anchor_click";

function classify(link: HTMLAnchorElement): { name: LinkKind; target: string } | null {
  const raw = link.getAttribute("href") ?? "";
  if (!raw || raw.startsWith("javascript:")) return null;

  if (raw.startsWith("mailto:")) return { name: "email_click", target: raw.slice(7) };
  if (raw.startsWith("tel:")) return { name: "phone_click", target: raw.slice(4) };

  let url: URL;
  try {
    url = new URL(link.href, window.location.href);
  } catch {
    return null;
  }

  if (url.host !== window.location.host) {
    return { name: "outbound_click", target: `${url.host}${url.pathname}` };
  }

  if (link.hasAttribute("download") || DOWNLOAD_EXT.test(url.pathname)) {
    return { name: "file_download", target: url.pathname };
  }

  if (url.pathname === window.location.pathname && url.hash && url.hash !== "#") {
    return { name: "anchor_click", target: url.hash };
  }

  return { name: "internal_link", target: `${url.pathname}${url.search}` };
}

function initClicks(): void {
  document.addEventListener(
    "click",
    (event) => {
      const origin = event.target as Element | null;
      if (!origin || typeof origin.closest !== "function") return;

      const explicit = origin.closest<HTMLElement>("[data-analytics]");
      const link = origin.closest<HTMLAnchorElement>("a[href]");

      if (explicit?.dataset.analytics) {
        track(explicit.dataset.analytics, {
          ...attrData(explicit),
          section: sectionOf(explicit),
          label: labelOf(explicit),
          ...(link ? { href: link.getAttribute("href") ?? "" } : {}),
        });

        if (!link || explicit === link || explicit.contains(link)) return;
      }

      if (!link) return;
      const kind = classify(link);
      if (!kind) return;
      track(kind.name, {
        href: kind.target,
        label: labelOf(link),
        section: sectionOf(link),
        new_tab: link.target === "_blank",
      });
    },
    { capture: true },
  );
}

/** Depth reached, reported once per threshold. */
function initScrollDepth(state: { depth: number }): void {
  const marks = [25, 50, 75, 90, 100];
  const fired = new Set<number>();
  let ticking = false;

  const measure = () => {
    const doc = document.documentElement;
    const height = Math.max(doc.scrollHeight, document.body?.scrollHeight ?? 0);
    if (height <= 0) return;
    const seen = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / height) * 100));
    if (seen > state.depth) state.depth = seen;
    for (const mark of marks) {
      if (seen >= mark && !fired.has(mark)) {
        fired.add(mark);
        track("scroll_depth", { depth: mark });
      }
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      measure();
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  measure(); // a short page can already be 100% read on load
}

/**
 * Engaged time. Wall clock minus the time the tab spent hidden, so a tab left
 * open in the background does not read as a five-minute deep read.
 */
function initEngagement(state: { seconds: number }): void {
  const marks = [15, 30, 60, 120, 300, 600];
  const fired = new Set<number>();
  const TICK = 5;

  setInterval(() => {
    if (document.visibilityState !== "visible") return;
    state.seconds += TICK;
    for (const mark of marks) {
      if (state.seconds >= mark && !fired.has(mark)) {
        fired.add(mark);
        track("engaged_time", { seconds: mark });
      }
    }
  }, TICK * 1000);
}

/** One closing event per page carrying how far and how long. */
function initExit(state: { depth: number; seconds: number }): void {
  let sent = false;
  const send = () => {
    if (sent) return;
    sent = true;
    track("page_exit", { scroll_depth: state.depth, engaged_seconds: state.seconds });
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") send();
  });
  window.addEventListener("pagehide", send);
}

/** Impressions for `[data-analytics-view="name"]`, once each. */
function initSectionViews(): void {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-analytics-view]"));
  if (!nodes.length) return;

  if (!("IntersectionObserver" in window)) {
    for (const node of nodes) track("section_view", { section: node.dataset.analyticsView ?? "" });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        track("section_view", { section: el.dataset.analyticsView ?? "", ...attrData(el) });
      }
    },
    { threshold: 0.35 },
  );
  for (const node of nodes) observer.observe(node);
}

function formName(form: HTMLFormElement): string {
  return (
    form.dataset.analyticsForm ??
    form.getAttribute("aria-label") ??
    form.getAttribute("name") ??
    form.id ??
    "form"
  );
}

/**
 * `form_start` on the first interaction (how many people begin a form is the
 * denominator for every conversion number), then `form_submit` on submit.
 * Outcomes are reported by the page's own fetch handler via `trackFormResult`.
 */
function initForms(): void {
  document.addEventListener(
    "focusin",
    (event) => {
      const field = event.target as HTMLElement | null;
      const form = field?.closest?.("form");
      if (!form || form.dataset.analyticsStarted === "1") return;
      form.dataset.analyticsStarted = "1";
      track("form_start", { form: formName(form) });
    },
    { capture: true },
  );

  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target as HTMLFormElement | null;
      if (!form || form.tagName !== "FORM") return;

      const search = form.querySelector<HTMLInputElement>('input[type="search"], input[name="q"]');
      if (search) {
        track("search", { query: search.value.trim(), results_page: form.getAttribute("action") ?? "" });
      }
      track("form_submit", { form: formName(form) });
    },
    { capture: true },
  );
}

/** Report the outcome of an async form submission. */
export function trackFormResult(
  form: HTMLFormElement,
  ok: boolean,
  reason = "",
): void {
  track(ok ? "form_success" : "form_error", { form: formName(form), reason });
}

/** `<details>` opens. FAQ entries, inline disclosures. `toggle` does not bubble. */
function initDisclosures(): void {
  document.addEventListener(
    "toggle",
    (event) => {
      const el = event.target as HTMLElement | null;
      if (!el || el.tagName !== "DETAILS") return;
      const details = el as HTMLDetailsElement;
      if (!details.open) return; // closing is noise; opening is intent
      const summary = details.querySelector("summary");
      track("disclosure_open", {
        label: summary ? labelOf(summary) : labelOf(details),
        section: sectionOf(details),
      });
    },
    { capture: true },
  );
}

/** What people take away with them. Length only. */
function initCopy(): void {
  document.addEventListener("copy", () => {
    const chars = window.getSelection()?.toString().length ?? 0;
    if (chars < 20) return; // ignore stray double-click copies
    track("content_copy", { chars });
  });
}

/** First uncaught error per page (a broken page explains a dead journey). */
function initErrors(): void {
  let reported = false;
  const report = (message: string, source: string) => {
    if (reported) return;
    reported = true;
    track("js_error", { message, source });
  };
  window.addEventListener("error", (event) => {
    report(String(event.message ?? "error"), `${event.filename ?? ""}:${event.lineno ?? 0}`);
  });
  window.addEventListener("unhandledrejection", (event) => {
    report(String((event as PromiseRejectionEvent).reason ?? "rejection"), "promise");
  });
}

/**
 * Boot every instrument. Safe to call more than once. Only the first call attaches listeners.
 */
export function initAnalytics(): void {
  const flag = window as unknown as { __cfAnalytics?: boolean };
  if (flag.__cfAnalytics) return;
  flag.__cfAnalytics = true;

  const state = { depth: 0, seconds: 0 };

  initClicks();
  initScrollDepth(state);
  initEngagement(state);
  initExit(state);
  initSectionViews();
  initForms();
  initDisclosures();
  initCopy();
  initErrors();
}
