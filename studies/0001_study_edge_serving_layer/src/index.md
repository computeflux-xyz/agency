---
title: "Edge e-commerce: the catalogue is a build artifact"
toc: false
---

```js
import {fmtInt, fmtPct, fmtDuration, writeAmplification, mediaQueue} from "./components/serving.js";
const variants = await FileAttachment("data/variants.csv").csv({typed: true});
const kvKeys = await FileAttachment("data/kv_keys.csv").csv({typed: true});
const cover = FileAttachment("cover.svg");
```

<div class="hero">
  <h1>Edge e-commerce: The catalogue is<br>a build artifact</h1>
  <h2>Part 2 of 3. Trading twenty-eight database triggers for one publish button, and the backoffice that makes it possible.</h2>
</div>

<div class="client-strip">
  <div class="field"><span class="k">Sector</span><span class="v">Luxury spirits, direct to consumer</span></div>
  <div class="field"><span class="k">Market</span><span class="v">Central Africa (DRC)</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">Storefront · Back-office · Courier app · API</span></div>
  <div class="field"><span class="k">This part</span><span class="v">The serving layer & operator control</span></div>
</div>

[Part 1](https://computeflux.xyz/en/studies/mobile-money-payment-processor) covered the payment processor: the reason this platform can accept money in a market where card forms don't work. This part covers the other half of the story: **getting a catalog of heavy product photography in front of a buyer on mobile data, thousands of kilometers from the database.** And giving the business complete control over when and how that happens.

## One rule that changed everything

**A page render never queries the relational database.**

That sounds like a caching decision. It's not. It's an **ownership decision**, and it splits the system into three zones that never share responsibility:

<svg class="schematic" viewBox="0 0 1000 250" role="img" aria-label="Three zones: authoring, media, published">
  <defs>
    <marker id="z1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="ui-monospace, Menlo, monospace" font-size="13" fill="currentColor">
    <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55">
      <rect x="10" y="60" width="250" height="120" rx="10"/>
      <rect x="375" y="60" width="250" height="120" rx="10"/>
      <rect x="740" y="60" width="250" height="120" rx="10"/>
    </g>
    <g font-size="11" letter-spacing="2" opacity="0.7">
      <text x="20" y="46">AUTHORING</text>
      <text x="385" y="46">MEDIA</text>
      <text x="750" y="46">PUBLISHED</text>
    </g>
    <g text-anchor="middle">
      <text x="135" y="105">relational database</text>
      <text x="135" y="128" opacity="0.7">draft · active · archived</text>
      <text x="135" y="158" opacity="0.7">the only writable truth</text>
      <text x="500" y="105">object storage → resize → CDN</text>
      <text x="500" y="128" opacity="0.7">immutable, versioned keys</text>
      <text x="500" y="158" opacity="0.7">independent of publish</text>
      <text x="865" y="105">edge key-value</text>
      <text x="865" y="128" opacity="0.7">read-only snapshot</text>
      <text x="865" y="158" opacity="0.7">rebuildable from scratch</text>
    </g>
    <g stroke="currentColor" stroke-width="1.6" fill="none" marker-end="url(#z1)">
      <path d="M260 120 H370"/>
      <path d="M625 120 H735"/>
    </g>
    <g font-size="11" opacity="0.75" text-anchor="middle">
      <text x="315" y="110">upload</text>
      <text x="680" y="110">publish</text>
    </g>
  </g>
</svg>
<p class="schematic-caption">The published zone holds nothing that cannot be regenerated. That's what makes it safe to throw away.</p>

The edge snapshot isn't a cache that might be stale. It's a **build output**, the way a compiled binary is a build output. It has a version. It's produced by an explicit action. It can be rebuilt from the source of truth at any time.

This architecture exists because of a simple truth: **in emerging markets, every byte counts.** Mobile data is expensive. Latency kills conversions. And a database query from Kinshasa to Frankfurt is both.

## The media pipeline: from supplier photography to global CDN

Originals land in an S3-compatible bucket (Hetzner in production, MinIO in dev), capped at 50 MB, accepting JPEG, PNG, WebP, GIF, and AVIF. A database trigger enqueues a job. A worker pool claims it, downloads the original, resizes it with libvips through the Go bindings (`govips`), and uploads each variant to the CDN bucket (Cloudflare R2) with `Cache-Control: public, max-age=31536000, immutable`.

Two details make this pipeline production-grade:

**Versioned keys plus immutable caching.** A variant is never overwritten. A new render gets a new version prefix (`v42/products/...`), so there's no cache invalidation to orchestrate at the CDN and no window where two users see different images under the same URL. The cost is storage, the cheapest thing in the system.

**The sanitisation round-trip.** Real supplier photography contains malformed files that libvips will fail on. Decoding to PNG and re-encoding before resize converts a class of hard failures into slower successes. This is the kind of decision that only exists in a codebase that has met real inputs, the kind that come from actual suppliers in Kinshasa, not stock photos from Unsplash.

### Claiming work without a lock convoy

Jobs live in a Postgres table. Workers claim them with a single atomic statement, `SELECT ... WHERE status='pending' ORDER BY priority DESC, scheduled_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED`, which lets any number of workers pull concurrently without blocking each other.

Failures retry with exponential backoff (capped at three attempts). Jobs held by a crashed worker are returned to pending by a stale-lock sweep.

No queue broker was introduced. The database was already there, already transactional, already backed up. `SKIP LOCKED` is exactly the primitive a work queue needs. One fewer system to run, monitor, and restore at 3 a.m.

### The variant ladder: development vs production

Two families of variants exist, one per environment, and they don't match. Development renders five widths; production renders four, named for devices rather than sizes.

```js
Inputs.table(variants, {
  columns: ["environment", "variant", "edge_px", "purpose_en"],
  header: {environment: "Environment", variant: "Variant", edge_px: "Long edge (px)", purpose_en: "Used for"},
  rows: 10
})
```

That divergence is a real finding. A variant name that exists in development but not production is a URL that resolves locally and 404s live. It's cheap to fix (one config list, promoted) and exactly the kind of thing a codebase review surfaces that a demo doesn't.

## The publish: where operators take control

The first version of this platform synchronised the edge the obvious way: database triggers fired on every row change and enqueued a synchronisation task per affected key.

That mechanism was **28 triggers and 18 functions.** It was removed in a single migration whose name says what it did: `remove_kv_sync_triggers_add_catalog_publishes`. Edge writes are now produced only by an explicit publish action, batched through multi-key writes, and reconciled against stored content hashes per entity.

Why? Because trigger-per-row fails for a reason that has nothing to do with correctness and everything to do with fan-out. One product edit isn't one edge write. The product's own key changes, and so does every collection and index it appears in: the all-products set, its category index, its brand index, the search index. An editor fixing five typos in an afternoon generates writes proportional to the *shape of the catalogue*, not the size of the edit.

### Publish behaves like a commit

The back-office turns publishing into a Git-like workflow that operators already understand:

<div class="verified">Preview computes the content hash of every active entity, compares it to the stored hash, and returns a diff: added, updated, removed, plus warnings. Publish records a row in a publishes table, builds every edge structure, writes them in batches, updates the stored hashes, writes the version marker, and archives the outcome with counts, duration, and a free-text note. History lists every past publish with its version, its diff, and its author.</div>

<svg class="schematic" viewBox="0 0 1000 220" role="img" aria-label="Preview, publish, history">
  <defs>
    <marker id="p1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="ui-monospace, Menlo, monospace" font-size="13" fill="currentColor">
    <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55">
      <rect x="20" y="70" width="200" height="80" rx="9"/>
      <rect x="400" y="70" width="200" height="80" rx="9"/>
      <rect x="780" y="70" width="200" height="80" rx="9"/>
    </g>
    <g text-anchor="middle">
      <text x="120" y="104">preview</text>
      <text x="120" y="128" opacity="0.7" font-size="11">hash diff, no writes</text>
      <text x="500" y="104">publish</text>
      <text x="500" y="128" opacity="0.7" font-size="11">batched, versioned</text>
      <text x="880" y="104">history</text>
      <text x="880" y="128" opacity="0.7" font-size="11">version · diff · author</text>
    </g>
    <g stroke="currentColor" stroke-width="1.6" fill="none" marker-end="url(#p1)">
      <path d="M220 110 H395"/>
      <path d="M600 110 H775"/>
    </g>
    <path d="M880 70 C 880 20, 120 20, 120 66" fill="none" stroke="currentColor"
          stroke-width="1.4" stroke-dasharray="6 5" marker-end="url(#p1)" opacity="0.7"/>
    <text x="500" y="34" text-anchor="middle" font-size="11" opacity="0.7">a published version is a thing you can point at</text>
  </g>
</svg>

The vocabulary is deliberate. An operator who has used version control already knows what preview, publish, and history mean. The diff makes the blast radius of a change visible *before* it reaches a buyer.

Compare that with a trigger, where the change is already live by the time anyone could have looked at it.

### What the snapshot contains

The key map below is read from the publisher and the edge reader. Slug changes leave a tombstone in the slug index that resolves to a redirect, so an old product URL shared on WhatsApp doesn't become a 404.

```js
Inputs.table(kvKeys, {
  columns: ["key", "shape", "read_by", "role_en"],
  header: {key: "Key", shape: "Shape", read_by: "Read by", role_en: "Role"},
  width: {key: 300, role_en: 280},
  rows: 12
})
```

At read time, the edge worker loads these in parallel and denormalises the references (producer, regions, tasting tags, awards) into nested objects, with a name-prefix fallback for records whose IDs have drifted.

**The storefront never joins.** The join already happened at publish time.

## The backoffice: operator control over the serving layer

The back-office is where the business controls the entire serving layer. Built with React, Vite, and Ant Design, it provides:

- **Catalog Management** (`CatalogManagement.tsx`): The Git-like publish workflow with preview, diff, and history. Operators see exactly what will change before it goes live.
- **Media Dashboard**: Real-time view of image processing jobs, with retry and cancel capabilities. Track which originals are being processed, which variants have been generated, and which have failed.
- **Sync Status**: Monitor the background jobs that power the media pipeline and catalog publishing. The `syncJobStorage` and worker pool are fully observable.
- **KV Inspector**: Direct read access to the published catalog in Cloudflare KV. Verify that the latest publish actually made it to the edge.
- **Version History**: Complete audit trail of every publish, with timestamps, author, commit notes, and statistics on what changed.

This isn't just a CRUD interface. It's a **control plane** for the serving layer, designed for operators who need to understand and manage a system serving customers across Central Africa.

## What this buys, in plain terms

- **A product page is a key lookup** at a point of presence near the buyer, not a round-trip to a database on another continent. In markets where mobile data costs real money, this isn't a nice-to-have. It's essential.

- **Editors see the exact set of changes** a publish will make before it makes them, and can point at the version that introduced a regression. No more "but it worked in staging", because staging and production use the same publish mechanism.

- **Edge write volume is decoupled from editing activity**, so a bulk import doesn't translate into a bill or a rate limit. The business can make 100 changes in a day without worrying about Cloudflare costs.

- **The whole published zone can be deleted and rebuilt** from the relational source, which makes recovery a procedure rather than an incident. If something goes wrong, you can always republish from scratch.

## Where this goes next

Running your own storefront at the edge has a consequence this platform has fully embraced. Every request already passes through a server the operator controls, on its own domain, holding its own first-party cookie, and that server already knows which catalogue snapshot it served.

[**Part 3: Edge e-commerce: First-party signal, without a tracker**](https://computeflux.xyz/en/studies/first-party-signal-dco-newsletter) turns that request stream into k-anonymous cohorts computed server-side, and turns those cohorts into a newsletter that assembles itself per recipient from the same published catalogue the shop reads.

---

<div class="small muted">Figures on this page marked as models are generated from the inputs above and describe the shape of a problem, not this operator's traffic. Behaviours marked as read off the codebase were verified against source. The client, the platform and its domains are withheld deliberately.</div>

<style>
.hero { text-align: center; margin: 2rem 0 2rem; }
.hero h1 { font-size: clamp(2.2rem, 6.4vw, 4rem); line-height: 1.04; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #2f6bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.3rem); font-weight: 400; max-width: 42rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.card .big { display: block; font-size: 1.9rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.card .muted, .muted { color: var(--theme-foreground-muted); }
.card h2 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin: 0 0 0.35rem; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
.tip { margin: 1.25rem 0; padding: 0.75rem 1rem; border-left: 3px solid var(--theme-foreground-focus, #2f6bff); background: var(--theme-background-alt, rgba(47,107,255,0.06)); border-radius: 0 6px 6px 0; font-size: 0.92rem; }
</style>
