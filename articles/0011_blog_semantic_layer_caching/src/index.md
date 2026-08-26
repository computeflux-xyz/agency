---
title: The caching framework of a semantic layer
toc: false
---

```js
const cover = FileAttachment("cover.png");
```

<div class="hero">
  <h1>Semantic layer: the caching framework</h1>
  <h2>Part 5: single-flight, canonical keys, and why a cached number is still a correct number.</h2>
</div>

A live-query system lives or dies on its cache. If there is no cache, and that every view of a nine-block report means nine warehouse scans, the latency is bad but the bill is worse. If the cache is done naively, you'll quietly reintroduced the thing the whole architecture exists to kill and these are **stale numbers**.

The trick is that a semantic layer makes caching *easy to get right*, because it makes queries deterministic. The same selection compiles to the same SQL every time. The same SQL over the same data is always the same answer. If you can guarantee determinism, a cached result is correct by construction. So the whole design is a campaign to guarantee determinism:

- **The SQL is stable.** MetricFlow compiles a selection to identical SQL and there is no `CURRENT_TIMESTAMP`, no wildcards, nothing non-deterministic. (If the underlying data changed, that's what the TTL is for.)
- **The timeline is pinned.** The metadata server resolves relative presets to absolute dates in the skeleton (part 4), so "last 7 days" is one fixed query within its window.
- **Keys are canonical.** Metrics, group-bys and filters are sorted into a canonical form, so the order a user clicked them in doesn't matter. `order_by` is preserved and it changes row order and not content.

## The query is semantic not raw SQL and this is **key**

The cache is not keyed by SQL but rather by the *semantic* query:

```python
# query_runner.py
def query_key(body: Any, manifest_version: str) -> str:
    """Canonical cache key. Set-like fields are sorted (their order doesn't
    change the result); order_by is preserved (it changes row order)."""
    payload = {
        "metrics": sorted(body.metrics or []),
        "group_by": sorted(body.group_by or []),
        "where": sorted(body.where or []),
        "order_by": list(body.order_by or []),
        "limit": body.limit,
        "manifest_version": manifest_version or "",
    }
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()
```

And the `manifest_version` in the key is the load-bearing line. Remember part 3: the manifest version is the content hash of the semantic manifest. If a dbt change redefines `ctr_pct`, the manifest changes, the hash changes, the key changes: **exactly the affected entries miss and recompute, and nothing else.** There is no invalidation job, no "bust the analytics cache" runbook, no cache stampede.

## N identical queries means one compute

The cache itself is a thread-safe TTL + LRU with single-flight. The interesting part is not the LRU but instead it's the coalescing effect:

```python
# result_cache.py (abridged)
class ResultCache:
    """Thread-safe TTL + LRU cache with single-flight."""

    def get_or_compute(self, key, compute, *, force_refresh=False,
                       compute_timeout=None):
        """Return (value, state) for key, computing it once under single-flight.

        state is one of:
          - "hit"       value was already cached (served immediately)
          - "miss"      this caller ran compute() (the leader)
          - "coalesced" this caller waited for an in-flight identical query and
                        shared its result (single-flight follower)
        """
        waited = False
        wait_timeout = compute_timeout if compute_timeout is not None else 30.0
        while True:
            with self._lock:
                if not force_refresh:
                    value, ok = self._get_fresh_locked(key)
                    if ok:
                        self.hits += 1
                        return value, ("coalesced" if waited else "hit")

                event = self._inflight.get(key)
                if event is None:
                    # Become the leader for this key.
                    event = threading.Event()
                    self._inflight[key] = event
                    self.misses += 1
                    break

            # Follower: wait for the leader, then re-check the cache. If the
            # leader failed (cleared inflight without storing), the loop lets
            # a follower become the new leader.
            if not event.wait(timeout=wait_timeout):
                raise QueryTimeout(...)

            waited = True
            force_refresh = False

        # Leader path: compute outside the lock, under a wall-clock deadline.
        ...
        with self._lock:
            self._store[key] = (time.monotonic() + self._ttl, value)
            self._store.move_to_end(key)
            while len(self._store) > self._max:
                self._store.popitem(last=False)
            self._inflight.pop(key, None)

        event.set()
        return value, "miss"
```

A few decisions here that matter in production:

- **Compute happens outside the lock.** Holding a lock across a warehouse call would serialize the whole server. So the lock only guards the bookkeeping.
- **Three states.** `hit`, `miss`, `coalesced` are reported back to the client in the `x-sl-cache` header, and they mean different things: a coalesced caller did *no* compute, its wall time is waiting, not warehouse work. Lying about that would corrupt every latency metric you'll ever look at.
- **Leaders can fail.** If the leader raises, it clears `_inflight` and signals. A waiting follower re-enters the loop and can become the new leader. Failure of one query doesn't hang everyone waiting on it.
- **Deadlines are everywhere.** A wall-clock bound on the leader's compute (a thread pool enforces it), and a wait-timeout for followers. A stuck warehouse yields a fast 504, not an "ever loading" block. In the UI, a client-side `AbortController` set just above the server timeout is the second layer of the same idea.

## Correctness is primordial: TTL, refresh, and the limits

Caching metrics is easy to get *subtly* wrong, so the correctness story gets spelled out:

- **TTL bounds staleness.** Entries expire after `MF_CACHE_TTL_SECONDS` (default 300s in the PoC). A slowly-changing table cannot serve stale numbers forever. This is the trade: TTL-bounded staleness in exchange for near-zero repeat cost.
- **Explicit refresh.** `POST /api/v1/query?refresh=true` bypasses the cache read and recomputes from the live source, overwriting the entry. That's the "reload" button. Note the subtlety: concurrent refreshes *still coalesce* onto a single recompute. So refresh is a cache-bypass flag and not a stampede permission slip.
- **manifest_version in the key** is already covered, but worth repeating: a metric change busts exactly its own entries.
- **The known next step** is a freshness watermark per source table: immutable history caches hard, only the current period expires fast. The PoC's TTL is a blunt version of that.

There's also a second tier below the semantic cache: the warehouse's own results cache (BigQuery gives you a free one under the hood). And one above it: the browser.

## TanStack Query is the client cache tier

The UI doesn't hand-roll fetch caching but instead, it lets TanStack Query gives request dedup, stale-while-revalidate and background refetch per block:

```ts
useQuery({
  queryKey: ['block', blockId, query, refresh],
  queryFn: () => queryArrow(query),   // POST + decode IPC
  staleTime: 30_000,                  // trust for 30s
  gcTime:    5 * 60_000,
});
```

So there are two caches but one keying philosophy: the same semantic-query hash plus manifest version keys both the server's result cache and the client's query cache. There is no third tier and no Redis which means that the server cache is in-process, and that's a real feature: there is nothing to deploy, nothing to keep in sync, and the cache dies with the process that owns the engine.

## What the numbers look like

The perf headers make the whole thing observable per query, which is how you verify the theory instead of believing it:

```http
HTTP/2 200            POST /api/v1/query
content-type: application/vnd.apache.arrow.stream
x-sl-cache: hit
x-sl-compute-ms: 0
x-sl-manifest-version: a1b2c3d4e5f6
```

The first call loads a nine-block report: up to nine concurrent queries on one connection, mostly misses. The second opens with the same filters: only hits and coalesces happen. Bytes come from memory, not warehouse scans. On real BigQuery the same path would also report `bytes_processed`, which turns the cache hit-rate into a cost curve you can actually watch. That's the satisfying part of this whole design: **the cache is not a performance hack bolted onto the system, it's a direct consequence of the semantic layer's determinism.** You don't have to trust it but you can measure it, per query, in headers.

---

<div class="small muted">Part 5 of 8. Next: <a href="https://computeflux.xyz/en/articles/semantic-layer-config-model">Sematic layer: a database for report definitions</a>.</div>

<style>
.hero { text-align: center; margin: 2rem 0 3rem; }
.hero h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.02; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #8b8bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.35rem); font-weight: 400; max-width: 40rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
.muted { color: var(--theme-foreground-muted); }
</style>
