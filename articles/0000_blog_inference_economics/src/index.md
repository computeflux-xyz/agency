---
title: The real cost of LLM inference
toc: false
---

```js
import {fmtUSD, fmtInt, perMillion} from "./components/money.js";
const gpus = await FileAttachment("data/gpus.csv").csv({typed: true});
const techniques = await FileAttachment("data/techniques.csv").csv({typed: true});
// Referenced so the cover ships in dist/ — site-api resolves it to the article's cover image.
const cover = FileAttachment("cover.svg");
```

<div class="hero">
  <h1>The real cost of<br>LLM inference</h1>
  <h2>Serving a model is a throughput problem wearing a finance costume. Drag the sliders — the numbers are yours.</h2>
</div>

Every AI feature that ships eventually meets the same wall: the GPU bill. Training gets the headlines, but for anything in production, **inference is the line item that scales with success**. The more users you win, the more it costs — unless the serving stack is engineered for it.

The model below is deliberately simple. It won't capture every nuance of prefill vs. decode or tensor-parallel sharding, but it captures the one relationship that governs the bill:

<div class="formula">${tex.block`\text{cost per token} = \frac{\text{GPU \$ per hour}}{\text{tokens per second} \times 3600}`}</div>

Throughput is the denominator. **Everything we do in inference optimization is a fight to grow that denominator** without hurting quality.

## Your serving assumptions

```js
const gpuCost = view(Inputs.range([0.4, 6], {value: 3.5, step: 0.05, label: "GPU $ / hour", format: (x) => fmtUSD(x)}));
const throughput = view(Inputs.range([100, 8000], {value: 2400, step: 50, label: "Decode throughput (tokens / sec)"}));
const promptTokens = view(Inputs.range([200, 100000], {value: 6000, step: 100, label: "Prompt tokens / request"}));
const outputTokens = view(Inputs.range([50, 4000], {value: 600, step: 25, label: "Output tokens / request"}));
const requestsPerDay = view(Inputs.range([1000, 5000000], {value: 250000, step: 1000, label: "Requests / day"}));
```

```js
// Prefill (reading the prompt) is far cheaper per token than decode; approximate
// it at 20% of decode cost so the per-request number stays honest.
const costPerToken = gpuCost / (throughput * 3600);
const costPerRequest = costPerToken * (outputTokens + promptTokens * 0.2);
const costPer1M = perMillion(gpuCost, throughput);
const monthly = costPerRequest * requestsPerDay * 30;
const annual = monthly * 12;
```

<div class="grid grid-cols-4">
  <div class="card"><h2>Cost / 1M output tokens</h2><span class="big">${fmtUSD(costPer1M)}</span></div>
  <div class="card"><h2>Cost / request</h2><span class="big">${fmtUSD(costPerRequest)}</span></div>
  <div class="card"><h2>Monthly spend</h2><span class="big">${fmtUSD(monthly)}</span></div>
  <div class="card"><h2>Annual run-rate</h2><span class="big">${fmtUSD(annual)}</span></div>
</div>

At **${fmtInt(requestsPerDay)} requests/day**, that is a **${fmtUSD(annual)}/year** commitment — a number that turns a 2× throughput win into real money.

## Why throughput is the whole game

Cost per million tokens collapses as throughput rises. The curve is a hyperbola: the first improvements are cheap, and past a point you are chasing diminishing returns — which is exactly where custom kernels and batching strategy earn their keep.

```js
const throughputCurve = d3.range(200, 8001, 100).map((t) => ({t, cost: perMillion(gpuCost, t)}));
```

```js
resize((width) => Plot.plot({
  width,
  height: 340,
  marginLeft: 60,
  x: {label: "Throughput (tokens / sec) →", grid: true},
  y: {label: "↑ $ / 1M tokens", grid: true, zero: true},
  marks: [
    Plot.areaY(throughputCurve, {x: "t", y: "cost", fillOpacity: 0.12, curve: "basis"}),
    Plot.lineY(throughputCurve, {x: "t", y: "cost", curve: "basis", strokeWidth: 2}),
    Plot.ruleX([throughput], {strokeOpacity: 0.4, strokeDasharray: "3,3"}),
    Plot.dot([{t: throughput, cost: costPer1M}], {x: "t", y: "cost", r: 6, fill: "currentColor"}),
    Plot.text([{t: throughput, cost: costPer1M}], {
      x: "t", y: "cost", text: (d) => `you: ${fmtUSD(d.cost)}`,
      dy: -14, dx: 6, textAnchor: "start", fontWeight: 700
    })
  ]
}))
```

## Cost scales linearly with traffic

Once cost-per-request is fixed by your stack, monthly spend is just a line through the origin. The slope is the thing you get to engineer.

```js
const trafficCurve = d3.range(0, requestsPerDay * 2 + 1, Math.max(1, Math.round(requestsPerDay / 60)))
  .map((r) => ({r, monthly: costPerRequest * r * 30}));
```

```js
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 72,
  x: {label: "Requests / day →", grid: true, tickFormat: "~s"},
  y: {label: "↑ Monthly spend", grid: true, tickFormat: (d) => fmtUSD(d)},
  marks: [
    Plot.lineY(trafficCurve, {x: "r", y: "monthly", strokeWidth: 2}),
    Plot.ruleX([requestsPerDay], {strokeOpacity: 0.4, strokeDasharray: "3,3"}),
    Plot.dot([{r: requestsPerDay, monthly}], {x: "r", y: "monthly", r: 6, fill: "currentColor"}),
    Plot.tip(trafficCurve, Plot.pointerX({x: "r", y: "monthly", title: (d) => `${fmtInt(d.r)} req/day\n${fmtUSD(d.monthly)}/mo`}))
  ]
}))
```

