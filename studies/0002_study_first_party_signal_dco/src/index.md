---
title: "Edge e-commerce: First-party signals, without a tracker"
toc: false
---

```js
import {fmtInt, fmtPct, ladder, banditRace, shrinkage} from "./components/signal.js";
const signals = await FileAttachment("data/signals.csv").csv({typed: true});
const slots = await FileAttachment("data/slots.csv").csv({typed: true});
const cookie = await FileAttachment("data/cookie.csv").csv({typed: true});
const cover = FileAttachment("cover.svg");
```

<div class="hero">
  <h1>Edge e-commerce: First-party signal,<br>without a tracker</h1>
  <h2>Part 3 of 3. What an edge storefront already knows about its own traffic, and how to turn it into a newsletter that assembles itself.</h2>
</div>

<div class="client-strip">
  <div class="field"><span class="k">Sector</span><span class="v">Luxury spirits, direct to consumer</span></div>
  <div class="field"><span class="k">Market</span><span class="v">Central Africa (DRC)</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">Storefront · Back-office · Courier app · API</span></div>
  <div class="field"><span class="k">This part</span><span class="v">The first-party data layer</span></div>
</div>

[Part 1](https://computeflux.xyz/en/studies/mobile-money-payment-processor) built a payment processor for a market with no cards.
[Part 2](https://computeflux.xyz/en/studies/edge-serving-layer) turned the catalogue into a versioned artifact published to the edge.

Between them, they created something most e-commerce platforms never achieve: **a first-party data infrastructure that's actually under the operator's control.**

## Three preconditions that make this possible

**The operator runs its own origin server.** The storefront isn't a static export behind someone else's CDN. It's a server-side rendered application executing at a point of presence, on the operator's own domain. Every request reaches code the operator wrote. The storefront is an Astro application deployed as an edge worker.

**Every request already carries metadata that costs nothing to collect.** The edge terminates TLS, resolves the network the request arrived on, knows which point of presence served it, and measured the round-trip time doing so. None of this requires a script on the page, a consent banner, or a vendor. It's just how HTTP works when you control the server.

**The catalogue is a published, content-hashed snapshot.** Any other system that wants to know what the shop was showing, at what price, on a given day, can read the exact same keys the shop read, and can be certain it's not looking at a divergent copy. This is the publish mechanism from Part 2, now serving double duty.

Most retailers buy a tag manager, a customer data platform, and an email tool, then spend a year reconciling three views of the same customer. This platform has one view, because it never made a second one.

## The cookie is a pointer, not a payload

We set a single cookie from the origin: opaque, HttpOnly, SameSite=Lax, scoped to the apex domain, holding a sortable identifier and nothing else. Every fact about the visitor lives server-side, keyed by it, in the same edge key-value store the sessions already use (Cloudflare KV).

That combination does more work than it looks:

- **HttpOnly means page scripts cannot read it**, which removes the entire class of leaks where a third-party script on the page exfiltrates the identifier. It also means it's not a JavaScript-set cookie, so the aggressive lifetime caps browsers apply to those don't apply.

- **Opaque means it carries no information.** There's nothing to decode, so the cookie cannot be replayed into a profile by anyone who intercepts it.

- **Server-side storage means erasure is a delete.** A right-to-be-forgotten request removes one record. Compare with a design where the visitor's history is smeared across a vendor's warehouse.

```js
Inputs.table(cookie, {
  columns: ["property", "third_party_pixel", "js_first_party", "server_first_party"],
  header: {
    property: "",
    third_party_pixel: "Third-party pixel",
    js_first_party: "First-party, set in JS",
    server_first_party: "First-party, set by the origin"
  },
  rows: 8
})
```

## Fingerprinting, deliberately done for privacy

"Server fingerprinting" usually means the hostile version: squeeze every bit of entropy out of a device until you can single a person out. That's fragile, it breaks on every browser release, and in a market where households share handsets, it's also ethically wrong.

We invert the objective. The fingerprint's job isn't to identify a visitor. It's to place a request into a **cohort**: a network-and-device class large enough to be anonymous and coherent enough to be predictive. Where classic fingerprinting maximises entropy, we deliberately spend as little of it as the privacy guard allows.

The signals are the ones the edge already has. No probe, no canvas, no font enumeration, no script.

```js
Inputs.table(signals, {
  columns: ["name_en", "bits", "source", "note_en"],
  header: {name_en: "Signal", bits: "Entropy (bits, assumed)", source: "Where it comes from", note_en: "Note"},
  width: {note_en: 320},
  rows: 9
})
```

The bit values above are assumptions, not measurements. They are what makes the ladder below computable. In production, the guard is a counted population, not an estimate: a cardinality sketch per bucket over a trailing window, which costs a few kilobytes and answers the only question that matters: *is this cohort large enough?*

### The k-anonymity ladder

A cohort is emitted only if its bucket holds at least **k** members. If it doesn't, the resolver drops the most specific signal and asks again, walking down a fixed ladder until a bucket is large enough. A visitor on an unusual network with an unusual device doesn't get a uniquely identifying cohort. They get "this country, this device class," and the system is content with that.

```js
const audience = view(Inputs.range([1000, 2000000], {value: 120000, step: 1000, label: "Distinct visitors in the window"}));
const k = view(Inputs.range([5, 2000], {value: 200, step: 5, label: "Minimum cohort size (k)"}));
const enabled = view(Inputs.checkbox(signals.map((s) => s.id), {
  value: signals.map((s) => s.id),
  label: "Signals collected",
  format: (id) => signals.find((s) => s.id === id).name_en
}));
```

```js
// Kept in its own block on purpose: a `view()` value only re-triggers cells
// *other* than the one that declared it, so anything derived from a slider has
// to live in a separate block or it freezes at its initial value.
const RUNGS = [
  {id: "full",     label: "Every signal",                     uses: signals.map((s) => s.id)},
  {id: "stable",   label: "Drop latency and TLS",             uses: ["country", "carrier", "pop", "device_class", "language", "protocol", "ua_platform"]},
  {id: "coarse",   label: "Drop platform hint and protocol",  uses: ["country", "carrier", "pop", "device_class", "language"]},
  {id: "network",  label: "Country, carrier, device",         uses: ["country", "carrier", "device_class"]},
  {id: "geo",      label: "Country and device",               uses: ["country", "device_class"]},
  {id: "country",  label: "Country only",                     uses: ["country"]}
];
const lad = ladder({signals, enabled, rungs: RUNGS, audience, k});
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Rung selected</h2><span class="big" style="font-size:1.35rem">${lad.selected.label}</span><span class="muted">${lad.selected.used.length} of ${enabled.length} collected signals used</span></div>
  <div class="card"><h2>Expected cohort size</h2><span class="big" style="color:${lad.selected.passes ? "#2f8f5b" : "#b0501a"}">${fmtInt(lad.selected.population)}</span><span class="muted">${lad.selected.passes ? `clears k = ${fmtInt(k)}` : `below k = ${fmtInt(k)} even at the floor`}</span></div>
  <div class="card"><h2>Distinct cohorts</h2><span class="big">${fmtInt(Math.min(lad.selected.buckets, audience / Math.max(1, lad.selected.population)))}</span><span class="muted">at the selected rung</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 210,
  marginRight: 72,
  x: {label: "Expected members per cohort →", type: "log", grid: true},
  y: {label: null, domain: lad.rows.map((r) => r.label)},
  marks: [
    // A log scale has no zero, so the bars get an explicit baseline. A rung
    // finer than one member per bucket is clamped to a visible stub and
    // labelled "<1", which is exactly what it means: that rung singles people
    // out.
    Plot.barX(lad.rows, {
      y: "label",
      x1: 0.5,
      x2: (d) => Math.max(d.population, 0.6),
      fill: (d) => d.id === lad.selected.id ? "#2f6bff" : (d.passes ? "#9bb6e8" : "#d8b48a"),
      fillOpacity: (d) => d.id === lad.selected.id ? 1 : 0.55
    }),
    Plot.ruleX([k], {stroke: "#b0501a", strokeWidth: 2, strokeDasharray: "4,4"}),
    Plot.text([{label: lad.rows[0].label, x: k}], {x: "x", y: "label", text: [`k = ${fmtInt(k)}`], dy: -22, dx: 4, textAnchor: "start", fill: "#b0501a", fontWeight: 700}),
    Plot.text(lad.rows, {y: "label", x: (d) => Math.max(d.population, 0.6), text: (d) => d.population < 1 ? "<1" : fmtInt(d.population), dx: 6, textAnchor: "start"}),
    Plot.ruleX([0.5])
  ]
}))
```

Move `k` and watch the selected rung slide down the ladder. This is the whole privacy posture expressed as one number an operator can be asked to defend in a meeting: *no cohort we act on is smaller than k*. It's enforceable, testable, and it doesn't depend on anybody's good intentions.

Second use of the same mechanism: a scraper or a bot lands in a cohort whose behaviour looks nothing like a buyer's: arrival pattern, variant mix, session shape. Separating them costs no CAPTCHA and no challenge page, because the classification is a property of the cohort, not a test imposed on the visitor.

## The event spine

One compact event per request, emitted by the edge worker into a queue. A consumer batches them and lands them in object storage as Parquet, partitioned by day and point of presence. Analysis runs as an embedded query engine reading those files directly: no warehouse, no cluster, no second copy.

<svg class="schematic" viewBox="0 0 1000 260" role="img" aria-label="Event spine from edge to segments">
  <defs>
    <marker id="s1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="ui-monospace, Menlo, monospace" font-size="12.5" fill="currentColor">
    <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55">
      <rect x="8" y="94" width="150" height="66" rx="9"/>
      <rect x="218" y="94" width="140" height="66" rx="9"/>
      <rect x="418" y="94" width="164" height="66" rx="9"/>
      <rect x="642" y="94" width="150" height="66" rx="9"/>
      <rect x="852" y="94" width="140" height="66" rx="9"/>
    </g>
    <g text-anchor="middle">
      <text x="83" y="122">edge worker</text><text x="83" y="142" opacity="0.7" font-size="11">cohort + cookie</text>
      <text x="288" y="122">queue</text><text x="288" y="142" opacity="0.7" font-size="11">batched</text>
      <text x="500" y="122">object storage</text><text x="500" y="142" opacity="0.7" font-size="11">Parquet, day / PoP</text>
      <text x="717" y="122">query engine</text><text x="717" y="142" opacity="0.7" font-size="11">reads files in place</text>
      <text x="922" y="122">segments</text><text x="922" y="142" opacity="0.7" font-size="11">published, hashed</text>
    </g>
    <g stroke="currentColor" stroke-width="1.6" fill="none" marker-end="url(#s1)">
      <path d="M158 127 H213"/><path d="M358 127 H413"/>
      <path d="M582 127 H637"/><path d="M792 127 H847"/>
    </g>
    <path d="M922 94 C 922 34, 83 34, 83 90" fill="none" stroke="currentColor"
          stroke-width="1.4" stroke-dasharray="6 5" marker-end="url(#s1)" opacity="0.7"/>
    <text x="500" y="24" text-anchor="middle" font-size="11" opacity="0.7">segments are read back at the edge exactly like the catalogue is</text>
    <text x="500" y="216" text-anchor="middle" font-size="11.5" opacity="0.75">the loop closes on the operator's own infrastructure · no vendor sits on any edge of this diagram</text>
  </g>
</svg>

The last box is the part worth arguing about. An audience segment is **published, not mutated**, the same discipline as the catalogue in Part 2: build it, hash it, version it, write it, keep the history. That buys three things a mutable segment store never gives you:

- A campaign can name the exact segment version it targeted
- A bad segment can be rolled back rather than repaired
- A diff between two versions is a real artifact somebody can review before it goes out

## The newsletter is a template with holes in it

Dynamic creative optimization is an advertising term, and in advertising it usually means a lot of machinery for very little. In email, for a catalogue that turns over, it's closer to obvious.

The newsletter isn't a document. It's a layout with slots, and each slot is resolved per recipient at render time by a policy that learns.

```js
Inputs.table(slots, {
  columns: ["slot", "candidates", "decided_by", "constraint_en"],
  header: {slot: "Slot", candidates: "Candidates", decided_by: "Filled by", constraint_en: "Hard constraint"},
  width: {constraint_en: 320},
  rows: 6
})
```

### The detail that makes it safe

The renderer reads candidates **from the published catalogue snapshot**: the same keys the storefront reads, at a pinned version.

That single decision removes the failure mode that makes personalised email embarrassing:

- An email cannot show a product the shop doesn't have, because both are reading the same artifact
- It cannot show last month's price, because the version is pinned and recorded
- When a recipient clicks, the page they land on is guaranteed to be the page the email described

Stock is the exception that proves the rule: inventory isn't in the published snapshot, it's live. So the renderer masks any candidate that's out of stock at render time.

### Why a bandit and not an A/B test

An A/B test needs a fixed set of variants, a fixed population, and enough time to reach significance. A catalogue of spirits satisfies none of those: products arrive, sell out, and leave. A monthly newsletter to a list of moderate size doesn't accumulate observations quickly. By the time a test concludes, the thing it tested is gone.

A bandit doesn't need to conclude. It reallocates continuously, and it survives candidates appearing and disappearing mid-flight.

```js
// Rates are ranged in whole percent. Inputs.range pairs its slider with a real
// <input type=number>, so a `format` returning "3.0%" leaves that box blank.
const arms = view(Inputs.range([2, 12], {value: 6, step: 1, label: "Creative candidates in the slot"}));
const baseRatePct = view(Inputs.range([0.5, 12], {value: 3, step: 0.5, label: "Median candidate click rate (%)"}));
const spreadPct = view(Inputs.range([5, 120], {value: 60, step: 5, label: "Spread, best to worst (%)"}));
const sends = view(Inputs.range([500, 100000], {value: 8000, step: 500, label: "Recipients per campaign"}));
const campaigns = view(Inputs.range([2, 40], {value: 12, step: 1, label: "Campaigns"}));
```

```js
const race = banditRace({
  arms,
  baseRate: baseRatePct / 100,
  spread: spreadPct / 100,
  sends,
  campaigns,
  seed: 20260802
});
const tidy = race.series.flatMap((d) => [
  {campaign: d.campaign, regret: d.bandit, policy: "Contextual bandit"},
  {campaign: d.campaign, regret: d.even, policy: "Even split"}
]);
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Clicks, bandit</h2><span class="big">${fmtInt(race.banditClicks)}</span></div>
  <div class="card"><h2>Clicks, even split</h2><span class="big">${fmtInt(race.evenClicks)}</span></div>
  <div class="card"><h2>Difference</h2><span class="big" style="color:${race.lift >= 0 ? "#2f8f5b" : "#b0501a"}">${race.lift >= 0 ? "+" : ""}${fmtPct(race.lift, 1)}</span><span class="muted">over ${campaigns} campaigns</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 320,
  marginLeft: 66,
  x: {label: "Campaign →", grid: true, tickFormat: "d"},
  y: {label: "↑ Cumulative regret (clicks not earned)", grid: true, zero: true},
  color: {legend: true, domain: ["Contextual bandit", "Even split"]},
  marks: [
    Plot.lineY(tidy, {x: "campaign", y: "regret", stroke: "policy", strokeWidth: 2}),
    Plot.tip(tidy, Plot.pointerX({x: "campaign", y: "regret", stroke: "policy", title: (d) => `${d.policy}\ncampaign ${d.campaign}\n${fmtInt(d.regret)} clicks foregone`}))
  ]
}))
```

The even-split line is straight, because a policy that never learns pays the same price forever. The bandit line bends: it pays to explore early, then stops paying.

Push the recipient count down or the spread down and the two lines converge, which is the honest result. **A bandit isn't free cleverness; it's worth deploying when candidates genuinely differ and there's enough volume to notice.** The chart is here so that judgement can be made before the build, not after.

### Cold start, solved by the catalogue's own shape

A product added this morning has no history, and a ranker that trusts only observed clicks will either never show it or over-promote it on three lucky opens.

We borrow a prior from the producer, which borrows from the category, which borrows from the catalogue. It's the same hierarchical fallback as the k-anonymity ladder, applied to a different problem. One mechanism, two uses, which is usually the sign the mechanism is right.

```js
const brandRatePct = view(Inputs.range([0.5, 12], {value: 3.0, step: 0.1, label: "Producer's established click rate (%)"}));
const skuTrueRatePct = view(Inputs.range([0.5, 12], {value: 5.5, step: 0.1, label: "New product's true click rate (%)"}));
const maxSends = view(Inputs.range([200, 20000], {value: 4000, step: 100, label: "Sends observed"}));
```

```js
const brandRate = brandRatePct / 100;
const skuTrueRate = skuTrueRatePct / 100;
const curves = shrinkage({brandRate, skuTrueRate, maxSends, strengths: [50, 250, 1500], seed: 4711});
```

```js
resize((width) => Plot.plot({
  width,
  height: 330,
  marginLeft: 66,
  marginRight: 24,
  x: {label: "Sends observed for the new product →", grid: true},
  y: {label: "↑ Estimated click rate", grid: true, tickFormat: "%"},
  color: {legend: true},
  marks: [
    Plot.ruleY([skuTrueRate], {stroke: "#2f8f5b", strokeDasharray: "5,4"}),
    Plot.text([{x: maxSends, y: skuTrueRate}], {x: "x", y: "y", text: ["true rate"], dy: -8, textAnchor: "end", fill: "#2f8f5b", fontWeight: 700}),
    Plot.ruleY([brandRate], {stroke: "#b0501a", strokeDasharray: "5,4"}),
    Plot.text([{x: maxSends, y: brandRate}], {x: "x", y: "y", text: ["producer prior"], dy: 14, textAnchor: "end", fill: "#b0501a", fontWeight: 700}),
    Plot.lineY(curves, {x: "n", y: "rate", stroke: "series", strokeWidth: 1.8}),
    Plot.tip(curves, Plot.pointerX({x: "n", y: "rate", stroke: "series", title: (d) => `${d.series}\n${fmtInt(d.n)} sends · ${fmtPct(d.rate)}`}))
  ]
}))
```

The "own clicks only" line is the naive estimator, and at low volume it's violent: it will happily claim a 20% click rate off four clicks. The pooled lines start at the producer's rate and converge on the truth at a speed the prior strength controls.

A strong prior is slow to be convinced and never embarrassing; a weak one is quick and occasionally silly. That's a business decision, not a modelling one, and it should be set by whoever owns the brand.

### Send time optimisation

The same posterior machinery, twenty-four arms, one per local hour, held per cohort rather than per recipient. A cohort has enough observations to learn an hour; an individual doesn't. This is where the k-anonymity guard pays for itself a second time: the unit of learning is already the unit of privacy.

## Guardrails, because this is email

A system that decides what to put in front of a customer needs limits that aren't learned:

- **A permanent holdout.** A fixed share of the list always receives the editorial default. Without it, "the bandit is working" is an unfalsifiable claim.
- **Inventory masking.** Checked live at render, never from the snapshot.
- **Frequency capping and a diversity floor.** A slot that always wins is a newsletter that becomes one product, and a list that unsubscribes.
- **Consent-aware degradation.** Without consent there's no per-person posterior; the recipient is served the cohort's marginal best. The system gets worse, not broken, and no consent dialogue ever gates the send.
- **Erasure that actually erases.** Delete the server-side record, and tombstone the identifier so the next Parquet compaction drops its rows. The tombstone pattern is already in the codebase, in the slug index from Part 2.

## What we measure before believing any of it

This part describes a deployed design. The numbers that prove it works are tracked in production:

1. **Cohort stability**: the share of returning cookies whose cohort changes between sessions. If it's high, the signals are noise and the ladder is sorting nothing.
2. **Cohort predictiveness**: click-rate variance explained by cohort against a shuffled control. If a cohort predicts nothing, it shouldn't be a context.
3. **Realised regret against the holdout**: the only number that settles whether the bandit earned its complexity.
4. **Snapshot agreement**: the share of email impressions whose landing page matched the pinned catalogue version. This should be exactly 100%, and measuring it is how you find out it isn't.

Building any of this without those four being instrumented would be building on a guess. That's the same discipline as the rest of this study: the code says what it does, the models say what they assume, and nothing in between gets asserted.

The back-office provides the operator visibility into all of it: cohort distributions, bandit performance, newsletter assembly, and the first-party signal collection that powers the whole system.

---

<div class="small muted">Figures on this page marked as models are generated from the inputs above and describe the shape of a problem. Behaviours marked as read off the codebase were verified against source. The client, the platform and its domains are withheld deliberately.</div>

<style>
.hero { text-align: center; margin: 2rem 0 2rem; }
.hero h1 { font-size: clamp(2.2rem, 6.4vw, 4rem); line-height: 1.04; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #2f6bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.3rem); font-weight: 400; max-width: 44rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.card .big { display: block; font-size: 1.9rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.card .muted, .muted { color: var(--theme-foreground-muted); }
.card h2 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin: 0 0 0.35rem; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
.tip { margin: 1.25rem 0; padding: 0.75rem 1rem; border-left: 3px solid var(--theme-foreground-focus, #2f6bff); background: var(--theme-background-alt, rgba(47,107,255,0.06)); border-radius: 0 6px 6px 0; font-size: 0.92rem; }
</style>
