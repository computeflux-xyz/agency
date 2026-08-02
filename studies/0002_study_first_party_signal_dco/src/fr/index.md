---
title: "Edge e-commerce: signals first-party, sans tracker"
toc: false
---

```js
import {fmtInt, fmtPct, ladder, banditRace, shrinkage} from "../components/signal.js";
const signals = await FileAttachment("../data/signals.csv").csv({typed: true});
const slots = await FileAttachment("../data/slots.csv").csv({typed: true});
const cookie = await FileAttachment("../data/cookie.csv").csv({typed: true});
const cover = FileAttachment("../cover.svg");
```

<div class="hero">
  <h1>Edge e-commerce: Signals first-party,<br>sans tracker</h1>
  <h2>Partie 3 sur 3. Ce qu'une boutique edge sait déjà de son propre trafic, et comment en faire une newsletter qui s'assemble toute seule.</h2>
</div>

<div class="client-strip">
  <div class="field"><span class="k">Secteur</span><span class="v">Spiritueux de luxe, vente directe</span></div>
  <div class="field"><span class="k">Marché</span><span class="v">Afrique centrale (RDC)</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">Boutique · Back-office · Appli coursier · API</span></div>
  <div class="field"><span class="k">Cette partie</span><span class="v">La couche de données first-party</span></div>
</div>

