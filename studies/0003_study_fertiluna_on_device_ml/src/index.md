---
title: "On-device ML: small enough to fit in a browser tab"
toc: false
---

```js
import {
  fmtInt, fmtPct, fmtMiB, fmtDuration, MIB,
  collapse, worstConfusions, exportSize, payload, delivery
} from "./components/cycle.js";
const artifacts = await FileAttachment("data/artifacts.csv").csv({typed: true});
const classes = await FileAttachment("data/classes.csv").csv({typed: true});
const confusion = await FileAttachment("data/confusion.csv").csv({typed: true});
const exports_ = await FileAttachment("data/export_size.csv").csv({typed: true});
const perception = await FileAttachment("data/perception.csv").csv({typed: true});
const cvStatus = await FileAttachment("data/cv_status.csv").csv({typed: true});
const visionHistory = await FileAttachment("data/vision_history.csv").csv({typed: true});
const cover = FileAttachment("cover.svg");
```

```js
const LABELS = classes.map((c) => c.label);
const SHORT = new Map(classes.map((c) => [c.label, c.short_en]));
const NAME = new Map(classes.map((c) => [c.label, c.label_en]));
const prefit = exports_.find((d) => d.variant === "prefit");
const cv5 = exports_.find((d) => d.variant === "cv5");
```

<div class="hero">
  <h1>On-device ML:<br>small enough to fit in a browser tab</h1>
  <h2>A health tool that reads BBT ("basal body temperature") charts with no sign-up and no data upload. Every model runs in the browser.</h2>
</div>

<div class="client-strip">
  <div class="field"><span class="k">Sector</span><span class="v">Health, consumer tool</span></div>
  <div class="field"><span class="k">Market</span><span class="v">Entire world</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">Site, analysis tool, training pipeline</span></div>
  <div class="field"><span class="k">Client</span><span class="v">Ourselves (open source)</span></div>
</div>

**FertiLuna** is our own tool, it is open source, and it is already named on our front page.

The product described here belongs to a fairly little-known niche: **sympto-thermal methods**, the practice of observing a menstrual cycle and female fertility. The measurement scenario goes like this. A user has a basal body temperature chart, and possibly ovulation-test values. She either types those numbers in by hand, or captures them from another application. The tool reads the chart, classifies the cycle, and explains it in plain language.

What makes this tool interesting is not so much the model it runs as its constraint: **this is health data, a special category, so it must never leave the device.** There is no account, no upload, no server-side storage. That single decision reorders every machine-learning decision downstream: which estimator do we choose, how do we calibrate it, and how much can it be allowed to weigh?

## Explaining the constraint

The page shell is rendered server-side (SSR), mainly for effective search indexing. Everything else happens on the user's own device. Feature extraction, the classifier, out-of-distribution detection, chart reading and the history of past analyses all execute entirely in the browser. The only thing that crosses the network is the model's weight file, which carries no personal data.

<svg class="schematic" viewBox="0 0 1000 300" role="img" aria-label="Model files cross into the device; cycle data never crosses back">
  <defs>
    <marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="ui-monospace, Menlo, monospace" font-size="12.5" fill="currentColor">
    <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55">
      <rect x="8" y="96" width="168" height="72" rx="9"/>
      <rect x="286" y="34" width="700" height="232" rx="14" stroke-dasharray="7 6"/>
      <rect x="318" y="96" width="152" height="72" rx="9"/>
      <rect x="516" y="96" width="152" height="72" rx="9"/>
      <rect x="714" y="96" width="152" height="72" rx="9"/>
    </g>
    <g text-anchor="middle">
      <text x="92" y="126">edge worker</text><text x="92" y="146" opacity="0.7" font-size="11">page + assets</text>
      <text x="394" y="126">IndexedDB</text><text x="394" y="146" opacity="0.7" font-size="11">models, by version</text>
      <text x="592" y="126">WASM runtime</text><text x="592" y="146" opacity="0.7" font-size="11">ONNX Runtime Web</text>
      <text x="790" y="126">the chart</text><text x="790" y="146" opacity="0.7" font-size="11">typed or captured</text>
      <text x="636" y="60" opacity="0.75" font-size="11.5">the device (the privacy perimeter)</text>
      <text x="636" y="244" opacity="0.75" font-size="11.5">no request carries a temperature, a date or an identifier</text>
    </g>
    <g stroke="currentColor" stroke-width="1.6" fill="none" marker-end="url(#a1)">
      <path d="M176 132 H313"/>
      <path d="M470 132 H511"/>
      <path d="M714 132 H673" />
    </g>
  </g>
