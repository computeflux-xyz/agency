---
title: "Edge e-commerce: Le paiement est le produit"
toc: false
---

```js
import {fmtInt, duplicates} from "../components/settlement.js";
const surfaces = await FileAttachment("../data/surfaces.csv").csv({typed: true});
const codes = await FileAttachment("../data/response_classes.csv").csv({typed: true});
const cover = FileAttachment("../cover.svg");
```

<div class="hero">
  <h1>Edge e-commerce: Le paiement<br>est le produit</h1>
  <h2>Partie 1 sur 3. Concevoir un processeur de paiement pour un marché où la carte bancaire est l'exception.</h2>
</div>

<div class="client-strip">
  <div class="field"><span class="k">Secteur</span><span class="v">Spiritueux de luxe, vente directe</span></div>
  <div class="field"><span class="k">Marché</span><span class="v">Afrique centrale (RDC)</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">Boutique · Back-office · Appli coursier · API d'administration</span></div>
  <div class="field"><span class="k">Cette partie</span><span class="v">Le processeur Mobile Money</span></div>
</div>

Voici ce qui arrive quand on construit une plateforme e-commerce pour un marché où **la carte bancaire ne concerne qu'une minorité des clients.**

Nous avons lu le code. Nous avons suivi les transactions. Chaque affirmation de cette étude est vérifiée contre l'implémentation réelle : la bibliothèque cliente Mobile Money partagée, et le paquet de cas d'usage « paiement » qui la pilote. Pas de slide marketing, pas d'approximation.

## La contrainte qui a tout redéfini

Dans la plupart des plateformes e-commerce, le paiement arrive en dernier : une intégration Stripe greffée sur un tunnel pensé pour des porteurs de carte. Le montage tient tant que les clients ont une carte.

En République Démocratique du Congo, ce n'est pas le cas.

Là-bas, **le Mobile Money n'est pas une alternative, c'est l'infrastructure.** M-Pesa, Orange Money, Airtel Money : c'est ainsi que les gens paient. L'identifiant de compte est un numéro de téléphone. La confirmation se fait sur le téléphone. Le règlement est asynchrone par nature. Un formulaire de carte n'est pas une option moins bonne : pour l'essentiel du marché adressable, **ce n'est pas une option du tout.**

Nous n'avons donc pas intégré un processeur de paiement. Nous en avons **écrit un**, de zéro, contre l'API OpenAPI de M-Pesa RDC. Il est devenu la pièce la plus critique et la plus complexe de toute la plateforme.

### Ce que propose réellement le tunnel de paiement

Chaque ligne du tableau vient de l'énumération des moyens de paiement du composant de checkout, et du câblage de service correspondant côté API Go. La colonne `ui_flag` est l'interrupteur visible par le client : une décision produit, qui évolue indépendamment de l'existence du chemin serveur.

```js
Inputs.table(surfaces, {
  columns: ["method", "ui_flag", "backend", "settlement", "notes_fr"],
  header: {
    method: "Moyen",
    ui_flag: "Visible au checkout",
    backend: "Chemin serveur",
    settlement: "Règlement",
    notes_fr: "Note"
  },
  width: {notes_fr: 300},
  rows: 8
})
```

**Ce que le tableau dit vraiment :** le Mobile Money est complet et câblé côté serveur, mais encore derrière un feature flag dans l'interface. Construire un moyen de paiement et l'ouvrir aux clients sont deux événements distincts. Cette étude parle du premier, celui qui rend le second possible.

## Pourquoi aucun SDK ne nous a sauvés

L'API OpenAPI de M-Pesa ne se comporte pas comme une API de paiement moderne. Nous l'avons appris à nos frais, puis nous avons construit autour.

Les comportements ci-dessous sont tirés de notre bibliothèque cliente maison (environ 1 300 lignes de Go dans un paquet `payments/` partagé) et du fichier de constantes qui fige les endpoints et les codes de réponse de l'opérateur.

