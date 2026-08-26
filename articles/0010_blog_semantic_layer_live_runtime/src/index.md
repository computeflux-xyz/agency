---
title: Reports that run live instead of snapshots
toc: false
---

```js
const cover = FileAttachment("cover.png");
```

<div class="hero">
  <h1>No snapshots but <br>reports that run live</h1>
  <h2>Part 4: the skeleton, scope resolution in Go, and why the browser is the query orchestrator.</h2>
</div>

Here is the architectural decision that deletes the most complexity, stated as bluntly as possible: **a report is never generated. It is rendered.** There is no queue, no worker, no snapshot, no object storage, no "report ready" email. Opening a report is a read operation, and the numbers you see were computed seconds ago.

The machinery that makes that possible has three parts: the **skeleton** (what to ask), the **fan-out** (who asks), and the **transport** (how the answer gets back) and each one earns its keep.

## Only two calls to get structured data

When a user opens a report, exactly two kinds of requests happen:

1. The browser reads the **skeleton** from the "metadata" server (Golang in our case) once. It's the report layout plus, per data block, a resolved query spec: `metrics`, `group_by`, `where`, `order_by`, `limit`, with workspace filters and timeline baked in.
2. The browser queries the semantic layer **directly**. This means one `POST /api/v1/query` per block, multiplexed over a single HTTP/2 connection.

The Go server is *not* in the data path. It means that there won't be any fan-out through a backend, that no buffering will occur on a whole report in server memory, that there would be no serialization hop between the warehouse and the browser. The app backend stays what it should be and its role is to return metadata and governance, a service that says *what to query* and never runs a query.

## This allows the skeleton builder to return scope resolution as a pure function

The heart of the metadata server's read path is `ResolveScope`. It is a pure, fast, and simple procedure. Basically, it takes a block's saved config, the descriptor it binds to, the workspace filters, the campaigns, the timeline and the alias map, and returns the query spec the UI will POST:

```go
// ResolveScope builds a block's query spec: it reads the block config (metrics,
// group_by, order_by, limit), defaults group_by to the descriptor's pinned
// grain, and bakes the timeline and workspace exclusions into `where`.
func ResolveScope(in ScopeInput) (BlockQuerySpec, error) {
	if in.Descriptor == nil || !in.Block.Type.NeedsDataSource() {
		return BlockQuerySpec{}, fmt.Errorf("scope: block %q has no data source to query", in.Block.PublicID)
	}

	cfg, err := models.ParseBlockConfig(in.Block.Config)
	if err != nil {
		return BlockQuerySpec{}, fmt.Errorf("scope: parse block config: %w", err)
	}

	metrics := cfg.AllMetrics()
	if len(metrics) == 0 {
		return BlockQuerySpec{}, fmt.Errorf("scope: block %q selects no metrics", in.Block.PublicID)
	}

	groupBy := cfg.GroupBy
	if len(groupBy) == 0 && in.Descriptor.Grain != nil && *in.Descriptor.Grain != "" {
		groupBy = []string{*in.Descriptor.Grain}
	}

	orderBy := cfg.OrderBy

	// Rewrite renamed refs (old -> new) so a saved report that still
	// references the pre-rename name resolves against the live manifest.
	if len(in.Aliases) > 0 {
		metrics = aliasAll(in.Aliases, metrics)
		groupBy = aliasAll(in.Aliases, groupBy)
		orderBy = aliasAllOrdered(in.Aliases, orderBy)
	}

	entity := modelEntity(in.Descriptor.Provider, in.Descriptor.Model)
	start, end := TimelineRange(in.Timeline, in.Now)
	if in.Start != nil && in.End != nil {
		start, end = in.Start.UTC(), in.End.UTC()
	}

	where := buildWhere(entity, in.Descriptor.Model, in.Filters, in.Campaigns, start, end)

	return BlockQuerySpec{
		Metrics: metrics,
		GroupBy: groupBy,
		Where:   where,
		OrderBy: validOrderBy(orderBy, metrics, groupBy),
		Limit:   cfg.Limit,
	}, nil
}
```

And the part that makes workspace filters global (the "exclude this publisher" toggle that used to cost a Slack ticket and a re-export):