## Not all GPUs are equal

The cheapest GPU per hour is rarely the cheapest per token. Throughput and price move together — but not proportionally. Here is an *illustrative* price list for a 7B-class model; the winner is whichever minimizes **$ / 1M tokens**, not **$ / hour**.

```js
const gpuRanked = gpus
  .map((g) => ({...g, costPer1M: perMillion(g.hourly_usd, g.tokens_per_sec)}))
  .sort((a, b) => a.costPer1M - b.costPer1M);
```

```js
resize((width) => Plot.plot({
  width,
  height: 260,
  marginLeft: 110,
  marginRight: 70,
  x: {label: "$ / 1M tokens →", grid: true},
  y: {label: null, domain: gpuRanked.map((d) => d.gpu)},
  color: {scheme: "turbo", legend: false},
  marks: [
    Plot.barX(gpuRanked, {y: "gpu", x: "costPer1M", fill: "tokens_per_sec", sort: {y: "x"}}),
    Plot.text(gpuRanked, {y: "gpu", x: "costPer1M", text: (d) => fmtUSD(d.costPer1M), dx: 6, textAnchor: "start"}),
    Plot.ruleX([0])
  ]
}))
```

```js
Inputs.table(gpuRanked, {
  columns: ["gpu", "hourly_usd", "tokens_per_sec", "vram_gb", "costPer1M"],
  header: {
    gpu: "GPU",
    hourly_usd: "$ / hr",
    tokens_per_sec: "tok / s",
    vram_gb: "VRAM (GB)",
    costPer1M: "$ / 1M tokens"
  },
  format: {
    hourly_usd: (x) => fmtUSD(x),
    tokens_per_sec: (x) => fmtInt(x),
    costPer1M: (x) => fmtUSD(x)
  },
  rows: 8
})
```

## Where the savings actually hide

There is no single trick. Real cost reduction is a *stack* of independent wins that multiply. Pick the levers you can afford to pull and see the compounded effect on your current bill.

```js
const chosen = view(Inputs.checkbox(
  techniques.map((t) => t.technique),
  {value: ["Continuous batching", "Quantization (INT8/FP8)"], label: "Techniques applied"}
));
```

```js
// Use the midpoint of each technique's illustrative range as a throughput/cost
// multiplier and compound the selected ones.
const factor = techniques
  .filter((t) => chosen.includes(t.technique))
  .reduce((acc, t) => acc * (1 + (t.low_pct + t.high_pct) / 2 / 100), 1);
const optimizedThroughput = throughput * factor;
const optimizedCostPer1M = perMillion(gpuCost, optimizedThroughput);
const optimizedMonthly = monthly / factor;
const saved = monthly - optimizedMonthly;
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Effective throughput</h2><span class="big">${fmtInt(optimizedThroughput)}</span><span class="muted">tokens / sec (${factor.toFixed(2)}×)</span></div>
  <div class="card"><h2>Optimized $ / 1M</h2><span class="big">${fmtUSD(optimizedCostPer1M)}</span></div>
  <div class="card"><h2>Saved / month</h2><span class="big" style="color:var(--theme-green,#3fb950)">${fmtUSD(saved)}</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 170,
  marginRight: 60,
  x: {label: "Illustrative improvement (%) →", grid: true},
  y: {label: null, domain: techniques.map((t) => t.technique)},
  color: {legend: true, label: "Optimizes"},
  marks: [
    Plot.barX(techniques, {
      y: "technique", x1: "low_pct", x2: "high_pct", fill: "dimension",
      fillOpacity: (d) => chosen.includes(d.technique) ? 1 : 0.28,
      sort: {y: "x2", reverse: true}
    }),
    Plot.text(techniques, {y: "technique", x: "high_pct", text: (d) => `${d.low_pct}–${d.high_pct}%`, dx: 6, textAnchor: "start"}),
    Plot.ruleX([0])
  ]
}))
```

<div class="tip">Continuous batching is deliberately expressed as a throughput gain (it can be well over 100%) — it is almost always the first thing to fix, because it is free of quality risk.</div>

## The takeaway

Inference cost is not a fixed cost of doing business — it is a **function of engineering decisions**, most of them on the serving side. The sliders above make the leverage visible: a modest throughput improvement, compounded across a few independent techniques, is the difference between an AI feature that pays for itself and one that quietly bleeds margin.

That denominator — tokens per second per dollar — is where [Computeflux](https://computeflux.xyz) spends its time: quantization and custom kernels, batching and cache strategy, and the ruthless benchmarking that proves a change actually helped before it ships.

---

<div class="small muted">All figures on this page are illustrative and driven entirely by the inputs above — they are a teaching model, not a benchmark. Bring your own measurements.</div>

<style>
.hero { text-align: center; margin: 2rem 0 3rem; }
.hero h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.02; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #8b8bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.35rem); font-weight: 400; max-width: 40rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.card .big { display: block; font-size: 2rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.card .muted, .muted { color: var(--theme-foreground-muted); }
.card h2 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin: 0 0 0.35rem; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
.formula { margin: 1.5rem 0; padding: 1rem; text-align: center; border: 1px solid var(--theme-foreground-faintest, #333); border-radius: 8px; background: var(--theme-background-alt, rgba(255,255,255,0.02)); overflow-x: auto; }
.tip { margin: 1.25rem 0; padding: 0.75rem 1rem; border-left: 3px solid var(--theme-foreground-focus, #8b8bff); background: var(--theme-background-alt, rgba(139,139,255,0.06)); border-radius: 0 6px 6px 0; font-size: 0.92rem; }
</style>
