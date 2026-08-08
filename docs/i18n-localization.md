# Localization (EN / FR)

Design + implementation notes for serving the Computeflux site and articles in
English and French, with the served language chosen from the visitor's country
at the Cloudflare edge.

Status: living document. Each phase below is independently shippable. The site
stays correct in EN-only mode throughout the rollout.

---

## 1. Goals

- Two content languages: **`en`** (canonical) and **`fr`**.
- A visitor from France lands on the French site. Everyone else gets English.
- Both the **static marketing content** and the **articles** are localized.
- Correct for SEO and shareable: a URL renders the same content for everyone.

## 2. Current architecture (what localization must fit)

### Articles are built artifacts, not markdown

An article is authored as an **ObservableHQ Framework** app under
`/articles/NNNN_<type>_<name>/` with an `article.json` metadata sidecar. It is
built to `dist/`, and every file is pushed blob-by-blob to R2 by
`tools/article-publisher` via the site-api ingest flow (`begin` -> presigned
`PUT` -> `commit`). site-api stores the editorial metadata + an immutable
versioned manifest in Postgres; the site renders the article by embedding the
R2-hosted entry document in a sandboxed iframe.

- R2 key layout (before): `articles/<type>/<slug>/v<N>/...`
- DB: `articles` (slug **globally unique**), `article_versions`,
  `article_assets`, `topics`, `authors`, m2m link tables.
- The local markdown in `services/site/src/content/articles/*.md` is a
  **fallback only**, consulted when the API is unreachable.

### Static content is hardcoded English

Page copy lives inline in `.astro` pages and in `src/data/*.ts`
(`expertise`, `faq`, `jobs`, `navigation`). `site.lang="en"` / `site.locale`
are single globals. No i18n framework is present.

### Geo is already available

`CF-IPCountry` is read in `src/pages/api/geo.ts`. Cloudflare populates it on
every request.

## 3. Core model: language is a *dimension*, not a new article

A logical article (one `slug`) may exist in several languages. Each
`(slug, lang)` is an independent editorial row with its own versions, assets
and manifest, but shares the taxonomy (`topics`, `authors`) and cross-links.

**`en` is the canonical, always-complete locale.** Other locales are opt-in per
article. On a **detail** read, a missing translation falls back to `en`. On a
**list** read only articles that exist in the requested locale are
shown. list-level EN backfill is a documented follow-up (§8).

This maps directly onto the existing version/asset/manifest machinery

## 4. Storage and schema changes

### R2 : no redesign, one extra path segment

```
articles/<type>/<slug>/<lang>/v<N>/...
```

R2 is a blob store with free-form keys; the only change is in
`IngestUseCase.versionPrefix`. Each `(slug, lang)` build is a self-contained
subtree (its own copy of the Observable runtime/npm blobs), so the iframe entry
resolves all of its relative asset references within its own prefix.

### Postgres : additive migration (`000009_lang`)

```sql
ALTER TABLE articles ADD COLUMN lang text NOT NULL DEFAULT 'en';
ALTER TABLE articles DROP CONSTRAINT articles_slug_key;      -- global UNIQUE(slug)
ALTER TABLE articles ADD CONSTRAINT articles_slug_lang_key UNIQUE (slug, lang);

-- French full-text vector. A GENERATED column requires an IMMUTABLE expression,
-- so the text-search config must be a literal — hence a second column rather
-- than one driven by the `lang` value. Query whichever column matches the
-- requested locale.
ALTER TABLE articles ADD COLUMN search_tsv_fr tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(shortdesc, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(longdesc, '')), 'C')
) STORED;
CREATE INDEX idx_articles_search_fr ON articles USING GIN (search_tsv_fr);
CREATE INDEX idx_articles_slug_lang ON articles (slug, lang);
```

`article_versions`, `article_assets`, `topics`, `authors` and all link tables
are **unchanged** — versions/assets hang off `article_id`, which is now
per-locale.

### Read/write API changes

- `GET /api/articles?lang=fr` and `GET /api/articles/{slug}?lang=fr`.
  - List: filter by exact `lang` (default `en`).
  - Detail: try `lang`; if absent and `lang != en`, fall back to `en`.
- Responses carry the resolved `lang` so the site knows whether a fallback
  occurred (drives `hreflang`).
