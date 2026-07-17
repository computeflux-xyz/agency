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
│   │                 #   FaqAccordion, NewsletterForm, StatBlock, ApiNotice
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

## Deploy (Cloudflare)

1. Add the `computeflux.xyz` zone to Cloudflare account.
2. Uncomment the `routes` block in `wrangler.toml`.
3. `pnpm deploy` (or wire the same into CI with `cloudflare/wrangler-action`).

Non-secret config lives in `wrangler.toml` `[vars]`. secrets via `wrangler secret put`.