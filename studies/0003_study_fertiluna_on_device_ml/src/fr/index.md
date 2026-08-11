---
title: "IA embarquée : assez petit pour tenir dans un onglet"
toc: false
---

```js
import {
  MIB, collapse, worstConfusions, exportSize, payload, delivery
} from "../components/cycle.js";
const artifacts = await FileAttachment("../data/artifacts.csv").csv({typed: true});
const classes = await FileAttachment("../data/classes.csv").csv({typed: true});
const confusion = await FileAttachment("../data/confusion.csv").csv({typed: true});
const exports_ = await FileAttachment("../data/export_size.csv").csv({typed: true});
const perception = await FileAttachment("../data/perception.csv").csv({typed: true});
const cvStatus = await FileAttachment("../data/cv_status.csv").csv({typed: true});
const visionHistory = await FileAttachment("../data/vision_history.csv").csv({typed: true});
const cover = FileAttachment("../cover.svg");
```

```js
const nf = (n, d = 0) =>
  new Intl.NumberFormat("fr-FR", {minimumFractionDigits: d, maximumFractionDigits: d}).format(n);
const pct = (x, d = 1) =>
  new Intl.NumberFormat("fr-FR", {style: "percent", minimumFractionDigits: d, maximumFractionDigits: d}).format(x);
const mio = (bytes) => `${nf(bytes / MIB, bytes / MIB >= 100 ? 0 : 2)} Mio`;
const dur = (s) =>
  !Number.isFinite(s) ? "∞"
  : s < 1 ? `${nf(s * 1000)} ms`
  : s < 90 ? `${nf(s, 1)} s`
  : s < 5400 ? `${nf(s / 60, 1)} min`
  : `${nf(s / 3600, 1)} h`;
```

```js
const LABELS = classes.map((c) => c.label);
const SHORT = new Map(classes.map((c) => [c.label, c.short_fr]));
const NAME = new Map(classes.map((c) => [c.label, c.label_fr]));
const prefit = exports_.find((d) => d.variant === "prefit");
const cv5 = exports_.find((d) => d.variant === "cv5");
```

<div class="hero">
  <h1>IA embarquée :<br>assez petit pour tenir dans un onglet</h1>
  <h2>Un outil de santé qui lit des courbes BBT ("Body Basal Temperature") sans inscription et sans upload de données. Tous les modèles tournent dans le navigateur.</h2>
</div>

<div class="client-strip">
  <div class="field"><span class="k">Secteur</span><span class="v">Santé, outil grand public</span></div>
  <div class="field"><span class="k">Marché</span><span class="v">Entire world</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">Site, outil d'analyse, pipeline d'entraînement</span></div>
  <div class="field"><span class="k">Client</span><span class="v">Nous-mêmes (open source)</span></div>
</div>

**FertiLuna** est notre propre outil, il est open source, et il est déjà nommé sur notre page d'accueil.

Le produit décrit ici fait partie d'une niche assez méconnue. Il s'agit des **méthodes symptothermiques** (méthode pour observer un cycle menstruel et la fertilité feminine). Le scénario de mesure est le suivant: une utilisatrice a une courbe de température basale, et éventuellement des valeurs de tests d'ovulation. Elle saisie ces données à la main, ou les capture depuis une autre application. L'outil la lit, classe le cycle, et l'explique en langage clair.

L'intérêt de cette outil n'est pas tant le modèle qu'il exploite mais c'est plutôt sa contrainte : **ce sont des données de santé, catégorie particulière, donc elles ne doivent jamais quitter l'appareil.** Il n'y a pas de compte, pas d'upload, pas de stockage serveur. Cette seule décision réordonne toutes les décisions d'apprentissage en aval: quel estimateur devons-nous choisir, comment le calibrer, quelle poids maximum peut-il faire ?

## Explication de la contrainte

Le squelette de page est rendu côté serveur (SSR), principalement pour un but de référencement efficace. Tout le reste se passe sur l'appareil de l'utilisateur. Ainsi, l'extraction des caractéristiques, le classifieur, la détection d'atypie, la lecture de la courbe, l'historique des analyses passées est entièrement exécuté dans le navigateur. La seule chose qui traverse le réseau est le fichier de poids du modèle, sans aucune donnée personnelle.

<svg class="schematic" viewBox="0 0 1000 300" role="img" aria-label="Les fichiers de modèle entrent dans l'appareil ; les données de cycle n'en sortent jamais">
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
      <text x="92" y="126">worker edge</text><text x="92" y="146" opacity="0.7" font-size="11">page + assets</text>
      <text x="394" y="126">IndexedDB</text><text x="394" y="146" opacity="0.7" font-size="11">modèles, par version</text>
      <text x="592" y="126">runtime WASM</text><text x="592" y="146" opacity="0.7" font-size="11">ONNX Runtime Web</text>
      <text x="790" y="126">la courbe</text><text x="790" y="146" opacity="0.7" font-size="11">saisie ou capturée</text>
      <text x="636" y="60" opacity="0.75" font-size="11.5">l'appareil (périmètre de confidentialité)</text>
      <text x="636" y="244" opacity="0.75" font-size="11.5">aucune requête ne porte une température, une date ou un identifiant</text>
    </g>
    <g stroke="currentColor" stroke-width="1.6" fill="none" marker-end="url(#a1)">
      <path d="M176 132 H313"/>
      <path d="M470 132 H511"/>
      <path d="M714 132 H673" />
    </g>
  </g>
