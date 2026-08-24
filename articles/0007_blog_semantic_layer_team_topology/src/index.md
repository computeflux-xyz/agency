---
title: A semantic layer is a team boundary
toc: false
---

```js
const cover = FileAttachment("cover.png");
```

<div class="hero">
  <h1>A semantic layer is<br>a team boundary</h1>
  <h2>Part 1 of a series on building a report engine the boring way: two teams, one contract, no SQL in the app.</h2>
</div>

Every company that sells anything eventually builds the same thing: a report. Somebody pulls numbers from the warehouse, reshapes them in a spreadsheet, styles a chart, pastes it into a deck, emails it to a client. Then the client asks to drop one advertiser from the report, and the whole loop starts again: through a Slack ticket, a manual SQL edit, a re-export, and an analyst who quietly updates their résumé.

We built a working end-to-end proof of concept to kill that loop. This series showcase the whole framework development process (what we built, why each piece looks the way it does, and the decisions that turned out to matter). The whole thing is a self-service report engine over BigQuery-style warehouse tables, gated by a dbt + MetricFlow semantic layer. But that sentence hides the actual point.

**The point is organizational, not technical.** The system is split across two teams that cannot work on each other's cadence, joined by a single contract: the Semantic Layer API. Every design decision below is a consequence of that line. Get the boundary right and the rest is plumbing. Get it wrong and you have re-invented the Slack ticket, but with more YAML.

## Reporting today is a manual pipeline

Before the system existed, a campaign report's journey looked like this:

<div class="flow-bad">BigQuery / Looker Studio -> export CSV -> reshape in Sheets -> chart &amp; format -> paste into PowerPoint -> email the client</div>

Every arrow in that chain is a hand. And every hand is a place where time and errors leak:

- **Stale &amp; inconsistent.** Each deck is a point-in-time copy, reformatted by hand. Numbers drift between decks, formatting drifts between clients.
- **Analytics is interrupted.** "Could you delete brand X from the report? It's not approved." That is a ticket to a two-person analytics team, a manual BigQuery edit, a re-export, and a context switch that costs the next hour of their lives.
- **No reuse.** The same campaign report is rebuilt from scratch every week. There are no templates, no governance, no audit.

None of this is a tools problem. It is a *who owns what* problem. The analyst owns the SQL, the client services person owns the deck, and every boundary between them is a manual copy-paste. The system's job is not to make charts prettier, it is to **replace every hand-off with a machine-readable contract**.

## Two teams but one contract

Here is the whole architecture in one paragraph. On one side, the **application plane**: a React UI and a Go config server over MySQL. It owns templates, blocks, workspaces, filters. Everything is about *presentation and scope*. On the other side, the **analytics plane**: a dbt project plus MetricFlow over the warehouse. It owns staging models, marts, semantic models, and metric definitions. Everything is about *business logic and SQL*.

In the middle, a small Python server wrapping MetricFlow. It exposes three read endpoints and two admin endpoints:

```text
GET  /api/v1/metrics      the builder's picker: every metric + its dimensions
GET  /api/v1/catalog      models, dimensions, curated explores, aliases
POST /api/v1/query        compile + run a selection, return Arrow IPC (or JSON)
GET  /api/v1/cache/stats  cache hits/misses/size, for observability
POST /admin/refresh       load a compiled manifest (admin key only)
POST /admin/aliases       declare a rename map (admin key only)
```

That is the contract. And the rules that make it work are almost insultingly simple:

1. **The app team never writes analytical SQL.** Ever. They say *what* to ask (a selection of metric names, group-bys and filters) and the semantic layer compiles it.
2. **The analytics team never knows about reports, blocks, or workspaces.** They ship metrics. They don't know or care how they're laid out.
3. **The API is the only coupling.** Both sides ship on their own cadence and meet only at this contract.

This is not a novel idea. It's what dbt has been arguing for years: metrics are code, governed definitions, owned by the people who understand the business maths. What surprised us is how much *architecture* falls out of just taking that idea seriously. No queue, no worker, no snapshots, no object storage. A report view becomes: read a skeleton from the app server, query the semantic layer per block, render. That's it.

## The vocabulary, precisely, because words matter

This series uses a small glossary, and the system lives or dies by people using it consistently:

