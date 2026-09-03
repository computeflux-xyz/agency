---
title: When your semantic layer metrics drift
toc: false
---

```js
const cover = FileAttachment("cover.png");
```

<div class="hero">
  <h1>When your<br>semantic layer metrics drift</h1>
  <h2>Part 7: treating a semantic ref like a public API (aliases, degradation, and failing the PR instead of production).</h2>
</div>

Here's the failure mode this whole series has been walking toward. A report built last month references `exposure_rate_pct`. The analytics team, doing good work, renames it to `viewable_rate_pct` because the old name was misleading. The dbt PR merges, the manifest refreshes, and every saved report that references the old name now points at nothing.

Every system with a semantic layer meets this wall, and how you handle it is the difference between a semantic layer people *trust* and one people route around. Our stance, stated once and enforced everywhere: **a semantic ref is a public API.** Once a metric or dimension ships, it is consumed by things you didn't write. It gets treated accordingly.

## The compatibility table

Every possible change to a ref falls into one of four boxes, and each box gets a different mechanism:

| Change in the semantic layer | Verdict | Handling |
|---|---|---|
| Add a metric / dimension | safe | Additive. Existing reports untouched. |
| Rename a ref | alias | Old name kept as an alias. The resolver rewrites old -> canonical at query time. |
| Redefine the maths behind a ref | never silent | Create a *new* metric, deprecate the old (`replaced_by`, `sunset_at`). |
| Delete a ref | breaking | Per-block degradation + a CI gate that catches affected reports first. |
| Change type / grain | breaking | New object or migration. CI gate must pass first. |

The one rule underneath all of them, the thing you write on a wall: **never change the meaning behind an existing ref silently.** Rename via an alias. Redefine via a new object. A report that keeps its ref but quietly returns different numbers is the worst failure mode: not a crash, just wrong numbers in a client's inbox. That's worse than a crash. Crashes get fixed.

## Renames: the alias map

A rename is a *declared* event. It lives in the dbt project, rides the same refresh loop as the manifest, and makes the rename a non-event:

```yaml
# semantic_aliases.yml : old (renamed) -> new (current)
aliases:
  exposure_rate_pct: viewable_rate_pct
```

The alias map flows through three hops, and each hop is cheap:

1. The dbt-runner POSTs it to `/admin/aliases`. The semantic server serves it in `/api/v1/catalog` under `aliases`.
2. The Go server holds a synced copy of the catalog and rewrites old -> new **at skeleton time** : a stored block that still references the pre-rename name resolves against the live manifest:

```go
// scope.go rewrite renamed refs (old -> new) so a saved report
// that still references the pre-rename name keeps working.
func aliasAll(aliases map[string]string, names []string) []string {
	out := make([]string, len(names))
	for i, n := range names {
		out[i] = aliasRef(aliases, n)
	}

	return out
}

// aliasAllOrdered rewrites order-by tokens, preserving a leading "-" (desc).
func aliasAllOrdered(aliases map[string]string, tokens []string) []string {
	out := make([]string, len(tokens))
	for i, t := range tokens {
		if strings.HasPrefix(t, "-") {
			out[i] = "-" + aliasRef(aliases, t[1:])
		} else {
			out[i] = aliasRef(aliases, t)
		}
	}

	return out
}
```

3. The drift check treats an aliased ref as *reconciled*, not broken so the CI gate passes.

An alias is not immortality. It's a bridge: saved reports keep working while they're gradually edited to the new name, and the alias is retired when nothing references it anymore. The catalog keeps the map visible, so "what renames are outstanding?" is a GET, not archaeology.

## Deletes: fail the PR, not production

For actual breaking changes, the safety net is prevention. Two pieces: an index of what every block references, and a gate that consults it.

```sql run=false
-- refs extracted from each block on save
CREATE TABLE block_refs (
  block_id BIGINT NOT NULL,
  ref      VARCHAR(128) NOT NULL,
  ref_kind ENUM('metric','dimension','filter'),
  PRIMARY KEY (block_id, ref)
);

-- which active reports use a changed ref?
SELECT t.name, t.public_id
FROM block_refs br
JOIN report_blocks b ON b.id = br.block_id
JOIN report_templates t ON t.id = b.owner_id
WHERE br.ref IN (:changed_refs);
```

The gate runs on every dbt change:

1. dbt compiles a new `semantic_manifest.json`. The runner posts it.
2. The Go server diffs the live catalog against its registry (removed refs, renamed refs).
3. A drift endpoint joins `block_refs` to find impacted reports, and which of them an alias reconciles.
4. A hard break with no alias makes the drift check exit nonzero —> **the build fails.**

The PoC drives the whole narrative with one command, `drift-demo`: rename a live metric, watch the gate report a hard break, declare the alias, watch it reconcile, then prove the skeleton rewrites the block's refs and the query returns data, then reset. Demoing your failure modes end to end is the cheapest confidence money can buy. It's also the only way to be sure the safety belt is actually attached to the pants.

## Degradation: when it breaks anyway

Prevention can't be total: a ref can die in a way CI didn't see, or a report built outside the governed path. So the system still has to degrade gracefully, and the design from part 4 pays off here: **blocks fail alone.** A block whose ref is gone gets flagged in the skeleton with an error; the UI renders a fixable card for that block; the other blocks query as normal.

There's no report-level envelope to fail, because there's no report-level response. One dead metric is one card, not one broken page and part 7's final table is the reconciliation of the two halves:

| Layer | Job |
|---|---|
| Manifest version | Detect the drift —> every block pins the version it was built against |
| Alias map | Reconcile renames at query time |
| CI impact analysis | Prevent breaking changes from merging |
| Per-block degradation | Survive what slips through, loudly |

## The open questions

The PoC made its calls. Some are genuinely open, and it's honest to list them rather than pretend:

- **Build vs buy.** Self-hosting MetricFlow was right for the PoC. The `/query` contract is ours either way. If ops cost bites, the managed equivalent slots in *behind* the contract. The decision is deliberately reversible.
- **The CRM contract.** The PoC stubs the CRM as a reference catalog. The exact ID types and names for campaigns, advertisers, publishers and sites still need pinning for production. And the soft-ref discipline from part 6 means that pinning can happen late, cheaply.
- **Large results.** Each block carries a `limit`. Server-side pagination and a max-bytes ceiling are the production levers.
- **MCP reach.** The semantic layer speaks MCP today. Should the app server too, so an assistant can drive workspaces and reports, not just metrics? That's a product question wearing a protocol costume.
- **Freshness watermark.** The TTL cache (part 5) is blunt. A per-table watermark would let immutable history cache hard and only the current period expire fast.

What's *not* open: the boundary, the live read path, the cache's correctness story, and the drift discipline. Those shipped in the PoC and survived the demos designed to break them. Which is the whole point of building the thing in the first place.

---

<div class="small muted">Part 7 of 8. Next: <a href="https://computeflux.xyz/en/articles/semantic-layer-laptop-warehouse">A warehouse in a shoebox</a>.</div>

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