La [partie 1](https://computeflux.xyz/studies/mobile-money-payment-processor) a construit un processeur de paiement pour un marché sans cartes. La [partie 2](https://computeflux.xyz/studies/edge-serving-layer) a transformé le catalogue en artefact versionné publié vers l'edge.

À elles deux, elles ont produit ce que peu de plateformes e-commerce obtiennent : **une infrastructure de données first-party réellement entre les mains de l'opérateur.**

## Trois conditions qui rendent tout cela possible

**L'opérateur exploite son propre serveur d'origine.** La boutique n'est pas un export statique derrière le CDN d'un tiers : c'est une application rendue côté serveur qui s'exécute sur un point de présence, sur le domaine de l'opérateur. Chaque requête traverse du code que l'opérateur a écrit lui-même. La boutique est une application Astro déployée comme worker edge.

**Chaque requête porte déjà des métadonnées dont la collecte n'a rien coûté.** L'edge termine le TLS, résout le réseau par lequel la requête est arrivée, sait quel point de présence l'a servie et a mesuré le temps d'aller-retour en le faisant. Rien de tout cela ne demande un script sur la page, une bannière de consentement ou un prestataire. C'est simplement le fonctionnement normal de HTTP quand on tient le serveur.

**Le catalogue est un instantané publié et adressé par hash.** Tout autre système qui veut savoir ce que la boutique affichait, à quel prix, un jour donné, peut lire exactement les mêmes clés que la boutique a lues — avec la certitude de ne pas regarder une copie divergente. C'est le mécanisme de publication de la partie 2, qui rend ici un second service.

La plupart des détaillants achètent un gestionnaire de tags, une plateforme de données client et un outil d'emailing, puis passent un an à faire concorder trois vues du même client. Ici, il n'y en a qu'une, faute d'en avoir jamais fabriqué une seconde.

## Le cookie est un pointeur, pas un porteur de données

Nous posons un seul cookie depuis l'origine : opaque, HttpOnly, SameSite=Lax, porté par le domaine apex, contenant un identifiant triable et rien d'autre. Tout ce que l'on sait du visiteur vit côté serveur, indexé par lui, dans le même stockage clé-valeur edge que les sessions utilisent déjà (Cloudflare KV).

Cette combinaison en fait plus qu'il n'y paraît :

- **HttpOnly signifie que les scripts de la page ne peuvent pas le lire**, ce qui supprime toute la classe de fuites où un script tiers présent sur la page exfiltre l'identifiant. Ce n'est pas non plus un cookie posé en JavaScript : les navigateurs plafonnent sévèrement la durée de vie de ces derniers, et ce plafond ne nous concerne donc pas.

- **Opaque signifie qu'il ne porte aucune information.** Il n'y a rien à décoder, personne ne peut reconstituer un profil à partir du cookie intercepté.

- **Le stockage côté serveur fait de l'effacement une suppression.** Une demande de droit à l'oubli supprime un enregistrement, et c'est tout. Rien à voir avec un montage où l'historique du visiteur est éparpillé dans l'entrepôt d'un prestataire.

```js
Inputs.table(cookie, {
  columns: ["property", "third_party_pixel", "js_first_party", "server_first_party"],
  header: {
    property: "",
    third_party_pixel: "Pixel tiers",
    js_first_party: "First-party, posé en JS",
    server_first_party: "First-party, posé par l'origine"
  },
  rows: 8
})
```

## Empreinte serveur, volontairement conçue pour la confidentialité

L'expression « empreinte serveur » désigne d'habitude la version hostile : extraire toute l'entropie possible d'un appareil jusqu'à pouvoir isoler une personne. C'est fragile, cela casse à chaque sortie de navigateur, et sur un marché où les combinés se partagent au sein d'un foyer, c'est aussi éthiquement discutable.

Nous inversons l'objectif. L'empreinte ne sert pas à identifier un visiteur, mais à le ranger dans une **cohorte** : une classe de réseau et d'appareil assez large pour rester anonyme, assez homogène pour rester prédictive. Une empreinte classique cherche à maximiser l'entropie ; nous en dépensons le strict minimum que la garde de confidentialité autorise.

Les signaux sont ceux que l'edge possède déjà. Aucune sonde, aucun canvas, aucune énumération de polices, aucun script.

```js
Inputs.table(signals, {
  columns: ["name_fr", "bits", "source", "note_fr"],
  header: {name_fr: "Signal", bits: "Entropie (bits, hypothèse)", source: "Provenance", note_fr: "Note"},
  width: {note_fr: 320},
  rows: 9
})
```

Les valeurs en bits ci-dessus sont des hypothèses, pas des mesures : elles servent uniquement à rendre l'échelle ci-dessous calculable. En production, la garde ne repose pas sur une estimation mais sur un comptage : un compteur probabiliste par compartiment, sur une fenêtre glissante. Quelques kilo-octets, et une réponse à la seule question qui compte : *cette cohorte est-elle assez grande ?*

### L'échelle de k-anonymat

Une cohorte n'est émise que si son compartiment compte au moins **k** membres. Dans le cas contraire, le résolveur abandonne le signal le plus spécifique et redemande, en descendant une échelle fixe jusqu'à tomber sur un compartiment assez peuplé. Un visiteur au réseau et à l'appareil atypiques n'hérite donc pas d'une cohorte qui l'identifie : il obtient « ce pays, cette classe d'appareil », et le système s'en tient là.

```js
const audience = view(Inputs.range([1000, 2000000], {value: 120000, step: 1000, label: "Visiteurs distincts dans la fenêtre"}));
const k = view(Inputs.range([5, 2000], {value: 200, step: 5, label: "Taille minimale de cohorte (k)"}));
const enabled = view(Inputs.checkbox(signals.map((s) => s.id), {
  value: signals.map((s) => s.id),
  label: "Signaux collectés",
  format: (id) => signals.find((s) => s.id === id).name_fr
}));
```

```js
// Bloc séparé à dessein : la valeur d'un `view()` ne réveille que les *autres*
// cellules. Un calcul dérivé placé dans le même bloc resterait figé sur sa
// valeur initiale.
const RUNGS = [
  {id: "full",     label: "Tous les signaux",                  uses: signals.map((s) => s.id)},
  {id: "stable",   label: "Sans latence ni TLS",               uses: ["country", "carrier", "pop", "device_class", "language", "protocol", "ua_platform"]},
  {id: "coarse",   label: "Sans indice plateforme ni protocole", uses: ["country", "carrier", "pop", "device_class", "language"]},
  {id: "network",  label: "Pays, opérateur, appareil",         uses: ["country", "carrier", "device_class"]},
  {id: "geo",      label: "Pays et appareil",                  uses: ["country", "device_class"]},
  {id: "country",  label: "Pays seulement",                    uses: ["country"]}
];
const lad = ladder({signals, enabled, rungs: RUNGS, audience, k});
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Niveau retenu</h2><span class="big" style="font-size:1.35rem">${lad.selected.label}</span><span class="muted">${lad.selected.used.length} signaux utilisés sur ${enabled.length} collectés</span></div>
  <div class="card"><h2>Taille de cohorte attendue</h2><span class="big" style="color:${lad.selected.passes ? "#2f8f5b" : "#b0501a"}">${fmtInt(lad.selected.population)}</span><span class="muted">${lad.selected.passes ? `dépasse k = ${fmtInt(k)}` : `sous k = ${fmtInt(k)} même au plancher`}</span></div>
  <div class="card"><h2>Cohortes distinctes</h2><span class="big">${fmtInt(Math.min(lad.selected.buckets, audience / Math.max(1, lad.selected.population)))}</span><span class="muted">au niveau retenu</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 300,
  marginLeft: 230,
  marginRight: 72,
  x: {label: "Membres attendus par cohorte →", type: "log", grid: true},
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

Déplacez `k` : le niveau retenu descend l'échelle. Toute la posture de confidentialité tient alors dans un chiffre qu'un dirigeant peut défendre en réunion — *aucune cohorte sur laquelle nous agissons ne compte moins de k membres*. C'est vérifiable, c'est testable, et cela ne repose sur les bonnes intentions de personne.

Le même mécanisme rend un second service : un robot d'aspiration se retrouve dans une cohorte dont le comportement n'a rien d'un acheteur — rythme d'arrivée, mélange de variantes d'images, forme des sessions. Les écarter ne coûte ni CAPTCHA ni page de vérification, puisque la classification est une propriété de la cohorte et non un test imposé au visiteur.

## L'ossature événementielle

Un événement compact par requête, émis par le worker edge dans une file. Un consommateur les regroupe par lots et les dépose dans le stockage objet, au format Parquet, partitionné par jour et par point de présence. L'analyse tourne ensuite sur un moteur de requête embarqué qui lit ces fichiers là où ils sont. Pas d'entrepôt, pas de cluster, pas de seconde copie.

<svg class="schematic" viewBox="0 0 1000 260" role="img" aria-label="Colonne vertébrale d'événements, de l'edge aux segments">
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
      <text x="83" y="122">worker edge</text><text x="83" y="142" opacity="0.7" font-size="11">cohorte + cookie</text>
      <text x="288" y="122">file</text><text x="288" y="142" opacity="0.7" font-size="11">groupée</text>
      <text x="500" y="122">stockage objet</text><text x="500" y="142" opacity="0.7" font-size="11">Parquet, jour / PoP</text>
      <text x="717" y="122">moteur de requête</text><text x="717" y="142" opacity="0.7" font-size="11">lit les fichiers en place</text>
      <text x="922" y="122">segments</text><text x="922" y="142" opacity="0.7" font-size="11">publiés, hashés</text>
    </g>
    <g stroke="currentColor" stroke-width="1.6" fill="none" marker-end="url(#s1)">
      <path d="M158 127 H213"/><path d="M358 127 H413"/>
      <path d="M582 127 H637"/><path d="M792 127 H847"/>
    </g>
    <path d="M922 94 C 922 34, 83 34, 83 90" fill="none" stroke="currentColor"
          stroke-width="1.4" stroke-dasharray="6 5" marker-end="url(#s1)" opacity="0.7"/>
    <text x="500" y="24" text-anchor="middle" font-size="11" opacity="0.7">les segments sont relus à l'edge exactement comme l'est le catalogue</text>
    <text x="500" y="216" text-anchor="middle" font-size="11.5" opacity="0.75">la boucle se referme sur l'infrastructure de l'opérateur — aucun prestataire sur aucune arête de ce schéma</text>
  </g>
</svg>

C'est la dernière boîte qui mérite discussion. Un segment d'audience est **publié, jamais modifié en place** : la même discipline que le catalogue en partie 2. On le construit, on le hashe, on le versionne, on l'écrit, on en garde l'historique. Trois avantages qu'un référentiel de segments modifiable ne procure jamais :

- Une campagne peut nommer la version exacte du segment qu'elle a ciblée
- On revient en arrière sur un mauvais segment plutôt que de le réparer
- Le diff entre deux versions est un artefact concret, relisible avant l'envoi

## La newsletter est un gabarit à trous

« Optimisation créative dynamique » est un terme venu de la publicité, où il désigne le plus souvent beaucoup de machinerie pour peu de résultat. Appliqué à l'email, sur un catalogue qui tourne vite, il devient presque une évidence.

La newsletter n'est pas un document, c'est une mise en page à emplacements. Chaque emplacement est résolu destinataire par destinataire, au moment du rendu, par une politique qui apprend.

```js
Inputs.table(slots, {
  columns: ["slot", "candidates", "decided_by", "constraint_fr"],
  header: {slot: "Emplacement", candidates: "Candidats", decided_by: "Rempli par", constraint_fr: "Contrainte stricte"},
  width: {constraint_fr: 320},
  rows: 6
})
```

### Le détail qui rend l'ensemble sûr

Le moteur de rendu lit les candidats **dans l'instantané de catalogue publié** — les mêmes clés que lit la boutique, à une version épinglée.

Cette seule décision élimine le mode de défaillance qui rend l'email personnalisé gênant :

- Un email ne peut pas montrer un produit que la boutique n'a pas, puisque les deux lisent le même artefact
- Il ne peut pas montrer le prix du mois dernier, puisque la version est épinglée et enregistrée
- Quand un destinataire clique, la page sur laquelle il arrive est forcément celle que l'email décrivait

Le stock est l'exception qui confirme la règle : l'inventaire n'est pas dans l'instantané publié, il est vivant. Le moteur de rendu masque donc tout candidat en rupture au moment du rendu.

### Pourquoi un bandit et pas un test A/B

Un test A/B suppose un jeu de variantes figé, une population figée et le temps d'atteindre la significativité statistique. Un catalogue de spiritueux ne remplit aucune de ces trois conditions : les produits arrivent, s'épuisent et disparaissent. Et une newsletter mensuelle envoyée à une liste de taille moyenne accumule les observations lentement. Le temps que le test tranche, ce qu'il testait n'existe plus.

Un bandit n'a pas besoin de conclure. Il réalloue en continu, et il survit à l'apparition et à la disparition de candidats en cours de route.

```js
// Les taux sont exprimés en points de pourcentage : Inputs.range associe son
// curseur à un vrai <input type=number>, et un `format` qui renvoie « 3,0 % »
// laisse la case vide.
const arms = view(Inputs.range([2, 12], {value: 6, step: 1, label: "Candidats créatifs dans l'emplacement"}));
const baseRatePct = view(Inputs.range([0.5, 12], {value: 3, step: 0.5, label: "Taux de clic du candidat médian (%)"}));
const spreadPct = view(Inputs.range([5, 120], {value: 60, step: 5, label: "Écart du meilleur au pire (%)"}));
const sends = view(Inputs.range([500, 100000], {value: 8000, step: 500, label: "Destinataires par campagne"}));
const campaigns = view(Inputs.range([2, 40], {value: 12, step: 1, label: "Campagnes"}));
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
  {campaign: d.campaign, regret: d.bandit, policy: "Bandit contextuel"},
  {campaign: d.campaign, regret: d.even, policy: "Répartition égale"}
]);
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Clics, bandit</h2><span class="big">${fmtInt(race.banditClicks)}</span></div>
  <div class="card"><h2>Clics, répartition égale</h2><span class="big">${fmtInt(race.evenClicks)}</span></div>
  <div class="card"><h2>Écart</h2><span class="big" style="color:${race.lift >= 0 ? "#2f8f5b" : "#b0501a"}">${race.lift >= 0 ? "+" : ""}${fmtPct(race.lift, 1)}</span><span class="muted">sur ${campaigns} campagnes</span></div>
