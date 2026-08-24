---
title: The boundary API, three endpoints, zero hand-written SQL
toc: false
---

```js
const cover = FileAttachment("cover.png");
```

<div class="hero">
  <h1>The boundary API:<br>three endpoints, zero SQL</h1>
  <h2>Part 3: the Semantic Layer API in detail highlighting the selections, manifest versions, and hot-reloading of the live engine.</h2>
</div>

Part 1 promised two teams joined by one contract. This is the contract framework made concrete. It's a small Python server (FastAPI, running under [Granian](https://github.com/emmett-framework/granian) with TLS so the browser gets HTTP/2) wrapping open-source MetricFlow in-process. It loads the compiled dbt manifest, and it is **the only component in the system that generates SQL**. That sentence deserves underlining. There is one place where semantic selections become warehouse queries. Everything else (the app, the UI, the config store) speaks metric names and dimension names, or it doesn't speak at all.

## The endpoints

```text
GET  /api/v1/metrics      every metric, with dimensions and queryable time grains
GET  /api/v1/catalog      models, dimensions, curated explores, aliases
POST /api/v1/query        compile + run a selection -> Arrow IPC (JSON on Accept)
GET  /api/v1/cache/stats  cache hits/misses/size , aka the 'observability hook'
POST /admin/refresh       load a compiled manifest           (admin key)
POST /admin/aliases       declare a rename map               (admin key)
```

Three properties make this contract work, and they're worth writing down because they're easy to skip and expensive to skip:

1. **Selections name semantic objects, never raw columns.** A request says `metrics: ["impressions", "ctr_pct"]`, `group_by: ["demand_grain__geo_country"]`. Physical tables don't exist in this vocabulary.
2. **Every response carries a `manifest_version`** (the content hash of the semantic manifest) in headers *and* in the Arrow schema metadata. It is the compatibility safety belt which is part of every cache key, and the anchor for drift detection (see in part 7).
3. **Two keys.** Reads use an API key and the manifest uses a separate admin key. The only writer of model truth is the dbt-runner.

## The /query contract

A query is a *selection* like metrics, group-bys, filters, ordering, a limit. There are no `model` field because it's inferred from the metrics.

```json
{
  "metrics": ["impressions", "clicks", "ctr_pct"],
  "group_by": ["metric_time__day", "demand_grain__geo_country"],
  "where": [
    "{{ TimeDimension('metric_time','day') }} >= '2026-05-12'",
    "{{ TimeDimension('metric_time','day') }} <= '2026-05-18'",
    "{{ Dimension('demand_grain__geo_country') }} NOT IN ('US')"
  ],
  "order_by": ["-impressions"],
  "limit": 5000
}
```

Two details that took iterations to get right:

- **`where[]` entries are MetricFlow Jinja** over qualified dimensions, resolved to physical columns by the engine. The app never learns what `geo_country` maps to but instead, it learns the *syntax* once and the semantics live in the manifest. A filter on a dimension a model doesn't have is either skipped (app-side, best effort) or rejected (server-side, loudly).
- **Time is always an explicit range.** The app server resolves a relative preset ("last 7 days") to absolute dates before the query exists, so "last 7 days" is *one fixed query* within its window. That single habit is what makes caching (see part 5) working.

The response is Arrow IPC by default (`application/vnd.apache.arrow.stream`) or column-oriented JSON when the client sends `Accept: application/json` (tools, debugging, curl). The JSON shape is worth a look because it's the contract's test form:

```json
{
  "sql": "SELECT ...",
  "schema_info": { "fields": [
    { "name": "metric_time__day", "label": "Date (day)" },
    { "name": "ctr_pct",          "label": "CTR %" } ] },
  "data": {
    "metric_time__day": ["2026-05-12", "2026-05-12"],
    "geo_country":      ["GB", "FR"],
    "impressions":      [142300, 98800],
    "ctr_pct":          [0.0041, 0.0038]
  }
}
```

