---
title: Le vrai coût de l'inférence LLM
toc: false
---

```js
import {fmtUSD, fmtInt, perMillion} from "../components/money.js";
const gpus = await FileAttachment("../data/gpus.csv").csv({typed: true});
const techniques = await FileAttachment("../data/techniques.csv").csv({typed: true});
// Référencé pour que la couverture soit livrée dans dist/ ; site-api la résout comme image de couverture de l'article.
const cover = FileAttachment("../cover.svg");
```

<div class="hero">
  <h1>Le vrai coût de<br>l'inférence LLM</h1>
  <h2>Servir un modèle est un problème de débit déguisé en problème de finance. Déplacez les curseurs : les chiffres sont les vôtres.</h2>
</div>

Chaque fonctionnalité d'IA qui part en production finit par se heurter au même mur : la facture GPU. L'entraînement fait les gros titres, mais pour tout ce qui tourne en production, **l'inférence est la ligne de dépense qui grandit avec le succès**. Plus vous gagnez d'utilisateurs, plus cela coûte cher, à moins que la stack de service ne soit pensée pour ça.

Le modèle ci-dessous est volontairement simple. Il ne capture pas toutes les subtilités du prefill face au decode ni le sharding en tensor-parallel, mais il capture la seule relation qui gouverne la facture :

<div class="formula">${tex.block`\text{coût par token} = \frac{\text{GPU \$ par heure}}{\text{tokens par seconde} \times 3600}`}</div>

Le débit est le dénominateur. **Tout ce que nous faisons en optimisation d'inférence est un combat pour faire grandir ce dénominateur** sans nuire à la qualité.

## Vos hypothèses de service

```js
const gpuCost = view(Inputs.range([0.4, 6], {value: 3.5, step: 0.05, label: "GPU $ / heure", format: (x) => fmtUSD(x)}));
const throughput = view(Inputs.range([100, 8000], {value: 2400, step: 50, label: "Débit de decode (tokens / sec)"}));
const promptTokens = view(Inputs.range([200, 100000], {value: 6000, step: 100, label: "Tokens de prompt / requête"}));
const outputTokens = view(Inputs.range([50, 4000], {value: 600, step: 25, label: "Tokens de sortie / requête"}));
const requestsPerDay = view(Inputs.range([1000, 5000000], {value: 250000, step: 1000, label: "Requêtes / jour"}));
```

```js
// Le prefill (lecture du prompt) coûte bien moins cher par token que le decode ;
// on l'approxime à 20 % du coût du decode pour que le chiffre par requête reste honnête.
const costPerToken = gpuCost / (throughput * 3600);
const costPerRequest = costPerToken * (outputTokens + promptTokens * 0.2);
const costPer1M = perMillion(gpuCost, throughput);
const monthly = costPerRequest * requestsPerDay * 30;
const annual = monthly * 12;
```

<div class="grid grid-cols-4">
  <div class="card"><h2>Coût / 1M tokens de sortie</h2><span class="big">${fmtUSD(costPer1M)}</span></div>
  <div class="card"><h2>Coût / requête</h2><span class="big">${fmtUSD(costPerRequest)}</span></div>
  <div class="card"><h2>Dépense mensuelle</h2><span class="big">${fmtUSD(monthly)}</span></div>
  <div class="card"><h2>Coût annuel</h2><span class="big">${fmtUSD(annual)}</span></div>
</div>

À **${fmtInt(requestsPerDay)} requêtes/jour**, cela représente un engagement de **${fmtUSD(annual)}/an**, un chiffre qui transforme un gain de débit de 2× en argent bien réel.

## Pourquoi le débit est le nerf de la guerre

Le coût par million de tokens s'effondre quand le débit augmente. La courbe est une hyperbole : les premières améliorations sont bon marché, et passé un certain point vous courez après des rendements décroissants, ce qui est précisément là où les kernels sur mesure et la stratégie de batching gagnent leur salaire.

```js
const throughputCurve = d3.range(200, 8001, 100).map((t) => ({t, cost: perMillion(gpuCost, t)}));
```

```js
resize((width) => Plot.plot({
  width,
  height: 340,
  marginLeft: 60,
  x: {label: "Débit (tokens / sec) →", grid: true},
  y: {label: "↑ $ / 1M tokens", grid: true, zero: true},
  marks: [
    Plot.areaY(throughputCurve, {x: "t", y: "cost", fillOpacity: 0.12, curve: "basis"}),
    Plot.lineY(throughputCurve, {x: "t", y: "cost", curve: "basis", strokeWidth: 2}),
    Plot.ruleX([throughput], {strokeOpacity: 0.4, strokeDasharray: "3,3"}),
    Plot.dot([{t: throughput, cost: costPer1M}], {x: "t", y: "cost", r: 6, fill: "currentColor"}),
    Plot.text([{t: throughput, cost: costPer1M}], {
      x: "t", y: "cost", text: (d) => `vous : ${fmtUSD(d.cost)}`,
      dy: -14, dx: 6, textAnchor: "start", fontWeight: 700
    })
  ]
}))
```

