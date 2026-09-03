---
title: A warehouse in a shoebox for our semantic layer
toc: false
---

```js
const cover = FileAttachment("cover.png");
```

<div class="hero">
  <h1>Semantic layer: A warehouse in<br>a shoebox</h1>
  <h2>Part 8: our local harness is a patched BigQuery emulator with a RAM-backed store, and fake traffic that does not stops.</h2>
</div>

Every part of this series up to now has described production-shaped behavior. But the entire system (UI, app server, semantic layer, dbt, MySQL, moving data) ran on one machine, offline, with no cloud project and no bill. That deserves its own article, partly because the local harness is what made the whole PoC *fast to iterate*, and partly because its failure modes were as instructive as the real system's.

The stack to stand in for is the production ingestion pipeline: `PubSub -> Dataflow -> object storage -> BigQuery`. Locally, that's two pieces:

```text
traffic generator ──writes moving rows──▶ BigQuery emulator (SQLite in tmpfs)
      │
      └──durable copy──▶ parquet landing zone (./data)
```

The emulator stands in for BigQuery. The generator stands in for the pipeline. Everything *above* them (dbt, MetricFlow, the semantic server, the Go server, the React UI) is the exact same code that would run in production. That's the whole trick: the harness is disposable but the system is not.

## The emulator is a patched fork (two real bugs to patch upstream)

The emulator is a vendored fork of [`goccy/bigquery-emulator`](https://github.com/goccy/bigquery-emulator) which is a pure-Go server that speaks the BigQuery API over a SQLite backend. Two things pushed us off the published image and onto our own build:

1. **Native builds.** The pure-Go backend cross-compiles to a static binary, so the image builds for arm64 directly. No QEMU emulation eating the CPU while pretending not to.
2. **`dbt run` genuinely working.** The upstream `main` branch ships real `INFORMATION_SCHEMA` tables and registers query jobs on the synchronous path, which is most of the battle. Two emulator bugs still broke dbt, and our fork patches both:
   - **`statementType`.** Every query job reported itself as `SELECT` and set no `destinationTable` for DDL, so dbt-bigquery's `tables.get(job.destination)` dereferenced a nil destination for `SELECT`/CTAS cases : a `'NoneType' object has no attribute 'path'` you get to debug through three layers of libraries.
   - **`CREATE OR REPLACE` re-runs.** The catalog sync only ever *created* metadata, so a second `dbt run` hit a 409 "table is already created". The fork makes it replace-aware, so repeated `dbt run` is idempotent.

This is the boring, unglamorous kind of engineering that the PoC exists to find early: **the toolchain boundary (dbt talking to the warehouse API) is where the incompatibilities live.** Better to meet them on a laptop than in the first production deploy.

## The store: RAM-backed, capped, disposable

The emulator's SQLite file lives in a **size-capped tmpfs** (`BQ_TMPFS_SIZE`, default 4GB). Two properties fall out of that choice:

- **It never touches the host disk.** The store is ephemeral by construction: `compose down` throws it away, and the system is designed not to care (more on that in a second).
- **It's a safety net.** A runaway write turns "fills the host disk" into "fills the tmpfs and queries fail with `disk I/O error`": still a failure, but a contained, obvious, resettable one.

Treating the emulator as *ephemeral* forces a discipline that turns out to be exactly right for production too: **the durable copy lives elsewhere.** Here, it's a parquet landing zone under `./data`. On boot, the traffic generator recreates the catalog and replays a recent window back in, so the emulator is always a projection of the landing zone, never the source of truth. Same discipline, production-shaped: the warehouse is derivable, the object storage is the record.

## The traffic generator produces data that never stops moving

A static dataset would prove nothing. The interesting bugs like cache freshness, the drift demo, dbt loops racing against writes, only show up when data moves. So the generator writes random-stationary traffic into the landing zone and streams it into the emulator:

- **Write bandwidth is sampled** every few seconds around a mean equilibrium, so the store grows at a realistic, jittery rate.
- **Eviction keeps the store bounded.** Rows past a retention window (30 minutes for the high-volume event tables, hours for aggregates, days for the daily ones) are `DELETE`d on a schedule, so the current period is never dropped but the store *plateaus* at a working set instead of growing forever. The DELETE doesn't shrink the SQLite file but SQLite reuses the freed pages, which is the exact kind of storage detail that's fun to watch and expensive to learn in production.
- **The landing zone is capped** the same way, with its own budget and rate.

The result is a warehouse that behaves like a warehouse: fresh rows arriving, old rows aging out, aggregates lagging the raw events by a few seconds. You can watch the cache hit-rate, exercise `?refresh=true` against genuinely new data, and run the drift demo against a live system, all offline.

## What ships, what doesn't

- **Ships:** the dbt project, the semantic models and metrics, the semantic server (cache, single-flight, Arrow IPC, manifest handling), the Go server (skeleton, scope, descriptors, drift gate), the React UI, the MySQL schema.
- **Doesn't ship:** the emulator (real BigQuery), the traffic generator (the real ingestion pipeline), the self-signed TLS cert, the dbt-runner *loop* (production uses dbt CI to post the manifest on deploy. The loop is a developer convenience, not an architecture).

The pattern worth stealing is simpler than it looks: **pick the cheapest thing that speaks the same wire protocol, make it ephemeral, and keep the durable copy yours.** It converts "can't test the warehouse path" into "one command and everything runs" and a system you can stand up on a laptop in a minute is a system you'll actually test the scary failure modes on, instead of hoping.

That's the series. Two teams, one contract; metrics as code; a narrow API with a hash for a version; live queries with a cache that can't lie; a boring config schema; and drift treated like the API problem it is. The PoC proved the footguns and the working answers before production spent anything but coffee. The next step, when it comes, is standing the same architecture up in front of the real warehouse — with the boundaries already drawn.

---

<div class="small muted">Part 8 of 8. Start from the beginning: <a href="https://computeflux.xyz/en/articles/semantic-layer-team-topology">A semantic layer is a team boundary</a>.</div>

<style>
.hero { text-align: center; margin: 2rem 0 3rem; }
.hero h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.02; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #8b8bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.35rem); font-weight: 400; max-width: 40rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
.muted { color: var(--theme-foreground-muted); }
</style>
