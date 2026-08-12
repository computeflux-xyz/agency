# Computeflux agency website

## Commands

```bash
pnpm install          # install (uses .npmrc: legacy-peer-deps)
pnpm dev              # local dev server (astro dev)
pnpm build            # production build -> dist/
pnpm preview          # run the built Worker locally (wrangler dev)
pnpm check            # astro type-check (0 errors expected)
pnpm deploy           # build + wrangler deploy
```

> **Note on install:** `sharp` (Astro's optional image lib) is intentionally
> skipped. covers/OG are static, unprocessed assets served via plain `<img>`,
> and the adapter uses `imageService: "passthrough"`. `.npmrc` sets
> `legacy-peer-deps=true` to reconcile `wrangler` (workers-types v5) with the
> Cloudflare adapter (v4).

## Architecture (atomic design)

Components follow the atomic-design layering (primitives -> composites ->
sections -> templates -> pages):

```
src/
├── components/
│   ├── atoms/        # Logo, Button, Tag, Divider, Field, Icon, Eyebrow, ScrambleText
│   ├── molecules/    # SectionHeader, ExpertiseCard, ArticleCard, JobCard,
│   │                 #   FaqAccordion, StatBlock, ApiNotice
│   └── organisms/    # Header (mega-menu + mobile drawer), Footer, Hero,
│                     #   PageHero, ApproachSection, CtaSection
├── layouts/          # BaseLayout (all SEO), PageLayout, ArticleLayout  (templates)
├── pages/            # file-based routes                                (pages)
├── content/          # markdown case studies + articles
├── data/             # navigation, expertise, faq, jobs (typed content)
├── lib/
│   ├── api/          # PLACEHOLDER generated Swagger/OpenAPI client
│   ├── client/       # progressive-enhancement scripts (scramble, reveal, header)
│   ├── seo.ts        # JSON-LD schema builders
│   ├── site.ts       # single source of truth for site metadata
│   └── utils.ts      # cn(), date/slug/reading-time helpers
└── styles/global.css # design tokens + base + prose + animations
```

Path aliases (`tsconfig.json`): `@atoms/*`, `@molecules/*`, `@organisms/*`,
`@layouts/*`, `@lib/*`, `@data/*`, `@/*`.

## SEO

Every page renders through `BaseLayout.astro`, which emits:

- canonical URL, robots, theme-color
- Open Graph + Twitter `summary_large_image` (default image: `public/og/default.png`)
- JSON-LD `@graph`: `Organization` + `WebSite` on every page, plus per-page
  `WebPage`, `Article`, `FAQPage`, `JobPosting`, `BreadcrumbList`, `Service`,
  `CollectionPage`/`Blog` where relevant (see `src/lib/seo.ts`)
- `sitemap-index.xml` (via `@astrojs/sitemap`), dynamic `/robots.txt`, `/rss.xml`

## Analytics (Umami)

Cookieless, self-hosted. Configured entirely through env (`wrangler.toml [vars]` in production, `.dev.vars` locally) with `PUBLIC_UMAMI_SRC` or
`PUBLIC_UMAMI_WEBSITE_ID` unset the whole layer is inert. No script tag, no requests, events queued for a few seconds and dropped.

| var | meaning |
| --- | --- |
| `PUBLIC_UMAMI_SRC` | URL of `script.js` |
| `PUBLIC_UMAMI_WEBSITE_ID` | website id from the Umami dashboard |
| `PUBLIC_UMAMI_HOST_URL` | where events are POSTed. Required when `script.js` and `/api/send` are not siblings |
| `PUBLIC_UMAMI_TAG` | optional label on every event (`production`, `local`, ...) |

The gateway must expose **only** `/push-analytics/script.js` (GET) and `/push-analytics/api/send` (POST). The dashboard and login stay cluster-internal.

Pageviews come from the Umami script itself. Everything else is `src/lib/client/analytics.ts`, booted from `BaseLayout`:

- **page context** on `<body>` (`page_type`, `slug`, `locale`, `content_kind`,
  `topics`, `reading_time`) is merged into every custom event, so any event can
  be broken down by page without joining anything
- **automatic**: link clicks classified as `internal_link` / `outbound_click` /
  `email_click` / `phone_click` / `file_download` / `anchor_click`, each
  attributed to the region it was clicked from. `scroll_depth`, `engaged_time`,
  `page_exit`, `disclosure_open`, `search`, `form_start`, `form_submit`,
  `content_copy`, `js_error`
- **declarative**: `data-analytics="event_name"` on any element, with
  `data-analytics-*` attributes becoming snake_case fields, and
  `data-analytics-section` / `data-analytics-view` marking regions and
  impressions
- **explicit**: `track()` / `trackFormResult()` for anything with its own
  handler, `lead` (contact, booking, white-paper gate), `diagnostic_select`,
  `tab_select`, `menu_open`, `article_section` (progress inside the embedded
  article), `article_toc_click`, `content_card_click`, `cta_click`

Adding an annotation to a component is a markup change: the delegated listeners are already global.

## Deploy (Cloudflare)

1. Add the `computeflux.xyz` zone to Cloudflare account.
2. Uncomment the `routes` block in `wrangler.toml`.
3. `pnpm deploy` (or wire the same into CI with `cloudflare/wrangler-action`).

Non-secret config lives in `wrangler.toml` `[vars]`. secrets via `wrangler secret put`.