</div>

```js
resize((width) => Plot.plot({
  width,
  height: 320,
  marginLeft: 66,
  x: {label: "Campagne →", grid: true, tickFormat: "d"},
  y: {label: "↑ Regret cumulé (clics non obtenus)", grid: true, zero: true},
  color: {legend: true, domain: ["Bandit contextuel", "Répartition égale"]},
  marks: [
    Plot.lineY(tidy, {x: "campaign", y: "regret", stroke: "policy", strokeWidth: 2}),
    Plot.tip(tidy, Plot.pointerX({x: "campaign", y: "regret", stroke: "policy", title: (d) => `${d.policy}\ncampagne ${d.campaign}\n${fmtInt(d.regret)} clics abandonnés`}))
  ]
}))
```

La ligne de la répartition égale est droite : une politique qui n'apprend jamais paie éternellement le même prix. La ligne du bandit s'infléchit : il paie pour explorer au début, puis cesse de payer.

Baissez le nombre de destinataires, ou l'écart entre candidats : les deux courbes se rejoignent. C'est le résultat honnête. **Un bandit n'est pas une astuce gratuite. Il se justifie quand les candidats diffèrent vraiment et que le volume permet de le voir.** Ce graphique existe pour que cet arbitrage se fasse avant la construction, pas après.