- **Workspace** is the scope: campaigns, filters, data sources, template assignments.
- **Template** is a reusable report definition (ordered blocks). Global, not workspace-owned.
- **Report block** is one visualization (table, bar, line) bound to exactly one semantic model. The atom of a report.
- **Descriptor** is a curated explore over one model at a pinned grain, auto-derived from the catalog. The governed surface a block binds to.
- **Skeleton** is what the app server returns at read time: per-block query specs with filters and timeline baked in. No data.
- **Semantic model** is a dbt/MetricFlow model over a warehouse table: entities, dimensions, measures.
- **Metric** is a governed calculation, e.g. `ctr_pct = clicks / impressions`. A contract, not a column.
- **Catalog** available at `/api/v1/catalog`: the live list of models, metrics, dimensions and aliases the app server syncs from.
- **Manifest version** is the semantic layer's content hash. The compatibility safety belt, and part of every cache key.

One block = one model, by the way. We never join across models. Cross-source comparison is a presentation concern (you place blocks side by side) not a query concern. Joining demand and supply tables in SQL silently produces wrong numbers, because their grains and identities differ. This one rule deletes an entire class of "why don't these numbers add up" meetings.

## The shape of the thing

If you want the picture before the deep dives:

```text
browser ──config + skeleton──▶ report app server (Go, MySQL)
   │
   └──data: Arrow IPC over HTTP/2──▶ Semantic Layer (Python, MetricFlow)
                                       │  cache + single-flight
                                       ▼
                              compiled SQL → warehouse
```

Two details to notice early, because they keep coming back:

1. **The browser queries the semantic layer directly.** The Go server is not in the data path. It resolves scope once, returns a skeleton of per-block query specs, and steps aside. No fan-out, no buffering, no report payloads anywhere.
2. **Nothing is generated ahead of time.** Reports run live on every view. The only cache is in-memory in the semantic server. There is no snapshot to go stale, because there is no snapshot.

Both of these are consequences of the team split: the app team has no business touching the data path, and the analytics team has no business materializing reports.

## What this series covers

Eight parts, each readable on its own:

1. **This one.** The thesis: two teams but one contract.
2. [Metrics are contracts, not columns](https://computeflux.xyz/en/articles/semantic-layer-dbt-modeling) : the dbt + MetricFlow model stack, from raw tables to governed metrics.
3. [The boundary API](https://computeflux.xyz/en/articles/semantic-layer-api-contract) : the `/query` contract, manifest versions, and hot-reloading a live engine.
4. [Reports that run live](https://computeflux.xyz/en/articles/semantic-layer-live-runtime) : the skeleton, scope resolution, and Arrow IPC over HTTP/2.
5. [The cache that can't lie](https://computeflux.xyz/en/articles/semantic-layer-caching) : single-flight, canonical keys, and why a cached number is still a correct number.
6. [A database for report definitions](https://computeflux.xyz/en/articles/semantic-layer-config-model) : the MySQL model and its templates, blocks, workspaces, and soft references to a third-party source of truth.
7. [When your metrics drift](https://computeflux.xyz/en/articles/semantic-layer-drift-compat) : aliases, the drift demo, and failing the CI build instead of production.
8. [A warehouse in a shoebox](https://computeflux.xyz/en/articles/semantic-layer-laptop-warehouse) : faking BigQuery on a laptop so the whole stack runs offline.

The system in this series is a proof of concept: real code, real moving data, real footguns running locally against an emulated warehouse. It is not the only way to build a semantic layer, and part 8 is about exactly where the PoC cheats. But the boundary, the contract, and the failure modes are the same ones you will meet at production scale, which is why we bothered.

The one idea to leave with, before the code starts: **a semantic layer is not a database feature. It is an interface between two teams that used to communicate through tickets.** Build that interface well and the tickets (should) stop.

---

<div class="small muted">Part 1 of 8. Next: <a href="https://computeflux.xyz/en/articles/semantic-layer-dbt-modeling">Metrics are contracts, not columns</a>.</div>

<style>
.hero { text-align: center; margin: 2rem 0 3rem; }
.hero h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.02; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #8b8bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.35rem); font-weight: 400; max-width: 40rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.flow-bad { margin: 1.25rem 0; padding: 0.75rem 1rem; border: 1px solid #e5a2a2; border-radius: 8px; background: rgba(239,68,68,0.06);
  font-family: var(--mono-font, ui-monospace, monospace); font-size: 0.85rem; color: var(--theme-foreground-muted); overflow-x: auto; white-space: nowrap; }
.tip { margin: 1.25rem 0; padding: 0.75rem 1rem; border-left: 3px solid var(--theme-foreground-focus, #8b8bff); background: var(--theme-background-alt, rgba(139,139,255,0.06)); border-radius: 0 6px 6px 0; font-size: 0.92rem; }
.small { font-size: 0.8rem; }
.muted { color: var(--theme-foreground-muted); }
</style>
