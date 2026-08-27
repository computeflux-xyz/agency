---
title: A database for report definitions in the Semantic layer
toc: false
---

```js
const cover = FileAttachment("cover.png");
```

<div class="hero">
  <h1>Sematic layer: a database for report definitions</h1>
  <h2>Part 6: the MySQL schema behind the builder (templates, blocks, descriptors, workspaces).</h2>
</div>

Every report system eventually needs a place where *definitions* live: the template someone built last week, the blocks it contains, the workspace scope it renders under. Ours is a small MySQL schema owned entirely by the app server (Go, Gin, GORM). And before any DDL, the one principle that shapes every table: **this database holds configuration only. Never analytical data, never duplicated CRM attributes, never snapshots.** The moment a report definition starts sharing a database with warehouse rows, you've re-created the coupling the whole architecture exists to prevent.

There are three aggregates: the **template** (composition), the **workspace** (scope), and the **custom report** (workspace-scoped composition). Plus one derived table (descriptors) that's a governed mirror of the semantic catalog rather than an authored thing.

## Blocks as rows are the template's aggregate

```sql run=false
CREATE TABLE report_templates (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id       CHAR(26)        NOT NULL,           -- ULID, API id
  name            VARCHAR(255)    NOT NULL,
  visibility      VARCHAR(32)     NOT NULL,           -- internal | external
  cadence         VARCHAR(32)     NOT NULL DEFAULT 'none',
  timeline        VARCHAR(32)     NOT NULL DEFAULT 'last_7d',
  auto_generate   TINYINT(1)      NOT NULL DEFAULT 0,
  output_type     VARCHAR(32)     NOT NULL DEFAULT 'report',
  locked_by       VARCHAR(128)    NULL DEFAULT NULL,  -- optimistic builder lock
  lock_expires_at DATETIME        NULL DEFAULT NULL,
  deleted_at      DATETIME        NULL DEFAULT NULL,  -- soft delete
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_report_templates_public_id (public_id),
  KEY idx_report_templates_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

```sql run=false
CREATE TABLE report_blocks (
  id                        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id                 CHAR(26)        NOT NULL,
  owner_type                VARCHAR(32)     NOT NULL,         -- template | custom_report (polymorphic)
  owner_id                  BIGINT UNSIGNED NOT NULL,         -- no FK (polymorphic); repo enforces existence
  position                  INT             NOT NULL,
  type                      VARCHAR(32)     NOT NULL,
  width                     VARCHAR(16)     NOT NULL DEFAULT 'full',
  data_source_id            VARCHAR(128)    NULL DEFAULT NULL, -- soft ref to a descriptor
  config                    JSON            NOT NULL,
  semantic_manifest_version CHAR(12)        NULL DEFAULT NULL, -- manifest pinned at build (drift)
  created_at                DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_report_blocks_public_id (public_id),
  UNIQUE KEY uq_report_blocks_owner_pos (owner_type, owner_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Three decisions have been taken:

- **Blocks as rows, not one JSON blob.** A template's blocks are queryable, reorderable, individually validatable and individually diffable. The "what changed in this template?" question becomes a `SELECT` instead of a `diff` of a megablob. Flexible *per-block* options live in the `config` JSON column, validated in the app against the block type and its descriptor (structured where structure pays, flexible where the schema is genuinely open).
- **Polymorphic owner.** A block belongs to a template *or* a custom report via `owner_type` + `owner_id`. You can't have a real FK on a polymorphic column, so the repository enforces owner existence at the application level. That's a deliberate trade: the polymorphism buys reuse of the entire block model between templates and custom reports. The cost is one integrity check written in Go instead of DDL.
- **`semantic_manifest_version` pinned at build time.** Every block remembers which manifest it was built against. That one column is the anchor for the entire drift story in part 7.

The `type` enum deserves a confession: it started larger (more chart types, more widths) and got pruned to the three the UI actually renders. A config schema that outruns the renderer is a lie to the builder.

## The governed mirror are the descriptors

The most interesting table is the one nobody authors by hand:

```sql run=false
CREATE TABLE data_source_descriptors (
  id          VARCHAR(128) PRIMARY KEY,  -- 'media.demand_geo'
  label       VARCHAR(255) NOT NULL,
  provider    VARCHAR(64)  NOT NULL,     -- 'media'
  model       VARCHAR(128) NOT NULL,     -- ONE semantic model
  grain       VARCHAR(32),               -- pinned default grain
  metrics     JSON NOT NULL,             -- allow-list
  compatible_blocks JSON NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  manifest_version CHAR(12)              -- drift anchor
);
```

A descriptor is a *curated explore over one model* : the governed surface a block binds to. The semantic manifest is the source of truth. The Go server **derives** this table from `GET /api/v1/catalog` and stamps each row with the manifest version it was validated against. Curated explores come from dbt's `saved_queries` (part 2). The server also auto-derives one all-metrics descriptor per model, so a new model is usable without hand-authoring.

The rule that keeps this sane: **one block = one descriptor = one model.** A block's metrics must be in the descriptor's allow-list, and a block type must be in `compatible_blocks`. The builder validates against the descriptor, so the invalid report is rejected at *save* time, not discovered at view time.

## Scope, with soft CRM references are workspace's aggregates

```sql run=false
CREATE TABLE workspaces (
  id BIGINT PK, public_id CHAR(26) UNIQUE,
  name VARCHAR(255), type ENUM('campaign','pre_sales','brand'),
  advertiser_crm_id VARCHAR(64),      -- soft ref, no FK
  status ENUM('active','archived'),
  data_sources JSON NOT NULL          -- ["media"]
);

CREATE TABLE workspace_campaigns (
  workspace_id   BIGINT NOT NULL,
  crm_campaign_id VARCHAR(64) NOT NULL,   -- NO FK to CRM
  position INT DEFAULT 0,
  PRIMARY KEY (workspace_id, crm_campaign_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE workspace_filters (
  id BIGINT PK, workspace_id BIGINT,
  filter_type ENUM('publisher_exclusion','site_exclusion',
                   'country_exclusion'),
  ref_type ENUM('crm_publisher','crm_site','country_code'),
  ref_id VARCHAR(255), label_snapshot VARCHAR(255)
);
```

Notice what's *not* there: no foreign keys into CRM tables. `crm_campaign_id` and `advertiser_crm_id` are **soft references by ID**, and that's load-bearing. The CRM is a synced, read-only reference catalog owned by another team. If CRM sync lags, or a campaign is deleted, or two get merged. None of that may corrupt report configuration. The API enriches soft refs at read time and returns a degraded DTO with a warning when one doesn't resolve:

| CRM scenario | Behaviour at view time |
|---|---|
| Campaign id won't resolve | Workspace loads with a warning. Affected blocks show a fixable error, the rest render |
| Sync lag | "Campaign data syncing, retry" banner. Last synced data still queries |
| Hard delete / merge | Workspace stays valid (soft ref). Affected blocks degrade until the id resolves |
| Archived | Workspace valid, shows archived status, still queryable if data exists |

Hard FKs *inside* the app's own tables, soft refs *out* to other teams' data. The boundary mirrors the org chart, which is the least fashionable and most durable design principle in this whole series.

## One active assignment, the MySQL way

The join table between workspaces and templates carries a constraint that looks like a typo and isn't:

```sql run=false
CREATE TABLE workspace_templates (
  id BIGINT PK, workspace_id BIGINT, template_id BIGINT,
  assignment_type ENUM('default','manual'),
  removed_at DATETIME NULL,
  is_active TINYINT AS (IF(removed_at IS NULL,1,NULL)) STORED,
  UNIQUE (workspace_id, template_id, is_active)  -- one active
);
```

A `STORED` generated column that is `1` when active and `NULL` when removed. MySQL's `UNIQUE` index ignores `NULL`s, so any number of *removed* rows coexist, but only one *active* assignment per (workspace, template) can exist. This is the kind of trick that makes a reviewer nervous and a DBA nod. It encodes "exactly one active assignment" in the index structure itself, which is strictly better than enforcing it in application code that some future migration will forget to run under.

## Design principles, as a checklist

Because schemas like this get cargo-culted, the principles behind it, all in one place:

- **Config in MySQL.** Report configuration only. Never analytical data, never warehouse rows.
- **CRM by ID.** Store the reference; enrich at read time. Never duplicate CRM attributes.
- **Blocks as rows.** Queryable, reorderable, individually validated and diffed.
- **Flexible config as JSON.** Per-block options in a `config` JSON column, validated in-app against the descriptor.
- **No snapshots.** Reports run live. A transient cache speeds repeats. There is no `report_outputs` table. Nothing to materialize, nothing to store, nothing to go stale.
- **Hard FKs inside, soft refs outside.** Owned relationships get DB integrity. Cross-team references get app-level integrity.

And the one optional table, included only if you want spend visibility: a thin `query_runs` audit log recording `bytes_processed`, duration and *no rows* for each live query. Observability of cost, not a store of results.

The schema is deliberately boring. Boring means the interesting parts of the system (the semantics, the cache, the drift handling) live in the layers where they can be reasoned about, not in a tangle of joins. Part 7 is about the failure mode that boring schema exists to survive: what happens when the metrics themselves change.

---

<div class="small muted">Part 6 of 8. Next: <a href="https://computeflux.xyz/en/blog/semantic-layer-drift-compat">Semantic layer: when your metrics drift</a>.</div>

<style>
.hero { text-align: center; margin: 2rem 0 3rem; }
.hero h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.02; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #8b8bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.35rem); font-weight: 400; max-width: 40rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
th { text-align: left; color: var(--theme-foreground-muted); border-bottom: 2px solid var(--theme-foreground-faintest, #dcd7cb); padding: 0.4rem 0.7rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
td { padding: 0.45rem 0.7rem; border-bottom: 1px solid var(--theme-foreground-faintest, #dcd7cb); vertical-align: top; }
.small { font-size: 0.8rem; }
.muted { color: var(--theme-foreground-muted); }
</style>