### Démarrage à froid, résolu par la forme même du catalogue

Un produit ajouté ce matin n'a pas d'historique. Un algorithme de classement qui ne se fie qu'aux clics observés fera l'une de deux erreurs : ne jamais le montrer, ou le survaloriser sur trois ouvertures chanceuses.

Nous empruntons donc un a priori au producteur, qui l'emprunte à sa catégorie, qui l'emprunte au catalogue. C'est le repli hiérarchique de l'échelle de k-anonymat, appliqué à un autre problème. Un mécanisme, deux usages : en général, le signe que le mécanisme est le bon.

```js
const brandRatePct = view(Inputs.range([0.5, 12], {value: 3.0, step: 0.1, label: "Taux de clic établi du producteur (%)"}));
const skuTrueRatePct = view(Inputs.range([0.5, 12], {value: 5.5, step: 0.1, label: "Taux de clic réel du produit neuf (%)"}));
const maxSends = view(Inputs.range([200, 20000], {value: 4000, step: 100, label: "Envois observés"}));
```

```js
const brandRate = brandRatePct / 100;
const skuTrueRate = skuTrueRatePct / 100;
const curves = shrinkage({brandRate, skuTrueRate, maxSends, strengths: [50, 250, 1500], seed: 4711})
  .map((d) => ({...d, series: d.series === "Own clicks only" ? "Clics propres seulement" : d.series.replace("Pooled, prior = ", "Mutualisé, a priori = ")}));
```