Columnar data, labels resolved server-side from the manifest's `label:` fields, and the compiled SQL are included for free. Perf headers ride alongside: `x-sl-cache` (`hit | miss | coalesced`), `x-sl-compute-ms`, `x-sl-manifest-version`.

## The manifest version acts  as a smart hash

The engine is an `EngineManager` singleton. Loading a manifest means parsing it, rebuilding the MetricFlow engine, and stamping a version:

```python
# engine_manager.py (abridged)
class EngineManager:
    def load_manifest(self, manifest_json: str) -> None:
        semantic_manifest = parse_manifest_from_dbt_generated_manifest(
            manifest_json_string=manifest_json
        )
        lookup = SemanticManifestLookup(semantic_manifest)
        engine = MetricFlowEngine(
            semantic_manifest_lookup=lookup,
            sql_client=self._sql_client,
        )
        # The manifest version is the content hash of the compiled manifest:
        # it is the cache key's safety belt: a metric redefinition changes
        # the hash, which busts exactly the affected cached results.
        version = hashlib.sha256(manifest_json.encode("utf-8")).hexdigest()[:12]
        labels = self._build_label_index(engine)
        with self._lock:
            self._engine = engine
            self._manifest_version = version
            self._labels = labels
            self._semantic_manifest = semantic_manifest
```

That 12-character hash is load-bearing in three places: it stamps every query response, it sits in every cache key (so a redefined metric invalidates exactly its own entries), and the app server compares it against what saved reports were built with to detect drift.

## The dbt-runner loop generates the source of truth

The semantic server never reads dbt files directly. Model truth arrives only through `POST /admin/refresh`. In the PoC a small loop keeps everything in step so that on cold start it waits for the source tables to have rows, then repeats on an interval:

```text
1 · dbt run             build the marts on the warehouse
2 · dbt parse           compile semantic_manifest.json
3 · POST /admin/refresh hot-reload the engine (under a lock, zero downtime)
4 · POST /admin/aliases post the rename map
5 · sleep               then repeat
```

Because the dbt project is bind-mounted into the container, editing a metric and waiting one loop is the whole release process (a developer loop that makes changing a metric *feel* like editing code, which is exactly what it should feel like). In production this loop is dbt CI: the manifest is an artifact, the POST happens on deploy. The engine doesn't care which, that's the point of the boundary.

Two things to notice about the lock discipline. `load_manifest` swaps `self._engine` under a single lock, and readers take the same lock. There's no half-loaded state, meaning that a query either sees the old engine or the new one. And the swap is cheap enough to be invisible (a reload takes milliseconds), queries in flight finish against the old engine, the next one uses the new.

## Build vs buy stays open

A question arises: why self-host MetricFlow instead of buying a managed semantic layer? Two reasons, one strategic and one operational.

The strategic one: **the `/query` contract is ours.** MetricFlow runs behind it as an implementation detail. If running it ourselves ever costs more than it earns, we swap the implementation for the managed equivalent *behind* the same contract (the app never notices). Keeping the boundary narrow is what makes build-vs-buy a reversible decision instead of a rewrite.

The operational one: three things have to live next to the engine: SQL generation, the result cache with single-flight, and Arrow encoding. A self-hosted server is the natural place for all three, and part 5 explains how far that cache carries the system.

There is also a second front door worth noting, because it cost almost nothing: the same engine, cache and manifest are exposed over **MCP** (`list_metrics`, `get_dimension_values`, `query_metrics`) and over **Arrow Flight** for server-to-server consumers. This creates a "One engine, one cache, one manifest" framework so that a new consumer means another front door, not a second query engine. Whether the *app* server should also speak MCP, so an assistant can drive workspaces and reports and not just metrics, is one of the open questions at the end of part 7.

---

<div class="small muted">Part 3 of 8. Next: <a href="https://computeflux.xyz/en/articles/semantic-layer-live-runtime">No snapshots: reports that run live</a>.</div>

<style>
.hero { text-align: center; margin: 2rem 0 3rem; }
.hero h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.02; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #8b8bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.35rem); font-weight: 400; max-width: 40rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
.muted { color: var(--theme-foreground-muted); }
</style>
