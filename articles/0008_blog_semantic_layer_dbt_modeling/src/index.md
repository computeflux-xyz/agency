---
title: Metrics are contracts, not columns
toc: false
---

```js
const cover = FileAttachment("cover.png");
```

<div class="hero">
  <h1>Metrics are contracts,<br>not columns</h1>
  <h2>Part 2: the dbt + MetricFlow stack, from raw warehouse tables to governed metric definitions.</h2>
</div>

The analytics team's side of the [contract from part 1](https://computeflux.xyz/en/articles/semantic-layer-team-topology) is a dbt project. It owns everything from the warehouse table names up to the definition of "CTR". The app team only ever sees the top layer (metric names and dimension names) which is exactly the point: **the physical schema becomes an implementation detail of a YAML file.**

In the PoC the warehouse holds four pre-aggregated tables that carry the models reports actually query: an hourly demand table (`demand_monitoring_lite`), its supply-side mirror (`supply_monitoring_lite`), a daily delivery-quality table, and a daily deal-pacing table. Grain matters here: one row per *(date, hour) × every dimension* on the hourly tables, so a campaign-week scans megabytes, not terabytes. Raw event tables (impression-level logs, the bid funnel) are seeded and staged but deliberately not surfaced yet (more on that at the end).

The dbt project turns those into five layers, each with one job:

```text
raw        warehouse tables            (the emulator stands in for BigQuery)
staging    views, 1:1 clean
marts      fact tables                 fct_demand_hourly, fct_supply_hourly, ...
semantic   MetricFlow models           media_demand, media_supply, ...
metrics    governed definitions        ctr_pct, vcr_pct, ecpm, margin_pct, ...
```

Every layer exists because the layer below it is allowed to change without breaking the layer above. Let's walk them.

## Layer 1: sources, the only place the warehouse is named

```yaml
# sources.yml is the single point where warehouse tables are named.
# Locally these are emulator tables a traffic generator writes. In
# production they map to the real warehouse project/dataset.
sources:
  - name: warehouse
    database: "{{ env_var('BQ_PROJECT', 'local-warehouse') }}"
    schema:   "{{ env_var('BQ_DATASET', 'warehouse') }}"
    tables:
      - name: demand_monitoring_lite
      - name: supply_monitoring_lite
      - name: delivery_quality
      - name: pacing_monitoring
      - name: adserver_logs
      - name: delivery_logs
```

This is a boring file. That's its whole virtue: when the warehouse moves, exactly one file changes. Every downstream model says `source('warehouse', 'demand_monitoring_lite')` and never sees a project id again.

## Layer 2: staging, a 1:1 clean view

```sql
-- staging/stg_demand_hourly.sql
select
    event_time, date, hour,
    campaign_id, line_item_id, io_id, deal_id,
    placement_id, publisher_id, ssp_id, ssp_name,
    site_domain, site_cat, advertiser_domain,
    geo_country, geo_region, device_type, device_os, device_browser,
    format_type, inventory_type, environment_type,
    publisher_integration_type, buy_model, sell_model, currency,
    bid_requests, bid_responses, publisher_bid_wins,
    impressions, impression_exposures, impression_visibilities,
    clicks, video_starts, video_q1s, video_q2s, video_q3s, video_completes,
    demand_revenue, supply_expense
from {{ source('warehouse', 'demand_monitoring_lite') }}
```

Staging is where you make peace with the warehouse's naming sins without fixing them yet (a rename in staging costs nothing and touches nothing).

## Layer 3: marts, the conformed facts

```sql
-- marts/fct_demand_hourly.sql
select * from {{ ref('stg_demand_hourly') }}
```

Ours is a `select *`, because the PoC's staging is already clean. Don't be fooled by the triviality (the mart layer is where a real system does the conforming like deduplication, currency conversion, identity resolution, the slow-changing dimensions). The semantic models sit on marts precisely so that ugliness can live there without leaking into metric definitions.

## Layer 4: the semantic model, this *is* the schema

Now this is the interesting part. A MetricFlow semantic model maps a mart table onto entities, dimensions and measures:

```yaml
# semantic/media_demand.yml
semantic_models:
  - name: media_demand
    description: Hourly demand-side delivery. Campaign / IO / line-item / SSP / deal identity.
    model: ref('fct_demand_hourly')
    primary_entity: demand_grain
    defaults:
      agg_time_dimension: event_time
    entities:
      - { name: campaign, type: foreign, expr: campaign_id }
      - { name: line_item, type: foreign, expr: line_item_id }
      - { name: io, type: foreign, expr: io_id }
      - { name: placement, type: foreign, expr: placement_id }
      - { name: publisher, type: foreign, expr: publisher_id }
      - { name: deal, type: foreign, expr: deal_id }
    dimensions:
      - name: event_time
        type: time
        label: Event time
        type_params: { time_granularity: hour }
      - { name: geo_country, type: categorical, label: Country }
      - { name: device_type, type: categorical, label: Device type }
      - { name: format_type, type: categorical, label: Format }
      - { name: site_domain, type: categorical, label: Site domain }
      # ... more dimensions
    measures:
      - { name: impressions, agg: sum, create_metric: true, label: Impressions }
      - { name: clicks, agg: sum, create_metric: true, label: Clicks }
      - { name: demand_revenue, agg: sum, create_metric: true, label: Demand revenue }
      - { name: cost, agg: sum, expr: supply_expense, create_metric: true, label: Cost }
      - { name: video_starts, agg: sum, create_metric: true, label: Video starts }
      - { name: video_completes, agg: sum, create_metric: true, label: Video completes }
      # ... more measures
```