```js
resize((width) => Plot.plot({
  width,
  height: 330,
  marginLeft: 66,
  marginRight: 24,
  x: {label: "Envois observés pour le produit neuf →", grid: true},
  y: {label: "↑ Taux de clic estimé", grid: true, tickFormat: "%"},
  color: {legend: true},
  marks: [
    Plot.ruleY([skuTrueRate], {stroke: "#2f8f5b", strokeDasharray: "5,4"}),
    Plot.text([{x: maxSends, y: skuTrueRate}], {x: "x", y: "y", text: ["taux réel"], dy: -8, textAnchor: "end", fill: "#2f8f5b", fontWeight: 700}),
    Plot.ruleY([brandRate], {stroke: "#b0501a", strokeDasharray: "5,4"}),
    Plot.text([{x: maxSends, y: brandRate}], {x: "x", y: "y", text: ["a priori producteur"], dy: 14, textAnchor: "end", fill: "#b0501a", fontWeight: 700}),
    Plot.lineY(curves, {x: "n", y: "rate", stroke: "series", strokeWidth: 1.8}),
    Plot.tip(curves, Plot.pointerX({x: "n", y: "rate", stroke: "series", title: (d) => `${d.series}\n${fmtInt(d.n)} envois · ${fmtPct(d.rate)}`}))
  ]
}))
```