</svg>
<div class="schematic-caption">The tool behaves like a local black box.</div>

<div class="verified">The Astro app is deployed as a Cloudflare worker, with server rendering for the page shell only. All inference is created and executed client-side under <span class="kv">onnxruntime-web/wasm</span> with <span class="kv">numThreads = 1</span> and SIMD enabled (single-threaded on purpose, because multi-threaded WASM would demand cross-origin isolation headers). The runtime binary is emitted by the bundler and served from the same origin. No CDN is involved at any point so far. Model bytes are fetched once and then stored in IndexedDB through Dexie, under the key <span class="kv">version:file</span>, and checked against the SHA-256 in the manifest.</div>

## What crosses the network… once

Here is the whole download:

```js
const artifactRows = artifacts.map((a) => ({
  Artifact: a.name,
  File: a.file,
  Size: fmtMiB(a.bytes),
  Bytes: fmtInt(a.bytes),
  "Fetched": a.fetched,
  Role: a.role
}));
display(Inputs.table(artifactRows, {
  columns: ["Artifact", "File", "Size", "Bytes", "Fetched", "Role"],
  width: {Artifact: 160, File: 205, Fetched: 135, Role: 250},
  rows: 6,
  sort: null
}));
```

**The runtime is bigger than the model.** ONNX Runtime Web's WASM binary is the largest file a first visit downloads (larger than the classifier and the out-of-distribution detector combined).

**One artifact is available and never used.** The chart-reading CNN sits in the deployed asset directory but nothing uses it, and it is publicly downloadable today. It is the largest model file in the project. We come back further down to why it exists (and why we decided to leave it there).

```js
const mbps = view(Inputs.range([1, 200], {value: 25, step: 1, label: "Download bandwidth (Mbit/s)"}));
const visits = view(Inputs.range([1, 40], {value: 8, step: 1, label: "Sessions on the same device"}));
const withImport = view(Inputs.toggle({label: "The user imports a screenshot", value: true}));
const includeDead = view(Inputs.toggle({label: "Count the model nothing loads", value: false}));
```

```js
const pay = payload({artifacts, withImport, includeDeadWeight: includeDead, mbps, visits});
```

<div class="grid grid-cols-3">
  <div class="card"><h2>First session</h2><span class="big">${fmtMiB(pay.coldBytes)}</span><span class="muted">${fmtDuration(pay.coldSeconds)} at ${mbps} Mbit/s</span></div>
  <div class="card"><h2>Every session after</h2><span class="big">0 MiB</span><span class="muted">cache hit on <span class="kv">version:file</span></span></div>
  <div class="card"><h2>Not re-downloaded over ${visits} sessions</h2><span class="big">${fmtMiB(pay.savedBytes)}</span><span class="muted">compared with fetching every time</span></div>
</div>

## Decision 1: making the calibration fit inside a download

The tool's most important output is not a label: it is its ability to refuse to conclude. When the maximum probability is below **0.60**, the prediction is replaced by *insufficient data*, whatever class the argmax picked.

That rule is only defensible if the probabilities are properly calibrated. The raw probabilities of a random forest rarely are: they tend to cluster near 0 or 1, which makes applying a fixed threshold arbitrary. Platt calibration answers that problem. The most direct approach is scikit-learn's `CalibratedClassifierCV(cv=5)`, which trains five separate random forests and keeps all of them in the final model. Those five ensembles then end up inside the exported ONNX graph.

The project takes another route: train **a single** forest on a fit set, freeze it, then run the calibration on a separate dataset. The exported graph therefore contains only one tree ensemble.

<div class="verified">The classifier is a random forest of 120 trees, maximum depth 12, at least 12 samples per leaf, <span class="kv">sqrt</span> feature subsampling and balanced class weights. It is trained on 32,000 of the 50,000 synthetic cycles, calibrated by Platt scaling on 8,000 held-out cycles, then evaluated on the remaining 10,000, never seen during training. The export is pinned to opset 17 and to <span class="kv">ai.onnx.ml</span> 3, the ceiling supported by ONNX Runtime Web.</div>

But what does that decision actually buy?

