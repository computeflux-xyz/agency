---
title: Continuous batching in practice
toc: false
---

```js
const cover = FileAttachment("cover.svg");
```

# Continuous batching in practice

Naive serving runs one request at a time and leaves the GPU mostly idle. **Continuous batching** interleaves many sequences, admitting and retiring them token-by-token so the device stays saturated. Throughput climbs steeply with batch size before memory bandwidth flattens it out.

```js
const b = d3.range(1, 65).map((n) => ({batch: n, tps: 1000 * n / (1 + 0.06 * n)}));
```

```js
resize((width) => Plot.plot({
  width, height: 260, marginLeft: 60,
  x: {label: "Batch size →", grid: true},
  y: {label: "↑ tokens / sec", grid: true},
  marks: [Plot.lineY(b, {x: "batch", y: "tps", curve: "basis", strokeWidth: 2}), Plot.ruleY([0])]
}))
```

It is the first thing to fix because it carries **no quality risk** — the outputs are identical, you are only scheduling them better.
