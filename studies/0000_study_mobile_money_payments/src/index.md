---
title: "Edge e-commerce: payment is the product"
toc: false
---

```js
import {fmtInt, duplicates} from "./components/settlement.js";
const surfaces = await FileAttachment("data/surfaces.csv").csv({typed: true});
const codes = await FileAttachment("data/response_classes.csv").csv({typed: true});
const cover = FileAttachment("cover.svg");
```

<div class="hero">
  <h1>Edge e-commerce: Payment is<br>the product</h1>
  <h2>Part 1 of 3. Engineering a payment processor for a market where cards are the exception, not the rule.</h2>
</div>

<div class="client-strip">
  <div class="field"><span class="k">Sector</span><span class="v">Luxury spirits, direct to consumer</span></div>
  <div class="field"><span class="k">Market</span><span class="v">Central Africa (DRC)</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">Storefront · Back-office · Courier app · Admin API</span></div>
  <div class="field"><span class="k">This part</span><span class="v">The Mobile Money processor</span></div>
</div>

This is the story of what happens when you build e-commerce for a market where **90% of your customers don't have credit cards.**

We read the code. We traced the transactions. We verified every claim against the actual implementation: the shared mobile-money client library and the payment use-case package that drives it. No marketing slides. No hand-waving. Just engineering.

## The constraint that redefined the architecture

Most e-commerce platforms treat payment as an afterthought, a Stripe integration bolted onto a checkout flow designed for cardholders. That works when your customers have cards.

In the Democratic Republic of Congo, they don't.

Here, **Mobile Money is the infrastructure.** M-Pesa, Orange Money, Airtel Money. These are how people pay. The account identifier is a phone number. Confirmation happens on the handset. Settlement is asynchronous by design. A card form isn't a suboptimal option; for most of the addressable market, **it's not an option at all.**

So we didn't integrate a payment processor. We **built one.** From scratch. For M-Pesa DRC's OpenAPI. And it became the most critical, most complex part of the entire platform.

### What the checkout actually offers

Every row below comes directly from the payment enum in the storefront's checkout component and the corresponding service wiring in the Go API. The `ui_flag` column is the user-visible switch, a product decision that moves independently of whether the backend path exists.

```js
Inputs.table(surfaces, {
  columns: ["method", "ui_flag", "backend", "settlement", "notes_en"],
  header: {
    method: "Method",
    ui_flag: "Visible in checkout",
    backend: "Backend path",
    settlement: "Settlement",
    notes_en: "Note"
  },
  width: {notes_en: 300},
  rows: 8
})
```

**The honest reading:** Mobile Money is complete and wired on the server, but behind a feature flag in the UI. Building a payment method and rolling it out are two different events. This study is about the first: the engineering that makes the second possible.

## Why we couldn't just install an SDK

The M-Pesa OpenAPI surface doesn't work like modern payment APIs. We discovered this the hard way, then built around it.

Every behavior below is read from our in-house client library (≈1,300 lines of Go in a shared `payments/` package) and from the constants file that pins the rail's endpoints and response codes.