```js
const measuredRows = exports_.map((d) => ({
  Variant: d.label_en,
  "Ensembles in graph": fmtInt(d.ensembles),
  Trees: fmtInt(d.trees),
  "Tree nodes": fmtInt(d.nodes),
  "ONNX size": fmtMiB(d.bytes),
  Accuracy: d.accuracy.toFixed(4),
  "Log loss": d.log_loss.toFixed(4)
}));
display(Inputs.table(measuredRows, {
  columns: ["Variant", "Ensembles in graph", "Trees", "Tree nodes", "ONNX size", "Accuracy", "Log loss"],
  width: {Variant: 240, "Ensembles in graph": 165, Trees: 80, "Tree nodes": 105, "ONNX size": 100, Accuracy: 95, "Log loss": 90},
  rows: 2,
  sort: null
}));
```

<div class="verified">The single-ensemble export reproduces the shipped file <em>byte for byte</em>: ${fmtInt(prefit.bytes)} bytes, an accuracy of ${prefit.accuracy.toFixed(4)} and a log loss of ${prefit.log_loss.toFixed(5)}. That is a reassuring signal: the published artifact really does come out of the versioned pipeline. The five-ensemble export weighs ${fmtInt(cv5.bytes)} bytes.</div>

So the real trade-off is this:

- A download **${(cv5.bytes / prefit.bytes).toFixed(2)} times** heavier, and **${(cv5.nodes / prefit.nodes).toFixed(1)} times** more nodes to evaluate on a phone
- For a gain of **${((cv5.accuracy - prefit.accuracy) * 100).toFixed(2)} accuracy point** and a log loss lower by ${(prefit.log_loss - cv5.log_loss).toFixed(4)}.

```js
const folds = view(Inputs.range([1, 10], {value: 1, step: 1, label: "Ensembles kept in the exported graph"}));
const linkMbps = view(Inputs.range([1, 200], {value: 25, step: 1, label: "Download bandwidth (Mbit/s)"}));
```

```js
const anchorLow = {folds: prefit.ensembles, bytes: prefit.bytes};
const anchorHigh = {folds: cv5.ensembles, bytes: cv5.bytes};
const companionBytes = artifacts.find((a) => a.file.startsWith("cycle-iforest")).bytes;
const sizeNow = exportSize({folds, anchorLow, anchorHigh, companionBytes, mbps: linkMbps});
const sizeCurve = d3.range(1, 11).map((k) =>
  exportSize({folds: k, anchorLow, anchorHigh, companionBytes, mbps: linkMbps}));
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Classifier graph</h2><span class="big">${fmtMiB(sizeNow.modelBytes)}</span><span class="muted">${sizeNow.measured ? "measured" : "interpolated"}</span></div>
  <div class="card"><h2>With the anomaly detector</h2><span class="big">${fmtMiB(sizeNow.totalBytes)}</span><span class="muted">both tabular models</span></div>
  <div class="card"><h2>Time to fetch</h2><span class="big">${fmtDuration(sizeNow.seconds)}</span><span class="muted">at ${linkMbps} Mbit/s</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 70,
  x: {label: "Tree ensembles in the exported graph →", grid: true, tickFormat: "d"},
  y: {label: "↑ ONNX size (MiB)", grid: true, zero: true},
  marks: [
    Plot.areaY(sizeCurve, {x: "folds", y: (d) => d.totalBytes / MIB, fillOpacity: 0.1}),
    Plot.lineY(sizeCurve, {x: "folds", y: (d) => d.totalBytes / MIB, strokeWidth: 2}),
    Plot.dot(exports_, {x: "ensembles", y: (d) => (d.bytes + companionBytes) / MIB, r: 6, fill: "#2f8f5b"}),
    Plot.text(exports_, {x: "ensembles", y: (d) => (d.bytes + companionBytes) / MIB, text: () => "measured", dy: -14, dx: 8, textAnchor: "start", fill: "#2f8f5b", fontWeight: 700}),
    Plot.ruleX([folds], {stroke: "#b0501a", strokeDasharray: "4,4"}),
    Plot.tip(sizeCurve, Plot.pointerX({x: "folds", y: (d) => d.totalBytes / MIB,
      title: (d) => `${d.folds} ensemble${d.folds > 1 ? "s" : ""}\n${fmtMiB(d.totalBytes)}\n${fmtDuration(d.seconds)}`}))
  ]
}))
```

