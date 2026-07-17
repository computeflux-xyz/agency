---
title: Vector search that scales
toc: false
---

```js
const cover = FileAttachment("cover.svg");
```

# Vector search that scales

Exact nearest-neighbour search is easy and hopelessly slow at scale. Every production vector index is therefore *approximate*, trading a little **recall** for a lot of **speed** — and the knobs that buy speed also cost memory.

```js
const pts = d3.range(60, 100).map((r) => ({recall: r, ms: 0.5 + Math.pow((100 - r) / 20, -1.6) * 8}));
```

```js
resize((width) => Plot.plot({
  width, height: 260, marginLeft: 60,
  x: {label: "Recall (%) →", grid: true},
  y: {label: "↑ query latency (ms)", grid: true},
  marks: [Plot.lineY(pts, {x: "recall", y: "ms", curve: "basis", strokeWidth: 2}), Plot.ruleY([0])]
}))
```

The last few points of recall are exponentially expensive. The engineering question is never "how do I get 100%?" — it is "how little recall can this product tolerate?"