- **Credentials are encrypted, not signed.** The API key is RSA-encrypted (PKCS#1 v1.5) against a market-specific public key embedded in the binary as base64 DER. We ship two: one for sandbox, one for production.

- **Authentication is a session, and sessions expire.** Call `getSession`, get a session key (itself RSA-encrypted), use it as a bearer token. It lives for about an hour. Then it dies.

- **Confirmation doesn't come back on the response.** The API tells you the instruction was accepted. Whether the buyer approved it on their handset arrives later, via callback, keyed by a correlation ID you generated.

- **Errors are a business vocabulary, not HTTP.** `INS-0` means success. Everything else is a code you must classify yourself, because the transport layer happily returns 200 with a refusal inside.

That last point is where most integrations fail. A payment client that treats "the HTTP call succeeded" as "the payment succeeded" looks correct in staging and **loses money in production.**

```js
Inputs.table(codes, {
  columns: ["code", "class", "retryable", "operator_action"],
  header: {
    code: "Code",
    class: "Class",
    retryable: "Retryable",
    operator_action: "What the processor does"
  },
  rows: 10
})
```

### The session manager: where reliability begins

The session is a shared, mutable, expiring resource in front of every payment call. Get it wrong, and everything fails.

Our implementation keeps a session for 55 minutes against a rail-side lifetime of ~60 minutes. We refresh **five minutes early** rather than waiting to be told the session is dead. Refresh uses exponential backoff (1s initial, factor 2, 30s ceiling, 3 attempts) and only retries on transient classes: 5xx, timeouts, connection errors.

Concurrency is handled with a read-write mutex and a double-check after the write lock is taken. A burst of requests arriving at expiry produces **one refresh, not one per request.**

The five-minute margin is deliberate. Refreshing on expiry means the first request after the hour pays the refresh latency *and* races every other request in the same millisecond. Refreshing early converts a user-visible stall into a background call.

## Idempotency: when the buyer taps "pay" twice

Here's the sequence that costs real money.

The buyer submits. The handset doesn't buzz within seconds. The rail is slow, the push is queued, or the buyer simply doesn't trust that anything happened. They tap again.

Our processor takes an `idempotency_id` from the caller and looks for an existing payment under it **before** anything reaches the rail. A hit returns a conflict that resolves to the original payment rather than starting a second one.

Separately, every attempt generates a ULID correlation ID carried on the instruction and used to match the callback back to the row. Request payloads, latencies, and response codes are journaled to their own tables. So are the raw webhook bodies.

```js
// Percentages are ranged in whole percent, not as a fraction. Inputs.range
// pairs the slider with a number field, and a `format` that returns "18%"
// leaves that field blank because it is a real <input type=number>.
const attempts = view(Inputs.range([100, 20000], {value: 2500, step: 50, label: "Payment attempts / day"}));
const retryPct = view(Inputs.range([0, 60], {value: 18, step: 1, label: "Buyers who re-submit (%)"}));
const extraTaps = view(Inputs.range([1, 4], {value: 1.6, step: 0.1, label: "Extra submissions each"}));
const doubleDebitPct = view(Inputs.range([0, 100], {value: 35, step: 1, label: "Unguarded duplicate that actually debits (%)"}));
```

```js
const dup = duplicates({
  attempts,
  retryRate: retryPct / 100,
  extraTaps,
  doubleDebitOdds: doubleDebitPct / 100
});
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Re-submissions / day</h2><span class="big">${fmtInt(dup.resubmissions)}</span><span class="muted">absorbed by the idempotency key</span></div>
  <div class="card"><h2>Rail calls avoided</h2><span class="big">${fmtInt(dup.unguardedRailCalls - dup.guardedRailCalls)}</span><span class="muted">per day, vs. no key</span></div>
  <div class="card"><h2>Double debits avoided</h2><span class="big" style="color:#2f8f5b">${fmtInt(dup.unguardedDoubleDebits)}</span><span class="muted">per day, vs. no key</span></div>
</div>

Every avoided debit is a support conversation, a reversal, and a buyer who won't come back. The reversal path exists: it writes a payment of type `reversal` and marks the original as reversed, so the refund is a row, not a memory. But the cheapest reversal is the one that never has to be issued.

## Asynchronous settlement means reconciliation isn't optional

Our processor runs in two modes, chosen at boot from the environment:

- **Development**: Settles synchronously. An accepted instruction moves straight to `completed`, because a callback can't reach localhost.
- **Production**: Settles asynchronously. An accepted instruction moves to `processing`. Only the callback moves it to `completed` or `failed`.

The rail also exposes a status query, which turns a lost callback into a recoverable one.

<svg class="schematic" viewBox="0 0 1000 300" role="img" aria-label="Asynchronous settlement path">
  <defs>
    <marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="ui-monospace, Menlo, monospace" font-size="13" fill="currentColor">
    <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55">
      <rect x="10" y="40" width="150" height="46" rx="7"/>
      <rect x="10" y="200" width="150" height="46" rx="7"/>
      <rect x="420" y="40" width="170" height="46" rx="7"/>
      <rect x="420" y="200" width="170" height="46" rx="7"/>
      <rect x="830" y="120" width="160" height="46" rx="7"/>
    </g>
    <text x="85" y="68" text-anchor="middle">buyer</text>
    <text x="85" y="228" text-anchor="middle">handset</text>
    <text x="505" y="68" text-anchor="middle">payment service</text>
    <text x="505" y="228" text-anchor="middle">journal tables</text>
    <text x="910" y="148" text-anchor="middle">mobile-money rail</text>
    <g stroke="currentColor" stroke-width="1.6" fill="none" marker-end="url(#a1)">
      <path d="M160 63 H415"/>
      <path d="M590 55 C 700 55, 740 120, 826 134"/>
      <path d="M505 90 V 196"/>
      <path d="M160 223 C 300 223, 700 223, 826 158"/>
    </g>
    <path d="M826 152 C 700 168, 640 96, 592 80" fill="none" stroke="currentColor"
          stroke-width="1.6" stroke-dasharray="6 5" marker-end="url(#a1)" opacity="0.7"/>
    <g font-size="12" opacity="0.75">
      <text x="288" y="52" text-anchor="middle">submit + idempotency_id</text>
      <text x="712" y="76" text-anchor="middle">C2B instruction</text>
      <text x="520" y="150">journal request, latency, code</text>
      <text x="470" y="248" text-anchor="middle">approve on handset</text>
      <text x="700" y="128" text-anchor="middle">callback · correlation id</text>
    </g>
  </g>
</svg>
<p class="schematic-caption">The dashed edge is the one that can be lost. Everything downstream of it is reconciliation.</p>

The dashed callback is a delivery, and deliveries fail. The question a payment platform must answer isn't "does the webhook work" but **"how long does a payment sit in `processing` when it doesn't?"**

The correlation ID must be generated and stored **before** the instruction is sent, never derived from the rail's response. A payment you cannot name is a payment you cannot reconcile.

## What this buys, in plain terms

- **A buyer with no card can complete a purchase**: the entire addressable market, not a slice of it.

- **A buyer who taps twice is charged once**: by construction, not by vigilance.

- **A callback that never arrives becomes a delay, not a loss**: the ledger is reconciled against the rail, not assumed from it.

- **Every instruction, latency, response code, and raw callback body is on disk**, so a disputed payment is answered by a query, not a guess.

None of this is exotic. It's the ordinary discipline of a payments system, applied to a rail that didn't come with it in a box.

## The backoffice: where operators control the money

Behind the scenes, the back-office gives the business complete visibility and control over payments:

- **Real-time monitoring** of payment states, with filters for pending, processing, completed, and failed transactions
- **Manual reconciliation** tools for matching payments against orders when callbacks fail
- **Reversal initiation** for refunds, with full audit trails linking reversals to original payments
- **Webhook logs** showing every callback received, with raw payloads and response times
- **Settlement reports** tracking which payments have been confirmed by the Mobile Money rail

The admin's `CatalogManagement.tsx` component provides the Git-like publish workflow for the catalog, while the payment dashboards surface the same discipline for money movement: every state change is logged, every action is auditable, and every discrepancy has a paper trail.

## Where this goes next

The processor gives the platform correct money movement. It does nothing for the other half of the problem: serving a catalog fast, from far away, to devices on expensive mobile data.

[**Part 2: Edge e-commerce: The catalogue is a build artifact**](https://computeflux.xyz/en/studies/edge-serving-layer) covers the serving layer: an image pipeline from object storage through libvips to a CDN bucket, and a catalog that is *published* to the edge as a versioned, content-hashed snapshot instead of being synchronised row by row.

---

<div class="small muted">Figures on this page marked as models are generated from the inputs above and describe the shape of a problem, not this operator's traffic. Behaviours marked as read off the codebase were verified against source. The client, the platform and its domains are withheld deliberately.</div>

<style>
.hero { text-align: center; margin: 2rem 0 2rem; }
.hero h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.02; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #2f6bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.3rem); font-weight: 400; max-width: 42rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.card .big { display: block; font-size: 2rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.card .muted, .muted { color: var(--theme-foreground-muted); }
.card h2 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin: 0 0 0.35rem; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
</style>