<div class="modelled">Two points on this curve were measured. Every intermediate value, and everything beyond them, rests on a linear interpolation between those two measurements. The approximation is reasonable in this case: each tree ensemble serialises into a comparable volume of bytes. Even so, nine of the ten points shown were never exported nor measured directly.</div>

## Decision 2: a system allowed to say "I don't know"

The classifier reaches **88.56%** accuracy on the 10,000 synthetic cycles of the test set, with a log loss of **0.329**. Taken in isolation, that figure says little: the five classes are not clinically equivalent. Two of them correspond to neighbouring situations on the same continuum, and confusing those two is not as serious as confusing an absence of ovulation with a confirmed one.

The right question is therefore *where* the errors concentrate. Group the labels below to see how accuracy moves depending on the reading you adopt.

```js
const groupMode = view(Inputs.radio(
  new Map([
    ["Five classes, as trained", "none"],
    ["Confirmed + doubtful as one", "conf_doubt"],
    ["Doubtful + short luteal as one", "doubt_short"],
    ["Any ovulation signal, or none", "signal"]
  ]),
  {value: "none", label: "Read the labels as"}
));
```

```js
const GROUPINGS = {
  none: LABELS.map((l) => [l]),
  conf_doubt: [["ovulation_confirmee", "ovulation_douteuse"], ["anovulation"], ["phase_luteale_courte"], ["donnees_insuffisantes"]],
  doubt_short: [["ovulation_douteuse", "phase_luteale_courte"], ["ovulation_confirmee"], ["anovulation"], ["donnees_insuffisantes"]],
  signal: [["ovulation_confirmee", "ovulation_douteuse", "phase_luteale_courte"], ["anovulation"], ["donnees_insuffisantes"]]
};
const col = collapse(confusion, LABELS, GROUPINGS[groupMode]);
const base = collapse(confusion, LABELS, GROUPINGS.none);
const worst = worstConfusions(confusion, 3);
const cells = confusion.map((c) => ({
  truth: SHORT.get(c.truth),
  predicted: SHORT.get(c.predicted),
  n: c.n,
  share: c.share_of_truth
}));
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Accuracy as read</h2><span class="big">${fmtPct(col.accuracy, 2)}</span><span class="muted">${col.size} classes · ${fmtInt(col.total)} test cycles</span></div>
  <div class="card"><h2>Against five classes</h2><span class="big" style="color:${col.accuracy > base.accuracy ? "#2f8f5b" : "inherit"}">${col.accuracy > base.accuracy ? "+" : ""}${((col.accuracy - base.accuracy) * 100).toFixed(2)} pt</span><span class="muted">same predictions, coarser question</span></div>
  <div class="card"><h2>Biggest confusion</h2><span class="big" style="font-size:1.15rem">${NAME.get(worst[0].truth)} → ${NAME.get(worst[0].predicted)}</span><span class="muted">${fmtInt(worst[0].n)} cycles · ${fmtPct(worst[0].share_of_truth)} of that class</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 340,
  marginLeft: 96,
  marginBottom: 76,
  padding: 0,
  x: {label: "Predicted →", domain: classes.map((c) => c.short_en), tickRotate: -28},
  y: {label: "↑ True", domain: classes.map((c) => c.short_en)},
  color: {scheme: "blues", legend: true, label: "Test cycles"},
  marks: [
    Plot.cell(cells, {x: "predicted", y: "truth", fill: "n", inset: 0.5}),
    Plot.text(cells, {x: "predicted", y: "truth", text: (d) => fmtInt(d.n),
      fill: (d) => (d.n > 2200 ? "white" : "black"), fontSize: 11}),
    Plot.tip(cells, Plot.pointer({x: "predicted", y: "truth",
      title: (d) => `true ${d.truth} → predicted ${d.predicted}\n${fmtInt(d.n)} cycles\n${fmtPct(d.share)} of the true class`}))
  ]
}))
```

<div class="verified">The counts shown in this figure are read from <span class="kv">model/artifacts/metrics-v1.json</span>. The grouping control merely re-aggregates those same counts: it re-runs no model and re-estimates no metric.</div>

The structure of the errors is more revealing here than their number. The most frequent confusion is reading a confirmed ovulation as a short luteal phase. The next two are the two directions of the confusion between doubtful ovulation and anovulation. Almost no cycle goes straight from *confirmed* to *no ovulation*: none in one direction and two in the other, out of ten thousand observations. The model's errors therefore concentrate precisely in the zones where clinical interpretation is itself uncertain.