- **Les identifiants sont chiffrés, pas signés.** La clé d'API est chiffrée en RSA (PKCS#1 v1.5) contre une clé publique propre au marché, embarquée dans le binaire en DER base64. Nous en livrons deux : une pour la sandbox, une pour la production.

- **L'authentification repose sur une session, et une session meurt.** Un appel à `getSession` renvoie une clé de session, elle-même chiffrée en RSA, qui sert ensuite de jeton porteur. Sa durée de vie tourne autour d'une heure.

- **La confirmation n'est pas dans la réponse.** L'API confirme que l'instruction a été acceptée, rien de plus. Savoir si l'acheteur l'a validée sur son téléphone arrive plus tard, par callback, rattaché à un identifiant de corrélation que nous avons nous-mêmes généré.

- **Les erreurs relèvent du métier, pas du HTTP.** `INS-0` signifie succès. Tout le reste est un code qu'il faut classer soi-même, car la couche transport renvoie volontiers un 200 contenant un refus.

C'est sur ce dernier point que la plupart des intégrations se cassent. Un client de paiement qui confond « l'appel HTTP a réussi » et « le paiement a réussi » paraît irréprochable en préproduction, et **perd de l'argent en production.**

```js
Inputs.table(codes, {
  columns: ["code", "class", "retryable", "operator_action"],
  header: {
    code: "Code",
    class: "Classe",
    retryable: "Rejouable",
    operator_action: "Ce que fait le processeur"
  },
  rows: 10
})
```

### Le gestionnaire de session, point de départ de la fiabilité

La session est une ressource partagée, mutable et périssable, placée devant chaque appel de paiement. Si elle est mal gérée, tout tombe.

Notre implémentation conserve une session 55 minutes, face à une durée de vie d'environ 60 minutes côté opérateur. Nous la renouvelons **cinq minutes en avance** au lieu d'attendre qu'on nous apprenne qu'elle est morte. Le renouvellement est rejoué en backoff exponentiel (1 s au départ, facteur 2, plafond 30 s, 3 tentatives) et uniquement sur les classes transitoires : 5xx, dépassements de délai, erreurs de connexion.

La concurrence passe par un mutex lecteur/écrivain, avec une seconde vérification après la prise du verrou d'écriture. Une rafale de requêtes qui arrive pile à l'expiration déclenche **un seul renouvellement, pas un par requête.**

La marge de cinq minutes n'a rien d'arbitraire. Renouveler à l'expiration, c'est faire payer à la première requête de l'heure la latence du renouvellement, en plus de la mettre en concurrence avec toutes celles arrivées dans la même milliseconde. La renouveler en avance déplace ce blocage hors du chemin critique du client.

## Idempotence : l'acheteur qui appuie deux fois

Voilà le scénario qui coûte cher.

L'acheteur valide. Son téléphone ne sonne pas dans les secondes qui suivent : l'opérateur est lent, la notification attend dans une file, ou l'acheteur ne croit simplement pas qu'il se soit passé quelque chose. Il appuie une seconde fois.

Notre processeur reçoit un `idempotency_id` de l'appelant et cherche un paiement existant sous cette clé **avant** que quoi que ce soit n'atteigne l'opérateur. S'il en trouve un, il renvoie un conflit qui pointe vers le paiement d'origine, au lieu d'en ouvrir un second.

En parallèle, chaque tentative reçoit un identifiant de corrélation ULID, porté par l'instruction et utilisé pour rattacher le callback à la bonne ligne. Les corps de requête, les latences et les codes de réponse sont journalisés dans des tables dédiées, tout comme les payloads bruts des webhooks.