```go
// buildWhere assembles MetricFlow `where` constraints (ANDed) from the
// timeline and workspace filters/campaigns.
func buildWhere(entity, model string, filters []models.WorkspaceFilter,
	campaigns []models.WorkspaceCampaign, start, end time.Time) []string {
	var where []string

	where = append(where,
		fmt.Sprintf("{{ TimeDimension('metric_time', 'day') }} >= '%s'", start.Format("2006-01-02")),
		fmt.Sprintf("{{ TimeDimension('metric_time', 'day') }} <= '%s'", end.Format("2006-01-02")),
	)

	isSupply := strings.Contains(model, "supply")

	byType := map[models.FilterType][]string{}
	for _, f := range filters {
		byType[f.FilterType] = append(byType[f.FilterType], f.RefID)
	}

	if v := byType[models.FilterCountryExclusion]; len(v) > 0 {
		where = append(where, fmt.Sprintf("{{ Dimension('%s__geo_country') }} NOT IN (%s)", entity, quoteList(v)))
	}

	if v := byType[models.FilterPublisherExclusion]; len(v) > 0 {
		where = append(where, fmt.Sprintf("{{ Entity('publisher') }} NOT IN (%s)", quoteList(v)))
	}

	// site_domain, device_type and format_type are dimensions on BOTH the
	// demand and supply models, so these exclusions apply uniformly.
	if v := byType[models.FilterSiteExclusion]; len(v) > 0 {
		where = append(where, fmt.Sprintf("{{ Dimension('%s__site_domain') }} NOT IN (%s)", entity, quoteList(v)))
	}

	// ... device and format exclusions, then:
	if !isSupply && len(campaigns) > 0 {
		ids := make([]string, len(campaigns))
		for i, c := range campaigns {
			ids[i] = c.CRMCampaignID
		}

		where = append(where, fmt.Sprintf("{{ Entity('campaign') }} IN (%s)", quoteList(ids)))
	}

	return where
}
```

Two properties make this design worth copying:

- **Scope is baked once everywhere.** Every workspace filter lands in *every* block's spec, so "exclude TELCO FR" drops it from the headline KPIs *and* the geo breakdown in the same refresh. Consistency is a property of the system, not a thing an analyst remembers to do by hand.
- **It's cheap and re-done every time.** Plain MySQL reads plus a third-party (e.g, CRM source) lookup. It takes microseconds next to the warehouse call. There's no reason to cache the skeleton aggressively, which means the scope is always current.

The timeline resolution deserves its own quiet applause, because it's a caching trick disguised as a date helper. A relative preset like `last_7d` becomes absolute dates *before* the query spec exists:

```go
// TimelineRange resolves a relative timeline preset to an absolute [start, end]
// window (inclusive, day grain).
func TimelineRange(t models.Timeline, now time.Time) (time.Time, time.Time) {
	end := now.UTC()
	switch t {
	case models.TimelineLast14d:
		return end.AddDate(0, 0, -13), end
	case models.TimelineLast30d:
		return end.AddDate(0, 0, -29), end
	// ...
	case models.TimelineLast7d:
		fallthrough
	default:
		return end.AddDate(0, 0, -6), end
	}
}
```

"Last 7 days" requested twice in the same minute is two *identical* queries, not two queries that differ by a timestamp. Part 5 runs with that ball.

## The browser is the fan-out orchestrator

Once the skeleton arrives, the UI side does the natural thing which is to launch one query per block, not thinking about any coordination between them:

```tsx
// read the skeleton from the metadata server, once
const { data: skeleton } = useQuery(
  ['skeleton', reportId, workspace, timeline],
  () => getSkeleton(reportId, { workspace, timeline }));

skeleton.blocks.map((b) =>
  <BlockView key={b.public_id} block={b} />);

// each block runs its own query, straight to the
// semantic layer, multiplexed over HTTP/2
const { data } = useQuery(
  ['block', b.public_id, b.query, refresh],
  () => queryArrow(b.query, refresh));  // POST + decode IPC
```

This is how every dashboard product loads, and for the same reasons:

- **No all-or-nothing envelope.** A nine-block report is nine independent streams on one connection. Each tile paints as its data arrives so a slow block fails on its own without holding up the page. There is no single response to assemble, so there is no single point of failure to build state machines around.
- **If the spec changed, the query changed too.** Change a filter and only the blocks whose spec actually changed re-query: TanStack Query sees an identical key for the rest and keeps them drawn. Part 5 covers the client cache that makes this cheap.
- **HTTP/2 is the multiplexer.** Granian negotiates HTTP/2 over TLS, so all block queries share one connection instead of hitting the browser's HTTP/1.1 `six-connections-per-origin` cap. The PoC's TLS is a self-signed cert, and the dev client skips verification which is fine locally, and exactly the kind of detail that would be embarrassing to discover in production.