```js
resize((width) => Plot.plot({
  width,
  height: 360,
  marginLeft: 92,
  marginRight: 130,
  x: {domain: [0, 1], grid: true, tickFormat: "%", label: "Score →"},
  y: {label: null, domain: ["Precision", "Recall", "F1"]},
  fy: {label: null, domain: classes.map((c) => c.short_en)},
  color: {domain: ["Precision", "Recall", "F1"]},
  marks: [
    Plot.barX(classes.flatMap((c) => [
      {label: c.short_en, metric: "Precision", v: c.precision},
      {label: c.short_en, metric: "Recall", v: c.recall},
      {label: c.short_en, metric: "F1", v: c.f1}
    ]), {fy: "label", y: "metric", x: "v", fill: "metric", inset: 1}),
    Plot.text(classes.flatMap((c) => [
      {label: c.short_en, metric: "Precision", v: c.precision},
      {label: c.short_en, metric: "Recall", v: c.recall},
      {label: c.short_en, metric: "F1", v: c.f1}
    ]), {fy: "label", y: "metric", x: "v", text: (d) => fmtPct(d.v, 1), dx: 6, textAnchor: "start", fontSize: 10}),
    Plot.ruleX([0])
  ]
}))
```

Two mechanisms turn that ambiguity into usable behaviour.

<div class="verified">When the calibrated maximum probability is below 0.60, the label is replaced by <em>insufficient data</em>: the zone of uncertainty is explicitly flagged instead of being hidden behind a forced conclusion. In parallel, an isolation forest of 150 estimators, with a contamination of 0.10, measures how far a curve sits from the training distribution. The exported manifest holds the 5<sup>th</sup>, 50<sup>th</sup> and 95<sup>th</sup> percentiles of its decision function on the training set. In the browser, the raw score is projected through those anchors onto an "unusualness" scale from 0 to 100. That score is purely advisory: it is displayed, but it can never change the predicted label.</div>

## Decision 3: training a neural reader, only to ship a geometric method

Most users will not type 35 temperatures by hand. They will import a screenshot from the app they already use (Premom, for instance). Reading that image is a visual perception problem, and the project solved it in two ways.

**Route A: the one with the best results.** A small depthwise-separable convolutional network, trained on procedurally generated charts: a *stem*, six blocks and three decode heads. Two versions were trained. In the second, the value head was replaced by a soft-argmax applied per series over image height. The value is then, by construction, tied to the vertical position of the curve. It is that second version that gets the best results on every metric.

**Route B: the one actually deployed.** A deterministic classical computer-vision pipeline in nine stages: colour segmentation in HSV using deliberately disjoint bands, detection of the plot region, tick reading by OCR, a RANSAC line fit for each axis column, recovery of the day grid from the dates, from gridlines, or from the dominant pitch found by autocorrelation, marker detection by ring sampling, safety corrections and a quality check. The only learned component is PaddleOCR, used to read the digits sitting in the margins.

```js
const perceptionRows = perception.map((p) => ({
  Route: p.route,
  Status: p.status_en,
  Params: p.params ? fmtInt(p.params) : "—",
  "Model bytes": p.bytes ? fmtMiB(p.bytes) : "—",
  "Evaluated on": p.eval_en,
  "BBT value MAE": p.bbt_mae === "" || p.bbt_mae == null ? "—" : p.bbt_mae.toFixed(4),
  "BBT presence F1": p.bbt_f1 === "" || p.bbt_f1 == null ? "—" : p.bbt_f1.toFixed(3)
}));
display(Inputs.table(perceptionRows, {
  columns: ["Route", "Status", "Params", "Model bytes", "Evaluated on", "BBT value MAE", "BBT presence F1"],
  width: {Route: 160, Status: 150, Params: 90, "Model bytes": 100, "Evaluated on": 170, "BBT value MAE": 100, "BBT presence F1": 105},
  rows: 4,
  sort: null
}));
```

An honest reading of the table makes the situation uncomfortable: **the deployed route gets clearly worse results than the one that was not deployed.** On the synthetic control set, the pipeline in production reaches a mean absolute error of 0.109 of the temperature axis span and a presence F1 of 0.692, against 0.022 and 0.934 for the neural network that was never deployed.