Read it top to bottom and you have the whole contract with the app:

- The **primary entity** (`demand_grain`) sets the grain (aka, what one row *means*).
- **Dimensions** are the cuts (`geo_country`, `device_type`, ...). They become *qualified names* in the API: `demand_grain__geo_country`.
- **Measures** are the raw sums metrics build on. Note that `cost` (the physical column is `supply_expense`) is the semantic name that the app sees. **Zero SQL leaks past this file.**
- **Foreign entities** (`campaign`, `deal`, ...) are joinable keys, used by filters like "only this campaign".

There are four of these models (demand, supply, delivery quality, pacing), each with its own primary entity (`demand_grain`, `supply_grain`, `delivery_quality_grain`, `pacing_grain`). Different grain, different identity, which is why the rule from part 1 exists: **one report block binds to one model, and we never join across models.** Joining demand to supply in SQL produces numbers that look plausible and are wrong. Side-by-side blocks produce numbers that are correct and visibly different.

## Layer 5: metrics, the governed maths

```yaml
# semantic/media_demand.yml (continued)
metrics:
  - name: ctr_pct
    label: CTR %
    description: Click-through rate.
    type: ratio
    type_params: { numerator: clicks, denominator: impressions }

  - name: vcr_pct
    label: VCR %
    description: Video completion rate.
    type: ratio
    type_params: { numerator: video_completes, denominator: video_starts }

  - name: viewability_pct
    label: Viewability %
    type: ratio
    type_params: { numerator: impression_visibilities, denominator: impressions }

  - name: ecpm
    label: eCPM
    description: Effective CPM — revenue per thousand impressions.
    type: derived
    type_params:
      expr: demand_revenue / impressions * 1000
      metrics:
        - name: demand_revenue
        - name: impressions

  - name: margin
    label: Margin
    description: Gross margin — demand revenue net of supply cost.
    type: derived
    type_params:
      expr: demand_revenue - cost
      metrics:
        - name: demand_revenue
        - name: cost
```

This is the "define once, use everywhere" layer, and it deserves a paragraph of respect. A metric is a **contract**, not a column. Every report that asks for `ctr_pct` gets the same maths because there is exactly one place where that maths exists. When the business decides CTR is `clicks / impressions_exposed` instead of `clicks / impressions`, the change is a versioned PR that redefines the metric **once**, and every report picks up the new definition. When they *don't* want that (and part 7 is entirely about this) you create a new metric and deprecate the old one.

And the money line: **"exclude publisher X" is a filter parameter, never a hand-edited SQL export.** The metric definition never changes so a `where` clause does:

```text
where:
  - "{{ Dimension('demand_grain__geo_country') }} NOT IN ('US')"
```

## Curated explores: saved queries as governed surfaces

We also define `saved_queries` that are curated explores that pin a metric allow-list and a default grain. The catalog serves them, and the app server turns each into a descriptor (the thing a report block binds to):

```yaml
# semantic/explores.yml
saved_queries:
  - name: media_demand_geo
    label: Demand by geo
    description: Demand delivery + economics, broken down by country.
    query_params:
      metrics:
        - impressions
        - clicks
        - ctr_pct
        - demand_revenue
        - cost
        - margin
        - margin_pct
        - ecpm
        - fill_rate_pct
        - viewability_pct
        - vcr_pct
      group_by:
        - "Dimension('demand_grain__geo_country')"
```

The app server also auto-derives one "all-metrics" explore per model from the catalog, so a new model becomes usable without hand-authoring a thing. Curated explores are for opinionated defaults: *this* grain, *these* metrics, for *this* audience.

## Cost is a first-class design force

Let's have one paragraph for the bean-counters, because it shapes the model stack. Warehouse engines bill by **bytes scanned** (BigQuery is a perfect example), and the semantic layer is where you govern that centrally:

- **Default to aggregates.** Reports hit the `*_monitoring_lite` tables, which is orders of magnitude smaller than raw events.
- **Partition by date.** Marts partition on `date`, so a timeline window prunes everything else.
- **Cluster by filters.** Cluster on high-cardinality dims (`campaign_id`, `placement_id`, `geo_country`).
- **Max bytes billed.** Every compiled query carries a `maximum_bytes_billed` ceiling so a query that would scan half the warehouse dies instead.
- **Cache.** The semantic server's result cache (part 5), plus the warehouse's own results cache underneath.
- **Aggregate awareness.** Route to a coarser rollup when the requested grain allows it.

The raw event tables are staged in the PoC but not surfaced. In production they become **opt-in models on the same API, marked *expensive*** which the builder warns, a date filter becomes mandatory, and the bytes ceiling applies. You don't forbid drill-downs but you just make their price visible at build time instead of at the end of the month.

## What the app sees

Nothing in this article is visible to the app team except the last two layers. The app queries `GET /api/v1/metrics` and sees names, labels and queryable dimensions. That's the payoff of the whole exercise: **the physical schema aka, tables, columns, joins, aggregation SQL is an implementation detail of a YAML file owned by the people who understand the maths.** The app team then builds reports but they never build SQL. Next part: the API that makes that separation mechanical.

---

<div class="small muted">Part 2 of 8. Next: <a href="https://computeflux.xyz/en/articles/semantic-layer-api-contract">The boundary API: three endpoints, zero hand-written SQL</a>.</div>

<style>
.hero { text-align: center; margin: 2rem 0 3rem; }
.hero h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.02; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #8b8bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.35rem); font-weight: 400; max-width: 40rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
.muted { color: var(--theme-foreground-muted); }
</style>
