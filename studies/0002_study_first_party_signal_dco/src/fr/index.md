---
title: Signal first-party, sans tracker
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
  <h1>Signal first-party,<br>sans tracker</h1>
  <h2>Partie 3 sur 3. Ce qu'une boutique edge sait déjà de son propre trafic, et comment en faire une newsletter qui s'assemble toute seule.</h2>
</div>

<div class="client-strip">
  <div class="field"><span class="k">Secteur</span><span class="v">Spiritueux de luxe, vente directe</span></div>
  <div class="field"><span class="k">Marché</span><span class="v">Afrique centrale (RDC)</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">Boutique · Back-office · Appli coursier · API</span></div>
  <div class="field"><span class="k">Cette partie</span><span class="v">La couche de données first-party</span></div>
</div>

La [partie 1](https://computeflux.xyz/studies/mobile-money-payment-processor) a construit un processeur de paiement pour un marché sans cartes. La [partie 2](https://computeflux.xyz/studies/edge-serving-layer) a transformé le catalogue en artefact versionné publié vers l'edge.

Ensemble, elles ont créé quelque chose que la plupart des plateformes e-commerce ne réalisent jamais : **une infrastructure de données first-party qui est réellement sous le contrôle de l'opérateur.**

## Trois conditions prérequises qui rendent cela possible

**L'opérateur exploite son propre serveur d'origine.** La boutique n'est pas un export statique derrière le CDN d'un tiers : c'est une application rendue côté serveur qui s'exécute sur un point de présence, sur le domaine de l'opérateur. Chaque requête atteint du code que l'opérateur a écrit. Il s'agit de l'application `bijougabriel-ui` Astro, déployée en tant que Cloudflare Worker.

**Chaque requête porte déjà des métadonnées dont la collecte n'a rien coûté.** L'edge termine le TLS, résout le réseau par lequel la requête est arrivée, sait quel point de présence l'a servie et a mesuré le temps d'aller-retour en le faisant. Rien de tout cela ne demande un script sur la page, une bannière de consentement ou un prestataire. C'est simplement ainsi que fonctionne HTTP quand vous contrôlez le serveur.

**Le catalogue est un instantané publié et adressé par hash.** Tout autre système qui veut savoir ce que la boutique affichait, à quel prix, un jour donné, peut lire exactement les mêmes clés que la boutique a lues — avec la certitude de ne pas regarder une copie divergente. C'est le mécanisme de publication de la partie 2, qui sert maintenant un double usage.

La plupart des détaillants achètent un gestionnaire de tags, une plateforme de données client et un outil d'emailing, puis passent un an à réconcilier trois vues du même client. Cette plateforme n'en a qu'une, parce qu'elle n'en a jamais fabriqué une seconde.

## Le cookie est un pointeur, pas une charge utile

Nous posons un seul cookie depuis l'origine : opaque, HttpOnly, SameSite=Lax, porté par le domaine apex, contenant un identifiant triable et rien d'autre. Tout ce que l'on sait du visiteur vit côté serveur, indexé par lui, dans le même stockage clé-valeur edge que les sessions utilisent déjà (Cloudflare KV).

Cette combinaison travaille plus qu'il n'y paraît :

- **HttpOnly signifie que les scripts de la page ne peuvent pas le lire**, ce qui supprime toute la classe de fuites où un script tiers présent sur la page exfiltre l'identifiant. Cela signifie aussi que ce n'est pas un cookie posé en JavaScript : les plafonds de durée de vie agressifs que les navigateurs appliquent à ceux-là ne s'appliquent pas.

- **Opaque signifie qu'il ne porte aucune information.** Il n'y a rien à décoder, donc le cookie ne peut pas être rejoué en profil par qui l'intercepterait.

- **Le stockage côté serveur fait de l'effacement une suppression.** Une demande de droit à l'oubli retire un enregistrement. À comparer avec une conception où l'historique du visiteur est étalé dans l'entrepôt d'un prestataire.

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

Nous inversons l'objectif. Le rôle de l'empreinte n'est pas d'identifier un visiteur : c'est de placer une requête dans une **cohorte** — une classe réseau-et-appareil assez large pour être anonyme et assez cohérente pour être prédictive. Là où l'empreinte classique maximise l'entropie, celle-ci en dépense volontairement le moins que la garde de confidentialité autorise.

Les signaux sont ceux que l'edge possède déjà. Aucune sonde, aucun canvas, aucune énumération de polices, aucun script.

```js
Inputs.table(signals, {
  columns: ["name_fr", "bits", "source", "note_fr"],
  header: {name_fr: "Signal", bits: "Entropie (bits, hypothèse)", source: "Provenance", note_fr: "Note"},
  width: {note_fr: 320},
  rows: 9
})
```

Les valeurs en bits ci-dessus sont des hypothèses, pas des mesures : elles rendent l'échelle ci-dessous calculable. En production, la garde est une population comptée et non une estimation : une esquisse de cardinalité par seau sur une fenêtre glissante, qui coûte quelques kilo-octets et répond à la seule question qui compte : *cette cohorte est-elle assez grande ?*

### L'échelle de k-anonymat

Une cohorte n'est émise que si son seau contient au moins **k** membres. Sinon, le résolveur retire le signal le plus spécifique et redemande, en descendant une échelle fixe jusqu'à obtenir un seau assez grand. Un visiteur sur un réseau inhabituel avec un appareil inhabituel n'obtient pas une cohorte qui l'identifie : il obtient « ce pays, cette classe d'appareil », et le système s'en contente.

```js
const audience = view(Inputs.range([1000, 2000000], {value: 120000, step: 1000, label: "Visiteurs distincts dans la fenêtre"}));
const k = view(Inputs.range([5, 2000], {value: 200, step: 5, label: "Taille minimale de cohorte (k)"}));
const enabled = view(Inputs.checkbox(signals.map((s) => s.id), {
  value: signals.map((s) => s.id),
  label: "Signaux collectés",
  format: (id) => signals.find((s) => s.id === id).name_fr
}));

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

```js
<div class="grid grid-cols-3">
  <div class="card"><h2>Barreau retenu</h2><span class="big" style="font-size:1.35rem">${lad.selected.label}</span><span class="muted">${lad.selected.used.length} signaux utilisés sur ${enabled.length} collectés</span></div>
  <div class="card"><h2>Taille de cohorte attendue</h2><span class="big" style="color:${lad.selected.passes ? "#2f8f5b" : "#b0501a"}">${fmtInt(lad.selected.population)}</span><span class="muted">${lad.selected.passes ? `dépasse k = ${fmtInt(k)}` : `sous k = ${fmtInt(k)} même au plancher`}</span></div>
  <div class="card"><h2>Cohortes distinctes</h2><span class="big">${fmtInt(Math.min(lad.selected.buckets, audience / Math.max(1, lad.selected.population)))}</span><span class="muted">au barreau retenu</span></div>
</div>
```

Déplacez `k` et regardez le barreau retenu descendre l'échelle. Toute la posture de confidentialité tient dans un nombre qu'un opérateur peut défendre en réunion : *aucune cohorte sur laquelle nous agissons n'est plus petite que k*. C'est vérifiable, testable, et cela ne dépend des bonnes intentions de personne.

Deuxième usage du même mécanisme : un robot d'aspiration atterrit dans une cohorte dont le comportement ne ressemble en rien à celui d'un acheteur — rythme d'arrivée, mélange de variantes, forme de session. Les séparer ne coûte ni CAPTCHA ni page de défi, parce que la classification est une propriété de la cohorte et non un test imposé au visiteur.

## La colonne vertébrale d'événements

Un événement compact par requête, émis par le worker edge dans une file. Un consommateur les regroupe et les dépose dans le stockage objet en Parquet, partitionné par jour et par point de présence. L'analyse s'exécute via un moteur de requête embarqué qui lit ces fichiers directement — pas d'entrepôt, pas de cluster, pas de seconde copie.

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

La dernière boîte est celle qui mérite débat. Un segment d'audience est **publié, pas muté** — même discipline que le catalogue en partie 2 : on le construit, on le hashe, on le versionne, on l'écrit, on garde l'historique. Cela achète trois choses qu'un magasin de segments mutables ne donne jamais :

- Une campagne peut nommer la version exacte du segment qu'elle a ciblée
- Un mauvais segment se rejoue en arrière au lieu d'être réparé
- Un diff entre deux versions est un artefact réel que quelqu'un peut relire avant l'envoi

## La newsletter est un gabarit troué

L'optimisation créative dynamique est un terme publicitaire, et en publicité il désigne d'ordinaire beaucoup de machinerie pour très peu. En email, pour un catalogue qui tourne, c'est presque une évidence.

La newsletter n'est pas un document. C'est une mise en page à emplacements, et chaque emplacement est résolu par destinataire au moment du rendu par une politique qui apprend.

```js
Inputs.table(slots, {
  columns: ["slot", "candidates", "decided_by", "constraint_fr"],
  header: {slot: "Emplacement", candidates: "Candidats", decided_by: "Rempli par", constraint_fr: "Contrainte dure"},
  width: {constraint_fr: 320},
  rows: 6
})
```

### Le détail qui rend l'ensemble sûr

Le moteur de rendu lit les candidats **dans l'instantané de catalogue publié** — les mêmes clés que lit la boutique, à une version épinglée.

Cette seule décision supprime le mode de panne qui rend l'email personnalisé embarrassant :

- Un email ne peut pas montrer un produit que la boutique n'a pas, puisque les deux lisent le même artefact
- Il ne peut pas montrer le prix du mois dernier, puisque la version est épinglée et enregistrée
- Quand un destinataire clique, la page où il atterrit est garantie être celle que l'email décrivait

Le stock est l'exception qui confirme la règle : l'inventaire n'est pas dans l'instantané publié, il est vivant. Le moteur de rendu masque donc tout candidat en rupture au moment du rendu.

### Pourquoi un bandit et pas un test A/B

Un test A/B exige un jeu de variantes fixe, une population fixe et assez de temps pour atteindre la significativité. Un catalogue de spiritueux ne satisfait aucune de ces conditions : les produits arrivent, s'épuisent et repartent. Une newsletter mensuelle vers une liste de taille moyenne n'accumule pas les observations vite. Le temps que le test conclue, ce qu'il testait a disparu.

Un bandit n'a pas besoin de conclure. Il réalloue en continu, et il survit à l'apparition et à la disparition de candidats en cours de route.

```js
const arms = view(Inputs.range([2, 12], {value: 6, step: 1, label: "Candidats créatifs dans l'emplacement"}));
const baseRate = view(Inputs.range([0.005, 0.12], {value: 0.03, step: 0.005, label: "Taux de clic du candidat médian", format: (x) => fmtPct(x, 1)}));
const spread = view(Inputs.range([0.05, 1.2], {value: 0.6, step: 0.05, label: "Écart, meilleur au pire", format: (x) => fmtPct(x, 0)}));
const sends = view(Inputs.range([500, 100000], {value: 8000, step: 500, label: "Destinataires par campagne"}));
const campaigns = view(Inputs.range([2, 40], {value: 12, step: 1, label: "Campagnes"}));

const race = banditRace({arms, baseRate, spread, sends, campaigns, seed: 20260802});
const tidy = race.series.flatMap((d) => [
  {campaign: d.campaign, regret: d.bandit, policy: "Bandit contextuel"},
  {campaign: d.campaign, regret: d.even, policy: "Répartition égale"}
]);
```

```js
<div class="grid grid-cols-3">
  <div class="card"><h2>Clics, bandit</h2><span class="big">${fmtInt(race.banditClicks)}</span></div>
  <div class="card"><h2>Clics, répartition égale</h2><span class="big">${fmtInt(race.evenClicks)}</span></div>
  <div class="card"><h2>Écart</h2><span class="big" style="color:${race.lift >= 0 ? "#2f8f5b" : "#b0501a"}">${race.lift >= 0 ? "+" : ""}${fmtPct(race.lift, 1)}</span><span class="muted">sur ${campaigns} campagnes</span></div>
</div>
```

La ligne de la répartition égale est droite : une politique qui n'apprend jamais paie éternellement le même prix. La ligne du bandit s'infléchit : il paie pour explorer au début, puis cesse de payer.

Baissez le nombre de destinataires ou l'écart entre candidats, et les deux lignes convergent — c'est le résultat honnête. **Un bandit n'est pas de l'intelligence gratuite ; il vaut d'être déployé quand les candidats diffèrent réellement et qu'il y a assez de volume pour s'en apercevoir.** Ce graphique est là pour que ce jugement se fasse avant la construction, pas après.

### Démarrage à froid, résolu par la forme même du catalogue

Un produit ajouté ce matin n'a pas d'historique, et un classeur qui ne fait confiance qu'aux clics observés soit ne le montrera jamais, soit le sur-promouvra sur trois ouvertures chanceuses.

La conception emprunte un a priori au producteur, qui l'emprunte à la catégorie, qui l'emprunte au catalogue. C'est le même repli hiérarchique que l'échelle de k-anonymat, appliqué à un autre problème — un mécanisme, deux usages, ce qui est en général le signe que le mécanisme est le bon.

```js
const brandRate = view(Inputs.range([0.005, 0.12], {value: 0.030, step: 0.001, label: "Taux de clic établi du producteur", format: (x) => fmtPct(x, 1)}));
const skuTrueRate = view(Inputs.range([0.005, 0.12], {value: 0.055, step: 0.001, label: "Taux de clic réel du produit neuf", format: (x) => fmtPct(x, 1)}));
const maxSends = view(Inputs.range([200, 20000], {value: 4000, step: 100, label: "Envois observés"}));

const curves = shrinkage({brandRate, skuTrueRate, maxSends, strengths: [50, 250, 1500], seed: 4711})
  .map((d) => ({...d, series: d.series === "Own clicks only" ? "Clics propres seulement" : d.series.replace("Pooled, prior = ", "Mutualisé, a priori = ")}));
```

La courbe « clics propres seulement » est l'estimateur naïf, et à faible volume il est violent : il annoncera volontiers 20 % de taux de clic sur quatre clics. Les courbes mutualisées partent du taux du producteur et convergent vers la vérité à une vitesse que règle la force de l'a priori.

Un a priori fort est lent à se laisser convaincre et jamais embarrassant ; un a priori faible est rapide et parfois ridicule. C'est une décision commerciale, pas une décision de modélisation, et elle revient à qui détient la marque.

### L'heure d'envoi

La même machinerie de postérieurs, vingt-quatre bras, un par heure locale, tenus par cohorte plutôt que par destinataire. Une cohorte a assez d'observations pour apprendre une heure ; un individu n'en a pas. C'est là que la garde de k-anonymat se paie une seconde fois : l'unité d'apprentissage est déjà l'unité de confidentialité.

## Garde-fous, parce que c'est de l'email

Un système qui décide quoi mettre devant un client a besoin de limites qui ne s'apprennent pas :

- **Un témoin permanent.** Une part fixe de la liste reçoit toujours la version éditoriale par défaut. Sans lui, « le bandit fonctionne » est une affirmation infalsifiable.
- **Masquage sur l'inventaire.** Vérifié en direct au rendu, jamais depuis l'instantané.
- **Plafonnement de fréquence et plancher de diversité.** Un emplacement qui gagne toujours, c'est une newsletter qui devient un seul produit, et une liste qui se désabonne.
- **Dégradation selon le consentement.** Sans consentement, pas de postérieur individuel ; le destinataire reçoit le meilleur choix marginal de sa cohorte. Le système devient moins bon, pas cassé — et aucune fenêtre de consentement ne conditionne jamais l'envoi.
- **Un effacement qui efface vraiment.** Supprimer l'enregistrement côté serveur, et poser une pierre tombale sur l'identifiant pour que la prochaine compaction Parquet abandonne ses lignes. Ce motif de pierre tombale est déjà dans le code, dans l'index des slugs de la partie 2.

## Ce que nous mesurons pour le prouver

Cette partie décrit une conception déployée. Les nombres qui prouvent qu'elle fonctionne sont suivis en production :

1. **Stabilité de cohorte** — la part des cookies récurrents dont la cohorte change d'une session à l'autre. Si elle est élevée, les signaux sont du bruit et l'échelle ne trie rien.
2. **Pouvoir prédictif de la cohorte** — la variance de taux de clic expliquée par la cohorte, contre un contrôle mélangé. Si une cohorte ne prédit rien, elle ne doit pas servir de contexte.
3. **Regret réalisé contre le témoin** — le seul nombre qui tranche si le bandit a mérité sa complexité.
4. **Concordance d'instantané** — la part des impressions email dont la page d'atterrissage correspondait à la version de catalogue épinglée. Cela devrait valoir exactement 100 %, et le mesurer est la manière de découvrir que non.

Construire tout cela sans que ces quatre mesures soient instrumentées serait construire sur une supposition. C'est la même discipline que dans le reste de cette étude : le code dit ce qu'il fait, les modèles disent ce qu'ils supposent, et rien entre les deux n'est affirmé.

Le back-office `bijougabriel-admin` donne à l'opérateur une visibilité sur tout cela : distributions de cohortes, performance des bandits, assemblage des newsletters, et la collecte de signaux first-party qui alimente tout le système.

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