```js
// Les pourcentages sont exprimés en points de pourcentage, pas en fraction :
// Inputs.range associe son curseur à un vrai <input type=number>, et un
// `format` qui renvoie « 18 % » laisse la case vide.
const attempts = view(Inputs.range([100, 20000], {value: 2500, step: 50, label: "Tentatives de paiement / jour"}));
const retryPct = view(Inputs.range([0, 60], {value: 18, step: 1, label: "Acheteurs qui revalident (%)"}));
const extraTaps = view(Inputs.range([1, 4], {value: 1.6, step: 0.1, label: "Validations supplémentaires par acheteur"}));
const doubleDebitPct = view(Inputs.range([0, 100], {value: 35, step: 1, label: "Doublons non protégés réellement débités (%)"}));
```

```js
// Bloc distinct volontairement : la valeur d'un `view()` ne réveille que les
// *autres* cellules. Un calcul dérivé placé dans le même bloc resterait figé.
const dup = duplicates({
  attempts,
  retryRate: retryPct / 100,
  extraTaps,
  doubleDebitOdds: doubleDebitPct / 100
});
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Revalidations / jour</h2><span class="big">${fmtInt(dup.resubmissions)}</span><span class="muted">absorbées par la clé d'idempotence</span></div>
  <div class="card"><h2>Appels opérateur évités</h2><span class="big">${fmtInt(dup.unguardedRailCalls - dup.guardedRailCalls)}</span><span class="muted">par jour, comparé à l'absence de clé</span></div>
  <div class="card"><h2>Doubles débits évités</h2><span class="big" style="color:#2f8f5b">${fmtInt(dup.unguardedDoubleDebits)}</span><span class="muted">par jour, comparé à l'absence de clé</span></div>
</div>

Derrière chaque double débit évité, il y a un ticket au support, un remboursement à émettre et un acheteur qui ne revient pas. Le chemin de reversement existe : il écrit un paiement de type `reversal` et marque l'original comme reversé, de sorte que le remboursement est une ligne en base et non un souvenir. Reste que le remboursement le moins cher est celui qu'on n'a jamais eu à faire.

## Un règlement asynchrone rend la réconciliation obligatoire

Notre processeur tourne dans deux modes, choisis au démarrage selon l'environnement :

- **Développement** : règlement synchrone. Une instruction acceptée passe directement à `completed`, parce qu'aucun callback ne sait joindre une machine de développement.
- **Production** : règlement asynchrone. Une instruction acceptée passe à `processing`, et seul le callback la fait basculer vers `completed` ou `failed`.

L'opérateur expose aussi une requête d'état. C'est elle qui transforme un callback perdu en callback récupérable.

<svg class="schematic" viewBox="0 0 1000 300" role="img" aria-label="Chemin de règlement asynchrone">
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
    <text x="85" y="68" text-anchor="middle">acheteur</text>
    <text x="85" y="228" text-anchor="middle">téléphone</text>
    <text x="505" y="68" text-anchor="middle">service paiement</text>
    <text x="505" y="228" text-anchor="middle">tables de journal</text>
    <text x="910" y="148" text-anchor="middle">opérateur mobile money</text>
    <g stroke="currentColor" stroke-width="1.6" fill="none" marker-end="url(#a1)">
      <path d="M160 63 H415"/>
      <path d="M590 55 C 700 55, 740 120, 826 134"/>
      <path d="M505 90 V 196"/>
      <path d="M160 223 C 300 223, 700 223, 826 158"/>
    </g>
    <path d="M826 152 C 700 168, 640 96, 592 80" fill="none" stroke="currentColor"
          stroke-width="1.6" stroke-dasharray="6 5" marker-end="url(#a1)" opacity="0.7"/>
    <g font-size="12" opacity="0.75">
      <text x="288" y="52" text-anchor="middle">valider + idempotency_id</text>
      <text x="712" y="76" text-anchor="middle">instruction C2B</text>
      <text x="520" y="150">journal : requête, latence, code</text>
      <text x="470" y="248" text-anchor="middle">validation sur le téléphone</text>
      <text x="700" y="128" text-anchor="middle">callback · id de corrélation</text>
    </g>
  </g>
</svg>
<p class="schematic-caption">L'arête en pointillés est celle qui peut se perdre. Tout ce qui vient après relève de la réconciliation.</p>

Ce callback est une livraison, et une livraison échoue. La question qu'une plateforme de paiement doit trancher n'est donc pas « est-ce que le webhook marche », mais **« combien de temps un paiement reste bloqué en `processing` quand il ne marche pas ? »**

D'où une règle : l'identifiant de corrélation est généré et stocké **avant** l'envoi de l'instruction, jamais déduit de la réponse de l'opérateur. Un paiement qu'on ne sait pas nommer est un paiement qu'on ne sait pas réconcilier.

## Ce que ça change, concrètement

- **Un acheteur sans carte peut aller au bout de son achat** : c'est le marché adressable entier, pas une tranche.

- **Un acheteur qui valide deux fois n'est débité qu'une fois** : par construction, pas par vigilance.

- **Un callback qui n'arrive jamais devient un délai, pas une perte** : la comptabilité est réconciliée avec l'opérateur, elle n'est pas déduite de lui.

- **Chaque instruction, latence, code de réponse et payload brut est sur disque** : un paiement contesté se tranche par une requête SQL, pas par une hypothèse.

Rien d'exotique dans tout cela. C'est la discipline ordinaire d'un système de paiement, appliquée à un opérateur qui ne la fournissait pas prête à l'emploi.

## Le back-office, là où les opérateurs gardent la main sur l'argent

En coulisses, le back-office donne à l'entreprise une vue et un contrôle complets sur les paiements :

- **Suivi en temps réel** des états de paiement, avec des filtres sur les transactions en attente, en cours, terminées et échouées
- **Réconciliation manuelle** pour rapprocher un paiement d'une commande quand un callback s'est perdu
- **Déclenchement d'un reversement** pour les remboursements, avec un journal d'audit qui relie le reversement au paiement d'origine
- **Journaux de webhooks** listant chaque callback reçu, payload brut et temps de réponse compris
- **Rapports de règlement** indiquant quels paiements ont effectivement été confirmés par l'opérateur Mobile Money

Le composant `CatalogManagement.tsx` du back-office porte le workflow de publication du catalogue, façon gestionnaire de versions. Les tableaux de bord de paiement appliquent la même discipline au mouvement d'argent : chaque changement d'état est journalisé, chaque action est auditable, chaque écart laisse une trace.

## La suite

Le processeur garantit que l'argent bouge correctement. Il ne règle pas l'autre moitié du problème : servir vite un catalogue, depuis l'autre bout du monde, à des téléphones dont chaque mégaoctet de données coûte cher.

La [**partie 2 — Edge e-commerce: Le catalogue est un artefact de build**](https://computeflux.xyz/studies/edge-serving-layer) traite de la couche de desserte : un pipeline d'images qui va du stockage objet à un bucket CDN en passant par libvips, et un catalogue *publié* vers l'edge sous forme d'instantané versionné et adressé par hash de contenu, plutôt que synchronisé ligne à ligne.

---

<div class="small muted">Les chiffres présentés comme modélisés sont produits par les curseurs de cette page : ils décrivent la forme d'un problème, pas le trafic de ce client. Les comportements présentés comme lus dans le code ont été vérifiés à la source. Le client, la plateforme et ses domaines sont volontairement passés sous silence.</div>

<style>
/* Libellés français des encarts de provenance définis dans studies/_shared. */
:root { --cb-verified: "Lu dans le code livré"; --cb-modelled: "Un modèle, pas une mesure"; --cb-proposed: "Proposé, pas déployé"; }
.hero { text-align: center; margin: 2rem 0 2rem; }
.hero h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.02; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #2f6bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.3rem); font-weight: 400; max-width: 42rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.card .big { display: block; font-size: 2rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.card .muted, .muted { color: var(--theme-foreground-muted); }
.card h2 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin: 0 0 0.35rem; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
</style>