La courbe « clics propres seulement » est l'estimateur naïf, et à faible volume il est brutal : il annoncera sans hésiter 20 % de taux de clic sur quatre clics. Les courbes mutualisées, elles, partent du taux du producteur et rejoignent la vérité à une vitesse que règle la force de l'a priori.

Un a priori fort se laisse convaincre lentement, mais ne met jamais dans l'embarras ; un a priori faible réagit vite, et se trompe parfois grossièrement. Le curseur relève d'une décision commerciale, pas d'un choix de modélisation : il revient à qui détient la marque.

### L'heure d'envoi

Le même appareillage de lois a posteriori, vingt-quatre bras, un par heure locale, tenus au niveau de la cohorte et non du destinataire. Une cohorte accumule assez d'observations pour apprendre une heure d'envoi ; un individu, non. La garde de k-anonymat se rentabilise ici une seconde fois : l'unité d'apprentissage est déjà l'unité de confidentialité.

## Garde-fous, parce que c'est de l'email

Un système qui décide quoi mettre devant un client a besoin de limites qui ne s'apprennent pas :

- **Un témoin permanent.** Une part fixe de la liste reçoit toujours la version éditoriale par défaut. Sans lui, « le bandit fonctionne » est une affirmation infalsifiable.
- **Masquage sur le stock.** Vérifié en direct au moment du rendu, jamais depuis l'instantané.
- **Plafond de fréquence et plancher de diversité.** Un emplacement qui gagne toujours finit par transformer la newsletter en fiche produit unique, et la liste en vague de désabonnements.
- **Dégradation selon le consentement.** Sans consentement, pas de loi a posteriori individuelle : le destinataire reçoit le meilleur choix marginal de sa cohorte. Le système perd en finesse, il ne casse pas. Et aucune fenêtre de consentement ne conditionne l'envoi.
- **Un effacement qui efface vraiment.** On supprime l'enregistrement côté serveur et on pose un marqueur de suppression sur l'identifiant, pour que la prochaine compaction Parquet laisse tomber ses lignes. Ce motif existe déjà dans le code, dans l'index des slugs de la partie 2.

## Ce que nous mesurons pour le prouver

Cette partie décrit une conception déployée. Les nombres qui prouvent qu'elle fonctionne sont suivis en production :

1. **Stabilité de cohorte** — la part des cookies récurrents dont la cohorte change d'une session à l'autre. Si elle est élevée, les signaux sont du bruit et l'échelle ne trie rien.
2. **Pouvoir prédictif de la cohorte** — la part de variance du taux de clic qu'explique la cohorte, comparée à un témoin tiré au hasard. Une cohorte qui ne prédit rien n'a rien à faire dans le contexte du modèle.
3. **Regret réalisé contre le témoin** — le seul nombre qui tranche si le bandit a mérité sa complexité.
4. **Concordance d'instantané** — la part des impressions email dont la page d'atterrissage correspondait à la version de catalogue épinglée. Cela devrait valoir exactement 100 %, et le mesurer est la manière de découvrir que non.

Construire tout cela sans ces quatre mesures, c'est bâtir sur une supposition. La discipline est celle du reste de l'étude : le code dit ce qu'il fait, les modèles disent ce qu'ils supposent, et rien entre les deux n'est affirmé.

Le back-office donne à l'opérateur une vue sur l'ensemble : répartition des cohortes, performance des bandits, composition des newsletters, et la collecte de signaux first-party qui alimente le tout.

---

<div class="small muted">Les chiffres signalés comme modélisés sont produits par les curseurs ci-dessus et décrivent la forme d'un problème. Les comportements signalés comme lus dans le code ont été vérifiés à la source. Le client, la plateforme et ses domaines sont volontairement tus.</div>

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
.tip { margin: 1.25rem 0; padding: 0.75rem 1rem; border-left: 3px solid var(--theme-foreground-focus, #2f6bff); background: var(--theme-background-alt, rgba(47,107,255,0.06)); border-radius: 0 6px 6px 0; font-size: 0.92rem; }
</style>