<div class="verified">The network's results come from the versioned training manifests: 4,729,540 parameters for v1 and 4,133,574 for v2. The deployed pipeline's results come from running the <span class="kv">eval_vision_cv</span> gate with its default settings (40 generated charts, seed 7). It clears its own thresholds, with F1 ≥ 0.55 and MAE ≤ 0.16. The LH series is tracked as well, but with weaker results.</div>

<div class="modelled">This comparison does not put the two approaches on equal footing, and this page should not pretend otherwise. The network is evaluated on held-out samples from <em>the very generator that trained it</em>. The deterministic pipeline is evaluated on that same generator's output, while being designed to handle real screenshots from a real application. The generator only approximates that real distribution and produces, at this resolution, axis labels that are hard for OCR to read. Neither of these results directly predicts quality on a screenshot supplied by a real user. The only evidence on that ground rests on four real screenshots, examined by hand.</div>

Why, then, deploy the route with the lower score? Four reasons explain it, and the last is decisive.

1. **It is auditable.** Every decision rests on an identifiable constant: an HSV band, a coverage threshold, a RANSAC tolerance. When it fails on a chart, it is possible to identify the stage responsible. Given identical input, it always produces the same output.
2. **It extracts more than the curve.** Its geometric reasoning also recovers the tick *values*, the day grid, the markers and the calendar table sitting under the chart. The network returns only two series and a unit. Getting the table would require a second model.
3. **It does not depend on a bridge between simulation and reality.** The pipeline reads the original screenshot. The network reads a synthetic image that imitates one, which means the gap between those two distributions has to be managed.
4. **It knows how to report its own failures.** This is the decisive argument.

```js
resize((width) => Plot.plot({
  width,
  height: 150,
  marginLeft: 130,
  marginRight: 40,
  x: {label: "Charts out of 40 →", grid: true},
  y: {label: null, domain: cvStatus.map((s) => s.label_en)},
  marks: [
    Plot.barX(cvStatus, {y: "label_en", x: "n", fill: (d) => d.status === "extracted" ? "#2f8f5b" : d.status === "low_confidence" ? "#b07d17" : "#b0501a"}),
    Plot.text(cvStatus, {y: "label_en", x: "n", text: (d) => fmtInt(d.n), dx: 10, textAnchor: "start"}),
    Plot.ruleX([0])
  ]
}))
```

On that same run of 40 charts, only 4 were extracted cleanly. 31 were flagged with **low confidence**, and 5 were rejected immediately as **not charts**. A confidence score is computed at each stage. Reading the temperature axis reliably is a blocking condition. Without a correctly identified axis, the values cannot be calibrated and the system cannot claim to have extracted the curve.

For a tool that may inform decisions about fertility, the difference between "wrong" and "wrong, but flagged as such" is fundamental. Unit detection illustrates the point: on the four charts that clear the quality gate, it is correct four times out of four. Across all 40 charts, it is correct in only 52.5% of cases. Without a reliably read axis, the unit falls back to a default value and the result is already marked as untrustworthy.

<div class="verified">The evidence obtained on real images remains limited (and that has to be owned). The Python reference pipeline was run on four real screenshots from a single application. They span two interface languages (English and German), both temperature units, sparse as well as dense charts, and both possible LH line sources. The unit was identified correctly in all four cases, as was the LH source. Both charts of roughly 42 days were correctly flagged as truncated by the 35-day window. The corpus label files still say <span class="kv">reviewed: false</span>: they were initialised from the pipeline's own output and have not been corrected yet. This is therefore a qualitative finding checked by hand, not an automatically scored result. The repository targets around 50 reviewed screenshots.</div>

<div class="verified">Extracted values are never forced on the user. Whichever method read the chart, the numbers are placed in an editable table she can check before any classification happens. Interpolated days are recorded in a mask kept strictly separate from the "measured" mask: a synthesised value can therefore never be presented as a real observation.</div>

The neural network's results were nonetheless entirely real, which makes this an owned decision rather than a default compromise:

```js
const F1_SCALE = 0.09;
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 66,
  marginRight: 76,
  x: {label: "Training epoch →", grid: true, tickFormat: "d"},
  y: {label: "↑ Validation MAE (share of axis span)", grid: true, zero: true},
  color: {legend: true, domain: ["Validation MAE", "Presence F1"]},
  marks: [
    Plot.axisY([0.6, 0.7, 0.8, 0.9, 1.0].map((f) => f * F1_SCALE), {
      anchor: "right", label: "Presence F1 →", tickFormat: (d) => (d / F1_SCALE).toFixed(1)
    }),
    Plot.lineY(visionHistory, {x: "epoch", y: "val_mae_present", stroke: () => "Validation MAE", strokeWidth: 2}),
    Plot.lineY(visionHistory, {x: "epoch", y: (d) => d.val_presence_f1 * F1_SCALE, stroke: () => "Presence F1", strokeWidth: 2, strokeDasharray: "5,4"}),
    Plot.tip(visionHistory, Plot.pointerX({x: "epoch", y: "val_mae_present",
      title: (d) => `epoch ${d.epoch}\nMAE ${d.val_mae_present.toFixed(4)}\npresence F1 ${d.val_presence_f1.toFixed(3)}`})),
    Plot.ruleY([0])
  ]
}))
```

<div class="verified">Fifteen epochs, read from the versioned training manifest of the first vision model: validation MAE falls from 0.0838 to 0.0238 and presence F1 rises from 0.717 to 0.943. The two series are drawn on two axes: MAE on the left, F1 on the right. This is the model that was not, in the end, deployed.</div>

## What makes on-device inference trustworthy

Feature extraction exists in two implementations: in Python, where the model is trained, and in TypeScript, where it is executed. If those two implementations diverge, the model receives data unlike anything it saw during training, without any symptom necessarily being visible.

<div class="verified">The Python implementation produces 15 reference cycles (three per archetype), each accompanied by the 30-dimensional vector it computed. The TypeScript test loads those fixtures and enforces feature-by-feature equality, to a tolerance of <span class="kv">1e-4 + 1e-4·|expected|</span>. The export step separately checks that scikit-learn and ONNX Runtime produce the same probabilities within 1e-3, then records the measured differences in the manifest: 1.19e-07 for the classifier and 8.20e-08 for the isolation forest. The versioned browser suite holds 53 tests across 7 files. CI runs the type check, those tests and the build before any deployment.</div>

One part of the port does not benefit from that same contract yet. The classical computer-vision pipeline was transposed stage by stage from Python to TypeScript, notably by reimplementing connected-component labelling and dilation in pure TypeScript. That is why the browser bundle needs no OpenCV build at all.

## The cache is also the delivery mechanism

Nothing about this mechanism is exotic, and that is precisely its strength. The IndexedDB layer plays the part of a small package manager. It is what removes the network call on a second visit, and what lets the tool work offline.

<div class="verified">Each blob is indexed under the key <span class="kv">version:file</span> and checked against a SHA-256 from the manifest. When a cached entry no longer matches its checksum, it is deleted and downloaded again. After a successful download, other versions of the same file are purged to bound the space used. Downloads are streamed with their progress displayed. If IndexedDB is unavailable — private browsing, or a quota that has been hit — the code uses a plain network download instead of failing.</div>

One deliberate trade-off has to be spelled out. If the checksum of a freshly downloaded file does not match the one in the manifest, the bytes are still handed to the caller. They are only excluded from the cache. A model re-exported while the manifest is already updated should not make the tool unusable. In practice, this means the integrity check does not yet prevent a non-conforming model from being executed.

<div class="proposed">Make that divergence blocking for models: refuse the bytes, display an understandable error, and make a version bump the only way to introduce a new artifact. For health data, it is preferable to accept a rare deployment inconvenience than to give up a genuine guarantee on the supply chain.</div>

## Distributing a model once, or handling every request on a server

The economics of on-device inference are simple, but counter-intuitive. A server carries a cost on every analysis, with no limit in time. The device downloads the model once, then reuses it indefinitely. The more a user comes back, the more favourable that trade-off becomes.

```js
const users = view(Inputs.range([100, 500000], {value: 25000, step: 100, label: "Distinct devices"}));
const analysesPerUser = view(Inputs.range([1, 60], {value: 6, step: 1, label: "Analyses per device, lifetime"}));
const requestKiB = view(Inputs.range([4, 2048], {value: 512, step: 4, label: "Bytes per server round trip (KiB)"}));
const serverMs = view(Inputs.range([5, 3000], {value: 400, step: 5, label: "Server compute per analysis (ms)"}));
```