</svg>
<div class="schematic-caption">L'outil fonctionne comme une boîte noire locale.</div>

<div class="verified">L'application Astro est déployée comme worker Cloudflare, avec rendu serveur pour le squelette de page uniquement. Toute l'inférence est créée et exécutée côté client sous <span class="kv">onnxruntime-web/wasm</span> avec <span class="kv">numThreads = 1</span> et SIMD activé (mono-thread activé volontairement car un WASM multi-thread exigerait les headers d'isolation d'origine). Le binaire du runtime est émis par le bundler et servi depuis la même origine. Aucun CDN n'intervient jusqu'à maintenant. Les octets de modèle sont récupérés une fois puis stockés dans IndexedDB via Dexie, sous la clé <span class="kv">version:fichier</span>, et vérifiés contre le SHA-256 du manifeste.</div>

## Ce qui traverse le réseau... une fois

Voici la totalité du téléchargement:

```js
const artifactRows = artifacts.map((a) => ({
  Artefact: a.name,
  Fichier: a.file,
  Taille: mio(a.bytes),
  Octets: nf(a.bytes),
  "Téléchargé": a.fetched_fr,
  Rôle: a.role_fr ?? a.role
}));
display(Inputs.table(artifactRows, {
  columns: ["Artefact", "Fichier", "Taille", "Octets", "Téléchargé", "Rôle"],
  width: {Artefact: 165, Fichier: 205, Téléchargé: 140, Rôle: 250},
  rows: 6,
  sort: null
}));
```