- Ingest (`POST /api/admin/articles/ingest/begin`) accepts `lang`. Version
  numbering, checksum idempotency and the article upsert are all scoped to
  `(slug, lang)`. `DELETE /api/admin/articles/{slug}` removes **all** locales of
  a slug (and purges every locale's R2 prefix).

## 5. Article sources — one project, per-locale pages

Keep a single Observable project per logical article; localize the prose pages
and share the code/data:

```
0000_blog_inference_economics/
  article.json            # v2: shared fields + per-locale editorial block
  src/index.md            # EN prose  -> dist/index.html
  src/fr/index.md         # FR prose  -> dist/fr/index.html
  src/components/*.js     # shared charts/logic (translate string labels only)
  src/data/*              # shared data
```

`article.json` v2:

```json
{
  "slug": "inference-economics",
  "type": "blog",
  "topics": ["inference-optimization", "performance", "ai-engineering"],
  "authors": ["gabriel-mougard"],
  "featured": true,
  "cover": "",
  "locales": {
    "en": { "entry": "index.html",    "title": "…", "shortdesc": "…", "longdesc": "…", "readingMinutes": 8, "seoTitle": "…", "seoDescription": "…" },
    "fr": { "entry": "fr/index.html", "title": "…", "shortdesc": "…", "longdesc": "…", "readingMinutes": 8, "seoTitle": "…", "seoDescription": "…" }
  }
}
```

`tools/article-publisher` builds the file list once, then runs one
`begin`/upload/`commit` cycle **per locale**, flagging that locale's `entry` as
the entrypoint and sending its `lang`. Legacy single-locale `article.json` (no
`locales` key) is still accepted and treated as `en`, so existing article
directories keep working until migrated.

## 6. Locale resolution — path-prefixed URLs + edge redirect

Chosen strategy (over same-URL content swapping, which would force SSR
everywhere and is an SEO anti-pattern):

- **URLs**: `en` at the root (`/`, `/articles/<slug>`), `fr` under a prefix
  (`/fr/`, `/fr/articles/<slug>`). Astro i18n with
  `routing.prefixDefaultLocale: false`.
- **First-visit redirect**: a Cloudflare **dynamic redirect rule** (Terraform,
  `http_request_dynamic_redirect` phase) — not app middleware, so static pages
  stay served straight from assets:

  ```
  when:  ip.geoip.country eq "FR"
         and not starts_with(http.request.uri.path, "/fr")
         and not http.cookie contains "locale="
  then:  302 -> concat("/fr", http.request.uri.path)
  ```

- **Explicit choice wins**: the in-page language switcher sets a `locale=en|fr`
  cookie; its presence disables the redirect.
- **SEO**: every localized page emits `hreflang` alternates (`en`, `fr`,
  `x-default` → `en`) and a per-locale canonical; the sitemap lists both.

## 7. Phasing

1. **Backend lang dimension** — migration + models + storage (lang filter, EN
   detail fallback) + read/ingest API `lang`. No behavior change (all rows
   default `en`).
2. **R2 + publisher** — lang segment in the key; multi-locale `article.json` v2;
   publisher locale loop; bilingual `_template`.
3. **Static site i18n** — Astro i18n config; dictionaries + `t()` + locale
   helpers; language switcher; `hreflang`; locale-aware article pages passing
   `?lang`.
4. **Edge** — Terraform Cloudflare redirect rule.
5. **Content** — FR translations of static copy + articles (ongoing).

## 8. Implementation status

Landed (builds/tests/`terraform validate` all green):

- **Phase 1** — `site-api`: `lang` column + `(slug, lang)` uniqueness +
  `search_tsv_fr` (migration `000009_lang`); `lang` threaded through models,
  storage (list filter + detail EN-fallback), read/ingest use cases, handlers
  (`?lang`) and DTOs. `versionPrefix` emits the `/<lang>/` R2 segment.
- **Phase 2** — `article-publisher` reads multi-locale `article.json` v2 and
  runs one begin/upload/commit per locale (legacy single-locale files still
  accepted as `en`); `_template` is now a bilingual reference project. The
  publish workflow is unchanged (still one `-dir` per article).
- **Phase 3** — Astro i18n (`fallbackType: "rewrite"`) so every EN page has a
  working `/fr/*` route; `src/i18n/*` (config, dictionary, helpers); locale-aware
  `BaseLayout` (`<html lang>`, `og:locale`, hreflang, localized meta); language
  switcher (cookie opt-out); localized Header/Footer/Logo chrome; the **articles
  index + detail are fully localized** (shared components, `?lang` to the API,
  `/fr/articles*` routes).
- **Phase 4** — Cloudflare dynamic-redirect ruleset (`geo-redirect.tf`), gated to
  page navigations only (GET + `Accept: text/html`, excludes `/api` and assets).

Remaining (content, not code):

- Body copy of the static marketing pages (home hero/sections, about, faq,
  careers, expertise, …) still renders English under `/fr` until the UI
  dictionary (`src/i18n/ui.ts`) and any page-level strings are translated. The
  chrome, meta and `/fr` routing already work, so this is per-page dictionary
  fill-in — no structural change.
- French article translations: author `src/fr/index.md` in each article project
  and add the `fr` block to its `article.json`.
- `terraform apply` for the redirect rule is a manual infra step (needs the
  Cloudflare token); `terraform validate` passes with the committed config.

## 9. Known follow-ups / trade-offs

- **List-level EN backfill.** A French listing currently shows only translated
  articles (empty until FR content exists). A `DISTINCT ON (slug)` query
  preferring the requested locale and falling back to `en` would show every
  logical article in the best available language; deferred to keep the
  count/type-count/pagination queries simple.
- **Topic/author labels.** `topics.name` / `authors.*` are language-neutral
  today; FR UI shows English topic labels until a `topic_translations` table is
  added.
- **Shared-blob duplication.** Each locale stores its own copy of the Observable
  runtime/npm blobs under its prefix. R2 is cheap; a content-addressed shared
  prefix is a possible optimization if storage cost ever matters.
- **French text search** uses the `'french'` regconfig (`search_tsv_fr`); the
  original `search_tsv` (`'english'`) is retained unchanged for EN.
