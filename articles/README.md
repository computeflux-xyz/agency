# `articles`

Source for the ObservableHQ articles rendered on [computeflux.xyz](https://computeflux.xyz).
`services/site` lists and renders them; `services/site-api` owns their metadata
and the R2 blob manifest. Building + publishing is an **admin task** run by the
[`publish-articles`](../.github/workflows/publish-articles.yml) GitHub Action.

## Layout

One directory per article, named:

```
<XXXX>_<blog|study>_<snake_case_slug>/
```

- `XXXX` — 4-digit ordering prefix (`0000`, `0001`, …).
- `blog | study` — an editorial post vs. a customer case study.
- `<slug>` — the URL slug (kebab-case in the URL, snake_case in the dir name).

Each directory is a standard [Observable Framework](https://observablehq.com/framework)
app plus one extra file, **`article.json`**, holding the metadata site-api needs.

```
0000_blog_apm_at_scale_using_ebpf/
├─ observablehq.config.js
├─ package.json
├─ article.json          ← metadata (see below)
└─ src/
   ├─ index.md           ← the article (entry page)
   ├─ components/*.js
   └─ data/*
```

See [`_template/`](./_template) for a minimal, copyable starting point.

## `article.json`

```jsonc
{
  "slug": "apm-at-scale-using-ebpf",   // URL slug (kebab-case, unique)
  "type": "blog",                       // "blog" | "study"
  "title": "APM at scale using eBPF",
  "shortdesc": "One-line summary shown on cards and in social previews.",
  "longdesc": "Optional longer description, indexed for search.",
  "topics": ["system-engineering", "low-level"],  // topic slugs (auto-created if new)
  "authors": ["gabriel-mougard"],       // author slugs (auto-created if new)
  "featured": false,
  "readingMinutes": 12,
  "seoTitle": "",                        // optional; falls back to title
  "seoDescription": "",                  // optional; falls back to shortdesc
  "cover": "cover.png"                   // optional; basename of a src asset (matched to its hashed build output)
}
```

## Build & publish

```bash
cd 0000_blog_apm_at_scale_using_ebpf
npm ci && npm run build        # → dist/
```

Publishing uploads the built `dist/` tree to R2 and registers the version with
site-api. It is done by the GitHub Action (manually triggered), or locally
against the docker-compose stack:

```bash
go run ./tools/article-publisher \
  -dir articles/0000_blog_apm_at_scale_using_ebpf \
  -api http://localhost:8080 \
  -token "$CONFIG_INGEST_TOKEN"
```

The publisher never holds R2 credentials: site-api hands back presigned PUT
URLs, the publisher uploads to them, then calls commit to publish the version
atomically. Re-publishing an unchanged build is a no-op (idempotent by content
checksum).