**Le runtime est plus gros que le modèle.** Le binaire WASM d'ONNX Runtime Web est le plus gros fichier qu'une première visite télécharge (plus gros que le classifieur et le détecteur d'atypie réunis).

**Un artefact est disponible et jamais utilisé.** Le CNN de lecture de courbe est dans le répertoire d'assets déployé mais il n'est pas utilisé, et il est publiquement téléchargeable aujourd'hui. C'est le plus gros fichier de modèle du projet. Nous reviendrons plus bas sur pourquoi il existe (et pourquoi nous avons décidé de le laisser).

```js
const mbps = view(Inputs.range([1, 200], {value: 25, step: 1, label: "Débit de téléchargement (Mbit/s)"}));
const visits = view(Inputs.range([1, 40], {value: 8, step: 1, label: "Sessions sur le même appareil"}));
const withImport = view(Inputs.toggle({label: "L'utilisatrice importe une capture", value: true}));
const includeDead = view(Inputs.toggle({label: "Compter le modèle que rien ne charge", value: false}));
```

```js
const pay = payload({artifacts, withImport, includeDeadWeight: includeDead, mbps, visits});
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Première session</h2><span class="big">${mio(pay.coldBytes)}</span><span class="muted">${dur(pay.coldSeconds)} à ${mbps} Mbit/s</span></div>
  <div class="card"><h2>Toutes les suivantes</h2><span class="big">0 Mio</span><span class="muted">cache touché sur <span class="kv">version:fichier</span></span></div>
  <div class="card"><h2>Non retéléchargé sur ${visits} sessions</h2><span class="big">${mio(pay.savedBytes)}</span><span class="muted">par rapport à un fetch systématique</span></div>
</div>

## Décision 1 : faire tenir la calibration dans un téléchargement

Le résultat le plus importante de l'outil n'est pas un label : c'est sa capacité à refuser de conclure. Lorsque la probabilité maximale est inférieure à **0,60**, la prédiction est remplacée par *données insuffisantes*, quelle que soit la classe choisie par l'argmax.

Cette règle n'est défendable que si les probabilités sont bien calibrées. Or, les probabilités brutes d'une random forest le sont rarement : elles se concentrent souvent près de 0 ou de 1, ce qui rend arbitraire l'application d'un seuil fixe. La calibration de Platt apporte une réponse à ce problème. L'approche la plus directe consiste à utiliser `CalibratedClassifierCV(cv=5)` de scikit-learn, qui entraîne cinq random forest distinctes et les conserve toutes dans le modèle final. Ces cinq ensembles se retrouvent alors dans le graphe ONNX exporté.

Le projet adopte une autre stratégie : entraîner **une seule** forêt sur un jeu d'ajustement, la figer, puis effectuer la calibration sur un dataset distinct. Le graphe exporté ne contient donc qu'un seul ensemble d'arbres.

<div class="verified">Le classifieur est une random forest de 120 arbres, de profondeur maximale 12, avec au moins 12 échantillons par feuille, un sous-échantillonnage <span class="kv">sqrt</span> des variables et des poids de classes équilibrés. Il est entraîné sur 32 000 des 50 000 cycles synthétiques, calibré par Platt sur 8 000 cycles réservés, puis évalué sur les 10 000 cycles restants, jamais vus durant l'entraînement. L'export est figé à l'opset 17 et à <span class="kv">ai.onnx.ml</span> 3, soit la limite prise en charge par ONNX Runtime Web.</div>

Mais quel gain cette décision représente-t-elle réellement ?

```js
const measuredRows = exports_.map((d) => ({
  Variante: d.label_fr,
  "Ensembles dans le graphe": nf(d.ensembles),
  Arbres: nf(d.trees),
  "Nœuds d'arbre": nf(d.nodes),
  "Taille ONNX": mio(d.bytes),
  Exactitude: nf(d.accuracy, 4),
  "Log loss": nf(d.log_loss, 4)
}));
display(Inputs.table(measuredRows, {
  columns: ["Variante", "Ensembles dans le graphe", "Arbres", "Nœuds d'arbre", "Taille ONNX", "Exactitude", "Log loss"],
  width: {Variante: 240, "Ensembles dans le graphe": 175, Arbres: 80, "Nœuds d'arbre": 110, "Taille ONNX": 105, Exactitude: 100, "Log loss": 95},
  rows: 2,
  sort: null
}));
```

<div class="verified">L'export à un seul ensemble reproduit le fichier livré <em>octet pour octet</em> : ${nf(prefit.bytes)} octets, une exactitude de ${nf(prefit.accuracy, 4)} et une log loss de ${nf(prefit.log_loss, 5)}. C'est un signal rassurant : l'artefact publié est bien issu du pipeline versionné. L'export à cinq ensembles pèse ${nf(cv5.bytes)} octets.</div>

L'arbitrage réel est donc le suivant :

- Un téléchargement **${nf(cv5.bytes / prefit.bytes, 2)} fois** plus lourd et **${nf(cv5.nodes / prefit.nodes, 1)} fois** plus de nœuds à évaluer sur un téléphone
- Pour un gain de **${nf((cv5.accuracy - prefit.accuracy) * 100, 2)} point d'exactitude** et une diminution de la log loss de ${nf(prefit.log_loss - cv5.log_loss, 4)}.

```js
const folds = view(Inputs.range([1, 10], {value: 1, step: 1, label: "Ensembles gardés dans le graphe exporté"}));
const linkMbps = view(Inputs.range([1, 200], {value: 25, step: 1, label: "Débit de téléchargement (Mbit/s)"}));
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
  <div class="card"><h2>Graphe du classifieur</h2><span class="big">${mio(sizeNow.modelBytes)}</span><span class="muted">${sizeNow.measured ? "mesuré" : "interpolé"}</span></div>
  <div class="card"><h2>Avec le détecteur d'atypie</h2><span class="big">${mio(sizeNow.totalBytes)}</span><span class="muted">les deux modèles tabulaires</span></div>
  <div class="card"><h2>Temps de récupération</h2><span class="big">${dur(sizeNow.seconds)}</span><span class="muted">à ${linkMbps} Mbit/s</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 70,
  x: {label: "Ensembles d'arbres dans le graphe exporté →", grid: true, tickFormat: "d"},
  y: {label: "↑ Taille ONNX (Mio)", grid: true, zero: true},
  marks: [
    Plot.areaY(sizeCurve, {x: "folds", y: (d) => d.totalBytes / MIB, fillOpacity: 0.1}),
    Plot.lineY(sizeCurve, {x: "folds", y: (d) => d.totalBytes / MIB, strokeWidth: 2}),
    Plot.dot(exports_, {x: "ensembles", y: (d) => (d.bytes + companionBytes) / MIB, r: 6, fill: "#2f8f5b"}),
    Plot.text(exports_, {x: "ensembles", y: (d) => (d.bytes + companionBytes) / MIB, text: () => "mesuré", dy: -14, dx: 8, textAnchor: "start", fill: "#2f8f5b", fontWeight: 700}),
    Plot.ruleX([folds], {stroke: "#b0501a", strokeDasharray: "4,4"}),
    Plot.tip(sizeCurve, Plot.pointerX({x: "folds", y: (d) => d.totalBytes / MIB,
      title: (d) => `${d.folds} ensemble${d.folds > 1 ? "s" : ""}\n${mio(d.totalBytes)}\n${dur(d.seconds)}`}))
  ]
}))
```

<div class="modelled">Deux points de cette courbe ont été mesurés. Toutes les valeurs intermédiaires, ainsi que celles situées au-delà, reposent sur une interpolation linéaire entre ces deux mesures. L'approximation est raisonnable dans ce cas : chaque ensemble d'arbres se sérialise dans un volume d'octets comparable. Néanmoins, neuf des dix points affichés n'ont pas fait l'objet d'un export ni d'une mesure directe.</div>

## Décision 2 : un système autorisé à dire « je ne sais pas »

Le classifieur atteint **88,56 %** d'exactitude sur les 10 000 cycles synthétiques du jeu de test, avec une log loss de **0,329**. Pris isolément, ce chiffre est peu informatif : les cinq classes ne sont pas équivalentes du point de vue clinique. Deux d'entre elles correspondent à des situations voisines sur un même continuum, et les confondre n'a pas la même gravité que confondre une absence d'ovulation avec une ovulation confirmée.

La bonne question est donc de savoir *où* se concentrent les erreurs. Regroupez les labels ci-dessous pour observer comment évolue l'exactitude selon la lecture retenue.

```js
const groupMode = view(Inputs.radio(
  new Map([
    ["Cinq classes, comme à l'entraînement", "none"],
    ["Confirmée + douteuse ensemble", "conf_doubt"],
    ["Douteuse + lutéale courte ensemble", "doubt_short"],
    ["Un signe d'ovulation, ou aucun", "signal"]
  ]),
  {value: "none", label: "Lire les étiquettes comme"}
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
  <div class="card"><h2>Exactitude ainsi lue</h2><span class="big">${pct(col.accuracy, 2)}</span><span class="muted">${col.size} classes · ${nf(col.total)} cycles de test</span></div>
  <div class="card"><h2>Face aux cinq classes</h2><span class="big" style="color:${col.accuracy > base.accuracy ? "#2f8f5b" : "inherit"}">${col.accuracy > base.accuracy ? "+" : ""}${nf((col.accuracy - base.accuracy) * 100, 2)} pt</span><span class="muted">mêmes prédictions, question plus grossière</span></div>
  <div class="card"><h2>Plus grosse confusion</h2><span class="big" style="font-size:1.15rem">${NAME.get(worst[0].truth)} → ${NAME.get(worst[0].predicted)}</span><span class="muted">${nf(worst[0].n)} cycles · ${pct(worst[0].share_of_truth)} de cette classe</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 340,
  marginLeft: 108,
  marginBottom: 84,
  padding: 0,
  x: {label: "Prédit →", domain: classes.map((c) => c.short_fr), tickRotate: -28},
  y: {label: "↑ Réel", domain: classes.map((c) => c.short_fr)},
  color: {scheme: "blues", legend: true, label: "Cycles de test"},
  marks: [
    Plot.cell(cells, {x: "predicted", y: "truth", fill: "n", inset: 0.5}),
    Plot.text(cells, {x: "predicted", y: "truth", text: (d) => nf(d.n),
      fill: (d) => (d.n > 2200 ? "white" : "black"), fontSize: 11}),
    Plot.tip(cells, Plot.pointer({x: "predicted", y: "truth",
      title: (d) => `réel ${d.truth} → prédit ${d.predicted}\n${nf(d.n)} cycles\n${pct(d.share)} de la classe réelle`}))
  ]
}))
```

<div class="verified">Les effectifs affichés dans cette figure sont lus dans <span class="kv">model/artifacts/metrics-v1.json</span>. Le contrôle de regroupement ne fait que réagréger ces mêmes effectifs : il ne réexécute aucun modèle et ne réestime aucune métrique.</div>

La structure des erreurs est ici plus révélatrice que leur nombre. La confusion la plus fréquente consiste à interpréter une ovulation confirmée comme une phase lutéale courte. Les deux suivantes correspondent aux deux sens de la confusion entre ovulation douteuse et anovulation. Presque aucun cycle ne passe directement de *confirmée* à *absence d'ovulation* : aucun dans un sens et deux dans l'autre, sur dix mille observations. Les erreurs du modèle se concentrent donc précisément dans les zones où l'interprétation clinique est elle-même incertaine.

```js
resize((width) => Plot.plot({
  width,
  height: 360,
  marginLeft: 92,
  marginRight: 145,
  x: {domain: [0, 1], grid: true, tickFormat: "%", label: "Score →"},
  y: {label: null, domain: ["Précision", "Rappel", "F1"]},
  fy: {label: null, domain: classes.map((c) => c.short_fr)},
  color: {domain: ["Précision", "Rappel", "F1"]},
  marks: [
    Plot.barX(classes.flatMap((c) => [
      {label: c.short_fr, metric: "Précision", v: c.precision},
      {label: c.short_fr, metric: "Rappel", v: c.recall},
      {label: c.short_fr, metric: "F1", v: c.f1}
    ]), {fy: "label", y: "metric", x: "v", fill: "metric", inset: 1}),
    Plot.text(classes.flatMap((c) => [
      {label: c.short_fr, metric: "Précision", v: c.precision},
      {label: c.short_fr, metric: "Rappel", v: c.recall},
      {label: c.short_fr, metric: "F1", v: c.f1}
    ]), {fy: "label", y: "metric", x: "v", text: (d) => pct(d.v, 1), dx: 6, textAnchor: "start", fontSize: 10}),
    Plot.ruleX([0])
  ]
}))
```

Deux mécanismes transforment cette ambiguïté en comportement exploitable.

<div class="verified">Lorsque la probabilité maximale calibrée est inférieure à 0,60, le label est remplacée par <em>données insuffisantes</em> : la zone d'incertitude est explicitement signalée au lieu d'être masquée par une conclusion forcée. En parallèle, une random forest d'isolation de 150 estimateurs, avec une contamination de 0,10, mesure l'éloignement d'une courbe par rapport à la distribution d'entraînement. Le manifeste exporté contient les 5<sup>e</sup>, 50<sup>e</sup> et 95<sup>e</sup> centiles de sa fonction de décision sur le jeu d'entraînement. Dans le navigateur, le score brut est projeté à partir de ces repères sur une échelle d'« étrangeté » de 0 à 100. Ce score est purement indicatif : il est affiché, mais ne peut jamais modifier le label prédit.</div>


## Décision 3 : entraîner un lecteur neuronal pour finir par livrer une méthode géométrique

La plupart des utilisatrices ne saisiront pas manuellement 35 températures. Elles importeront plutôt une capture d'écran depuis l'application qu'elles utilisent déjà (comme "Premom" par exemple). Lire cette image est un problème de perception visuelle, et le projet l'a résolu de deux manières.

**Voie A : celle qui obtient les meilleurs résultats.** Un petit réseau convolutif à convolutions séparables en profondeur, entraîné sur des courbes générées procéduralement : une tige de type *stem*, six blocs et trois têtes de décodage. Deux versions ont été entraînées. Dans la seconde, la tête de prédiction de valeur a été remplacée par un soft-argmax appliqué à chaque série sur la hauteur de l'image. La valeur est ainsi, par construction, liée à la position verticale de la courbe. C'est cette seconde version qui obtient les meilleurs résultats sur toutes les métriques.

**Voie B : celle effectivement déployée.** Un pipeline déterministe de vision classique en neuf étapes : segmentation des couleurs dans l'espace HSV à l'aide de bandes volontairement disjointes, détection de la zone du graphique, lecture des graduations par OCR, ajustement RANSAC d'une droite pour chaque colonne d'axe, récupération de la grille des jours à partir des dates, des lignes de grille ou du pas dominant détecté par autocorrélation, détection des marqueurs par échantillonnage annulaire, corrections de sécurité et contrôle qualité. Le seul composant appris est PaddleOCR, utilisé pour lire les chiffres situés dans les marges.

```js
const perceptionRows = perception.map((p) => ({
  Route: p.route_fr ?? p.route,
  Statut: p.status_fr,
  Paramètres: p.params ? nf(p.params) : "—",
  "Octets de modèle": p.bytes ? mio(p.bytes) : "—",
  "Évalué sur": p.eval_fr,
  "MAE valeur BBT": p.bbt_mae === "" || p.bbt_mae == null ? "—" : nf(p.bbt_mae, 4),
  "F1 présence BBT": p.bbt_f1 === "" || p.bbt_f1 == null ? "—" : nf(p.bbt_f1, 3)
}));
display(Inputs.table(perceptionRows, {
  columns: ["Route", "Statut", "Paramètres", "Octets de modèle", "Évalué sur", "MAE valeur BBT", "F1 présence BBT"],
  width: {Route: 150, Statut: 150, Paramètres: 90, "Octets de modèle": 100, "Évalué sur": 165, "MAE valeur BBT": 100, "F1 présence BBT": 100},
  rows: 4,
  sort: null
}));
```

Une lecture honnête du tableau est rend la situation inconfortable : **la voie déployée obtient des résultats nettement moins bons que celle qui ne l'est pas.** Sur le jeu synthétique de contrôle, le pipeline en production atteint une erreur absolue moyenne de 0,109 de l'étendue de l'axe de température et un F1 de présence de 0,692, contre 0,022 et 0,934 pour le réseau neuronal jamais déployé.

<div class="verified">Les résultats du réseau proviennent des manifestes d'entraînement versionnés : 4 729 540 paramètres pour la v1 et 4 133 574 pour la v2. Les résultats du pipeline déployé proviennent de l'exécution du garde-fou <span class="kv">eval_vision_cv</span> avec ses paramètres par défaut (40 courbes générées, graine 7). Il respecte ses propres seuils, avec F1 ≥ 0,55 et MAE ≤ 0,16. La série LH est, elle aussi, suivie, mais avec des résultats plus faibles.</div>

<div class="modelled">Cette comparaison ne met pas les deux approches sur un pied d'égalité, et cette page ne doit pas prétendre le contraire. Le réseau est évalué sur des échantillons réservés issus <em>du générateur même qui a servi à l'entraîner</em>. Le pipeline déterministe est évalué sur la sortie de ce même générateur, alors qu'il est conçu pour traiter les captures d'écran réelles d'une application. Le générateur ne fait qu'approcher cette distribution réelle et produit, à cette résolution, des étiquettes d'axe difficiles à lire par OCR. Aucun de ces deux résultats ne prédit directement la qualité sur une capture fournie par une utilisatrice. La seule preuve sur ce terrain repose sur quatre captures réelles, examinées manuellement.</div>

Pourquoi, dès lors, déployer la voie qui obtient le score le plus faible ? Quatre raisons l'expliquent, dont la dernière est déterminante.

1. **Elle est auditable.** Chaque décision repose sur une constante identifiable : plage HSV, seuil de couverture, tolérance RANSAC. Lorsqu'elle échoue sur une courbe, il est possible d'identifier l'étape responsable. A entrée identique, elle produit toujours la même sortie.
2. **Elle extrait davantage que la courbe.** Son raisonnement géométrique permet aussi de récupérer les *valeurs* des graduations, la grille des jours, les marqueurs et le tableau calendaire situé sous le graphique. Le réseau ne restitue que deux séries et une unité. Obtenir le tableau nécessiterait un second modèle.
3. **Elle ne dépend pas d'un pont entre simulation et réalité.** Le pipeline lit la capture originale. Le réseau lit une image synthétique qui imite une capture, ce qui impose de maîtriser l'écart entre ces deux distributions.
4. **Elle sait signaler ses échecs.** C'est l'argument décisif.

```js
resize((width) => Plot.plot({
  width,
  height: 150,
  marginLeft: 140,
  marginRight: 40,
  x: {label: "Courbes sur 40 →", grid: true},
  y: {label: null, domain: cvStatus.map((s) => s.label_fr)},
  marks: [
    Plot.barX(cvStatus, {y: "label_fr", x: "n", fill: (d) => d.status === "extracted" ? "#2f8f5b" : d.status === "low_confidence" ? "#b07d17" : "#b0501a"}),
    Plot.text(cvStatus, {y: "label_fr", x: "n", text: (d) => nf(d.n), dx: 10, textAnchor: "start"}),
    Plot.ruleX([0])
  ]
}))
```

Sur cette même série de 40 courbes, seules 4 ont été extraites proprement. 31 ont été signalées avec une **confiance faible**, et 5 ont été rejetées immédiatement comme **n'étant pas des courbes**. Un indice de confiance est calculé à chaque étape. La lecture fiable de l'axe de température constitue une condition bloquante. Sans axe correctement identifié, les valeurs ne peuvent pas être calibrées et le système ne peut pas prétendre avoir extrait la courbe.

Pour un outil susceptible d'éclairer des décisions liées à la fertilité, la différence entre « faux » et « faux, mais signalé comme tel » est fondamentale. La détection de l'unité illustre ce point : sur les quatre courbes qui franchissent la porte de qualité, elle est correcte quatre fois sur quatre. Sur l'ensemble des 40 courbes, elle ne l'est que dans 52,5 % des cas. Sans axe lu de manière fiable, l'unité revient à une valeur par défaut et le résultat est déjà marqué comme peu fiable.

<div class="verified">La preuve obtenue sur des images réelles reste limitée (et il faut l'assumer). Le pipeline Python de référence a été exécuté sur quatre captures d'écran réelles issues d'une même application. Elles couvrent deux langues d'interface (français et allemand), les deux unités de température, des courbes clairsemées comme denses et les deux sources possibles de ligne LH. L'unité a été correctement identifiée dans les quatre cas, de même que la source LH. Les deux courbes d'environ 42 jours ont été correctement signalées comme tronquées par la fenêtre de 35 jours. Les fichiers de labels du corpus indiquent encore <span class="kv">reviewed: false</span> : ils ont été initialisés à partir de la sortie du pipeline et n'ont pas encore été corrigés. Il s'agit donc d'un constat qualitatif vérifié à la main, non d'un résultat évalué automatiquement. Le dépôt vise environ 50 captures relues.</div>

<div class="verified">Les valeurs extraites ne sont jamais imposées à l'utilisatrice. Quelle que soit la méthode employée pour lire la courbe, les nombres sont placés dans un tableau modifiable qu'elle peut contrôler avant toute classification. Les jours interpolés sont enregistrés dans un masque strictement distinct du masque « mesuré » : une valeur synthétisée ne peut donc jamais être présentée comme une observation réelle.</div>

Les résultats du réseau neuronal étaient pourtant bien réels, ce qui fait de ce choix une décision assumée plutôt qu'un compromis par défaut :

```js
const F1_SCALE = 0.09;
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 66,
  marginRight: 82,
  x: {label: "Époque d'entraînement →", grid: true, tickFormat: "d"},
  y: {label: "↑ MAE de validation (part de l'étendue d'axe)", grid: true, zero: true},
  color: {legend: true, domain: ["MAE de validation", "F1 de présence"]},
  marks: [
    Plot.axisY([0.6, 0.7, 0.8, 0.9, 1.0].map((f) => f * F1_SCALE), {
      anchor: "right", label: "F1 de présence →", tickFormat: (d) => nf(d / F1_SCALE, 1)
    }),
    Plot.lineY(visionHistory, {x: "epoch", y: "val_mae_present", stroke: () => "MAE de validation", strokeWidth: 2}),
    Plot.lineY(visionHistory, {x: "epoch", y: (d) => d.val_presence_f1 * F1_SCALE, stroke: () => "F1 de présence", strokeWidth: 2, strokeDasharray: "5,4"}),
    Plot.tip(visionHistory, Plot.pointerX({x: "epoch", y: "val_mae_present",
      title: (d) => `époque ${d.epoch}\nMAE ${nf(d.val_mae_present, 4)}\nF1 de présence ${nf(d.val_presence_f1, 3)}`})),
    Plot.ruleY([0])
  ]
}))
```

<div class="verified">Quinze epoch, relevées dans le manifeste d'entraînement versionné du premier modèle de vision : la MAE de validation passe de 0,0838 à 0,0238 et le F1 de présence de 0,717 à 0,943. Les deux séries sont représentées sur deux axes : MAE à gauche, F1 à droite. C'est le modèle qui n'a finalement pas été déployé.</div>

## Ce qui rend l'inférence embarquée fiable

L'extraction de caractéristiques existe sous deux implémentations : en Python, où le modèle est entraîné, et en TypeScript, où il est exécuté. Si ces deux implémentations divergent, le modèle reçoit des données différentes de celles qu'il a vues pendant son entraînement, sans qu'aucun symptôme ne soit nécessairement visible.

<div class="verified">L'implémentation Python produit 15 cycles de référence (trois par archétype) accompagnés chacun d'un vecteur de 30 dimensions calculé. Le test TypeScript charge ces fixtures et impose une égalité caractéristique par caractéristique, à une tolérance de <span class="kv">1e-4 + 1e-4·|attendu|</span>. L'étape d'export vérifie séparément que scikit-learn et ONNX Runtime produisent les mêmes probabilités à 1e-3 près, puis consigne les écarts mesurés dans le manifeste : 1,19e-07 pour le classifieur et 8,20e-08 pour la random forest d'isolation. La suite navigateur versionnée comprend 53 tests répartis dans 7 fichiers. La CI exécute le contrôle de types, ces tests et le build avant tout déploiement.</div>

Une partie du portage ne bénéficie pas encore de ce même contrat. Le pipeline de vision classique a été transposé étape par étape de Python vers TypeScript, notamment par la réimplémentation, en TypeScript pur, du labelling des composantes connexes et de la dilatation. C'est la raison pour laquelle le bundle navigateur n'a besoin d'aucun build OpenCV.

## Le cache est aussi le mécanisme de livraison

Rien de ce mécanisme n'est exotique, et c'est précisément sa force. La couche IndexedDB joue le rôle d'un petit gestionnaire de paquets. C'est elle qui évite l'appel réseau à la deuxième visite et qui permet à l'outil de fonctionner hors ligne.

<div class="verified">Chaque blob est indexé sous la clé <span class="kv">version:fichier</span> et contrôlé à l'aide d'un SHA-256 du manifeste. Lorsqu'une entrée en cache ne correspond plus à sa checksum, elle est supprimée puis téléchargée de nouveau. Après un téléchargement réussi, les autres versions du même fichier sont purgées afin de limiter l'espace occupé. Les téléchargements sont diffusés en flux avec affichage de leur progression. Si IndexedDB n'est pas disponible, par exemple en navigation privée ou en cas de quota atteint, le code utilise un simple téléchargement réseau au lieu d'échouer.</div>

Un compromis volontaire doit toutefois être explicité. Si la checksum d'un fichier fraîchement téléchargé ne correspond pas à celle du manifeste, les octets sont malgré tout transmis à l'appelant. Ils sont seulement exclus du cache. Un modèle réexporté alors que le manifeste est déjà mis à jour ne doit pas rendre l'outil inutilisable. En pratique, cela signifie que le contrôle d'intégrité n'empêche pas encore l'exécution d'un modèle non conforme.

<div class="proposed">Rendre cette divergence bloquante pour les modèles : refuser les octets, afficher une erreur compréhensible et faire du changement de version le seul moyen d'introduire un nouvel artefact. Pour des données de santé, il est préférable d'accepter une gêne rare au déploiement plutôt que de renoncer à une véritable garantie sur la chaîne d'approvisionnement.</div>

## Distribuer un modèle une fois, ou traiter chaque requête sur un serveur

L'économie de l'inférence embarquée est simple, mais contre-intuitive. Un serveur supporte un coût à chaque analyse, sans limite dans le temps. L'appareil télécharge le modèle une seule fois, puis le réutilise indéfiniment. Plus une utilisatrice revient, plus cet arbitrage devient favorable.

```js
const users = view(Inputs.range([100, 500000], {value: 25000, step: 100, label: "Appareils distincts"}));
const analysesPerUser = view(Inputs.range([1, 60], {value: 6, step: 1, label: "Analyses par appareil, sur sa vie"}));
const requestKiB = view(Inputs.range([4, 2048], {value: 512, step: 4, label: "Octets par aller-retour serveur (Kio)"}));
const serverMs = view(Inputs.range([5, 3000], {value: 400, step: 5, label: "Calcul serveur par analyse (ms)"}));
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
  return [{analyses: n, cost: d.onDeviceCost, policy: "Livrer le modèle"}, {analyses: n, cost: d.serverCost, policy: "Répondre sur un serveur"}];
}).flat();
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Livrer le modèle</h2><span class="big">${nf(del.onDeviceCost)}</span><span class="muted">${mio(modelMiB * MIB)} une fois par appareil</span></div>
  <div class="card"><h2>Répondre sur un serveur</h2><span class="big">${nf(del.serverCost)}</span><span class="muted">${nf(del.analyses)} analyses · ${nf(del.serverHours, 1)} heures de calcul</span></div>
  <div class="card"><h2>Point de bascule</h2><span class="big">${del.breakEven < 1 ? "<1" : nf(del.breakEven)}</span><span class="muted">analyses par appareil où les deux s'égalisent</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 76,
  x: {label: "Analyses par appareil →", grid: true},
  y: {label: "↑ Coût (unités monétaires arbitraires)", grid: true, zero: true},
  color: {legend: true, domain: ["Livrer le modèle", "Répondre sur un serveur"]},
  marks: [
    Plot.lineY(sweep, {x: "analyses", y: "cost", stroke: "policy", strokeWidth: 2}),
    Plot.ruleX([analysesPerUser], {stroke: "#b0501a", strokeDasharray: "4,4"}),
    Plot.tip(sweep, Plot.pointerX({x: "analyses", y: "cost", stroke: "policy",
      title: (d) => `${d.policy}\n${d.analyses} par appareil\n${nf(d.cost)} unités`}))
  ]
}))
```

<div class="modelled">Dans cette figure, seule la taille de la charge utile du modèle est mesurée. Le nombre d'appareils, le nombre d'analyses par appareil, la taille d'un aller-retour réseau, le temps de calcul côté serveur et les deux prix unitaires sont des paramètres réglables dans cette page. La monnaie est volontairement laissée abstraite. La figure ne prétend pas chiffrer un coût réel : elle montre la forme du problème, avec une stratégie dont le coût reste plat quand le nombre d'analyses augmente, et une autre dont le coût croît avec cet usage.</div>

L'argument économique n'est pas à l'origine du choix d'architecture, c'est la confidentialité des données qui est le plus important. Il reste néanmoins utile de constater que l'option la plus protectrice de la vie privée n'est pas non plus la plus coûteuse, quel que soit le niveau d'usage plausible.

## Une porte soumise au consentement

Une étude qui ne présenterait que les aspects favorables relèverait davantage de la publicité que de l'analyse. Voici ce qui nuance le titre de cette page.

Le code déployé contient une seconde voie de numérisation, qui envoie la capture d'écran à un serveur. Un point d'entrée relaie alors l'image vers un modèle de vision généralisé, tandis que la clé d'API demeure secrète dans le worker et n'est jamais exposée au navigateur. Cette voie existe parce qu'un modèle de vision généraliste interprète mieux les mises en page inconnues qu'un pipeline de neuf étapes réglées manuellement.

Elle est protégée à trois niveaux, et ces protections font l'objet de tests unitaires.

<div class="verified">Le routeur refuse toute utilisation de la voie cloud tant qu'un deployment flag n'est pas activé <em>et</em> que l'utilisatrice n'a pas donné un consentement explicite, conservé localement. Lorsque ces deux conditions sont réunies, une part configurable des requêtes (0,9 par défaut) est envoyée vers le cloud, tandis que les autres restent traitées localement. Toute erreur sur la voie cloud entraîne un repli sur l'appareil, afin que l'utilisatrice obtienne tout de même un résultat. La case de consentement indique, dans les deux langues, que l'image quitte l'appareil pendant l'analyse et que, sans accord, celle-ci reste entièrement locale. Cinq tests couvrent la fonction de décision, y compris les deux cas de refus.</div>

## Ce que nous ferions ensuite

<div class="proposed">Dans l'ordre : faire relire et étiqueter le corpus de captures réelles, car quatre images vérifiées à la main constituent aujourd'hui la preuve la plus fragile du projet, même si l'outillage nécessaire existe déjà. Cesser de publier les 18 Mio d'un modèle qui n'est jamais chargé (obsolète). Rendre bloquante toute divergence de checksums. Adapter la formulation de confidentialité au consentement réel.</div>

Rien de cela ne remet en cause l'architecture, et c'est précisément l'essentiel. L'affirmation intéressante de ce projet n'est pas que ses modèles sont performants. C'est qu'un produit machine learning manipulant des données de santé sensibles peut être conçu de manière à ce que ces données n'aient, par défaut, aucun endroit où aller.

---

<style>
:root { --cb-verified: "Lu dans le code livré"; --cb-modelled: "Un modèle, pas une mesure"; --cb-proposed: "Proposé, pas déployé"; }
.hero { text-align: center; margin: 2rem 0 2rem; }
.hero h1 { font-size: clamp(2.2rem, 6.4vw, 4rem); line-height: 1.04; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #2f6bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.3rem); font-weight: 400; max-width: 44rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.card .big { display: block; font-size: 1.9rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.card .muted, .muted { color: var(--theme-foreground-muted); }
.card h2 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin: 0 0 0.35rem; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
</style>
