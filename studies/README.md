# `studies`

Source for the ObservableHQ **case studies** rendered on
[computeflux.xyz](https://computeflux.xyz). Same machinery as
[`../articles`](../articles), different editorial contract:

|  | `articles/` | `studies/` |
|---|---|---|
| What it is | A thought. An essay, a model, an argument. | A customer story. Something that was built and shipped. |
| `type` in metadata | `blog` | `study` |
| Metadata file | `article.json` | `study.json` |
| Burden of proof | Be interesting. | Be true, and say which parts are not measured. |

`services/site` lists and renders both; `services/site-api` owns their metadata
and the R2 blob manifest. Building and publishing is an **admin task** run by the
[`publish-content`](../.github/workflows/publish-content.yml) GitHub Action.

## Layout

One directory per study, named:

```
<XXXX>_study_<snake_case_slug>/
```

```
0000_study_mobile_money_payments/
├─ observablehq.config.js
├─ package.json
├─ study.json            ← metadata (same schema as article.json)
└─ src/
   ├─ index.md           ← English entrypoint  → dist/index.html
   ├─ fr/index.md        ← French entrypoint   → dist/fr/index.html
   ├─ cover.svg          ← schematic cover, referenced from both entrypoints
   ├─ components/*.js
   └─ data/*.csv
```

A directory here is only picked up by the build and publish loop if it holds a
metadata file and its name does not start with `_`. Raw, un-anonymised research
notes therefore sit inert if you leave them here — but they should not live in
this tree at all, because the whole point of a study directory is that it is
publishable. Keep source material outside the repository.

See [`_template/`](./_template) for a copyable starting point, and
[`../articles/README.md`](../articles/README.md#articlejson) for the metadata
schema — `study.json` is byte-for-byte the same shape.

## The three rules a study has to follow

A study is about a real client, so a reader must always be able to tell where a
statement comes from. [`_shared/observable.base.js`](./_shared/observable.base.js)
provides three callouts and they are not decorative:

```html
<div class="verified">…read off the shipped codebase.</div>
<div class="modelled">…driven by the inputs on this page, not a measurement.</div>
<div class="proposed">…a design on top of what shipped, not running anywhere.</div>
```

1. **Never invent a number.** No traffic figures, no conversion rates, no
   latencies that were not measured. If a point needs a number and the number
   does not exist, either model it from sliders on the page and mark it
   `modelled`, or cut the point.
2. **Anonymise the client.** No name, no domain, no product names, no
   identifying screenshots. Service names are renamed to neutral ones. Sector
   and market stay, because the architecture usually does not make sense
   without them — that is what the `.client-strip` band at the top of each
   study is for.
3. **Charts are schematic or explicitly a model.** Structure — topologies, state
   machines, data flow — is drawn as inline SVG with no numeric axis. Anything
   with an axis must be produced entirely by the reader's own inputs and sit
   under a `modelled` callout.

French pages set the callout labels themselves:

```html
<style>
:root { --cb-verified: "Lu dans le code livré"; --cb-modelled: "Un modèle, pas une mesure"; --cb-proposed: "Proposé, pas déployé"; }
</style>
```

## Covers

Each study ships a `src/cover.svg`: a schematic of the thing the study is about,
on the shared dark ground, with the series marker (`CASE STUDY n/3`) and the
title. No photography, no client imagery. It must be referenced from the page
(`FileAttachment("cover.svg")`) so the build emits it, and named in
`study.json`'s `cover` field so site-api resolves it to the hashed build output.

## Cross-part links

A study is served from object storage inside a sandboxed iframe, so a
root-relative link (`/studies/...`) resolves against the R2 bucket and breaks.
**Always write the canonical absolute URL** (French at the root, English under `/en`):

```md
[Part 2](https://computeflux.xyz/en/studies/edge-serving-layer)
[Partie 2](https://computeflux.xyz/studies/edge-serving-layer)
```

That is the address that is correct when the built page is read on its own, and
it is not the address you get locally. The bridge in
[`articles/_shared/observable.base.js`](../articles/_shared/observable.base.js)
closes that gap at runtime: the parent page posts its own origin into the frame
(`cf-site-origin`), and every `https://computeflux.xyz/…` link is rewritten to
it and given `target="_top"` so the click moves the whole page instead of
loading the site inside the frame. One build is therefore correct on
`localhost:4321`, on staging and in production.

Two consequences worth knowing:

- Changing the bridge means every published article and study needs a
  **republish** to pick it up. `task content:publish:all` does that.
- The parent grants `allow-top-navigation-by-user-activation` on the iframe for
  the `target="_top"` half to work. See
  [`ObservableEmbed.astro`](../services/site/src/components/organisms/ObservableEmbed.astro).

## Build & publish

```bash
cd 0000_study_mobile_money_payments
npm ci && npm run build        # → dist/
```

```bash
go run ./tools/article-publisher \
  -dir studies/0000_study_mobile_money_payments \
  -api http://localhost:8080 \
  -token "$CONFIG_INGEST_TOKEN"
```

The publisher walks both content trees for its discovery and prune modes:

```bash
go run ./tools/article-publisher -list          # every publishable dir, both roots
go run ./tools/article-publisher -prune -token "$T" -api "$API"   # keep-set derived from disk
```