## Le coût croît linéairement avec le trafic

Une fois le coût par requête fixé par votre stack, la dépense mensuelle n'est qu'une droite passant par l'origine. La pente, c'est ce que vous avez la main pour concevoir.

```js
const trafficCurve = d3.range(0, requestsPerDay * 2 + 1, Math.max(1, Math.round(requestsPerDay / 60)))
  .map((r) => ({r, monthly: costPerRequest * r * 30}));
```

```js
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 72,
  x: {label: "Requêtes / jour →", grid: true, tickFormat: "~s"},
  y: {label: "↑ Dépense mensuelle", grid: true, tickFormat: (d) => fmtUSD(d)},
  marks: [
    Plot.lineY(trafficCurve, {x: "r", y: "monthly", strokeWidth: 2}),
    Plot.ruleX([requestsPerDay], {strokeOpacity: 0.4, strokeDasharray: "3,3"}),
    Plot.dot([{r: requestsPerDay, monthly}], {x: "r", y: "monthly", r: 6, fill: "currentColor"}),
    Plot.tip(trafficCurve, Plot.pointerX({x: "r", y: "monthly", title: (d) => `${fmtInt(d.r)} req/jour\n${fmtUSD(d.monthly)}/mois`}))
  ]
}))
```

## Tous les GPU ne se valent pas

Le GPU le moins cher à l'heure est rarement le moins cher au token. Débit et prix évoluent ensemble, mais pas proportionnellement. Voici une grille tarifaire *illustrative* pour un modèle de classe 7B ; le gagnant est celui qui minimise le **$ / 1M tokens**, pas le **$ / heure**.

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
    hourly_usd: "$ / h",
    tokens_per_sec: "tok / s",
    vram_gb: "VRAM (Go)",
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

## Où se cachent vraiment les économies

Il n'y a pas d'astuce unique. La vraie réduction de coût est un *empilement* de gains indépendants qui se multiplient. Choisissez les leviers que vous pouvez vous permettre d'actionner et observez l'effet composé sur votre facture actuelle.

```js
const chosen = view(Inputs.checkbox(
  techniques.map((t) => t.technique),
  {value: ["Continuous batching", "Quantization (INT8/FP8)"], label: "Techniques appliquées"}
));
```

```js
// On prend le milieu de la fourchette illustrative de chaque technique comme
// multiplicateur de débit/coût et on compose celles qui sont sélectionnées.
const factor = techniques
  .filter((t) => chosen.includes(t.technique))
  .reduce((acc, t) => acc * (1 + (t.low_pct + t.high_pct) / 2 / 100), 1);
const optimizedThroughput = throughput * factor;
const optimizedCostPer1M = perMillion(gpuCost, optimizedThroughput);
const optimizedMonthly = monthly / factor;
const saved = monthly - optimizedMonthly;
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Débit effectif</h2><span class="big">${fmtInt(optimizedThroughput)}</span><span class="muted">tokens / sec (${factor.toFixed(2)}×)</span></div>
  <div class="card"><h2>$ / 1M optimisé</h2><span class="big">${fmtUSD(optimizedCostPer1M)}</span></div>
  <div class="card"><h2>Économisé / mois</h2><span class="big" style="color:var(--theme-green,#3fb950)">${fmtUSD(saved)}</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 170,
  marginRight: 60,
  x: {label: "Amélioration illustrative (%) →", grid: true},
  y: {label: null, domain: techniques.map((t) => t.technique)},
  color: {legend: true, label: "Optimise"},
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

<div class="tip">Le continuous batching est volontairement exprimé comme un gain de débit (il peut largement dépasser 100 %). C'est presque toujours la première chose à corriger, car il ne présente aucun risque pour la qualité.</div>

## À retenir

Le coût d'inférence n'est pas un coût fixe inhérent au métier : c'est une **fonction de décisions d'ingénierie**, situées pour la plupart du côté du service. Les curseurs ci-dessus rendent le levier visible : une amélioration modeste du débit, composée à travers quelques techniques indépendantes, fait la différence entre une fonctionnalité d'IA qui se rentabilise et une autre qui grignote silencieusement votre marge.

Ce dénominateur, les tokens par seconde par dollar, est là où [Computeflux](https://computeflux.xyz) passe son temps : quantification et kernels sur mesure, batching et stratégie de cache, et le benchmarking rigoureux qui prouve qu'un changement a réellement aidé avant de le mettre en production.

---

<div class="small muted">Tous les chiffres de cette page sont illustratifs et pilotés entièrement par les entrées ci-dessus ; c'est un modèle pédagogique, pas un benchmark. Apportez vos propres mesures.</div>

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