## Columnar all the way down is the transport philosophy

The response format matters more than it looks. The semantic server keeps results as a `pyarrow` `Table` and ships `Arrow IPC` straight to the browser:

```python
# query_runner.py
def table_to_ipc(table: pa.Table, sql: str, manifest_version: str,
                 labels: dict | None = None) -> bytes:
    """Serialize a table as an Arrow IPC stream with the envelope + labels."""
    table = table_with_envelope(table, sql, manifest_version, labels)
    sink = pa.BufferOutputStream()
    with pa.ipc.new_stream(sink, table.schema) as writer:
        writer.write_table(table)

    return sink.getvalue().to_pybytes()
```

The envelope is a bit of a sneaky part because the compiled SQL, the manifest version and per-column labels ride in the Arrow *schema metadata*, so the payload is self-describing. And the browser side decodes it without ever parsing JSON:

```ts
import { tableFromIPC } from 'apache-arrow';

const buf   = await res.arrayBuffer();      // POST /api/v1/query
const table = tableFromIPC(new Uint8Array(buf));
const sql     = table.schema.metadata.get('report.sql');
const version = table.schema.metadata.get('report.manifest_version');
const rows  = table.toArray();              // typed columns -> objects
```

Why Arrow IPC instead of JSON? Three reasons, in descending order of importance:

1. **Columnar and near zero-copy to decode.** There is no per-row `JSON.parse` allocation which means a 10k-row table decodes as a handful of typed arrays.
2. **Type fidelity.** Timestamps, decimals and nulls will survive the round trip which is the exact things JSON silently mangles.
3. **The schema metadata carries the envelope.** Not only SQL but manifest version and labels ships with the payload which is observability data for free (needed in the UI to "investigate" a query runtime metadata).

The JSON form still exists: `Accept: application/json` gets you column-oriented JSON but it's for tools and debugging. The hot path is Arrow should be end to end: `warehouse -> engine -> IPC stream -> browser`.

## We let blocks fail alone (graceful degradation)

Live querying means a broken reference fails at *view time*, not build time. The system leans into that: a block whose metric no longer exists is flagged in the skeleton with an error, and the UI renders a fixable card for that block alone:

```json
{
  "public_id": "blk_07K...",
  "type": "bar_chart",
  "data_source_id": "media.demand_geo",
  "error": "metric 'device_family' is not in the current manifest"
}
```

The other blocks query as normal. There is no report-level 500, because there is no report-level response. Part 7 is about preventing this case from happening silently (but when it happens anyway, the failure mode is one card, not one broken page).

## Why no Temporal.io/Airflow, no snapshots, no object storage ?

The question this design forces is: *why doesn't it need a job system?* We acknowledge that a scheduler and a worker earn their keep when there's a durable async job producing a stored artifact with retries, heartbeats, and a `pending -> ready` state machine with a cadence. However, the live model has none of those needs:

- **No artifact** to produce, so nothing to make durable. A view is request/response.
- **Fast.** Pre-aggregated tables plus the result cache (see part 5) keep a block query inside one HTTP request.
- **Concurrency is the client's N requests** over HTTP/2, not a workflow.
- **Freshness for free.** No snapshot means no staleness and no invalidation logic.

The one case that brings a scheduler back is **scheduled delivery** (e.g, email a PDF every Monday morning). That produces an artifact on a timer, which is a job. A managed cron or a workflow engine can be bolted on for that, in isolation, without touching the live read path. The lesson, which generalizes past this project: *the biggest architectural win was deciding what not to build.*

---

<div class="small muted">Part 4 of 8. Next: <a href="https://computeflux.xyz/en/articles/semantic-layer-caching">Semantic layer: the caching framework</a>.</div>

<style>
.hero { text-align: center; margin: 2rem 0 3rem; }
.hero h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.02; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #8b8bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.35rem); font-weight: 400; max-width: 40rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
.muted { color: var(--theme-foreground-muted); }
</style>