```js
const modelMiB = (artifacts
  .filter((a) => a.fetched === "every analysis")
  .reduce((s, a) => s + a.bytes, 0)) / MIB;
const del = delivery({
  users, analysesPerUser, modelMiB,
  requestKiB, serverMs,
  egressPerGiB: 0.09, perCpuHour: 0.04
});
const sweep = d3.range(1, 61).map((n) => {
  const d = delivery({users, analysesPerUser: n, modelMiB, requestKiB, serverMs, egressPerGiB: 0.09, perCpuHour: 0.04});
  return [{analyses: n, cost: d.onDeviceCost, policy: "Ship the model"}, {analyses: n, cost: d.serverCost, policy: "Answer on a server"}];
}).flat();
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Ship the model</h2><span class="big">${del.onDeviceCost.toFixed(0)}</span><span class="muted">${fmtMiB(modelMiB * MIB)} once per device</span></div>
  <div class="card"><h2>Answer on a server</h2><span class="big">${del.serverCost.toFixed(0)}</span><span class="muted">${fmtInt(del.analyses)} analyses · ${del.serverHours.toFixed(1)} compute hours</span></div>
  <div class="card"><h2>Crossover</h2><span class="big">${del.breakEven < 1 ? "<1" : fmtInt(del.breakEven)}</span><span class="muted">analyses per device where the two are equal</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 76,
  x: {label: "Analyses per device →", grid: true},
  y: {label: "↑ Cost (arbitrary currency units)", grid: true, zero: true},
  color: {legend: true, domain: ["Ship the model", "Answer on a server"]},
  marks: [
    Plot.lineY(sweep, {x: "analyses", y: "cost", stroke: "policy", strokeWidth: 2}),
    Plot.ruleX([analysesPerUser], {stroke: "#b0501a", strokeDasharray: "4,4"}),
    Plot.tip(sweep, Plot.pointerX({x: "analyses", y: "cost", stroke: "policy",
      title: (d) => `${d.policy}\n${d.analyses} per device\n${d.cost.toFixed(0)} units`}))
  ]
}))
```

<div class="modelled">In this figure, only the size of the model payload is measured. The number of devices, the number of analyses per device, the size of a network round trip, server compute time and the two unit prices are all parameters you can set on this page. The currency is deliberately left abstract. The figure does not claim to price anything real: it shows the shape of the problem, with one strategy whose cost stays flat as the number of analyses grows, and another whose cost grows with that usage.</div>

The economic argument is not what drove the architecture — the confidentiality of the data is what matters most here. It is still useful to note that the option which protects privacy best is not the most expensive one either, at any plausible level of usage.

## A door subject to consent

A study that presented only the favourable aspects would be closer to advertising than to analysis. Here is what qualifies the title of this page.

The deployed code contains a second digitisation route, which sends the screenshot to a server. An endpoint then relays the image to a general-purpose vision model, while the API key stays secret inside the worker and is never exposed to the browser. That route exists because a general vision model interprets unfamiliar layouts better than a pipeline of nine hand-tuned stages.

It is protected at three levels, and those protections are covered by unit tests.

<div class="verified">The router refuses any use of the cloud route unless a deployment flag is enabled <em>and</em> the user has given explicit consent, stored locally. When both conditions hold, a configurable share of requests (0.9 by default) is sent to the cloud, while the others stay local. Any error on the cloud route triggers a fallback to the device, so the user still gets a result. The consent checkbox states, in both languages, that the image leaves the device during the analysis and that, without agreement, it stays entirely local. Five tests cover the decision function, including the two refusal cases.</div>

## What we would do next

<div class="proposed">In order: get the corpus of real screenshots reviewed and labelled, because four images checked by hand is currently the project's most fragile evidence, even though the tooling needed already exists. Stop publishing the 18 MiB of a model that is never loaded (obsolete). Make any checksum divergence blocking. Adapt the privacy wording to the consent actually given.</div>

None of that calls the architecture into question, and that is exactly the point. The interesting claim of this project is not that its models perform well. It is that a machine-learning product handling sensitive health data can be designed so that this data has, by default, nowhere to go.

---

<style>
.hero { text-align: center; margin: 2rem 0 2rem; }
.hero h1 { font-size: clamp(2.2rem, 6.4vw, 4rem); line-height: 1.04; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #2f6bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.3rem); font-weight: 400; max-width: 44rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.card .big { display: block; font-size: 1.9rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.card .muted, .muted { color: var(--theme-foreground-muted); }
.card h2 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin: 0 0 0.35rem; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
</style>
